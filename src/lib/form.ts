// Registration form model, mirrored from the Oratorio 2026 Google Form so every
// answer can also be forwarded to that form's response sheet. Shared by the
// browser (rendering, step navigation) and the server (validation).
import raw from '@/data/registration-form.json';

export type Question = {
  entry: string;
  title: string;
  help: string;
  type: 'short' | 'paragraph' | 'radio' | 'select' | 'checkbox';
  required: boolean;
  options: string[];
  other: boolean;
};
export type Section = { id: number; title: string; description: string; questions: Question[] };
export type Answers = Record<string, string | string[]>;

export const SECTIONS = raw as unknown as Section[];

export const OTHER = '__other_option__';
export const otherKey = (entry: string) => `${entry}.other`;

export const ENTRY = {
  fullName: '1069376608',
  whatsapp: '1012986608',
  email: '145214826',
  age: '978939934',
  location: '731789512',
  church: '224909602',
  connect: '57744516',
  partySize: '296745361',
  volunteerKind: '494145471',
} as const;

// Section indexes in SECTIONS.
const S = { details: 0, attend: 1, online: 2, partner: 3, volunteer: 4, singers: 5, concert: 6, prayer: 7, onlineVol: 8, planning: 9, almost: 10 };

export type ConnectType = 'attend' | 'online' | 'volunteer' | 'partner';

const connectQ = SECTIONS[S.details]!.questions.find((q) => q.entry === ENTRY.connect)!;
const volunteerQ = SECTIONS[S.volunteer]!.questions.find((q) => q.entry === ENTRY.volunteerKind)!;

export const connectTypeOf = (answers: Answers): ConnectType | null => {
  const i = connectQ.options.indexOf(String(answers[ENTRY.connect] ?? ''));
  return (['attend', 'online', 'volunteer', 'partner'] as const)[i] ?? null;
};

// The page sequence a person walks through, based on their answers so far.
// Attendees stop after "Attending in Lagos" and performers go straight to
// "Almost done", which is what those sections are for.
export const pathFor = (answers: Answers): number[] => {
  const path = [S.details];
  const c = connectTypeOf(answers);
  if (c === 'attend') path.push(S.attend);
  else if (c === 'online') path.push(S.online);
  else if (c === 'partner') path.push(S.partner);
  else if (c === 'volunteer') {
    path.push(S.volunteer);
    const k = volunteerQ.options.indexOf(String(answers[ENTRY.volunteerKind] ?? ''));
    const next = [S.singers, S.concert, S.prayer, S.onlineVol, S.planning][k];
    if (next !== undefined) path.push(next, S.almost);
  }
  return path;
};

// Display label for an option. Values are kept byte for byte so they match the
// Google Form; only the visible text is tidied (no en dashes on screen).
export const optionLabel = (o: string) =>
  o.replace(/(\d)\s*–\s*(\d)/g, '$1 to $2').replace(/\s+–\s+/g, ', ').replace(/–/g, '-');

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[A-Za-z]{2,24}$/;
const PHONE_RE = /^\+?[0-9\s()-]{7,20}$/;

const MAX_SHORT = 200;
const MAX_LONG = 2000;

// Removes tags, control and zero-width characters from typed answers.
const stripText = (s: string, max: number) =>
  s
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028\u2029\uFEFF]/g, '')
    .trim()
    .slice(0, max);

const isEmpty = (v: unknown) => (Array.isArray(v) ? v.length === 0 : !String(v ?? '').trim());

export const validateSection = (sectionIndex: number, answers: Answers): Record<string, string> => {
  const errors: Record<string, string> = {};
  const section = SECTIONS[sectionIndex];
  if (!section) return errors;
  for (const q of section.questions) {
    const v = answers[q.entry];
    if (q.required && isEmpty(v)) {
      errors[q.entry] = 'This field is required.';
      continue;
    }
    if (isEmpty(v)) continue;
    if (q.type === 'short' || q.type === 'paragraph') {
      const s = String(v);
      if (s.length > (q.type === 'short' ? MAX_SHORT : MAX_LONG)) errors[q.entry] = 'This answer is too long.';
      else if (q.entry === ENTRY.email && !EMAIL_RE.test(s.trim())) errors[q.entry] = 'Enter a valid email address.';
      else if (q.entry === ENTRY.whatsapp && !PHONE_RE.test(s.trim())) errors[q.entry] = 'Enter a valid phone number, e.g. +2348012345678.';
    } else {
      const picked = Array.isArray(v) ? v : [String(v)];
      if (q.type !== 'checkbox' && picked.length > 1) errors[q.entry] = 'Choose one option.';
      for (const p of picked) {
        if (p === OTHER && q.other) {
          const o = String(answers[otherKey(q.entry)] ?? '').trim();
          if (!o) errors[q.entry] = 'Please describe your "Other" answer.';
          else if (o.length > MAX_SHORT) errors[q.entry] = 'This answer is too long.';
        } else if (!q.options.includes(p)) errors[q.entry] = 'Choose one of the listed options.';
      }
    }
  }
  return errors;
};

// Server-side: validate the whole path and return only the answers that belong
// to it, so nothing unexpected is ever stored or forwarded.
export const validateAll = (input: Answers) => {
  const path = pathFor(input);
  const errors: Record<string, string> = {};
  const clean: Answers = {};
  for (const i of path) {
    Object.assign(errors, validateSection(i, input));
    for (const q of SECTIONS[i]!.questions) {
      const v = input[q.entry];
      if (isEmpty(v)) continue;
      clean[q.entry] = Array.isArray(v) ? v.map((x) => String(x)) : stripText(String(v), q.type === 'paragraph' ? MAX_LONG : MAX_SHORT);
      const ok = otherKey(q.entry);
      if (q.other && input[ok]) clean[ok] = stripText(String(input[ok]), MAX_SHORT);
    }
  }
  const complete = connectTypeOf(input) !== null && (connectTypeOf(input) !== 'volunteer' || path.length === 4);
  if (!complete && !errors[ENTRY.connect]) errors[ENTRY.volunteerKind] = 'Please complete the form.';
  return { path, errors, clean };
};

// Human readable Q&A list (admin detail view, emails).
export const describe = (answers: Answers) => {
  const out: { section: string; question: string; answer: string }[] = [];
  for (const i of pathFor(answers)) {
    const s = SECTIONS[i]!;
    for (const q of s.questions) {
      const v = answers[q.entry];
      if (isEmpty(v)) continue;
      const vals = (Array.isArray(v) ? v : [String(v)]).map((x) =>
        x === OTHER ? `Other: ${answers[otherKey(q.entry)] ?? ''}` : optionLabel(x),
      );
      out.push({ section: s.title, question: q.title, answer: vals.join('; ') });
    }
  }
  return out;
};
