<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		characters,
		saveCharacter,
		deleteCharacter,
		shareCharacterAcrossSeries,
		makeCharacterStoryOnly
	} from '$lib/stores/characters';
	import { activeStory } from '$lib/stores/stories';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import MarkdownEditor from '$lib/components/editor/MarkdownEditor.svelte';
	import AvatarPreview from '$lib/components/avatar/AvatarPreview.svelte';
	import RelationshipItem from '$lib/components/character/RelationshipItem.svelte';
	import RelationshipPicker from '$lib/components/character/RelationshipPicker.svelte';
	import type { CharacterRole } from '$lib/types';

	const storyId = $derived(page.params.storyId as string);
	const characterId = $derived(page.params.characterId as string);
	const character = $derived($characters.find((c) => c.id === characterId));

	const relatedBy = $derived(
		$characters
			.filter((c) => c.id !== characterId)
			.flatMap((c) =>
				c.relationships
					.filter((r) => r.targetCharacterId === characterId)
					.map((r) => ({ from: c, relationship: r }))
			)
	);

	let name = $state('');
	let age = $state('');
	let job = $state('');
	let role = $state<CharacterRole>('supporting');
	let appearance = $state('');
	let personality = $state('');
	let notes = $state('');
	let loadedId = $state<string | undefined>(undefined);
	let showRelationshipPicker = $state(false);

	$effect(() => {
		if (character && loadedId !== character.id) {
			name = character.name;
			age = character.age === null ? '' : String(character.age);
			job = character.job;
			role = character.role;
			appearance = character.appearance;
			personality = character.personality;
			notes = character.notes;
			loadedId = character.id;
		}
	});

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!character || !name.trim()) return;
		await saveCharacter({
			...character,
			name: name.trim(),
			age: age.trim() ? Number(age) : null,
			job: job.trim(),
			role,
			appearance,
			personality,
			notes,
			updatedAt: nowIso()
		});
	}

	async function toggleSeriesSharing() {
		if (!character) return;
		if (character.seriesId) {
			await makeCharacterStoryOnly(character, storyId);
		} else if ($activeStory?.seriesId) {
			await shareCharacterAcrossSeries(character, $activeStory.seriesId);
		}
	}

	async function removeCharacter() {
		if (!character) return;
		if (confirm(`Delete "${character.name}"?`)) {
			await deleteCharacter(character.id);
			goto(resolve('/stories/[storyId]/characters', { storyId }));
		}
	}

	async function addRelationship(relationship: {
		targetCharacterId: string;
		label: string;
		description: string;
	}) {
		if (!character) return;
		await saveCharacter({
			...character,
			relationships: [...character.relationships, relationship],
			updatedAt: nowIso()
		});
	}

	async function removeRelationship(index: number) {
		if (!character) return;
		await saveCharacter({
			...character,
			relationships: character.relationships.filter((_, i) => i !== index),
			updatedAt: nowIso()
		});
	}
</script>

<svelte:head><title>{character?.name ?? 'Character'}</title></svelte:head>

{#if character}
	<div class="max-w-3xl">
		<a
			href={resolve('/stories/[storyId]/characters', { storyId })}
			class="mb-4 inline-block text-sm text-text-secondary hover:text-text-primary"
		>
			&larr; Characters
		</a>

		<div class="mb-6 flex items-center gap-4">
			<AvatarPreview seed={character.avatar.seed} name={character.name} size={80} />
			<div>
				<h1 class="font-serif text-3xl">{character.name}</h1>
				<div class="mt-1 flex items-center gap-2">
					<Badge variant={character.role}>{character.role}</Badge>
					{#if character.seriesId}
						<Badge variant="neutral">Series character</Badge>
					{/if}
					{#if character.job}
						<span class="text-sm text-text-secondary">{character.job}</span>
					{/if}
					{#if character.age !== null}
						<span class="text-sm text-text-secondary">· {character.age}</span>
					{/if}
				</div>
				{#if character.seriesId || $activeStory?.seriesId}
					<Button variant="ghost" type="button" onclick={toggleSeriesSharing}>
						{character.seriesId ? 'Make book-only' : 'Share across series'}
					</Button>
				{/if}
			</div>
		</div>

		<form class="flex flex-col gap-4" onsubmit={save}>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<label class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Name</span>
					<input
						bind:value={name}
						required
						class="rounded-md border border-border bg-surface px-3 py-2"
					/>
				</label>
				<label class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Role</span>
					<select bind:value={role} class="rounded-md border border-border bg-surface px-3 py-2">
						<option value="protagonist">Protagonist</option>
						<option value="antagonist">Antagonist</option>
						<option value="supporting">Supporting</option>
						<option value="minor">Minor</option>
					</select>
				</label>
				<label class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Job</span>
					<input bind:value={job} class="rounded-md border border-border bg-surface px-3 py-2" />
				</label>
				<label class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Age</span>
					<input
						bind:value={age}
						type="number"
						min="0"
						class="rounded-md border border-border bg-surface px-3 py-2"
					/>
				</label>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<label class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Appearance</span>
					<textarea
						bind:value={appearance}
						rows="4"
						class="rounded-md border border-border bg-surface px-3 py-2"></textarea>
				</label>
				<label class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Personality</span>
					<textarea
						bind:value={personality}
						rows="4"
						class="rounded-md border border-border bg-surface px-3 py-2"></textarea>
				</label>
			</div>

			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Notes</span>
				<MarkdownEditor bind:value={notes} placeholder="Backstory, arc, secrets..." />
			</label>

			<div class="mt-2 flex items-center justify-between">
				<Button variant="danger" type="button" onclick={removeCharacter}>Delete Character</Button>
				<Button type="submit">Save</Button>
			</div>
		</form>

		<div class="mt-8 border-t border-border pt-6">
			<div class="mb-3 flex items-center justify-between">
				<h2 class="font-serif text-xl">Relationships</h2>
				<Button variant="secondary" onclick={() => (showRelationshipPicker = true)}>
					+ Add Relationship
				</Button>
			</div>
			{#if character.relationships.length === 0}
				<p class="text-sm text-text-secondary">No relationships added yet.</p>
			{:else}
				<div class="flex flex-col gap-2">
					{#each character.relationships as relationship, i (relationship.targetCharacterId + relationship.label)}
						<RelationshipItem
							{relationship}
							target={$characters.find((c) => c.id === relationship.targetCharacterId)}
							{storyId}
							onRemove={() => removeRelationship(i)}
						/>
					{/each}
				</div>
			{/if}

			{#if relatedBy.length > 0}
				<h3 class="mt-6 mb-2 text-xs font-medium tracking-wide text-text-secondary uppercase">
					Related Characters
				</h3>
				<div class="flex flex-col gap-2">
					{#each relatedBy as { from, relationship } (from.id + relationship.label)}
						<RelationshipItem {relationship} target={from} {storyId} />
					{/each}
				</div>
			{/if}
		</div>
	</div>

	{#if showRelationshipPicker}
		<RelationshipPicker
			candidates={$characters.filter((c) => c.id !== character.id)}
			onAdd={addRelationship}
			onClose={() => (showRelationshipPicker = false)}
		/>
	{/if}
{/if}
