<script setup>
import { useI18n } from 'vue-i18n';
import { formatBookingRange } from '@/composables/useDateFormat';

definePageMeta({ layout: 'admin', middleware: 'admin' });
const { t } = useI18n();
const { data: boats } = await useFetch('/api/boats/all');
const from = new Date();
from.setDate(from.getDate() - 1);
const to = new Date();
to.setDate(to.getDate() + 45);
const { data: bookings } = await useFetch('/api/bookings', {
    query: { from: from.toISOString(), to: to.toISOString() },
});
</script>

<template>
    <div class="space-y-8">
        <div>
            <h1 class="text-2xl font-bold text-ink">{{ t('admin.overview') }}</h1>
            <p class="mt-2 max-w-xl text-sm text-mist">
                {{ t('admin.intro') }}
            </p>
        </div>
        <ul class="space-y-2 text-sm">
            <li><NuxtLink class="font-bold text-tide underline" to="/admin/bookings">{{ t('admin.editBookings') }}</NuxtLink></li>
            <li><NuxtLink class="font-bold text-tide underline" to="/admin/boats">{{ t('admin.editBoats', { count: boats?.length || 0 }) }}</NuxtLink></li>
            <li><NuxtLink class="font-bold text-tide underline" to="/admin/settings">{{ t('admin.editHint') }}</NuxtLink></li>
        </ul>
        <section>
            <h2 class="text-lg font-bold text-ink">{{ t('admin.upcoming') }}</h2>
            <p v-if="!bookings?.length" class="mt-2 text-sm text-mist">{{ t('admin.empty') }}</p>
            <ul v-else class="mt-3 divide-y divide-line">
                <li v-for="booking in bookings" :key="booking.id" class="py-3 text-sm">
                    <p class="font-bold">{{ booking.boatName }} · {{ booking.memberName }}</p>
                    <p class="text-mist">{{ formatBookingRange(booking) }}</p>
                </li>
            </ul>
        </section>
    </div>
</template>
