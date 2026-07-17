<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		type?: 'button' | 'submit';
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	}

	let {
		variant = 'primary',
		type = 'button',
		disabled = false,
		onclick,
		children
	}: Props = $props();

	const variantClasses: Record<NonNullable<Props['variant']>, string> = {
		primary: 'bg-accent text-accent-text hover:opacity-90',
		secondary: 'bg-surface-raised text-text-primary border border-border hover:bg-border/40',
		ghost: 'bg-transparent text-text-secondary hover:text-text-primary',
		danger: 'bg-danger text-white hover:opacity-90'
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="min-h-11 rounded-md px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 {variantClasses[
		variant
	]}"
>
	{@render children()}
</button>
