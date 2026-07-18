<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		chapters,
		saveChapter,
		deleteChapter,
		outlineTemplates,
		applyOutlineTemplate
	} from '$lib/stores/chapters';
	import { scenes, saveScene } from '$lib/stores/scenes';
	import { outline } from '$lib/stores/outline';
	import { byOrder } from '$lib/utils/sort';
	import { newId } from '$lib/utils/id';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ChapterSection from '$lib/components/chapter/ChapterSection.svelte';

	const storyId = $derived(page.params.storyId as string);
	let sortedChapters = $derived(byOrder($chapters));

	let showTemplates = $state(false);

	function scenesFor(chapterId: string) {
		return byOrder($scenes.filter((s) => s.chapterId === chapterId));
	}

	// Act heading to show above each chapter — only on the first chapter of a run sharing an act.
	function actHeadingFor(index: number) {
		const chapter = sortedChapters[index];
		if (!chapter.act) return null;
		if (index > 0 && sortedChapters[index - 1].act === chapter.act) return null;
		return chapter.act;
	}

	// The outline wizard's write-up for this act, if one was ever filled in — shown as a
	// reference above the act's chapters so you don't have to jump back to the Outline page.
	function actDescriptionFor(actName: string | null) {
		if (!actName || !$outline) return null;
		return $outline.acts.find((a) => a.name === actName)?.description || null;
	}

	async function addChapter() {
		const timestamp = nowIso();
		await saveChapter({
			id: newId(),
			storyId,
			title: 'New Chapter',
			act: '',
			order: $chapters.length,
			createdAt: timestamp,
			updatedAt: timestamp
		});
	}

	async function useTemplate(templateId: string) {
		await applyOutlineTemplate(storyId, templateId);
		showTemplates = false;
	}

	async function renameChapter(chapterId: string, title: string) {
		const chapter = $chapters.find((c) => c.id === chapterId);
		if (!chapter) return;
		await saveChapter({ ...chapter, title, updatedAt: nowIso() });
	}

	async function setChapterAct(chapterId: string, act: string) {
		const chapter = $chapters.find((c) => c.id === chapterId);
		if (!chapter) return;
		await saveChapter({ ...chapter, act, updatedAt: nowIso() });
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
			povCharacterId: null,
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
	<div class="flex flex-col-reverse gap-2 md:flex-row">
		<Button variant="secondary" onclick={() => (showTemplates = true)}>Use Template</Button>
		<Button onclick={addChapter}>+ New Chapter</Button>
	</div>
</div>

{#if sortedChapters.length === 0}
	<EmptyState
		title="No chapters yet"
		description="Chapters group your scenes into the order your story unfolds, or start from an outline template."
	>
		{#snippet action()}
			<div class="flex gap-2">
				<Button variant="secondary" onclick={() => (showTemplates = true)}>Use Template</Button>
				<Button onclick={addChapter}>+ New Chapter</Button>
			</div>
		{/snippet}
	</EmptyState>
{:else}
	<div class="flex flex-col gap-8">
		{#each sortedChapters as chapter, index (chapter.id)}
			{#if actHeadingFor(index)}
				{@const heading = actHeadingFor(index)}
				{@const description = actDescriptionFor(heading)}
				<div class="-mb-4">
					<h2 class="font-serif text-sm tracking-wide text-text-secondary uppercase">
						{heading}
					</h2>
					{#if description}
						<p class="mt-1 max-w-2xl text-sm text-text-secondary">{description}</p>
					{/if}
				</div>
			{/if}
			<ChapterSection
				{chapter}
				scenes={scenesFor(chapter.id)}
				onRename={(title) => renameChapter(chapter.id, title)}
				onSetAct={(act) => setChapterAct(chapter.id, act)}
				onDelete={() => deleteChapter(chapter.id)}
				onAddScene={() => addScene(chapter.id)}
			/>
		{/each}
	</div>
{/if}

{#if showTemplates}
	<Modal title="Use an Outline Template" onClose={() => (showTemplates = false)}>
		<div class="flex flex-col gap-3">
			{#each outlineTemplates as template (template.id)}
				<button
					onclick={() => useTemplate(template.id)}
					class="rounded-md border border-border bg-surface p-3 text-left transition hover:border-accent"
				>
					<p class="font-serif text-lg">{template.name}</p>
					<p class="mt-1 text-sm text-text-secondary">{template.description}</p>
					<p class="mt-2 text-xs text-text-secondary">
						{template.acts.length} acts · {template.acts.reduce(
							(sum, act) => sum + act.chapters.length,
							0
						)} chapters
					</p>
				</button>
			{/each}
		</div>
	</Modal>
{/if}
