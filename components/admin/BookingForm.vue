<script setup>
import { format } from 'date-fns';
import { useI18n } from 'vue-i18n';
import { readError } from '@/composables/readError';
import {
    dateLocale, fromDateInput, fromDateTimeInput, toDateInput, toDateTimeInput,
} from '@/composables/useDateFormat';

const open = defineModel('open', { required: true });
const props = defineProps({
    boats: { type: Array, default: () => [] },
    booking: { type: Object, default: null },
    inline: { type: Boolean, default: false },
    initialBoatId: { type: String, default: '' },
});
const emit = defineEmits(['saved', 'deleted']);
const { t } = useI18n();
const pending = ref(false);
const confirmDelete = ref(false);
const error = ref('');
const conflicts = ref([]);
const force = ref(false);
const form = reactive({
    boatId: '',
    memberName: '',
    notes: '',
    route: '',
    allDay: true,
    start: '',
    end: '',
});
const boatItems = computed(() => props.boats.map((boat) => ({ label: boat.name, value: boat.id })));
watch(open, (isOpen) => {
    if (!isOpen) return;
    error.value = '';
    conflicts.value = [];
    force.value = false;
    confirmDelete.value = false;
    form.boatId = props.booking?.boatId || props.initialBoatId || props.boats[0]?.id || '';
    form.memberName = props.booking?.memberName || '';
    form.notes = props.booking?.notes || '';
    form.route = props.booking?.route || '';
    form.allDay = props.booking?.allDay ?? true;
    const start = props.booking?.start || new Date().toISOString();
    const end = props.booking?.end || new Date().toISOString();
    form.start = form.allDay ? toDateInput(start) : toDateTimeInput(start);
    form.end = form.allDay ? toDateInput(end) : toDateTimeInput(end);
}, { immediate: true });
watch(() => form.allDay, (allDay) => {
    if (!form.start || !form.end) return;
    if (allDay) {
        form.start = form.start.slice(0, 10);
        form.end = form.end.slice(0, 10);
    } else if (form.start.length === 10) {
        form.start = `${form.start}T09:00`;
        form.end = `${form.end.slice(0, 10)}T18:00`;
    }
});
async function save() {
    error.value = '';
    pending.value = true;
    const body = {
        boatId: form.boatId,
        memberName: form.memberName,
        notes: form.notes,
        route: form.route,
        allDay: form.allDay,
        start: form.allDay ? fromDateInput(form.start) : fromDateTimeInput(form.start),
        end: form.allDay ? fromDateInput(form.end, true) : fromDateTimeInput(form.end),
        force: force.value,
    };
    try {
        if (props.booking) await $fetch(`/api/bookings/${props.booking.id}`, { method: 'PUT', body });
        else await $fetch('/api/bookings', { method: 'POST', body });
        open.value = false;
        emit('saved');
    } catch (cause) {
        const parsed = readError(cause);
        if (parsed.overlap) {
            conflicts.value = parsed.conflicts;
            force.value = true;
            error.value = t('booking.overlap');
        } else {
            error.value = parsed.message;
        }
    } finally {
        pending.value = false;
    }
}
function askRemove() {
    confirmDelete.value = true;
}
async function remove() {
    if (!props.booking || pending.value || !confirmDelete.value) return;
    error.value = '';
    pending.value = true;
    try {
        await $fetch(`/api/bookings/${props.booking.id}`, { method: 'DELETE' });
        open.value = false;
        emit('deleted');
    } catch (cause) {
        error.value = readError(cause).message;
    } finally {
        pending.value = false;
    }
}
function conflictLabel(item) {
    const pattern = useRuntimeConfig().public.lang === 'en' ? 'MMM d, HH:mm' : 'd. MMM HH:mm';
    return `${item.memberName}: ${format(new Date(item.start), pattern, { locale: dateLocale() })} – ${format(new Date(item.end), pattern, { locale: dateLocale() })}`;
}
</script>

<template>
    <UModal v-if="!inline" v-model:open="open" :title="booking ? t('booking.editTitle') : t('booking.createTitle')">
        <template #body>
            <form id="booking-form" class="space-y-3" @submit.prevent="save">
                <UFormField :label="t('booking.boat')" required>
                    <USelect v-model="form.boatId" :items="boatItems" class="w-full" />
                </UFormField>
                <UCheckbox v-model="form.allDay" :label="t('booking.allDay')" />
                <div class="grid gap-3 sm:grid-cols-2">
                    <UFormField :label="t('booking.start')" required>
                        <UInput v-model="form.start" :type="form.allDay ? 'date' : 'datetime-local'" required class="w-full" />
                    </UFormField>
                    <UFormField :label="t('booking.end')" required>
                        <UInput v-model="form.end" :type="form.allDay ? 'date' : 'datetime-local'" required class="w-full" />
                    </UFormField>
                </div>
                <UFormField :label="t('booking.member')" required>
                    <UInput v-model="form.memberName" required maxlength="120" class="w-full" />
                </UFormField>
                <UFormField :label="t('booking.route')">
                    <UInput v-model="form.route" maxlength="500" class="w-full" />
                </UFormField>
                <UFormField :label="t('booking.notes')">
                    <UTextarea v-model="form.notes" :rows="3" class="w-full" />
                </UFormField>
                <div v-if="conflicts.length" class="text-sm text-warn">
                    <p class="font-bold">{{ error }}</p>
                    <ul class="mt-1 list-disc pl-4">
                        <li v-for="item in conflicts" :key="item.start + item.memberName">{{ conflictLabel(item) }}</li>
                    </ul>
                </div>
                <p v-else-if="error" class="text-sm font-bold text-danger" role="alert">{{ error }}</p>
            </form>
        </template>
        <template #footer>
            <div class="flex w-full items-center gap-3">
                <p v-if="confirmDelete" class="text-sm font-bold text-danger">{{ t('booking.confirm') }}</p>
                <button
                    v-if="confirmDelete"
                    type="button"
                    class="text-sm font-bold text-danger underline"
                    :disabled="pending"
                    @click="remove"
                >
                    {{ t('booking.confirmYes') }}
                </button>
                <button
                    v-if="confirmDelete"
                    type="button"
                    class="text-sm font-bold text-mist underline"
                    @click="confirmDelete = false"
                >
                    {{ t('booking.confirmNo') }}
                </button>
                <button
                    v-else-if="booking"
                    type="button"
                    class="text-sm font-bold text-danger underline"
                    :disabled="pending"
                    @click="askRemove"
                >
                    {{ t('booking.delete') }}
                </button>
                <UButton type="submit" form="booking-form" :loading="pending" class="ml-auto">
                    {{ force ? t('booking.saveAnyway') : t('booking.save') }}
                </UButton>
            </div>
        </template>
    </UModal>
    <form v-else class="space-y-3" @submit.prevent="save">
        <UFormField :label="t('booking.boat')" required>
            <USelect v-model="form.boatId" :items="boatItems" class="w-full" />
        </UFormField>
        <UCheckbox v-model="form.allDay" :label="t('booking.allDay')" />
        <div class="grid gap-3 sm:grid-cols-2">
            <UFormField :label="t('booking.start')" required>
                <UInput v-model="form.start" :type="form.allDay ? 'date' : 'datetime-local'" required class="w-full" />
            </UFormField>
            <UFormField :label="t('booking.end')" required>
                <UInput v-model="form.end" :type="form.allDay ? 'date' : 'datetime-local'" required class="w-full" />
            </UFormField>
        </div>
        <UFormField :label="t('booking.member')" required>
            <UInput v-model="form.memberName" required maxlength="120" class="w-full" />
        </UFormField>
        <UFormField :label="t('booking.route')">
            <UInput v-model="form.route" maxlength="500" class="w-full" />
        </UFormField>
        <UFormField :label="t('booking.notes')">
            <UTextarea v-model="form.notes" :rows="3" class="w-full" />
        </UFormField>
        <div v-if="conflicts.length" class="text-sm text-warn">
            <p class="font-bold">{{ error }}</p>
            <ul class="mt-1 list-disc pl-4">
                <li v-for="item in conflicts" :key="item.start + item.memberName">{{ conflictLabel(item) }}</li>
            </ul>
        </div>
        <p v-else-if="error" class="text-sm font-bold text-danger" role="alert">{{ error }}</p>
        <div class="flex items-center gap-3">
            <UButton type="submit" :loading="pending">
                {{ force ? t('booking.saveAnyway') : t('booking.save') }}
            </UButton>
            <button type="button" class="text-sm font-bold text-mist underline" @click="open = false">
                {{ t('booking.cancel') }}
            </button>
            <p v-if="confirmDelete" class="ml-auto text-sm font-bold text-danger">{{ t('booking.confirm') }}</p>
            <button
                v-if="confirmDelete"
                type="button"
                class="text-sm font-bold text-danger underline"
                :disabled="pending"
                @click="remove"
            >
                {{ t('booking.confirmYes') }}
            </button>
            <button
                v-if="confirmDelete"
                type="button"
                class="text-sm font-bold text-mist underline"
                @click="confirmDelete = false"
            >
                {{ t('booking.confirmNo') }}
            </button>
            <button
                v-else-if="booking"
                type="button"
                class="ml-auto text-sm font-bold text-danger underline"
                :disabled="pending"
                @click="askRemove"
            >
                {{ t('booking.delete') }}
            </button>
        </div>
    </form>
</template>
