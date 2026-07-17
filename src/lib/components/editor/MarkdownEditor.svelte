<script lang="ts">
	import { tick } from 'svelte';
	import { renderMarkdown } from '$lib/utils/markdown';

	interface Props {
		value: string;
		placeholder?: string;
		rows?: number;
	}

	let { value = $bindable(), placeholder = '', rows = 10 }: Props = $props();

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

<div class="rounded-lg border border-border">
	<div class="flex border-b border-border bg-surface-raised md:hidden">
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

	<div class="md:grid md:grid-cols-2">
		<div class="{tab === 'write' ? 'block' : 'hidden'} md:block md:border-r md:border-border">
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
			</div>
			<textarea
				bind:this={textareaEl}
				bind:value
				{placeholder}
				{rows}
				onkeydown={onKeydown}
				class="w-full resize-y bg-surface p-3 font-mono text-sm text-text-primary focus:outline-none"
			></textarea>
		</div>
		<div class="{tab === 'preview' ? 'block' : 'hidden'} md:block">
			{#if html}
				<div class="prose max-w-none p-3" style="font-size: 1rem; line-height: 1.7">
					<!-- Content is authored locally by this browser's own user and never leaves the device — no multi-tenant XSS surface. -->
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html html}
				</div>
			{:else}
				<p class="p-3 text-sm text-text-secondary italic">Nothing to preview yet.</p>
			{/if}
		</div>
	</div>
</div>
