describe('Change view', () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
		cy.visit('/');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });
	});

	it('Weekly view is operational', () => {
		// change to weekly, the button should have text weekly
		cy.get('button#selectViewButton').click();
		cy.get('button').contains('Weekly').click();
		cy.get('button#selectViewButton > span').contains('weekly');

		cy.get('button#nextScope').click();
		cy.get('button#nextScope').click();
		cy.get('button#previousScope').click();
		cy.get('button#previousScope').click();
	});

	it('Daily view is operational', () => {
		// change to daily, the button should have text daily
		cy.get('button#selectViewButton').click();
		cy.get('button').contains('Daily').click();
		cy.get('button#selectViewButton > span').contains('daily');

		cy.get('button#nextScope').click();
		cy.get('button#nextScope').click();
		cy.get('button#previousScope').click();
		cy.get('button#previousScope').click();
	});

	it.skip('Monthly view is operational (FEATURE IN PROGRESS)', () => {});

	it.skip('Tag view is operational (FEATURE IN PROGRESS)', () => {});
});
