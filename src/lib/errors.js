export default {
  'AedexV2Library: IDENTICAL_ADDRESSES': 'identical token addresses',
  'AedexV2Library: INSUFFICIENT_AMOUNT': 'amount given for quote function is less or equal to zero',
  'AedexV2Library: INSUFFICIENT_LIQUIDITY': 'both pair reserves are zero',
  'AedexV2Library: NO_PAIR_FOUND': 'no pair found for the given tokens',
  'AedexV2Library: INSUFFICIENT_INPUT_AMOUNT': 'input amount is less or equal to zero',
  'AedexV2Library: INSUFFICIENT_OUTPUT_AMOUNT': 'the output amount is less or equal to zero',
  'AedexV2Library: INVALID_PATH': 'token path should be greater or equal with 2',
  'AedexV2Library: INTERNAL_ERROR_AMOUNTS_VOID': 'internal error',
  'AedexV2Library: INTERNAL_ERROR_PATH_VOID': 'internal error',

  'AedexV2Router: DIFFERENT_WAE_ADDRESSES': 'at router init seconnd and third parameter differ',
  'AedexV2Router: INSUFFICIENT_B_AMOUNT': 'insuficient amount of second token to add liquidity or remove liquidity',
  'AedexV2Router: INSUFFICIENT_A_AMOUNT': 'insuficient amount of first token to add liquidity or remove liquidity',
  'AedexV2Router: OPTIMAL_GREATER_THEN_DESIRED': 'optimal amount of first token is greater than desired one',
  'AedexV2Router: EXCESSIVE_INPUT_AMOUNT': 'the amount_in is bigger than the maximum provided in parameters',
  'AedexV2Router: INVALID_PATH_LAST': 'last token should be the provided WAE at the router initialization',
  'AedexV2Router: INVALID_PATH_FIRST': 'first token should be the provided WAE at the router initialization',
  'AedexV2Router: INSUFFICIENT_OUTPUT_AMOUNT': 'the amount out is less than the minimum provided in parameters',
  'AedexV2Router: EXPIRED': 'transaction expired, deadline is less than blockchain timestamp',
  'AedexV2Router: AMOUNT_LIST_IS_SHORTER': 'internal error',

  'WAE: LOW_BALANCE': "can't withdraw/transfer_allowance, the balance is to low",
  'WAE: LOW_ALLOWANCE': "can't transfer_allowance, the allowance is to low",

  'AedexV2Factory: NOT_SAME_FACTORY': 'the factory provided should be the same as Contract.address',
  'AedexV2Factory: FORBIDDEN': 'wrong caller address',
  'AedexV2Factory: FACTORY_NOT_SET': 'set_this_factory should be called before',
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
  'AedexV2Pair: INSUFFICIENT_ALLOWANCE': 'there is not enough allowance',
  'AedexV2Pair: INSUFFICIENT_TOTAL_SUPPLY': 'internal error: total supply is less than liquidity available for burning',
  'AedexV2Pair: INSUFFICIENT_BALANCE_FOR_BURNING': 'total supply is less than liquidity available for burning',
  LP: 'value is negative',
};