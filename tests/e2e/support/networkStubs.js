import aeSdk from './testAeSdk';

before(() => {
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

  cy.intercept(
    {
      method: 'POST',
      url: 'https://testnet.aeternity.io/v3/transactions*',
    },
    { tx_hash: 'th_8zREhgdJmg8LxG5hnJ2Eq63n7ZTbJMeZfi8EETDjtdnmv4Ksk' },
  ).as('postTx');
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
