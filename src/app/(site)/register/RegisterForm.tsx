'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, Bookmark, Copy, Mail, X, RotateCcw } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons';
import PhoneField from '@/components/PhoneField';
import { SITE_URL } from '@/lib/event';
import { SECTIONS, OTHER, otherKey, optionLabel, pathFor, validateSection, ENTRY, type Answers, type Question } from '@/lib/form';

const DRAFT_KEY = 'oratorio-reg-draft';
// Resume token for "save and continue later", kept on this device only.
const RESUME_KEY = 'oratorio-reg-resume';
const resumeUrl = (t: string) => `${SITE_URL}/register?resume=${t}`;

export default function RegisterForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const startedAt = useRef(Date.now());
  const hpRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [offer, setOffer] = useState<string | null>(null); // saved draft found on this device
  const [resumeMsg, setResumeMsg] = useState('');

  const loadDraft = async (t: string) => {
    try {
      const r = await fetch(`/api/register/draft?token=${encodeURIComponent(t)}`, { cache: 'no-store' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) {
        setResumeMsg(d.error || 'We could not open that saved registration.');
        try { localStorage.removeItem(RESUME_KEY); } catch {}
        return;
      }
      const restored: Answers = d.answers || {};
      setAnswers(restored);
      // Land on the furthest step that the saved answers actually reach.
      setStep(Math.max(0, Math.min(Number(d.step) || 0, pathFor(restored).length - 1)));
      setToken(t);
      try { localStorage.setItem(RESUME_KEY, t); } catch {}
      setResumeMsg('Welcome back. Your saved answers are filled in, continue from here.');
    } catch {
      setResumeMsg('Network error while opening your saved registration.');
    }
  };

  // On load: a resume link wins; otherwise offer a draft saved on this device;
  // otherwise restore the unsent answers of this tab.
  useEffect(() => {
    const url = new URL(window.location.href);
    const fromLink = url.searchParams.get('resume');
    if (fromLink) {
      // Remove the token from the address bar so it is not shared by accident.
      url.searchParams.delete('resume');
      window.history.replaceState(null, '', url.pathname + url.search);
      void loadDraft(fromLink);
      return;
    }
    try {
      const saved = localStorage.getItem(RESUME_KEY);
      if (saved) setOffer(saved);
      const d = sessionStorage.getItem(DRAFT_KEY);
      if (d) setAnswers(JSON.parse(d));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveForLater = async () => {
    setSaving(true);
    setFormError('');
    try {
      const r = await fetch('/api/register/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, answers, step }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) return setFormError(d.error || 'Could not save. Please try again.');
      setToken(d.token);
      try { localStorage.setItem(RESUME_KEY, d.token); } catch {}
      setOffer(null);
      setSavedOpen(true);
    } catch {
      setFormError('Network error. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(resumeUrl(token));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
    } catch {}
  }, [answers]);

  const path = useMemo(() => pathFor(answers), [answers]);
  // If an earlier answer changes the route, never point past the last step.
  useEffect(() => {
    if (step > path.length - 1) setStep(path.length - 1);
  }, [path.length, step]);
  // The path can only be extended once the branching question is answered.
  const isVolunteer = path[1] === 4;
  const isLast = step === path.length - 1 && (path.length > 1 ? !isVolunteer || path.length === 4 : false);
  const section = SECTIONS[path[step] ?? 0]!;
  const totalSteps = isVolunteer ? 4 : 2;

  const set = (entry: string, value: string | string[]) => {
    setAnswers((a) => ({ ...a, [entry]: value }));
    setErrors((e) => {
      if (!e[entry]) return e;
      const n = { ...e };
      delete n[entry];
      return n;
    });
  };

  // Scroll after the new step has rendered, so the target position is final.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = topRef.current;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  }, [step]);

  const next = async () => {
    const errs = validateSection(path[step]!, answers);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`q-${Object.keys(errs)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    await submit();
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = async () => {
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, hp: hpRef.current?.value || '', t: startedAt.current, draftToken: token || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data.fields) {
          setErrors(data.fields);
          // Jump back to the first step that has an error.
          const firstBad = path.findIndex((i) => SECTIONS[i]!.questions.some((q) => data.fields[q.entry]));
          if (firstBad >= 0) setStep(firstBad);
        }
        setFormError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      try {
        sessionStorage.setItem('oratorio-reg-done', JSON.stringify({ ref: data.ref, name: data.name, email: data.email, connect: data.connect, pass: data.pass, emailed: data.emailed }));
        sessionStorage.removeItem(DRAFT_KEY);
        localStorage.removeItem(RESUME_KEY);
      } catch {}
      router.push('/register/success');
    } catch {
      setFormError('Network error. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={topRef} className="glass-card scroll-mt-24 overflow-hidden">
      {offer && !token && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand/20 bg-brand-soft px-6 py-4 sm:px-10">
          <p className="text-sm font-semibold text-text">You have a saved registration on this device.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => { const t = offer; setOffer(null); void loadDraft(t); }} className="btn-brand min-h-11 !py-2">Continue where I left off</button>
            <button type="button" onClick={() => { setOffer(null); try { localStorage.removeItem(RESUME_KEY); } catch {} }} className="btn-outline min-h-11 !py-2"><RotateCcw className="size-4" /> Start afresh</button>
          </div>
        </div>
      )}
      {resumeMsg && (
        <div role="status" className="flex items-start justify-between gap-3 border-b border-line bg-surface-2/70 px-6 py-3 text-sm sm:px-10">
          <span>{resumeMsg}</span>
          <button type="button" onClick={() => setResumeMsg('')} aria-label="Dismiss" className="text-muted"><X className="size-4" /></button>
        </div>
      )}
      {savedOpen && token && (
        <div className="border-b border-line bg-gradient-to-br from-brand-soft to-surface px-6 py-5 sm:px-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Saved. You can continue any time before registration closes.</p>
              <p className="mt-1 text-sm text-muted">On this device it opens automatically. To continue on another phone or computer, keep this private link:</p>
            </div>
            <button type="button" onClick={() => setSavedOpen(false)} aria-label="Close" className="text-muted"><X className="size-5" /></button>
          </div>
          <div className="mt-3 flex gap-2 rounded-xl border border-line bg-surface p-1.5">
            <input readOnly value={resumeUrl(token)} aria-label="Your resume link" onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 bg-transparent px-2 text-base outline-none" />
            <button type="button" onClick={copyLink} className="btn-primary min-h-10 !py-2">{copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? 'Copied' : 'Copy'}</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(`My Oratorio 2026 registration, continue here: ${resumeUrl(token)}`)}`} target="_blank" rel="noopener noreferrer" className="btn min-h-11 bg-[#15803d] !py-2 text-white hover:bg-[#166534]"><WhatsAppIcon className="size-4" /> Send to my WhatsApp</a>
            <a href={`mailto:${typeof answers[ENTRY.email] === 'string' ? encodeURIComponent(String(answers[ENTRY.email])) : ''}?subject=${encodeURIComponent('Continue my Oratorio 2026 registration')}&body=${encodeURIComponent(`Continue your registration here: ${resumeUrl(token)}`)}`} className="btn-outline min-h-11 !py-2"><Mail className="size-4" /> Email it to me</a>
          </div>
          <p className="mt-2 text-xs text-muted">Keep this link private. Anyone with it can see and finish this registration.</p>
        </div>
      )}
      <div className="border-b border-line px-6 py-5 sm:px-10">
        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted uppercase">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{section.title}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-gradient-to-r from-[#DC2626] to-[#991B1B] shadow-[0_0_14px_rgba(220,38,38,0.55)] transition-all duration-300" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
        </div>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void next();
        }}
        className="px-6 py-6 sm:px-10 sm:py-10"
      >
        <h2 className="h-display text-3xl">{section.title}</h2>
        {section.description && <p className="mt-2 whitespace-pre-line text-[15px] text-muted">{section.description}</p>}

        {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Leave this empty
            <input ref={hpRef} type="text" name="company_website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="mt-8 space-y-7">
          {section.questions.map((q) => (
            <Field key={q.entry} q={q} answers={answers} error={errors[q.entry]} onChange={set} />
          ))}
        </div>

        {formError && (
          <p role="alert" className="mt-6 rounded-xl border border-brand-red/30 bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
            {formError}
          </p>
        )}

        {/* Phones: full-width stack, main action first (Continue, then Save for
            later, then Back). Larger screens: Back left, the rest right. */}
        <div data-no-float className="mt-8 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          {step > 0 ? (
            <button type="button" onClick={back} className="btn-outline order-3 min-h-12 w-full sm:order-none sm:w-auto" disabled={submitting}>
              <ArrowLeft className="size-4" /> Back
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}
          <div className="contents sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
          <button type="button" onClick={saveForLater} disabled={saving || submitting} className="btn-outline order-2 min-h-12 w-full whitespace-nowrap sm:order-none sm:w-auto">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Bookmark className="size-4" />} <span className="hidden sm:inline">Save and continue later</span><span className="sm:hidden">Save for later</span>
          </button>
          <button type="submit" className="btn-brand order-1 min-h-12 w-full min-w-36 whitespace-nowrap sm:order-none sm:w-auto" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Submitting
              </>
            ) : isLast ? (
              <>
                Complete registration <Check className="size-4" />
              </>
            ) : (
              <>
                Continue <ArrowRight className="size-4" />
              </>
            )}
          </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ q, answers, error, onChange }: { q: Question; answers: Answers; error?: string; onChange: (e: string, v: string | string[]) => void }) {
  const id = `q-${q.entry}`;
  const v = answers[q.entry];
  const describedBy = error ? `${id}-err` : q.help ? `${id}-help` : undefined;
  const label = (
    <span className="block text-[15px] font-semibold">
      {q.title}
      {q.required && <span className="ml-1 text-brand-red" aria-hidden>*</span>}
    </span>
  );

  const inputType = q.entry === ENTRY.email ? 'email' : q.entry === ENTRY.whatsapp ? 'tel' : 'text';
  const autoComplete =
    q.entry === ENTRY.fullName ? 'name' : q.entry === ENTRY.email ? 'email' : q.entry === ENTRY.whatsapp ? 'tel' : q.entry === ENTRY.location ? 'address-level2' : 'off';

  let control: React.ReactNode;
  if (q.entry === ENTRY.whatsapp) {
    control = <PhoneField id={id} value={(v as string) ?? ''} onChange={(val) => onChange(q.entry, val)} invalid={!!error} describedBy={describedBy} />;
  } else if (q.type === 'short') {
    control = (
      <input id={id} type={inputType} inputMode={inputType === 'tel' ? 'tel' : undefined} autoComplete={autoComplete} maxLength={200} value={(v as string) ?? ''} onChange={(e) => onChange(q.entry, e.target.value)} aria-invalid={!!error} aria-describedby={describedBy} className="field mt-2" />
    );
  } else if (q.type === 'paragraph') {
    control = <textarea id={id} rows={4} maxLength={2000} value={(v as string) ?? ''} onChange={(e) => onChange(q.entry, e.target.value)} aria-invalid={!!error} aria-describedby={describedBy} className="field mt-2 resize-y" />;
  } else if (q.type === 'select') {
    control = (
      <select id={id} value={(v as string) ?? ''} onChange={(e) => onChange(q.entry, e.target.value)} aria-invalid={!!error} aria-describedby={describedBy} className="field mt-2 appearance-none">
        <option value="">Select</option>
        {q.options.map((o) => (
          <option key={o} value={o}>{optionLabel(o)}</option>
        ))}
      </select>
    );
  } else {
    const multi = q.type === 'checkbox';
    const picked = multi ? ((v as string[]) ?? []) : v ? [v as string] : [];
    const toggle = (o: string) => {
      if (!multi) return onChange(q.entry, o);
      onChange(q.entry, picked.includes(o) ? picked.filter((x) => x !== o) : [...picked, o]);
    };
    const opts = q.other ? [...q.options, OTHER] : q.options;
    control = (
      <div id={id} role={multi ? 'group' : 'radiogroup'} aria-labelledby={`${id}-label`} aria-describedby={describedBy} className="mt-3 grid gap-2">
        {opts.map((o) => {
          const on = picked.includes(o);
          return (
            <label key={o} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[15px] transition-all duration-200 ${on ? 'border-brand bg-brand-soft shadow-sm' : 'border-line bg-surface-2/60 hover:border-brand/40 hover:bg-surface'}`}>
              <input type={multi ? 'checkbox' : 'radio'} name={id} checked={on} onChange={() => toggle(o)} className="size-5 shrink-0 accent-[var(--brand)]" />
              <span>{o === OTHER ? 'Other' : optionLabel(o)}</span>
            </label>
          );
        })}
        {q.other && picked.includes(OTHER) && (
          <input type="text" aria-label="Other, please specify" placeholder="Please specify" maxLength={200} value={(answers[otherKey(q.entry)] as string) ?? ''} onChange={(e) => onChange(otherKey(q.entry), e.target.value)} className="field" />
        )}
      </div>
    );
  }

  return (
    <div id={id + '-wrap'} className="scroll-mt-28">
      {q.type === 'radio' || q.type === 'checkbox' ? <p id={`${id}-label`}>{label}</p> : <label htmlFor={id}>{label}</label>}
      {q.help && <p id={`${id}-help`} className="mt-1 text-sm text-muted">{q.help}</p>}
      {control}
      {error && (
        <p id={`${id}-err`} className="mt-2 text-sm font-medium text-brand-red">
          {error}
        </p>
      )}
    </div>
  );
}
