/**
 * Öffentlicher Kalender: Boote, die zwei sichtbaren Monate und der Hinweistext.
 * Der Filter steht in ?boatId=, damit ein iFrame direkt ein Boot öffnen kann.
 */
import { defineStore } from 'pinia';
import {
    addMonths, endOfMonth, format, startOfMonth,
} from 'date-fns';
import { dateLocale } from '@/composables/useDateFormat';

let bookingsSerial = 0;
let querySerial = 0;
let queryApplied = 0;
let queryChain = Promise.resolve();

function boatIdFromQuery(query) {
    return typeof query.boatId === 'string' ? query.boatId : '';
}

export default defineStore('calendar', {
    state: () => ({
        cursor: startOfMonth(new Date()),
        boatId: '',
        boats: [],
        bookings: [],
        settings: null,
        status: 'pending',
        selected: null,
        detailOpen: false,
        createOpen: false,
        infoOpen: false,
        copied: false,
    }),
    getters: {
        leftMonth(state) {
            return state.cursor;
        },
        rightMonth(state) {
            return addMonths(state.cursor, 1);
        },
        selectedBoat(state) {
            return state.boats.find((boat) => boat.id === state.boatId) || null;
        },
        visibleBookings(state) {
            if (!state.boatId) return state.bookings;
            return state.bookings.filter((booking) => booking.boatId === state.boatId);
        },
        emptyLabel() {
            const { $i18n } = useNuxtApp();
            if (this.selectedBoat) return $i18n.t('calendar.emptyBoat', { name: this.selectedBoat.name });
            return $i18n.t('calendar.empty');
        },
        monthItems() {
            return Array.from({ length: 12 }, (_, index) => ({
                label: format(new Date(2026, index, 1), 'LLLL', { locale: dateLocale() }),
                value: String(index),
            }));
        },
        yearItems() {
            const year = new Date().getFullYear();
            return Array.from({ length: 6 }, (_, index) => {
                const value = String(year - 1 + index);
                return { label: value, value };
            });
        },
    },
    actions: {
        async loadBookings() {
            const serial = bookingsSerial + 1;
            bookingsSerial = serial;
            const { cursor } = this;
            const bookings = await $fetch('/api/bookings', {
                query: {
                    from: startOfMonth(cursor).toISOString(),
                    to: endOfMonth(addMonths(cursor, 1)).toISOString(),
                },
            });
            if (serial !== bookingsSerial) return;
            this.bookings = bookings;
        },
        async start() {
            const route = useRoute();
            this.boatId = boatIdFromQuery(route.query);
            const [boatList, setting] = await Promise.all([
                $fetch('/api/boats'),
                $fetch('/api/settings'),
            ]);
            this.boats = boatList;
            this.settings = setting;
            await this.loadBookings();
            this.status = 'ready';
        },
        shift(months) {
            this.cursor = startOfMonth(addMonths(this.cursor, months));
        },
        setMonth(value) {
            const next = new Date(this.cursor);
            next.setMonth(Number(value));
            this.cursor = startOfMonth(next);
        },
        setYear(value) {
            this.cursor = startOfMonth(new Date(Number(value), this.cursor.getMonth(), 1));
        },
        goToday() {
            this.cursor = startOfMonth(new Date());
        },
        selectBoat(id) {
            const next = id || '';
            if (next === this.boatId) return;
            this.boatId = next;
            const route = useRoute();
            const router = useRouter();
            const serial = querySerial + 1;
            querySerial = serial;
            queryChain = queryChain.then(async() => {
                if (serial !== querySerial) return;
                const current = boatIdFromQuery(route.query);
                if (current === this.boatId) {
                    queryApplied = serial;
                    return;
                }
                const query = { ...route.query };
                if (this.boatId) query.boatId = this.boatId;
                else delete query.boatId;
                try {
                    await router.replace({ path: route.path, query });
                } catch (error) {
                    // A newer click replaces this navigation.
                    if (serial !== querySerial) return;
                    if (error) queryApplied = serial;
                    return;
                }
                if (serial === querySerial) queryApplied = serial;
            });
        },
        applyBoatFromRoute(route) {
            if (querySerial !== queryApplied) return;
            const next = boatIdFromQuery(route.query);
            if (next !== this.boatId) this.boatId = next;
        },
        openBooking(booking) {
            this.selected = booking;
            this.detailOpen = true;
        },
        async copyShare() {
            if (!this.selectedBoat) return;
            const route = useRoute();
            const runtime = useRuntimeConfig();
            const url = new URL(runtime.public.baseUrl || window.location.origin);
            url.searchParams.set('boatId', this.selectedBoat.id);
            if (route.query.embed === 'true') url.searchParams.set('embed', 'true');
            const text = url.toString();
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                const field = document.createElement('textarea');
                field.value = text;
                field.setAttribute('readonly', '');
                field.style.position = 'fixed';
                field.style.left = '-9999px';
                document.body.appendChild(field);
                field.select();
                document.execCommand('copy');
                field.remove();
            }
            this.copied = true;
            setTimeout(() => { this.copied = false; }, 1600);
        },
    },
});
