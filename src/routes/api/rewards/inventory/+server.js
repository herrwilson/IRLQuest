import { db } from '$lib/firebase/admin';
import { json, error } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';

//  GET /api/rewards/inventory
export const GET = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) throw error(401);

	const inventoryRef = await db
		.collection('users')
		.doc(session.user.id)
		.collection('rewards')
		.where('quantityInInventory', '>', 0);

	return inventoryRef.get().then((querySnapshot) => {
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
		const { reward, amountToRemove } = await request.json();
		if (amountToRemove <= 0)
			return json({ status: 204, message: 'Discarded 0 rewards.' });
		if (reward.quantityInInventory <= 0)
			throw error(400, {
				message: 'Cannot discard, quantity in inventory is 0.',
			});

		// if amountToRemove is more than there is quantity left,
		// assign realAmountToRemove to reward's quantity in order to set it to 0
		// instead of negative amount
		let realAmountToRemove = amountToRemove;
		if (amountToRemove >= reward.quantityInInventory)
			realAmountToRemove = reward.quantityInInventory;

		const docRef = await db
			.collection('users')
			.doc(session.user.id)
			.collection('rewards')
			.doc(reward.id);

		const item = await docRef.get();
		if (!item.exists) {
			throw error(404, {
				message: `Invalid reward id: ${data.id}`,
			});
		}

		await docRef.update({
			quantityInInventory: FieldValue.increment(-amountToRemove),
		});

		return json(204);
	} catch (err) {
		console.log(err);
		throw error(500, { message: err.message });
	}
};
