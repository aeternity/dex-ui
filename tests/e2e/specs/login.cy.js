describe('Login', () => {
  it('testnet login', () => {
    cy.visit('/')
      .contains('.title', 'Swap')
      .get('[data-cy=connect-wallet]')
      .click()
      .get('[data-cy=connect-Superhero]', { timeout: 60000 })
      .click()
      .get('.about-dex-modal')
      .should('be.visible')
      // close the popup
      .get('.close')
      .click()
      .get('.about-dex-modal')
      .should('not.exist')
      // check that Testnet is written in the network selector
      .get('.active-network')
      .should('contain', 'Testnet');
  });

  it('testnet login command', () => {
    cy.login();
  });

  it('mainnet login', () => {
    cy.visit(
      '/swap?address=ak_rRVV9aDnmmLriPePDSvfTUvepZtR2rbYk2Mx4GCqGLcc1DMAq&networkId=ae_mainnet',
    )
      .contains('.title', 'Swap')
      // popup should open with "Thanks for trying out the DEX!"
      .get('.about-dex-modal')
      .should('be.visible')
      // close the popup
      .get('.close')
      .click()
      .get('.about-dex-modal')
      .should('not.exist')
      // check that mainnet is written in the network selector
      .get('.active-network')
      .should('contain', 'Mainnet');
  });
});
