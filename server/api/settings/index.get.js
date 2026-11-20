export default defineEventHandler(async() => {
    await ensureDb();
    const settings = await getSettings();
    return serializeSettings({
        ...settings.toObject(),
        bookingInfoText: sanitizeBookingInfo(settings.bookingInfoText || ''),
    });
});
