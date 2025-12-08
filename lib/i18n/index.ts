import { traverseAndExtract, applyTranslations } from './traverse';
import { getCachedTranslations, setCachedTranslations } from './cache';
import { getProvider } from './provider';

/**
 * Main entry point for dynamic data translation.
 * 
 * @param data The JSON object to translate
 * @param locale The target locale (e.g., 'hi', 'gu')
 * @returns The translated JSON object
 */
export async function translateData<T>(data: T, locale: string): Promise<T> {
    // 1. Short-circuit for default locale
    if (locale === 'en') {
        return data;
    }

    try {
        // 2. Traverse and extract strings
        const { strings, map } = traverseAndExtract(data);

        if (strings.length === 0) {
            return data;
        }

        // 3. Check Cache
        const { hits, misses } = await getCachedTranslations(strings, locale);

        // 4. Translate Misses
        if (misses.length > 0) {
            const provider = getProvider();
            const translatedMisses = await provider.translate(misses, locale);

            // Add new translations to hits map and cache them
            misses.forEach((original, index) => {
                const translated = translatedMisses[index];
                hits.set(original, translated);
            });

            // Async cache update (don't await to speed up response)
            setCachedTranslations(new Map(misses.map((m, i) => [m, translatedMisses[i]])), locale);
        }

        // 5. Apply Translations
        return applyTranslations(data, hits);

    } catch (error) {
        console.error('Translation error:', error);
        // Fallback to original data on error
        return data;
    }
}
