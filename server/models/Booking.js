import mongoose, { Schema } from 'mongoose';

const BookingSchema = new Schema({
    boatId: {
        type: Schema.Types.ObjectId, ref: 'Boat', required: true, index: true
    },
    memberName: {
        type: String, required: true, trim: true, maxlength: 120
    },
    notes: { type: String, default: '', maxlength: 4000 },
    route: { type: String, default: '', maxlength: 500 },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
}, { timestamps: true });
BookingSchema.index({ boatId: 1, start: 1 });
BookingSchema.index({ start: 1, end: 1 });
export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
