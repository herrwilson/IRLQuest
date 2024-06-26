// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';
import { attachCustomCommands } from 'cypress-firebase';

const firebaseConfig = {
	projectId: 'irl-quest-cee22',
	emulator: {
		host: 'localhost',
		port: 8080,
	},
};

firebase.initializeApp(firebaseConfig);
firebase.firestore().useEmulator('localhost', 8080);
attachCustomCommands({ Cypress, cy, firebase });
