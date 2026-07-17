import { writable } from 'svelte/store';

/** Whether the scene editor is in distraction-free focus mode — hides app chrome. */
export const focusMode = writable(false);
