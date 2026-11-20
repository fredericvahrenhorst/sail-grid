export default defineNitroPlugin(async() => {
    try {
        await ensureDb();
    } catch (error) {
        console.error('[sailgrid] MongoDB connection failed', error);
    }
});
