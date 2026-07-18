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
