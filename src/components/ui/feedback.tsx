import type { ReactNode } from 'react';
export function LoadingState({ label = 'Loading watch details' }: { label?: string }) {
  return <div className="feedback" role="status" aria-live="polite">
    <div className="skeleton" aria-hidden="true" />
    <p>{label}</p>
  </div>;
}
export function ErrorState({ title = 'Something went wrong', children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return <div className="feedback feedback--error" role="alert">
    <p className="feedback__title">{title}</p>
    <div className="text-muted">{children}</div>
    {action}
  </div>;
}
