<script lang="ts">
	import { page } from '$app/state';
	import { characters } from '$lib/stores/characters';
	import { byUpdatedDesc } from '$lib/utils/sort';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import CharacterCard from '$lib/components/character/CharacterCard.svelte';
	import CharacterWizard from '$lib/components/character/CharacterWizard.svelte';

	const storyId = $derived(page.params.storyId as string);
	let sortedCharacters = $derived(byUpdatedDesc($characters));

	let showWizard = $state(false);
</script>

<svelte:head><title>Characters</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
	<h1 class="font-serif text-3xl">Characters</h1>
	<Button onclick={() => (showWizard = true)}>+ New Character</Button>
</div>

{#if sortedCharacters.length === 0}
	<EmptyState
		title="No characters yet"
		description="Add the people who populate your story's world."
	>
		{#snippet action()}
			<Button onclick={() => (showWizard = true)}>+ New Character</Button>
		{/snippet}
	</EmptyState>
{:else}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each sortedCharacters as character (character.id)}
			<CharacterCard {character} {storyId} />
		{/each}
	</div>
{/if}

{#if showWizard}
	<CharacterWizard {storyId} onClose={() => (showWizard = false)} />
{/if}
