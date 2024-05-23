// TODO navigate to pool view
// TODO provide liquidity
// TODO deal with provide liquidity callback
// TODO remove liquidity
// TODO deal with remove liquidity callback

describe('Pool', () => {
  it('Pool View', () => {
    cy.login()
      .get('[data-cy=pool]')
      .filter(':visible')
      .click()
      .get('.title')
      .should('contain', 'Pool')
      .get('.pool-view')
      .should('be.visible');
  });

  it('Provide Liquidity', () => {
    cy.login();
    cy.get('[data-cy=pool]').filter(':visible').click();
    cy.get('.title').should('contain', 'Pool');
    cy.get('.pool-view').should('be.visible');

    cy.get('[data-cy=add-liquidity]').click();
    cy.get('.add-liquidity').should('be.visible');
    cy.selectToken(0);
    cy.selectToken(1, 'ct_b7FZHQzBcAW4r43ECWpV3qQJMQJp5BxkZUGNKrqqLyjVRN3SC');
    cy.get('.input-token input').eq(0).type('0.1');

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

    cy.interceptTxPost();
    cy.contains('Supply').click();
    cy.wait('@walletSignTx', { timeout: 10000 });
    cy.wait('@postTx', { timeout: 10000 });
  });

  it.skip('Remove Liquidity', () => {
    cy.login()
      .get('[data-cy=pool]')
      .filter(':visible')
      .click()
      .get('.title')
      .should('contain', 'Pool')
      .get('.pool-view')
      .should('be.visible')
      .get('.remove-liquidity-button')
      .click()
      .get('.remove-liquidity-modal')
      .should('be.visible')
      .get('.input-token input')
      .eq(0)
      .type('1')
      .get('.input-token input')
      .eq(1)
      .type('1')
      .get('.remove-liquidity-modal button.primary')
      .click()
      .get('.confirm-transaction-modal')
      .should('be.visible')
      .get('.confirm-transaction-modal button.primary')
      .click();
  });
});
