<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const storyId = $derived(page.params.storyId as string);
	const href = $derived(resolve('/stories/[storyId]/get-started', { storyId }));
</script>

<a
	{href}
	class="block rounded-xl border border-dashed border-border bg-surface p-5 text-center shadow-sm transition hover:border-accent/40 hover:shadow-md"
>
	<p class="font-serif text-xl">Start with a Template</p>
	<p class="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
		Pick a story structure and walk through it act by act to build a plan you can reference while
		writing chapters and scenes.
	</p>
	<span class="mt-4 inline-block text-sm font-medium text-accent">Build Your Outline &rarr;</span>
</a>
