<script lang="ts">
	import { renderMarkdown } from '$lib/utils/markdown';

	interface Props {
		value: string;
		placeholder?: string;
		rows?: number;
	}

	let { value = $bindable(), placeholder = '', rows = 10 }: Props = $props();

	let tab = $state<'write' | 'preview'>('write');
	let html = $derived(renderMarkdown(value));
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
			<textarea
				bind:value
				{placeholder}
				{rows}
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
