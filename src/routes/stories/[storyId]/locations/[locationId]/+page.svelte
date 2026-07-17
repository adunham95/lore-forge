<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		locations,
		saveLocation,
		deleteLocation,
		shareLocationAcrossSeries,
		makeLocationStoryOnly
	} from '$lib/stores/locations';
	import { activeStory } from '$lib/stores/stories';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import MarkdownEditor from '$lib/components/editor/MarkdownEditor.svelte';

	const storyId = $derived(page.params.storyId as string);
	const locationId = $derived(page.params.locationId as string);
	const location = $derived($locations.find((l) => l.id === locationId));

	let name = $state('');
	let type = $state('');
	let description = $state('');
	let notes = $state('');
	let loadedId = $state<string | undefined>(undefined);

	$effect(() => {
		if (location && loadedId !== location.id) {
			name = location.name;
			type = location.type;
			description = location.description;
			notes = location.notes;
			loadedId = location.id;
		}
	});

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!location || !name.trim()) return;
		await saveLocation({
			...location,
			name: name.trim(),
			type: type.trim(),
			description: description.trim(),
			notes,
			updatedAt: nowIso()
		});
	}

	async function toggleSeriesSharing() {
		if (!location) return;
		if (location.seriesId) {
			await makeLocationStoryOnly(location, storyId);
		} else if ($activeStory?.seriesId) {
			await shareLocationAcrossSeries(location, $activeStory.seriesId);
		}
	}

	async function removeLocation() {
		if (!location) return;
		if (confirm(`Delete "${location.name}"?`)) {
			await deleteLocation(location.id);
			goto(resolve('/stories/[storyId]/locations', { storyId }));
		}
	}
</script>

<svelte:head><title>{location?.name ?? 'Location'}</title></svelte:head>

{#if location}
	<div class="max-w-3xl">
		<a
			href={resolve('/stories/[storyId]/locations', { storyId })}
			class="mb-4 inline-block text-sm text-text-secondary hover:text-text-primary"
		>
			&larr; Locations
		</a>

		{#if location.seriesId || $activeStory?.seriesId}
			<div class="mb-4 flex items-center gap-2">
				{#if location.seriesId}
					<Badge variant="neutral">Series location</Badge>
				{/if}
				<Button variant="ghost" type="button" onclick={toggleSeriesSharing}>
					{location.seriesId ? 'Make book-only' : 'Share across series'}
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
				<MarkdownEditor bind:value={notes} placeholder="History, atmosphere, secrets..." />
			</label>
			<div class="mt-2 flex items-center justify-between">
				<Button variant="danger" type="button" onclick={removeLocation}>Delete Location</Button>
				<Button type="submit">Save</Button>
			</div>
		</form>
	</div>
{/if}
