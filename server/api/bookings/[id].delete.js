export default defineEventHandler(async(event) => {
    await requireAdmin(event);
    await ensureDb();
    const id = assertObjectId(getRouterParam(event, 'id') || '');
    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) throw createError({ statusCode: 404, statusMessage: t('errors.bookingMissing') });
    return { deleted: true };
});
