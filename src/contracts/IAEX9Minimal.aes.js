module.exports = `

main contract IAEX9Minimal = 
    record allowance_accounts = { from_account: address, for_account: address }
    record meta_info = { name : string , symbol : string , decimals : int }
    entrypoint meta_info: () => meta_info
    entrypoint total_supply: () => int
    entrypoint balance: (address) => option(int)
    entrypoint allowance: (allowance_accounts) => option(int)
    stateful entrypoint transfer: (address /*to_account*/, int /*value*/) => unit
    stateful entrypoint create_allowance: (address /*spender*/, int /*amount*/) => unit
    stateful entrypoint transfer_allowance: ( address /*sender*/, address /*recipient*/, int /*amount*/) => unit
`;
