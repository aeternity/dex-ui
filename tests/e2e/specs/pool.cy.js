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

    cy.approveTokenUsageIfNessesary();

    cy.interceptTxPost();
    cy.contains('Supply').click();
    cy.get('.transaction-details').should('be.visible');
    cy.contains('Confirm Supply').click();
    cy.wait('@walletSignTx', { timeout: 10000 });
    cy.wait('@postTx', { timeout: 10000 });

    cy.get('.notification-transaction-status').should('be.visible');
  });

  it('Import Pool Share', () => {
    cy.importLiquidity();
  });

  it('Remove Liquidity', () => {
    // Setup test
    cy.importLiquidity();
    cy.get('.liquidity-item').click();
    cy.get('.liquidity-item .body').should('be.visible');
    cy.contains('Remove').click();
    cy.get('.remove-liquidity').should('be.visible');
    cy.contains('100%').click();
    cy.approveTokenUsageIfNessesary();
    cy.interceptTxPost();
    cy.get('[data-cy="remove-liquidity-btn"]').click();
    cy.get('.confirm-add-modal').should('be.visible');
    cy.get('.confirm-add-modal button.primary').click();
    cy.wait('@walletSignTx', { timeout: 10000 });
    cy.wait('@postTx', { timeout: 10000 });

    cy.get('.notification-transaction-status').should('be.visible');
  });
});
