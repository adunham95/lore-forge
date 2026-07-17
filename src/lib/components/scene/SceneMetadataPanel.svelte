<script lang="ts">
	import { newId } from '$lib/utils/id';
	import type { SceneMetadataField } from '$lib/types';

	interface Props {
		fields: SceneMetadataField[];
		onChange: (fields: SceneMetadataField[]) => void;
	}

	let { fields, onChange }: Props = $props();

	function addField() {
		onChange([...fields, { id: newId(), key: '', value: '' }]);
	}

	function updateField(id: string, patch: Partial<SceneMetadataField>) {
		onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
	}

	function removeField(id: string) {
		onChange(fields.filter((f) => f.id !== id));
	}
</script>

<div>
	<h3 class="mb-2 text-xs font-medium tracking-wide text-text-secondary uppercase">
		Scene Details
	</h3>
	<div class="flex flex-col gap-2">
		{#each fields as field (field.id)}
			<div class="flex items-center gap-1.5">
				<input
					value={field.key}
					oninput={(e) => updateField(field.id, { key: e.currentTarget.value })}
					placeholder="Time frame"
					class="w-24 min-w-0 rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
				/>
				<input
					value={field.value}
					oninput={(e) => updateField(field.id, { value: e.currentTarget.value })}
					placeholder="Morning, Day 3"
					class="min-w-0 flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
				/>
				<button
					type="button"
					onclick={() => removeField(field.id)}
					aria-label="Remove field"
					class="shrink-0 px-1 text-text-secondary hover:text-danger"
				>
					&times;
				</button>
			</div>
		{/each}
	</div>
	<button
		type="button"
		onclick={addField}
		class="mt-2 text-sm text-accent hover:opacity-80"
	>
		+ Add Field
	</button>
</div>
