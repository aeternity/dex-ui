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
Cypress.Commands.add('login', () => {
  cy.get('[data-cy=connect-wallet]')
    .click()
    .get('[data-cy=connect-Superhero]', { timeout: 60000 })
    .click()
    .get('[data-cy=connect-Superhero]', { timeout: 60000 })
    .should('not.exist')
    .get('body')
    .then((body) => {
      if (body.find('[data-cy=wallet-address]').length > 0) {
        cy.get('[data-cy=wallet-address]').should('contain', 'ak_');
      } else {
        cy.get('[data-cy=error-dismiss]', { timeout: 6000 })
          .click()
          .get('[data-cy=checkbox]')
          .click()
          .get('[data-cy=import-wallet]')
          .click()
          .get('[data-cy=textarea]')
          .type('grief huge rare weather proof clerk pilot edit speak network denial debris')
          .get('[data-cy=import]')
          .click()
          .get('button')
          .contains('Confirm')
          .click()
          .visit('/')
          .login();
      }
    });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=wallet-address]').click().get('[data-cy=wallet-disconnect]').click();
  // TODO: check if we gonna disconnect from wallet.superhero.com too
});

Cypress.Commands.add('switchTestnetNetwork', () => {
  cy.wait(1000);
  // TODO
});
