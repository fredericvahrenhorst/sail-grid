import { Setting } from '../models/Setting';
import { sanitizeBookingInfo } from './sanitize';

export async function getSettings() {
    const existing = await Setting.findOne({ key: 'default' });
    if (existing) return existing;
    return Setting.create({
        key: 'default',
        bookingInfoText: t('content.defaultBookingInfo'),
        notifyEnabled: false,
        siteName: '',
        clubName: '',
        metaTitle: '',
        metaDescription: '',
    });
}
export async function saveSettings(input) {
    const clean = sanitizeBookingInfo(input.bookingInfoText);
    return Setting.findOneAndUpdate({ key: 'default' }, {
        key: 'default',
        bookingInfoText: clean,
        notifyEnabled: Boolean(input.notifyEnabled),
        siteName: input.siteName,
        clubName: input.clubName,
        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
}
