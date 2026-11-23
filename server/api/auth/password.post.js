export default defineEventHandler(async(event) => {
    await requireAdmin(event);
    assertRateLimit(`password:${getRequestIP(event) || 'unknown'}`);
    await ensureDb();
    const body = parseBody(passwordChangeSchema, await readBody(event));
    if (!await adminPasswordMatches(body.currentPassword)) {
        throw createError({ statusCode: 401, statusMessage: t('errors.passwordCurrent') });
    }
    if (body.newPassword !== body.confirmPassword) {
        throw createError({ statusCode: 400, statusMessage: t('errors.passwordMismatch') });
    }
    const problem = passwordChangeError(body.newPassword);
    if (problem) {
        throw createError({ statusCode: 400, statusMessage: t(problem) });
    }
    await savePasswordHash(hashAdminPassword(body.newPassword));
    return { ok: true };
});
