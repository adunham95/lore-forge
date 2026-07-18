<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { settings, loadSettings, updateSettings } from '$lib/stores/settings';
	import { focusMode } from '$lib/stores/focus';
	import { pwaInfo } from 'virtual:pwa-info';
	import PwaUpdateToast from '$lib/components/layout/PwaUpdateToast.svelte';
	import ToastStack from '$lib/components/layout/ToastStack.svelte';

	let { children } = $props();
	let ready = $state(false);

	onMount(async () => {
		await loadSettings();
		ready = true;
	});

	$effect(() => {
		document.documentElement.classList.toggle('dark', $settings.darkMode);
	});

	function toggleDarkMode() {
		updateSettings({ darkMode: !$settings.darkMode });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if pwaInfo}
		{@html pwaInfo.webManifest.linkTag}
	{/if}
</svelte:head>

<PwaUpdateToast />
<ToastStack />

<div class="min-h-screen bg-bg text-text-primary">
	{#if !$focusMode}
		<header
			class="flex items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-6 sm:py-4"
		>
			<a href={resolve('/')} class="flex items-baseline gap-2">
				<span class="font-serif text-xl font-semibold sm:text-2xl"
					>Lore<span class="font-sans">forge</span></span
				>
			</a>
			<button
				onclick={toggleDarkMode}
				class="min-h-11 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
				aria-label="Toggle dark mode"
			>
				{$settings.darkMode ? '☀ Light' : '🌙 Dark'}
			</button>
		</header>
	{/if}

	<main>
		{#if ready}
			{@render children()}
		{/if}
	</main>
</div>
