import aeSdk from './testAeSdk';

Cypress.Commands.add('login', () => {
  cy.visit(`/swap?address=${aeSdk.address}&networkId=ae_uat`)
    .contains('.title', 'Swap')
    // popup should open with "Thanks for trying out the DEX!"
    // it waits for both networks to init, up to 4 dex-backend requests with an 8s timeout each
    .get('.onboarding-modal', { timeout: 30000 })
    .should('be.visible')
    // close the popup
    .get('.close')
    .click()
    .get('.onboarding-modal')
    .should('not.exist')
    // check that testnet is written in the network selector
    .get('.active-network')
    .should('contain', 'Testnet');
});

// not `.input-token button`, it shifts when a "max" button appears after the balance is loaded
Cypress.Commands.add(
  'selectToken',
  (slot, token, initialSelector = '.input-token .button-token') => {
    // get first .input-token
    cy.get(initialSelector)
      .eq(slot)
      .click()
      // token pop up should open
      .get('.select-token-modal')
      .should('be.visible');
    // narrow the list down to the requested token, otherwise take the first one (AE)
    if (token) cy.get('.select-token-modal .search-bar').type(token);
    cy.get('.select-token-modal .token.clickable').first().click();
  },
);

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

Cypress.Commands.add('importLiquidity', () => {
  cy.login();
  cy.get('[data-cy=pool]').filter(':visible').click();
  cy.get('.title').should('contain', 'Pool');
  cy.get('.pool-view').should('be.visible');

  cy.contains('Import it.').click();

  cy.get('.import-pool').should('be.visible');
  cy.selectToken(0, undefined, '.button-token');
  cy.selectToken(1, 'ct_b7FZHQzBcAW4r43ECWpV3qQJMQJp5BxkZUGNKrqqLyjVRN3SC', '.button-token');

  cy.get('.pool-found').should('be.visible');

  cy.contains('Ok').click();

  cy.get('.liquidity-item').should('be.visible');
});

Cypress.Commands.add('approveTokenUsageIfNessesary', () => {
  cy.contains('Approve').then(($btn) => {
    if (!$btn.is(':disabled')) {
      // intercept the approval transaction
      cy.intercept({
        method: 'POST',
        url: 'https://testnet.aeternity.io/v3/transactions*',
        times: 1,
      }).as('postTx');
      cy.contains('Approve').click();
      cy.wait('@walletSignTx', { timeout: 10000 });
      cy.wait('@postTx', { timeout: 10000 });

      // wait for notification to appear
      cy.get('.notification-transaction-status').should('be.visible', { timeout: 10000 });
    }
  });
});
