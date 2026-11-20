import mongoose, { Schema } from 'mongoose';

const SettingSchema = new Schema({
    key: {
        type: String, required: true, unique: true, default: 'default'
    },
    bookingInfoText: { type: String, default: '' },
    notifyEnabled: { type: Boolean, default: false },
    siteName: { type: String, default: '', maxlength: 80 },
    clubName: { type: String, default: '', maxlength: 120 },
    metaTitle: { type: String, default: '', maxlength: 120 },
    metaDescription: { type: String, default: '', maxlength: 300 },
}, { timestamps: true });
export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
