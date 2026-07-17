<script lang="ts">
	import { tick } from 'svelte';
	import { renderMarkdown } from '$lib/utils/markdown';
	import { settings, updateSettings } from '$lib/stores/settings';

	interface Props {
		value: string;
		placeholder?: string;
		rows?: number;
		/** Fill the height of the parent container instead of sizing off `rows`, and disable manual resize. */
		expand?: boolean;
	}

	let { value = $bindable(), placeholder = '', rows = 10, expand = false }: Props = $props();

	const MIN_FONT_SIZE = 12;
	const MAX_FONT_SIZE = 24;

	function adjustFontSize(delta: number) {
		const next = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, $settings.editorFontSize + delta));
		updateSettings({ editorFontSize: next });
	}

	let tab = $state<'write' | 'preview'>('write');
	let html = $derived(renderMarkdown(value));
	let textareaEl: HTMLTextAreaElement | undefined;

	async function focusSelection(start: number, end: number) {
		await tick();
		textareaEl?.focus();
		textareaEl?.setSelectionRange(start, end);
	}

	/** Wraps the selection in `before`/`after` markers, or inserts `placeholder` between them if nothing is selected. */
	function wrapSelection(before: string, after: string, placeholder: string) {
		const el = textareaEl;
		if (!el) return;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = value.slice(start, end) || placeholder;
		value = value.slice(0, start) + before + selected + after + value.slice(end);
		focusSelection(start + before.length, start + before.length + selected.length);
	}

	/** Prepends `prefix` to every line touched by the selection (or the current line). */
	function prefixLines(prefix: string) {
		const el = textareaEl;
		if (!el) return;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const lineStart = value.lastIndexOf('\n', start - 1) + 1;
		const lineEnd = value.indexOf('\n', end) === -1 ? value.length : value.indexOf('\n', end);
		const block = value.slice(lineStart, lineEnd);
		const prefixed = block
			.split('\n')
			.map((line) => prefix + line)
			.join('\n');
		value = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
		focusSelection(lineStart, lineStart + prefixed.length);
	}

	function insertLink() {
		const el = textareaEl;
		if (!el) return;
		const url = window.prompt('Link URL', 'https://');
		if (!url) return;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const label = value.slice(start, end) || 'link text';
		const inserted = `[${label}](${url})`;
		value = value.slice(0, start) + inserted + value.slice(end);
		focusSelection(start + inserted.length, start + inserted.length);
	}

	function onKeydown(e: KeyboardEvent) {
		if (!(e.metaKey || e.ctrlKey)) return;
		if (e.key === 'b') {
			e.preventDefault();
			wrapSelection('**', '**', 'bold text');
		} else if (e.key === 'i') {
			e.preventDefault();
			wrapSelection('_', '_', 'italic text');
		}
	}

	const toolbarActions = [
		{
			label: 'B',
			title: 'Bold',
			class: 'font-bold',
			action: () => wrapSelection('**', '**', 'bold text')
		},
		{
			label: 'I',
			title: 'Italic',
			class: 'italic',
			action: () => wrapSelection('_', '_', 'italic text')
		},
		{ label: 'H1', title: 'Heading', class: '', action: () => prefixLines('# ') },
		{ label: 'H2', title: 'Subheading', class: '', action: () => prefixLines('## ') },
		{ label: 'H3', title: 'Subheading', class: '', action: () => prefixLines('### ') },
		{ label: '• List', title: 'Bullet list', class: '', action: () => prefixLines('- ') },
		{ label: '1. List', title: 'Numbered list', class: '', action: () => prefixLines('1. ') },
		{ label: '” Quote', title: 'Quote', class: '', action: () => prefixLines('> ') },
		{
			label: '</>',
			title: 'Inline code',
			class: 'font-mono',
			action: () => wrapSelection('`', '`', 'code')
		},
		{ label: '🔗', title: 'Link', class: '', action: insertLink }
	];
</script>

<div class="flex {expand ? 'h-full min-h-0' : ''} flex-col rounded-lg border border-border">
	<div class="flex border-b border-border bg-surface-raised">
		<button
			type="button"
			onclick={() => (tab = 'write')}
			class="flex-1 px-3 py-2 text-sm font-medium {tab === 'write'
				? 'border-b-2 border-accent text-accent'
				: 'text-text-secondary'}"
		>
			Write
		</button>
		<button
			type="button"
			onclick={() => (tab = 'preview')}
			class="flex-1 px-3 py-2 text-sm font-medium {tab === 'preview'
				? 'border-b-2 border-accent text-accent'
				: 'text-text-secondary'}"
		>
			Preview
		</button>
	</div>

	<div
		class="{tab === 'write'
			? expand
				? 'flex min-h-0 flex-1 flex-col'
				: 'block'
			: 'hidden'}"
	>
		<div class="flex gap-1 overflow-x-auto border-b border-border bg-surface-raised p-1.5">
			{#each toolbarActions as action (action.label)}
				<button
					type="button"
					title={action.title}
					aria-label={action.title}
					onclick={action.action}
					class="min-w-8 rounded-md px-2 py-1 text-sm whitespace-nowrap text-text-secondary hover:bg-border/40 hover:text-text-primary {action.class}"
				>
					{action.label}
				</button>
			{/each}
			<div class="ml-auto flex items-center gap-1">
				<button
					type="button"
					title="Decrease font size"
					aria-label="Decrease font size"
					onclick={() => adjustFontSize(-1)}
					disabled={$settings.editorFontSize <= MIN_FONT_SIZE}
					class="min-w-8 rounded-md px-2 py-1 text-sm whitespace-nowrap text-text-secondary hover:bg-border/40 hover:text-text-primary disabled:opacity-40"
				>
					A-
				</button>
				<span class="w-6 text-center text-xs text-text-secondary">{$settings.editorFontSize}</span>
				<button
					type="button"
					title="Increase font size"
					aria-label="Increase font size"
					onclick={() => adjustFontSize(1)}
					disabled={$settings.editorFontSize >= MAX_FONT_SIZE}
					class="min-w-8 rounded-md px-2 py-1 text-sm whitespace-nowrap text-text-secondary hover:bg-border/40 hover:text-text-primary disabled:opacity-40"
				>
					A+
				</button>
			</div>
		</div>
		<textarea
			bind:this={textareaEl}
			bind:value
			{placeholder}
			rows={expand ? undefined : rows}
			onkeydown={onKeydown}
			style="font-size: {$settings.editorFontSize}px"
			class="w-full bg-surface p-3 font-mono text-text-primary focus:outline-none {expand
				? 'min-h-0 flex-1 resize-none'
				: 'resize-y'}"
		></textarea>
	</div>
	<div class={tab === 'preview' ? 'block' : 'hidden'}>
		{#if html}
			<div
				class="prose max-w-none p-3"
				style="font-size: {$settings.editorFontSize}px; line-height: 1.7"
			>
				<!-- Content is authored locally by this browser's own user and never leaves the device — no multi-tenant XSS surface. -->
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html html}
			</div>
		{:else}
			<p class="p-3 text-sm text-text-secondary italic">Nothing to preview yet.</p>
		{/if}
	</div>
</div>
