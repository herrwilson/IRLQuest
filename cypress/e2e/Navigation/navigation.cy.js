describe('Navigation while not logged in', () => {
	beforeEach(() => {
		cy.visit('/');
		cy.get('a[href="/"]').as('questsLink');
		cy.get('a[href="/store"]').as('storeLink');
		cy.get('a[href="/inventory"]').as('inventoryLink');
	});

	it('log should display login button', () => {
		cy.contains('Sign In with Google').should('be.visible');
		// quests is bolded, store is not
		cy.get('nav > div > a.font-bold').should('have.length', 1);
	});

	it('store should display login button', () => {
		cy.get('@storeLink').click();
		cy.contains('Sign In with Google').should('be.visible');
		// quests is not bolded, store is
		cy.get('nav > div > a.font-bold').should('have.length', 1);
	});

	it('inventory should display login button', () => {
		cy.get('@inventoryLink').click();
		cy.contains('Sign In with Google').should('be.visible');
		cy.get('nav > div > a.font-bold').should('have.length', 1);
	});
});

describe('Navigation while logged in', () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
		cy.visit('/');
		cy.get('a[href="/"]').as('questsLink');
		cy.get('a[href="/store"]').as('storeLink');
		cy.get('a[href="/inventory"]').as('inventoryLink');
	});

	it('log should NOT display login button', () => {
		cy.visit('/store');
		cy.get('@questsLink').click();
		cy.contains('Sign In with Google').should('not.exist');
		// quests is bolded, store is not
		cy.get('nav > div > a.font-bold').should('have.length', 1);
	});

	it('store should NOT display login button', () => {
		cy.get('@storeLink').click();
		cy.contains('Sign In with Google').should('not.exist');
		// quests is not bolded, store is
		cy.get('nav > div > a.font-bold').should('have.length', 1);
	});

	it('inventory should NOT display login button', () => {
		cy.get('@inventoryLink').click();
		cy.contains('Sign In with Google').should('not.exist');
		cy.get('nav > div > a.font-bold').should('have.length', 1);
	});

	it('can navigate to Quest templates', () => {
		cy.get('#sveltekit-hydrated', { timeout: 5000 });
		// open user menu
		cy.get('img#userDrop').click();
		cy.get('div[role="tooltip"]').should('be.visible');
		cy.get('button').contains('Quest Templates').click();
		// check if user got to the templates page
		cy.url().should('eq', Cypress.config().baseUrl + '/templates');
	});
});
