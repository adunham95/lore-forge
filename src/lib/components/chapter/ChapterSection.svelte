<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import SceneCard from '$lib/components/scene/SceneCard.svelte';
	import type { Chapter, Scene } from '$lib/types';

	interface Props {
		chapter: Chapter;
		scenes: Scene[];
		onRename: (title: string) => void;
		onSetAct: (act: string) => void;
		onDelete: () => void;
		onAddScene: () => void;
	}

	let { chapter, scenes, onRename, onSetAct, onDelete, onAddScene }: Props = $props();

	let editing = $state(false);
	let title = $state(chapter.title);

	let editingAct = $state(false);
	let act = $state(chapter.act);

	function startEdit() {
		title = chapter.title;
		editing = true;
	}

	function commitEdit() {
		editing = false;
		if (title.trim() && title.trim() !== chapter.title) {
			onRename(title.trim());
		}
	}

	function startEditAct() {
		act = chapter.act;
		editingAct = true;
	}

	function commitEditAct() {
		editingAct = false;
		if (act.trim() !== chapter.act) {
			onSetAct(act.trim());
		}
	}

	function confirmDelete() {
		if (confirm(`Delete "${chapter.title}"? This also removes all of its scenes.`)) {
			onDelete();
		}
	}
</script>

<section>
	<div class="mb-3 flex items-start gap-2">
		<div class="flex flex-col gap-1">
			{#if editing}
				<input
					bind:value={title}
					onblur={commitEdit}
					onkeydown={(e) => e.key === 'Enter' && commitEdit()}
					class="rounded-md border border-border bg-surface px-2 py-1 font-serif text-xl"
				/>
			{:else}
				<button onclick={startEdit} class="text-left font-serif text-xl hover:text-accent">
					{chapter.title || 'Untitled Chapter'}
				</button>
			{/if}
			{#if editingAct}
				<input
					bind:value={act}
					onblur={commitEditAct}
					onkeydown={(e) => e.key === 'Enter' && commitEditAct()}
					placeholder="Act 1 - Departure"
					class="rounded-md border border-border bg-surface px-2 py-1 text-xs"
				/>
			{:else}
				<button
					onclick={startEditAct}
					class="w-fit text-left text-xs tracking-wide text-text-secondary uppercase hover:text-accent"
				>
					{chapter.act || '+ Assign act'}
				</button>
			{/if}
		</div>
		<div class="ml-auto flex gap-2">
			<Button variant="secondary" onclick={onAddScene}>+ Scene</Button>
			<Button variant="ghost" onclick={confirmDelete}>Delete</Button>
		</div>
	</div>

	{#if scenes.length === 0}
		<p class="text-sm text-text-secondary italic">No scenes yet.</p>
	{:else}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each scenes as scene (scene.id)}
				<SceneCard {scene} />
			{/each}
		</div>
	{/if}
</section>
