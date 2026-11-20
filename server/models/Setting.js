import mongoose, { Schema } from 'mongoose';

const SettingSchema = new Schema({
    key: {
        type: String, required: true, unique: true, default: 'default'
    },
    bookingInfoText: { type: String, default: '' },
    notifyEnabled: { type: Boolean, default: false },
}, { timestamps: true });
export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
