<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'protagonist' | 'antagonist' | 'supporting' | 'minor' | 'neutral';
		children: Snippet;
	}

	let { variant = 'neutral', children }: Props = $props();

	const variantClasses: Record<NonNullable<Props['variant']>, string> = {
		protagonist: 'bg-accent-soft text-accent',
		antagonist: 'bg-[#FEE2E2] text-[#991B1B] dark:bg-[#3B1010] dark:text-[#FCA5A5]',
		supporting: 'bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#2D1F4E] dark:text-[#C4B5FD]',
		minor: 'bg-surface-raised text-text-secondary',
		neutral: 'bg-surface-raised text-text-secondary'
	};
</script>

<span
	class="rounded-sm px-2 py-0.5 text-xs font-medium whitespace-nowrap {variantClasses[variant]}"
>
	{@render children()}
</span>
