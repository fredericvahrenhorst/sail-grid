<script setup>
import { useI18n } from 'vue-i18n';
import { readError } from '@/composables/readError';

definePageMeta({ layout: 'plain' });
const { t } = useI18n();
useSeoMeta({
    title: () => t('meta.loginTitle'),
    robots: 'noindex, nofollow',
});
const { loggedIn, fetch } = useUserSession();
if (!loggedIn.value) await fetch();
if (loggedIn.value) await navigateTo('/admin');
const password = ref('');
const error = ref('');
const pending = ref(false);
async function submit() {
    error.value = '';
    pending.value = true;
    try {
        await $fetch('/api/auth/login', { method: 'POST', body: { password: password.value } });
        await fetch();
        await navigateTo('/admin');
    } catch (cause) {
        error.value = readError(cause).message;
    } finally {
        pending.value = false;
    }
}
</script>

<template>
    <div class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
        <p class="font-brand font-semibold text-5xl text-ink">
            SailGrid
        </p>
        <p class="mt-3 text-sm text-mist">
            {{ t('login.intro') }}
        </p>
        <form class="mt-8 space-y-4" @submit.prevent="submit">
            <UFormField :label="t('login.password')" required>
                <UInput v-model="password" type="password" autocomplete="current-password" class="w-full" />
            </UFormField>
            <p v-if="error" class="text-sm font-bold text-danger" role="alert">
                {{ error }}
            </p>
            <UButton type="submit" :loading="pending">
                {{ t('login.submit') }}
            </UButton>
        </form>
        <UButton to="/" color="neutral" variant="ghost" icon="i-lucide-arrow-left" class="mt-6 self-start">
            {{ t('nav.back') }}
        </UButton>
    </div>
</template>
