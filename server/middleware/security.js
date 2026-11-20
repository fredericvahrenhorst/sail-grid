export default defineEventHandler((event) => {
    const allowEmbed = getRequestURL(event).pathname === '/';
    const ancestors = allowEmbed ? frameAncestorsValue() : "'none'";
    setHeader(event, 'Content-Security-Policy', `frame-ancestors ${ancestors}`);
    if (!allowEmbed) setHeader(event, 'X-Frame-Options', 'DENY');
    setHeader(event, 'X-Content-Type-Options', 'nosniff');
    setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin');
    setHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    const method = event.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return;
    if (!event.path.startsWith('/api/')) return;
    const origin = getHeader(event, 'origin');
    if (!origin) return;
    let originHost = '';
    try {
        originHost = new URL(origin).host;
    } catch {
        throw createError({ statusCode: 403, statusMessage: t('errors.badOrigin') });
    }
    if (originHost !== getRequestURL(event).host) {
        throw createError({ statusCode: 403, statusMessage: t('errors.rejected') });
    }
});
