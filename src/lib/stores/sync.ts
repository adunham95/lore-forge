import { writable, get } from 'svelte/store';
import { buildSyncBundle, applySyncBundle } from '$lib/db';
import { settings, updateSettings } from '$lib/stores/settings';
import { nowIso } from '$lib/utils/date';
import type { SyncBundle } from '$lib/types';

export const syncStatus = writable<{ syncing: boolean; error: string | null }>({
	syncing: false,
	error: null
});

/**
 * Pulls the remote bundle for this device's sync code, merges it in (newer `updatedAt`
 * wins per entity), then pushes the merged local state back up so the remote copy reflects
 * both devices' changes.
 */
export async function syncNow(): Promise<void> {
	const code = get(settings).syncCode;
	if (!code) throw new Error('No sync code yet — reload the app and try again.');

	syncStatus.set({ syncing: true, error: null });
	try {
		const pullRes = await fetch(`/api/sync/${code}`);
		if (!pullRes.ok) throw new Error(`Pull failed (${pullRes.status})`);
		const { bundle } = (await pullRes.json()) as { bundle: SyncBundle | null };
		if (bundle) await applySyncBundle(bundle);

		const localBundle = await buildSyncBundle();
		const pushRes = await fetch(`/api/sync/${code}`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(localBundle)
		});
		if (!pushRes.ok) throw new Error(`Push failed (${pushRes.status})`);

		await updateSettings({ lastSyncedAt: nowIso() });
		syncStatus.set({ syncing: false, error: null });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		syncStatus.set({ syncing: false, error: message });
		throw err;
	}
}
