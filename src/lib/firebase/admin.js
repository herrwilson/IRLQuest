import { initializeApp, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
dotenv.config();

// the --no-emulator flag must be passed to node itself like so
// npx vite dev -- --no-emulator
const useProduction =
	process.env.NODE_ENV === 'production' ||
	process.argv.includes('--no-emulator');

let app;
try {
	// Attempt finding an old instance
	app = getApp();
} catch (e) {
	// If finding an old instance failed, determine configurations to be used
	let firebaseConfig = {
		projectId: 'irl-quest-cee22',
		emulator: {
			host: 'localhost',
			port: 8080,
		},
	};

	if (useProduction) {
		// Set real Firebase configuration using environment variables
		delete process.env.FIRESTORE_EMULATOR_HOST;
		console.log(
			'Started in production mode. Erased FIRESTORE_EMULATOR_HOST env.',
		);

		firebaseConfig = {
			credential: cert({
				projectId: process.env.FIREBASE_PROJECT_ID,
				clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
				privateKey: process.env.FIREBASE_CLIENT_PRIVATE_KEY.replace(
					/\\n/g,
					'\n',
				),
			}),
		};
	}
	// create a new app with configs
	app = initializeApp(firebaseConfig);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
