export default defineEventHandler(async(event) => {
    await ensureDb();
    const id = idFromPath(event);
    const booking = await Booking.findById(id).populate('boatId', 'name color');
    if (!booking) throw createError({ statusCode: 404, statusMessage: t('errors.bookingMissing') });
    const dto = serializeBooking(booking);
    const siteName = (await getSettings()).siteName?.trim() || t('meta.title');
    const calendar = createCalendar(`${siteName} – ${dto.boatName}`);
    calendar.createEvent({
        id: dto.id,
        start: booking.start,
        end: booking.end,
        summary: `${dto.boatName}: ${dto.memberName}`,
        description: [dto.notes, dto.route ? `Route: ${dto.route}` : ''].filter(Boolean).join('\n'),
        location: dto.route || undefined,
        url: `${publicBaseUrl()}/?boatId=${dto.boatId}`,
    });
    return sendCalendar(event, calendar, `sailgrid-buchung-${dto.id}.ics`);
});
