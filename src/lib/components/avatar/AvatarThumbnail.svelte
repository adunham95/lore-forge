<script lang="ts">
	import AvatarPreview from './AvatarPreview.svelte';

	interface Props {
		seed: string;
		name: string;
	}

	let { seed, name }: Props = $props();
</script>

<AvatarPreview {seed} {name} size={32} />
