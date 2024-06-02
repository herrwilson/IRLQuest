import { browser, dev } from '$app/environment';
import { initializeApp } from 'firebase/app';
import { readable } from 'svelte/store';

const firebaseConfig = JSON.parse(
	import.meta.env.VITE_FIREBASE_CLIENT_CONFIG || '{}',
);

function createApp() {
	let app;

	const { subscribe } = readable(undefined, (set) => {
		const init = async () => {
			if (!app) {
				app = initializeApp(firebaseConfig);
			}
			set(app);
		};

		if (browser) init();
	});

	return { subscribe };
}

export const app = createApp();
