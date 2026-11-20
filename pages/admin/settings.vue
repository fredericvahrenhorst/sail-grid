<script setup>
import { useI18n } from 'vue-i18n';
import { readError } from '@/composables/readError';

definePageMeta({ layout: 'admin', middleware: 'admin' });
const { t } = useI18n();
const { data, refresh } = await useFetch('/api/settings', { key: 'site-settings' });
const bookingInfoText = ref('');
const notifyEnabled = ref(false);
const siteName = ref('');
const clubName = ref('');
const metaTitle = ref('');
const metaDescription = ref('');
const notice = ref('');
const error = ref('');
const pending = ref(false);
watch(data, (value) => {
    bookingInfoText.value = value?.bookingInfoText || '';
    notifyEnabled.value = Boolean(value?.notifyEnabled);
    siteName.value = value?.siteName || '';
    clubName.value = value?.clubName || '';
    metaTitle.value = value?.metaTitle || '';
    metaDescription.value = value?.metaDescription || '';
}, { immediate: true });
async function save() {
    error.value = '';
    pending.value = true;
    try {
        await $fetch('/api/settings', {
            method: 'PUT',
            body: {
                bookingInfoText: bookingInfoText.value,
                notifyEnabled: notifyEnabled.value,
                siteName: siteName.value,
                clubName: clubName.value,
                metaTitle: metaTitle.value,
                metaDescription: metaDescription.value,
            },
        });
        notice.value = t('settings.saved');
        await refresh();
    } catch (cause) {
        error.value = readError(cause).message;
    } finally {
        pending.value = false;
    }
}
</script>

<template>
    <div class="max-w-2xl">
        <h1 class="text-2xl font-bold text-ink">{{ t('settings.title') }}</h1>
        <p class="mt-2 text-sm text-mist">
            {{ t('settings.intro') }}
        </p>
        <form class="mt-8 space-y-8" @submit.prevent="save">
            <section class="space-y-4">
                <h2 class="text-lg font-bold text-ink">{{ t('settings.general') }}</h2>
                <UFormField :label="t('settings.siteName')">
                    <UInput v-model="siteName" :placeholder="t('meta.title')" class="w-full" />
                </UFormField>
                <UFormField :label="t('settings.clubName')">
                    <UInput v-model="clubName" :placeholder="t('calendar.tagline')" class="w-full" />
                </UFormField>
                <UFormField :label="t('settings.metaTitle')">
                    <UInput v-model="metaTitle" :placeholder="t('meta.title')" class="w-full" />
                </UFormField>
                <UFormField :label="t('settings.metaDescription')">
                    <UTextarea v-model="metaDescription" :placeholder="t('meta.description')" class="w-full" />
                </UFormField>
                <UCheckbox v-model="notifyEnabled" :label="t('settings.notify')" />
                <p class="text-sm text-mist">
                    {{ t('settings.notifyHint') }}
                </p>
            </section>
            <section class="space-y-4 border-t border-line pt-8">
                <h2 class="text-lg font-bold text-ink">{{ t('settings.popupTitle') }}</h2>
                <p class="text-sm text-mist">{{ t('settings.popupIntro') }}</p>
                <ClientOnly>
                    <AdminTipTapEditor v-model="bookingInfoText" />
                </ClientOnly>
            </section>
            <p v-if="notice" class="text-sm font-bold text-tide">{{ notice }}</p>
            <p v-if="error" class="text-sm font-bold text-danger" role="alert">{{ error }}</p>
            <UButton type="submit" :loading="pending">{{ t('settings.save') }}</UButton>
        </form>
    </div>
</template>
