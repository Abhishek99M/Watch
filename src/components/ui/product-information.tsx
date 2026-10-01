import Image from 'next/image';
import { AddToDemoCart } from '@/features/cart/add-to-demo-cart';
import { productInformation } from '@/data/product-information';

/** Editorial content stays available independently of JavaScript and the scene. */
export function ProductInformation() {
  return <section id="product-information" className="product-information" aria-labelledby="product-information-heading">
    <header className="product-information__heading">
      <p className="eyebrow">The design at a glance</p>
      <h2 id="product-information-heading">Aurel Veil.</h2>
      <p className="text-muted">A digital watch study in contrast, proportion and light.</p>
    </header>
    <div className="product-information__grid">
      <figure className="product-information__portrait">
        <Image src="/images/aurel-veil.jpg" alt="Original Charcoal design study with champagne-toned hands and a silver-toned linked bracelet" width={1800} height={1350} unoptimized />
        <figcaption>Original Charcoal appearance. This studio image stays unchanged when you explore colour studies in 3D.</figcaption>
      </figure>
      <div className="product-information__profile">
        <p className="eyebrow">Design profile / original appearance</p>
        <dl>
          {productInformation.map(item => <div key={item.label}>
            <dt>{item.label}</dt><dd>{item.description}</dd>
          </div>)}
        </dl>
        <p className="product-information__note">These details describe the digital design, not physical product specifications.</p>
      </div>
    </div>
    <AddToDemoCart />
    <div className="product-information__questions">
      <details>
        <summary>About the colour studies</summary>
        <p>Charcoal is the original appearance. Midnight blue and Forest green are illustrative dial colour studies in the 3D preview, not available physical variants. Your preview choice does not change this original-design profile.</p>
      </details>
      <details>
        <summary>Physical specifications & availability</summary>
        <p>Materials, dimensions, movement specifications, water resistance and warranty have not been confirmed. Price and availability are also unconfirmed. This presentation is a digital design study.</p>
      </details>
    </div>
  </section>;
}
