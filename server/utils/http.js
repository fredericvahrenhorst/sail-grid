export function parseBody(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: t('errors.badInput'),
            data: { fields: result.error.flatten().fieldErrors },
        });
    }
    return result.data;
}
export function frameAncestorsValue() {
    const config = useRuntimeConfig();
    const raw = config.allowedFrameAncestors || process.env.ALLOWED_FRAME_ANCESTORS || 'self';
    const tokens = String(raw).replace(/[\r\n;'"]/g, ' ').split(/\s+/).filter(Boolean);
    if (!tokens.length) return "'self'";
    return tokens.map((token) => {
        if (token === '*') return '*';
        if (token === 'self' || token === 'none') return `'${token}'`;
        return token;
    }).join(' ');
}
export function publicBaseUrl() {
    const config = useRuntimeConfig();
    return (config.public.baseUrl || process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
}
