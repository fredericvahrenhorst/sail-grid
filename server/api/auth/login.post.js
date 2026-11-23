export default defineEventHandler(async(event) => {
    assertRateLimit(`login:${getRequestIP(event) || 'unknown'}`);
    const body = parseBody(loginSchema, await readBody(event));
    await ensureDb();
    if (!await adminPasswordMatches(body.password)) {
        throw createError({ statusCode: 401, statusMessage: t('errors.loginFailed') });
    }
    await setUserSession(event, { user: { admin: true } });
    return { ok: true };
});
