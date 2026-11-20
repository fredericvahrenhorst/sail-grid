import { Setting } from '../models/Setting';
import { sanitizeBookingInfo } from './sanitize';

export async function getSettings() {
    const existing = await Setting.findOne({ key: 'default' });
    if (existing) return existing;
    return Setting.create({
        key: 'default',
        bookingInfoText: t('content.defaultBookingInfo'),
        notifyEnabled: false,
    });
}
export async function saveSettings(bookingInfoText, notifyEnabled) {
    const clean = sanitizeBookingInfo(bookingInfoText);
    return Setting.findOneAndUpdate({ key: 'default' }, { key: 'default', bookingInfoText: clean, notifyEnabled }, { upsert: true, new: true, setDefaultsOnInsert: true });
}
