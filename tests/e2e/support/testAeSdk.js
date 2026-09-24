import { AeSdk, Node, MemoryAccount } from '@aeternity/aepp-sdk';

// sk_-prefixed secret key (aepp-sdk@14+ format), same account as the previous hex key
// ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E
const PAYER_ACCOUNT_SECRET_KEY = 'sk_2CuofqWZHrABCrM7GY95YSQn8PyFvKQadnvFnpwhjUnDCFAWmf';
const NODE_URL = 'https://testnet.aeternity.io';

const payerAccount = new MemoryAccount(PAYER_ACCOUNT_SECRET_KEY);
const node = new Node(NODE_URL);
const aeSdk = new AeSdk({
  nodes: [{ name: 'testnet', instance: node }],
  accounts: [payerAccount],
});

export default aeSdk;
