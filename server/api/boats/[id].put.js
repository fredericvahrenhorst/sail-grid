export default defineEventHandler(async(event) => {
    await requireAdmin(event);
    await ensureDb();
    const id = assertObjectId(getRouterParam(event, 'id') || '');
    const body = parseBody(boatSchema, await readBody(event));
    delete body.sortOrder;
    const boat = await Boat.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!boat) throw createError({ statusCode: 404, statusMessage: t('errors.boatMissing') });
    return serializeBoat(boat);
});
