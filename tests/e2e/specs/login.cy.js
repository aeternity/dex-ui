describe('Login', () => {
  it('testnet login', () => {
    cy.visit('/')
      .contains('.title', 'Swap')
      .get('[data-cy=connect-wallet]')
      .click()
      .get('[data-cy=connect-Superhero]', { timeout: 10000 })
      .click()
      .get('.onboarding-modal', { timeout: 10000 })
      .should('be.visible')
      // close the popup
      .get('.close')
      .click()
      .get('.onboarding-modal')
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
      .get('.onboarding-modal', { timeout: 10000 })
      .should('be.visible')
      // close the popup
      .get('.close')
      .click()
      .get('.onboarding-modal')
      .should('not.exist')
      // check that mainnet is written in the network selector
      .get('.active-network')
      .should('contain', 'Mainnet');
  });
});
