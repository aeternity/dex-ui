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
    cy.login().get('[data-cy=pool]').filter(':visible').click();
    cy.get('.title').should('contain', 'Pool');
    cy.get('.pool-view').should('be.visible');

    cy.get('[data-cy=add-liquidity]').click();
    cy.get('.add-liquidity').should('be.visible');
    cy.get('.input-token input')
      .eq(0)
      .type('1')
      .get('.input-token input')
      .eq(1)
      .type('1')
      .get('.provide-liquidity-modal button.primary')
      .click()
      .get('.confirm-transaction-modal')
      .should('be.visible')
      .get('.confirm-transaction-modal button.primary')
      .click();
  });

  it('Remove Liquidity', () => {
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
