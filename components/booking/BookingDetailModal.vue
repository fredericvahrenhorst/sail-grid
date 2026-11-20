<script setup>
import { format } from 'date-fns';
import { useI18n } from 'vue-i18n';
import { dateLocale, formatBookingRange, textOrEmpty } from '@/composables/useDateFormat';

const open = defineModel('open', { required: true });
const props = defineProps({
    booking: { type: Object, default: null },
    boats: { type: Array, default: () => [] },
});
const emit = defineEmits(['saved']);
const { loggedIn, user, fetch: fetchSession } = useUserSession();
const editing = ref(false);
const isAdmin = computed(() => Boolean(loggedIn.value && user.value?.admin));
const boatChoices = computed(() => {
    const list = props.boats.slice();
    if (props.booking && !list.some((boat) => boat.id === props.booking.boatId)) {
        list.unshift({ id: props.booking.boatId, name: props.booking.boatName });
    }
    return list;
});
const { t } = useI18n();
const createdPattern = computed(() => (useRuntimeConfig().public.lang === 'en'
    ? 'MMMM d, yyyy, HH:mm'
    : 'd. MMMM yyyy, HH:mm'));
const created = computed(() => (props.booking
    ? format(new Date(props.booking.createdAt), createdPattern.value, { locale: dateLocale() })
    : ''));
watch(open, () => {
    editing.value = false;
});
onMounted(() => {
    fetchSession();
});
function saved() {
    emit('saved');
}
function deleted() {
    open.value = false;
    emit('saved');
}
</script>

<template>
    <UModal v-model:open="open" :title="t('booking.title')" :description="booking ? `${booking.boatName}, ${booking.memberName}` : ''">
        <template #body>
            <AdminBookingForm
                v-if="editing && booking"
                v-model:open="editing"
                inline
                :boats="boatChoices"
                :booking="booking"
                @saved="saved"
                @deleted="deleted"
            />
            <dl v-else-if="booking" class="space-y-3 text-sm">
                <div>
                    <dt class="font-bold text-mist">{{ t('booking.boat') }}</dt>
                    <dd>{{ booking.boatName }}</dd>
                </div>
                <div>
                    <dt class="font-bold text-mist">{{ t('booking.range') }}</dt>
                    <dd>{{ formatBookingRange(booking) }}</dd>
                </div>
                <div>
                    <dt class="font-bold text-mist">{{ t('booking.member') }}</dt>
                    <dd>{{ textOrEmpty(booking.memberName) }}</dd>
                </div>
                <div>
                    <dt class="font-bold text-mist">{{ t('booking.notes') }}</dt>
                    <dd class="whitespace-pre-wrap">{{ textOrEmpty(booking.notes) }}</dd>
                </div>
                <div>
                    <dt class="font-bold text-mist">{{ t('booking.route') }}</dt>
                    <dd>{{ textOrEmpty(booking.route) }}</dd>
                </div>
                <div>
                    <dt class="font-bold text-mist">{{ t('booking.created') }}</dt>
                    <dd>{{ created }}</dd>
                </div>
            </dl>
        </template>
        <template #footer>
            <div v-if="booking && !editing" class="flex flex-wrap items-center gap-4">
                <a
                    class="text-sm font-bold text-tide underline"
                    :href="`/api/ics/booking/${booking.id}.ics`"
                >
                    {{ t('booking.ics') }}
                </a>
                <UButton v-if="isAdmin" color="neutral" variant="outline" @click="editing = true">
                    {{ t('booking.edit') }}
                </UButton>
            </div>
        </template>
    </UModal>
</template>
