import { marked } from 'marked';

marked.setOptions({ breaks: true });

export function renderMarkdown(source: string): string {
	if (!source.trim()) return '';
	return marked.parse(source, { async: false });
}
