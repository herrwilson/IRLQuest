import { SvelteKitAuth } from '@auth/sveltekit';
import GoogleProvider from '@auth/core/providers/google';

import { SignJWT, jwtVerify } from 'jose';

const now = () => (Date.now() / 1000) | 0;

export const handle = SvelteKitAuth({
	secret: process.env.AUTH_SECRET,
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_ID,
			clientSecret: process.env.GOOGLE_SECRET,
			authorization: {
				params: {
					prompt: 'consent',
					access_type: 'offline',
					response_type: 'code',
				},
			},
		}),
	],
	jwt: {
		encode: async ({ secret, token, maxAge }) => {
			// generate a JSON Web Token from the user data (token) using the secret
			const _secret = new TextEncoder().encode(secret);
			const jwt = await new SignJWT(token)
				.setProtectedHeader({ alg: 'HS256' })
				.setIssuedAt()
				.setExpirationTime(now() + maxAge)
				.sign(_secret);

			return jwt;
		},
		decode: async ({ secret, token }) => {
			// verifies a JWT and returns user data
			const _secret = new TextEncoder().encode(secret);
			const { payload } = await jwtVerify(token, _secret);
			return payload;
		},
	},
	callbacks: {
		session: async ({ session, user, token }) => {
			session.user.id = token.id;
			return Promise.resolve(session);
		},
		jwt: async ({ token, user, account, profile }) => {
			if (user) {
				token.id = user.id;
			}
			return Promise.resolve(token);
		},
	},
});
