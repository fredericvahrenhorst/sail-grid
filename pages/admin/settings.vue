<script setup>
import { useI18n } from 'vue-i18n';
import { readError } from '@/composables/readError';

definePageMeta({ layout: 'admin', middleware: 'admin' });
const { t } = useI18n();
const { data, refresh } = await useFetch('/api/settings');
const bookingInfoText = ref('');
const notifyEnabled = ref(false);
const notice = ref('');
const error = ref('');
const pending = ref(false);
watch(data, (value) => {
    bookingInfoText.value = value?.bookingInfoText || '';
    notifyEnabled.value = Boolean(value?.notifyEnabled);
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
        <form class="mt-6 space-y-4" @submit.prevent="save">
            <ClientOnly>
                <AdminTipTapEditor v-model="bookingInfoText" />
            </ClientOnly>
            <UCheckbox v-model="notifyEnabled" :label="t('settings.notify')" />
            <p class="text-sm text-mist">
                {{ t('settings.notifyHint') }}
            </p>
            <p v-if="notice" class="text-sm font-bold text-tide">{{ notice }}</p>
            <p v-if="error" class="text-sm font-bold text-danger" role="alert">{{ error }}</p>
            <UButton type="submit" :loading="pending">{{ t('settings.save') }}</UButton>
        </form>
    </div>
</template>
