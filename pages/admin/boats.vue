<script setup>
import { useI18n } from 'vue-i18n';
import { readError } from '@/composables/readError';

definePageMeta({ layout: 'admin', middleware: 'admin' });
const { t } = useI18n();
const { data: boats, refresh } = await useFetch('/api/boats/all');
const order = ref([]);
const open = ref(false);
const current = ref(null);
const notice = ref('');
const dragFrom = ref(null);
const dragOver = ref(null);
watch(boats, (value) => {
    order.value = value ? value.slice() : [];
}, { immediate: true });
function create() {
    current.value = null;
    open.value = true;
}
function edit(boat) {
    current.value = boat;
    open.value = true;
}
function onDragStart(index, event) {
    dragFrom.value = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
}
function onDragOver(index, event) {
    event.preventDefault();
    dragOver.value = index;
}
function onDragEnd() {
    dragFrom.value = null;
    dragOver.value = null;
}
async function onDrop(index) {
    const from = dragFrom.value;
    onDragEnd();
    if (from === null || from === index) return;
    const next = order.value.slice();
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    order.value = next;
    try {
        await $fetch('/api/boats/reorder', { method: 'POST', body: { ids: next.map((boat) => boat.id) } });
        notice.value = t('boats.orderSaved');
        await refresh();
    } catch (cause) {
        notice.value = readError(cause).message;
        await refresh();
    }
}
async function remove(boat) {
    const ok = window.confirm(t('boats.removeConfirm', { name: boat.name }));
    if (!ok) return;
    const result = await $fetch(`/api/boats/${boat.id}`, { method: 'DELETE' });
    notice.value = result.archived
        ? t('boats.archivedNotice', { name: boat.name })
        : t('boats.deletedNotice', { name: boat.name });
    await refresh();
}
async function saved(message) {
    notice.value = message;
    await refresh();
}
</script>

<template>
    <div>
        <div class="flex items-end justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-ink">{{ t('boats.title') }}</h1>
                <p class="mt-2 text-sm text-mist">{{ t('boats.intro') }}</p>
            </div>
            <UButton @click="create">{{ t('boats.create') }}</UButton>
        </div>
        <p v-if="notice" class="mt-4 text-sm font-bold text-tide">{{ notice }}</p>
        <table class="mt-6 w-full text-left text-sm">
            <thead class="text-xs uppercase tracking-wide text-faint">
                <tr>
                    <th class="py-2"><span class="sr-only">{{ t('boats.order') }}</span></th>
                    <th class="py-2">{{ t('boats.name') }}</th>
                    <th class="py-2">{{ t('boats.status') }}</th>
                    <th class="py-2"><span class="sr-only">{{ t('boats.actions') }}</span></th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(boat, index) in order"
                    :key="boat.id"
                    class="border-t border-line"
                    :class="dragOver === index ? 'bg-sea' : ''"
                    @dragover="onDragOver(index, $event)"
                    @drop="onDrop(index)"
                >
                    <td class="w-8 py-3">
                        <button
                            type="button"
                            draggable="true"
                            class="cursor-grab text-faint active:cursor-grabbing"
                            :aria-label="t('boats.reorder', { name: boat.name })"
                            @dragstart="onDragStart(index, $event)"
                            @dragend="onDragEnd"
                        >
                            <UIcon name="i-lucide-grip-vertical" class="size-4" />
                        </button>
                    </td>
                    <td class="py-3">
                        <span class="mr-2 inline-block h-3 w-3 align-middle" :style="{ backgroundColor: boat.color }" />
                        {{ boat.name }}
                    </td>
                    <td class="py-3">{{ boat.active ? t('boats.active') : t('boats.archived') }}</td>
                    <td class="py-3 text-right">
                        <button type="button" class="mr-3 font-bold text-tide underline" @click="edit(boat)">{{ t('boats.edit') }}</button>
                        <button type="button" class="font-bold text-danger underline" @click="remove(boat)">{{ t('boats.remove') }}</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-if="!order.length" class="mt-4 text-sm text-mist">{{ t('boats.empty') }}</p>
        <AdminBoatForm v-model:open="open" :boat="current" @saved="saved" />
    </div>
</template>
