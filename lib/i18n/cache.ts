import NodeCache from 'node-cache';
import Redis from 'ioredis';
import crypto from 'crypto';

// In-memory cache for development / fallback
const localCache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // 24 hours

// Redis client (only if env var is set)
const redisUrl = process.env.REDIS_URL;
const redis = redisUrl ? new Redis(redisUrl) : null;

export async function getCachedTranslations(
    strings: string[],
    targetLang: string
): Promise<{ hits: Map<string, string>; misses: string[] }> {
    const hits = new Map<string, string>();
    const misses: string[] = [];

    // If target is English, return identity mapping (assuming source is English)
    if (targetLang === 'en') {
        strings.forEach(s => hits.set(s, s));
        return { hits, misses: [] };
    }

    for (const str of strings) {
        const hash = crypto.createHash('md5').update(str).digest('hex');
        const key = `tr:${targetLang}:${hash}`;

        // 1. Check Local Cache
        const localHit = localCache.get<string>(key);
        if (localHit) {
            hits.set(str, localHit);
            continue;
        }

        // 2. Check Redis (if available)
        if (redis) {
            try {
                const redisHit = await redis.get(key);
                if (redisHit) {
                    hits.set(str, redisHit);
                    localCache.set(key, redisHit); // Populate local cache
                    continue;
                }
            } catch (e) {
                console.warn('Redis error:', e);
            }
        }

        misses.push(str);
    }

    return { hits, misses };
}

export async function setCachedTranslations(
    translations: Map<string, string>,
    targetLang: string
) {
    if (targetLang === 'en') return;

    const pipeline = redis ? redis.pipeline() : null;

    for (const [original, translated] of translations.entries()) {
        const hash = crypto.createHash('md5').update(original).digest('hex');
        const key = `tr:${targetLang}:${hash}`;

        // Set Local
        localCache.set(key, translated);

        // Set Redis
        if (pipeline) {
            pipeline.set(key, translated, 'EX', 60 * 60 * 24 * 7); // 7 days
        }
    }

    if (pipeline) {
        try {
            await pipeline.exec();
        } catch (e) {
            console.warn('Redis pipeline error:', e);
        }
    }
}
