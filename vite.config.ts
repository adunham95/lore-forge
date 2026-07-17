import { mdsvex } from 'mdsvex';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter(),
			preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
			extensions: ['.svelte', '.svx', '.md']
		}),
		SvelteKitPWA({
			// Loreforge is local-first (all data lives in IndexedDB), so we register manually
			// via virtual:pwa-register/svelte to show an update prompt instead of reloading
			// silently mid-edit.
			registerType: 'prompt',
			injectRegister: false,
			manifest: {
				name: 'Loreforge',
				short_name: 'Loreforge',
				description: 'Build worlds. Tell stories.',
				theme_color: '#2D6A4F',
				background_color: '#F7F5F2',
				display: 'standalone',
				start_url: '/',
				scope: '/',
				icons: [
					{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
					{
						src: '/icons/icon-maskable-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: '/icons/icon-maskable-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png', 'robots.txt'],
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}']
			}
		})
	]
});
