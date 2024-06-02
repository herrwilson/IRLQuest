import { db } from '$lib/firebase/admin';
import { json } from '@sveltejs/kit';
import { minifyData, deminifyData } from '$lib/utils';

// TODO: get all templates
export const GET = async ({ request, locals, url }) => {
	const session = await locals.getSession();
	// 401 Unauthorized
	if (!session) json({ status: 401 });

	const templateColRef = await db
		.collection('users')
		.doc(session.user.id)
		.collection('templates');

	return templateColRef.get().then((querySnapshot) => {
		const templates = querySnapshot.docs.map((doc) => {
			return {
				...doc.data(),
				id: doc.id,
			};
		});
		// 200 OK
		return json({ status: 200, templates });
	});
};

// TODO: create template
export const POST = async ({ request, locals, url }) => {
	const session = await locals.getSession();
	// 401 Unauthorized
	if (!session) json({ status: 401 });

	const formData = await request.json();
	// newEntry == quest created, questEntry == quest edited
	const { name, description, isCoinReward, reward } =
		formData.newEntry ?? formData.questEntry;

	const template = await db
		.collection('users')
		.doc(session.user.id)
		.collection('templates')
		.add({
			name,
			description,
			isCoinReward,
			reward,
		});

	// 201 Created
	return json({
		status: 201,
		template: { id: template.id, name, description, isCoinReward, reward },
	});
};

// TODO: delete template
export const DELETE = async ({ request, locals, url }) => {
	const session = await locals.getSession();
	// 401 Unauthorized
	if (!session) json({ status: 401 });

	const { id } = await request.json();
	const DOC_REF = await db
		.collection('users')
		.doc(session.user.id)
		.collection('templates')
		.doc(id);

	const doc = await DOC_REF.get();
	if (!doc.exists) {
		return json({
			status: 404,
			message: `template not found with id: ${id}`,
		});
	}

	await DOC_REF.delete();
	return json({ status: 204 });
};
