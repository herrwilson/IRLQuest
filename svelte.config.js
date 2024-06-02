import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		// required for mobile debugging
		csrf: {
			checkOrigin: false, // process.env.NODE_ENV !== 'development',
		},
	},
	preprocess: [
		preprocess({
			postcss: true,
		}),
	],
};

if (!config.kit.csrf.checkOrigin) {
	console.log(
		'-------- CHECKORIGIN HAS BEEN SET TO FALSE IN svelte.config.js ---------------',
	);
}

export default config;
