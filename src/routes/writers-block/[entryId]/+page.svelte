<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		writersBlockEntries,
		loadWritersBlockEntries,
		saveWritersBlockEntry,
		deleteWritersBlockEntry
	} from '$lib/stores/writersBlock';
	import { stories, loadStories } from '$lib/stores/stories';
	import { getCharactersForStory } from '$lib/db';
	import { showToast, showSaveError } from '$lib/stores/toast';
	import Button from '$lib/components/ui/Button.svelte';
	import MarkdownEditor from '$lib/components/editor/MarkdownEditor.svelte';
	import AvatarThumbnail from '$lib/components/avatar/AvatarThumbnail.svelte';
	import type { Character } from '$lib/types';

	const entryId = $derived(page.params.entryId as string);
	const entry = $derived($writersBlockEntries.find((e) => e.id === entryId));

	let title = $state('');
	let content = $state('');
	let storyId = $state('');
	let characterIds = $state<string[]>([]);
	let loadedId = $state<string | undefined>(undefined);
	let storyCharacters = $state<Character[]>([]);

	onMount(() => {
		loadWritersBlockEntries();
		loadStories();
	});

	$effect(() => {
		if (entry && loadedId !== entry.id) {
			title = entry.title;
			content = entry.content;
			storyId = entry.storyId ?? '';
			characterIds = entry.characterIds;
			loadedId = entry.id;
		}
	});

	$effect(() => {
		const story = $stories.find((s) => s.id === storyId);
		if (!story) {
			storyCharacters = [];
			return;
		}
		getCharactersForStory(story).then((chars) => {
			storyCharacters = chars;
		});
	});

	function onSelectStory(id: string) {
		storyId = id;
		const validIds = new Set(storyCharacters.map((c) => c.id));
		characterIds = id ? characterIds.filter((cid) => validIds.has(cid)) : [];
	}

	function toggleCharacter(id: string) {
		characterIds = characterIds.includes(id)
			? characterIds.filter((cid) => cid !== id)
			: [...characterIds, id];
	}

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!entry || !title.trim()) return;
		try {
			await saveWritersBlockEntry({
				...entry,
				title: title.trim(),
				content,
				storyId: storyId || undefined,
				characterIds
			});
			showToast('Entry saved');
		} catch (err) {
			showSaveError(`writers block entry "${title.trim()}" (id: ${entry.id})`, err);
		}
	}

	async function removeEntry() {
		if (!entry) return;
		if (confirm(`Delete "${entry.title}"?`)) {
			await deleteWritersBlockEntry(entry.id);
			goto(resolve('/writers-block'));
		}
	}
</script>

<svelte:head><title>{entry?.title ?? 'Writers Block'}</title></svelte:head>

{#if entry}
	<div class="mx-auto max-w-3xl px-6 py-10">
		<a
			href={resolve('/writers-block')}
			class="mb-4 inline-block text-sm text-text-secondary hover:text-text-primary"
		>
			&larr; Writers Block
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
				<span class="text-text-secondary">Story</span>
				<select
					value={storyId}
					onchange={(e) => onSelectStory(e.currentTarget.value)}
					class="rounded-md border border-border bg-surface px-3 py-2"
				>
					<option value="">No story</option>
					{#each $stories as story (story.id)}
						<option value={story.id}>{story.title}</option>
					{/each}
				</select>
			</label>

			{#if storyId}
				<div class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Characters</span>
					{#if storyCharacters.length === 0}
						<p class="text-sm text-text-secondary italic">No characters in this story yet.</p>
					{:else}
						<div class="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-md border border-border p-1">
							{#each storyCharacters as character (character.id)}
								<label
									class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-raised"
								>
									<input
										type="checkbox"
										checked={characterIds.includes(character.id)}
										onchange={() => toggleCharacter(character.id)}
									/>
									<AvatarThumbnail seed={character.avatar.seed} name={character.name} />
									<span class="truncate">{character.name}</span>
								</label>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Dump</span>
				<MarkdownEditor bind:value={content} placeholder="Write whatever's on your mind..." rows={16} />
			</label>

			<div class="mt-2 flex items-center justify-between">
				<Button variant="danger" type="button" onclick={removeEntry}>Delete Entry</Button>
				<Button type="submit">Save</Button>
			</div>
		</form>
	</div>
{/if}
