import { db } from '$lib/firebase/admin';
import { json, error } from '@sveltejs/kit';

export const GET = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) throw error(401);

	const rewardsRef = await db
		.collection('users')
		.doc(session.user.id)
		.collection('rewards')
		.where('isInventoryOnly', '==', false);

	return rewardsRef.get().then((querySnapshot) => {
		const rewards = querySnapshot.docs.map((doc) => {
			return {
				...doc.data(),
				id: doc.id,
			};
		});

		return json(rewards);
	});
};

export const DELETE = async ({ locals, request }) => {
	const session = await locals.getSession();
	if (!session) throw error(401);

	try {
		const { id } = await request.json();
		const docRef = await db
			.collection('users')
			.doc(session.user.id)
			.collection('rewards')
			.doc(id);

		// error 404 if reward with id does not exist
		const item = await docRef.get();
		if (!item.exists) {
			throw error(404, {
				message: `Invalid reward id: ${id}`,
			});
		}

		await docRef.delete();
		return json(204);
	} catch (err) {
		console.log(err);
		throw error(400, { message: err.message });
	}
};
