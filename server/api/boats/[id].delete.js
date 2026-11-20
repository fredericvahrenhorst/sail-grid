export default defineEventHandler(async(event) => {
    await requireAdmin(event);
    await ensureDb();
    const id = assertObjectId(getRouterParam(event, 'id') || '');
    const bookingCount = await Booking.countDocuments({ boatId: id });
    if (bookingCount > 0) {
        const boat = await Boat.findByIdAndUpdate(id, { active: false }, { new: true });
        if (!boat) throw createError({ statusCode: 404, statusMessage: t('errors.boatMissing') });
        return { archived: true, boat: serializeBoat(boat) };
    }
    const deleted = await Boat.findByIdAndDelete(id);
    if (!deleted) throw createError({ statusCode: 404, statusMessage: t('errors.boatMissing') });
    return { archived: false, deleted: true };
});
