<script setup>
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { useI18n } from 'vue-i18n';
import StarterKit from '@tiptap/starter-kit';

const model = defineModel({ required: true });
const { t } = useI18n();
const linkOpen = ref(false);
const linkDraft = ref('');
const linkError = ref('');
const linkInput = ref(null);
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

async function openLink() {
    const href = editor.value?.getAttributes('link').href || '';
    linkDraft.value = href.replace(/^mailto:/i, '');
    linkError.value = '';
    linkOpen.value = true;
    await nextTick();
    linkInput.value?.focus();
}

function applyLink() {
    const current = editor.value;
    if (!current) return;
    const typed = linkDraft.value.trim();
    if (!typed) {
        current.chain().focus().extendMarkRange('link').unsetLink()
            .run();
        linkOpen.value = false;
        linkError.value = '';
        return;
    }
    const href = normalizeHref(typed);
    if (!href) {
        linkError.value = t('editor.invalidLink');
        return;
    }
    const inLink = current.isActive('link');
    if (current.state.selection.empty && !inLink) {
        const label = typed.replace(/^mailto:/i, '');
        current.chain().focus().insertContent({
            type: 'text',
            text: label,
            marks: [{ type: 'link', attrs: { href } }],
        }).run();
    } else {
        current.chain().focus().extendMarkRange('link').setLink({ href })
            .run();
    }
    linkOpen.value = false;
    linkError.value = '';
}

function removeLink() {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink()
        .run();
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
            <button
                type="button"
                class="underline"
                :class="{ 'font-bold text-tide': editor.isActive('link') }"
                @mousedown.prevent
                @click="openLink"
            >
                Link
            </button>
        </div>
        <div v-if="linkOpen" class="flex flex-wrap items-center gap-2">
            <input
                ref="linkInput"
                v-model="linkDraft"
                type="text"
                :placeholder="t('editor.placeholder')"
                class="min-w-64 flex-1 rounded-sm border border-line bg-white px-2 py-1 text-sm"
                @keydown.enter.prevent="applyLink"
            >
            <button type="button" class="font-bold underline" @mousedown.prevent @click="applyLink">{{ t('editor.apply') }}</button>
            <button v-if="editor?.isActive('link')" type="button" class="underline" @mousedown.prevent @click="removeLink">{{ t('editor.remove') }}</button>
        </div>
        <p v-if="linkError" class="text-sm font-bold text-danger" role="alert">{{ linkError }}</p>
        <EditorContent :editor="editor" />
    </div>
</template>
