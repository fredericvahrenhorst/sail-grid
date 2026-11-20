<script setup>
import { useI18n } from 'vue-i18n';
import { useSiteSettings } from '@/composables/useSiteSettings';

useSeoMeta({ robots: 'noindex, nofollow' });
const { siteName } = useSiteSettings();
const route = useRoute();
const { t } = useI18n();
const links = computed(() => [
    { to: '/admin', label: t('admin.overview') },
    { to: '/admin/bookings', label: t('admin.bookings') },
    { to: '/admin/boats', label: t('admin.boats') },
    { to: '/admin/settings', label: t('admin.hint') },
]);
async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' });
    await clearUserSession();
    await navigateTo('/login');
}
const { clear: clearUserSession } = useUserSession();
</script>

<template>
    <div class="min-h-screen bg-harbor font-sans text-body">
        <header class="border-b border-line bg-foam/90">
            <div class="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4 px-4 py-5 sm:px-6">
                <div>
                    <p class="font-brand font-semibold text-4xl leading-none text-ink">
                        {{ siteName }}
                    </p>
                    <p class="mt-2 text-sm text-mist">
                        {{ t('admin.nav') }}
                    </p>
                </div>
                <div class="flex items-center gap-4 text-sm">
                    <NuxtLink to="/" class="font-bold text-tide hover:underline">
                        {{ t('nav.calendar') }}
                    </NuxtLink>
                    <button type="button" class="font-bold text-mist hover:underline" @click="logout">
                        {{ t('nav.logout') }}
                    </button>
                </div>
            </div>
            <nav class="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6" :aria-label="t('admin.nav')">
                <NuxtLink
                    v-for="link in links"
                    :key="link.to"
                    :to="link.to"
                    class="px-2 py-1 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide"
                    :class="route.path === link.to ? 'text-tide underline underline-offset-4' : 'text-mist'"
                >
                    {{ link.label }}
                </NuxtLink>
            </nav>
        </header>
        <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6">
            <slot />
        </main>
    </div>
</template>
