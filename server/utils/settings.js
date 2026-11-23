import { Setting } from '../models/Setting';
import { emptyThemeColors } from './theme-colors';
import { sanitizeBookingInfo } from './sanitize';

function storedColors(input = {}) {
    const colors = emptyThemeColors();
    Object.keys(colors).forEach((key) => {
        const value = String(input[key] || '').trim().toLowerCase();
        colors[key] = /^#[0-9a-f]{6}$/.test(value) ? value : '';
    });
    return colors;
}

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
        colors: emptyThemeColors(),
        passwordHash: '',
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
        colors: storedColors(input.colors),
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
}
export async function savePasswordHash(passwordHash) {
    const settings = await getSettings();
    settings.passwordHash = passwordHash;
    await settings.save();
    return settings;
}
