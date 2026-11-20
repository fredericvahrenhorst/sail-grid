<script setup>
import { useI18n } from 'vue-i18n';
import { readError } from '@/composables/readError';

const open = defineModel('open', { required: true });
const props = defineProps({
    boat: { type: Object, default: null },
});
const emit = defineEmits(['saved']);
const { t } = useI18n();
const palette = ['#0f766e', '#b45309', '#1d4ed8', '#be123c', '#0369a1', '#3f6212', '#9a3412'];
const pending = ref(false);
const error = ref('');
const form = reactive({
    name: '',
    description: '',
    imageUrl: '',
    color: palette[0],
    active: true,
});
watch(open, (isOpen) => {
    if (!isOpen) return;
    error.value = '';
    form.name = props.boat?.name || '';
    form.description = props.boat?.description || '';
    form.imageUrl = props.boat?.imageUrl || '';
    form.color = props.boat?.color || palette[0];
    form.active = props.boat?.active ?? true;
});
async function save() {
    error.value = '';
    pending.value = true;
    try {
        if (props.boat) {
            await $fetch(`/api/boats/${props.boat.id}`, { method: 'PUT', body: form });
            emit('saved', t('boats.saved'));
        } else {
            await $fetch('/api/boats', { method: 'POST', body: form });
            emit('saved', t('boats.created'));
        }
        open.value = false;
    } catch (cause) {
        error.value = readError(cause).message;
    } finally {
        pending.value = false;
    }
}
</script>

<template>
    <UModal v-model:open="open" :title="boat ? t('boats.editTitle') : t('boats.createTitle')">
        <template #body>
            <form id="boat-form" class="space-y-3" @submit.prevent="save">
                <UFormField :label="t('boats.name')" required>
                    <UInput v-model="form.name" class="w-full" required maxlength="120" />
                </UFormField>
                <UFormField :label="t('boats.description')">
                    <UTextarea v-model="form.description" class="w-full" :rows="3" />
                </UFormField>
                <UFormField :label="t('boats.imageUrl')" :help="t('boats.imageHelp')">
                    <UInput v-model="form.imageUrl" class="w-full" type="url" placeholder="https://" />
                </UFormField>
                <UFormField :label="t('boats.color')">
                    <div class="flex flex-wrap items-center gap-2">
                        <button
                            v-for="color in palette"
                            :key="color"
                            type="button"
                            class="h-7 w-7 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                            :class="form.color === color ? 'outline outline-2 outline-offset-2 outline-ink' : ''"
                            :style="{ backgroundColor: color }"
                            :aria-label="t('boats.swatch', { color })"
                            @click="form.color = color"
                        />
                        <input v-model="form.color" type="color" :aria-label="t('boats.customColor')" class="h-7 w-8 shrink-0 border-0 bg-transparent p-0">
                    </div>
                </UFormField>
                <UCheckbox v-model="form.active" :label="t('boats.activeInCalendar')" />
                <p v-if="error" class="text-sm font-bold text-danger" role="alert">{{ error }}</p>
            </form>
        </template>
        <template #footer>
            <UButton type="submit" form="boat-form" :loading="pending">
                {{ t('booking.save') }}
            </UButton>
        </template>
    </UModal>
</template>
