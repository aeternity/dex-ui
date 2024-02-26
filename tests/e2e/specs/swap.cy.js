// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it.skip('Visits the app root url', () => {
    cy.visit('/')
      .contains('.title', 'Swap')
      .login()
      .wait(5000) // TODO: remove when adding swap tests
      .logout();
  });
});
