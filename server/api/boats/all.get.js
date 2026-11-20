export default defineEventHandler(async(event) => {
    await requireAdmin(event);
    await ensureDb();
    const boats = await Boat.find().sort({ sortOrder: 1, name: 1 }).lean();
    return boats.map(serializeBoat);
});
