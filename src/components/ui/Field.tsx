import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-ink-3 ' +
  'transition-[border-color,box-shadow] duration-200 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ' +
  'aria-[invalid=true]:border-rose-400';

const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-2';

type BaseProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  hint?: string;
};

type FieldProps = BaseProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'required'>;

/** A text input with a properly linked label, hint and error message. */
export function Field({ label, value, onChange, required, error, hint, type = 'text', ...rest }: FieldProps) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClass}
        {...rest}
      />
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-ink-3">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

type PasswordFieldProps = Omit<FieldProps, 'type'>;

/** A password input with an accessible show/hide toggle. */
export function PasswordField({ label, value, onChange, required, error, hint, ...rest }: PasswordFieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} pr-12`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-3 transition-colors hover:text-ink"
        >
          {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-ink-3">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
};

/** A select with a properly linked label. */
export function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)} className={`${inputClass} capitalize`}>
        {children}
      </select>
    </div>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
};

/** A textarea with a properly linked label. */
export function TextAreaField({ label, value, onChange, placeholder, rows = 3, maxLength }: TextAreaFieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`${inputClass} resize-none`}
      />
    </div>
  );
}
