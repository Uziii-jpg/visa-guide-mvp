import { getAllAvailableVisas } from '@/lib/visaDataFetcher';
import HomeClient from '@/components/HomeClient';

export default async function Home() {
  const allVisas = await getAllAvailableVisas();

  return <HomeClient allVisas={allVisas} />;
}
