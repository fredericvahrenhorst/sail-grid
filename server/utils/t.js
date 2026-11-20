import de from '../../locales/de.json';
import en from '../../locales/en.json';

const catalogs = { de, en };

export function appLang() {
    const config = useRuntimeConfig();
    return config.public.lang === 'en' ? 'en' : 'de';
}

export function t(key, params = {}) {
    const parts = key.split('.');
    let node = catalogs[appLang()];
    for (const part of parts) node = node?.[part];
    const text = typeof node === 'string' ? node : key;
    return text.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ''));
}
