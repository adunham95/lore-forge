<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { prompts, loadPrompts, savePrompt, deletePrompt } from '$lib/stores/prompts';
	import { showToast, showSaveError } from '$lib/stores/toast';
	import Button from '$lib/components/ui/Button.svelte';
	import MarkdownEditor from '$lib/components/editor/MarkdownEditor.svelte';

	const promptId = $derived(page.params.promptId as string);
	const prompt = $derived($prompts.find((p) => p.id === promptId));

	let title = $state('');
	let content = $state('');
	let tagsInput = $state('');
	let loadedId = $state<string | undefined>(undefined);

	onMount(() => {
		loadPrompts();
	});

	$effect(() => {
		if (prompt && loadedId !== prompt.id) {
			title = prompt.title;
			content = prompt.content;
			tagsInput = prompt.tags.join(', ');
			loadedId = prompt.id;
		}
	});

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!prompt || !title.trim()) return;
		const tags = tagsInput
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);
		try {
			await savePrompt({
				...prompt,
				title: title.trim(),
				content,
				tags
			});
			showToast('Prompt saved');
		} catch (err) {
			showSaveError(`prompt "${title.trim()}" (id: ${prompt.id})`, err);
		}
	}

	async function removePrompt() {
		if (!prompt) return;
		if (confirm(`Delete "${prompt.title}"?`)) {
			await deletePrompt(prompt.id);
			goto(resolve('/prompts'));
		}
	}
</script>

<svelte:head><title>{prompt?.title ?? 'Writing Prompt'}</title></svelte:head>

{#if prompt}
	<div class="mx-auto max-w-3xl px-6 py-10">
		<a
			href={resolve('/prompts')}
			class="mb-4 inline-block text-sm text-text-secondary hover:text-text-primary"
		>
			&larr; Writing Prompts
		</a>

		<form class="flex flex-col gap-4" onsubmit={save}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Title</span>
				<input
					bind:value={title}
					required
					class="rounded-md border border-border bg-surface px-3 py-2 text-lg"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Tags</span>
				<input
					bind:value={tagsInput}
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="Comma separated: dialogue, twist, romance..."
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Prompt</span>
				<MarkdownEditor bind:value={content} placeholder="Write out the idea in Markdown..." />
			</label>
			<div class="mt-2 flex items-center justify-between">
				<Button variant="danger" type="button" onclick={removePrompt}>Delete Prompt</Button>
				<Button type="submit">Save</Button>
			</div>
		</form>
	</div>
{/if}
