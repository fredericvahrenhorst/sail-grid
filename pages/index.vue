<script setup>
import { useI18n } from 'vue-i18n';
import { useSiteSettings } from '@/composables/useSiteSettings';

const { t } = useI18n();
const { metaTitle, metaDescription } = useSiteSettings();
useSeoMeta({
    title: () => metaTitle.value,
    description: () => metaDescription.value,
});
</script>

<template>
    <ClientOnly>
        <CalendarView />
        <template #fallback>
            <p class="text-sm text-mist">{{ t('calendar.loadingPage') }}</p>
        </template>
    </ClientOnly>
</template>
