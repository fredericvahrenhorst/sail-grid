<script setup>
import { useI18n } from 'vue-i18n';
import { useSiteSettings } from '@/composables/useSiteSettings';
import useCalendarStore from '@/stores/calendar';

const { t } = useI18n();
const { siteName, clubName } = useSiteSettings();
const route = useRoute();
const embed = computed(() => route.query.embed === 'true');
const calendar = useCalendarStore();
const {
    loggedIn, user, fetch: fetchSession, clear: clearUserSession,
} = useUserSession();
const isAdmin = computed(() => Boolean(loggedIn.value && user.value?.admin));
onMounted(() => {
    fetchSession();
});
async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' });
    await clearUserSession();
    calendar.createOpen = false;
}
</script>

<template>
    <div class="min-h-screen bg-harbor font-sans text-body">
        <header v-if="!embed" class="border-b border-line bg-foam/90">
            <div class="mx-auto flex max-w-6xl items-end justify-between gap-6 px-4 py-5 sm:px-6">
                <div>
                    <p class="font-brand font-semibold text-3xl leading-none tracking-tight text-ink sm:text-4xl">
                        <NuxtLink to="/" class="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tide">
                            {{ siteName }}
                        </NuxtLink>
                    </p>
                    <p class="mt-2 max-w-md text-sm text-mist">
                        {{ clubName || t('calendar.tagline') }}
                    </p>
                </div>
                <div class="flex items-center gap-4">
                    <button
                        v-if="isAdmin"
                        type="button"
                        class="text-sm font-bold text-tide underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tide"
                        @click="calendar.createOpen = true"
                    >
                        {{ t('nav.addBooking') }}
                    </button>
                    <NuxtLink
                        to="/admin"
                        class="text-sm font-bold text-tide underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tide"
                    >
                        {{ t('nav.admin') }}
                    </NuxtLink>
                    <button
                        v-if="isAdmin"
                        type="button"
                        class="text-sm font-bold text-tide underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tide"
                        @click="logout"
                    >
                        {{ t('nav.logout') }}
                    </button>
                </div>
            </div>
        </header>
        <main :class="embed ? 'px-3 py-3 sm:px-4' : 'mx-auto max-w-6xl px-4 py-6 sm:px-6'">
            <h1 v-if="embed" class="sr-only">
                {{ t('calendar.srTitle', { name: siteName }) }}
            </h1>
            <slot />
        </main>
    </div>
</template>
