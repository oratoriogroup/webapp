'use client';

import { useEffect, useMemo, useState } from 'react';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, AsYouType, type CountryCode } from 'libphonenumber-js/min';

const flag = (cc: string) => cc.toUpperCase().replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));

// WhatsApp number with the country code detected from where the visitor is
// (falls back to Nigeria). The code is shown read only; "Change" lets
// someone abroad with a different number pick another country.
export default function PhoneField({
  id,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const parsed = value ? parsePhoneNumberFromString(value) : undefined;
  const [country, setCountry] = useState<CountryCode>((parsed?.country as CountryCode) || 'NG');
  const [national, setNational] = useState<string>(parsed?.nationalNumber ? String(parsed.nationalNumber) : '');
  const [picking, setPicking] = useState(false);
  const [detected, setDetected] = useState(!!parsed);

  // Detect the visitor's country once, unless a saved number already set it.
  useEffect(() => {
    if (detected) return;
    fetch('/api/geo')
      .then((r) => r.json())
      .then((d: { country: string | null }) => {
        if (d.country && (getCountries() as string[]).includes(d.country)) setCountry(d.country as CountryCode);
      })
      .catch(() => {})
      .finally(() => setDetected(true));
  }, [detected]);

  // Keep the stored value in international format (+2348012345678).
  useEffect(() => {
    const digits = national.replace(/\D/g, '');
    if (!digits) return onChange('');
    const p = parsePhoneNumberFromString(digits, country);
    onChange(p ? p.number : `+${getCountryCallingCode(country)}${digits.replace(/^0+/, '')}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [national, country]);

  const names = useMemo(() => {
    let dn: Intl.DisplayNames | null = null;
    try {
      dn = new Intl.DisplayNames(['en'], { type: 'region' });
    } catch {}
    return getCountries()
      .map((c) => ({ c, name: dn?.of(c) || c }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const code = getCountryCallingCode(country);
  const display = new AsYouType(country).input(national);

  return (
    <div className="mt-2">
      <div className={`flex overflow-hidden rounded-xl border bg-surface-2/60 transition-all focus-within:border-brand focus-within:bg-surface focus-within:ring-2 focus-within:ring-(--ring) ${invalid ? 'border-brand-red' : 'border-line'}`}>
        <span className="flex shrink-0 items-center gap-2 border-r border-line bg-surface-2 px-3 text-[15px] font-semibold select-none" aria-label={`Country code +${code}`}>
          <span aria-hidden className="text-lg leading-none">{flag(country)}</span>+{code}
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={country === 'NG' ? '801 234 5678' : 'Phone number'}
          value={display}
          onChange={(e) => setNational(e.target.value.replace(/[^\d]/g, '').slice(0, 15))}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="min-h-12 w-full min-w-0 bg-transparent px-4 text-base text-text outline-none"
        />
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
        <span>Country code set automatically.</span>
        <button type="button" onClick={() => setPicking((p) => !p)} className="font-semibold text-brand underline-offset-2 hover:underline">
          {picking ? 'Done' : 'Change'}
        </button>
      </div>
      {picking && (
        <select
          aria-label="Country for your WhatsApp number"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value as CountryCode);
            setPicking(false);
          }}
          className="field mt-2"
        >
          {names.map(({ c, name }) => (
            <option key={c} value={c}>
              {flag(c)} {name} (+{getCountryCallingCode(c)})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
