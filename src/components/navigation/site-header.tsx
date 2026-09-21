'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { NavLink } from '@/components/ui/nav-link';

const destinations = [
  { href: '/watch', label: 'The watch' },
  { href: '/story', label: 'Our story' },
  { href: '/cart', label: 'Cart' },
];

function NavigationLinks({ pathname }: { pathname: string }) {
  return destinations.map(({ href, label }) =>
    <NavLink key={href} href={href} current={pathname === href}>{label}</NavLink>
  );
}

function MobileNavigation({ pathname }: { pathname: string }) {
  const disclosure = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const menu = disclosure.current;
    if (!menu) return;
    const desktop = window.matchMedia('(min-width: 48rem)');
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary')?.focus();
      }
    };
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
    };
    const closeOnDesktop = () => {
      if (desktop.matches) {
        const focusWasInside = menu.contains(document.activeElement);
        menu.open = false;
        if (focusWasInside) document.querySelector<HTMLAnchorElement>('.site-brand')?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutsideClick);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, []);

  return <details
    ref={disclosure}
    className="mobile-navigation"
    onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
    }}
  >
    <summary aria-controls="mobile-primary-navigation">
      <span>Menu</span><span className="menu-symbol" aria-hidden="true" />
    </summary>
    <nav
      id="mobile-primary-navigation"
      aria-label="Mobile primary"
      onClick={event => {
        if (event.target instanceof Element && event.target.closest('a') && disclosure.current) {
          disclosure.current.open = false;
        }
      }}
    >
      <NavigationLinks pathname={pathname} />
    </nav>
  </details>;
}

export function SiteHeader() {
  const pathname = usePathname();
  return <header className="site-header">
    <div className="container site-header__inner">
      <Link href="/" className="site-brand" aria-label="Watch home" aria-current={pathname === '/' ? 'page' : undefined}>
        <svg aria-hidden="true" focusable="false" viewBox="0 0 32 32" width="28" height="28">
          <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 8v8l5 3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>Watch</span>
      </Link>
      <nav className="desktop-navigation" aria-label="Primary">
        <NavigationLinks pathname={pathname} />
      </nav>
      <MobileNavigation key={pathname} pathname={pathname} />
    </div>
  </header>;
}
