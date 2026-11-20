import mongoose, { Schema } from 'mongoose';

const BoatSchema = new Schema({
    name: {
        type: String, required: true, trim: true, maxlength: 120
    },
    description: { type: String, default: '', maxlength: 2000 },
    imageUrl: { type: String, default: '', maxlength: 2000 },
    color: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });
BoatSchema.index({ active: 1, sortOrder: 1, name: 1 });
export const Boat = mongoose.models.Boat || mongoose.model('Boat', BoatSchema);
