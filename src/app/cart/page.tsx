import type { Metadata } from 'next';
import { DestinationPage } from '@/components/navigation/destination-page';
export const metadata: Metadata = { title: 'Cart | Watch', robots: { index: false, follow: false } };
export default function CartPage() {
  return <DestinationPage eyebrow="Cart" title="Shopping is coming soon." description="Online ordering is not available yet. When the collection is ready, you will be able to review your selections here." />;
}
