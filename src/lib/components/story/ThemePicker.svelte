<script lang="ts">
	import { THEME_PRESETS, PRESET_HINTS, resolveTheme, deriveAccentExtras } from '$lib/utils/theme';
	import type { StoryTheme, StoryThemePreset } from '$lib/types';

	interface Props {
		value: StoryTheme;
		onChange: (theme: StoryTheme) => void;
	}

	let { value, onChange }: Props = $props();

	function selectPreset(preset: StoryThemePreset) {
		const resolved = resolveTheme({
			preset,
			accentLight: '',
			accentDark: '',
			accentSoft: '',
			accentSoftDark: '',
			accentText: ''
		});
		onChange({ preset, ...resolved });
	}

	function setCustomAccent(
		patch: Pick<StoryTheme, 'accentLight'> | Pick<StoryTheme, 'accentDark'>
	) {
		const accentLight = 'accentLight' in patch ? patch.accentLight : value.accentLight || '#2D6A4F';
		const accentDark = 'accentDark' in patch ? patch.accentDark : value.accentDark || '#74C69D';
		onChange({
			preset: 'custom',
			accentLight,
			accentDark,
			...deriveAccentExtras(accentLight, accentDark)
		});
	}

	function selectCustom() {
		onChange({
			preset: 'custom',
			accentLight: value.accentLight || '#2D6A4F',
			accentDark: value.accentDark || '#74C69D',
			...deriveAccentExtras(value.accentLight || '#2D6A4F', value.accentDark || '#74C69D')
		});
	}
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
	{#each THEME_PRESETS as preset (preset)}
		{@const resolved = resolveTheme({
			preset,
			accentLight: '',
			accentDark: '',
			accentSoft: '',
			accentSoftDark: '',
			accentText: ''
		})}
		<button
			type="button"
			onclick={() => selectPreset(preset)}
			class="rounded-lg border p-3 text-left transition {value.preset === preset
				? 'border-accent ring-2 ring-accent'
				: 'border-border hover:border-accent/40'}"
		>
			<span class="mb-2 flex h-6 overflow-hidden rounded-full">
				<span class="w-1/2" style="background-color: {resolved.accentLight}"></span>
				<span class="w-1/2" style="background-color: {resolved.accentSoft}"></span>
			</span>
			<span class="block text-sm font-medium text-text-primary capitalize">{preset}</span>
			<span class="block text-xs text-text-secondary">{PRESET_HINTS[preset]}</span>
		</button>
	{/each}

	<button
		type="button"
		onclick={selectCustom}
		class="rounded-lg border p-3 text-left transition {value.preset === 'custom'
			? 'border-accent ring-2 ring-accent'
			: 'border-border hover:border-accent/40'}"
	>
		<span class="block text-sm font-medium text-text-primary">Custom</span>
		<span class="block text-xs text-text-secondary">Pick your own colours</span>
	</button>
</div>

{#if value.preset === 'custom'}
	<div class="mt-4 flex flex-wrap gap-4">
		<label class="flex flex-col gap-1 text-sm">
			<span class="text-text-secondary">Light mode accent</span>
			<input
				type="color"
				value={value.accentLight || '#2D6A4F'}
				oninput={(e) => setCustomAccent({ accentLight: e.currentTarget.value })}
			/>
		</label>
		<label class="flex flex-col gap-1 text-sm">
			<span class="text-text-secondary">Dark mode accent</span>
			<input
				type="color"
				value={value.accentDark || '#74C69D'}
				oninput={(e) => setCustomAccent({ accentDark: e.currentTarget.value })}
			/>
		</label>
	</div>
{/if}
