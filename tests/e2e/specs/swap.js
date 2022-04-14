// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
      .contains('.title', 'Swap')
      .wait(2000)
      .login()
      .switchTestnetNetwork()
      .wait(10000);
    // .logout();
  });
});
