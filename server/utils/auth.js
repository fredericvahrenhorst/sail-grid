export async function requireAdmin(event) {
    const session = await getUserSession(event);
    if (!session.user?.admin) {
        throw createError({ statusCode: 401, statusMessage: t('errors.unauthorized') });
    }
}
export function adminPassword() {
    const config = useRuntimeConfig();
    return config.adminPassword || process.env.ADMIN_PASSWORD || '';
}

export async function adminPasswordMatches(password) {
    const settings = await getSettings();
    if (settings.passwordHash) return verifyAdminPassword(password, settings.passwordHash);
    const expected = adminPassword();
    return Boolean(expected) && passwordsMatch(password, expected);
}
