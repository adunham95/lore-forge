export function byOrder<T extends { order: number }>(items: T[]): T[] {
	return [...items].sort((a, b) => a.order - b.order);
}

export function byUpdatedDesc<T extends { updatedAt: string }>(items: T[]): T[] {
	return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
