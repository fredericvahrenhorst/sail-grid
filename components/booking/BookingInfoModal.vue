<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const open = defineModel('open', { required: true });
defineProps({
    html: { type: String, default: '' },
});
</script>

<template>
    <UModal v-model:open="open" :title="t('calendar.howToBook')">
        <template #body>
            <div
                v-if="html"
                class="text-sm [&_a]:text-tide [&_a]:underline [&_h2]:my-2 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:my-1.5 [&_h3]:text-lg [&_h3]:font-bold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
                v-html="html"
            />
            <p v-else class="text-sm text-mist">
                keine Angaben
            </p>
        </template>
    </UModal>
</template>
