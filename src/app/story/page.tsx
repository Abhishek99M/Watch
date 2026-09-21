import type { Metadata } from 'next';
import { DestinationPage } from '@/components/navigation/destination-page';
export const metadata: Metadata = { title: 'Our story | Watch' };
export default function StoryPage() {
  return <DestinationPage eyebrow="Our story" title="Every detail has a story." description="An exploration of watchmaking, detail and considered design. The full story will be shared here soon." />;
}
