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
    dexBackendUrl: process.env.VUE_APP_MAINNET_DEX_BACKEND_URL,
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
      },
      {
        contract_id: 'ct_7UfopTwsRuLGFEcsScbYgQ6YnySXuyMxQWhw6fjycnzS5Nyzq',
        decimals: MAGNITUDE,
        name: 'AeBox Coin',
        symbol: 'ABC',
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
    dexBackendUrl: process.env.VUE_APP_TESTNET_DEX_BACKEND_URL,
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

export const DEX_ERROR_MESSAGES = {
  'AedexV2Library: IDENTICAL_ADDRESSES': 'identical token addresses',
  'AedexV2Library: INSUFFICIENT_AMOUNT': 'amount given for quote function is less or equal to zero',
  'AedexV2Library: INSUFFICIENT_LIQUIDITY': 'both pair reserves are zero',
  'AedexV2Library: NO_PAIR_FOUND': 'no pair found for the given tokens',
  'AedexV2Library: INSUFFICIENT_INPUT_AMOUNT': 'input amount is less or equal to zero',
  'AedexV2Library: INSUFFICIENT_OUTPUT_AMOUNT': 'the output amount is less or equal to zero',
  'AedexV2Library: INVALID_PATH': 'token path should be greater or equal with 2',
  'AedexV2Library: INTERNAL_ERROR_AMOUNTS_VOID': 'internal error',
  'AedexV2Library: INTERNAL_ERROR_PATH_VOID': 'internal error',

  'AedexV2Router: DIFFERENT_WAE_ADDRESSES': 'at router init second and third parameter differ',
  'AedexV2Router: INSUFFICIENT_B_AMOUNT': 'insufficient amount of second token to add liquidity or remove liquidity',
  'AedexV2Router: INSUFFICIENT_A_AMOUNT': 'insufficient amount of first token to add liquidity or remove liquidity',
  'AedexV2Router: EXCESSIVE_INPUT_AMOUNT': 'the amount_in is bigger than the maximum provided in parameters',
  'AedexV2Router: INVALID_PATH_LAST': 'last token should be the provided WAE at the router initialization',
  'AedexV2Router: INVALID_PATH_FIRST': 'first token should be the provided WAE at the router initialization',
  'AedexV2Router: INSUFFICIENT_OUTPUT_AMOUNT': 'the amount out is less than the minimum provided in parameters',
  'AedexV2Router: EXPIRED': 'transaction expired, deadline is less than blockchain timestamp',
  'AedexV2Router: AMOUNT_LIST_IS_SHORTER': 'internal error',

  'WAE: LOW_BALANCE': "can't withdraw/transfer_allowance, the balance is to low",
  'WAE: LOW_ALLOWANCE': "can't transfer_allowance, the allowance is to low",
  'WAE: ALLOWANCE_NOT_EXISTENT': 'there is no allowance for current account',
  'WAE: NON_NEGATIVE_VALUE_REQUIRED': 'one of the input amounts is negative',
  'WAE: ALLOWANCE_ALREADY_EXISTENT': "can't initiate another allowance,there is an allowance already assigned for the current account, use change_allowance instead",

  'AedexV2Factory: FORBIDDEN': 'wrong caller address',
  'AedexV2Factory: IDENTICAL_ADDRESSES': 'tokenA should differ from tokenB',
  'AedexV2Factory: PAIR_EXISTS': "can't create another pair with same set of tokens",

  'AedexV2Pair: NEGATIVE_VALUE_ON_TRANSFER': 'token transfer of negative values not allowed',
  'AedexV2Pair: NOT_DEBUG_MODE': 'this action allowed only in debug mode',
  'AedexV2Pair: LP': 'at least one of balances or reserves is negative',
  'AedexV2Pair: INSUFFICIENT_LIQUIDITY_MINTED': 'there is no liquidity to be minted',
  'AedexV2Pair: INSUFFICIENT_OUTPUT_AMOUNT': 'one of the output amount should be greater than zero',
  'AedexV2Pair: INSUFFICIENT_LIQUIDITY': 'there is not enough liquidity for the requested amount',
  'AedexV2Pair: INVALID_TO': 'swap destination/output wallet address should differ from any of the two token addresses',
  'AedexV2Pair: INSUFFICIENT_INPUT_AMOUNT': 'both input amounts are zero or less',
  'AedexV2Pair: INSUFFICIENT_BALANCE': 'there was no or insuficient funds transfered towards pair address',
  'AedexV2Pair: INSUFFICIENT_LIQUIDITY_BURNED': 'there is no liquidity to be burned for the given address',
  'AedexV2Pair: INSUFFICIENT_BALANCE_FOR_TRANSFER': 'insuficient balance for transfer',
  'AedexV2Pair: BALANCE_ACCOUNT_NOT_EXISTENT': 'there is no liquidity provided by this account',
  'AedexV2Pair: INSUFFICIENT_ALLOWANCE': 'there is not enough allowance',
  'AedexV2Pair: ALLOWANCE_NOT_EXISTENT': 'there is no allowance created',
  'AedexV2Pair: INSUFFICIENT_TOTAL_SUPPLY': 'internal error: total supply is less than liquidity available for burning',
  'AedexV2Pair: INSUFFICIENT_BALANCE_FOR_BURNING': 'total supply is less than liquidity available for burning',

  LP: 'value is negative',
};
