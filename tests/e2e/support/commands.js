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

Cypress.Commands.add('selectToken', (slot, token) => {
  // get first .input-token
  cy.get('.input-token button')
    .eq(slot)
    .click()
    // token pop up should open
    .get('.select-token-modal')
    .should('be.visible');
  // select first token
  if (token) {
    cy.get('.select-token-modal .search-bar')
      .type(token)
      .get('.select-token-modal .import-button')
      .click()
      // warning should be shown
      .get('.select-token-modal')
      .should('contain', 'Make sure this is the token that you want to trade.')
      // confirm import
      .get('.select-token-modal .import-button')
      .click();
  } else {
    cy.get('.select-token-modal .token').click();
  }
});

Cypress.Commands.add('interceptTxPost', () => {
  cy.intercept(
    {
      method: 'POST',
      url: 'https://testnet.aeternity.io/v3/transactions*',
      times: 1,
    },
    { tx_hash: 'th_8zREhgdJmg8LxG5hnJ2Eq63n7ZTbJMeZfi8EETDjtdnmv4Ksk' },
  ).as('postTx');
});
