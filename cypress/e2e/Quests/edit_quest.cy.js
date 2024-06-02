import { format, addDays, subDays, isSunday } from 'date-fns';

function openEditModal(name = 'New Quest') {
	cy.get('li > button').contains(name).click();
	cy.get('button').contains('Edit').click();
}

describe('Editing a quest', () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
		cy.exec('npm run db:reset');
		cy.visit('/');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });

		cy.get('button').contains('New').as('newQuest').click();
		cy.get('[role=dialog] > div > form').as('modal').should('be.visible');
		cy.get('button[data-cy="questSubmit"]').as('save').click();
	});

	it('edit nothing', () => {
		openEditModal();
		cy.get('@save').click();
		cy.get('div.message').contains('Quest saved').should('be.visible');

		// open quest info
		cy.get('li > button').contains('New Quest').click();
		cy.get('h1').contains('New Quest').should('be.visible');
		// match MM/DD/YYYY
		cy.get('span')
			.contains(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[0-1])\/\d{4}$/)
			.should('be.visible');
		// description
		cy.get('h2 ~ p').contains('-');
		// reward
		cy.get('h2 ~ div').contains('0');
	});

	it('leave name empty', () => {
		openEditModal();
		cy.get('input[name="name"]').clear();
		cy.get('@save').click();
		cy.get('input:invalid').should('have.length', 1);
		cy.get('@modal').should('be.visible');
	});

	it('enter a different name', () => {
		openEditModal();
		const newName = 'This is an edited quest!';
		cy.get('input[name="name"]').clear().type(newName);
		cy.get('@save').click();

		// open quest info
		cy.get('li > button').contains(newName).should('be.visible').click();
		cy.get('h1').contains(newName).should('be.visible');
	});

	it('selected reward type is correct', () => {
		const questName = 'Write these tests';
		const textReward = 'Coffee break';
		// create a quest
		cy.get('@newQuest').click();
		cy.get('input[name="name"]').clear().type(questName);
		// set text reward
		cy.get('button#typeToggle').click();
		cy.get('input[name="reward"]').clear().type(textReward);
		cy.get('@save').click();

		// open info
		cy.get('li > button').contains(questName).should('be.visible').click();
		// check name
		cy.get('h1').contains(questName).should('be.visible');
		// check reward
		cy.get('h2 ~ div').contains(textReward);

		// edit quest
		openEditModal(questName);
		cy.get('input[name="reward"]')
			.should('have.attr', 'type', 'text')
			.should('have.value', textReward);
	});

	it('edit coin reward', () => {
		openEditModal();
		cy.get('input[name="reward"]').type(5000);
		cy.get('@save').click();
		// check reward
		cy.get('li > button').contains('New Quest').should('be.visible').click();
		cy.get('h2 ~ div').contains('5000');
	});

	it('can enter a new date', () => {
		const todayDate = new Date();
		const todayName = format(todayDate, 'EEEE');
		const isTodaySunday = isSunday(todayDate);
		// if today is sunday set date to yesterday, otherwise to tomorrow
		const newDate = isTodaySunday
			? subDays(todayDate, 1)
			: addDays(todayDate, 1);
		const newDateName = format(newDate, 'EEEE');
		const newDateString = format(newDate, 'yyyy-MM-dd');

		// wait till the modal closes
		cy.get('@modal').should('not.exist');
		openEditModal();
		// trigger "change" is required as cypress does not correctly trigger onChange event
		// which is used to set quest's end date equal to date field in case of non-recurring quests
		// in other words, when editing quest's date, end date does not change
		cy.get('button').contains('Custom').click();
		cy.get('input[name="date"]').clear().type(newDateString).trigger('change');
		cy.get('@save').click();
		cy.get('@modal').should('not.exist');

		//  views
		cy.log('Check quest in weekly view');
		// today has no quests
		cy.get('summary').contains(todayName + ' (0)');
		// the new date has one uncompleted quest
		cy.get('summary').contains(newDateName + ' (0/1)');

		cy.log('Check quest in daily view');
		// change to daily view
		cy.get('#selectViewButton').click();
		cy.get('li > button').contains('Daily').click();
		// the quest should not exist on today
		cy.get('button').contains('New Quest').should('not.exist');

		// navigate to tomorrow or yesterday
		if (isTodaySunday) cy.get('button#previousScope').click();
		else cy.get('button#nextScope').click();
		// quest should exist on the new date
		cy.get('time').contains(newDateName);
		cy.get('button').contains('New Quest').should('be.visible');
	});
});
