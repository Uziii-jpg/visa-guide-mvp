import { MetadataRoute } from 'next';
import { COUNTRY_NAMES } from '@/lib/countryMapping';

const BASE_URL = 'https://visaguide.vercel.app'; // Replace with actual domain

export default function sitemap(): MetadataRoute.Sitemap {
    const routes: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/en/explore`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/en/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // Generate routes for all countries and visa types
    Object.keys(COUNTRY_NAMES).forEach((countryCode) => {
        ['STUDENT', 'TOURIST'].forEach((type) => {
            routes.push({
                url: `${BASE_URL}/en/visa/${countryCode}/${type}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        });
    });

    return routes;
}
