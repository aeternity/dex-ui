describe('Swap', () => {
  it('Swap Token', () => {
    cy.interceptTxPost();
    cy.login();
    cy.selectToken(0);
    cy.selectToken(1, 'ct_b7FZHQzBcAW4r43ECWpV3qQJMQJp5BxkZUGNKrqqLyjVRN3SC');

    cy.get('.input-token').first().should('contain', 'AE');

    // expect ae to be selected
    cy.get('.input-token').eq(1).should('contain', 'TAEX9-A');
    // input amount
    cy.get('.input-token input')
      .eq(0)
      .type('1')
      // expect second input to have a number
      .get('.input-token input')
      .eq(1)
      .invoke('val')
      .should((value) => {
        expect(Number.isNaN(+value)).to.eq(false); // passes
      })
      .get('main button.primary')
      .click()
      // confirm modal should open
      .get('.confirm-swap-modal')
      .should('be.visible')
      // confirm transaction
      .get('.confirm-swap-modal button.primary')
      .click();
    // expect wallet to be opened
    cy.wait('@walletSignTx', { timeout: 10000 });
    cy.wait('@postTx', { timeout: 10000 });

    cy.get('.notification-transaction-status').should('be.visible');
  });

  it('Adjust Swap Settings', () => {
    cy.login();
    cy.get('.swap-view .actions-menu').click();
    cy.get('.settings').should('be.visible');
    cy.get('.settings .input-amount input').eq(0).type('8');
    cy.get('.settings .input-amount input').eq(1).type('8');
    cy.get('.overlay').click({ force: true });
    cy.get('.settings').should('not.exist');
  });
});
