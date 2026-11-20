import { useI18n } from 'vue-i18n';

export function useSiteSettings() {
    const { t } = useI18n();
    const { data } = useFetch('/api/settings', { key: 'site-settings' });
    const siteName = computed(() => data.value?.siteName?.trim() || t('meta.title'));
    const clubName = computed(() => data.value?.clubName?.trim() || '');
    const metaTitle = computed(() => data.value?.metaTitle?.trim() || siteName.value);
    const metaDescription = computed(() => data.value?.metaDescription?.trim() || t('meta.description'));
    return {
        settings: data, siteName, clubName, metaTitle, metaDescription,
    };
}
