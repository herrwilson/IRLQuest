describe('Creating a reward', () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
		cy.exec('npm run db:reset');
		cy.visit('/store');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });

		// open the modal and set name to TestReward
		cy.get('button').contains('Add Reward').as('AddReward').click();
		cy.get('[role=dialog] > div > form').as('modal').should('be.visible');
		cy.get('button').contains('Save').as('save');
		cy.get('input[data-cy="rewardName"]').type('TestReward');
	});

	it('cannot create reward without name', () => {
		cy.get('input[data-cy="rewardName"]').clear();
		cy.get('@save').click();
		cy.get('input[data-cy="rewardName"]:invalid').should('have.length', 1);
	});

	it('cannot create reward with negative price', () => {
		cy.get('input[data-cy="rewardPrice"]').clear().type('-1');
		cy.get('@save').click();
		cy.get('input[data-cy="rewardPrice"]:invalid').should('have.length', 1);
	});

	it('can set amount to unlimited', () => {
		cy.get('@save').click();
		cy.get('h1').contains('TestReward').click();
		cy.get('button[data-cy="rewardEditButton"]').click();
		cy.get('[type="checkbox"]').should('be.checked');
	});

	it('cannot create reward with invalid quantity value', () => {
		cy.get('input[data-cy="Modalquantity"]').clear().type('-1');
		cy.get('@save').click();
		cy.get('input[data-cy="Modalquantity"]:invalid').should('have.length', 1);
		cy.get('input[data-cy="Modalquantity"]').clear().type('0');
		cy.get('@save').click();
		cy.get('input[data-cy="Modalquantity"]:invalid').should('have.length', 1);
	});
});
