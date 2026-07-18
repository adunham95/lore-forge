<script lang="ts">
	interface Props {
		html: string;
	}

	const { html }: Props = $props();
</script>

<div class="prose max-w-none p-3">
	<!-- Content is authored locally by this browser's own user and never leaves the device — no multi-tenant XSS surface. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</div>
