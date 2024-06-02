const testRewardName = 'TestReward';
function stashReward(name = testRewardName) {
	cy.get('h1')
		.contains(name)
		.parent()
		.siblings('div')
		.get("button[data-cy='buyButton']")
		.click();
	// ensure the modal is open
	cy.get('[role=dialog]').should('be.visible');
	cy.get('button').contains('Stash').click();
	// wait for database to update
	cy.wait(100);
	cy.get('div.message').contains('Reward purchased').should('be.visible');
}

describe('Stashing reward', () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
		cy.exec('npm run db:reset');
		cy.seedDatabase({ coins: 1000 });
		cy.visit('/store');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });

		// open the modal and set name to TestReward
		cy.get('button').contains('Add Reward').as('AddReward').click();
		cy.get('[role=dialog] > div > form').as('modal').should('be.visible');
		cy.get('input[data-cy="rewardName"]').type(testRewardName);
		cy.get('input[data-cy="rewardPrice"]').type(100);
		cy.get('button').contains('Save').click();

		stashReward();
	});

	it('can discard an item from the inventory', () => {
		cy.visit('/inventory');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });

		cy.get('h1').contains(testRewardName).click();
		cy.get('button[data-cy="discardButton"]').click();

		cy.get('[role=dialog]').should('be.visible');
		cy.get('button').contains('Discard').click();

		cy.get('div.message').contains('Reward discarded').should('be.visible');
		// there should be 0 rewards left
		cy.get('#inventoryList').children().should('have.length', 0);
	});

	it('can stash multiple rewards, then use 1', () => {
		// stash another one
		stashReward();
		cy.visit('/inventory');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });

		// there should be two rewards
		cy.get('span').contains('(2)');
		// h1 -> title-div -> itemBox div
		cy.get('h1')
			.contains(testRewardName)
			.parent()
			.parent()
			.get('button')
			.contains('Use')
			.click();
		cy.get('[role=dialog] button').contains('Use').click();

		cy.get('div.message').contains('Reward used').should('be.visible');
		cy.get('span').contains('(1)');
		cy.get('#inventoryList').children().should('have.length', 1);
	});

	it('can stash multiple rewards, then discard 1', () => {
		// stash another one
		stashReward();
		cy.visit('/inventory');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });

		// there should be two rewards
		cy.get('span').contains('(2)');
		// discard one
		cy.get('h1').contains(testRewardName).click();
		cy.get('button[data-cy="discardButton"]').click();
		cy.get('[role=dialog]').should('be.visible');
		cy.get('button').contains('Discard').click();

		cy.get('div.message').contains('Reward discarded').should('be.visible');
		cy.get('span').contains('(1)');
		cy.get('#inventoryList').children().should('have.length', 1);
	});
});
