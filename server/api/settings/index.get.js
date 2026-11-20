export default defineEventHandler(async() => {
    await ensureDb();
    const settings = await getSettings();
    return serializeSettings({
        bookingInfoText: sanitizeBookingInfo(settings.bookingInfoText || ''),
        notifyEnabled: settings.notifyEnabled,
    });
});
