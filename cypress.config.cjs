const { SignJWT } = require('jose');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const { plugin: cypressFirebasePlugin } = require('cypress-firebase');
dotenv.config();

// helper function
const now = () => (Date.now() / 1000) | 0;

module.exports = {
	projectId: 'x334hx',
	chromeWebSecurity: false,

	e2e: {
		baseUrl: 'http://localhost:5173',
		setupNodeEvents(on, config) {
			cypressFirebasePlugin(on, config, admin, {
				projectId: 'irl-quest-cee22',
				databaseURL: 'http://127.0.0.1:8080',
			});
			on('task', {
				async encode_jwt(token) {
					// command for encoding user data to a JSON Web Token
					const maxAge = 30 * 24 * 60 * 60; // 30 days
					const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
					return await new SignJWT(token)
						.setProtectedHeader({ alg: 'HS256' })
						.setIssuedAt()
						.setExpirationTime(now() + maxAge)
						.sign(secret);
				},
			});
		},
	},
};
