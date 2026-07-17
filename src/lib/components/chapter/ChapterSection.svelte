<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import SceneCard from '$lib/components/scene/SceneCard.svelte';
	import type { Chapter, Scene } from '$lib/types';

	interface Props {
		chapter: Chapter;
		scenes: Scene[];
		onRename: (title: string) => void;
		onDelete: () => void;
		onAddScene: () => void;
	}

	let { chapter, scenes, onRename, onDelete, onAddScene }: Props = $props();

	let editing = $state(false);
	let title = $state(chapter.title);

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

	function confirmDelete() {
		if (confirm(`Delete "${chapter.title}"? This also removes all of its scenes.`)) {
			onDelete();
		}
	}
</script>

<section>
	<div class="mb-3 flex items-center gap-2">
		{#if editing}
			<input
				bind:value={title}
				onblur={commitEdit}
				onkeydown={(e) => e.key === 'Enter' && commitEdit()}
				class="rounded-md border border-border bg-surface px-2 py-1 font-serif text-xl"
			/>
		{:else}
			<button onclick={startEdit} class="font-serif text-xl hover:text-accent">
				{chapter.title || 'Untitled Chapter'}
			</button>
		{/if}
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
