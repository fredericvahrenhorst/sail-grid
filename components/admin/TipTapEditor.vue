<script setup>
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { useI18n } from 'vue-i18n';
import StarterKit from '@tiptap/starter-kit';

const model = defineModel({ required: true });
const { t } = useI18n();
const linkOpen = ref(false);
const linkDraft = ref('');
const linkError = ref('');
const savedRange = ref(null);
const linkField = ref(null);
const editor = useEditor({
    content: model.value,
    extensions: [
        StarterKit.configure({
            heading: { levels: [2, 3] },
            link: {
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
                HTMLAttributes: {
                    rel: 'noopener noreferrer',
                    target: '_blank',
                },
            },
        }),
    ],
    editorProps: {
        attributes: {
            class: 'min-h-40 rounded-sm bg-white px-3 py-2 outline-none [&_a]:text-tide [&_a]:underline [&_h2]:my-1.5 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:my-1.5 [&_h3]:text-lg [&_h3]:font-bold [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5',
        },
    },
    onUpdate: ({ editor: current }) => {
        model.value = current.getHTML();
    },
});
watch(model, (value) => {
    if (!editor.value || editor.value.getHTML() === value) return;
    editor.value.commands.setContent(value, { emitUpdate: false });
});
onBeforeUnmount(() => editor.value?.destroy());

function normalizeHref(value) {
    const raw = String(value || '').trim();
    if (!raw || /\s/.test(raw)) return '';
    if (/^mailto:/i.test(raw)) {
        return raw.slice(7).includes('@') ? raw : '';
    }
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(raw)) return `mailto:${raw}`;
    if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(raw)) return `https://${raw}`;
    return '';
}

async function toggleLink() {
    linkOpen.value = !linkOpen.value;
    if (!linkOpen.value) return;
    await nextTick();
    linkField.value?.$el?.querySelector('input')?.focus();
}

function rememberSelection() {
    const current = editor.value;
    if (!current) return;
    const { from, to } = current.state.selection;
    savedRange.value = { from, to };
    const href = current.getAttributes('link').href || '';
    linkDraft.value = href.replace(/^mailto:/i, '');
    linkError.value = '';
}

function applyLink() {
    const current = editor.value;
    if (!current || !savedRange.value) return;
    const typed = linkDraft.value.trim();
    const chain = current.chain().focus().setTextSelection(savedRange.value);
    if (!typed) {
        chain.extendMarkRange('link').unsetLink().run();
        linkOpen.value = false;
        linkError.value = '';
        return;
    }
    const href = normalizeHref(typed);
    if (!href) {
        linkError.value = t('editor.invalidLink');
        return;
    }
    if (savedRange.value.from === savedRange.value.to) {
        const label = typed.replace(/^mailto:/i, '');
        chain.insertContent({
            type: 'text',
            text: label,
            marks: [{ type: 'link', attrs: { href } }],
        }).run();
    } else {
        chain.extendMarkRange('link').setLink({ href }).run();
    }
    linkOpen.value = false;
    linkError.value = '';
}

function removeLink() {
    const current = editor.value;
    if (!current) return;
    const chain = current.chain().focus();
    if (savedRange.value) chain.setTextSelection(savedRange.value);
    chain.extendMarkRange('link').unsetLink().run();
    linkOpen.value = false;
    linkError.value = '';
}
</script>

<template>
    <div class="space-y-2">
        <div v-if="editor" class="flex flex-wrap gap-2 text-sm">
            <button type="button" class="font-bold underline" @mousedown.prevent @click="editor.chain().focus().toggleBold().run()">{{ t('editor.bold') }}</button>
            <button type="button" class="underline" @mousedown.prevent @click="editor.chain().focus().toggleItalic().run()">{{ t('editor.italic') }}</button>
            <button type="button" class="underline" @mousedown.prevent @click="editor.chain().focus().toggleBulletList().run()">{{ t('editor.list') }}</button>
            <button type="button" class="underline" @mousedown.prevent @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">{{ t('editor.heading') }}</button>
            <div class="relative">
                <button
                    type="button"
                    class="underline"
                    :class="{ 'font-bold text-tide': editor.isActive('link') }"
                    @mousedown.prevent="rememberSelection"
                    @click="toggleLink"
                >
                    {{ t('editor.link') }}
                </button>
                <div
                    v-if="linkOpen"
                    class="absolute top-full left-0 z-20 mt-2 w-72 space-y-3 rounded-sm border border-line bg-white p-3 shadow"
                >
                    <UFormField :label="t('editor.url')">
                        <UInput
                            ref="linkField"
                            v-model="linkDraft"
                            :placeholder="t('editor.placeholder')"
                            class="w-full"
                            @keydown.enter.prevent="applyLink"
                        />
                    </UFormField>
                    <p v-if="linkError" class="text-sm font-bold text-danger" role="alert">{{ linkError }}</p>
                    <div class="flex gap-2">
                        <UButton type="button" size="sm" @click="applyLink">{{ t('editor.apply') }}</UButton>
                        <UButton type="button" size="sm" color="neutral" variant="ghost" @click="removeLink">
                            {{ t('editor.remove') }}
                        </UButton>
                    </div>
                </div>
            </div>
        </div>
        <EditorContent :editor="editor" />
    </div>
</template>
