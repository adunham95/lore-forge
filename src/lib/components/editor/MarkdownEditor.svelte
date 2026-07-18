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
			title: 'Bold',
			icon: '<path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8Z"/>',
			action: () => wrapSelection('**', '**', 'bold text')
		},
		{
			title: 'Italic',
			icon: '<line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/>',
			action: () => wrapSelection('_', '_', 'italic text')
		},
		{
			title: 'Heading 1',
			icon: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/>',
			action: () => prefixLines('# ')
		},
		{
			title: 'Heading 2',
			icon: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>',
			action: () => prefixLines('## ')
		},
		{
			title: 'Heading 3',
			icon: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 16.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/>',
			action: () => prefixLines('### ')
		},
		{
			title: 'Bullet list',
			icon: '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
			action: () => prefixLines('- ')
		},
		{
			title: 'Numbered list',
			icon: '<line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
			action: () => prefixLines('1. ')
		},
		{
			title: 'Quote',
			icon: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
			action: () => prefixLines('> ')
		},
		{
			title: 'Inline code',
			icon: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
			action: () => wrapSelection('`', '`', 'code')
		}
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

	<div class={tab === 'write' ? (expand ? 'flex min-h-0 flex-1 flex-col' : 'block') : 'hidden'}>
		<div class="flex gap-1 overflow-x-auto border-b border-border bg-surface-raised p-1.5">
			{#each toolbarActions as action (action.title)}
				<button
					type="button"
					title={action.title}
					aria-label={action.title}
					onclick={action.action}
					class="flex size-8 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-border/40 hover:text-text-primary"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="16"
						height="16"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						>{@html action.icon}</svg
					>
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
				: 'resize-y'}"></textarea>
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
