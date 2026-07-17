<script lang="ts">
	import AvatarThumbnail from '$lib/components/avatar/AvatarThumbnail.svelte';
	import SceneMetadataPanel from '$lib/components/scene/SceneMetadataPanel.svelte';
	import type { Character, Location, StoryObject, SceneMetadataField } from '$lib/types';

	interface Props {
		characters: Character[];
		locations: Location[];
		objects: StoryObject[];
		characterIds: string[];
		locationId: string | null;
		objectIds: string[];
		metadata: SceneMetadataField[];
		onToggleCharacter: (id: string) => void;
		onSelectLocation: (id: string | null) => void;
		onToggleObject: (id: string) => void;
		onMetadataChange: (fields: SceneMetadataField[]) => void;
	}

	let {
		characters,
		locations,
		objects,
		characterIds,
		locationId,
		objectIds,
		metadata,
		onToggleCharacter,
		onSelectLocation,
		onToggleObject,
		onMetadataChange
	}: Props = $props();
</script>

<div class="flex flex-col gap-6">
	<div>
		<h3 class="mb-2 text-xs font-medium tracking-wide text-text-secondary uppercase">Location</h3>
		<select
			value={locationId ?? ''}
			onchange={(e) => onSelectLocation(e.currentTarget.value || null)}
			class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
		>
			<option value="">None</option>
			{#each locations as location (location.id)}
				<option value={location.id}>{location.name}</option>
			{/each}
		</select>
	</div>

	<div>
		<h3 class="mb-2 text-xs font-medium tracking-wide text-text-secondary uppercase">Characters</h3>
		{#if characters.length === 0}
			<p class="text-sm text-text-secondary italic">No characters in this story yet.</p>
		{:else}
			<div class="flex max-h-64 flex-col gap-1 overflow-y-auto">
				{#each characters as character (character.id)}
					<label
						class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-raised"
					>
						<input
							type="checkbox"
							checked={characterIds.includes(character.id)}
							onchange={() => onToggleCharacter(character.id)}
						/>
						<AvatarThumbnail seed={character.avatar.seed} name={character.name} />
						<span class="truncate">{character.name}</span>
					</label>
				{/each}
			</div>
		{/if}
	</div>

	<div>
		<h3 class="mb-2 text-xs font-medium tracking-wide text-text-secondary uppercase">Objects</h3>
		{#if objects.length === 0}
			<p class="text-sm text-text-secondary italic">No objects in this story yet.</p>
		{:else}
			<div class="flex max-h-64 flex-col gap-1 overflow-y-auto">
				{#each objects as object (object.id)}
					<label
						class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-raised"
					>
						<input
							type="checkbox"
							checked={objectIds.includes(object.id)}
							onchange={() => onToggleObject(object.id)}
						/>
						<span class="truncate">{object.name}</span>
					</label>
				{/each}
			</div>
		{/if}
	</div>

	<SceneMetadataPanel fields={metadata} onChange={onMetadataChange} />
</div>
