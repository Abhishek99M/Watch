import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'quiet';
type ButtonProps = ComponentProps<'button'> & { variant?: Variant; busy?: boolean };
export function Button({ variant = 'primary', busy = false, disabled, className = '', children, type = 'button', ...props }: ButtonProps) {
  return <button {...props} type={type} disabled={disabled || busy} aria-busy={busy || undefined} className={`button button--${variant} ${className}`}>{children}</button>;
}
type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode };
export function ButtonLink({ variant = 'primary', className = '', ...props }: ButtonLinkProps) {
  return <Link {...props} className={`button button--${variant} ${className}`} />;
}
