const hits = new Map();
export function assertRateLimit(key, limit = 5, windowMs = 60_000) {
    const now = Date.now();
    const current = hits.get(key);
    if (!current || current.reset < now) {
        hits.set(key, { count: 1, reset: now + windowMs });
        return;
    }
    current.count += 1;
    if (current.count > limit) {
        throw createError({
            statusCode: 429,
            statusMessage: t('errors.rateLimit'),
        });
    }
}
