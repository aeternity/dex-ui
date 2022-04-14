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
    .should('be.visible')
    .should('contain', 'Connect Wallet')
    .click()
    .wait(6000)
    .get('[data-cy=connect-Superhero]')
    .should('be.visible')
    .click()
    .wait(6000)
    .get('body')
    .then((body) => {
      if (body.find('[data-cy=wallet-address]').length > 0) {
        cy.get('[data-cy=wallet-address]')
          .should('contain', 'ak_');
      } else {
        cy
          .get('[data-cy=error-dismiss]')
          .should('contain', 'Open My Wallet')
          .click()
          .wait(3000)
          .get('[data-cy=checkbox]')
          .should('contain', 'I agree to the Superhero')
          .click()
          .get('[data-cy=import-wallet]')
          .click()
          .get('[data-cy=textarea]')
          .type('grief huge rare weather proof clerk pilot edit speak network denial debris')
          .get('[data-cy=import]')
          .should('be.visible')
          .click()
          .wait(2000)
          .get('button')
          .contains('Confirm')
          .click();
      }
    });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=wallet-address]')
    .should('be.visible')
    .click()
    .get('[data-cy=wallet-disconnect]')
    .should('be.visible')
    .click();
  // TODO: check if we gonna disconnect from wallet.superhero.com too
});

Cypress.Commands.add('switchTestnetNetwork', () => {
  cy.wait(1000);
  // TODO
});
