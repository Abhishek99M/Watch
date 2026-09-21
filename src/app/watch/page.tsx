import type { Metadata } from 'next';
import { DestinationPage } from '@/components/navigation/destination-page';
export const metadata: Metadata = { title: 'The watch | Watch' };
export default function WatchPage() {
  return <DestinationPage eyebrow="The watch" title="A closer look, soon." description="Our watch experience is taking shape. Product details and an interactive view will be available here when ready." />;
}
