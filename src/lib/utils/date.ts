export function nowIso(): string {
	return new Date().toISOString();
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 1000 * 60 * 60 * 24 * 365],
	['month', 1000 * 60 * 60 * 24 * 30],
	['week', 1000 * 60 * 60 * 24 * 7],
	['day', 1000 * 60 * 60 * 24],
	['hour', 1000 * 60 * 60],
	['minute', 1000 * 60]
];

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** Formats an ISO timestamp as "3 hours ago", "just now", etc. */
export function timeAgo(iso: string): string {
	const diffMs = Date.now() - new Date(iso).getTime();
	for (const [unit, ms] of UNITS) {
		const value = Math.floor(diffMs / ms);
		if (value >= 1) return rtf.format(-value, unit);
	}
	return 'just now';
}
