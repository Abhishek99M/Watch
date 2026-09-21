import Link from 'next/link';
import type { ComponentProps } from 'react';
export function NavLink({ current = false, className = '', ...props }: ComponentProps<typeof Link> & { current?: boolean }) {
  return <Link {...props} aria-current={current ? 'page' : undefined} className={`nav-link ${className}`} />;
}
