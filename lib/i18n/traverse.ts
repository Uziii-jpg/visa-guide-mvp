/**
 * Traverses a JSON object and identifies translatable strings.
 * Returns a list of strings to translate and a "skeleton" object with placeholders.
 */

interface TraversalResult {
    strings: string[];
    skeleton: any;
    map: Map<string, string[]>; // Map of hash -> paths to replace
}

// Regex to identify if a string should be translated
// We skip URLs, UUIDs, single numbers, and short codes
const URL_REGEX = /^(http|https):\/\/[^ "]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMBER_REGEX = /^\d+$/;

export function traverseAndExtract(data: any): TraversalResult {
    const strings: string[] = [];
    const map = new Map<string, string[]>();

    function walk(node: any, path: string[]): any {
        if (typeof node === 'string') {
            // Filter out non-translatable strings
            if (
                node.trim().length === 0 ||
                URL_REGEX.test(node) ||
                UUID_REGEX.test(node) ||
                NUMBER_REGEX.test(node)
            ) {
                return node;
            }

            strings.push(node);
            // We'll use the original string as the key for now to map back later
            // In a real implementation, we might use a hash here to save space in the map
            const key = node;
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key)!.push(path.join('.'));

            return node; // Return original for now, we'll replace later
        } else if (Array.isArray(node)) {
            return node.map((item, index) => walk(item, [...path, index.toString()]));
        } else if (typeof node === 'object' && node !== null) {
            const newNode: any = {};
            for (const key in node) {
                // Skip specific keys if needed (e.g., 'id', 'slug')
                if (['id', 'slug', 'code', 'country_code', 'visa_type', 'template_ref', 'source_template', 'fileName'].includes(key)) {
                    newNode[key] = node[key];
                } else {
                    newNode[key] = walk(node[key], [...path, key]);
                }
            }
            return newNode;
        }
        return node;
    }

    const skeleton = walk(data, []);

    // Deduplicate strings
    const uniqueStrings = Array.from(new Set(strings));

    return { strings: uniqueStrings, skeleton, map };
}

export function applyTranslations(data: any, translations: Map<string, string>): any {
    // Deep clone to avoid mutating original if needed, but we'll just walk and replace
    // Since we have the map, we could potentially optimize, but walking is safer for structure

    function walk(node: any): any {
        if (typeof node === 'string') {
            return translations.get(node) || node;
        } else if (Array.isArray(node)) {
            return node.map(walk);
        } else if (typeof node === 'object' && node !== null) {
            const newNode: any = {};
            for (const key in node) {
                newNode[key] = walk(node[key]);
            }
            return newNode;
        }
        return node;
    }

    return walk(data);
}
