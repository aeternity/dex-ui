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

main contract AedexV2Factory =
  record state = {fee_to : option(address),fee_to_setter : address,pairs : map(IAEX9Minimal, map(IAEX9Minimal, IAedexV2Pair)),all_pairs : list(IAedexV2Pair),pair_model : IAedexV2Pair,this_factory : option(IAedexV2FactoryForPair),allow_debug_mode : bool}
  datatype event = PairCreated(address, address, address, string)
  entrypoint init : (address, IAedexV2Pair, option(bool)) => AedexV2Factory.state
  stateful entrypoint set_this_factory : (IAedexV2FactoryForPair) => unit
  entrypoint all_pairs_length : () => int
  entrypoint all_pairs : (int) => IAedexV2Pair
  entrypoint fee_to : () => option(address)
  entrypoint fee_to_setter : () => address
  entrypoint allow_debug_mode : () => bool
  entrypoint get_pair : (IAEX9Minimal, IAEX9Minimal) => option(IAedexV2Pair)
  stateful entrypoint set_fee_to : (address) => unit
  stateful entrypoint set_fee_to_setter : (address) => unit
  stateful entrypoint create_pair : (IAEX9Minimal, IAEX9Minimal, int, option(int)) => IAedexV2Pair
`;
