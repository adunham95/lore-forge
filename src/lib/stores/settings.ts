import { writable } from 'svelte/store';
import { getSettings, saveSettings } from '$lib/db';
import { newId } from '$lib/utils/id';
import type { AppSettings } from '$lib/types';

const DEFAULTS: AppSettings = { darkMode: false, editorFontSize: 16 };

export const settings = writable<AppSettings>(DEFAULTS);

export async function loadSettings() {
	const stored = await getSettings();
	const prefersDark =
		typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
	let next = stored ?? { ...DEFAULTS, darkMode: prefersDark };

	// Every device needs a sync code from the moment it's opened, so one device can hand it
	// to another before either has synced anything.
	if (!next.syncCode) {
		next = { ...next, syncCode: newId() };
		await saveSettings(next);
	}

	settings.set(next);
}

export async function updateSettings(patch: Partial<AppSettings>) {
	settings.update((current) => {
		const next = { ...current, ...patch };
		saveSettings(next);
		return next;
	});
}
