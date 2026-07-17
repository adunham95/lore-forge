<script lang="ts">
	import { untrack } from 'svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Character, CharacterRelationship } from '$lib/types';

	interface Props {
		candidates: Character[];
		onAdd: (relationship: CharacterRelationship) => void;
		onClose: () => void;
	}

	let { candidates, onAdd, onClose }: Props = $props();

	// Seeds the select with whichever candidate is first when the modal opens; not meant to track updates.
	let targetCharacterId = $state(untrack(() => candidates[0]?.id ?? ''));
	let label = $state('');
	let description = $state('');

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!targetCharacterId || !label.trim()) return;
		onAdd({ targetCharacterId, label: label.trim(), description: description.trim() });
		onClose();
	}
</script>

<Modal title="Add Relationship" {onClose}>
	{#if candidates.length === 0}
		<p class="text-sm text-text-secondary">
			No other characters in this story yet — create another character first.
		</p>
	{:else}
		<form class="flex flex-col gap-4" onsubmit={submit}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Character</span>
				<select
					bind:value={targetCharacterId}
					class="rounded-md border border-border bg-surface px-3 py-2"
				>
					{#each candidates as candidate (candidate.id)}
						<option value={candidate.id}>{candidate.name}</option>
					{/each}
				</select>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Label</span>
				<input
					bind:value={label}
					required
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="Sister, Rival, Mentor..."
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Description</span>
				<input
					bind:value={description}
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="One line of context"
				/>
			</label>
			<div class="mt-2 flex justify-end gap-2">
				<Button variant="secondary" type="button" onclick={onClose}>Cancel</Button>
				<Button type="submit">Add</Button>
			</div>
		</form>
	{/if}
</Modal>
