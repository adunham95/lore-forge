<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { characters, saveCharacter } from '$lib/stores/characters';
	import { activeStory } from '$lib/stores/stories';
	import { showSaveError } from '$lib/stores/toast';
	import { newId } from '$lib/utils/id';
	import { nowIso } from '$lib/utils/date';
	import { defaultAvatarOptions } from '$lib/utils/avatar';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import MarkdownEditor from '$lib/components/editor/MarkdownEditor.svelte';
	import type { CharacterRelationship, CharacterRole } from '$lib/types';

	interface Props {
		storyId: string;
		onClose: () => void;
	}

	let { storyId, onClose }: Props = $props();

	const steps = [
		{ id: 'basics', label: 'Basics' },
		{ id: 'appearance', label: 'Appearance' },
		{ id: 'personality', label: 'Personality' },
		{ id: 'backstory', label: 'Backstory' },
		{ id: 'relationships', label: 'Relationships' },
		{ id: 'review', label: 'Review' }
	] as const;

	let stepIndex = $state(0);
	let step = $derived(steps[stepIndex]);

	let name = $state('');
	let age = $state('');
	let job = $state('');
	let role = $state<CharacterRole>('supporting');
	let scope = $state<'book' | 'series'>('book');
	let appearance = $state('');
	let personality = $state('');
	let notes = $state('');
	let relationships = $state<CharacterRelationship[]>([]);

	let relTargetId = $state('');
	let relLabel = $state('');
	let relDescription = $state('');

	let creating = $state(false);

	const canGoNext = $derived(step.id !== 'basics' || name.trim().length > 0);

	function goNext() {
		if (!canGoNext) return;
		if (stepIndex < steps.length - 1) stepIndex++;
	}

	function goBack() {
		if (stepIndex > 0) stepIndex--;
	}

	function jumpTo(index: number) {
		// Only allow jumping to a step that's already reachable given what's filled in so far.
		if (index <= stepIndex || name.trim().length > 0) stepIndex = index;
	}

	function addRelationship() {
		if (!relTargetId || !relLabel.trim()) return;
		relationships = [
			...relationships,
			{ targetCharacterId: relTargetId, label: relLabel.trim(), description: relDescription.trim() }
		];
		relLabel = '';
		relDescription = '';
	}

	function removeRelationship(index: number) {
		relationships = relationships.filter((_, i) => i !== index);
	}

	async function createCharacter() {
		if (!name.trim() || creating) return;
		creating = true;
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
			appearance: appearance.trim(),
			personality: personality.trim(),
			notes: notes.trim(),
			avatar: defaultAvatarOptions(id),
			relationships,
			createdAt: timestamp,
			updatedAt: timestamp
		};
		try {
			await saveCharacter(character);
			onClose();
			goto(
				resolve('/stories/[storyId]/characters/[characterId]', {
					storyId,
					characterId: character.id
				})
			);
		} catch (err) {
			showSaveError(`character "${character.name}" (id: ${character.id})`, err);
		} finally {
			creating = false;
		}
	}
</script>

<Modal title="New Character" {onClose}>
	<div class="mb-5 flex items-center gap-1 overflow-x-auto pb-1">
		{#each steps as s, i (s.id)}
			<button
				type="button"
				onclick={() => jumpTo(i)}
				class="shrink-0 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition {i ===
				stepIndex
					? 'bg-accent text-accent-text'
					: i < stepIndex || name.trim().length > 0
						? 'bg-surface-raised text-text-secondary hover:text-text-primary'
						: 'bg-surface-raised text-text-secondary/50'}"
			>
				{i + 1}. {s.label}
			</button>
		{/each}
	</div>

	{#if step.id === 'basics'}
		<div class="flex flex-col gap-4">
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Name</span>
				<input
					bind:value={name}
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="Elowen Ashgrove"
				/>
			</label>
			<div class="grid grid-cols-2 gap-4">
				<label class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Age</span>
					<input
						bind:value={age}
						type="number"
						min="0"
						class="rounded-md border border-border bg-surface px-3 py-2"
					/>
				</label>
				<label class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Job</span>
					<input
						bind:value={job}
						class="rounded-md border border-border bg-surface px-3 py-2"
						placeholder="Blacksmith"
					/>
				</label>
			</div>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Role</span>
				<select bind:value={role} class="rounded-md border border-border bg-surface px-3 py-2">
					<option value="protagonist">Protagonist</option>
					<option value="antagonist">Antagonist</option>
					<option value="supporting">Supporting</option>
					<option value="minor">Minor</option>
				</select>
			</label>
			{#if $activeStory?.seriesId}
				<div class="flex flex-col gap-1 text-sm">
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
		</div>
	{:else if step.id === 'appearance'}
		<label class="flex flex-col gap-1 text-sm">
			<span class="text-text-secondary">What do they look like?</span>
			<textarea
				bind:value={appearance}
				rows="8"
				class="rounded-md border border-border bg-surface px-3 py-2"
				placeholder="Build, hair, eyes, scars, how they dress, mannerisms..."></textarea>
		</label>
	{:else if step.id === 'personality'}
		<label class="flex flex-col gap-1 text-sm">
			<span class="text-text-secondary">What are they like?</span>
			<textarea
				bind:value={personality}
				rows="8"
				class="rounded-md border border-border bg-surface px-3 py-2"
				placeholder="Temperament, values, fears, quirks, how they treat others..."></textarea>
		</label>
	{:else if step.id === 'backstory'}
		<label class="flex flex-col gap-1 text-sm">
			<span class="text-text-secondary">Backstory &amp; notes</span>
			<MarkdownEditor bind:value={notes} placeholder="History, arc, secrets..." rows={8} />
		</label>
	{:else if step.id === 'relationships'}
		<div class="flex flex-col gap-4">
			{#if $characters.length === 0}
				<p class="text-sm text-text-secondary">
					No other characters exist yet — you can add relationships later from this character's
					page.
				</p>
			{:else}
				<div class="flex flex-col gap-3 rounded-lg border border-border bg-surface-raised p-3">
					<label class="flex flex-col gap-1 text-sm">
						<span class="text-text-secondary">Character</span>
						<select
							bind:value={relTargetId}
							class="rounded-md border border-border bg-surface px-3 py-2"
						>
							<option value="" disabled>Choose a character&hellip;</option>
							{#each $characters as candidate (candidate.id)}
								<option value={candidate.id}>{candidate.name}</option>
							{/each}
						</select>
					</label>
					<label class="flex flex-col gap-1 text-sm">
						<span class="text-text-secondary">Label</span>
						<input
							bind:value={relLabel}
							class="rounded-md border border-border bg-surface px-3 py-2"
							placeholder="Sister, Rival, Mentor..."
						/>
					</label>
					<label class="flex flex-col gap-1 text-sm">
						<span class="text-text-secondary">Description</span>
						<input
							bind:value={relDescription}
							class="rounded-md border border-border bg-surface px-3 py-2"
							placeholder="One line of context"
						/>
					</label>
					<Button
						variant="secondary"
						type="button"
						disabled={!relTargetId || !relLabel.trim()}
						onclick={addRelationship}
					>
						+ Add Relationship
					</Button>
				</div>
				{#if relationships.length > 0}
					<div class="flex flex-col gap-2">
						{#each relationships as relationship, i (relationship.targetCharacterId + relationship.label)}
							<div
								class="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
							>
								<span>
									<strong>{relationship.label}</strong> &middot;
									{$characters.find((c) => c.id === relationship.targetCharacterId)?.name}
									{#if relationship.description}
										<span class="text-text-secondary"> — {relationship.description}</span>
									{/if}
								</span>
								<button
									type="button"
									onclick={() => removeRelationship(i)}
									aria-label="Remove relationship"
									class="text-text-secondary hover:text-danger"
								>
									&times;
								</button>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	{:else if step.id === 'review'}
		<div class="flex flex-col gap-3 text-sm">
			<div>
				<span class="text-text-secondary">Name</span>
				<p class="font-serif text-lg">{name || '—'}</p>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<span class="text-text-secondary">Role</span>
					<p class="capitalize">{role}</p>
				</div>
				<div>
					<span class="text-text-secondary">Age / Job</span>
					<p>{age || '—'} {job ? `· ${job}` : ''}</p>
				</div>
			</div>
			<div>
				<span class="text-text-secondary">Appearance</span>
				<p class="whitespace-pre-wrap">{appearance || '—'}</p>
			</div>
			<div>
				<span class="text-text-secondary">Personality</span>
				<p class="whitespace-pre-wrap">{personality || '—'}</p>
			</div>
			<div>
				<span class="text-text-secondary">Relationships</span>
				<p>{relationships.length > 0 ? `${relationships.length} added` : 'None'}</p>
			</div>
			{#if !name.trim()}
				<p class="text-danger">Name is required before this character can be created.</p>
			{/if}
		</div>
	{/if}

	<div class="mt-6 flex justify-between gap-2">
		<Button variant="secondary" type="button" onclick={stepIndex === 0 ? onClose : goBack}>
			{stepIndex === 0 ? 'Cancel' : 'Back'}
		</Button>
		{#if step.id === 'review'}
			<Button type="button" disabled={!name.trim() || creating} onclick={createCharacter}>
				{creating ? 'Creating…' : 'Create Character'}
			</Button>
		{:else}
			<Button type="button" disabled={!canGoNext} onclick={goNext}>Next</Button>
		{/if}
	</div>
</Modal>
