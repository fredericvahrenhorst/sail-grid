export default defineEventHandler(async(event) => {
    await requireAdmin(event);
    await ensureDb();
    const body = parseBody(boatOrderSchema, await readBody(event));
    const ids = body.ids.map((id) => assertObjectId(id));
    if (new Set(ids).size !== ids.length) {
        throw createError({ statusCode: 400, statusMessage: t('errors.order') });
    }
    await Boat.bulkWrite(ids.map((id, index) => ({
        updateOne: {
            filter: { _id: id },
            update: { sortOrder: index },
        },
    })));
    return { ok: true };
});
