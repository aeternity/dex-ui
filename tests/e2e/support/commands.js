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
  cy.visit('/swap?address=ak_rRVV9aDnmmLriPePDSvfTUvepZtR2rbYk2Mx4GCqGLcc1DMAq&networkId=ae_uat')
    .contains('.title', 'Swap')
    // popup should open with "Thanks for trying out the DEX!"
    .get('.about-dex-modal')
    .should('be.visible')
    // close the popup
    .get('.close')
    .click()
    .get('.about-dex-modal')
    .should('not.exist')
    // check that testnet is written in the network selector
    .get('.active-network')
    .should('contain', 'Testnet');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=wallet-address]').click().get('[data-cy=wallet-disconnect]').click();
  // TODO: check if we gonna disconnect from wallet.superhero.com too
});
