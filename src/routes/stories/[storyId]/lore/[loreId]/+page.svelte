<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { lore, saveLoreEntry, deleteLoreEntry } from '$lib/stores/lore';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import MarkdownEditor from '$lib/components/editor/MarkdownEditor.svelte';

	const storyId = $derived(page.params.storyId as string);
	const loreId = $derived(page.params.loreId as string);
	const entry = $derived($lore.find((l) => l.id === loreId));

	let title = $state('');
	let category = $state('');
	let content = $state('');
	let loadedId = $state<string | undefined>(undefined);

	$effect(() => {
		if (entry && loadedId !== entry.id) {
			title = entry.title;
			category = entry.category;
			content = entry.content;
			loadedId = entry.id;
		}
	});

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!entry || !title.trim()) return;
		await saveLoreEntry({
			...entry,
			title: title.trim(),
			category: category.trim(),
			content,
			updatedAt: nowIso()
		});
	}

	async function removeEntry() {
		if (!entry) return;
		if (confirm(`Delete "${entry.title}"?`)) {
			await deleteLoreEntry(entry.id);
			goto(resolve('/stories/[storyId]/lore', { storyId }));
		}
	}
</script>

<svelte:head><title>{entry?.title ?? 'Lore'}</title></svelte:head>

{#if entry}
	<div class="max-w-3xl">
		<a
			href={resolve('/stories/[storyId]/lore', { storyId })}
			class="mb-4 inline-block text-sm text-text-secondary hover:text-text-primary"
		>
			&larr; Lore
		</a>

		<form class="flex flex-col gap-4" onsubmit={save}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Title</span>
				<input
					bind:value={title}
					required
					class="rounded-md border border-border bg-surface px-3 py-2 text-lg"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Category</span>
				<input bind:value={category} class="rounded-md border border-border bg-surface px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Content</span>
				<MarkdownEditor bind:value={content} placeholder="Write this lore entry in Markdown..." />
			</label>
			<div class="mt-2 flex items-center justify-between">
				<Button variant="danger" type="button" onclick={removeEntry}>Delete Entry</Button>
				<Button type="submit">Save</Button>
			</div>
		</form>
	</div>
{/if}
