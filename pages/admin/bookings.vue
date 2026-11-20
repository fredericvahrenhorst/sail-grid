<script setup>
import { addDays } from 'date-fns';
import { useI18n } from 'vue-i18n';
import { readError } from '@/composables/readError';
import { formatBookingRange } from '@/composables/useDateFormat';

definePageMeta({ layout: 'admin', middleware: 'admin' });
const { t } = useI18n();
const from = addDays(new Date(), -60).toISOString();
const to = addDays(new Date(), 400).toISOString();
const { data: boats } = await useFetch('/api/boats/all');
const { data: bookings, error, refresh } = await useFetch('/api/bookings', {
    query: { from, to },
});
const open = ref(false);
const current = ref(null);
const notice = ref('');
function create() {
    current.value = null;
    open.value = true;
}
function edit(booking) {
    current.value = booking;
    open.value = true;
}
async function remove(booking) {
    if (!window.confirm(t('booking.confirmDelete'))) return;
    await $fetch(`/api/bookings/${booking.id}`, { method: 'DELETE' });
    notice.value = t('booking.deleted');
    await refresh();
}
async function saved() {
    notice.value = t('booking.saved');
    await refresh();
}
async function deleted() {
    notice.value = t('booking.deleted');
    await refresh();
}
</script>

<template>
    <div>
        <div class="flex items-end justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-ink">{{ t('bookings.title') }}</h1>
                <p class="mt-2 text-sm text-mist">{{ t('bookings.intro') }}</p>
            </div>
            <UButton @click="create">{{ t('bookings.create') }}</UButton>
        </div>
        <p v-if="notice" class="mt-4 text-sm font-bold text-tide">{{ notice }}</p>
        <p v-if="error" class="mt-4 text-sm font-bold text-danger">{{ readError(error).message }}</p>
        <table class="mt-6 w-full text-left text-sm">
            <thead class="text-xs uppercase tracking-wide text-faint">
                <tr>
                    <th class="py-2">{{ t('booking.boat') }}</th>
                    <th class="py-2">{{ t('bookings.who') }}</th>
                    <th class="py-2">{{ t('booking.range') }}</th>
                    <th class="py-2"><span class="sr-only">{{ t('boats.actions') }}</span></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="booking in bookings" :key="booking.id" class="border-t border-line">
                    <td class="py-3">{{ booking.boatName }}</td>
                    <td class="py-3">{{ booking.memberName }}</td>
                    <td class="py-3">{{ formatBookingRange(booking) }}</td>
                    <td class="py-3 text-right">
                        <button type="button" class="mr-3 font-bold text-tide underline" @click="edit(booking)">{{ t('boats.edit') }}</button>
                        <button type="button" class="font-bold text-danger underline" @click="remove(booking)">{{ t('booking.delete') }}</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-if="!error && !bookings?.length" class="mt-4 text-sm text-mist">{{ t('bookings.empty') }}</p>
        <AdminBookingForm
            v-model:open="open"
            :boats="boats || []"
            :booking="current"
            @saved="saved"
            @deleted="deleted"
        />
    </div>
</template>
