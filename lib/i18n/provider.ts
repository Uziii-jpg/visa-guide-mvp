import { translate } from 'google-translate-api-x';

/**
 * Translation Provider Interface
 */
export interface TranslationProvider {
    translate(texts: string[], targetLang: string): Promise<string[]>;
}

/**
 * Real Google Provider using 'google-translate-api-x'
 * Uses the free API endpoint (suitable for MVP/Dev).
 */
export class RealGoogleProvider implements TranslationProvider {
    async translate(texts: string[], targetLang: string): Promise<string[]> {
        try {
            // The API handles arrays, but let's map to be safe and handle errors per item if needed
            // Actually, google-translate-api-x supports array input directly which is more efficient
            const res = await translate(texts, { to: targetLang });

            // If input was array, res is array. If input was string, res is object.
            // We are passing array, so we expect array.
            if (Array.isArray(res)) {
                return res.map((r: any) => r.text);
            } else {
                // Fallback if single item returned (shouldn't happen with array input but types can be tricky)
                return [(res as any).text];
            }
        } catch (error) {
            console.error('Translation API Error:', error);
            // Fallback to original text on error to prevent crash
            return texts;
        }
    }
}

// Factory to get the configured provider
export function getProvider(): TranslationProvider {
    return new RealGoogleProvider();
}
