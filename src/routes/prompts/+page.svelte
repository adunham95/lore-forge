<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { prompts, loadPrompts, savePrompt } from '$lib/stores/prompts';
	import { showToast } from '$lib/stores/toast';
	import { byUpdatedDesc } from '$lib/utils/sort';
	import { newId } from '$lib/utils/id';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PromptCard from '$lib/components/prompt/PromptCard.svelte';

	const sorted = $derived(byUpdatedDesc($prompts));

	let showCreate = $state(false);
	let title = $state('');

	onMount(() => {
		loadPrompts();
	});

	function openCreate() {
		title = '';
		showCreate = true;
	}

	async function submitCreate(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return;
		const timestamp = nowIso();
		const prompt = {
			id: newId(),
			title: title.trim(),
			content: '',
			tags: [],
			createdAt: timestamp,
			updatedAt: timestamp
		};
		try {
			await savePrompt(prompt);
			showCreate = false;
			goto(resolve('/prompts/[promptId]', { promptId: prompt.id }));
		} catch (err) {
			const detail =
				err instanceof Error
					? `${err.name}: ${err.message}`
					: typeof err === 'string'
						? err
						: JSON.stringify(err);
			showToast(
				`Failed to save prompt "${prompt.title}" (id: ${prompt.id}). ${detail}. This is usually caused by the browser's local storage being full or blocked (e.g. private browsing mode) — check your browser's storage settings and try again.`,
				'error'
			);
		}
	}
</script>

<svelte:head><title>Writing Prompts</title></svelte:head>

<div class="mx-auto max-w-5xl px-6 py-10">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="font-serif text-3xl">Writing Prompts</h1>
			<p class="text-sm text-text-secondary">
				A running list of ideas to draw on when you're stuck.
			</p>
		</div>
		<Button onclick={openCreate}>+ New Prompt</Button>
	</div>

	{#if sorted.length === 0}
		<EmptyState
			title="No prompts yet"
			description="Jot down an idea, a line of dialogue, or a scenario you might want to write someday."
		>
			{#snippet action()}
				<Button onclick={openCreate}>+ New Prompt</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each sorted as prompt (prompt.id)}
				<PromptCard {prompt} />
			{/each}
		</div>
	{/if}
</div>

{#if showCreate}
	<Modal title="New Writing Prompt" onClose={() => (showCreate = false)}>
		<form class="flex flex-col gap-4" onsubmit={submitCreate}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Title</span>
				<textarea
					bind:value={title}
					required
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="A stranger arrives during the storm..."></textarea>
			</label>
			<div class="mt-2 flex justify-end gap-2">
				<Button variant="secondary" onclick={() => (showCreate = false)}>Cancel</Button>
				<Button type="submit">Create Prompt</Button>
			</div>
		</form>
	</Modal>
{/if}
