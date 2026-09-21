# Navigation

Phase 3 adds a shared sticky header on every route. The Watch wordmark links home. Primary destinations are The watch (/watch), Our story (/story), and Cart (/cart). The current destination is marked with aria-current=page.

## Scope and destinations

The three destination pages are deliberately simple navigation shells with descriptive headings and return-home links. Watch and story content is forthcoming; Cart states that online ordering is not yet available. There are no invented specifications, prices, inventory, cart quantities or checkout controls. Product storytelling and cart functionality stay in their planned phases.

The design-system reference remains outside the primary navigation. Its independent style examples are unchanged.

## Mobile interaction

Below 48rem, a native details/summary disclosure replaces the desktop links. It retains a usable expand/collapse control and real links without JavaScript. Native disclosure semantics expose its expanded state. It is nonmodal: Tab follows the normal document order; background content stays available and focus is not trapped.

With JavaScript:
- Enter/Space on Menu uses native disclosure behavior.
- Escape closes an open menu and returns focus to its summary.
- Selecting any link, including the current destination, closes the menu.
- Moving focus outside the disclosure or clicking outside closes it.
- Route changes (including browser history) recreate the disclosure closed.
- Crossing to the desktop breakpoint closes it; keyboard focus inside the hidden disclosure moves to the wordmark.
- Event listeners are removed when the disclosure unmounts.

Without JavaScript, toggling and full-page link navigation remain available; Escape/outside-click dismissal is a progressive enhancement. The Menu control itself can always collapse the disclosure.

## Layout and accessibility

Desktop and mobile share the same link data and NavLink primitive. Every visible header control has a 48px minimum target. Header surfaces and focus styles use Phase 2 tokens. Menu links remain in a nav landmark rather than adopting application-menu roles.

The sticky header has a reserved height and an opaque background. The skip link sits above it, and scroll margins keep destination anchors clear. No animation is required; reduced-motion styles remain effective. Mobile menu width stays within page gutters at 320px.

## Implementation

- src/components/navigation/site-header.tsx: small client component for pathname-aware links and disclosure enhancements.
- src/components/navigation/destination-page.tsx: shared server-rendered destination shell.
- src/app/layout.tsx: mounts the header after the skip link.
- src/app/watch, story and cart: real route destinations.
- tests/navigation.spec.ts: desktop links, route refresh, keyboard/Escape/focus, touch/history, no-JavaScript fallback, responsive targets and sticky-header checks.

Physical mobile devices, screen readers and Safari/Firefox remain part of the later cross-browser QA phase. Chromium automation does not certify those environments.
