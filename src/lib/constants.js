export const IS_MOBILE = window.navigator.userAgent.includes('Mobi');

export const IN_FRAME = window.parent !== window;

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
    url: 'https://mainnet.aeternity.io',
    middlewareUrl: 'https://mainnet.aeternity.io/mdw',
    explorerUrl: 'https://explorer.aeternity.io',
    name: 'Mainnet',
    networkId: 'ae_mainnet',
    networkName: 'mainnet',
    factoryAddress: 'ct_2mfj3FoZxnhkSw5RZMcP8BfPoB1QR4QiYGNCdkAvLZ1zfF6paW',
    routerAddress: 'ct_azbNZ1XrPjXfqBqbAh1ffLNTQ1sbnuUDFvJrXjYz7JQA1saQ3',
    waeAddress: 'ct_J3zBY8xxjsRr3QojETNw48Eb38fjvEuJKkQ6KzECvubvEcvCa',
    dexBackendUrl: import.meta.env.VITE_MAINNET_DEX_BACKEND_URL,
    tokens: [
      {
        contract_id: 'ct_J3zBY8xxjsRr3QojETNw48Eb38fjvEuJKkQ6KzECvubvEcvCa',
        decimals: MAGNITUDE,
        name: 'AE',
        symbol: 'AE',
        is_ae: true,
      },
      {
        contract_id: 'ct_J3zBY8xxjsRr3QojETNw48Eb38fjvEuJKkQ6KzECvubvEcvCa',
        decimals: MAGNITUDE,
        name: 'Wrapped AE',
        symbol: 'WAE',
        is_ae: false,
      },
      {
        contract_id: 'ct_KeTvHnhU85vuuQMMZocaiYkPL9tkoavDRT3Jsy47LK2YqLHYb',
        decimals: MAGNITUDE,
        name: 'WeTrue Token',
        symbol: 'WTT',
        is_ae: false,
      },
      {
        contract_id: 'ct_7UfopTwsRuLGFEcsScbYgQ6YnySXuyMxQWhw6fjycnzS5Nyzq',
        decimals: MAGNITUDE,
        name: 'AeBox Coin',
        symbol: 'ABC',
        is_ae: false,
      },
      {
        contract_id: 'ct_2uny6n3qLA1kgboiK4GBYmmdbQKvCCcgU2VvfrVwLiCc5gPFuP',
        decimals: MAGNITUDE,
        name: 'Regenerates Points Token',
        symbol: 'RPT',
        is_ae: false,
      },
    ],
  },
  {
    url: 'https://testnet.aeternity.io',
    middlewareUrl: 'https://testnet.aeternity.io/mdw',
    explorerUrl: 'https://explorer.testnet.aeternity.io',
    name: 'Testnet',
    networkId: 'ae_uat',
    networkName: 'testnet',
    factoryAddress: 'ct_NhbxN8wg8NLkGuzwRNDQhMDKSKBwDAQgxQawK7tkigi2aC7i9',
    routerAddress: 'ct_MLXQEP12MBn99HL6WDaiTqDbG4bJQ3Q9Bzr57oLfvEkghvpFb',
    waeAddress: 'ct_JDp175ruWd7mQggeHewSLS1PFXt9AzThCDaFedxon8mF8xTRF',
    dexBackendUrl: import.meta.env.VITE_TESTNET_DEX_BACKEND_URL,
    tokens: [
      {
        contract_id: 'ct_JDp175ruWd7mQggeHewSLS1PFXt9AzThCDaFedxon8mF8xTRF',
        decimals: MAGNITUDE,
        name: 'AE',
        symbol: 'AE',
        is_ae: true,
      },
      {
        contract_id: 'ct_b7FZHQzBcAW4r43ECWpV3qQJMQJp5BxkZUGNKrqqLyjVRN3SC',
        decimals: 18,
        name: 'First',
        symbol: 'FST',
      },
      {
        contract_id: 'ct_7tTzPfvv3Vx8pCEcuk1kmgtn4sFsYCQDzLi1LvFs8T5PJqgsC',
        decimals: 18,
        name: 'Second',
        symbol: 'SND',
      },
      {
        contract_id: 'ct_28w7VyXS6UDNbyWZxZLtxpDKJorfpYyBQM4f9quseFEByUeDpb',
        decimals: 18,
        name: 'Third',
        symbol: 'AE Partner',
      },
      {
        contract_id: 'ct_JDp175ruWd7mQggeHewSLS1PFXt9AzThCDaFedxon8mF8xTRF',
        decimals: MAGNITUDE,
        name: 'Wrapped AE',
        symbol: 'WAE',
        is_ae: false,
      },
    ],
  },
];
