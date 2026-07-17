import type { StoryTheme, StoryThemePreset } from '$lib/types';

const PRESETS: Record<StoryThemePreset, Omit<StoryTheme, 'preset'>> = {
	crimson: {
		accentLight: '#9B1C2E',
		accentDark: '#E07080',
		accentSoft: '#F5DADD',
		accentSoftDark: '#3D1418',
		accentText: '#FFFFFF'
	},
	ocean: {
		accentLight: '#1A6E8A',
		accentDark: '#5BB8D4',
		accentSoft: '#D3E9EF',
		accentSoftDark: '#123542',
		accentText: '#FFFFFF'
	},
	forest: {
		accentLight: '#2D6A4F',
		accentDark: '#74C69D',
		accentSoft: '#D1EAE0',
		accentSoftDark: '#1A3D2E',
		accentText: '#FFFFFF'
	},
	dusk: {
		accentLight: '#5B2D8E',
		accentDark: '#B08FD8',
		accentSoft: '#E5D9F2',
		accentSoftDark: '#2C1846',
		accentText: '#FFFFFF'
	},
	ember: {
		accentLight: '#B45309',
		accentDark: '#FCA549',
		accentSoft: '#F5E1CB',
		accentSoftDark: '#3D2408',
		accentText: '#FFFFFF'
	},
	slate: {
		accentLight: '#2E4A6B',
		accentDark: '#7EA8D0',
		accentSoft: '#D6E0EA',
		accentSoftDark: '#182838',
		accentText: '#FFFFFF'
	}
};

export const THEME_PRESETS = Object.keys(PRESETS) as StoryThemePreset[];

export const PRESET_HINTS: Record<StoryThemePreset, string> = {
	crimson: 'Drama, dark fantasy, romance',
	ocean: 'Mystery, sci-fi, maritime',
	forest: 'Adventure, nature, folklore',
	dusk: 'Magic, gothic, cosmic horror',
	ember: 'Steampunk, warmth, western',
	slate: 'Thriller, contemporary, noir'
};

export function defaultTheme(): StoryTheme {
	return { preset: 'forest', ...PRESETS.forest };
}

/** Resolves a preset name to its hex values, or passes through custom values directly. */
export function resolveTheme(theme: StoryTheme | undefined): Omit<StoryTheme, 'preset'> {
	if (!theme) return PRESETS.forest;
	if (theme.preset === 'custom') return theme;
	return PRESETS[theme.preset];
}

function hexToRgb(hex: string): [number, number, number] {
	const clean = hex.replace('#', '');
	const n = parseInt(clean, 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(hex: string, target: [number, number, number], amount: number): string {
	const [r, g, b] = hexToRgb(hex);
	const [tr, tg, tb] = target;
	const mixed = [
		Math.round(r + (tr - r) * amount),
		Math.round(g + (tg - g) * amount),
		Math.round(b + (tb - b) * amount)
	];
	return '#' + mixed.map((c) => c.toString(16).padStart(2, '0')).join('');
}

function luminance(hex: string): number {
	const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Derives soft tints + readable text colour for a custom accent pair. */
export function deriveAccentExtras(
	accentLight: string,
	accentDark: string
): Pick<StoryTheme, 'accentSoft' | 'accentSoftDark' | 'accentText'> {
	return {
		accentSoft: mix(accentLight, [255, 255, 255], 0.85),
		accentSoftDark: mix(accentDark, [0, 0, 0], 0.8),
		accentText: luminance(accentLight) > 0.5 ? '#1A1814' : '#FFFFFF'
	};
}
