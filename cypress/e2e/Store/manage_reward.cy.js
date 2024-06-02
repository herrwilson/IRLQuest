describe('Creating a reward', () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
		cy.exec('npm run db:reset');
		cy.visit('/store');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });

		cy.get('button').contains('Add Reward').as('AddReward').click();
		cy.get('[role=dialog] > div > form').as('modal').should('be.visible');
		cy.get('button').contains('Save').as('save');
		cy.get('input[data-cy="rewardName"]').type('TestReward');
	});
	it('can delete a reward', () => {
		cy.get('@save').click();
		cy.get('h1').contains('TestReward').click();
		cy.get('button[data-cy="rewardDeleteButton"]').click();
		cy.get('#rewardList > div').should('not.exist');
		cy.contains('Reward deleted');
	});
	it('can use reward and quantity get removed', () => {
		cy.get('input[data-cy="Modalquantity"]').type('2');
		cy.get('@save').click();
		cy.get('button[data-cy="buyButton"]').click();
		cy.get('button').contains('Use').click();
		cy.get('[data-cy="RewardItemQuantity"]').contains('(1)');
		cy.contains('Reward purchased');
	});

	it('can use last reward and triggers last item used popup', () => {
		cy.get('input[data-cy="Modalquantity"]').type('1');
		cy.get('@save').click();
		cy.get('button[data-cy="buyButton"]').click();
		cy.get('button').contains('Use').click();
		cy.contains('Reward purchased');
		cy.contains('Last of type bought');
	});
	it('can use last reward and triggers last item used popup where delete reward is clicked', () => {
		cy.get('input[data-cy="Modalquantity"]').type('1');
		cy.get('@save').click();
		cy.get('button[data-cy="buyButton"]').click();
		cy.get('button').contains('Use').click();
		cy.contains('Reward purchased');
		cy.contains('Last of type bought');
		cy.get('button').contains('Remove').click();
		cy.get('#rewardList > div').should('not.exist');
		cy.contains('Reward deleted');
	});

	it('can use last reward and triggers last item used popup where edit is clicked', () => {
		cy.get('input[data-cy="Modalquantity"]').type('1');
		cy.get('@save').click();
		cy.get('button[data-cy="buyButton"]').click();
		cy.get('button').contains('Use').click();
		cy.contains('Reward purchased');
		cy.contains('Last of type bought');
		cy.wait(50);
		cy.get('button').contains('Edit').click();
		cy.get('[data-cy="rewardName"]').should('have.value', 'TestReward');
	});
});
