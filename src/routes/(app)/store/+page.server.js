import { db } from '$lib/firebase/admin';
import { _getNewId } from '$lib/utils';
import { superValidate } from 'sveltekit-superforms/server';
import { fail } from '@sveltejs/kit';
import rewardSchema from '$lib/schemas/reward.js';

// form field is marked as tainted if user touches an input field at all,
// even if they return it to the same value it was previously before submitting
// this function goes through allegedly changed fields, and verifies
// if they have actually changed
const _getActuallyTaintedFields = (tainted, formData, dataInDB) => {
	const keys = Object.keys(tainted);
	if (keys.length === 0) return { tainted, taintedLength: 0 };

	keys.forEach((key) => {
		if (tainted[key] === false) delete tainted[key];
		const isSame = dataInDB[key] === formData[key];
		if (isSame) delete tainted[key];
	});

	return {
		tainted,
		taintedLength: Object.keys(tainted).length,
	};
};

export const load = async ({ fetch, depends }) => {
	const form = await superValidate(rewardSchema);
	const rewardRes = await fetch('/api/rewards');
	const rewards = await rewardRes.json();

	depends('get:rewards');

	return { form, rewards };
};

export const actions = {
	default: async ({ request, locals }) => {
		const session = await locals.getSession();
		if (!session) return fail(401);

		// validate form data
		try {
			const formData = await request.formData();
			const form = await superValidate(formData, rewardSchema);

			if (!form.valid) return fail(400, { form });

			// reward cannot have quantity AND be infinite
			if (form.data.quantityInStore && form.data.isInfinite) {
				form.data.quantityInStore = null;
			}

			// quantity cannot be undefined AND be not-infinite
			if (!form.data.quantityInStore) {
				form.data.quantityInStore = null;
				form.data.isInfinite = true;
			}

			// db actions
			if (!form.data.id) {
				// CREATE reward
				// delete id field since it does not exist
				// firebase will generate an id automatically
				delete form.data.id;
				const doc = await db
					.collection('users')
					.doc(session.user.id)
					.collection('rewards')
					.add(form.data);
				form.data.id = doc.id;

				return { status: 201, form };
			} else {
				// EDIT reward
				const docRef = await db
					.collection('users')
					.doc(session.user.id)
					.collection('rewards')
					.doc(form.data.id);

				// error 404 if reward with id does not exist
				const item = await docRef.get();
				if (!item.exists) {
					return fail(404, {
						form,
						message: `No reward found with id ${form.data.id}`,
					});
				}
				let tainted = {};
				let taintedLength = 0;
				if (formData.has('tainted')) {
					const _t = JSON.parse(formData.get('tainted'));
					// some paranthesis fuckery as per js standards
					// it does not work otherwise and I don't really know why
					({ tainted, taintedLength } = _getActuallyTaintedFields(
						_t,
						form.data,
						item.data(),
					));
				}
				// EDIT NORMALLY
				// normally edit the reward if it doesn't exist in the inventory
				// NOTE: quantityInInventory is always 0 in form.data so look it up from db
				if (item.data().quantityInInventory === 0) {
					await docRef.set({ ...form.data }, { merge: true });
					return { status: 200, form };
				}

				// EDIT ONLY QUANTITY IN STORE
				if (taintedLength === 1 && tainted.quantityInStore) {
					const quantityInStore = form.data.quantityInStore;
					await docRef.set({ quantityInStore }, { merge: true });
					return { status: 200, form };
				}

				// SPLIT
				// otherwise, hide old reward from the store
				// (and set quantityInStore to 0) and...
				await docRef.set(
					{ isInventoryOnly: true, quantityInStore: 0 },
					{ merge: true },
				);
				// create a new entry with quantityInInventory set to 0
				// delete old id field to not save it the new entry
				delete form.data.id;
				const doc = await db
					.collection('users')
					.doc(session.user.id)
					.collection('rewards')
					.add(form.data);
				// set new id
				form.data.id = doc.id;
				return { status: 201, form };
			}
		} catch (err) {
			console.error(err);
			return fail(400, { err, form });
		}
	},
};
