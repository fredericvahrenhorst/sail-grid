import { themeColorStyle } from '../lib/theme-colors';

export default defineNuxtPlugin(() => {
    const { data } = useFetch('/api/settings', { key: 'site-settings' });
    const colorStyle = computed(() => themeColorStyle(data.value?.colors));
    useHead({
        htmlAttrs: { style: colorStyle },
    });
});
