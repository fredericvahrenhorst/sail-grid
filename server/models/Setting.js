import mongoose, { Schema } from 'mongoose';
import { THEME_COLORS } from '../utils/theme-colors';

const colorFields = Object.fromEntries(THEME_COLORS.map((color) => [color.key, {
    type: String, default: '', maxlength: 7,
}]));

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
    colors: { type: new Schema(colorFields, { _id: false }), default: () => ({}) },
    passwordHash: { type: String, default: '', maxlength: 200 },
}, { timestamps: true });
export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
