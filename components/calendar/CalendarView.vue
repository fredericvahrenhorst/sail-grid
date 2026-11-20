<script setup>
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import useCalendarStore from '@/stores/calendar';

const calendar = useCalendarStore();
const {
    cursor,
    boats,
    visibleBookings,
    settings,
    status,
    boatId,
    leftMonth,
    rightMonth,
    selectedBoat,
    emptyLabel,
    monthItems,
    yearItems,
    selected,
    detailOpen,
    createOpen,
    infoOpen,
    copied,
} = storeToRefs(calendar);

const {
    shift, setMonth, setYear, goToday, selectBoat, openBooking, copyShare,
} = calendar;
const showingToday = computed(() => {
    const now = new Date();
    return cursor.value.getFullYear() === now.getFullYear()
        && cursor.value.getMonth() === now.getMonth();
});

const route = useRoute();
watch(() => route.query.boatId, () => {
    calendar.applyBoatFromRoute(route);
});
watch(() => calendar.cursor.getTime(), () => {
    calendar.loadBookings();
});

const { t } = useI18n();
const shareItems = computed(() => {
    if (!selectedBoat.value) return [];
    return [[{
        label: t('calendar.subscribe', { name: selectedBoat.value.name }),
        to: `/api/ics/boat/${selectedBoat.value.id}.ics`,
    }, {
        label: t('calendar.copyLink'),
        onSelect() {
            copyShare();
        },
    }]];
});

onMounted(() => calendar.start());
async function onBookingCreated() {
    await calendar.loadBookings();
}
async function onBookingSaved() {
    const id = calendar.selected?.id;
    await calendar.loadBookings();
    const updated = calendar.bookings.find((item) => item.id === id);
    calendar.selected = updated || null;
    if (!updated) detailOpen.value = false;
}
</script>

<template>
    <div>
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-1" role="group" :aria-label="t('calendar.filterGroup')">
                <span class="mr-1 text-xs font-bold text-mist">{{ t('calendar.filterLabel') }}</span>
                <button
                    type="button"
                    class="rounded-sm px-2 py-0.5 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    :class="boatId ? 'bg-white text-body' : 'bg-ink text-white'"
                    :aria-pressed="!boatId"
                    @click="selectBoat('')"
                >
                    {{ t('calendar.allBoats') }}
                </button>
                <button
                    v-for="boat in boats"
                    :key="boat.id"
                    type="button"
                    class="rounded-sm px-2 py-0.5 text-xs font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    :class="boatId === boat.id ? 'outline outline-2 outline-offset-2 outline-ink' : ''"
                    :style="{ backgroundColor: boat.color }"
                    :aria-pressed="boatId === boat.id"
                    @click="selectBoat(boat.id)"
                >
                    {{ boat.name }}
                </button>
            </div>
            <UButton color="neutral" variant="ghost" size="sm" @click="infoOpen = true">
                {{ t('calendar.howToBook') }}
            </UButton>
        </div>

        <div v-if="selectedBoat" class="mb-3 flex justify-end">
            <UDropdownMenu :items="shareItems" :content="{ align: 'end' }">
                <UButton
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-share-2"
                    trailing-icon="i-lucide-chevron-down"
                >
                    {{ copied ? t('calendar.copied') : t('calendar.share') }}
                </UButton>
            </UDropdownMenu>
        </div>

        <p v-if="status === 'pending'" class="mb-2 text-sm text-mist">
            {{ t('calendar.loading') }}
        </p>
        <p
            v-else-if="visibleBookings.length === 0"
            class="mb-3 flex items-center gap-2 rounded-sm border border-tide/30 bg-foam px-3 py-2 text-sm font-bold text-ink"
            role="status"
        >
            <UIcon name="i-lucide-info" class="size-4 shrink-0 text-tide" aria-hidden="true" />
            {{ emptyLabel }}
        </p>

        <div class="mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-arrow-left"
                square
                :aria-label="t('calendar.prevMonth')"
                @click="shift(-1)"
            />
            <div class="flex flex-wrap items-center justify-center gap-2">
                <USelect
                    :model-value="String(cursor.getMonth())"
                    :items="monthItems"
                    :aria-label="t('calendar.month')"
                    class="w-36"
                    @update:model-value="setMonth"
                />
                <USelect
                    :model-value="String(cursor.getFullYear())"
                    :items="yearItems"
                    :aria-label="t('calendar.year')"
                    class="w-28"
                    @update:model-value="setYear"
                />
                <UButton
                    color="neutral"
                    variant="outline"
                    size="sm"
                    :disabled="showingToday"
                    @click="goToday"
                >
                    {{ t('calendar.today') }}
                </UButton>
            </div>
            <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-arrow-right"
                square
                :aria-label="t('calendar.nextMonth')"
                @click="shift(1)"
            />
        </div>

        <div class="grid items-start gap-8 lg:grid-cols-2">
            <CalendarMonthGrid :key="leftMonth.toISOString()" class="animate-month-rise motion-reduce:animate-none" :month="leftMonth" :bookings="visibleBookings" @select="openBooking" />
            <CalendarMonthGrid :key="rightMonth.toISOString()" class="animate-month-rise motion-reduce:animate-none hidden lg:block" :month="rightMonth" :bookings="visibleBookings" @select="openBooking" />
        </div>

        <p class="mt-3 text-sm text-mist">{{ t('calendar.hint') }}</p>

        <BookingDetailModal v-model:open="detailOpen" :booking="selected" :boats="boats" @saved="onBookingSaved" />
        <AdminBookingForm
            v-model:open="createOpen"
            :boats="boats"
            :initial-boat-id="boatId"
            @saved="onBookingCreated"
        />
        <BookingInfoModal v-model:open="infoOpen" :html="settings?.bookingInfoText || ''" />
    </div>
</template>
