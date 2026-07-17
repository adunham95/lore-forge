<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { loadStories, activeStoryId, activeStory } from '$lib/stores/stories';
	import { loadCharacters } from '$lib/stores/characters';
	import { loadLocations } from '$lib/stores/locations';
	import { loadObjects } from '$lib/stores/objects';
	import { loadLore } from '$lib/stores/lore';
	import { loadChapters } from '$lib/stores/chapters';
	import { loadScenesByStory } from '$lib/stores/scenes';
	import { settings } from '$lib/stores/settings';
	import { resolveTheme } from '$lib/utils/theme';
	import StorySidebar from '$lib/components/layout/StorySidebar.svelte';

	let { children } = $props();
	let storyId = $derived(page.params.storyId as string);
	let ready = $state(false);

	let theme = $derived(resolveTheme($activeStory?.theme));

	// Re-runs whenever storyId changes (including SPA navigation between stories).
	$effect(() => {
		const id = storyId;
		ready = false;
		activeStoryId.set(id);
		(async () => {
			await loadStories();
			await Promise.all([
				loadCharacters(id),
				loadLocations(id),
				loadObjects(id),
				loadLore(id),
				loadChapters(id),
				loadScenesByStory(id)
			]);
			ready = true;
		})();
	});

	$effect(() => {
		if (ready && !$activeStory) {
			goto(resolve('/'));
		}
	});
</script>

{#if ready && $activeStory}
	<div
		class="story-shell flex min-h-[calc(100vh-65px)] flex-col md:flex-row"
		style="
			--accent: {$settings.darkMode ? theme.accentDark : theme.accentLight};
			--accent-soft: {$settings.darkMode ? theme.accentSoftDark : theme.accentSoft};
			--accent-text: {theme.accentText};
		"
	>
		<StorySidebar {storyId} />
		<div class="flex-1 overflow-y-auto p-4 md:p-8">
			{@render children()}
		</div>
	</div>
{/if}
