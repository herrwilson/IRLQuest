import { db } from '$lib/firebase/admin';
import { json, fail } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';

// to fix build time shenanigans
// TODO: look into this again after updating packages such as vite and svelte
import rrule from 'rrule';
const { RRuleSet, rrulestr } = rrule;

const setQuestData = async (userId, questId, questData) => {
	await db
		.collection('users')
		.doc(userId)
		.collection('quests')
		.doc(questId)
		.set(questData, { merge: true });
};

const addCoinsToBalance = async (userId, isCoinReward, reward) => {
	if (!isCoinReward) return;

	// increment current value in db by the amount of coin reward
	// otherwise we would need to first get the old value, then update
	const rewardIncrement = FieldValue.increment(Number(reward));
	await db.collection('users').doc(userId).update({ coins: rewardIncrement });
};

export const PATCH = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) fail(401);

	const questData = await request.json();
	const isRecurring = questData.isRecurring;

	// get rid of recurring quests' instance index in their id (questId_index)
	questData.id = questData.id.split('_')[0];

	// convert date strings to proper date objects
	questData.date = new Date(questData.date);
	questData.endDate = new Date(questData.endDate);

	// NON-RECURRING
	// simply set the quest completed and return updated data to client
	if (!isRecurring) {
		questData.isCompleted = true;
		await setQuestData(session.user.id, questData.id, questData);
		await addCoinsToBalance(
			session.user.id,
			questData.isCoinReward,
			questData.reward,
		);
		return json({ status: 200, questData });
	}

	// RECURRING
	// a) add exception date to the recurrence pattern and save the data
	const rules = rrulestr(questData.recurrencePattern, { forceset: true });
	rules.exdate(new Date(questData.date));
	questData.recurrencePattern = rules.toString();
	await setQuestData(session.user.id, questData.id, questData);

	// reward the user
	await addCoinsToBalance(
		session.user.id,
		questData.isCoinReward,
		questData.reward,
	);

	// b) save completed quest as a new document/entry
	const newQuestEntry = {
		...questData,
		id: null,
		endDate: questData.date,
		isCompleted: true,
		isRecurring: false,
		recurrencePattern: null,
	};

	// save the entry and get the entry's id in return
	const { id: newId } = await db
		.collection('users')
		.doc(session.user.id)
		.collection('quests')
		.add(newQuestEntry);

	newQuestEntry.id = newId;

	// 200 OK
	return json({ status: 200, questData, newQuest: newQuestEntry });
};
