import { AeSdk, Node, MemoryAccount } from '@aeternity/aepp-sdk';

const PAYER_ACCOUNT_SECRET_KEY =
  '9ebd7beda0c79af72a42ece3821a56eff16359b6df376cf049aee995565f022f840c974b97164776454ba119d84edc4d6058a8dec92b6edc578ab2d30b4c4200';
const NODE_URL = 'https://testnet.aeternity.io';

const payerAccount = new MemoryAccount(PAYER_ACCOUNT_SECRET_KEY);
const node = new Node(NODE_URL);
const aeSdk = new AeSdk({
  nodes: [{ name: 'testnet', instance: node }],
  accounts: [payerAccount],
});

export default aeSdk;
