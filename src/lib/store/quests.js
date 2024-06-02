import { get, writable } from 'svelte/store';
import * as rrule from 'rrule';
const { RRule, datetime } = rrule;
import { getDayName, getDateString } from '$lib/utils';
import { getDay, getDate, addDays, subDays } from 'date-fns';

export const questStore = writable([]);

// ----- METHODS -----
export const getQuestIndexById = (id) => {
	const questData = get(questStore);
	return questData.findIndex((item) => item.id === id);
};

export const getQuestById = (id) => {
	const questData = get(questStore);
	// find and return quest with matching id
	const quest = questData.find((quest) => quest.id === id);
	return quest;
};

// function for updating the store with data returned from quest endpoints
export const updateQuestStoreWithFormData = (data) => {
	questStore.update((quests) => {
		const { questEntry, newEntry } = data;

		// update main quest entry
		if (questEntry) {
			const index = getQuestIndexById(questEntry.id);
			quests[index] = questEntry;
			return quests;
		}
		// add new entry to the store
		if (newEntry) {
			quests.push(newEntry);
		}

		return quests;
	});
};

export const getRecurrenceOptions = (selectedDate) => {
	const date = new Date(selectedDate);
	return {
		none: { text: 'Does not repeat', rule: null },
		daily: {
			text: 'Daily',
			rule: new RRule({
				freq: RRule.DAILY,
				dtstart: date,
				until: datetime(9999, 12, 31),
			}),
		},
		weekly: {
			text: `Weekly on ${getDayName(date)}`,
			rule: new RRule({
				freq: RRule.WEEKLY,
				dtstart: date,
				until: datetime(9999, 12, 31),
				byweekday: [getDay(date) - 1],
			}),
		},
		monthly: {
			text: `Monthly on  ${getDate(date)}`,
			rule: new RRule({
				freq: RRule.MONTHLY,
				dtstart: date,
				until: datetime(9999, 12, 31),
				bymonthday: [getDate(date)],
			}),
		},
		weekday: {
			text: 'Every weekday (Monday to Friday)',
			rule: new RRule({
				freq: RRule.WEEKLY,
				dtstart: date,
				until: datetime(9999, 12, 31),
				byweekday: [0, 1, 2, 3, 4],
			}),
		},
	};
};
