<script lang="ts">
	import { initials, colorFromSeed } from '$lib/utils/avatar';

	interface Props {
		seed: string;
		name: string;
		size?: number;
	}

	let { seed, name, size = 64 }: Props = $props();
	let color = $derived(colorFromSeed(seed));
</script>

<div
	class="flex shrink-0 items-center justify-center rounded-full font-serif font-semibold text-white select-none"
	style="width: {size}px; height: {size}px; background-color: {color}; font-size: {size * 0.4}px"
>
	{initials(name)}
</div>
