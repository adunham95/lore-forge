import { error, json } from '@sveltejs/kit';
import { get, put, BlobNotFoundError } from '@vercel/blob';
import type { RequestHandler } from './$types';

// The sync code is generated client-side (see settings.ts) and never chosen by a server —
// it's both the blob's storage key and its bearer secret. Validate the shape before it
// touches a storage path.
const CODE_PATTERN = /^[a-zA-Z0-9-]{8,64}$/;

function blobPath(code: string): string {
	if (!CODE_PATTERN.test(code)) error(400, 'Invalid sync code');
	return `lore-forge-sync/${code}.json`;
}

export const GET: RequestHandler = async ({ params }) => {
	const path = blobPath(params.code);
	try {
		const result = await get(path, { access: 'private' });
		if (!result || result.statusCode !== 200) {
			return json({ bundle: null, uploadedAt: null });
		}
		const bundle = await new Response(result.stream).json();
		return json({ bundle, uploadedAt: result.blob.uploadedAt });
	} catch (err) {
		if (err instanceof BlobNotFoundError) {
			return json({ bundle: null, uploadedAt: null });
		}
		throw err;
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const path = blobPath(params.code);
	const bundle = await request.json();
	await put(path, JSON.stringify(bundle), {
		access: 'private',
		addRandomSuffix: false,
		allowOverwrite: true,
		contentType: 'application/json'
	});
	return json({ uploadedAt: new Date().toISOString() });
};
