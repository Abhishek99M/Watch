import { craftsmanshipDetails, craftsmanshipViews } from '@/data/craftsmanship';

/** Always present, including no-JavaScript, static and failed-WebGL views. */
export function CraftsmanshipStory() {
  return <section className="craftsmanship-story" aria-labelledby="craftsmanship-heading">
    <p className="eyebrow">Materials & craftsmanship</p>
    <h2 id="craftsmanship-heading">Character in the details.</h2>
    <p className="text-muted">A study of the visible finishes in Aurel Veil. These descriptions refer to the digital design; physical materials and manufacturing specifications are not yet confirmed.</p>
    <div className="craftsmanship-grid">
      {craftsmanshipViews.map((view, index) => <article key={view}>
        <p className="eyebrow">0{index + 1} / {craftsmanshipDetails[view].label}</p>
        <h3>{craftsmanshipDetails[view].title}</h3>
        <p>{craftsmanshipDetails[view].description}</p>
      </article>)}
    </div>
  </section>;
}
