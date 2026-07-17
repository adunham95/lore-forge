<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW();

	function dismiss() {
		needRefresh.set(false);
		offlineReady.set(false);
	}
</script>

{#if $needRefresh || $offlineReady}
	<div
		class="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-md border border-border bg-surface p-4 shadow-lg sm:inset-x-auto sm:right-4"
		role="status"
	>
		<p class="text-sm text-text-primary">
			{#if $needRefresh}
				A new version of Loreforge is ready.
			{:else}
				Loreforge is ready to work offline.
			{/if}
		</p>
		<div class="flex shrink-0 gap-2">
			{#if $needRefresh}
				<Button variant="primary" onclick={() => updateServiceWorker(true)}>Reload</Button>
			{/if}
			<Button variant="ghost" onclick={dismiss}>Dismiss</Button>
		</div>
	</div>
{/if}
