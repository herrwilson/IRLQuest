import { db } from '$lib/firebase/admin';
import { json } from '@sveltejs/kit';
import { minifyData, deminifyData } from '$lib/utils';

export const GET = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) return json({ coin: 0 });

	const userRef = await db.collection('users').doc(session.user.id);
	userRef.get().then(async (doc) => {
		if (!doc.exists) {
			await userRef.set({ coins: 0 });
		}
	});

	return userRef
		.get()
		.then((userRef) => userRef.data())
		.then((data) =>
			json({
				coins: parseInt(data?.coins) || 0,
			}),
		)
		.catch((error) => console.log(error.message));
};

const ALLOWED_POST_TYPES = ['quests', 'rewards', 'coins', 'inventory'];
export const POST = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) json({ status: 401, message: 'error' });

	const { type, data } = await request.json();
	if (!ALLOWED_POST_TYPES.includes(type))
		throw new TypeError(`invalid type in POST: ${type}`);

	// merge option sets only specified fields instead of overwriting everything
	const userRef = await db.collection('users').doc(session.user.id);
	await userRef.set({ [type]: minifyData(data) }, { merge: true });

	return json({ status: 200, message: 'success' });
};
