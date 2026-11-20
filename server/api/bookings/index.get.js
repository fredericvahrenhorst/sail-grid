import { differenceInCalendarDays } from 'date-fns';

export default defineEventHandler(async(event) => {
    await ensureDb();
    const query = getQuery(event);
    const now = new Date();
    const from = typeof query.from === 'string' ? new Date(query.from) : new Date(now.getFullYear(), now.getMonth(), 1);
    const to = typeof query.to === 'string' ? new Date(query.to) : new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
        throw createError({ statusCode: 400, statusMessage: t('errors.badRange') });
    }
    if (differenceInCalendarDays(to, from) > 560) {
        throw createError({ statusCode: 400, message: t('errors.rangeTooBig') });
    }
    const filter = {
        start: { $lt: to },
        end: { $gt: from },
    };
    if (typeof query.boatId === 'string' && query.boatId) {
        filter.boatId = assertObjectId(query.boatId);
    }
    const bookings = await Booking.find(filter).populate('boatId', 'name color').sort({ start: 1 }).limit(1000);
    return bookings.map(serializeBooking);
});
