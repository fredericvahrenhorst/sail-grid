import { createI18n } from 'vue-i18n';
import de from '../locales/de.json';
import en from '../locales/en.json';

export default defineNuxtPlugin((nuxtApp) => {
    const lang = useRuntimeConfig().public.lang === 'en' ? 'en' : 'de';
    const i18n = createI18n({
        legacy: false,
        globalInjection: true,
        locale: lang,
        fallbackLocale: 'de',
        messages: { de, en },
    });
    nuxtApp.vueApp.use(i18n);
    nuxtApp.provide('i18n', i18n.global);
    useHead({ htmlAttrs: { lang } });
});
