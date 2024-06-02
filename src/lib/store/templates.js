import { writable } from 'svelte/store';

export const templateStore = writable([]);

export const saveAsTemplate = (data) => {
	// newEntry when creating a quest, questEntry when editing
	// TODO/IDEA?: rework to have the same name regardless for simplicity
	templateStore.update((templates) => {
		templates.push(data);
		return templates;
	});
};
