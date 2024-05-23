import aeSdk from './testAeSdk';

Cypress.Commands.add('login', () => {
  cy.visit(`/swap?address=${aeSdk.address}&networkId=ae_uat`)
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
