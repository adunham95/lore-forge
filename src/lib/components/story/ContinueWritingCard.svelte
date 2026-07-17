<script lang="ts">
	import { resolve } from '$app/paths';
	import { scenes } from '$lib/stores/scenes';
	import { chapters } from '$lib/stores/chapters';
	import { characters } from '$lib/stores/characters';
	import { byUpdatedDesc } from '$lib/utils/sort';
	import { timeAgo } from '$lib/utils/date';
	import AvatarThumbnail from '$lib/components/avatar/AvatarThumbnail.svelte';

	/** Strips light markdown syntax down to plain, previewable text. */
	function excerpt(markdown: string, maxLength: number): string {
		const plain = markdown
			.replace(/^#{1,6}\s+/gm, '')
			.replace(/[*_`>~]/g, '')
			.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
			.replace(/\s+/g, ' ')
			.trim();
		return plain.length > maxLength ? `${plain.slice(0, maxLength).trimEnd()}…` : plain;
	}

	const latestScene = $derived(byUpdatedDesc($scenes)[0]);
	const chapter = $derived(
		latestScene ? $chapters.find((c) => c.id === latestScene.chapterId) : undefined
	);
	const povCharacter = $derived(
		latestScene?.povCharacterId
			? $characters.find((c) => c.id === latestScene.povCharacterId)
			: undefined
	);
	const wordCount = $derived(
		latestScene ? (latestScene.content.trim().match(/\S+/g)?.length ?? 0) : 0
	);
	const preview = $derived(latestScene ? excerpt(latestScene.content, 200) : '');
	const href = $derived(
		latestScene
			? resolve('/stories/[storyId]/scenes/[sceneId]', {
					storyId: latestScene.storyId,
					sceneId: latestScene.id
				})
			: '#'
	);
</script>

{#if latestScene}
	<a
		{href}
		class="block rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:border-accent/40 hover:shadow-md"
	>
		<div class="flex items-center justify-between gap-2">
			<p class="text-xs tracking-wide text-text-secondary uppercase">
				Continue writing{chapter ? ` · ${chapter.title}` : ''}
			</p>
			<span class="shrink-0 text-xs text-text-secondary">Edited {timeAgo(latestScene.updatedAt)}</span
			>
		</div>
		<h2 class="mt-1 font-serif text-2xl">{latestScene.title || 'Untitled Scene'}</h2>
		{#if preview}
			<p class="mt-2 line-clamp-2 text-sm text-text-secondary">{preview}</p>
		{:else}
			<p class="mt-2 text-sm text-text-secondary italic">This scene is still blank.</p>
		{/if}
		<div class="mt-4 flex items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				{#if povCharacter}
					<AvatarThumbnail seed={povCharacter.avatar.seed} name={povCharacter.name} />
					<span class="text-xs text-text-secondary">POV: {povCharacter.name}</span>
				{/if}
				<span class="text-xs text-text-secondary">{wordCount} words</span>
			</div>
			<span class="text-sm font-medium text-accent">Continue Writing &rarr;</span>
		</div>
	</a>
{/if}
