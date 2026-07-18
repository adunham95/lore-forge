<script lang="ts">
	import { newId } from '$lib/utils/id';
	import Button from '$lib/components/ui/Button.svelte';
	import type { OutlineTemplate } from '$lib/types';

	interface Props {
		onCreate: (template: OutlineTemplate) => void;
		onCancel: () => void;
	}

	let { onCreate, onCancel }: Props = $props();

	interface ActDraft {
		id: string;
		name: string;
		guidance: string;
		chaptersInput: string;
	}

	let name = $state('');
	let acts = $state<ActDraft[]>([{ id: newId(), name: '', guidance: '', chaptersInput: '' }]);

	function addAct() {
		acts = [...acts, { id: newId(), name: '', guidance: '', chaptersInput: '' }];
	}

	function removeAct(id: string) {
		acts = acts.filter((a) => a.id !== id);
	}

	function updateAct(id: string, patch: Partial<ActDraft>) {
		acts = acts.map((a) => (a.id === id ? { ...a, ...patch } : a));
	}

	function submit(e: SubmitEvent) {
		e.preventDefault();
		const resolvedActs = acts
			.map((a) => ({
				name: a.name.trim(),
				guidance: a.guidance.trim(),
				chapters: a.chaptersInput
					.split(',')
					.map((c) => c.trim())
					.filter(Boolean)
			}))
			.filter((a) => a.name && a.chapters.length > 0);
		if (!name.trim() || resolvedActs.length === 0) return;
		onCreate({
			id: `custom-${newId()}`,
			name: name.trim(),
			description: 'Custom outline',
			acts: resolvedActs
		});
	}
</script>

<form class="flex flex-col gap-4" onsubmit={submit}>
	<label class="flex flex-col gap-1 text-sm">
		<span class="text-text-secondary">Outline Name</span>
		<input
			bind:value={name}
			required
			class="rounded-md border border-border bg-surface px-3 py-2"
			placeholder="My Story Structure"
		/>
	</label>

	<div class="flex flex-col gap-4">
		{#each acts as act, index (act.id)}
			<div class="rounded-lg border border-border bg-surface-raised p-4">
				<div class="mb-3 flex items-center justify-between">
					<p class="text-xs font-medium tracking-wide text-text-secondary uppercase">
						Act {index + 1}
					</p>
					{#if acts.length > 1}
						<button
							type="button"
							onclick={() => removeAct(act.id)}
							aria-label="Remove act"
							class="text-sm text-text-secondary hover:text-danger"
						>
							&times;
						</button>
					{/if}
				</div>
				<div class="flex flex-col gap-3">
					<label class="flex flex-col gap-1 text-sm">
						<span class="text-text-secondary">Act Name</span>
						<input
							value={act.name}
							oninput={(e) => updateAct(act.id, { name: e.currentTarget.value })}
							required
							class="rounded-md border border-border bg-surface px-3 py-2"
							placeholder="Act 1 - Setup"
						/>
					</label>
					<label class="flex flex-col gap-1 text-sm">
						<span class="text-text-secondary">Guidance (optional)</span>
						<textarea
							value={act.guidance}
							oninput={(e) => updateAct(act.id, { guidance: e.currentTarget.value })}
							rows="2"
							class="rounded-md border border-border bg-surface px-3 py-2"
							placeholder="A prompt to remind yourself what happens here"
						></textarea>
					</label>
					<label class="flex flex-col gap-1 text-sm">
						<span class="text-text-secondary">Chapters</span>
						<input
							value={act.chaptersInput}
							oninput={(e) => updateAct(act.id, { chaptersInput: e.currentTarget.value })}
							required
							class="rounded-md border border-border bg-surface px-3 py-2"
							placeholder="Comma separated: Opening Image, Inciting Incident, Plot Point One"
						/>
					</label>
				</div>
			</div>
		{/each}
	</div>

	<button type="button" onclick={addAct} class="self-start text-sm text-accent hover:opacity-80">
		+ Add Act
	</button>

	<div class="mt-2 flex justify-end gap-2">
		<Button variant="secondary" type="button" onclick={onCancel}>Cancel</Button>
		<Button type="submit">Continue</Button>
	</div>
</form>
