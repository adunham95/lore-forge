<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { characters, saveCharacter } from '$lib/stores/characters';
	import { activeStory } from '$lib/stores/stories';
	import { showSaveError } from '$lib/stores/toast';
	import { byUpdatedDesc } from '$lib/utils/sort';
	import { newId } from '$lib/utils/id';
	import { nowIso } from '$lib/utils/date';
	import { defaultAvatarOptions } from '$lib/utils/avatar';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import CharacterCard from '$lib/components/character/CharacterCard.svelte';
	import type { CharacterRole } from '$lib/types';

	const storyId = $derived(page.params.storyId as string);
	let sortedCharacters = $derived(byUpdatedDesc($characters));

	let showCreate = $state(false);
	let name = $state('');
	let age = $state('');
	let job = $state('');
	let role = $state<CharacterRole>('supporting');
	let scope = $state<'book' | 'series'>('book');

	function openCreate() {
		name = '';
		age = '';
		job = '';
		role = 'supporting';
		scope = 'book';
		showCreate = true;
	}

	async function submitCreate(e: SubmitEvent) {
		e.preventDefault();
		if (!name) return;
		const timestamp = nowIso();
		const id = newId();
		const shareAcrossSeries = scope === 'series' && $activeStory?.seriesId;
		const character = {
			id,
			storyId: shareAcrossSeries ? undefined : storyId,
			seriesId: shareAcrossSeries ? $activeStory!.seriesId : undefined,
			name: name.trim(),
			age: age ? Number(age) : null,
			job: job.trim(),
			role,
			appearance: '',
			personality: '',
			notes: '',
			avatar: defaultAvatarOptions(id),
			relationships: [],
			createdAt: timestamp,
			updatedAt: timestamp
		};
		try {
			await saveCharacter(character);
			showCreate = false;
			goto(
				resolve('/stories/[storyId]/characters/[characterId]', {
					storyId,
					characterId: character.id
				})
			);
		} catch (err) {
			showSaveError(`character "${character.name}" (id: ${character.id})`, err);
		}
	}
</script>

<svelte:head><title>Characters</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
	<h1 class="font-serif text-3xl">Characters</h1>
	<Button onclick={openCreate}>+ New Character</Button>
</div>

{#if sortedCharacters.length === 0}
	<EmptyState
		title="No characters yet"
		description="Add the people who populate your story's world."
	>
		{#snippet action()}
			<Button onclick={openCreate}>+ New Character</Button>
		{/snippet}
	</EmptyState>
{:else}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each sortedCharacters as character (character.id)}
			<CharacterCard {character} {storyId} />
		{/each}
	</div>
{/if}

{#if showCreate}
	<Modal title="New Character" onClose={() => (showCreate = false)}>
		<form class="grid grid-cols-2 gap-4" onsubmit={submitCreate}>
			<label class="col-span-2 flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Name</span>
				<input
					bind:value={name}
					required
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="Elowen Ashgrove"
				/>
			</label>
			<label class="flex flex-1 flex-col gap-1 text-sm">
				<span class="text-text-secondary">Age</span>
				<input
					bind:value={age}
					type="number"
					min="0"
					class="rounded-md border border-border bg-surface px-3 py-2"
				/>
			</label>
			<label class="flex flex-1 flex-col gap-1 text-sm">
				<span class="text-text-secondary">Job</span>
				<input
					bind:value={job}
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="Blacksmith"
				/>
			</label>
			<label class="col-span-2 flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Role</span>
				<select bind:value={role} class="rounded-md border border-border bg-surface px-3 py-2">
					<option value="protagonist">Protagonist</option>
					<option value="antagonist">Antagonist</option>
					<option value="supporting">Supporting</option>
					<option value="minor">Minor</option>
				</select>
			</label>
			{#if $activeStory?.seriesId}
				<div class="col-span-2 flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Appears in</span>
					<div class="flex gap-4">
						<label class="flex items-center gap-2">
							<input type="radio" bind:group={scope} value="book" />
							This book only
						</label>
						<label class="flex items-center gap-2">
							<input type="radio" bind:group={scope} value="series" />
							Whole series
						</label>
					</div>
				</div>
			{/if}
			<div class="col-span-2 mt-2 flex justify-end gap-2">
				<Button variant="secondary" onclick={() => (showCreate = false)}>Cancel</Button>
				<Button type="submit">Create Character</Button>
			</div>
		</form>
	</Modal>
{/if}
