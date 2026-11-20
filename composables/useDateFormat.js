/**
 * Datumsanzeige und Umwandlung der Admin-Formularfelder.
 * Ganztags-Buchungen laufen von 00:00 bis 23:59 in der lokalen Zeitzone.
 */
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';

export function dateLocale() {
    return useRuntimeConfig().public.lang === 'en' ? enUS : de;
}

export function formatBookingRange(booking) {
    const start = new Date(booking.start);
    const end = new Date(booking.end);
    const locale = dateLocale();
    const pattern = useRuntimeConfig().public.lang === 'en'
        ? 'MMMM d, yyyy'
        : 'd. MMMM yyyy';
    const withTime = useRuntimeConfig().public.lang === 'en'
        ? 'MMMM d, yyyy, HH:mm'
        : 'd. MMMM yyyy, HH:mm';
    const chosen = booking.allDay ? pattern : withTime;
    return `${format(start, chosen, { locale })} – ${format(end, chosen, { locale })}`;
}

export function textOrEmpty(value) {
    return value.trim() ? value : useNuxtApp().$i18n.t('booking.none');
}

export function toDateInput(iso) {
    const date = new Date(iso);
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toDateTimeInput(iso) {
    const date = new Date(iso);
    const pad = (value) => String(value).padStart(2, '0');
    return `${toDateInput(iso)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDateInput(value, end = false) {
    const [year, month, day] = value.split('-').map(Number);
    const date = end
        ? new Date(year, month - 1, day, 23, 59, 59)
        : new Date(year, month - 1, day, 0, 0, 0);
    return date.toISOString();
}

export function fromDateTimeInput(value) {
    return new Date(value).toISOString();
}
