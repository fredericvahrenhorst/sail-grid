export default defineEventHandler(async(event) => {
    await requireAdmin(event);
    await ensureDb();
    const body = parseBody(boatSchema, await readBody(event));
    const latest = await Boat.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean();
    body.sortOrder = (latest?.sortOrder ?? -1) + 1;
    const boat = await Boat.create(body);
    return serializeBoat(boat);
});
