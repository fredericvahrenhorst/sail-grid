// Placeholders published in .env.example and the Dockerfile.
// Production must not sign sessions or accept admin login with them.
const BLOCKED_SESSION_PASSWORDS = new Set([
    'replace-with-at-least-32-characters',
    'build-only-placeholder-not-a-runtime-secret',
]);

const BLOCKED_ADMIN_PASSWORDS = new Set([
    'change-me',
    'root',
]);

export default defineNitroPlugin(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const config = useRuntimeConfig();
    const sessionPassword = process.env.NUXT_SESSION_PASSWORD || config.session?.password || '';
    const adminPassword = process.env.NUXT_ADMIN_PASSWORD
        || process.env.ADMIN_PASSWORD
        || config.adminPassword
        || '';

    if (sessionPassword.length < 32 || BLOCKED_SESSION_PASSWORDS.has(sessionPassword)) {
        console.error('[sailgrid] Set a unique NUXT_SESSION_PASSWORD of at least 32 characters.');
        process.exit(1);
    }
    if (adminPassword.length < 12 || BLOCKED_ADMIN_PASSWORDS.has(adminPassword)) {
        console.error('[sailgrid] Set a unique ADMIN_PASSWORD. Example values are public.');
        process.exit(1);
    }
});
