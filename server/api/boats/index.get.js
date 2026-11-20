export default defineEventHandler(async() => {
    await ensureDb();
    const boats = await Boat.find({ active: true }).sort({ sortOrder: 1, name: 1 }).lean();
    return boats.map(serializeBoat);
});
