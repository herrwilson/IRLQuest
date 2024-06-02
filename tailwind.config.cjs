module.exports = {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
	],
	theme: {
		screens: {
			tablet: '640px',
			laptop: '1024px',
			desktop: '1280px',
		},
		extend: {
			colors: {
				background: '#2F3038', // dark, gray-purpleish
				primary: '#5F7387', // steelish blue
				secondary: '#96A7C0', // lighter steelish blue
				ternary: '#D8D8D8', // white-ish
			},
		},
	},
	plugins: [require('flowbite/plugin')],
};
