<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
useSeoMeta({
    title: () => t('meta.title'),
    description: () => t('meta.description'),
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
