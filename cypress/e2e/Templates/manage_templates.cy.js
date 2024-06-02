function createTemplateFromNewQuest() {
	// open quest modal
	cy.get('button').contains('New').click();
	cy.get('[data-cy="saveTemplateCheckbox"]').as('templateCheckbox').click();
	cy.get('@templateCheckbox').should('be.checked');
	cy.get('button[data-cy="questSubmit"]').click();
	// notification is displayed
	cy.contains('Template saved!');
}

describe('Template management', () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
		cy.exec('npm run db:reset');
		cy.visit('/');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });
		createTemplateFromNewQuest();
	});

	it('can create a template from New Quest', () => {
		// template is created in beforeEach, so just proceed
		// navigate straight to /templates, actual user-like navigation can be done in navigation tests
		cy.visit('/templates');
		cy.get('details > summary').contains('New Quest');
	});

	it('can create a template from Edit Quest', () => {
		// create quest
		cy.get('button').contains('New').click();
		cy.get('input[name="name"]').clear().type('edit this');
		cy.get('[data-cy="saveTemplateCheckbox"]').should('not.be.checked');
		cy.get('button[data-cy="questSubmit"]').click();

		// edit quest
		cy.intercept('POST', '/api/templates').as('saveTemplate');
		cy.get('#categoriesList li').contains('edit this').click();
		cy.get('button').contains('Edit').click();
		cy.get('[data-cy="saveTemplateCheckbox"]').click();
		cy.get('[data-cy="saveTemplateCheckbox"]').should('be.checked');
		cy.get('button[data-cy="questSubmit"]').click();
		// wait for modal to close
		cy.get('[role="dialog"]').should('not.exist');

		cy.wait('@saveTemplate').its('response.statusCode').should('eq', 200);

		cy.visit('/templates');
		cy.get('details > summary').contains('edit this');
	});

	it('can edit a template', () => {
		cy.visit('/templates');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });

		cy.get('details > summary').contains('New Quest').click();
		cy.get('[data-cy="templateEdit"]').click();
		cy.get('[role="dialog"]').should('be.visible');
		cy.get('input[name="name"]').clear().type('edited template');

		cy.intercept('POST', '/templates?/edit').as('saveTemplate');
		cy.get('button[data-cy="templateSubmit"]').click();
		cy.wait('@saveTemplate').its('response.statusCode').should('eq', 200);
		cy.get('details > summary').contains('edited template');
	});

	it('can remove a template', () => {
		cy.visit('/templates');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });

		cy.get('details > summary').contains('New Quest').click();
		cy.intercept('DELETE', '/api/templates').as('removeTemplate');
		cy.get('[data-cy="templateRemove"]').click();
		cy.wait('@removeTemplate').its('response.statusCode').should('eq', 200);
		cy.get('details > summary').should('not.exist');
	});
});

describe('Quest creation', () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
		cy.exec('npm run db:reset');
		cy.visit('/');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });
	});

	it('should display user a text if they have no templates when using split button to create quest', () => {
		cy.get('#createQuestMoreOptions').click();
		cy.get('[role="tooltip"] button').contains('Use template').click();
		cy.contains('No templates').should('be.visible');
	});

	it('can use template from New Quest split button', () => {
		createTemplateFromNewQuest();
		cy.visit('/');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });
		// open list
		cy.get('#createQuestMoreOptions').click();
		cy.get('[role="tooltip"] button').contains('Use template').click();

		cy.get('div[role="dialog"]').should('be.visible');
		cy.contains('New Quest').should('be.visible');
		// cy.wait(1000);
		cy.get('div[role="dialog"] button').contains('Use').click();

		// edit name and save
		cy.intercept('POST', '/?/create').as('createQuestWithTemplate');
		cy.get('input[name="name"]').clear().type('edited name');
		cy.get('button[data-cy="questSubmit"]').click();
		cy.wait('@createQuestWithTemplate')
			.its('response.statusCode')
			.should('eq', 200);

		// there should be only one quest with given name
		cy.get('li[role="none"] button:contains("edited name")').should(
			'have.length',
			1,
		);
	});

	it('can use template from Templates page', () => {
		createTemplateFromNewQuest();
		cy.visit('/templates');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });
		// select template and open modal
		cy.get('details > summary').contains('New Quest').click();
		cy.get('button[data-cy="templateCreateQuest"]').click();
		// save quest
		cy.intercept('POST', '/?/create').as('createQuestWithTemplate');
		cy.get('button[data-cy="questSubmit"]').click();
		cy.wait('@createQuestWithTemplate')
			.its('response.statusCode')
			.should('eq', 200);
		// there should be two quests with the same name
		cy.get('li[role="none"] button:contains("New Quest")').should(
			'have.length',
			2,
		);
	});
});
