function createDailyQuest() {
	cy.get('button').contains('New').click();
	cy.get('[role=dialog] > div > form').should('be.visible');
	cy.get('select').select('daily');
	cy.get('button[data-cy="questSubmit"]').click();
}

describe('Managing recurring quests', () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
		cy.exec('npm run db:reset');
		cy.visit('/');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });
	});

	it('create a daily quest', () => {
		// create a daily quest, then go to next week and check if there are 7 instances
		createDailyQuest();
		// go to next week
		cy.get('button#nextScope').click();
		cy.get('button:contains(New Quest)').should('have.length', 7);
	});

	it('complete a daily', () => {
		createDailyQuest();
		// complete quest
		cy.get('button').contains('New Quest').click();
		cy.get('button').contains('Complete').click();
		cy.get('button').contains('Confirm').click();
		// there should be one day with all quests done
		cy.get('span:contains((1/1))').should('have.length', 1);
	});

	// ---- EDITING ----
	it('edit all dailies', () => {
		createDailyQuest();
		// edit all quests
		cy.get('button').contains('New Quest').click();
		cy.get('button').contains('Edit').click();
		cy.get('button').contains('All occurences').click();

		// edit the name
		cy.get('input[name=name]').clear().type('edited');
		cy.get('button[data-cy="questSubmit"]').click();

		// go to next week
		cy.get('button#nextScope').click();
		cy.get('button:contains(edited)').should('have.length', 7);
	});

	it.skip('edit future dailies', () => {
		createDailyQuest();
		// go to next week
		cy.get('button#nextScope').click();

		// select third quest (Wednesday) with index 2
		cy.get('button:contains(New Quest)').eq(2).click();
		cy.get('button').contains('Edit').click();
		cy.get('button').contains('This and future').click();

		// edit the name
		cy.get('input[name=name]').clear().type('edited');
		cy.get('button[data-cy="questSubmit"]').click();
		// Monday and Tuesday should be normal
		cy.get('button:contains(New Quest)').should('have.length', 2);
		// Wednesday and the rest should have changed
		cy.get('button:contains(edited)').should('have.length', 5);
	});

	it.skip('edit a single daily', () => {
		createDailyQuest();
		// go to next week
		cy.get('button#nextScope').click();

		// select fourth quest (Thursday) with index 3
		cy.get('button:contains(New Quest)').eq(3).click();
		cy.get('button').contains('Edit').click();
		cy.get('button').contains('This occurence').click();

		// edit the name
		cy.get('input[name=name]').clear().type('Thursday');
		cy.get('button[data-cy="questSubmit"]').click();

		// edited quest should be visible
		cy.get('button').contains('Thursday').should('be.visible');
		// complete the quest for no particular reason
		cy.get('button').contains('Thursday').click();
		cy.get('button').contains('Complete').click();
		cy.get('button').contains('Confirm').click();
	});

	// ---- REMOVING ----
	it('remove all dailies', () => {
		createDailyQuest();
		// remove all instances
		cy.get('button').contains('New Quest').click();
		cy.get('button').contains('Abandon').click();
		cy.get('button').contains('All occurences').click();
		cy.get('button').contains('New Quest').should('not.exist');
	});

	it('remove future dailies', () => {
		createDailyQuest();
		// go to next week
		cy.get('button#nextScope').click();

		// select fifth quest (Friday) with index 4 and remove that and future instances
		cy.get('button:contains(New Quest)').eq(4).click();
		cy.get('button').contains('Abandon').click();
		cy.get('button').contains('This and future').click();

		// Monday to Thursday should still exist
		cy.get('button:contains(New Quest)').should('have.length', 4);
	});

	it('remove a single daily', () => {
		createDailyQuest();
		// go to next week
		cy.get('button#nextScope').click();

		// select second quest (Tuesday) with index 1
		cy.get('button:contains(New Quest)').eq(1).click();
		// remove the quest
		cy.get('button').contains('Abandon').click();
		cy.get('button').contains('This occurence').click();
		// there should be 6 quests left
		cy.get('button:contains(New Quest)').should('have.length', 6);
	});
});
