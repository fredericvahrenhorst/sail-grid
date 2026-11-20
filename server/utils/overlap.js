import { Booking } from '../models/Booking';
import { assertObjectId } from './ids';

export async function findOverlaps(boatId, start, end, ignoreId) {
    assertObjectId(boatId);
    const query = {
        boatId,
        start: { $lt: end },
        end: { $gt: start },
    };
    if (ignoreId) query._id = { $ne: ignoreId };
    return Booking.find(query).select('memberName start end').limit(5).lean();
}
