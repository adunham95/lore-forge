<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		objects,
		saveObject,
		deleteObject,
		shareObjectAcrossSeries,
		makeObjectStoryOnly
	} from '$lib/stores/objects';
	import { activeStory } from '$lib/stores/stories';
	import { showToast } from '$lib/stores/toast';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import MarkdownEditor from '$lib/components/editor/MarkdownEditor.svelte';

	const storyId = $derived(page.params.storyId as string);
	const objectId = $derived(page.params.objectId as string);
	const object = $derived($objects.find((o) => o.id === objectId));

	let name = $state('');
	let type = $state('');
	let description = $state('');
	let notes = $state('');
	let loadedId = $state<string | undefined>(undefined);

	$effect(() => {
		if (object && loadedId !== object.id) {
			name = object.name;
			type = object.type;
			description = object.description;
			notes = object.notes;
			loadedId = object.id;
		}
	});

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!object || !name.trim()) return;
		await saveObject({
			...object,
			name: name.trim(),
			type: type.trim(),
			description: description.trim(),
			notes,
			updatedAt: nowIso()
		});
		showToast('Object saved');
	}

	async function toggleSeriesSharing() {
		if (!object) return;
		if (object.seriesId) {
			await makeObjectStoryOnly(object, storyId);
		} else if ($activeStory?.seriesId) {
			await shareObjectAcrossSeries(object, $activeStory.seriesId);
		}
	}

	async function removeObject() {
		if (!object) return;
		if (confirm(`Delete "${object.name}"?`)) {
			await deleteObject(object.id);
			goto(resolve('/stories/[storyId]/objects', { storyId }));
		}
	}
</script>

<svelte:head><title>{object?.name ?? 'Object'}</title></svelte:head>

{#if object}
	<div class="max-w-3xl">
		<a
			href={resolve('/stories/[storyId]/objects', { storyId })}
			class="mb-4 inline-block text-sm text-text-secondary hover:text-text-primary"
		>
			&larr; Objects
		</a>

		{#if object.seriesId || $activeStory?.seriesId}
			<div class="mb-4 flex items-center gap-2">
				{#if object.seriesId}
					<Badge variant="neutral">Series object</Badge>
				{/if}
				<Button variant="ghost" type="button" onclick={toggleSeriesSharing}>
					{object.seriesId ? 'Make book-only' : 'Share across series'}
				</Button>
			</div>
		{/if}

		<form class="flex flex-col gap-4" onsubmit={save}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Name</span>
				<input
					bind:value={name}
					required
					class="rounded-md border border-border bg-surface px-3 py-2 text-lg"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Type</span>
				<input bind:value={type} class="rounded-md border border-border bg-surface px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Description</span>
				<textarea
					bind:value={description}
					rows="3"
					class="rounded-md border border-border bg-surface px-3 py-2"></textarea>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Notes</span>
				<MarkdownEditor bind:value={notes} placeholder="Specs, history, quirks..." />
			</label>
			<div class="mt-2 flex items-center justify-between">
				<Button variant="danger" type="button" onclick={removeObject}>Delete Object</Button>
				<Button type="submit">Save</Button>
			</div>
		</form>
	</div>
{/if}
