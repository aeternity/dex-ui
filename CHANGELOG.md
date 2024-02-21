# Changelog

## [1.18.4](https://github.com/aeternity/dex-ui/compare/v1.18.3...v1.18.4) (2024-02-29)


### CI / CD

* add build args  pipeline ([6547896](https://github.com/aeternity/dex-ui/commit/65478962e25b66a3c69b92b815a154c663525975))


### Miscellaneous

* remove unused env variables ([bd07ec5](https://github.com/aeternity/dex-ui/commit/bd07ec5a2b4896323c0c4a154f4779c27fb547a0))

## [1.18.3](https://github.com/aeternity/dex-ui/compare/v1.18.2...v1.18.3) (2024-02-27)


### CI / CD

* change repo in prod  pipeline ([8fa5ad5](https://github.com/aeternity/dex-ui/commit/8fa5ad573599210219df934bfd223d270ae70995))

## [1.18.2](https://github.com/aeternity/dex-ui/compare/v1.18.1...v1.18.2) (2024-02-14)

### Bug Fixes

- more readable version of node version retrieval ([73eb9e0](https://github.com/aeternity/dex-ui/commit/73eb9e012efa173670d3863ea9d319bdbfbba02d))

### CI / CD

- change gitops repo for stg ([ffe28ab](https://github.com/aeternity/dex-ui/commit/ffe28abf89e2651196aa63745cc5ff610f1232ba))
- change token key ([88f752c](https://github.com/aeternity/dex-ui/commit/88f752c7edda011f5cc62050e08ad642b32f52de))

### Refactorings

- **AboutModel:** get sdk version from package.json ([dcd8173](https://github.com/aeternity/dex-ui/commit/dcd81737e74e4235ba0b26801033f8258673f61d))
- removing debugging entries ([474f4ad](https://github.com/aeternity/dex-ui/commit/474f4ad08ff3928f696dea2c7957c0dc64f63962))

### Miscellaneous

- update to sdk@13.2.2 ([c16cfb3](https://github.com/aeternity/dex-ui/commit/c16cfb358b2b75039169e405e4bf797f75f531cf))

## [1.18.1](https://github.com/aeternity/dex-ui/compare/v1.18.0...v1.18.1) (2023-08-25)

### Bug Fixes

- be able to connect within iframe ([e716371](https://github.com/aeternity/dex-ui/commit/e71637160ec02272c74d4622281300d0dc409be3))

## [1.18.0](https://github.com/aeternity/dex-ui/compare/v1.17.3...v1.18.0) (2023-04-26)

### Features

- add extra info for low slippage errors ([a5eacfc](https://github.com/aeternity/dex-ui/commit/a5eacfcedc6c3133b65b828f731f650ec3fc7fd7))

### Bug Fixes

- **AeBalance:** balance goes to 0 when error is catched ([e000517](https://github.com/aeternity/dex-ui/commit/e00051747b3b4349814c83aa688446d135aae990))
- remove duplicate tokens ([12e063e](https://github.com/aeternity/dex-ui/commit/12e063ef8c6f5da1d42baaff0146f3bed4e2fbba))

### CI / CD

- **build:** patch-deprecated-gh-action-steps ([98f4e27](https://github.com/aeternity/dex-ui/commit/98f4e2797c9025bdc33cd6afb2dbcfb02bca7629))
- check pr deployment state before sync ([6f8b70d](https://github.com/aeternity/dex-ui/commit/6f8b70d8b337760491050fe906576bd43c3f0943))
- fix spelling ([623392f](https://github.com/aeternity/dex-ui/commit/623392f4cc1699341649acb18bbc9a8456427ddc))

### Refactorings

- change low slippage message ([50d4ebf](https://github.com/aeternity/dex-ui/commit/50d4ebfaf1a026d936fdf08da9b2e0b72f3299f7))

## [1.17.3](https://github.com/aeternity/dex-ui/compare/v1.17.2...v1.17.3) (2022-11-18)

### Bug Fixes

- fix gitsha ([a8c6c31](https://github.com/aeternity/dex-ui/commit/a8c6c31457a23829aff6c7d6f0ce976887ebad75))
- **swap-view:** insufficient funds button label ([522f050](https://github.com/aeternity/dex-ui/commit/522f050a7fb2b9615622d3ef752d1e6f1a1c9c37))

## [1.17.2](https://github.com/aeternity/dex-ui/compare/v1.17.1...v1.17.2) (2022-08-12)

### Bug Fixes

- refresh page for non-default network and selected AE ([59c2a0e](https://github.com/aeternity/dex-ui/commit/59c2a0e43db1f560a3682956a74653c55989d34f))

## [1.17.1](https://github.com/aeternity/dex-ui/compare/v1.17.0...v1.17.1) (2022-08-11)

### Bug Fixes

- **onboarding:** adds correct link ([9596a86](https://github.com/aeternity/dex-ui/commit/9596a869eee4186062639be64e1a7825d5182fca))

## [1.17.0](https://github.com/aeternity/dex-ui/compare/v1.16.1...v1.17.0) (2022-08-10)

### Features

- adds mobile onboarding modal ([56871e5](https://github.com/aeternity/dex-ui/commit/56871e54a61ae281d46182cfef2c0c97d03a20f2))
- **onboarding:** adds correct link ([8c5bf15](https://github.com/aeternity/dex-ui/commit/8c5bf155f83a3c2745cca632ca3f0d5e128f198c))

### Bug Fixes

- **onboarding:** onboarding triggers when not wallet callback url ([28dded4](https://github.com/aeternity/dex-ui/commit/28dded4e6de18dbe69b667fbfc5c9c447218d668))
- **svg:** make skip optimize flag works correctly ([abc2463](https://github.com/aeternity/dex-ui/commit/abc24634206f5d3f058a3d6687d77607893107d3))
- **wording:** russian translation typos ([7fd1ce5](https://github.com/aeternity/dex-ui/commit/7fd1ce5d9952cd40b7eda79203c21464ebe47188))

### Refactorings

- **onboarding:** removes unnecessary method ([cfdc031](https://github.com/aeternity/dex-ui/commit/cfdc03103c570e3085c4afcfb3a6a7d15e5509c6))

## [1.16.1](https://github.com/aeternity/dex-ui/compare/v1.16.0...v1.16.1) (2022-08-09)

### Bug Fixes

- amount with slippage for create_allowance on mobile ([e4683d7](https://github.com/aeternity/dex-ui/commit/e4683d73d1fdf8d515712fc3b48d16732ec69f95))

## [1.16.0](https://github.com/aeternity/dex-ui/compare/v1.15.0...v1.16.0) (2022-08-09)

### Features

- add the about dex modal ([2f20efa](https://github.com/aeternity/dex-ui/commit/2f20efacb609e1d5d115838637ee7abb8175a6fc))
- adds 2 aex9 tokens ([987b8d5](https://github.com/aeternity/dex-ui/commit/987b8d576b9a150b05c7dc315675396bc80bf927))
- adds 404 fallback page ([5a3528f](https://github.com/aeternity/dex-ui/commit/5a3528f3af6e7e2c55e082f2a2323a4f121a6274))
- show loader on selection restoring ([0d7ed70](https://github.com/aeternity/dex-ui/commit/0d7ed709afc87d754ca055cc3c6ba0980bf06ed7))
- **t&c:** updates terms and conditions to v4 ([4c040cc](https://github.com/aeternity/dex-ui/commit/4c040cc60d54b91c9825a7d6534f9fddeb24fb9c))
- **wording:** make first initialization base on user language ([a2bb803](https://github.com/aeternity/dex-ui/commit/a2bb803448edee779dc6aa096119f5a9fa189430))

### Bug Fixes

- **eslintrc:** resolve lint warnings ([46e8ff9](https://github.com/aeternity/dex-ui/commit/46e8ff91a462b9cbc2799969fdea3c37a07db490))
- **save-token-selection:** restore selected backend tokens ([09588b2](https://github.com/aeternity/dex-ui/commit/09588b2b8166f89ef3f0cf8bcd5fc18c035f5038))
- **translation:** adjusts cn translation ([b4fbebf](https://github.com/aeternity/dex-ui/commit/b4fbebf2aafa4e7822e8f7f14eb0308b35de86d9))
- **user-custom-tokens-manager:** show token image correct size ([2e0c520](https://github.com/aeternity/dex-ui/commit/2e0c520fd6f5a467b9ba04c0f4b0860526634ae3))
- **wording:** adjust ui for different languages ([f980fb2](https://github.com/aeternity/dex-ui/commit/f980fb2091c2c45e94ef03cec3843785bd0ab2a9))

### Refactorings

- **liquidity-details:** highlight pooled tokens ([a25e16b](https://github.com/aeternity/dex-ui/commit/a25e16bc74650f1d08008ba7ffbea02a482d9a37))
- **wording:** drop v2 notations ([de3e2f0](https://github.com/aeternity/dex-ui/commit/de3e2f01acfcad5f2b9505bce9d66206ca638db7))

### Miscellaneous

- updates licence copyright date ([ffb3f87](https://github.com/aeternity/dex-ui/commit/ffb3f87315fab80086c6c236fc9c03cbb00086bd))

## [1.15.0](https://github.com/aeternity/dex-ui/compare/v1.14.0...v1.15.0) (2022-08-04)

### Features

- **nginx:** removes password protection ([f865a01](https://github.com/aeternity/dex-ui/commit/f865a018ba0831ac27770dc26d9a7b2416063aa9))

### Bug Fixes

- **index:** initialize using stored networkId ([7e0b7db](https://github.com/aeternity/dex-ui/commit/7e0b7dbf84be7dcda4911893472415636b152184))
- **remove-liquidity:** do not add wrong/duplicate transaction info ([231bef5](https://github.com/aeternity/dex-ui/commit/231bef59fbd8dd43d17b9d25b11d7d065377d78f))
- wording ([8965245](https://github.com/aeternity/dex-ui/commit/8965245ebfe74cb9108602801d30ecf9e25f180f))

### Refactorings

- **env:** set Testnet as default network in develop ([d962715](https://github.com/aeternity/dex-ui/commit/d962715f5cbc31a65cac8ac4019e7a7b963c5911))
- skip confirmed submission modal on mobile ([569e924](https://github.com/aeternity/dex-ui/commit/569e924f5aafd52928a4e09f96ee5b788d15f002))

## [1.14.0](https://github.com/aeternity/dex-ui/compare/v1.13.0...v1.14.0) (2022-08-02)

### Features

- **dex-backend:** restore token list fetching ([9bb4f0b](https://github.com/aeternity/dex-ui/commit/9bb4f0bc3264c91332bb1f74770a3f4b07ac8f22))
- **env:** moves compiler to new address ([1e5f81e](https://github.com/aeternity/dex-ui/commit/1e5f81efcf538d4a389e99b94cd7209f816aa343))

### Bug Fixes

- **env:** removes unrequired version from compiler ([fab0022](https://github.com/aeternity/dex-ui/commit/fab00223affae7cb21d7112c2167a867a9ad8971))
- **pending-transaction-handler:** do not process unfinished transactions ([ce8391a](https://github.com/aeternity/dex-ui/commit/ce8391a3e77c4e3071ba6f109697ceeeda3fd1e1))

### Miscellaneous

- **constants:** cleans left over variables ([1056a95](https://github.com/aeternity/dex-ui/commit/1056a95785c5cf88430a77d11d86e96d5829c498))

### Testing

- **e2e:** do not record videos or screenshots ([7ad213b](https://github.com/aeternity/dex-ui/commit/7ad213b29463a5ae8eea3053adc989216f7217ae))

## [1.13.0](https://github.com/aeternity/dex-ui/compare/v1.12.0...v1.13.0) (2022-07-28)

### Features

- **ci:** adds unit and e2e tests ([f8e2211](https://github.com/aeternity/dex-ui/commit/f8e2211fa7a3aea1c6376e9545f4ba16826f1e01))
- **e2e:** extends swap test ([677dea5](https://github.com/aeternity/dex-ui/commit/677dea51cb6d251cdb25563e132d6cb7e3596948))

### Bug Fixes

- add missing wording ([b3d866f](https://github.com/aeternity/dex-ui/commit/b3d866f33a4f94ebd21bd23d94e8262edc9f1ddd))
- **deeplink:** preserves query params on callback ([8a31266](https://github.com/aeternity/dex-ui/commit/8a31266d879f76cf8b3f878d99fbe7fcfe7781d8))
- **e2e:** fixed typo ([4f23f75](https://github.com/aeternity/dex-ui/commit/4f23f75523a6bbe5de10eee0932fa814c7a02b44))
- **e2e:** increases timeout for wallet gen ([8b623bc](https://github.com/aeternity/dex-ui/commit/8b623bcb3cfecfdfc99cae99a5cbd5b2565a977f))
- remove leftover punctuation ([1b976ab](https://github.com/aeternity/dex-ui/commit/1b976abd36ffa52df5ecaa6f0d456d98159acf16))
- **swap:** makes from / to switch explicit function ([f8ef7ea](https://github.com/aeternity/dex-ui/commit/f8ef7ea25860d1809f438ae2c1da6b501c071913))
- **tx:** defaults to router in case the contracts are not initialized ([31859a7](https://github.com/aeternity/dex-ui/commit/31859a72cb981dde4bded270231eb5898de62c9a))

### Refactorings

- use flex-end instead end value with mixed support ([0920045](https://github.com/aeternity/dex-ui/commit/09200459c5a4e31a1e1d4519354c923fb4eb4574))

### Miscellaneous

- **deps:** upgrade browserlist ([ea495d0](https://github.com/aeternity/dex-ui/commit/ea495d03da07ce7f46906d619b7a0dae178d799d))
- removes linting from dockerfile ([b343626](https://github.com/aeternity/dex-ui/commit/b343626957c670fe28e86615ad905cad53820741))
- update Chinese translations ([4c168c9](https://github.com/aeternity/dex-ui/commit/4c168c96444dfea1d857ef2536b8ab6bf4451b54))

### Testing

- **e2e:** removes swapping ([46023a2](https://github.com/aeternity/dex-ui/commit/46023a2a0c3267bb4dee7451ae380f1e55e3f0f6))
- fix e2e tests ([91abcdc](https://github.com/aeternity/dex-ui/commit/91abcdce1ea25695a1ed0b8e5c0a479be33945c4))
- wallet login & logout e2e tests [#309](https://github.com/aeternity/dex-ui/issues/309) ([e35300e](https://github.com/aeternity/dex-ui/commit/e35300e26ac0dc86047de9cd3148ced5e67a4f78))

## [1.12.0](https://github.com/aeternity/dex-ui/compare/v1.11.0...v1.12.0) (2022-07-26)

### Features

- add Leave Feedback menu item ([21d0ca1](https://github.com/aeternity/dex-ui/commit/21d0ca10dc97728fcb69e3e6bf2624d07239de42))
- **dex-backend:** switch it on ([c9b6abf](https://github.com/aeternity/dex-ui/commit/c9b6abfba003aebb88829c6dbadfe8d42d06546d))
- remove menu icons ([066121d](https://github.com/aeternity/dex-ui/commit/066121d2a93b7cc9de413e1349130b7323efec24))

### Bug Fixes

- ability to remove account on mobile ([07d7ed7](https://github.com/aeternity/dex-ui/commit/07d7ed71f60080b59daca5f8f21ca8fff80e3c9f))
- **token-list:** manage token list button on smaller displays ([ea5b23d](https://github.com/aeternity/dex-ui/commit/ea5b23d18e870a9b5d446e53203557fc80e82f01))

## [1.11.0](https://github.com/aeternity/dex-ui/compare/v1.10.0...v1.11.0) (2022-07-19)

### Features

- **swap-view:** warning for expecting swap failure due to high price impact ([0dae434](https://github.com/aeternity/dex-ui/commit/0dae434982e8a901bb4d1f1e5d4418ec5f5e699c))

### Bug Fixes

- avoid issues with different fields for contract id ([019e079](https://github.com/aeternity/dex-ui/commit/019e0795875d5f052c5e33fac5f7e2622a372c4a))
- lint:style command ([ab42cff](https://github.com/aeternity/dex-ui/commit/ab42cff2cadf7a61956970e23f1270b0e3f1490e))
- make AE/WAE tokens icon the same everywhere ([d6a0378](https://github.com/aeternity/dex-ui/commit/d6a037876eeb1cfc49364a73c58d19321e7b3c83))

## [1.10.0](https://github.com/aeternity/dex-ui/compare/v1.9.0...v1.10.0) (2022-07-14)

### Features

- **dex-backend:** .env var for enable/disable ([c26a448](https://github.com/aeternity/dex-ui/commit/c26a448fbf5b4057803e27fe1acab596fe6c6d7a))
- **import-pool-view:** ux changes ([254a148](https://github.com/aeternity/dex-ui/commit/254a148fb0ac81976f035bed55d2cb595af62119))
- meta information [#351](https://github.com/aeternity/dex-ui/issues/351) ([07f5b7d](https://github.com/aeternity/dex-ui/commit/07f5b7d91d9b591db88c1d1f845975abb90e9208))
- multi languages support [#266](https://github.com/aeternity/dex-ui/issues/266) ([584aef3](https://github.com/aeternity/dex-ui/commit/584aef39e5c71339a9de54c3f6b0b2ba66b8d8dd))

### Bug Fixes

- **add-liquidity-view:** restore tip message ([5a1d084](https://github.com/aeternity/dex-ui/commit/5a1d084c5cafd26c1ce9095ac98235a1cf8370ea))
- **add-liquidity-view:** wrong ratios with dex-backend enabled ([3d83b10](https://github.com/aeternity/dex-ui/commit/3d83b10e741130a5479f3ec76fd2405042e6fa95))
- **pool-view:** filter provided liquidity by active network ([9c2bc71](https://github.com/aeternity/dex-ui/commit/9c2bc71436085c381438be0c665322a366dac6e2))
- **pool:** removes leftover brackets ([6adecb3](https://github.com/aeternity/dex-ui/commit/6adecb320107ddb70ddf7a71e9af9a7b099aa266))
- **remove-liquidity:** ability to remove custom liquidity ([ffe8a39](https://github.com/aeternity/dex-ui/commit/ffe8a399a822b4d86ebbc8e059742a29f8d06941))
- **remove-liquidity:** use a proper tag for a header ([ea61357](https://github.com/aeternity/dex-ui/commit/ea61357bda7626acbe017897e56181ddd09249cb))
- show correct information for sent transactions ([fb636a3](https://github.com/aeternity/dex-ui/commit/fb636a3631d4c0823bd13b6428150eed148a94dc))
- **swap-view:** swap button is enabled when there is no pair/route ([aa2ecb2](https://github.com/aeternity/dex-ui/commit/aa2ecb203b17ffbda2c6859c2db23b9de53d82be))

## [1.9.0](https://github.com/aeternity/dex-ui/compare/v1.8.0...v1.9.0) (2022-07-01)

### Features

- adds issue templates ([50eafcb](https://github.com/aeternity/dex-ui/commit/50eafcb635b0a264ccd89b5749d9d16d4abb08f8))
- **constants:** removes test token constants ([73d8e39](https://github.com/aeternity/dex-ui/commit/73d8e39fba39fa883a1182b73095d1823b74a2ad))
- **env:** mainnet is now first in the node list ([2e332d5](https://github.com/aeternity/dex-ui/commit/2e332d5b954f86599c9c8a518705fe85c5d78831))
- **env:** switches default network to mainnet ([1316772](https://github.com/aeternity/dex-ui/commit/1316772670f703a8a2bf77ca2a267bd0b7600497))
- show error message in the transcation status notification ([3f07152](https://github.com/aeternity/dex-ui/commit/3f071522ac22111720b92b5cb31c618aa9bd7b87))
- **swap-view:** change swap from pair to route ([fd8a18a](https://github.com/aeternity/dex-ui/commit/fd8a18af55eb4757e0d5acf58cb1f78fca4af8ee))
- **wallet:** updates two hardcoded testnet instances to default ([7e7f44d](https://github.com/aeternity/dex-ui/commit/7e7f44d5e40a1a9eb00d624bb2986e896073fad8))

### Bug Fixes

- **dex-backend:** error when dispatching backend/fetchingPairDetails ([b9654ce](https://github.com/aeternity/dex-ui/commit/b9654ce33c265fb10b882ba8ca707a6e9c92efcf))
- **dex-backend:** update token list by the new DEX provider name ([3e1b3ce](https://github.com/aeternity/dex-ui/commit/3e1b3ceaad423e69ddb4f9d5ee804ca1b748ee4a))
- increased wallet connection timeout ([2b552c0](https://github.com/aeternity/dex-ui/commit/2b552c03368a5190cbfe93599dd5525d2ec24452))
- no reserves when dex-backend is off ([3a535d0](https://github.com/aeternity/dex-ui/commit/3a535d0b3af97e29966545e3a41698f4b32572c7))
- **pending-transaction-handler:** set transaction status properly ([605c727](https://github.com/aeternity/dex-ui/commit/605c72723d0128f66dd9d6fd7f45715b5e801e17))
- **remove-liquidity:** show token symbols properly ([71038fc](https://github.com/aeternity/dex-ui/commit/71038fc5ee1ba476298798750dee2befbb8428f9))
- **saveTokenSelectionMixin:** isLastAmountFrom query param as boolean ([acc4d84](https://github.com/aeternity/dex-ui/commit/acc4d84585bab9c7a5557d5ccbda03e130d53837))

### Refactorings

- **connection-status:** adjust status style ([b622155](https://github.com/aeternity/dex-ui/commit/b622155d163ef5f8eec5ba4b61a20060d2addc8f))

### CI / CD

- **build:** deploy lastet main on prod ([1fcdebd](https://github.com/aeternity/dex-ui/commit/1fcdebdc6e3ad142a5473820292dff6276b4b646))

### Miscellaneous

- adjusts issue template extensions ([64a926e](https://github.com/aeternity/dex-ui/commit/64a926e05f55489d3a84cb33e3eeeb5840fd8d06))
- **dex-backend:** remove ensureTokenList from production ([f5a210a](https://github.com/aeternity/dex-ui/commit/f5a210ad81e5d8c5d4936585f40662d7bd0afe9e))
- fixes issues with templates ([b0004db](https://github.com/aeternity/dex-ui/commit/b0004dbf6a5cb8e8c010287f9fa40078b729b56d))
- price impact for swap-routes ([4fcdeb3](https://github.com/aeternity/dex-ui/commit/4fcdeb3670acd121437cd383ee07e456d8a00974))
- **swap-view:** use swap-route mixin ([b0bfae2](https://github.com/aeternity/dex-ui/commit/b0bfae235e8d53f35f36a5cf662b6ecd0b7d2e60))

## [1.8.0](https://github.com/aeternity/dex-ui/compare/v1.7.0...v1.8.0) (2022-06-24)

### Features

- **nginx:** change restricted url ([f1f72d8](https://github.com/aeternity/dex-ui/commit/f1f72d8bc3d6c4574c2d172db56f4cebe12f03f5))

## [1.7.0](https://github.com/aeternity/dex-ui/compare/v1.6.0...v1.7.0) (2022-06-15)

### Features

- add connectionStatusTracker plugin ([8653a3c](https://github.com/aeternity/dex-ui/commit/8653a3cfd43af3ea43f55b0fe4cdb10642b36327))
- **dex-backend:** continuously fetching for pair info and dex backend status ([88e0299](https://github.com/aeternity/dex-ui/commit/88e02993bc5dbe697765abdeb524eaa89a82299b))
- **dex-backend:** fetch and replace tokens list ([81be3c2](https://github.com/aeternity/dex-ui/commit/81be3c26ba9f5739c2e0f5a127352f687ab4ef41))
- notify user if connection is lost ([902a588](https://github.com/aeternity/dex-ui/commit/902a58836fc484a699038e414a583017489b62c2))
- show the connection status ([7afda5d](https://github.com/aeternity/dex-ui/commit/7afda5d4967ce0ebc25d749079e447590b14fb04))
- **tokens:** rename token.name 'WAE' to 'Wrapped AE' ([5539297](https://github.com/aeternity/dex-ui/commit/553929785767919bc22ab5ca0b7899a642694b7e))
- **ui:** account info modal ui improvements ([b6eb4de](https://github.com/aeternity/dex-ui/commit/b6eb4de9bc4ab6b2236fab8dc666d00402045e4c))
- **ui:** add/remove liquidity ([5760a38](https://github.com/aeternity/dex-ui/commit/5760a3834642175e0314c98c0360edddc9f37d25))
- **ui:** added favicons ([2776df6](https://github.com/aeternity/dex-ui/commit/2776df6f95c26ebb86371791f5d12a677e437f04))
- **ui:** brand color & font-size [#324](https://github.com/aeternity/dex-ui/issues/324) ([d298e2d](https://github.com/aeternity/dex-ui/commit/d298e2dd59f12961b808c4df93fac11cb27a1b88))
- **ui:** confirm swap & submit transaction modals ([0f03317](https://github.com/aeternity/dex-ui/commit/0f03317bc09df205839c0429120a7de36bd8c3d7))
- **ui:** connect wallet modal ui improvement ([510767a](https://github.com/aeternity/dex-ui/commit/510767a443bf293a2c8662ba1921159dc2101d8b))
- **ui:** header wallet address ([3b615b0](https://github.com/aeternity/dex-ui/commit/3b615b0759ae566d0ac467fcb7393aee88ba9720))
- **ui:** mobile responsive ([8630830](https://github.com/aeternity/dex-ui/commit/8630830c16c9c3a5d401ebf66ac783fc861e0e3f))
- **ui:** pool view ([4d90512](https://github.com/aeternity/dex-ui/commit/4d90512e9c9d687fa72ff169d93dc321a009cca8))
- **ui:** recent transactions & buttons,inputs hover effects ([b163576](https://github.com/aeternity/dex-ui/commit/b163576161ac73df7075208db2603e9655c0d3d1))
- **ui:** select token modal ui improvements ([a5349ca](https://github.com/aeternity/dex-ui/commit/a5349ca2c73d19b3c7295d32406d61535d3c3349))
- **ui:** style fixes ([39064a8](https://github.com/aeternity/dex-ui/commit/39064a8ebd64a317d05ce83a3f00a055dc435848))
- **ui:** token selector & swap view ([3f6e4d3](https://github.com/aeternity/dex-ui/commit/3f6e4d3dadfd4377673508280a4d6562f6d2a908))
- **ui:** transaction settings ui improvements ([7c050d7](https://github.com/aeternity/dex-ui/commit/7c050d71d1578786aa0580ee64987a80664aad2d))
- updated app name ([073ae14](https://github.com/aeternity/dex-ui/commit/073ae14caf838b90b5b2f5d60e864795dad01d9f))

### Bug Fixes

- clear local storage on disconnect [#280](https://github.com/aeternity/dex-ui/issues/280) ([a70d89d](https://github.com/aeternity/dex-ui/commit/a70d89d8c8ba66663bc68bc06bca02cad09ac06e))
- correct indent of release listener ([c5c2db6](https://github.com/aeternity/dex-ui/commit/c5c2db6143194f1a4b36c75193f80e1fd03814d6))
- dependencies [#329](https://github.com/aeternity/dex-ui/issues/329) ([b31bc6e](https://github.com/aeternity/dex-ui/commit/b31bc6e12096b3ac1ffa2e142faa324535dab8b9))
- **ui:** modals positions and width ([10a84ab](https://github.com/aeternity/dex-ui/commit/10a84ab5df6411f72c42290dd916ef5d28f5cc1c))

### Miscellaneous

- bump release please ([f1b4453](https://github.com/aeternity/dex-ui/commit/f1b44537c7ad87ab054e8a8085b3442a201eab66))
- **dex-backend:** add dex-backend support ([6f60bbc](https://github.com/aeternity/dex-ui/commit/6f60bbc47be8557aed0b849e3e8087a3354d7092))
- terms and conditions [#73](https://github.com/aeternity/dex-ui/issues/73) ([c09e859](https://github.com/aeternity/dex-ui/commit/c09e8597adf753ce0a54c0a6bcb3d84d0bf88a78))

### Refactorings

- spelling fixes ([301f13d](https://github.com/aeternity/dex-ui/commit/301f13d6628b1867285d618bd53c65bed2c370de))

## [1.6.0](https://www.github.com/aeternity/dex-ui/compare/v1.5.2...v1.6.0) (2022-04-29)

### Features

- **token-selector:** allow swapping arbitrary tokens [#245](https://www.github.com/aeternity/dex-ui/issues/245) ([04e5d14](https://www.github.com/aeternity/dex-ui/commit/04e5d148d9f793a0a44db85dbc4b5229da367a31))

### Bug Fixes

- fetch mdw aex9 tokens ([cdf6d10](https://www.github.com/aeternity/dex-ui/commit/cdf6d10dafba6759920ae7d8e42a2b811c05df89))
- pool view navigation [#255](https://www.github.com/aeternity/dex-ui/issues/255) ([93dbe8d](https://www.github.com/aeternity/dex-ui/commit/93dbe8d3591d4e5ae8579ecaecb8fbabc398aff7))
- should fetch allowance & pair info when sdk is ready [#289](https://www.github.com/aeternity/dex-ui/issues/289) ([79d503e](https://www.github.com/aeternity/dex-ui/commit/79d503eb177aa7e33afaae4669b68499ce2a6ffc))
- wallet connect behavior [#237](https://www.github.com/aeternity/dex-ui/issues/237) ([f808516](https://www.github.com/aeternity/dex-ui/commit/f808516ad6db1f4b1a65501dfc04ae725cacf5bc))
- when polling balance fails return balance as 0 ([75fd494](https://www.github.com/aeternity/dex-ui/commit/75fd494a3220d4be973d60116f70000a1a546f27))

### Miscellaneous

- update SDK to 11.0.1 ([dec7531](https://www.github.com/aeternity/dex-ui/commit/dec7531a1c94274fa1f392f2ad13c79043137d2e))

### [1.5.2](https://www.github.com/aeternity/dex-ui/compare/v1.5.1...v1.5.2) (2022-04-07)

### Bug Fixes

- init contracts if wallet is not connected ([a661872](https://www.github.com/aeternity/dex-ui/commit/a66187296e2f1fb5a0c663cbb0227d38867d1e00))

### [1.5.1](https://www.github.com/aeternity/dex-ui/compare/v1.5.0...v1.5.1) (2022-04-05)

### Bug Fixes

- **select-token-modal:** properly remove ae/wae on corresponding flag ([073730b](https://www.github.com/aeternity/dex-ui/commit/073730b145f943ae35f8e0125cddea10560f85d4))
- **submit-transactiom-modal:** disable closing the modal if not confirmed ([6205377](https://www.github.com/aeternity/dex-ui/commit/62053776385f386f77f09514d5af97a1c95a15dd))

## [1.5.0](https://www.github.com/aeternity/dex-ui/compare/v1.4.0...v1.5.0) (2022-04-05)

### Features

- added header dropdown options [#275](https://www.github.com/aeternity/dex-ui/issues/275) ([932d7ed](https://www.github.com/aeternity/dex-ui/commit/932d7edea1ba8b3fc2b3f94a5be11ab11811be8d))
- switch network on runtime [#294](https://www.github.com/aeternity/dex-ui/issues/294) ([fc41e01](https://www.github.com/aeternity/dex-ui/commit/fc41e0133c861e922145f2c938caac98150c92c2))

### Bug Fixes

- **account-modal:** close modal after disconnecting ([e6a3387](https://www.github.com/aeternity/dex-ui/commit/e6a3387860498f02dff648cd4fe9c1329879be98))
- add missing address state ([5d100a0](https://www.github.com/aeternity/dex-ui/commit/5d100a028760577544be1a30031b51bae32629cb))
- **add-liquidity:** properly check if enough balance ([cfc9b96](https://www.github.com/aeternity/dex-ui/commit/cfc9b96001b1a46878b9ad2e9fb5b061048dcf38))
- adding liquidity to new pair is broken ([53f9f4d](https://www.github.com/aeternity/dex-ui/commit/53f9f4d3f166a75c70d2e3a1be1079073df91f85))
- enable connect wallet button ([5925b62](https://www.github.com/aeternity/dex-ui/commit/5925b62ad1598efda5a9cc0426fad3e13fa6bdc5))
- **import-pool:** avoid pulling liquidity without address ([39ed3f9](https://www.github.com/aeternity/dex-ui/commit/39ed3f9ddb008759cc3c65998ab0cdc01721e2a6))
- **index:** do not scan for wallets if already connected ([93cee33](https://www.github.com/aeternity/dex-ui/commit/93cee33d16eb71a177071adadef89ff8860f15c5))
- **set-token-pair-info-mixin:** set amount more precisely ([d05e7c5](https://www.github.com/aeternity/dex-ui/commit/d05e7c5984b219718e630b7dca9e6fd4026a5655))
- **swap-view:** handle errors from the swap actions correctly ([f1442f2](https://www.github.com/aeternity/dex-ui/commit/f1442f276b8284745d0472203b2367b167d7f200))

### Refactorings

- check chosenTokens for null on side of SelecteTokenModal ([8af6c6f](https://www.github.com/aeternity/dex-ui/commit/8af6c6f376219745a73a4f5174b2cc649917da41))
- **connect-wallet-modal:** remove unused prop ([a1abf76](https://www.github.com/aeternity/dex-ui/commit/a1abf768d7448ee3dad61f0bf3f40e8dfaee43ee))
- extract more function into allowance mixin ([9a59dea](https://www.github.com/aeternity/dex-ui/commit/9a59deacb40c1d1182a843b83559b15c6864cb21))
- extract setTokenPairInfoMixin ([37bb972](https://www.github.com/aeternity/dex-ui/commit/37bb972f317b41f5e2256082ab2b5a726dd3184d))
- **swap-view:** remove unused function ([f8cc4a4](https://www.github.com/aeternity/dex-ui/commit/f8cc4a424427dc0240d32ab466c62db713effe3a))
- **swap-view:** rename token related variables ([8615c49](https://www.github.com/aeternity/dex-ui/commit/8615c49b3d666e77bfcf906a451449caff3b073a))

### Miscellaneous

- latest contract versions on testnet ([86d9242](https://www.github.com/aeternity/dex-ui/commit/86d92421fe77844e6ac451efd90c7d0a1cff9c9e))
- rearrange mixins ([c22b821](https://www.github.com/aeternity/dex-ui/commit/c22b821390b9f457f61db56d4a6cf2223523c864))

## [1.4.0](https://www.github.com/aeternity/dex-ui/compare/v1.3.0...v1.4.0) (2022-03-30)

### Features

- add WAE to the AddLiquidity view ([ce44b15](https://www.github.com/aeternity/dex-ui/commit/ce44b15ece064e039eacc809d239a5c159738a18))
- **select-token-modals:** add ability to see selected tokens ([aa9f4f3](https://www.github.com/aeternity/dex-ui/commit/aa9f4f3dd4c4f7dbb1f9929191589408d592d1e4))

### Bug Fixes

- **confirm-swap-modal:** set correct provider fee ([8b18127](https://www.github.com/aeternity/dex-ui/commit/8b18127b8d5e59f901bb3fac2688f6759b519d33))
- liquidity is not stored based on owner's address ([b76844d](https://www.github.com/aeternity/dex-ui/commit/b76844d733673e9889ba9055a5b51d2a8d0e6d8b))
- modal should close on route change [#267](https://www.github.com/aeternity/dex-ui/issues/267) ([21f78ef](https://www.github.com/aeternity/dex-ui/commit/21f78ef8666f47d4090181ae7299a1ec7d7773e7))
- prevent error modal from close when resolve is null ([c701ba9](https://www.github.com/aeternity/dex-ui/commit/c701ba9b9ea22515f017be055dbabbe819af07d1))
- **select-token-modal:** set a uniq key ([9c7b808](https://www.github.com/aeternity/dex-ui/commit/9c7b808ba39d5e953a91d51d5e8b6cd3e2cb2852))
- show to the user if there is no pair ([3152a8a](https://www.github.com/aeternity/dex-ui/commit/3152a8ad04d1b487359dc824a4de1c1366dc124f))
- show unsupported networks error on network change ([fbbbf80](https://www.github.com/aeternity/dex-ui/commit/fbbbf80b391448297b6a417da7e92268f41f108b))

## [1.3.0](https://www.github.com/aeternity/dex-ui/compare/v1.2.0...v1.3.0) (2022-03-21)

### Features

- **add-liquidity:** approval state depending on fetched allowance ([ccf5b30](https://www.github.com/aeternity/dex-ui/commit/ccf5b306928e3648d29e8f14e4e6777e3313fec9))
- added connect wallet modal [#215](https://www.github.com/aeternity/dex-ui/issues/215) ([07e0775](https://www.github.com/aeternity/dex-ui/commit/07e077518faafd05cdf4eb0c41897f632b67ef21))
- keep (swap,add-liquidity) selection state on navigation [#151](https://www.github.com/aeternity/dex-ui/issues/151) ([dcc88e2](https://www.github.com/aeternity/dex-ui/commit/dcc88e2d470f1dbb972b8a225b5fbbce50860aff))
- **remove-liquidity:** approval state depending on fetched allowance ([d2ae22f](https://www.github.com/aeternity/dex-ui/commit/d2ae22f9bfc4892c63f206dac92ec13d43faddb9))
- removed unnecessary close buttons on modals [#219](https://www.github.com/aeternity/dex-ui/issues/219) ([b83498c](https://www.github.com/aeternity/dex-ui/commit/b83498c071b2c0a81111b342a1efaef6627ccef5))
- **swap:** approval state depending on fetched allowance ([7f58187](https://www.github.com/aeternity/dex-ui/commit/7f58187342fc4753b654da7f261fc7b34f05f090))
- upgrade node and dependencies [#225](https://www.github.com/aeternity/dex-ui/issues/225) ([105501c](https://www.github.com/aeternity/dex-ui/commit/105501c0af0325d56a39369596318ccdc4e9a506))
- view wallet actions [#216](https://www.github.com/aeternity/dex-ui/issues/216) ([9cb7da6](https://www.github.com/aeternity/dex-ui/commit/9cb7da6d0eb50d1e07bf49e203821b058d80bed1))
- wallet disconnect ([d91cece](https://www.github.com/aeternity/dex-ui/commit/d91cececcc1cdeef7f3d9ea655d80031dc37bfc3))

### Bug Fixes

- **account-info:** correct typo in wording ([a686303](https://www.github.com/aeternity/dex-ui/commit/a68630393a3ad55fe06dc9e8acefad506860d519))
- **AeBalance:** initial balance for tokens is not BigNumber ([94d0e67](https://www.github.com/aeternity/dex-ui/commit/94d0e672e137224b016827eddc8bb6057d2d3fe3))
- **aeternity-module:** approving twice needed allowance amount ([3a3d7af](https://www.github.com/aeternity/dex-ui/commit/3a3d7af04a60d12001bd37e46ed1412d204b322c))
- **connect-wallet:** do not start another wallet scan while already scanning ([ce230c4](https://www.github.com/aeternity/dex-ui/commit/ce230c4ae17c5eebfe5ac56d4afb0b7c294a8f7a))
- **connet-wallet:** remove window reload on wallet disconnect ([84bbf0c](https://www.github.com/aeternity/dex-ui/commit/84bbf0c4d5d1bf478f86a163713906ee4e496949))
- disable sentry on localhost [#246](https://www.github.com/aeternity/dex-ui/issues/246) ([47a3a3f](https://www.github.com/aeternity/dex-ui/commit/47a3a3f550f86471ef26f366a2042d3170c68cb7))
- **index:** disconnect wallet on connect/subscribe error ([74c028a](https://www.github.com/aeternity/dex-ui/commit/74c028aee8f4d4909663f11fc8a9666e0337ffb9))
- **index:** force sending close connection message ([18b8719](https://www.github.com/aeternity/dex-ui/commit/18b8719ab95971f78587d3e6f9762d88a57f483f))
- keep (swap,add-liquidity) selection state on navigation [#151](https://www.github.com/aeternity/dex-ui/issues/151) ([cf71119](https://www.github.com/aeternity/dex-ui/commit/cf711196031b69b7fe1443c58e3596ccfd9fe326))
- show animated spinner svg correctly ([b08b5cf](https://www.github.com/aeternity/dex-ui/commit/b08b5cfc1d5d699a40911a4921a93a2243a15f01))
- show custom token image correctly ([49a0d4a](https://www.github.com/aeternity/dex-ui/commit/49a0d4a04c01258e76b1d76bbc2aa8367aa7cb3a))
- view transaction for the ae/wae swaps ([e654c81](https://www.github.com/aeternity/dex-ui/commit/e654c818a0e7d4ed570528a064fd751d95b223de))
- view transaction in the explorer for each submitted transaction ([ec5e005](https://www.github.com/aeternity/dex-ui/commit/ec5e00526146c70d1f62f6f3024fa7771dc616b9))
- **vue-config:** enable default loading svgs ([20fa4e7](https://www.github.com/aeternity/dex-ui/commit/20fa4e743c5cd2b61406bd2ef6896f6dc916857f))

### Miscellaneous

- create license ([64c2d39](https://www.github.com/aeternity/dex-ui/commit/64c2d390ec2975c3785c943563b4a8f0005cabb6))

### Refactorings

- adjust SelectTokenModal ([644ecde](https://www.github.com/aeternity/dex-ui/commit/644ecde152a6ab8179f813a5a3a6d6fc39bc963f))
- move addSlippage and subSlippage to utils ([50a0377](https://www.github.com/aeternity/dex-ui/commit/50a0377645674f25159456cc1584a289f3d94e25))

## [1.2.0](https://www.github.com/aeternity/dex-ui/compare/v1.1.0...v1.2.0) (2022-03-07)

### Features

- add confirmation and loading modals ([29c3a04](https://www.github.com/aeternity/dex-ui/commit/29c3a043123870e4821ca48dae55db8e80664e40))
- added header menu items [#157](https://www.github.com/aeternity/dex-ui/issues/157) ([3921c32](https://www.github.com/aeternity/dex-ui/commit/3921c32e2772025cd08805dda48afa915c5e2889))
- added inline svg loader [#46](https://www.github.com/aeternity/dex-ui/issues/46) ([2575136](https://www.github.com/aeternity/dex-ui/commit/2575136cfd70415beb6480e5d61ea7b4c2d907b3))
- added sentry [#202](https://www.github.com/aeternity/dex-ui/issues/202) ([db053d3](https://www.github.com/aeternity/dex-ui/commit/db053d363a084b44ae373ea841dcb24e03ea75f3))
- adjust network support message [#214](https://www.github.com/aeternity/dex-ui/issues/214) ([950d785](https://www.github.com/aeternity/dex-ui/commit/950d785d5accfba42480884f999f073f3a660e13))
- change contract vresion with newer ones ([a2345c9](https://www.github.com/aeternity/dex-ui/commit/a2345c9233e542e09c81f7771c19b1d400323301))
- on fetching pair show loading indicators & disable action buttons [#148](https://www.github.com/aeternity/dex-ui/issues/148) ([d17a1ef](https://www.github.com/aeternity/dex-ui/commit/d17a1efb3dae41a0093e45c386546eb766e4e2ed))
- only allow numbers on amount fields [#218](https://www.github.com/aeternity/dex-ui/issues/218) ([bc0adcc](https://www.github.com/aeternity/dex-ui/commit/bc0adccb5422780425becd669313ec82fed25fdf))
- **remove-liquidity:** add error modal ([7a39e7b](https://www.github.com/aeternity/dex-ui/commit/7a39e7b831070294bee51cc79714e34ca60b7770))
- **swap:** disable approve button on process [#149](https://www.github.com/aeternity/dex-ui/issues/149) ([c58e5fd](https://www.github.com/aeternity/dex-ui/commit/c58e5fd011b8e18e109d43d1a6d827881c7fce06))
- **swap:** disable swap when amounts are invalid [#220](https://www.github.com/aeternity/dex-ui/issues/220) ([e087909](https://www.github.com/aeternity/dex-ui/commit/e087909e2945612214fbb83256efc05175dc5557))
- **swap:** view transaction link [#169](https://www.github.com/aeternity/dex-ui/issues/169) ([36e2307](https://www.github.com/aeternity/dex-ui/commit/36e2307585e39cc6cb95c7f03668cc6b0d43c518))
- update dark background color [#212](https://www.github.com/aeternity/dex-ui/issues/212) ([049d57e](https://www.github.com/aeternity/dex-ui/commit/049d57e36ca8f88ba2c68b8fdbe52295c3ab5c80))

### Bug Fixes

- **add-liquidity:** disable buttons on invalid amount ([45d8cfb](https://www.github.com/aeternity/dex-ui/commit/45d8cfb71853208d768ef28c83b23af8c791ee4d))
- **add-liquidity:** disable supply if not approved ([9d3b75a](https://www.github.com/aeternity/dex-ui/commit/9d3b75a2965917567da99851503a5bd4eea4b5bf))
- adding liquidity on new pairs ([2ec59b8](https://www.github.com/aeternity/dex-ui/commit/2ec59b856f8cfb70a8a959e8ed71b3e8cbcde72c))
- **aeternity:** call correct wae methods once ([5c65210](https://www.github.com/aeternity/dex-ui/commit/5c65210de77e0f63d1f067765e31b957ed08bef3))
- **aeternity:** call wae withdraw with a proper param ([64bc436](https://www.github.com/aeternity/dex-ui/commit/64bc4360b3f411475aee46d9079d875106ca2a15))
- call getPairInfo when factory is ready ([af10e7f](https://www.github.com/aeternity/dex-ui/commit/af10e7f1f61c863481add958680fc4db3d086b03))
- migrate svg icons import to inline component [#46](https://www.github.com/aeternity/dex-ui/issues/46) ([006a10c](https://www.github.com/aeternity/dex-ui/commit/006a10c2f492d291d27501f7b7b2fa88aacfa975))
- only allow number when input type is number [#218](https://www.github.com/aeternity/dex-ui/issues/218) ([d78555e](https://www.github.com/aeternity/dex-ui/commit/d78555e52905c2e4160eebdc4fa7befb19aea247))
- **remove-liquidity:** show only loaded pool info ([c3cbd35](https://www.github.com/aeternity/dex-ui/commit/c3cbd35757bd60ea647dafe98f192b922baa77f5))
- **unfinished-features:** load flag for unfinished features properly ([9018830](https://www.github.com/aeternity/dex-ui/commit/90188304194e56fd478d39f3976eb0a199d945bc))

### Miscellaneous

- **liquidity-details:** hide not working link [#156](https://www.github.com/aeternity/dex-ui/issues/156) ([23a8138](https://www.github.com/aeternity/dex-ui/commit/23a8138bd15fe2856e3209f39584352311734ab0))
- make SubmitTransactionModal more general ([7fde63f](https://www.github.com/aeternity/dex-ui/commit/7fde63f5a83da32221571972b12e8f6a982d32e3))

### Refactorings

- modify comments ([5043b14](https://www.github.com/aeternity/dex-ui/commit/5043b14c96cb9679a8e9e4aff1236a23dee7cdd7))
- move contracts initialization into one action ([450753f](https://www.github.com/aeternity/dex-ui/commit/450753f1c69a243fefbc278f7394688df6a1a1dd))

## [1.1.0](https://www.github.com/aeternity/dex-ui/compare/v1.0.0...v1.1.0) (2022-02-21)

### Features

- add ability to set deadline ([dad500c](https://www.github.com/aeternity/dex-ui/commit/dad500cf511cfe71cbfc939071223adb204a8b8d))
- add ability to set slippage ([918b68a](https://www.github.com/aeternity/dex-ui/commit/918b68acdb5d0a0f05894d888e94f44ec6d9fcbf))
- add flag UNFINISHED_FEATURES ([c1b9e02](https://www.github.com/aeternity/dex-ui/commit/c1b9e0215233178fcca73309794271ca3e7985d0))
- add proper states for remove liquidity ([39540ac](https://www.github.com/aeternity/dex-ui/commit/39540ac4791044e893c61e2ed13e60b8fcf8b2d0))
- add showError action for error handling ([de23558](https://www.github.com/aeternity/dex-ui/commit/de2355800b3e82744a01d02e6d4e16486e288272))
- **ae-vs-wae:** input tokens addition and other special cases in swap and liquidity ([f599e67](https://www.github.com/aeternity/dex-ui/commit/f599e6751ea871a708af650aecb674b606612424))
- **aeternity:** allow to sign transactions via deeplinks ([2e18b38](https://www.github.com/aeternity/dex-ui/commit/2e18b38b6c9238df7219302d736b3c21fa95aa23))
- **button-default:** add second-dark calss ([0c5f936](https://www.github.com/aeternity/dex-ui/commit/0c5f936de5c11c78f2880b2bceac4bac5b75a50b))
- implement import liquidity & some cleaning ([fde48a2](https://www.github.com/aeternity/dex-ui/commit/fde48a26c9e9fc7c97302e019b589d5c63baeef5))
- **import-pool:** replace old message with LiquidityDetails ([66a9b66](https://www.github.com/aeternity/dex-ui/commit/66a9b66a983f4680b933de0b01427468c18b0be8))
- login with deeplink ([351c473](https://www.github.com/aeternity/dex-ui/commit/351c473611bb60c20d2006c5bff3b7dc157ef252))
- make "connect wallet" a manual step ([efcad68](https://www.github.com/aeternity/dex-ui/commit/efcad6887a58b657e2f79abc1f74d050ef38077e))
- **pool:** added loading & error indicators for liquidity pool [#150](https://www.github.com/aeternity/dex-ui/issues/150) ([7344004](https://www.github.com/aeternity/dex-ui/commit/73440048fad0305286a684a2989082698c42f465))
- provided liquidity ([f155cd1](https://www.github.com/aeternity/dex-ui/commit/f155cd1071dfd283450d31585e0baa455e87745c))
- remove liquidity ([cf0a730](https://www.github.com/aeternity/dex-ui/commit/cf0a73068d7c1737a54a8442f37ba7a7a92dac6c))
- remove liquidity view route ([1d813fa](https://www.github.com/aeternity/dex-ui/commit/1d813fa43d36055579288d68a390655b33b1cb41))
- **remove-liquidity:** hide detailed view on production ([c416e9d](https://www.github.com/aeternity/dex-ui/commit/c416e9de8c6c3292475b8b23f884b097818167f7))
- **swap:** ae vs wae ([a1a6cc1](https://www.github.com/aeternity/dex-ui/commit/a1a6cc1d0ab80f0b7dd184cbfb8eba192b68701c))

### Bug Fixes

- **add-liquidity:** fix MIN_LIQUIDITY usage in addLiqudity entrypoint call ([ba70396](https://www.github.com/aeternity/dex-ui/commit/ba70396488092f35125cb4008c05247c82ff5463))
- create allowance not being called anymore ([68314bc](https://www.github.com/aeternity/dex-ui/commit/68314bc1ce4b71c50e6e0dbebc595eb3b55fefb4))
- disable button on zero amount ([14537fc](https://www.github.com/aeternity/dex-ui/commit/14537fcda54b74d13436dcaac86bcfa4124fea80))
- do not close active connection with iframe wallet ([279fd7c](https://www.github.com/aeternity/dex-ui/commit/279fd7c3586e8c4443fe3c862829f80ab6e06c0b))
- expandDecimals doesn't work for big numbers anymore ([9c695ba](https://www.github.com/aeternity/dex-ui/commit/9c695ba230dc9e6bad1f554b30178508b73450a4))
- **index:** actually persist network and slippage ([a178d44](https://www.github.com/aeternity/dex-ui/commit/a178d44a58ac8c4e583a8bcc9089079f4b1532b5))
- **input:** ae balance for input-token ([#107](https://www.github.com/aeternity/dex-ui/issues/107)) ([e5a25ad](https://www.github.com/aeternity/dex-ui/commit/e5a25add3d24553da558d686ab40b6a14ae547c5))
- **liquidity:** general ui feedback fixes ([0b65074](https://www.github.com/aeternity/dex-ui/commit/0b650743018c3c3deebf91c2d0c56c62b5ce949d))
- **pools-view:** remove unwanted back button [#143](https://www.github.com/aeternity/dex-ui/issues/143) ([e298f13](https://www.github.com/aeternity/dex-ui/commit/e298f1356e611c6df16d0ca5211dca7ac1dc4791))
- show proper prices information ([aca15ee](https://www.github.com/aeternity/dex-ui/commit/aca15ee9610d76d8c9be67db7b8321fa648ae920))
- SubmitTransactionModal infinite loading on error ([0116d41](https://www.github.com/aeternity/dex-ui/commit/0116d41ede86c1f99c6d5e61418938b4caee5048))
- swap tokens rate shown as null when wallet is not connected ([5ffa95a](https://www.github.com/aeternity/dex-ui/commit/5ffa95a831bf8132c6fcff20bb8c93990689d9e6))
- **swap-view:** disable swap button on not enought balance ([e14ea1e](https://www.github.com/aeternity/dex-ui/commit/e14ea1eceded189cfcb44a4e8545f1fd26e26990))
- **swap-view:** show propper message if no token selected ([17a43c7](https://www.github.com/aeternity/dex-ui/commit/17a43c7282ca0c18ddc113cb6a0edec5e04e1319))
- **swap:** bind confirmation modal info values ([c5b27eb](https://www.github.com/aeternity/dex-ui/commit/c5b27eb83957838b24bf8c00fa7ab8288be2c52f))
- **ui:** text typo & style [#140](https://www.github.com/aeternity/dex-ui/issues/140) ([7d1eb52](https://www.github.com/aeternity/dex-ui/commit/7d1eb52d09bbec06b193f5cf5b98cf0b9af26ef8))
- wallet auto reconnect ([fe76d57](https://www.github.com/aeternity/dex-ui/commit/fe76d576694945ebb5be95b59e73a12865f3d74d))

### CI / CD

- **github:** fix app name in prod pipeline ([#110](https://www.github.com/aeternity/dex-ui/issues/110)) ([10e4d01](https://www.github.com/aeternity/dex-ui/commit/10e4d01db3c138a483530f4097dfb88e078523ae))
- **github:** fix staging undeploy events/trigger ([0593af8](https://www.github.com/aeternity/dex-ui/commit/0593af8a45fca9003760a222e8ae79ed4816ee02))
- **github:** make gh action to use new version of composite actions and pr sync ([4dd5056](https://www.github.com/aeternity/dex-ui/commit/4dd50561fa5b954ced7f568c8db8d500856cb433))

### Refactorings

- **add-liquidity:** remove useless try catch ([2ff850d](https://www.github.com/aeternity/dex-ui/commit/2ff850d6a86038288284b235e35c80c6a6ea1f4d))
- **confirm-swap-modal:** simplify mapState usage ([9dce772](https://www.github.com/aeternity/dex-ui/commit/9dce7726f72171b87793901274bd64f4116a4108))
- consistent usage of data variables ([5156ad3](https://www.github.com/aeternity/dex-ui/commit/5156ad31f75d54c6271ac797ca455ce4ff32cfd9))
- eliminate type-unsafe equality operators ([67aee65](https://www.github.com/aeternity/dex-ui/commit/67aee6564583bca01c09cc7044df51302cb12b62))
- extract constants in additional file ([f382025](https://www.github.com/aeternity/dex-ui/commit/f3820259a949a074a2c091546ec8977a2636216b))
- extract getAePair ([f36908c](https://www.github.com/aeternity/dex-ui/commit/f36908c8b522b1a4439850ba895c423880878ea4))
- extract getPairInfo ([93f4d01](https://www.github.com/aeternity/dex-ui/commit/93f4d0133dd526ba3d205ddf79717029b28a181d))
- **liquidity-item:** move liquidity details into a separate component ([5e8e07f](https://www.github.com/aeternity/dex-ui/commit/5e8e07f1d245c3a98a0a4ab5dd3c61001fe67760))
- **liquidity-item:** remove unnecessary method ([3946717](https://www.github.com/aeternity/dex-ui/commit/394671712dc3529e288822bad2df78b49036e41b))
- minimum/maximum received/spend and output/input label ([95eea8e](https://www.github.com/aeternity/dex-ui/commit/95eea8e03a26164229f77fe9f0092c237fb313e9))
- remove unnecessarily extra condition for getAePair ([a8b0791](https://www.github.com/aeternity/dex-ui/commit/a8b07914020e5c2b3193dd6888e977108ef43817))
- **remove-liquidity:** improve css style ([e093076](https://www.github.com/aeternity/dex-ui/commit/e093076439ddc753714c058a3735b764f4b43d81))
- removing empty contract interface ([40e71dc](https://www.github.com/aeternity/dex-ui/commit/40e71dce744654e46973ce410610a49407297b3c))
- simplify expandDecimals and reduceDecimals ([db69ace](https://www.github.com/aeternity/dex-ui/commit/db69ace4d2f6a6f521505610395b137144403011))
- **swap-view:** extract callSwapAction ([ab73798](https://www.github.com/aeternity/dex-ui/commit/ab73798a2194a2dd8417ec3a42d75359518833c0))
- **swap-view:** fix code style issues ([b9612d3](https://www.github.com/aeternity/dex-ui/commit/b9612d37e6357a7b122c0a22f43aecb0a741285d))
- use undestandable abbreviation for an error ([aa463c2](https://www.github.com/aeternity/dex-ui/commit/aa463c221e712df7cbfc8b63241b76753ab790d6))

### Miscellaneous

- add hasEnoughAllowance action ([98cdb91](https://www.github.com/aeternity/dex-ui/commit/98cdb916d5feaa4659a3535b5a7a20d1226be351))
- add stylelint config ([18fa4bb](https://www.github.com/aeternity/dex-ui/commit/18fa4bb86f9091fbc7b1c706309f1c342f02e38c))
- add stylelint into dev dependencies ([be5076b](https://www.github.com/aeternity/dex-ui/commit/be5076bcc19e380ee8a52556fe07287ed1f55e1a))
- check if mobile as global property ([2d6142e](https://www.github.com/aeternity/dex-ui/commit/2d6142ed4c748fdfc2b8ef146def20a95c300cf6))
- create deeplink function ([84a9a50](https://www.github.com/aeternity/dex-ui/commit/84a9a50736b822f9dbdc624825560e5608f07c25))
- **lint:** add same line braces rule ([b4f9347](https://www.github.com/aeternity/dex-ui/commit/b4f93479ea6fb11ae50bfbd83166c240a7850a7e))
- **lint:** adding space infix-operator rule ([21f502b](https://www.github.com/aeternity/dex-ui/commit/21f502b9c8ec1ef384daae8b3e51e618455ce47f))
- modify providedLiquidity list and persist it ([6050c85](https://www.github.com/aeternity/dex-ui/commit/6050c85f56b90faded08dfbecd3c04c4497eff5e))
- **module/aeternity:** add create pair allowance ([cf93d09](https://www.github.com/aeternity/dex-ui/commit/cf93d09a9348e5c282bac777a631db354ee79f6c))
- **module/aeternity:** add ignore option for unknown events exception ([b8e3f0a](https://www.github.com/aeternity/dex-ui/commit/b8e3f0a837a37772a9fbbe2a639570668249478c))
- move token list into utils ([a3fee4b](https://www.github.com/aeternity/dex-ui/commit/a3fee4b64a5845d69e054ef691ca9300c1e393e2))
- **package:** add lint:style script ([14b25ee](https://www.github.com/aeternity/dex-ui/commit/14b25eee15bd7f9b0c5f9448d3c197b32333a7bb))
- provided liquidity modifications ([879f1ba](https://www.github.com/aeternity/dex-ui/commit/879f1ba72385bf0f8decc82dcde15ff5101b7f12))
- refactoring methods in LiquidityItem ([397b077](https://www.github.com/aeternity/dex-ui/commit/397b0777bca4cd0be946d0d895dd2b1f6f434c20))
- remove comments ([fc6ac0d](https://www.github.com/aeternity/dex-ui/commit/fc6ac0d2a305e6a19f6e71df3a9c5c64f0e842cf))
- remove eqeqeq linter rule ([e7a4c6c](https://www.github.com/aeternity/dex-ui/commit/e7a4c6c0daf1830b0b2b3ce20d2e46b6bf05003e))
- run stylelint src/\*_/_.{css,scss,vue} --fix ([52b57f8](https://www.github.com/aeternity/dex-ui/commit/52b57f8ad6a6bdf7c15a07fa85cde0a6f1ebd2ca))
- update SDK to 10.0.0 ([d4e93ec](https://www.github.com/aeternity/dex-ui/commit/d4e93ecbdf272cc564ace63fd21f20778add619c))

## 1.0.0 (2021-12-24)

### Features

- add ability to connect wallet with iframe ([0eff69f](https://www.github.com/aeternity/dex-ui/commit/0eff69f1f13dfc9b7b534b553c4ff6d28afe35be))
- add ActionsMenu component ([ffcc9e7](https://www.github.com/aeternity/dex-ui/commit/ffcc9e792ba9050c4ac1178257cf0b6390ec2f43))
- add AddLiquidity view ([057a457](https://www.github.com/aeternity/dex-ui/commit/057a457cc5b83564078c47a4192d151af4d25dd4))
- add aeternity module ([74bc087](https://www.github.com/aeternity/dex-ui/commit/74bc087da74a9d991dc5e69ffb5e4c4ce62b231b))
- add ConfirmAddModal ([1bd6513](https://www.github.com/aeternity/dex-ui/commit/1bd65138af17995bab2b81b5853718d1624a9988))
- add ConfirmSwapModal ([5640acd](https://www.github.com/aeternity/dex-ui/commit/5640acd4dd96418d6a2ae90549ca25ef9928bc67))
- add error modal component ([#65](https://www.github.com/aeternity/dex-ui/issues/65)) ([a10807d](https://www.github.com/aeternity/dex-ui/commit/a10807d4aa248098e208fa0a28f56670a1b16d94))
- add functional Header to the App ([9c265d3](https://www.github.com/aeternity/dex-ui/commit/9c265d3b68c3ab98d522b859f99f597fb53e9bf0))
- add ImportPool view ([0912552](https://www.github.com/aeternity/dex-ui/commit/0912552826ae51d90df011f055fb8f592433a31b))
- add InputToken component ([99ecb3a](https://www.github.com/aeternity/dex-ui/commit/99ecb3af9d63492a069854261f793ff16c2cd0e9))
- add liquidity flow ([699c50a](https://www.github.com/aeternity/dex-ui/commit/699c50a44427876858267102a112c3dfd2f529ab))
- add MainWrapper component ([7c6743c](https://www.github.com/aeternity/dex-ui/commit/7c6743c22ebb20e210833b4647b78a0fcd98253a))
- add NavigationMenu component ([e78b162](https://www.github.com/aeternity/dex-ui/commit/e78b1625316d8de4dc70c783222b77b7f35f9706))
- add on changes on extract scss commons ([fad92c2](https://www.github.com/aeternity/dex-ui/commit/fad92c2983caf6e6a2fc70db782bc023f693610e))
- add PoolView ([db9d46d](https://www.github.com/aeternity/dex-ui/commit/db9d46d2de8d48edbd9662f908cfeb56f7fec082))
- add SelectTokenModal component ([5ea5446](https://www.github.com/aeternity/dex-ui/commit/5ea544695e87085f8e05026d1a236e2d445e2414))
- add some margin to create_allowance ([ac62280](https://www.github.com/aeternity/dex-ui/commit/ac622802e27d1f9834f1dea5c181463843bd07ac))
- add SubmitTransactionModal ([1eb80d1](https://www.github.com/aeternity/dex-ui/commit/1eb80d1e51bdedd2c05e58486ce5da54f9d4b212))
- add SwapView ([1d2acb9](https://www.github.com/aeternity/dex-ui/commit/1d2acb98d73d569b3eac01416124a3d11c9e9a83))
- add TooltipModal component ([de468ce](https://www.github.com/aeternity/dex-ui/commit/de468cecab9968f8f310791cc8a92be4045e0125))
- adjust ActionMenu component ([827be7d](https://www.github.com/aeternity/dex-ui/commit/827be7df52458ba312d39246ab8aa33f8684dc45))
- adjustments based on review and minimize colors ([8f6b368](https://www.github.com/aeternity/dex-ui/commit/8f6b3689b71e2ad0405806d3870421be65407f29))
- **ae:** fetches tokens based on network ([a1c7190](https://www.github.com/aeternity/dex-ui/commit/a1c71907a6bb325d4797dd8f86cc1a10d1ab511e))
- **ae:** fixes token balance getter ([b3abfa4](https://www.github.com/aeternity/dex-ui/commit/b3abfa4e762aad5b92017c5269a89d5185cf26a2))
- **ae:** polls ae balance based on network ([11d85e5](https://www.github.com/aeternity/dex-ui/commit/11d85e542a23809bb7807f3c66649144b50e3461))
- **ae:** stores network in state ([8988672](https://www.github.com/aeternity/dex-ui/commit/89886727e5f4a7b7132de789d31816c390295230))
- **App:** set font-family for each element ([09830aa](https://www.github.com/aeternity/dex-ui/commit/09830aa4ff04812c5478552cfc85a0399fbe0013))
- contract bindings ([#43](https://www.github.com/aeternity/dex-ui/issues/43)) ([e1e8c05](https://www.github.com/aeternity/dex-ui/commit/e1e8c05188e591801ce6fd8e5c1ed136560f2839))
- contract errors - identifier/description mapping ([d74ab5f](https://www.github.com/aeternity/dex-ui/commit/d74ab5fcdd28bf48c9a34fca2e91957b57ffb5f8))
- create a general Header component ([ad86db4](https://www.github.com/aeternity/dex-ui/commit/ad86db49406fa408433b5c36add291adde63958c))
- enforces testnet and shows error message ([17e3ca9](https://www.github.com/aeternity/dex-ui/commit/17e3ca9d39e244f0f508e5c79afab41167ead4a2))
- extract ButtonPlain and ButtonDefault components ([e813329](https://www.github.com/aeternity/dex-ui/commit/e8133298e8f0954bf1e9247fe30a8d7cdec858b8))
- extract ButtonTooltip component ([b4507e8](https://www.github.com/aeternity/dex-ui/commit/b4507e8ad42166ac606a4492c9cc22ff235ed56e))
- Extract common colors, font-patterns etc. in the variables.scss, typography.scss ([d81330b](https://www.github.com/aeternity/dex-ui/commit/d81330b41ae5aec8594a02b18f2f3ef4dfc71f27))
- finishing add liquidity flow ([c479347](https://www.github.com/aeternity/dex-ui/commit/c4793477f349dc709747dba6f18063337533800d))
- getter endpoints ([#75](https://www.github.com/aeternity/dex-ui/issues/75)) ([e355233](https://www.github.com/aeternity/dex-ui/commit/e355233703ef55611d37adfbc35d81e2c752788b))
- **import-pool:** add ability to set selected token ([b37cbc5](https://www.github.com/aeternity/dex-ui/commit/b37cbc59f73beab596d082fe28ffa89b6ae9cf1f))
- initializes wallet scan automatically on rehydration ([20b999d](https://www.github.com/aeternity/dex-ui/commit/20b999dc1116c03fce6f38032988a8d7af91ffbb))
- **main-wrapper:** add working back button ([d7fa289](https://www.github.com/aeternity/dex-ui/commit/d7fa289ad8480646fbe818e43526e0dd7682a8a3))
- modification to complete all swap combinations ([5cc2a2b](https://www.github.com/aeternity/dex-ui/commit/5cc2a2bf2fa52d571f8e6dbb1a3c3c5d3550b5e5))
- **navigation-menu:** make router-links active on nested routes ([964a974](https://www.github.com/aeternity/dex-ui/commit/964a974fed5746561a6ea401fd591b5125ed0339))
- remove liquidity component ([d02bfb2](https://www.github.com/aeternity/dex-ui/commit/d02bfb2604a64038c9832a3b734ca98d11a3aefc))
- **store:** persists balance, network and address ([a7be1fd](https://www.github.com/aeternity/dex-ui/commit/a7be1fd6249d3d075eb23d3d14d9fc17d0bdd0ba))
- **typography:** import font-weight 400, 600 ([419b56a](https://www.github.com/aeternity/dex-ui/commit/419b56af7e84246c83d4194e672d14b599404125))

### Bug Fixes

- adjusts typo leftover from refactoring ([701f37a](https://www.github.com/aeternity/dex-ui/commit/701f37a3005e4baa3c945cdfa6e6f7d0e69a0f63))
- **App:** remove duplicate styles ([5b57853](https://www.github.com/aeternity/dex-ui/commit/5b57853d0cec6d38b62ee03e6df38cdf41e039c7))
- **balance:** defaults to 0 when no balance is available ([61e3649](https://www.github.com/aeternity/dex-ui/commit/61e364944764e7b19f5ffb40ea2a1a5cdfd50cb4))
- **balance:** handling 0 balance on network ([b557e0b](https://www.github.com/aeternity/dex-ui/commit/b557e0b7d6b8290782ac5933d79d8499e8dc2da8))
- **input-amount:** allow only numbers ([292cebb](https://www.github.com/aeternity/dex-ui/commit/292cebb2e4015168090152abe52d8cd9ec0f4ca0))
- liquidity token received modal info for first liquidity added into a dex-pair ([9354a2b](https://www.github.com/aeternity/dex-ui/commit/9354a2b7bf448bf0397d16449d91a8c8cd337eb0))
- **network:** initializes with correct network ([e9484c8](https://www.github.com/aeternity/dex-ui/commit/e9484c83a64a8452899a66800f056fd65bfe712e))
- propagate update event to InputToken's parent ([dbf1f33](https://www.github.com/aeternity/dex-ui/commit/dbf1f335e631e16c49b7dd3d320c3cb101224fcf))

### CI / CD

- adds release please ([18e7466](https://www.github.com/aeternity/dex-ui/commit/18e7466c6dc9a6ea0f779fa05e52826845c6f881))
- **docker:** add app input variable ([ca0ff1d](https://www.github.com/aeternity/dex-ui/commit/ca0ff1ddb2b154344c6d5c49309e74d6be6fe197))
- **docker:** change node version in Dockerfile ([8250412](https://www.github.com/aeternity/dex-ui/commit/825041265ba78996ba8310e5cb475aa61133ef43))
- **docker:** change prod checkout fetch depth ([6762eef](https://www.github.com/aeternity/dex-ui/commit/6762eef1ff483f0143d5e395ece8fda8ebc01772))
- **docker:** change prod checkout settings ([b394249](https://www.github.com/aeternity/dex-ui/commit/b394249902ca637507ab2d97dc991f0471d88988))
- **docker:** fix events in each workflow ([9e4cecb](https://www.github.com/aeternity/dex-ui/commit/9e4cecb422489574a25815b80448a45c1928d527))
- **docker:** gh actions workflows and templates ([9ff7d77](https://www.github.com/aeternity/dex-ui/commit/9ff7d7717ececbc28b63b25161026d7b019419fa))
- **docker:** move prod deploy to separate workflow ([e969cc8](https://www.github.com/aeternity/dex-ui/commit/e969cc80b77fcde34a85a8d95cee2db150d4b0cb))
- **docker:** remove argocd file input ([f831cb8](https://www.github.com/aeternity/dex-ui/commit/f831cb8f69575070a3c8c4fe3298fd3e60b4e4b4))
- **docker:** remove develop branch from staging deployments and make master - main ([de08ab1](https://www.github.com/aeternity/dex-ui/commit/de08ab111d0b4fcef25de7d73cd21454f86cec97))
- **docker:** remove stale yml for now ([0414843](https://www.github.com/aeternity/dex-ui/commit/04148437d7a3c521d7e8521c39ea92dff3374ee0))
- **docker:** switches node version to 14 ([1a0e093](https://www.github.com/aeternity/dex-ui/commit/1a0e093c159df8378dcb5f07b6495fad80d8fc2e))
- don't fix linter error ([037dd22](https://www.github.com/aeternity/dex-ui/commit/037dd223c7417ceaecb56664b64779a9dd328401))
- **github:** actions fixes ([#37](https://www.github.com/aeternity/dex-ui/issues/37)) ([735f67a](https://www.github.com/aeternity/dex-ui/commit/735f67a3e1db1e1e600acae3d4d8e63395cf815b))
- **github:** change branch to stg ([c1ef40a](https://www.github.com/aeternity/dex-ui/commit/c1ef40ab662fd2a9ad52d63ba99e2cf1bb7b1dc8))
- **github:** fixe pr sync events ([6b6dddb](https://www.github.com/aeternity/dex-ui/commit/6b6dddbbb24b89080434b3be76ffab4daab23e63))
- **github:** pr on synchronize ([3d0bfe0](https://www.github.com/aeternity/dex-ui/commit/3d0bfe069483987278c73455387ff81abcf82293))
- **github:** revert test pr on synchronize ([53b4398](https://www.github.com/aeternity/dex-ui/commit/53b4398e844f96e1bb3fb2d7ef2c5ed7226fa634))
- **github:** test pr on synchronize ([008193e](https://www.github.com/aeternity/dex-ui/commit/008193eaa267004dcd81ff1d47fc307b3140eed1))
- prod cache configs ([089ee25](https://www.github.com/aeternity/dex-ui/commit/089ee25b7c4ebd9aa96c36802d20a550e36268e2))
- remove new cache only on open and sync prs ([7a227d2](https://www.github.com/aeternity/dex-ui/commit/7a227d29989b771e0d9bbe709c0051cab1a4ff58))
- run linter on container build ([d8b0246](https://www.github.com/aeternity/dex-ui/commit/d8b02463fd050b97f357e96fa253fe91668bc53f))
- test docker cache config ([fd9ab9c](https://www.github.com/aeternity/dex-ui/commit/fd9ab9cfc610cce549c2b9987fc9db9fac5711e3))
- test docker cache config ([f80c952](https://www.github.com/aeternity/dex-ui/commit/f80c952260eceb8c9f65b1b094a06b46ed6d3d00))
- trigger cache build ([ae09e27](https://www.github.com/aeternity/dex-ui/commit/ae09e27b8d40877eadeaea09f0722373d7d6e038))
- update version to trigger cache build ([0e69c2f](https://www.github.com/aeternity/dex-ui/commit/0e69c2ffffba368a10f0ec65606ec754000c16c3))

### Miscellaneous

- **deps:** reference contract repo for sources ([45c713e](https://www.github.com/aeternity/dex-ui/commit/45c713e29db3599f85ff773dc14dba5ff22e78ab))
- **deps:** uses published version of token repo ([335a258](https://www.github.com/aeternity/dex-ui/commit/335a258e8bf8d79d928c11b6bcaea5d1ebdf71ba))
- disable remote token list ([5002c73](https://www.github.com/aeternity/dex-ui/commit/5002c736c93faf01077053d5c28aff81471fbc45))
- followup feedback from pr [#93](https://www.github.com/aeternity/dex-ui/issues/93) ([8e76fee](https://www.github.com/aeternity/dex-ui/commit/8e76fee60bcb386afe328c61c9c090bd26f9dddc))
- input range component ([b8fdd25](https://www.github.com/aeternity/dex-ui/commit/b8fdd2516b7619d63b27f28bd851ea2667a8ba67))
- realigns with changes from main ([2c140a4](https://www.github.com/aeternity/dex-ui/commit/2c140a491f083c45add4ddd5af420e6396572539))
- remove boilerplate code ([454e361](https://www.github.com/aeternity/dex-ui/commit/454e36163891df0be4c592c775997285e2ee3d31))
- remove referencing test ([3ad27b0](https://www.github.com/aeternity/dex-ui/commit/3ad27b0fa2fccc317f97f0076972ec6ddc5628b4))

### Refactorings

- **ErrorModal:** remove unused property ([bd4513f](https://www.github.com/aeternity/dex-ui/commit/bd4513f21af4dfc3c5d76efb3e369ffb7c34851a))
- **liquidity:** enables balance checks ([408259d](https://www.github.com/aeternity/dex-ui/commit/408259dc121779b2f417903cc49eb207c221a0c1))
- **liquidity:** rename from / to --> tokenA / tokenB ([73d692f](https://www.github.com/aeternity/dex-ui/commit/73d692fa7a6f4af54824625364d34ede801333ac))
