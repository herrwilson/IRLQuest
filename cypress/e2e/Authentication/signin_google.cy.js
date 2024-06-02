describe('Login', () => {
	before(() => {
		cy.loginByGoogleApi();
		cy.visit('/');
	});

	it('should not show sign in button', function () {
		cy.contains('Sign In with Google').should('not.exist');
	});
});
