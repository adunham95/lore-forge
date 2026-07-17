<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		action?: Snippet;
	}

	let { title, description, action }: Props = $props();
</script>

<div
	class="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center"
>
	<p class="font-serif text-xl">{title}</p>
	{#if description}
		<p class="max-w-sm text-sm text-text-secondary">{description}</p>
	{/if}
	{#if action}
		{@render action()}
	{/if}
</div>
