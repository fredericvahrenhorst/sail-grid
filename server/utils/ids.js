import mongoose from 'mongoose';

export function idFromPath(event) {
    const match = getRequestURL(event).pathname.match(/([a-f\d]{24})(?:\.ics)?$/i);
    if (!match?.[1]) throw createError({ statusCode: 400, statusMessage: t('errors.badId') });
    return match[1];
}
export function assertObjectId(id) {
    const normalized = id.replace(/\.ics$/i, '');
    if (!mongoose.isValidObjectId(normalized)) {
        throw createError({ statusCode: 400, statusMessage: t('errors.badId') });
    }
    return normalized;
}
