import { writable } from 'svelte/store';
import { getSettings, saveSettings } from '$lib/db';
import type { AppSettings } from '$lib/types';

const DEFAULTS: AppSettings = { darkMode: false, editorFontSize: 16 };

export const settings = writable<AppSettings>(DEFAULTS);

export async function loadSettings() {
	const stored = await getSettings();
	const prefersDark =
		typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
	settings.set(stored ?? { ...DEFAULTS, darkMode: prefersDark });
}

export async function updateSettings(patch: Partial<AppSettings>) {
	settings.update((current) => {
		const next = { ...current, ...patch };
		saveSettings(next);
		return next;
	});
}
