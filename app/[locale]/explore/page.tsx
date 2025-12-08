import { getAllAvailableVisas } from '@/lib/visaDataFetcher';
import ExploreClient from '@/components/ExploreClient';

export const metadata = {
    title: 'Explore Countries | VisaGuide',
    description: 'Browse visa requirements for over 80 countries.',
};

export default async function ExplorePage() {
    const allVisas = await getAllAvailableVisas();

    return <ExploreClient allVisas={allVisas} />;
}
