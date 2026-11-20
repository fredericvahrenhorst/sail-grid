export default defineEventHandler(async(event) => {
    await requireAdmin(event);
    await ensureDb();
    const body = parseBody(settingsSchema, await readBody(event));
    const settings = await saveSettings(body.bookingInfoText || '', Boolean(body.notifyEnabled));
    return serializeSettings(settings);
});
