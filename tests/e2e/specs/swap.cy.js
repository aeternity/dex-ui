describe('Swap', () => {
  it('Swap Token', () => {
    cy.login()
      // get first .input-token
      .get('.input-token button')
      .first()
      .click()
      // token pop up should open
      .get('.select-token-modal')
      .should('be.visible')
      // select first token
      .get('.select-token-modal .token')
      .click()
      // expect ae to be selected
      .get('.input-token')
      .first()
      .should('contain', 'AE')
      // select second token
      // get first .input-token
      .get('.input-token button')
      .eq(1)
      .click()
      // token pop up should open
      .get('.select-token-modal')
      .should('be.visible')
      // select first token
      .get('.select-token-modal .search-bar')
      .type('ct_b7FZHQzBcAW4r43ECWpV3qQJMQJp5BxkZUGNKrqqLyjVRN3SC')
      //
      .get('.select-token-modal .import-button')
      .click()
      // warning should be shown
      .get('.select-token-modal')
      .should('contain', 'Make sure this is the token that you want to trade.')
      // confirm import
      .get('.select-token-modal .import-button')
      .click()
      // expect ae to be selected
      .get('.input-token')
      .eq(1)
      .should('contain', 'TAEX9-A')
      // input amount
      .get('.input-token input')
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
