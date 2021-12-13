module.exports = `






contract interface IAedexV2Callback =
  entrypoint aedex_v2_call : (address, int, int) => unit

contract interface IAEX9Minimal =
  record allowance_accounts = {from_account : address,for_account : address}
  record meta_info = {name : string,symbol : string,decimals : int}
  entrypoint meta_info : () => IAEX9Minimal.meta_info
  entrypoint total_supply : () => int
  entrypoint balance : (address) => option(int)
  entrypoint allowance : (IAEX9Minimal.allowance_accounts) => option(int)
  stateful entrypoint transfer : (address, int) => unit
  stateful entrypoint create_allowance : (address, int) => unit
  stateful entrypoint transfer_allowance : (address, address, int) => unit

contract interface IAedexV2FactoryForPair =
  entrypoint fee_to : () => option(address)

contract interface IAedexV2Pair =
  record amounts = {amount0 : int,amount1 : int}
  record reserves = {reserve0 : int,reserve1 : int,block_timestamp_last : int}
  entrypoint domain_separator : () => bytes(32)
  entrypoint nonces : (address) => int
  entrypoint balance : (address) => option(int)
  entrypoint init : (IAedexV2FactoryForPair, IAEX9Minimal, IAEX9Minimal, int, option(int)) => void
  entrypoint minimum_liquidity : () => int
  entrypoint do_minimum_liquidity : () => int
  entrypoint factory : () => IAedexV2FactoryForPair
  entrypoint token0 : () => IAEX9Minimal
  entrypoint token1 : () => IAEX9Minimal
  entrypoint getReserves : () => IAedexV2Pair.reserves
  entrypoint price0_cumulativeLast : () => int
  entrypoint price1_cumulativeLast : () => int
  entrypoint k_last : () => int
  stateful entrypoint mint : (address) => int
  stateful entrypoint mint2 : (address) => int
  stateful entrypoint burn : (address) => IAedexV2Pair.amounts
  stateful entrypoint swap : (int, int, address, option(IAedexV2Callback)) => unit
  stateful entrypoint skim : (IAEX9Minimal) => unit
  stateful entrypoint sync : () => unit
  entrypoint get_reserves : () => IAedexV2Pair.reserves
  stateful entrypoint transfer_allowance : (address, address, int) => unit


main contract AedexV2Pair =
  record state = {total_supply : int,balance_of : map(AedexV2Pair.owner, int),locked_liquidity : int,allowance : map(AedexV2Pair.owner, map(AedexV2Pair.spender, int)),factory : IAedexV2FactoryForPair,token0 : IAEX9Minimal,token1 : IAEX9Minimal,reserve0 : int,reserve1 : int,block_timestamp_last : int,price0_cumulative_last : int,price1_cumulative_last : int,min_liquidity : int,k_last : int,debug_time : option(int)}
  datatype event = Transfer(address, address, int) | Approval(address, address, int) | Allowance(address, address, int) | Mint(address, int) | Burn(address, int) | LockLiquidity(int) | PairMint(address, int, int) | PairBurn(address, address, string) | SwapTokens(address, address, string) | Sync(int, int)
  type owner = address
  type spender = address
  entrypoint init : (IAedexV2FactoryForPair, IAEX9Minimal, IAEX9Minimal, int, option(int)) => AedexV2Pair.state
  stateful entrypoint set_debug_time : (int) => unit
  entrypoint get_reserves : () => IAedexV2Pair.reserves
  entrypoint minimum_liquidity : () => int
  entrypoint factory : () => IAedexV2FactoryForPair
  entrypoint token0 : () => IAEX9Minimal
  entrypoint token1 : () => IAEX9Minimal
  stateful entrypoint mint : (address) => int
  stateful entrypoint burn : (address) => IAedexV2Pair.amounts
  stateful entrypoint swap : (int, int, address, option(IAedexV2Callback)) => unit
  stateful entrypoint skim : (address) => unit
  stateful entrypoint sync : () => unit
  entrypoint meta_info : () => IAEX9Minimal.meta_info
  entrypoint total_supply : () => int
  entrypoint price0_cumulative_last : () => int
  entrypoint price1_cumulative_last : () => int
  entrypoint balance : (address) => option(int)
  entrypoint allowance : (IAEX9Minimal.allowance_accounts) => option(int)
  stateful entrypoint create_allowance : (address, int) => unit
  stateful entrypoint transfer : (address, int) => unit
  stateful entrypoint transfer_allowance : (address, address, int) => unit
`;
