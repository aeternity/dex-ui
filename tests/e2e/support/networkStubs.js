import aeSdk from './testAeSdk';

beforeEach(() => {
  cy.intercept('GET', 'https://wallet.superhero.com/sign-transaction*', (req) => {
    // extract transaction from query
    const transaction = new URL(req.url).searchParams.get('transaction');
    const callback = new URL(req.url).searchParams.get('x-success');

    return aeSdk.signTransaction(transaction).then((signedTx) => {
      req.redirect(callback.replace('{transaction}', encodeURIComponent(signedTx)));
    });
  }).as('walletSignTx');

  cy.intercept('GET', 'https://wallet.superhero.com/address*', (req) => {
    // extract transaction from query
    const callback = new URL(req.url).searchParams.get('x-success');

    return aeSdk.getNodeInfo().then((info) => {
      req.redirect(
        callback.replace('{address}', aeSdk.address).replace('{networkId}', info.nodeNetworkId),
      );
    });
  }).as('walletAddress');
});

export {};
