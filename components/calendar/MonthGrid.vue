<script setup>
import {
    addDays,
    differenceInCalendarDays,
    eachDayOfInterval,
    endOfDay,
    endOfMonth,
    endOfWeek,
    format,
    isSameMonth,
    isToday,
    isWithinInterval,
    startOfDay,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import { useI18n } from 'vue-i18n';
import { dateLocale, formatBookingRange } from '@/composables/useDateFormat';

const props = defineProps({
    month: { type: Date, required: true },
    bookings: { type: Array, default: () => [] },
});
const emit = defineEmits(['select']);
const { t } = useI18n();
const weekdayLabels = computed(() => {
    const monday = new Date(2026, 0, 5);
    return Array.from({ length: 7 }, (_, index) => format(addDays(monday, index), 'EEEEEE', { locale: dateLocale() }));
});
const weeks = computed(() => {
    const start = startOfWeek(startOfMonth(props.month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(props.month), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const rows = [];
    for (let index = 0; index < days.length; index += 7) rows.push(days.slice(index, index + 7));
    return rows;
});
function weekSegments(week) {
    const weekStart = startOfDay(week[0]);
    const weekEnd = endOfDay(week[6]);
    const items = props.bookings
        .filter((booking) => new Date(booking.start) <= weekEnd && new Date(booking.end) >= weekStart)
        .map((booking) => {
            const start = new Date(Math.max(new Date(booking.start).getTime(), weekStart.getTime()));
            const end = new Date(Math.min(new Date(booking.end).getTime(), weekEnd.getTime()));
            const startCol = differenceInCalendarDays(startOfDay(start), weekStart);
            const endCol = differenceInCalendarDays(startOfDay(end), weekStart);
            return {
                booking,
                startCol,
                span: Math.max(1, endCol - startCol + 1),
                lane: 0,
            };
        })
        .sort((a, b) => a.startCol - b.startCol || b.span - a.span);
    const laneEnds = [];
    for (const item of items) {
        let lane = laneEnds.findIndex((endCol) => endCol <= item.startCol);
        if (lane === -1) {
            lane = laneEnds.length;
            laneEnds.push(item.startCol + item.span);
        } else {
            laneEnds[lane] = item.startCol + item.span;
        }
        item.lane = lane;
    }
    const lanes = [];
    for (const item of items) {
        lanes[item.lane] ||= [];
        lanes[item.lane].push(item);
    }
    return lanes;
}
function live(booking) {
    return isWithinInterval(new Date(), { start: new Date(booking.start), end: new Date(booking.end) });
}
const barTop = 36;
const barPitch = 18;
function weekHeight(week) {
    const lanes = weekSegments(week).length;
    return Math.max(84, barTop + (lanes * barPitch) + 8);
}
function barStyle(segment) {
    return {
        top: `${barTop + (segment.lane * barPitch)}px`,
        left: `calc(${segment.startCol} * 100% / 7 + 3px)`,
        width: `calc(${segment.span} * 100% / 7 - 6px)`,
        backgroundColor: segment.booking.boatColor,
    };
}
function label(booking) {
    const when = formatBookingRange(booking);
    const state = live(booking) ? t('calendar.liveToday') : '';
    return t('calendar.barLabel', {
        state, boat: booking.boatName, member: booking.memberName, when,
    });
}
</script>

<template>
    <section :aria-label="format(month, 'LLLL yyyy', { locale: dateLocale() })">
        <h2 class="mb-3 text-lg font-bold capitalize text-ink">
            {{ format(month, 'LLLL yyyy', { locale: dateLocale() }) }}
        </h2>
        <div class="overflow-hidden rounded-sm border border-line bg-white">
            <div class="grid grid-cols-7 border-b border-line bg-foam text-center text-xs font-bold text-faint" aria-hidden="true">
                <span v-for="day in weekdayLabels" :key="day" class="py-1.5">{{ day }}</span>
            </div>
            <div
                v-for="(week, weekIndex) in weeks"
                :key="week[0].toISOString()"
                class="relative"
                :style="{ height: `${weekHeight(week)}px` }"
            >
                <div class="absolute inset-0 grid grid-cols-7">
                    <div
                        v-for="(day, dayIndex) in week"
                        :key="day.toISOString()"
                        class="border-line px-1 pt-1"
                        :class="[
                            weekIndex < weeks.length - 1 ? 'border-b' : '',
                            dayIndex < 6 ? 'border-r' : '',
                            isSameMonth(day, month) ? 'bg-white' : 'bg-foam',
                        ]"
                    >
                        <span
                            class="inline-flex size-5 items-center justify-center rounded-full text-xs"
                            :class="isToday(day) ? 'bg-tide font-bold text-white' : (isSameMonth(day, month) ? 'text-body' : 'text-wash')"
                        >
                            {{ format(day, 'd') }}
                        </span>
                    </div>
                </div>
                <UTooltip
                    v-for="segment in weekSegments(week).flat()"
                    :key="segment.booking.id"
                    :text="label(segment.booking)"
                    :delay-duration="250"
                >
                    <button
                        type="button"
                        class="absolute z-10 h-4 truncate rounded-sm px-1 text-left text-[11px] font-medium leading-4 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink"
                        :class="live(segment.booking) ? 'ring-1 ring-ink ring-offset-1' : ''"
                        :style="barStyle(segment)"
                        :aria-label="label(segment.booking)"
                        @click="emit('select', segment.booking)"
                    >
                        <span v-if="live(segment.booking)" class="sr-only">{{ t('calendar.liveShort') }}</span>
                        {{ segment.booking.boatName }}, {{ segment.booking.memberName }}
                    </button>
                </UTooltip>
            </div>
        </div>
    </section>
</template>
