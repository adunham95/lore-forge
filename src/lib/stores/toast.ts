import { writable } from 'svelte/store';

export interface Toast {
	id: number;
	message: string;
	variant: 'success' | 'error';
}

export const toasts = writable<Toast[]>([]);

let nextId = 0;

export function showToast(message: string, variant: Toast['variant'] = 'success') {
	const id = nextId++;
	toasts.update((all) => [...all, { id, message, variant }]);
	// setTimeout(() => dismissToast(id), 3000);
	setTimeout(() => dismissToast(id), 10000);
}

export function dismissToast(id: number) {
	toasts.update((all) => all.filter((t) => t.id !== id));
}

function describeError(err: unknown): string {
	if (err instanceof Error) return `${err.name}: ${err.message}`;
	if (typeof err === 'string') return err;
	try {
		return JSON.stringify(err);
	} catch {
		return String(err);
	}
}

/** Shows a verbose error toast for a failed save, including the underlying error and a likely cause. */
export function showSaveError(subject: string, err: unknown) {
	showToast(
		`Failed to save ${subject}. ${describeError(err)}. This is usually caused by the browser's local storage being full or blocked (e.g. private browsing mode) — check your browser's storage settings and try again.`,
		'error'
	);
}
