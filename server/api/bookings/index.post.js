export default defineEventHandler(async(event) => {
    await requireAdmin(event);
    await ensureDb();
    const body = parseBody(bookingSchema, await readBody(event));
    const boatId = assertObjectId(body.boatId);
    const boat = await Boat.findById(boatId);
    if (!boat) throw createError({ statusCode: 400, statusMessage: t('errors.boatMissing') });
    const { start, end } = parseRange(body.start, body.end);
    const conflicts = await findOverlaps(boatId, start, end);
    if (conflicts.length && !body.force) {
        throw createError({
            statusCode: 409,
            statusMessage: t('errors.boatTaken'),
            data: {
                overlap: true,
                conflicts: conflicts.map((item) => ({
                    id: String(item._id),
                    memberName: item.memberName,
                    start: item.start.toISOString(),
                    end: item.end.toISOString(),
                })),
            },
        });
    }
    const booking = await Booking.create({
        boatId,
        memberName: body.memberName,
        notes: body.notes,
        route: body.route,
        start,
        end,
        allDay: body.allDay,
    });
    await booking.populate('boatId', 'name color');
    return serializeBooking(booking);
});
