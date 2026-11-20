import { addDays } from 'date-fns';

export default defineEventHandler(async(event) => {
    await ensureDb();
    const id = idFromPath(event);
    const boat = await Boat.findById(id);
    if (!boat || !boat.active) throw createError({ statusCode: 404, statusMessage: t('errors.boatMissing') });
    const from = addDays(new Date(), -90);
    const to = addDays(new Date(), 365);
    const bookings = await Booking.find({
        boatId: boat._id,
        start: { $lt: to },
        end: { $gt: from },
    }).sort({ start: 1 }).limit(500);
    const calendar = createCalendar(`SailGrid – ${boat.name}`);
    for (const booking of bookings) {
        calendar.createEvent({
            id: booking._id.toString(),
            start: booking.start,
            end: booking.end,
            summary: `${boat.name}: ${booking.memberName}`,
            description: [booking.notes, booking.route ? `Route: ${booking.route}` : ''].filter(Boolean).join('\n'),
            location: booking.route || undefined,
            url: `${publicBaseUrl()}/?boatId=${boat._id.toString()}`,
        });
    }
    const slug = boat.name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'boot';
    return sendCalendar(event, calendar, `sailgrid-${slug}.ics`);
});
