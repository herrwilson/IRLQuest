// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('loginByGoogleApi', () => {
	cy.log('Logging in to Google');
	cy.session('test_user', () => {
		// first fetch an access_token and id_token
		// then use the access_token to get user data
		// finally encode user data into a JWT and set it to a cookie
		cy.request({
			method: 'POST',
			url: 'https://www.googleapis.com/oauth2/v4/token',
			body: {
				grant_type: 'refresh_token',
				client_id: Cypress.env('GOOGLE_TEST_ID'),
				client_secret: Cypress.env('GOOGLE_TEST_SECRET'),
				refresh_token: Cypress.env('GOOGLE_TEST_REFRESH_TOKEN'),
			},
		}).then(({ body }) => {
			cy.request({
				method: 'GET',
				url: 'https://www.googleapis.com/oauth2/v3/userinfo',
				headers: { Authorization: `Bearer ${body.access_token}` },
			}).then((res) => {
				const { body } = res;
				const fullName =
					body.given_name + (body.family_name ? ' ' + body.family_name : '');

				cy.task('encode_jwt', {
					name: fullName,
					email: body.email,
					picture: body.picture,
					sub: body.sub,
					id: body.sub,
				}).then((token) => {
					cy.setCookie('next-auth.session-token', token);
				});
			});
		});
	});
});

Cypress.Commands.add('seedDatabase', (data) => {
	if (!data) throw new Error('no data passed as parameter');
	cy.callFirestore('set', 'users/102378766636138017108/', data);
});
