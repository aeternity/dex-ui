module.exports = `
contract interface IWAE =
  payable stateful entrypoint deposit : () => unit
  stateful entrypoint transfer : (address, int) => unit
  stateful entrypoint withdraw : (int) => unit

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

contract interface IAedexV2Callback =
  entrypoint aedex_v2_call : (address, int, int) => unit

contract interface IAedexV2FactoryForPair =
  entrypoint fee_to : () => option(address)

contract interface IAedexV2Pair =
  record amounts = {amount0 : int,amount1 : int}
  record reserves = {reserve0 : int,reserve1 : int,block_timestamp_last : int}
  entrypoint domain_separator : () => bytes(32)
  entrypoint nonces : (address) => int
  entrypoint balance : (address) => option(int)
  entrypoint init : (IAedexV2FactoryForPair, IAEX9Minimal, IAEX9Minimal, option(int)) => void
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

contract interface IAedexV2Factory =
  entrypoint fee_to : () => option(address)
  entrypoint fee_to_setter : () => address
  entrypoint get_pair : (IAEX9Minimal, IAEX9Minimal) => option(IAedexV2Pair)
  entrypoint all_pairs : (int) => address
  entrypoint all_pairs_length : () => int
  entrypoint create_pair : (IAEX9Minimal, IAEX9Minimal, option(int)) => IAedexV2Pair
  entrypoint set_fee_to : (address) => unit
  entrypoint set_fee_toSetter : (address) => unit







payable main contract AedexV2Router =
  record state = {factory : IAedexV2Factory,wae : IWAE,wae_aex9 : IAEX9Minimal}
  type amountA = int
  type amountB = int
  type amountToken = int
  type amountAE = int
  type liquidity = int
  entrypoint init : (IAedexV2Factory, IWAE, IAEX9Minimal) => AedexV2Router.state
  entrypoint balance : () => int
  entrypoint factory : () => IAedexV2Factory
  entrypoint wae : () => IWAE
  entrypoint wae_aex9 : () => IAEX9Minimal
  stateful entrypoint add_liquidity : (IAEX9Minimal, IAEX9Minimal, int, int, int, int, address, int) => (AedexV2Router.amountA * AedexV2Router.amountB * AedexV2Router.liquidity)
  payable stateful entrypoint add_liquidity_ae : (IAEX9Minimal, int, int, int, address, int) => (AedexV2Router.amountToken * AedexV2Router.amountAE * AedexV2Router.liquidity)
  stateful entrypoint remove_liquidity : (IAEX9Minimal, IAEX9Minimal, int, int, int, address, int) => (AedexV2Router.amountA * AedexV2Router.amountB)
  stateful entrypoint remove_liquidity_ae : (IAEX9Minimal, int, int, int, address, int) => (AedexV2Router.amountToken * AedexV2Router.amountAE)
  stateful entrypoint swap_exact_tokens_for_tokens : (int, int, list(IAEX9Minimal), address, int, option(IAedexV2Callback)) => list(int)
  stateful entrypoint swap_tokens_for_exact_tokens : (int, int, list(IAEX9Minimal), address, int, option(IAedexV2Callback)) => list(int)
  payable stateful entrypoint swap_exact_ae_for_tokens : (int, list(IAEX9Minimal), address, int, option(IAedexV2Callback)) => list(int)
  stateful entrypoint swap_tokens_for_exact_ae : (int, int, list(IAEX9Minimal), address, int, option(IAedexV2Callback)) => list(int)
  stateful entrypoint swap_exact_tokens_for_ae : (int, int, list(IAEX9Minimal), address, int, option(IAedexV2Callback)) => list(int)
  payable stateful entrypoint swap_ae_for_exact_tokens : (int, list(IAEX9Minimal), address, int, option(IAedexV2Callback)) => list(int)
  entrypoint quote : (int, int, int) => int
  entrypoint get_amount_out : (int, int, int) => int
  entrypoint get_amount_in : (int, int, int) => int
`;
