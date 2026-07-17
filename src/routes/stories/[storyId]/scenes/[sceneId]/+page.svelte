<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { scenes, saveScene, deleteScene } from '$lib/stores/scenes';
	import { chapters } from '$lib/stores/chapters';
	import { characters } from '$lib/stores/characters';
	import { locations } from '$lib/stores/locations';
	import { objects } from '$lib/stores/objects';
	import { nowIso } from '$lib/utils/date';
	import MarkdownEditor from '$lib/components/editor/MarkdownEditor.svelte';
	import AvatarThumbnail from '$lib/components/avatar/AvatarThumbnail.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SceneAssignPanel from '$lib/components/scene/SceneAssignPanel.svelte';

	const storyId = $derived(page.params.storyId as string);
	const sceneId = $derived(page.params.sceneId as string);
	const scene = $derived($scenes.find((s) => s.id === sceneId));
	const chapter = $derived(scene ? $chapters.find((c) => c.id === scene.chapterId) : undefined);

	let title = $state('');
	let content = $state('');
	let characterIds = $state<string[]>([]);
	let locationId = $state<string | null>(null);
	let objectIds = $state<string[]>([]);
	let loadedId = $state<string | undefined>(undefined);
	let showAssign = $state(false);
	let saveStatus = $state<'idle' | 'pending' | 'saved'>('idle');

	const assignedCharacters = $derived(
		characterIds.map((id) => $characters.find((c) => c.id === id)).filter((c) => c !== undefined)
	);
	const assignedLocation = $derived($locations.find((l) => l.id === locationId));

	$effect(() => {
		if (scene && loadedId !== scene.id) {
			title = scene.title;
			content = scene.content;
			characterIds = scene.characterIds;
			locationId = scene.locationId;
			objectIds = scene.objectIds;
			loadedId = scene.id;
		}
	});

	// Debounced autosave — reschedules on every change, cancels on unmount/scene switch.
	$effect(() => {
		if (!scene || loadedId !== scene.id) return;

		const changed =
			title !== scene.title ||
			content !== scene.content ||
			locationId !== scene.locationId ||
			JSON.stringify(characterIds) !== JSON.stringify(scene.characterIds) ||
			JSON.stringify(objectIds) !== JSON.stringify(scene.objectIds);

		if (!changed) return;

		saveStatus = 'pending';
		const snapshot = {
			title,
			content,
			characterIds: [...characterIds],
			locationId,
			objectIds: [...objectIds]
		};
		const timeoutId = setTimeout(async () => {
			await saveScene({ ...scene, ...snapshot, updatedAt: nowIso() });
			saveStatus = 'saved';
		}, 500);

		return () => clearTimeout(timeoutId);
	});

	function toggleCharacter(id: string) {
		characterIds = characterIds.includes(id)
			? characterIds.filter((c) => c !== id)
			: [...characterIds, id];
	}

	function toggleObject(id: string) {
		objectIds = objectIds.includes(id) ? objectIds.filter((o) => o !== id) : [...objectIds, id];
	}

	async function removeScene() {
		if (!scene) return;
		if (confirm(`Delete this scene?`)) {
			await deleteScene(scene.id);
			goto(resolve('/stories/[storyId]/chapters', { storyId }));
		}
	}
</script>

<svelte:head><title>{scene?.title || 'Scene'}</title></svelte:head>

{#if scene}
	<div class="mx-auto max-w-4xl">
		<div class="mb-4 flex items-center justify-between">
			<a
				href={resolve('/stories/[storyId]/chapters', { storyId })}
				class="text-sm text-text-secondary hover:text-text-primary"
			>
				&larr; {chapter?.title ?? 'Chapters'}
			</a>
			<span class="text-xs text-text-secondary">
				{saveStatus === 'pending' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : ''}
			</span>
		</div>

		<input
			bind:value={title}
			placeholder="Scene title"
			class="mb-3 w-full border-none bg-transparent font-serif text-3xl focus:outline-none"
		/>

		{#if assignedCharacters.length > 0 || assignedLocation}
			<div class="mb-4 flex flex-wrap items-center gap-2">
				{#each assignedCharacters as character (character.id)}
					<AvatarThumbnail seed={character.avatar.seed} name={character.name} />
				{/each}
				{#if assignedLocation}
					<Badge>{assignedLocation.name}</Badge>
				{/if}
			</div>
		{/if}

		<div class="mb-4 md:hidden">
			<Button variant="secondary" onclick={() => (showAssign = !showAssign)}>
				{showAssign ? 'Hide' : 'Assign'} Characters & Location
			</Button>
			{#if showAssign}
				<div class="mt-3 rounded-lg border border-border bg-surface-raised p-4">
					<SceneAssignPanel
						characters={$characters}
						locations={$locations}
						objects={$objects}
						{characterIds}
						{locationId}
						{objectIds}
						onToggleCharacter={toggleCharacter}
						onSelectLocation={(id) => (locationId = id)}
						onToggleObject={toggleObject}
					/>
				</div>
			{/if}
		</div>

		<div class="flex flex-col gap-6 md:flex-row">
			<div class="flex-1">
				<MarkdownEditor bind:value={content} rows={20} placeholder="Write the scene..." />
			</div>
			<div class="hidden w-64 shrink-0 md:block">
				<SceneAssignPanel
					characters={$characters}
					locations={$locations}
					objects={$objects}
					{characterIds}
					{locationId}
					{objectIds}
					onToggleCharacter={toggleCharacter}
					onSelectLocation={(id) => (locationId = id)}
					onToggleObject={toggleObject}
				/>
			</div>
		</div>

		<div class="mt-6">
			<Button variant="danger" onclick={removeScene}>Delete Scene</Button>
		</div>
	</div>
{/if}
