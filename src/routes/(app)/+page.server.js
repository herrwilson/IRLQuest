import { z } from 'zod';
import { db } from '$lib/firebase/admin';
import { subDays } from 'date-fns';

// to fix build time shenanigans
// TODO: look into this again after updating packages such as vite and svelte
import rrule from 'rrule';
const { datetime, rrulestr } = rrule;

import { fail, json, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';

const schema = z.object({
	id: z.string().nullable().default(null),
	name: z.string().default('New Quest'),
	reward: z.union([z.number().int().min(0).max(100000), z.string()]).default(0),
	isCoinReward: z.boolean().default(true),
	description: z.string().optional().default(''),
	date: z.date().default(new Date()),
	endDate: z.date().default(new Date()),
	isRecurring: z.boolean().default(false),
	recurrencePattern: z.string().nullable().default(null),
});

// NOTE: load (possible) quest data for the edit form
// quest data for the list view is loaded using GET /api/quests in QuestView.svelte
export const load = async ({ locals, url }) => {
	const session = await locals.getSession();
	if (!session) return { status: 401, message: 'unauthorized' };

	const editId = url.searchParams.get('edit');
	const scope = url.searchParams.get('scope');
	// if scope is missing, redirect to quest log
	if (editId && !scope) throw redirect(302, '/');

	let data = {};
	// if an edit search param has been set, get the quest's data
	// and populate the form with it
	if (editId) {
		const questDoc = await db
			.collection('users')
			.doc(session.user.id)
			.collection('quests')
			.doc(editId)
			.get();

		// if quest does not exist, redirect to quest log
		if (!questDoc.exists) throw redirect(302, '/');

		data = questDoc.data();
		data.id = questDoc.id;
		data.date = new Date(data.date.seconds * 1000);
		data.endDate = new Date(data.endDate.seconds * 1000);

		// if a recurrence pattern is not stringified before sending it from server to client or vice versa
		// newline character(s) (\n) in the pattern disappear for unknown reasons
		// TODO: find out why \n in the pattern disappears (SG-173)
		if (data.isRecurring) {
			data.recurrencePattern = JSON.stringify(data.recurrencePattern);
		}
	}

	const form = await superValidate(data, schema);
	return { form };
};

// ---------- FORM ACTIONS ----------
const performFormChecks = (form) => {
	const { isRecurring, recurrencePattern, isCoinReward, reward } = form.data;
	// default recurrencePattern to null if the value is invalid (string or undefined)
	// in that case also set isRecurring to false
	if (!recurrencePattern || recurrencePattern === 'null') {
		form.data.isRecurring = false;
		form.data.recurrencePattern = null;
	}
	// parse recurrence pattern back to proper string unless it already is in valid format
	// in which case JSON.parse throws a syntax error
	if (isRecurring && recurrencePattern) {
		form.data.recurrencePattern = JSON.parse(recurrencePattern);
	}

	// figure out reward type
	// it would probably be better to do this on client side automatically
	// but passing the custom field to server causes so much headache that its better to just do it this way
	form.data.isCoinReward = !isNaN(parseInt(reward));
	if (form.data.isCoinReward && typeof reward === 'string') {
		form.data.reward = parseInt(reward);
	}

	return form;
};

export const actions = {
	create: async ({ request, locals }) => {
		const session = await locals.getSession();
		if (!session) return fail(401);

		const form = await superValidate(request, schema).then(performFormChecks);

		if (!form.valid) {
			return fail(400, { form });
		}

		// default to not completed
		form.data.isCompleted = false;

		const newQuestDoc = await db
			.collection('users')
			.doc(session.user.id)
			.collection('quests')
			.add({
				...form.data,
				isCompleted: false,
			});

		form.data.id = newQuestDoc.id;

		return { form, newEntry: form.data };
	},

	edit: async ({ request, locals, url }) => {
		const session = await locals.getSession();
		if (!session) return fail(401);

		const form = await superValidate(request, schema).then(performFormChecks);

		if (!form.valid) {
			return fail(400, { form });
		}

		const scope = url.searchParams.get('scope');

		const DOC_REF = await db
			.collection('users')
			.doc(session.user.id)
			.collection('quests')
			.doc(form.data.id);

		const item = await DOC_REF.get();
		if (!item.exists) {
			return fail(404, {
				form,
				message: `no quest found with id ${form.data.id}`,
			});
		}

		// if quest is NOT RECURRING, or user is editing all instances, simply save changes
		if (!form.data.isRecurring || scope === 'all') {
			DOC_REF.set({ ...form.data }, { merge: true });
			return { form, questEntry: form.data };
		}
		// ----- EDIT SINGLE QUEST -----
		else if (scope === 'single') {
			// add an exception to existing quest
			const { recurrencePattern } = item.data();
			const rules = rrulestr(recurrencePattern, { forceset: true });
			rules.exdate(form.data.date);

			DOC_REF.set({ recurrencePattern: rules.toString() }, { merge: true });

			// questEntry will be sent back to the client to update the view
			const questEntry = {
				...item.data(),
				id: DOC_REF.id,
				date: new Date(item.data().date.seconds * 1000),
				endDate: new Date(item.data().endDate.seconds * 1000),
				recurrencePattern: rules.toString(),
			};

			// create a new quest with given form data
			// TODO: enable setting a new recurrence pattern when editing a single instance
			// for now just set it not recurring (SG-175)
			const newEntry = {
				...form.data,
				id: null,
				date: form.data.date,
				endDate: form.data.date,
				isRecurring: false,
				recurrencePattern: null,
			};

			const newQuestDoc = await db
				.collection('users')
				.doc(session.user.id)
				.collection('quests')
				.add(newEntry);

			newEntry.id = newQuestDoc.id;

			return { form, questEntry, newEntry };
		}
		// ----- EDIT FUTURE QUESTS -----
		else if (scope === 'future') {
			// set new end date and until value for existing quest
			const { recurrencePattern } = item.data();
			const rules = rrulestr(recurrencePattern, { forceset: true });
			const previousUntil = rules._rrule[0].origOptions.until;
			// set old rule to end yesterday
			rules._rrule[0].origOptions.until = subDays(form.data.date, 1);
			DOC_REF.update({
				recurrencePattern: rules.toString(),
				endDate: form.data.date,
			});

			// questEntry will be sent back to the client to update the view
			const questEntry = {
				...item.data(),
				id: DOC_REF.id,
				date: new Date(item.data().date.seconds * 1000),
				endDate: form.data.date,
				recurrencePattern: rules.toString(),
			};

			// create a new quest with given form data
			const newRules = rrulestr(recurrencePattern, { forceset: true });
			newRules._rrule[0].origOptions.dtstart = form.data.date;

			const newEntry = {
				...form.data,
				id: null,
				date: form.data.date,
				endDate: datetime(9999, 12, 31),
				isRecurring: true,
				recurrencePattern: newRules.toString(),
			};

			const newQuestDoc = await db
				.collection('users')
				.doc(session.user.id)
				.collection('quests')
				.add(newEntry);

			newEntry.id = newQuestDoc.id;

			return { form, questEntry, newEntry };
		}
	},
};
