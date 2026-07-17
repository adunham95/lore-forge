<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { chapters, saveChapter, deleteChapter } from '$lib/stores/chapters';
	import { scenes, saveScene } from '$lib/stores/scenes';
	import { byOrder } from '$lib/utils/sort';
	import { newId } from '$lib/utils/id';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ChapterSection from '$lib/components/chapter/ChapterSection.svelte';

	const storyId = $derived(page.params.storyId as string);
	let sortedChapters = $derived(byOrder($chapters));

	function scenesFor(chapterId: string) {
		return byOrder($scenes.filter((s) => s.chapterId === chapterId));
	}

	async function addChapter() {
		const timestamp = nowIso();
		await saveChapter({
			id: newId(),
			storyId,
			title: 'New Chapter',
			order: $chapters.length,
			createdAt: timestamp,
			updatedAt: timestamp
		});
	}

	async function renameChapter(chapterId: string, title: string) {
		const chapter = $chapters.find((c) => c.id === chapterId);
		if (!chapter) return;
		await saveChapter({ ...chapter, title, updatedAt: nowIso() });
	}

	async function addScene(chapterId: string) {
		const timestamp = nowIso();
		const scene = {
			id: newId(),
			storyId,
			chapterId,
			title: '',
			content: '',
			characterIds: [],
			locationId: null,
			objectIds: [],
			metadata: [],
			order: scenesFor(chapterId).length,
			createdAt: timestamp,
			updatedAt: timestamp
		};
		await saveScene(scene);
		goto(resolve('/stories/[storyId]/scenes/[sceneId]', { storyId, sceneId: scene.id }));
	}
</script>

<svelte:head><title>Chapters</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
	<h1 class="font-serif text-3xl">Chapters & Scenes</h1>
	<Button onclick={addChapter}>+ New Chapter</Button>
</div>

{#if sortedChapters.length === 0}
	<EmptyState
		title="No chapters yet"
		description="Chapters group your scenes into the order your story unfolds."
	>
		{#snippet action()}
			<Button onclick={addChapter}>+ New Chapter</Button>
		{/snippet}
	</EmptyState>
{:else}
	<div class="flex flex-col gap-8">
		{#each sortedChapters as chapter (chapter.id)}
			<ChapterSection
				{chapter}
				scenes={scenesFor(chapter.id)}
				onRename={(title) => renameChapter(chapter.id, title)}
				onDelete={() => deleteChapter(chapter.id)}
				onAddScene={() => addScene(chapter.id)}
			/>
		{/each}
	</div>
{/if}
