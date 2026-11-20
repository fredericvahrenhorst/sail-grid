export default defineEventHandler(async(event) => {
    assertRateLimit(`login:${getRequestIP(event) || 'unknown'}`);
    const body = parseBody(loginSchema, await readBody(event));
    const expected = adminPassword();
    if (!expected || !passwordsMatch(body.password, expected)) {
        throw createError({ statusCode: 401, statusMessage: t('errors.loginFailed') });
    }
    await setUserSession(event, { user: { admin: true } });
    return { ok: true };
});
