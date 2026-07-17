<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		onClose: () => void;
		children: Snippet;
	}

	let { title, onClose, children }: Props = $props();

	function onBackdropKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={onBackdropKeydown} />

<div
	class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-0 sm:items-center sm:p-4"
>
	<div class="fixed inset-0 bg-black/50" onclick={onClose} role="presentation"></div>
	<div
		class="relative z-10 max-h-screen w-full max-w-lg overflow-y-auto border border-border bg-surface p-4 shadow-lg sm:max-h-[85vh] sm:rounded-xl sm:p-6"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div class="mb-4 flex items-center justify-between">
			<h2 id="modal-title" class="font-serif text-2xl">{title}</h2>
			<button
				onclick={onClose}
				class="text-xl leading-none text-text-secondary hover:text-text-primary"
				aria-label="Close"
			>
				&times;
			</button>
		</div>
		{@render children()}
	</div>
</div>
