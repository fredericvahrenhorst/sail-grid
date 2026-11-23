<script setup>
import { useI18n } from 'vue-i18n';
import { readError } from '@/composables/readError';
import { THEME_COLORS, emptyThemeColors } from '../../lib/theme-colors';

definePageMeta({ layout: 'admin', middleware: 'admin' });
const { t } = useI18n();
const { data, refresh } = await useFetch('/api/settings', { key: 'site-settings' });
const bookingInfoText = ref('');
const notifyEnabled = ref(false);
const siteName = ref('');
const clubName = ref('');
const metaTitle = ref('');
const metaDescription = ref('');
const colors = reactive(emptyThemeColors());
const notice = ref('');
const error = ref('');
const pending = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordNotice = ref('');
const passwordError = ref('');
const passwordPending = ref(false);
watch(data, (value) => {
    bookingInfoText.value = value?.bookingInfoText || '';
    notifyEnabled.value = Boolean(value?.notifyEnabled);
    siteName.value = value?.siteName || '';
    clubName.value = value?.clubName || '';
    metaTitle.value = value?.metaTitle || '';
    metaDescription.value = value?.metaDescription || '';
    THEME_COLORS.forEach((color) => {
        colors[color.key] = value?.colors?.[color.key] || '';
    });
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
                colors: { ...colors },
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
async function changePassword() {
    passwordError.value = '';
    passwordNotice.value = '';
    passwordPending.value = true;
    try {
        await $fetch('/api/auth/password', {
            method: 'POST',
            body: {
                currentPassword: currentPassword.value,
                newPassword: newPassword.value,
                confirmPassword: confirmPassword.value,
            },
        });
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        passwordNotice.value = t('settings.password.saved');
    } catch (cause) {
        passwordError.value = readError(cause).message;
    } finally {
        passwordPending.value = false;
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
                <h2 class="text-lg font-bold text-ink">{{ t('settings.colors.title') }}</h2>
                <p class="text-sm text-mist">{{ t('settings.colors.intro') }}</p>
                <div class="grid gap-4 sm:grid-cols-2">
                    <div v-for="color in THEME_COLORS" :key="color.key" class="flex items-end gap-2">
                        <input
                            type="color"
                            class="mb-1 h-9 w-9 shrink-0 cursor-pointer rounded-sm border border-line bg-white"
                            :value="colors[color.key] || color.fallback"
                            :aria-label="t(`settings.colors.${color.key}`)"
                            @input="colors[color.key] = $event.target.value"
                        >
                        <UFormField :label="t(`settings.colors.${color.key}`)" class="min-w-0 flex-1">
                            <UInput
                                v-model="colors[color.key]"
                                :placeholder="color.fallback"
                                spellcheck="false"
                                class="w-full"
                            />
                        </UFormField>
                        <button
                            v-if="colors[color.key]"
                            type="button"
                            class="mb-2 text-sm font-bold text-mist underline"
                            @click="colors[color.key] = ''"
                        >
                            {{ t('settings.colors.reset') }}
                        </button>
                    </div>
                </div>
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
        <form class="mt-8 space-y-4 border-t border-line pt-8" @submit.prevent="changePassword">
            <h2 class="text-lg font-bold text-ink">{{ t('settings.password.title') }}</h2>
            <p class="text-sm text-mist">{{ t('settings.password.intro') }}</p>
            <UFormField :label="t('settings.password.current')">
                <UInput v-model="currentPassword" type="password" autocomplete="current-password" class="w-full" />
            </UFormField>
            <UFormField :label="t('settings.password.next')">
                <UInput v-model="newPassword" type="password" autocomplete="new-password" class="w-full" />
            </UFormField>
            <UFormField :label="t('settings.password.confirm')">
                <UInput v-model="confirmPassword" type="password" autocomplete="new-password" class="w-full" />
            </UFormField>
            <p class="text-sm text-mist">{{ t('settings.password.hint') }}</p>
            <p v-if="passwordNotice" class="text-sm font-bold text-tide">{{ passwordNotice }}</p>
            <p v-if="passwordError" class="text-sm font-bold text-danger" role="alert">{{ passwordError }}</p>
            <UButton type="submit" :loading="passwordPending">{{ t('settings.password.save') }}</UButton>
        </form>
    </div>
</template>
