<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { outline, saveOutline } from '$lib/stores/outline';
	import { outlineTemplates, applyOutlineTemplate } from '$lib/stores/chapters';
	import { characters, saveCharacter } from '$lib/stores/characters';
	import { locations, saveLocation } from '$lib/stores/locations';
	import { showSaveError } from '$lib/stores/toast';
	import { nowIso } from '$lib/utils/date';
	import { newId } from '$lib/utils/id';
	import { defaultAvatarOptions } from '$lib/utils/avatar';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import MarkdownEditor from '$lib/components/editor/MarkdownEditor.svelte';
	import type { OutlineTemplate, StoryOutlineAct } from '$lib/types';
	import MarkdownViewer from '$lib/components/editor/MarkdownViewer.svelte';

	const storyId = $derived(page.params.storyId as string);

	let picking = $state(false);
	let wizardTemplate = $state<OutlineTemplate | null>(null);
	let wizardActs = $state<StoryOutlineAct[]>([]);
	let step = $state(0);
	let finishing = $state(false);

	let newCharacterName = $state('');
	let newLocationName = $state('');

	/** Quick-add — just a name, so a character mentioned mid-act doesn't derail the walkthrough. Full details can be filled in later from the Characters page. */
	async function quickAddCharacter() {
		const name = newCharacterName.trim();
		if (!name) return;
		const id = newId();
		const timestamp = nowIso();
		try {
			await saveCharacter({
				id,
				storyId,
				name,
				age: null,
				job: '',
				role: 'supporting',
				appearance: '',
				personality: '',
				notes: '',
				avatar: defaultAvatarOptions(id),
				relationships: [],
				createdAt: timestamp,
				updatedAt: timestamp
			});
			newCharacterName = '';
		} catch (err) {
			showSaveError(`character "${name}" (id: ${id})`, err);
		}
	}

	async function quickAddLocation() {
		const name = newLocationName.trim();
		if (!name) return;
		const timestamp = nowIso();
		const id = newId();
		try {
			await saveLocation({
				id,
				storyId,
				name,
				type: '',
				description: '',
				notes: '',
				createdAt: timestamp,
				updatedAt: timestamp
			});
			newLocationName = '';
		} catch (err) {
			showSaveError(`location "${name}" (id: ${id})`, err);
		}
	}

	function startWizard(template: OutlineTemplate) {
		wizardTemplate = template;
		wizardActs = template.acts.map((act) => ({
			name: act.name,
			guidance: act.guidance,
			description: ''
		}));
		step = 0;
		picking = false;
	}

	function cancelWizard() {
		wizardTemplate = null;
		wizardActs = [];
		step = 0;
	}

	async function finishWizard() {
		if (!wizardTemplate) return;
		finishing = true;
		const timestamp = nowIso();
		try {
			await saveOutline({
				storyId,
				templateId: wizardTemplate.id,
				templateName: wizardTemplate.name,
				acts: wizardActs,
				createdAt: timestamp,
				updatedAt: timestamp
			});
			await applyOutlineTemplate(storyId, wizardTemplate.id);
			cancelWizard();
		} catch (err) {
			showSaveError(`outline "${wizardTemplate.name}" (story id: ${storyId})`, err);
		} finally {
			finishing = false;
		}
	}

	function confirmRestart() {
		if (
			confirm(
				"Start a new outline from a different template? Finishing the wizard will replace your current act descriptions. Existing chapters are kept, and the new template's chapters will be added alongside them."
			)
		) {
			picking = true;
		}
	}

	// Plan view — local editable copy of the saved outline, autosaved on change.
	// Keyed off createdAt (not updatedAt) so per-keystroke autosaves don't fight the
	// local edit, but a wizard restart (which always mints a fresh createdAt) still
	// forces a resync.
	let planActs = $state<StoryOutlineAct[]>([]);
	let planLoadedFor = $state<string | undefined>(undefined);

	$effect(() => {
		const current = $outline;
		if (current && planLoadedFor !== current.createdAt) {
			planActs = current.acts.map((a) => ({ ...a }));
			planLoadedFor = current.createdAt;
		}
	});

	$effect(() => {
		const current = $outline;
		if (!current || planLoadedFor !== current.createdAt) return;
		if (JSON.stringify(planActs) === JSON.stringify(current.acts)) return;

		const snapshot = planActs.map((a) => ({ ...a }));
		const timeoutId = setTimeout(async () => {
			try {
				await saveOutline({ ...current, acts: snapshot });
			} catch (err) {
				showSaveError(`outline plan (story id: ${storyId})`, err);
			}
		}, 500);

		return () => clearTimeout(timeoutId);
	});
</script>

<svelte:head><title>Outline</title></svelte:head>

{#if wizardTemplate}
	{@const total = wizardTemplate.acts.length}
	{@const current = wizardActs[step]}
	<div class="mx-auto max-w-2xl">
		<div class="mb-6">
			<p class="text-xs tracking-wide text-text-secondary uppercase">
				{wizardTemplate.name} · Act {step + 1} of {total}
			</p>
			<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
				<div
					class="h-full rounded-full bg-accent transition-all"
					style="width: {((step + 1) / total) * 100}%"
				></div>
			</div>
		</div>

		<h1 class="font-serif text-3xl">{current.name}</h1>
		<p class="mt-2 text-text-secondary">{current.guidance}</p>

		<div class="mt-5">
			<MarkdownEditor
				bind:value={current.description}
				rows={8}
				placeholder="What happens in this act?"
			/>
		</div>

		<p class="mt-5 text-xs text-text-secondary">
			Anyone or anywhere new come up? Jot them down here — you can flesh out the details later.
		</p>
		<div class="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
			<div class="rounded-lg border border-border bg-surface-raised p-3">
				<p class="mb-2 text-xs font-medium tracking-wide text-text-secondary uppercase">
					Characters
				</p>
				{#if $characters.length > 0}
					<div class="mb-2 flex flex-wrap gap-1.5">
						{#each $characters as character (character.id)}
							<span class="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent"
								>{character.name}</span
							>
						{/each}
					</div>
				{/if}
				<form
					class="flex gap-1.5"
					onsubmit={(e) => {
						e.preventDefault();
						quickAddCharacter();
					}}
				>
					<input
						bind:value={newCharacterName}
						placeholder="Add a character…"
						class="min-w-0 flex-1 rounded-md border border-border bg-surface px-2 py-1 text-sm"
					/>
					<Button type="submit" variant="secondary">+</Button>
				</form>
			</div>
			<div class="rounded-lg border border-border bg-surface-raised p-3">
				<p class="mb-2 text-xs font-medium tracking-wide text-text-secondary uppercase">
					Locations
				</p>
				{#if $locations.length > 0}
					<div class="mb-2 flex flex-wrap gap-1.5">
						{#each $locations as location (location.id)}
							<span class="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent"
								>{location.name}</span
							>
						{/each}
					</div>
				{/if}
				<form
					class="flex gap-1.5"
					onsubmit={(e) => {
						e.preventDefault();
						quickAddLocation();
					}}
				>
					<input
						bind:value={newLocationName}
						placeholder="Add a location…"
						class="min-w-0 flex-1 rounded-md border border-border bg-surface px-2 py-1 text-sm"
					/>
					<Button type="submit" variant="secondary">+</Button>
				</form>
			</div>
		</div>

		<div class="mt-6 flex items-center justify-between">
			<Button variant="ghost" onclick={cancelWizard}>Cancel</Button>
			<div class="flex gap-2">
				<Button variant="secondary" disabled={step === 0} onclick={() => step--}>Back</Button>
				{#if step < total - 1}
					<Button onclick={() => step++}>Next</Button>
				{:else}
					<Button onclick={finishWizard} disabled={finishing}>
						{finishing ? 'Saving…' : 'Finish Outline'}
					</Button>
				{/if}
			</div>
		</div>
	</div>
{:else if picking}
	<div class="mb-6 flex items-center justify-between">
		<h1 class="font-serif text-3xl">Choose a Template</h1>
		{#if $outline}
			<Button variant="ghost" onclick={() => (picking = false)}>Cancel</Button>
		{/if}
	</div>
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
		{#each outlineTemplates as template (template.id)}
			<button
				onclick={() => startWizard(template)}
				class="rounded-md border border-border bg-surface p-4 text-left transition hover:border-accent"
			>
				<p class="font-serif text-lg">{template.name}</p>
				<p class="mt-1 text-sm text-text-secondary">{template.description}</p>
				<p class="mt-2 text-xs text-text-secondary">
					{template.acts.length} acts · {template.acts.reduce(
						(sum, act) => sum + act.chapters.length,
						0
					)} chapters
				</p>
			</button>
		{/each}
	</div>
{:else if $outline}
	<div class="mb-6 flex items-start justify-between md:items-center">
		<div>
			<p class="text-xs tracking-wide text-text-secondary uppercase">{$outline.templateName}</p>
			<h1 class="font-serif text-3xl">Outline</h1>
		</div>
		<div class="flex flex-col-reverse items-center gap-4 md:flex-row">
			<a
				href={resolve('/stories/[storyId]/chapters', { storyId })}
				class="text-sm text-text-secondary hover:text-text-primary"
			>
				View Chapters &rarr;
			</a>
			<Button variant="secondary" onclick={confirmRestart}>Restart with New Template</Button>
		</div>
	</div>

	<div class="flex max-w-3xl flex-col gap-6">
		{#each planActs as act, index (act.name + index)}
			<div class="rounded-lg border border-border bg-surface p-4">
				<h2 class="font-serif text-xl">{act.name}</h2>
				<p class="mt-1 text-sm text-text-secondary italic">{act.guidance}</p>
				<div class="mt-3">
					<MarkdownViewer html={act.description} />
				</div>
			</div>
		{/each}
	</div>
{:else}
	<EmptyState
		title="No outline yet"
		description="Pick a story structure and walk through it act by act to build a plan you can reference while writing chapters and scenes."
	>
		{#snippet action()}
			<Button onclick={() => (picking = true)}>Start with a Template</Button>
		{/snippet}
	</EmptyState>
{/if}
