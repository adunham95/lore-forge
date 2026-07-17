/**
 * Placeholder avatars until the DiceBear avatar builder is built.
 * Deterministic per seed so a character's placeholder stays stable.
 */
import type { AvatarOptions } from '$lib/types';

const PALETTE = ['#2D6A4F', '#9B1C2E', '#1A6E8A', '#5B2D8E', '#B45309', '#2E4A6B'];

/** Placeholder AvatarOptions so the field is populated; unused until the avatar builder ships. */
export function defaultAvatarOptions(seed: string): AvatarOptions {
	return {
		seed,
		skinColor: '#edb98a',
		hairStyle: 'shortFlat',
		hairColor: '#2c1b18',
		facialHairStyle: 'none',
		eyeStyle: 'default',
		eyebrowStyle: 'default',
		mouthStyle: 'default',
		clothingStyle: 'hoodie',
		clothingColor: '#3c4f5c',
		accessoryStyle: 'none',
		backgroundColor: '#d1d4f9'
	};
}

export function initials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '?';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function colorFromSeed(seed: string): string {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash << 5) - hash + seed.charCodeAt(i);
		hash |= 0;
	}
	return PALETTE[Math.abs(hash) % PALETTE.length];
}
