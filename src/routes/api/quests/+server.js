import { db } from '$lib/firebase/admin';
import { json } from '@sveltejs/kit';

export const GET = async ({ request, locals, url }) => {
	const session = await locals.getSession();
	// 401 Unauthorized
	if (!session) json({ status: 401 });

	const start = url.searchParams.get('start');
	const end = url.searchParams.get('end');

	// firebase does not allow multiple <=, >=, etc on different fields
	// https://firebase.google.com/docs/firestore/query-data/queries#query_limitations
	// therefore, we first query for quests that start before given end date
	// and then manually filter out those that end before given start date
	// leaving us with quests that are in requested date scope
	const questColRef = await db
		.collection('users')
		.doc(session.user.id)
		.collection('quests')
		.where('endDate', '>=', new Date(start));

	return questColRef.get().then((querySnapshot) => {
		const quests = querySnapshot.docs
			.filter((doc) => {
				const isRecurring = doc.data().isRecurring;
				const date = doc.data().date.seconds * 1000;
				return isRecurring || date <= new Date(end);
			})
			.map((doc) => {
				return {
					...doc.data(),
					id: doc.id,
					date: new Date(doc.data().date.seconds * 1000),
					endDate: new Date(doc.data().endDate.seconds * 1000),
				};
			});
		// 200 OK
		return json({ status: 200, quests });
	});
};

export const POST = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) json({ status: 401 });

	const questData = await request.json();
	const quest = await db
		.collection('users')
		.doc(session.user.id)
		.collection('quests')
		// convert dates to timestamps
		.add({
			...questData,
			date: new Date(questData.date),
			endDate: new Date(questData.endDate),
		});

	// 201 Created
	return json({ status: 201, questId: quest.id });
};

export const PATCH = async ({ request, locals, url }) => {
	const session = await locals.getSession();
	if (!session) json({ status: 401, message: 'error' });

	const questId = url.searchParams.get('id');

	const questData = await request.json();
	await db
		.collection('users')
		.doc(session.user.id)
		.collection('quests')
		.doc(questId)
		.set(
			{
				...questData,
				date: new Date(questData.date),
				endDate: new Date(questData.endDate),
			},
			{ merge: true },
		);
	// 204 No Content
	return json({ status: 204 });
};

export const DELETE = async ({ request, locals, url }) => {
	const session = await locals.getSession();
	if (!session) json({ status: 401, message: 'error' });

	const questId = url.searchParams.get('id');
	await db
		.collection('users')
		.doc(session.user.id)
		.collection('quests')
		.doc(questId)
		.delete();
	// 204 No Content
	return json({ status: 204 });
};
