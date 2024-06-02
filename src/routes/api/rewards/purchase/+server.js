import { db } from '$lib/firebase/admin';
import { json, error } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';

const takeTheMoney = async (userId, price) => {
	if (price <= 0) return;

	// to decrease value we have to increment by negative amount
	const balanceIncrement = FieldValue.increment(-Number(price));
	await db.collection('users').doc(userId).update({ coins: balanceIncrement });
};

//  POST /api/rewards/purchase
export const POST = async ({ locals, request }) => {
	const session = await locals.getSession();
	if (!session) throw error(401);

	try {
		const { type, data } = await request.json();
		if (type !== 'now' && type !== 'stash')
			throw error(406, {
				// HTTP 406 Not Acceptable
				message: `Incorrect type: ${type}. Only 'now' and 'stash' are allowed.`,
			});

		const docRef = await db
			.collection('users')
			.doc(session.user.id)
			.collection('rewards')
			.doc(data.id);

		// error 404 if reward with id does not exist
		const item = await docRef.get();
		if (!item.exists) {
			throw error(404, {
				message: `Invalid reward id: ${data.id}`,
			});
		}

		if (data.quantityInStore <= 0 && !data.isInfinite)
			throw error(406, {
				message: 'Quantity is 0 or less. Cannot purchase.',
			});

		// charge user
		if (data.price > 0) await takeTheMoney(session.user.id, data.price);

		if (data.isInfinite && type === 'now') return json(204);
		// if reward is infinite and user wants to store reward,
		// only modify inventory quantity
		if (data.isInfinite && type === 'stash') {
			await docRef.update({
				quantityInInventory: FieldValue.increment(1),
			});
			return json(204);
		}

		if (type === 'now') {
			// DECREASE quantity
			await docRef.update({ quantityInStore: FieldValue.increment(-1) });
		} else {
			// MOVE to inventory (decrease quantity, increase quantityInInventory)
			await docRef.update({
				quantityInStore: FieldValue.increment(-1),
				quantityInInventory: FieldValue.increment(1),
			});
		}
		return json({ status: 204, quantityLeft: data.quantityInStore - 1 });
	} catch (err) {
		console.error(err);
		throw error(400, { message: err.message });
	}
};
