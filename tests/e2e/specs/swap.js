// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
      .contains('.title', 'Swap')
      .login()
      .get('.button-token')
      .first()
      .click()
      .get('.list-tokens > :nth-child(1)')
      .click()
      .get('.button-token')
      .last()
      .click()
      .get('.list-tokens > :nth-child(2)')
      .click()
      .get('.token-amount > .input-field')
      .first()
      .type("1")
      .get('.content > .primary')
      .contains('Swap')
      .click()
      .get('.body > .button-plain')
      .contains('Confirm Swap')
      .click()
      .switchTestnetNetwork()
      .wait(5000) // TODO: remove when adding swap tests
      .logout();
  });
});
