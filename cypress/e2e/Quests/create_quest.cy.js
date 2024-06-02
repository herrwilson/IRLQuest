describe('Creating a quest', () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
		cy.exec('npm run db:reset');
		cy.visit('/');
		cy.get('#sveltekit-hydrated', { timeout: 5000 });

		cy.get('button').contains('New').as('newQuest').click();
		cy.get('[role=dialog] > div > form').as('modal').should('be.visible');
		cy.get('button[data-cy="questSubmit"]').as('save');
	});

	it('can save without editing', () => {
		cy.get('@save').click();
		cy.get('div.message').contains('Quest created').should('be.visible');
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
		cy.get('input[name="name"]').clear();
		cy.get('@save').click();
		cy.get('input:invalid').should('have.length', 1);
		cy.get('@modal').should('be.visible');
	});

	it('cannot enter a negative coin amount', () => {
		cy.get('input[name="reward"]').clear().type('-120');
		cy.get('input:invalid').should('have.length', 1);
		cy.get('@save').click();
		cy.get('@modal').should('be.visible');
	});

	// this test has apprently never worked because of .should("not.have.text")
	// expects another attribute, so the test simply checked
	// if the reward did not have text undefined which is always correct
	it.skip('can leave custom reward empty', () => {
		cy.get('button#typeToggle').click();
		cy.get('input[name="reward"]').clear();
		cy.get('@save').click();
		// open quest info
		cy.get('li > button').contains('New Quest').click();
		cy.get('h1').contains('New Quest').should('be.visible');
		cy.get('div.message').contains('Quest created').should('be.visible');
		// open quest info
		cy.get('li > button').contains('New Quest').click();
		// reward should not exist or it should be a dash
		cy.get('h2 ~ div').should(/* not.exist or have.text, "-" */);
	});

	it('resets reward when type is changed from coin to custom', () => {
		cy.get('input[name="reward"]').clear().type('1000');
		cy.get('button#typeToggle').click();
		cy.get('input[name="reward"]').should('have.value', '');
	});

	it('resets reward when type is changed from custom to coin', () => {
		cy.get('button#typeToggle').click();
		cy.get('input[name="reward"]').clear().type('chocolate bar');
		cy.get('button#typeToggle').click();
		cy.get('input[name="reward"]').should('have.value', '');
	});

	// when the view is set to weekly, always default to the current date
	// in case of view being daily, default to the date user is on
	it('should default date field to current date in weekly view', () => {
		// exit the modal
		cy.get('input[name="name"]').type('{esc}');
		cy.get('#selectViewButton').click();
		cy.get('li > button').contains('Weekly').click();
		cy.get('@newQuest').click();
		cy.get('input[name="date"]').should(
			'have.value',
			new Date().toISOString().slice(0, 10),
		);
	});

	it('should default date field to the date the user is on in daily view', () => {
		// exit the moda
		cy.get('input[name="name"]').type('{esc}');
		// change to daily view
		cy.get('#selectViewButton').click();
		cy.get('li > button').contains('Daily').click();
		// go to yesterday
		cy.get('button#previousScope').click();
		cy.get('@newQuest').click();
		let date = new Date();
		date.setDate(date.getDate() - 1);
		// check date is correct
		cy.get('input[name="date"]').should(
			'have.value',
			new Date(date).toISOString().slice(0, 10),
		);
	});

	it('cannot leave custom date empty', () => {
		cy.get('button').contains('Custom').click();
		cy.get('input[name="date"]').clear();
		cy.get('input:invalid').should('have.length', 1);
		cy.get('@save').click();
		cy.get('@modal').should('be.visible');
	});

	it('can enter a valid custom date', () => {
		cy.get('button').contains('Custom').click();
		cy.get('input[name="date"]').type('2023-08-27');
		cy.get('@save').click();
	});

	it('can use the Tomorrow date button', () => {
		cy.get('button').contains('Tomorrow').click();
		let date = new Date();
		date.setDate(date.getDate() + 1);
		// check date is correct
		cy.get('input[name="date"]').should(
			'have.value',
			new Date(date).toISOString().slice(0, 10),
		);
	});

	it('can use the Next week date button', () => {
		cy.get('button').contains('Next week').click();
		let date = new Date();
		date.setDate(date.getDate() + 7);
		// check date is correct
		cy.get('input[name="date"]').should(
			'have.value',
			new Date(date).toISOString().slice(0, 10),
		);
	});

	it('can use the Today date button', () => {
		cy.get('button').contains('Tomorrow').click();
		cy.get('form button').contains('Today').click();
		let date = new Date();
		// check date is correct
		cy.get('input[name="date"]').should(
			'have.value',
			new Date(date).toISOString().slice(0, 10),
		);
	});
});
