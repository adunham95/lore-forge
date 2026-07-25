<script lang="ts">
	import { settings, updateSettings } from '$lib/stores/settings';
	import { syncStatus, syncNow } from '$lib/stores/sync';
	import { showToast } from '$lib/stores/toast';
	import { timeAgo } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';

	let joinCode = $state('');

	async function copyCode() {
		if (!$settings.syncCode) return;
		await navigator.clipboard.writeText($settings.syncCode);
		showToast('Sync code copied');
	}

	async function runSync() {
		try {
			await syncNow();
			showToast('Synced — reloading to pick up any changes…');
			// applySyncBundle writes straight to IndexedDB, bypassing every store's in-memory
			// state, so a reload is the simplest way to get the whole UI back in sync.
			setTimeout(() => window.location.reload(), 800);
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Sync failed', 'error');
		}
	}

	async function joinCodeSubmit(e: SubmitEvent) {
		e.preventDefault();
		const code = joinCode.trim();
		if (!code) return;
		if (
			!confirm(
				"Switch to this sync code? Your local stories stay put, but future syncs will read and write the data behind this code instead of your current one — make sure it's the code from the device you want to sync with."
			)
		) {
			return;
		}
		await updateSettings({ syncCode: code, lastSyncedAt: undefined });
		joinCode = '';
		showToast('Sync code updated — hit "Sync Now" to pull in its data');
	}
</script>

<svelte:head><title>Settings</title></svelte:head>

<div class="max-w-2xl">
	<h1 class="font-serif text-3xl">Settings</h1>

	<div class="mt-8 border-t border-border pt-6">
		<h2 class="mb-2 font-serif text-xl">Sync</h2>
		<p class="mb-4 text-sm text-text-secondary">
			Lore Forge stores everything locally in this browser. To keep another device in sync, copy
			this device's sync code to it (or paste one from another device below) — any two devices
			sharing a code sync the same data. Stories marked "Keep on this device only" in their story
			settings are never included.
		</p>

		<label class="flex flex-col gap-1 text-sm">
			<span class="text-text-secondary">This device's sync code</span>
			<div class="flex gap-2">
				<input
					readonly
					value={$settings.syncCode ?? ''}
					class="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm"
					onclick={(e) => e.currentTarget.select()}
				/>
				<Button type="button" variant="secondary" onclick={copyCode}>Copy</Button>
			</div>
		</label>

		<div class="mt-4 flex items-center gap-3">
			<Button type="button" onclick={runSync} disabled={$syncStatus.syncing}>
				{$syncStatus.syncing ? 'Syncing…' : 'Sync Now'}
			</Button>
			{#if $settings.lastSyncedAt}
				<span class="text-xs text-text-secondary"
					>Last synced {timeAgo($settings.lastSyncedAt)}</span
				>
			{/if}
		</div>
		{#if $syncStatus.error}
			<p class="mt-2 text-sm text-danger">{$syncStatus.error}</p>
		{/if}

		<form class="mt-6 flex flex-col gap-1 text-sm" onsubmit={joinCodeSubmit}>
			<span class="text-text-secondary">Sync with a different code</span>
			<div class="flex gap-2">
				<input
					bind:value={joinCode}
					placeholder="Paste a sync code from another device"
					class="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm"
				/>
				<Button type="submit" variant="secondary" disabled={!joinCode.trim()}>Use Code</Button>
			</div>
		</form>
	</div>
</div>
