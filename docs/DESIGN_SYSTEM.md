# Design system

Phase 2 provides shared tokens and UI primitives. Review them at /design-system; this reference route has noindex metadata and is not linked from the customer homepage. Its product names, labels and feedback scenarios are explicitly illustrative.

## Visual language

Warm charcoal surfaces, ivory text and a restrained brass accent support the editorial, engineering-focused direction. Georgia is the heading font; Arial/Helvetica is the body stack. System fonts avoid font downloads and late font swaps. No new runtime dependency, external image or animation library is introduced.

Tokens in src/app/globals.css define:
- Semantic canvas/surface/raised backgrounds, primary/muted text, accent, error and border colors.
- Fluid display, section and lead type sizes with a 16px body and a 14px small-text style.
- A 4px-based spacing scale, fluid section spacing and page gutters, and a 76rem content width.
- A small corner radius, 48px minimum control targets and a 160ms interaction duration.

Use semantic tokens when extending styles rather than duplicating palette values. The Tailwind background/foreground and font aliases reference the same tokens. Text token combinations are tested at 7:1 or higher on all three supported dark surfaces; this is not a claim that the entire application meets every WCAG criterion. Subtle rules are decorative; interactive secondary borders use the stronger border token.

## Components

| Component | Use |
| --- | --- |
| Button | Native action button; primary, secondary or quiet. Defaults to type=button. Pass type=submit deliberately for forms. busy disables activation and sets aria-busy; supply meaningful loading text. |
| ButtonLink | Real Next.js navigation link with button styling. Use for destinations, never for an action handler. |
| NavLink | 48px navigation primitive with current-page styling and aria-current. Full navigation/menu behavior belongs to Phase 3. |
| SectionHeading | Eyebrow, heading and optional description. Choose level=1 only for the page heading; otherwise use levels 2 or 3. |
| Badge | Short neutral/accent status labels. Always communicate status in text, not color alone. |
| ProductCard | Informational title, description and optional label, media and destination. A 4:3 media region reserves space; no price/specification is fabricated. |
| LoadingState | Polite loading status with a decorative skeleton; consumers must implement timeout/error/retry behavior for actual asynchronous work. |
| ErrorState | Safe alert text and optional action slot. Pass a Button for retry; never put raw exception details in the message. |

Components are under src/components/ui. Keep interaction state in client consumers; the reference interaction preview is a client component, while the page and other static content stay server-rendered.

ProductCard media is a ReactNode slot so later approved images or fallback visuals can be supplied. Images need descriptive alt text, intrinsic dimensions and suitable loading behavior. The default is a visible placeholder. Pass an actionLabel that identifies the destination when multiple cards appear together.

## Responsive and accessible behavior

Controls wrap, cards stack below 42rem, type and page gutters scale fluidly, and media reserves a stable aspect ratio. Avoid fixed content heights. The preview and homepage are checked at 320, 375, 390, 768, 1024, 1440 and 1920px.

The skip link and visible focus styles remain available. Busy/disabled controls use native disabled behavior. Reduced motion disables all transitions and skeleton animation. No navigation, scrolling or pointer behavior is intercepted.

## Scope

Homepage and not-found content now consume the system. The reference page demonstrates working buttons, a simulated retry/reset flow and real anchor navigation. It is not a production product catalogue.

Full navigation, menu focus/Escape handling, 3D scenes, model loading, configuration and commerce remain later phases. Physical-device, screen-reader and non-Chromium audits remain pending.
