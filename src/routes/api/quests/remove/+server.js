import { db } from '$lib/firebase/admin';
import { json } from '@sveltejs/kit';
import { subDays } from 'date-fns';

// to fix build time shenanigans
// TODO: look into this again after updating packages such as vite and svelte
import rrule from 'rrule';
const { rrulestr } = rrule;

export const DELETE = async ({ request, locals, url }) => {
	const session = await locals.getSession();
	if (!session) json({ status: 401, message: 'unauthorized' });

	const scope = url.searchParams.get('scope');
	const questData = await request.json();
	const isRecurring = questData.isRecurring;

	// get rid of recurring quests' instance index in their id (questId_index)
	questData.id = questData.id.split('_')[0];

	// make sure dates are proper date objects
	questData.date = new Date(questData.date);
	questData.endDate = new Date(questData.endDate);

	// reference to the quest in the database
	// if there is no quest for the id, return an error
	const DOC_REF = await db
		.collection('users')
		.doc(session.user.id)
		.collection('quests')
		.doc(questData.id);

	const item = await DOC_REF.get();
	if (!item.exists) {
		return json({
			status: 404,
			message: `quest not found with id: ${questData.id}`,
		});
	}

	// if quest is not recurring, or user is removing all quests, remove the entry
	if (!isRecurring || scope === 'all') {
		await DOC_REF.delete();
		return json({ status: 204 });
	}
	// if the user is editing a single or all future instances, edit the recurrence rule
	else if (scope === 'single') {
		// add a single exception date to the rule
		const rules = rrulestr(questData.recurrencePattern, { forceset: true });
		rules.exdate(questData.date);
		DOC_REF.update({ recurrencePattern: rules.toString() });

		// return updated data to client
		questData.recurrencePattern = rules.toString();
		return json({ status: 200, message: 'quest removed', quest: questData });
	} else if (scope === 'future') {
		// edit quest's recurrence to end yesterday to remove this and all future occurences
		const rules = rrulestr(questData.recurrencePattern, { forceset: true });
		rules._rrule[0].origOptions.until = subDays(questData.date, 1);
		DOC_REF.update({
			recurrencePattern: rules.toString(),
			endDate: questData.date,
		});

		// return updated data to client
		questData.recurrencePattern = rules.toString();
		questData.endDate = questData.date;
		return json({ status: 200, message: 'quest removed', quest: questData });
	}
};
