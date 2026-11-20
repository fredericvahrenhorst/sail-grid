export function parseRange(startRaw, endRaw) {
    const start = new Date(startRaw);
    const end = new Date(endRaw);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw createError({ statusCode: 400, statusMessage: t('errors.badDate') });
    }
    if (end <= start) {
        throw createError({ statusCode: 400, statusMessage: t('errors.endBeforeStart') });
    }
    return { start, end };
}
