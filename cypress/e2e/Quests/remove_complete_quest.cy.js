function checkUserBalance(amount) {
	cy.get('img#userDrop').click();
	cy.get('[role="tooltip"] label > div').contains(amount);
}

function completeQuest(name = 'New Quest', isCoinReward = true) {
	cy.get('li > button:not(.line-through)').contains(name).click();
	cy.get('button').contains('Complete').click();
	cy.get('button').contains('Confirm').click();
	// look for +coin toast only if quest has coin reward
	if (isCoinReward) {
		cy.get('div.message').contains(/\+\d+/).should('be.visible');
	}
}

function openEditModal(name = 'New Quest') {
	cy.get('li > button').contains(name).click();
	cy.get('button').contains('Edit').click();
}

describe('Quest completion', () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
		cy.exec('npm run db:reset');
		cy.visit('/');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });

		// create a new quest with a reward of 5000 coins
		cy.get('button').contains('New').as('newQuest').click();
		cy.get('[role=dialog] > div > form').as('modal').should('be.visible');
		cy.get('input[name="reward"]').clear().type(5000);
		cy.get('button[data-cy="questSubmit"]').as('save').click();
	});

	it('user has correct balance after completing a quest', () => {
		completeQuest();
		checkUserBalance(5000);
	});

	it('user has correct balance after completing multiple quests', () => {
		cy.get('button').contains('New').as('newQuest').click();
		cy.get('[role=dialog] > div > form').as('modal').should('be.visible');
		cy.get('input[name="reward"]').clear().type(4000);
		cy.get('@save').click();
		completeQuest();
		completeQuest();
		checkUserBalance(9000);
	});

	it('edited reward awards the correct amount', () => {
		openEditModal();
		cy.get('input[name="reward"]').clear().type(12345);
		cy.get('@save').click();
		completeQuest();
		checkUserBalance(12345);
	});

	it('Completing a quest with custom reward', () => {
		openEditModal();
		cy.get('button#typeToggle').click();
		cy.get('input[name="reward"]').clear().type('New reward');
		cy.get('@save').click();
		completeQuest('New Quest', false);

		cy.on('window:alert', (text) => {
			expect(text).to.contains(
				'Quest completed: New Quest.\nYour reward is: New reward',
			);
		});
	});
	it('Quests cannot be completed again', () => {
		completeQuest();
		cy.get('summary').contains('(1/1)').click();
		cy.get('li > button').contains('New Quest').click();
		cy.get('button').contains('Complete').should('be.disabled');
	});
	it('Completed quest cannot be edited', () => {
		completeQuest();
		cy.get('summary').contains('(1/1)').click();
		cy.get('li > button').contains('New Quest').click();
		cy.get('button').contains('Edit').should('be.disabled');
	});
});

describe('Quest removal', () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
		cy.exec('npm run db:reset');
		cy.visit('/');
		cy.wait(1000);

		// create a new quest with a reward of 5000 coins
		cy.get('button').contains('New').as('newQuest').click();
		cy.get('[role=dialog] > div > form').as('modal').should('be.visible');
		cy.get('input[name="reward"]').clear().type(5000);
		cy.get('button[data-cy="questSubmit"]').as('save').click();
	});

	it('Remove a quest', () => {
		cy.get('li > button').contains('New Quest').click();
		cy.get('button').contains('Abandon').click();
		cy.get('button').contains('Confirm').click();
		cy.get('summary').contains('(0/1)').should('not.exist');
	});
	it('Remove a completed quest', () => {
		completeQuest();
		cy.get('summary').contains('(1/1)').click();
		cy.get('li > button').contains('New Quest').click();
		cy.get('button').contains('Remove').click();
		cy.get('button').contains('Confirm').click();
		cy.get('summary').contains('(1/1)').should('not.exist');
	});
});
