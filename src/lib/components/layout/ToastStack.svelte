<script lang="ts">
	import { toasts, dismissToast } from '$lib/stores/toast';

	const variantClasses: Record<'success' | 'error', string> = {
		success: 'border-success/40 text-white bg-success',
		error: 'border-danger/40 text-white bg-danger'
	};
</script>

{#if $toasts.length > 0}
	<div
		class="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-sm flex-col gap-2 sm:inset-x-auto sm:right-4"
	>
		{#each $toasts as toast (toast.id)}
			<div
				class="flex items-center justify-between gap-3 rounded-md border p-4 shadow-lg {variantClasses[
					toast.variant
				]}"
				role="status"
			>
				<p class="text-sm">{toast.message}</p>
				<button
					onclick={() => dismissToast(toast.id)}
					class="shrink-0 text-sm"
					aria-label="Dismiss"
				>
					&times;
				</button>
			</div>
		{/each}
	</div>
{/if}
