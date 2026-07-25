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
	import MobileMenu from '$lib/components/layout/MobileMenu.svelte';

	let { children } = $props();
	let ready = $state(false);
	let mobileMenuOpen = $state(false);

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
			<div class="flex items-center gap-2">
				<a
					href={resolve('/writers-block')}
					class="flex min-h-11 items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-text hover:opacity-90"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="16"
						height="16"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
						/>
					</svg>
					<span class="hidden sm:inline">Writers Block</span>
				</a>
				<div class="hidden items-center gap-2 md:flex">
					<a
						href={resolve('/prompts')}
						class="flex min-h-11 items-center rounded-md border border-border bg-surface-raised px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
					>
						Prompts
					</a>
					<a
						href={resolve('/settings')}
						class="flex min-h-11 items-center rounded-md border border-border bg-surface-raised px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
					>
						Settings
					</a>
					<button
						onclick={toggleDarkMode}
						class="min-h-11 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
						aria-label="Toggle dark mode"
					>
						{$settings.darkMode ? '☀ Light' : '🌙 Dark'}
					</button>
				</div>
				<button
					onclick={() => (mobileMenuOpen = true)}
					class="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-surface-raised px-2.5 py-2 text-text-secondary hover:text-text-primary md:hidden"
					aria-label="Open menu"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="20"
						height="20"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="4" x2="20" y1="6" y2="6" />
						<line x1="4" x2="20" y1="12" y2="12" />
						<line x1="4" x2="20" y1="18" y2="18" />
					</svg>
				</button>
			</div>
		</header>
	{/if}

	<MobileMenu
		open={mobileMenuOpen}
		darkMode={$settings.darkMode}
		onClose={() => (mobileMenuOpen = false)}
		onToggleDarkMode={toggleDarkMode}
	/>

	<main>
		{#if ready}
			{@render children()}
		{/if}
	</main>
</div>
