<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { resolve } from '$app/paths';

	interface Props {
		open: boolean;
		darkMode: boolean;
		onClose: () => void;
		onToggleDarkMode: () => void;
	}

	let { open, darkMode, onClose, onToggleDarkMode }: Props = $props();

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}

	const itemClass =
		'flex min-h-11 items-center rounded-md border border-border bg-surface-raised px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary';
</script>

<svelte:window onkeydown={open ? onKeydown : undefined} />

{#if open}
	<div class="fixed inset-0 z-50 md:hidden">
		<div
			class="fixed inset-0 bg-black/50"
			onclick={onClose}
			role="presentation"
			transition:fade={{ duration: 150 }}
		></div>
		<div
			class="fixed inset-y-0 right-0 z-10 flex w-64 max-w-[80vw] flex-col gap-2 border-l border-border bg-surface p-4 shadow-lg"
			role="dialog"
			aria-modal="true"
			aria-label="Menu"
			transition:fly={{ x: 80, duration: 200 }}
		>
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm font-medium text-text-secondary">Menu</span>
				<button
					onclick={onClose}
					class="text-xl leading-none text-text-secondary hover:text-text-primary"
					aria-label="Close menu"
				>
					&times;
				</button>
			</div>
			<a href={resolve('/prompts')} onclick={onClose} class={itemClass}>Prompts</a>
			<a href={resolve('/settings')} onclick={onClose} class={itemClass}>Settings</a>
			<button onclick={onToggleDarkMode} class={itemClass} aria-label="Toggle dark mode">
				{darkMode ? '☀ Light mode' : '🌙 Dark mode'}
			</button>
		</div>
	</div>
{/if}
