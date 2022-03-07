export const MAGNITUDE = 18;
// TODO: this is what uniswap uses as minimumLiquidity, let's decide on it
export const MINIMUM_LIQUIDITY = 1000n;

export const DEFAULT_SLIPPAGE = 5;
export const MIN_SLIPPAGE = 5;
export const MAX_SLIPPAGE = 51;

export const DEFAULT_DEADLINE = 30;
export const MIN_DEADLINE = 1;
export const MAX_DEADLINE = 1000;

export const DEFAULT_NETWORKS = [
  {
    url: 'https://testnet.aeternity.io',
    networkId: 'ae_uat',
    middlewareUrl: 'https://testnet.aeternity.io/mdw',
    explorerUrl: 'https://explorer.testnet.aeternity.io',
    compilerUrl: 'https://latest.compiler.aepps.com',
    backendUrl: 'https://testnet.superhero.aeternity.art',
    name: 'Testnet',
  },
  {
    url: 'https://mainnet.aeternity.io',
    networkId: 'ae_mainnet',
    middlewareUrl: 'https://mainnet.aeternity.io/mdw',
    explorerUrl: 'https://explorer.aeternity.io',
    compilerUrl: 'https://compiler.aepps.com',
    backendUrl: 'https://raendom-backend.z52da5wt.xyz',
    name: 'Mainnet',
  },
];
