// Core entity types — see tech-design.md §3

export type StoryThemePreset = 'crimson' | 'ocean' | 'forest' | 'dusk' | 'ember' | 'slate';

export interface StoryTheme {
	preset: StoryThemePreset | 'custom';
	// If preset is 'custom', the values below are used directly.
	// If a named preset is selected, these are derived from it at render time.
	accentLight: string;
	accentDark: string;
	accentSoft: string;
	accentSoftDark: string;
	accentText: string;
}

export interface Story {
	id: string;
	title: string;
	synopsis: string;
	genre: string;
	theme: StoryTheme;
	seriesId?: string;
	seriesOrder?: number; // book position within the series
	createdAt: string; // ISO 8601
	updatedAt: string;
}

export interface Series {
	id: string;
	title: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting' | 'minor';

export interface CharacterRelationship {
	targetCharacterId: string;
	label: string;
	description: string;
}

export interface AvatarOptions {
	seed: string;
	skinColor: string;
	hairStyle: string;
	hairColor: string;
	facialHairStyle: string; // or "none"
	eyeStyle: string;
	eyebrowStyle: string;
	mouthStyle: string;
	clothingStyle: string;
	clothingColor: string;
	accessoryStyle: string; // or "none"
	backgroundColor: string;
}

export interface Character {
	id: string;
	// Exactly one of these is set: `storyId` for a character that belongs to a
	// single book, `seriesId` for a character shared across every book in the series.
	storyId?: string;
	seriesId?: string;

	name: string;
	age: number | null;
	job: string;
	role: CharacterRole;

	appearance: string;
	personality: string;
	notes: string; // Markdown

	avatar: AvatarOptions;

	relationships: CharacterRelationship[];

	createdAt: string;
	updatedAt: string;
}

export interface Location {
	id: string;
	// Exactly one of these is set: `storyId` for a location that belongs to a
	// single book, `seriesId` for a location shared across every book in the series.
	storyId?: string;
	seriesId?: string;
	name: string;
	type: string;
	description: string;
	notes: string; // Markdown
	createdAt: string;
	updatedAt: string;
}

export interface StoryObject {
	id: string;
	// Exactly one of these is set: `storyId` for an object that belongs to a
	// single book, `seriesId` for an object shared across every book in the series.
	storyId?: string;
	seriesId?: string;
	name: string;
	type: string; // free text: "Ship", "Weapon", "Artifact", etc.
	description: string;
	notes: string; // Markdown
	createdAt: string;
	updatedAt: string;
}

export interface LoreEntry {
	id: string;
	// Exactly one of these is set: `storyId` for a lore entry that belongs to a
	// single book, `seriesId` for a lore entry shared across every book in the series.
	storyId?: string;
	seriesId?: string;
	title: string;
	category: string;
	content: string; // Markdown
	createdAt: string;
	updatedAt: string;
}

export interface Chapter {
	id: string;
	storyId: string;
	title: string;
	act: string; // free text, e.g. "Act 1 - Departure"; empty string if unassigned
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface OutlineTemplateAct {
	name: string;
	guidance: string; // prompt shown in the outline wizard, e.g. "Who is your hero, and what call disrupts their world?"
	chapters: string[];
}

export interface OutlineTemplate {
	id: string;
	name: string;
	description: string;
	acts: OutlineTemplateAct[];
}

export interface StoryOutlineAct {
	name: string;
	guidance: string;
	description: string; // the user's own write-up of what happens in this act
}

export interface StoryOutline {
	storyId: string; // one outline per story; also its IDB key
	templateId: string;
	templateName: string;
	acts: StoryOutlineAct[];
	createdAt: string;
	updatedAt: string;
}

export interface SceneMetadataField {
	id: string;
	key: string;
	value: string;
}

export interface Scene {
	id: string;
	storyId: string;
	chapterId: string;
	title: string;
	content: string; // Markdown
	characterIds: string[];
	locationId: string | null;
	objectIds: string[];
	povCharacterId: string | null; // whose point of view the scene is told from
	metadata: SceneMetadataField[]; // free-form fields, e.g. "Time frame" -> "Morning, Day 3"
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface AppSettings {
	darkMode: boolean;
	editorFontSize: number; // px, default 16
}
