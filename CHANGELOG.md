# Changelog

## [1.2.0](https://www.github.com/aeternity/dex-ui/compare/v1.1.0...v1.2.0) (2022-03-07)


### Features

* add confirmation and loading modals ([29c3a04](https://www.github.com/aeternity/dex-ui/commit/29c3a043123870e4821ca48dae55db8e80664e40))
* added header menu items [#157](https://www.github.com/aeternity/dex-ui/issues/157) ([3921c32](https://www.github.com/aeternity/dex-ui/commit/3921c32e2772025cd08805dda48afa915c5e2889))
* added inline svg loader [#46](https://www.github.com/aeternity/dex-ui/issues/46) ([2575136](https://www.github.com/aeternity/dex-ui/commit/2575136cfd70415beb6480e5d61ea7b4c2d907b3))
* added sentry [#202](https://www.github.com/aeternity/dex-ui/issues/202) ([db053d3](https://www.github.com/aeternity/dex-ui/commit/db053d363a084b44ae373ea841dcb24e03ea75f3))
* adjust network support message [#214](https://www.github.com/aeternity/dex-ui/issues/214) ([950d785](https://www.github.com/aeternity/dex-ui/commit/950d785d5accfba42480884f999f073f3a660e13))
* change contract vresion with newer ones ([a2345c9](https://www.github.com/aeternity/dex-ui/commit/a2345c9233e542e09c81f7771c19b1d400323301))
* on fetching pair show loading indicators & disable action buttons [#148](https://www.github.com/aeternity/dex-ui/issues/148) ([d17a1ef](https://www.github.com/aeternity/dex-ui/commit/d17a1efb3dae41a0093e45c386546eb766e4e2ed))
* only allow numbers on amount fields [#218](https://www.github.com/aeternity/dex-ui/issues/218) ([bc0adcc](https://www.github.com/aeternity/dex-ui/commit/bc0adccb5422780425becd669313ec82fed25fdf))
* **remove-liquidity:** add error modal ([7a39e7b](https://www.github.com/aeternity/dex-ui/commit/7a39e7b831070294bee51cc79714e34ca60b7770))
* **swap:** disable approve button on process [#149](https://www.github.com/aeternity/dex-ui/issues/149) ([c58e5fd](https://www.github.com/aeternity/dex-ui/commit/c58e5fd011b8e18e109d43d1a6d827881c7fce06))
* **swap:** disable swap when amounts are invalid [#220](https://www.github.com/aeternity/dex-ui/issues/220) ([e087909](https://www.github.com/aeternity/dex-ui/commit/e087909e2945612214fbb83256efc05175dc5557))
* **swap:** view transaction link [#169](https://www.github.com/aeternity/dex-ui/issues/169) ([36e2307](https://www.github.com/aeternity/dex-ui/commit/36e2307585e39cc6cb95c7f03668cc6b0d43c518))
* update dark background color [#212](https://www.github.com/aeternity/dex-ui/issues/212) ([049d57e](https://www.github.com/aeternity/dex-ui/commit/049d57e36ca8f88ba2c68b8fdbe52295c3ab5c80))


### Bug Fixes

* **add-liquidity:** disable buttons on invalid amount ([45d8cfb](https://www.github.com/aeternity/dex-ui/commit/45d8cfb71853208d768ef28c83b23af8c791ee4d))
* **add-liquidity:** disable supply if not approved ([9d3b75a](https://www.github.com/aeternity/dex-ui/commit/9d3b75a2965917567da99851503a5bd4eea4b5bf))
* adding liquidity on new pairs ([2ec59b8](https://www.github.com/aeternity/dex-ui/commit/2ec59b856f8cfb70a8a959e8ed71b3e8cbcde72c))
* **aeternity:** call correct wae methods once ([5c65210](https://www.github.com/aeternity/dex-ui/commit/5c65210de77e0f63d1f067765e31b957ed08bef3))
* **aeternity:** call wae withdraw with a proper param ([64bc436](https://www.github.com/aeternity/dex-ui/commit/64bc4360b3f411475aee46d9079d875106ca2a15))
* call getPairInfo when factory is ready ([af10e7f](https://www.github.com/aeternity/dex-ui/commit/af10e7f1f61c863481add958680fc4db3d086b03))
* migrate svg icons import to inline component [#46](https://www.github.com/aeternity/dex-ui/issues/46) ([006a10c](https://www.github.com/aeternity/dex-ui/commit/006a10c2f492d291d27501f7b7b2fa88aacfa975))
* only allow number when input type is number [#218](https://www.github.com/aeternity/dex-ui/issues/218) ([d78555e](https://www.github.com/aeternity/dex-ui/commit/d78555e52905c2e4160eebdc4fa7befb19aea247))
* **remove-liquidity:** show only loaded pool info ([c3cbd35](https://www.github.com/aeternity/dex-ui/commit/c3cbd35757bd60ea647dafe98f192b922baa77f5))
* **unfinished-features:** load flag for unfinished features properly ([9018830](https://www.github.com/aeternity/dex-ui/commit/90188304194e56fd478d39f3976eb0a199d945bc))


### Miscellaneous

* **liquidity-details:** hide not working link [#156](https://www.github.com/aeternity/dex-ui/issues/156) ([23a8138](https://www.github.com/aeternity/dex-ui/commit/23a8138bd15fe2856e3209f39584352311734ab0))
* make SubmitTransactionModal more general ([7fde63f](https://www.github.com/aeternity/dex-ui/commit/7fde63f5a83da32221571972b12e8f6a982d32e3))


### Refactorings

* modify comments ([5043b14](https://www.github.com/aeternity/dex-ui/commit/5043b14c96cb9679a8e9e4aff1236a23dee7cdd7))
* move contracts initialization into one action ([450753f](https://www.github.com/aeternity/dex-ui/commit/450753f1c69a243fefbc278f7394688df6a1a1dd))

## [1.1.0](https://www.github.com/aeternity/dex-ui/compare/v1.0.0...v1.1.0) (2022-02-21)


### Features

* add ability to set deadline ([dad500c](https://www.github.com/aeternity/dex-ui/commit/dad500cf511cfe71cbfc939071223adb204a8b8d))
* add ability to set slippage ([918b68a](https://www.github.com/aeternity/dex-ui/commit/918b68acdb5d0a0f05894d888e94f44ec6d9fcbf))
* add flag UNFINISHED_FEATURES ([c1b9e02](https://www.github.com/aeternity/dex-ui/commit/c1b9e0215233178fcca73309794271ca3e7985d0))
* add proper states for remove liquidity ([39540ac](https://www.github.com/aeternity/dex-ui/commit/39540ac4791044e893c61e2ed13e60b8fcf8b2d0))
* add showError action for error handling ([de23558](https://www.github.com/aeternity/dex-ui/commit/de2355800b3e82744a01d02e6d4e16486e288272))
* **ae-vs-wae:** input tokens addition and other special cases in swap and liquidity ([f599e67](https://www.github.com/aeternity/dex-ui/commit/f599e6751ea871a708af650aecb674b606612424))
* **aeternity:** allow to sign transactions via deeplinks ([2e18b38](https://www.github.com/aeternity/dex-ui/commit/2e18b38b6c9238df7219302d736b3c21fa95aa23))
* **button-default:** add second-dark calss ([0c5f936](https://www.github.com/aeternity/dex-ui/commit/0c5f936de5c11c78f2880b2bceac4bac5b75a50b))
* implement import liquidity & some cleaning ([fde48a2](https://www.github.com/aeternity/dex-ui/commit/fde48a26c9e9fc7c97302e019b589d5c63baeef5))
* **import-pool:** replace old message with LiquidityDetails ([66a9b66](https://www.github.com/aeternity/dex-ui/commit/66a9b66a983f4680b933de0b01427468c18b0be8))
* login with deeplink ([351c473](https://www.github.com/aeternity/dex-ui/commit/351c473611bb60c20d2006c5bff3b7dc157ef252))
* make "connect wallet" a manual step ([efcad68](https://www.github.com/aeternity/dex-ui/commit/efcad6887a58b657e2f79abc1f74d050ef38077e))
* **pool:** added loading & error indicators for liquidity pool [#150](https://www.github.com/aeternity/dex-ui/issues/150) ([7344004](https://www.github.com/aeternity/dex-ui/commit/73440048fad0305286a684a2989082698c42f465))
* provided liquidity ([f155cd1](https://www.github.com/aeternity/dex-ui/commit/f155cd1071dfd283450d31585e0baa455e87745c))
* remove liquidity ([cf0a730](https://www.github.com/aeternity/dex-ui/commit/cf0a73068d7c1737a54a8442f37ba7a7a92dac6c))
* remove liquidity view route ([1d813fa](https://www.github.com/aeternity/dex-ui/commit/1d813fa43d36055579288d68a390655b33b1cb41))
* **remove-liquidity:** hide detailed view on production ([c416e9d](https://www.github.com/aeternity/dex-ui/commit/c416e9de8c6c3292475b8b23f884b097818167f7))
* **swap:** ae vs wae ([a1a6cc1](https://www.github.com/aeternity/dex-ui/commit/a1a6cc1d0ab80f0b7dd184cbfb8eba192b68701c))


### Bug Fixes

* **add-liquidity:** fix MIN_LIQUIDITY usage in addLiqudity entrypoint call ([ba70396](https://www.github.com/aeternity/dex-ui/commit/ba70396488092f35125cb4008c05247c82ff5463))
* create allowance not being called anymore ([68314bc](https://www.github.com/aeternity/dex-ui/commit/68314bc1ce4b71c50e6e0dbebc595eb3b55fefb4))
* disable button on zero amount ([14537fc](https://www.github.com/aeternity/dex-ui/commit/14537fcda54b74d13436dcaac86bcfa4124fea80))
* do not close active connection with iframe wallet ([279fd7c](https://www.github.com/aeternity/dex-ui/commit/279fd7c3586e8c4443fe3c862829f80ab6e06c0b))
* expandDecimals doesn't work for big numbers anymore ([9c695ba](https://www.github.com/aeternity/dex-ui/commit/9c695ba230dc9e6bad1f554b30178508b73450a4))
* **index:** actually persist network and slippage ([a178d44](https://www.github.com/aeternity/dex-ui/commit/a178d44a58ac8c4e583a8bcc9089079f4b1532b5))
* **input:** ae balance for input-token ([#107](https://www.github.com/aeternity/dex-ui/issues/107)) ([e5a25ad](https://www.github.com/aeternity/dex-ui/commit/e5a25add3d24553da558d686ab40b6a14ae547c5))
* **liquidity:** general ui feedback fixes ([0b65074](https://www.github.com/aeternity/dex-ui/commit/0b650743018c3c3deebf91c2d0c56c62b5ce949d))
* **pools-view:** remove unwanted back button [#143](https://www.github.com/aeternity/dex-ui/issues/143) ([e298f13](https://www.github.com/aeternity/dex-ui/commit/e298f1356e611c6df16d0ca5211dca7ac1dc4791))
* show proper prices information ([aca15ee](https://www.github.com/aeternity/dex-ui/commit/aca15ee9610d76d8c9be67db7b8321fa648ae920))
* SubmitTransactionModal infinite loading on error ([0116d41](https://www.github.com/aeternity/dex-ui/commit/0116d41ede86c1f99c6d5e61418938b4caee5048))
* swap tokens rate shown as null when wallet is not connected ([5ffa95a](https://www.github.com/aeternity/dex-ui/commit/5ffa95a831bf8132c6fcff20bb8c93990689d9e6))
* **swap-view:** disable swap button on not enought balance ([e14ea1e](https://www.github.com/aeternity/dex-ui/commit/e14ea1eceded189cfcb44a4e8545f1fd26e26990))
* **swap-view:** show propper message if no token selected ([17a43c7](https://www.github.com/aeternity/dex-ui/commit/17a43c7282ca0c18ddc113cb6a0edec5e04e1319))
* **swap:** bind confirmation modal info values ([c5b27eb](https://www.github.com/aeternity/dex-ui/commit/c5b27eb83957838b24bf8c00fa7ab8288be2c52f))
* **ui:** text typo & style [#140](https://www.github.com/aeternity/dex-ui/issues/140) ([7d1eb52](https://www.github.com/aeternity/dex-ui/commit/7d1eb52d09bbec06b193f5cf5b98cf0b9af26ef8))
* wallet auto reconnect ([fe76d57](https://www.github.com/aeternity/dex-ui/commit/fe76d576694945ebb5be95b59e73a12865f3d74d))


### CI / CD

* **github:** fix app name in prod pipeline ([#110](https://www.github.com/aeternity/dex-ui/issues/110)) ([10e4d01](https://www.github.com/aeternity/dex-ui/commit/10e4d01db3c138a483530f4097dfb88e078523ae))
* **github:** fix staging undeploy events/trigger ([0593af8](https://www.github.com/aeternity/dex-ui/commit/0593af8a45fca9003760a222e8ae79ed4816ee02))
* **github:** make gh action to use new version of composite actions and pr sync ([4dd5056](https://www.github.com/aeternity/dex-ui/commit/4dd50561fa5b954ced7f568c8db8d500856cb433))


### Refactorings

* **add-liquidity:** remove useless try catch ([2ff850d](https://www.github.com/aeternity/dex-ui/commit/2ff850d6a86038288284b235e35c80c6a6ea1f4d))
* **confirm-swap-modal:** simplify mapState usage ([9dce772](https://www.github.com/aeternity/dex-ui/commit/9dce7726f72171b87793901274bd64f4116a4108))
* consistent usage of data variables ([5156ad3](https://www.github.com/aeternity/dex-ui/commit/5156ad31f75d54c6271ac797ca455ce4ff32cfd9))
* eliminate type-unsafe equality operators ([67aee65](https://www.github.com/aeternity/dex-ui/commit/67aee6564583bca01c09cc7044df51302cb12b62))
* extract constants in additional file ([f382025](https://www.github.com/aeternity/dex-ui/commit/f3820259a949a074a2c091546ec8977a2636216b))
* extract getAePair ([f36908c](https://www.github.com/aeternity/dex-ui/commit/f36908c8b522b1a4439850ba895c423880878ea4))
* extract getPairInfo ([93f4d01](https://www.github.com/aeternity/dex-ui/commit/93f4d0133dd526ba3d205ddf79717029b28a181d))
* **liquidity-item:** move liquidity details into a separate component ([5e8e07f](https://www.github.com/aeternity/dex-ui/commit/5e8e07f1d245c3a98a0a4ab5dd3c61001fe67760))
* **liquidity-item:** remove unnecessary method ([3946717](https://www.github.com/aeternity/dex-ui/commit/394671712dc3529e288822bad2df78b49036e41b))
* minimum/maximum received/spend and output/input label ([95eea8e](https://www.github.com/aeternity/dex-ui/commit/95eea8e03a26164229f77fe9f0092c237fb313e9))
* remove unnecessarily extra condition for getAePair ([a8b0791](https://www.github.com/aeternity/dex-ui/commit/a8b07914020e5c2b3193dd6888e977108ef43817))
* **remove-liquidity:** improve css style ([e093076](https://www.github.com/aeternity/dex-ui/commit/e093076439ddc753714c058a3735b764f4b43d81))
* removing empty contract interface ([40e71dc](https://www.github.com/aeternity/dex-ui/commit/40e71dce744654e46973ce410610a49407297b3c))
* simplify expandDecimals and reduceDecimals ([db69ace](https://www.github.com/aeternity/dex-ui/commit/db69ace4d2f6a6f521505610395b137144403011))
* **swap-view:** extract callSwapAction ([ab73798](https://www.github.com/aeternity/dex-ui/commit/ab73798a2194a2dd8417ec3a42d75359518833c0))
* **swap-view:** fix code style issues ([b9612d3](https://www.github.com/aeternity/dex-ui/commit/b9612d37e6357a7b122c0a22f43aecb0a741285d))
* use undestandable abbreviation for an error ([aa463c2](https://www.github.com/aeternity/dex-ui/commit/aa463c221e712df7cbfc8b63241b76753ab790d6))


### Miscellaneous

* add hasEnoughAllowance action ([98cdb91](https://www.github.com/aeternity/dex-ui/commit/98cdb916d5feaa4659a3535b5a7a20d1226be351))
* add stylelint config ([18fa4bb](https://www.github.com/aeternity/dex-ui/commit/18fa4bb86f9091fbc7b1c706309f1c342f02e38c))
* add stylelint into dev dependencies ([be5076b](https://www.github.com/aeternity/dex-ui/commit/be5076bcc19e380ee8a52556fe07287ed1f55e1a))
* check if mobile as global property ([2d6142e](https://www.github.com/aeternity/dex-ui/commit/2d6142ed4c748fdfc2b8ef146def20a95c300cf6))
* create deeplink function ([84a9a50](https://www.github.com/aeternity/dex-ui/commit/84a9a50736b822f9dbdc624825560e5608f07c25))
* **lint:** add same line braces rule ([b4f9347](https://www.github.com/aeternity/dex-ui/commit/b4f93479ea6fb11ae50bfbd83166c240a7850a7e))
* **lint:** adding space infix-operator rule ([21f502b](https://www.github.com/aeternity/dex-ui/commit/21f502b9c8ec1ef384daae8b3e51e618455ce47f))
* modify providedLiquidity list and persist it ([6050c85](https://www.github.com/aeternity/dex-ui/commit/6050c85f56b90faded08dfbecd3c04c4497eff5e))
* **module/aeternity:** add create pair allowance ([cf93d09](https://www.github.com/aeternity/dex-ui/commit/cf93d09a9348e5c282bac777a631db354ee79f6c))
* **module/aeternity:** add ignore option for unknown events exception ([b8e3f0a](https://www.github.com/aeternity/dex-ui/commit/b8e3f0a837a37772a9fbbe2a639570668249478c))
* move token list into utils ([a3fee4b](https://www.github.com/aeternity/dex-ui/commit/a3fee4b64a5845d69e054ef691ca9300c1e393e2))
* **package:** add lint:style script ([14b25ee](https://www.github.com/aeternity/dex-ui/commit/14b25eee15bd7f9b0c5f9448d3c197b32333a7bb))
* provided liquidity modifications ([879f1ba](https://www.github.com/aeternity/dex-ui/commit/879f1ba72385bf0f8decc82dcde15ff5101b7f12))
* refactoring methods in LiquidityItem ([397b077](https://www.github.com/aeternity/dex-ui/commit/397b0777bca4cd0be946d0d895dd2b1f6f434c20))
* remove comments ([fc6ac0d](https://www.github.com/aeternity/dex-ui/commit/fc6ac0d2a305e6a19f6e71df3a9c5c64f0e842cf))
* remove eqeqeq linter rule ([e7a4c6c](https://www.github.com/aeternity/dex-ui/commit/e7a4c6c0daf1830b0b2b3ce20d2e46b6bf05003e))
* run stylelint src/**/*.{css,scss,vue} --fix ([52b57f8](https://www.github.com/aeternity/dex-ui/commit/52b57f8ad6a6bdf7c15a07fa85cde0a6f1ebd2ca))
* update SDK to 10.0.0 ([d4e93ec](https://www.github.com/aeternity/dex-ui/commit/d4e93ecbdf272cc564ace63fd21f20778add619c))

## 1.0.0 (2021-12-24)


### Features

* add ability to connect wallet with iframe ([0eff69f](https://www.github.com/aeternity/dex-ui/commit/0eff69f1f13dfc9b7b534b553c4ff6d28afe35be))
* add ActionsMenu component ([ffcc9e7](https://www.github.com/aeternity/dex-ui/commit/ffcc9e792ba9050c4ac1178257cf0b6390ec2f43))
* add AddLiquidity view ([057a457](https://www.github.com/aeternity/dex-ui/commit/057a457cc5b83564078c47a4192d151af4d25dd4))
* add aeternity module ([74bc087](https://www.github.com/aeternity/dex-ui/commit/74bc087da74a9d991dc5e69ffb5e4c4ce62b231b))
* add ConfirmAddModal ([1bd6513](https://www.github.com/aeternity/dex-ui/commit/1bd65138af17995bab2b81b5853718d1624a9988))
* add ConfirmSwapModal ([5640acd](https://www.github.com/aeternity/dex-ui/commit/5640acd4dd96418d6a2ae90549ca25ef9928bc67))
* add error modal component ([#65](https://www.github.com/aeternity/dex-ui/issues/65)) ([a10807d](https://www.github.com/aeternity/dex-ui/commit/a10807d4aa248098e208fa0a28f56670a1b16d94))
* add functional Header to the App ([9c265d3](https://www.github.com/aeternity/dex-ui/commit/9c265d3b68c3ab98d522b859f99f597fb53e9bf0))
* add ImportPool view ([0912552](https://www.github.com/aeternity/dex-ui/commit/0912552826ae51d90df011f055fb8f592433a31b))
* add InputToken component ([99ecb3a](https://www.github.com/aeternity/dex-ui/commit/99ecb3af9d63492a069854261f793ff16c2cd0e9))
* add liquidity flow ([699c50a](https://www.github.com/aeternity/dex-ui/commit/699c50a44427876858267102a112c3dfd2f529ab))
* add MainWrapper component ([7c6743c](https://www.github.com/aeternity/dex-ui/commit/7c6743c22ebb20e210833b4647b78a0fcd98253a))
* add NavigationMenu component ([e78b162](https://www.github.com/aeternity/dex-ui/commit/e78b1625316d8de4dc70c783222b77b7f35f9706))
* add on changes on extract scss commons ([fad92c2](https://www.github.com/aeternity/dex-ui/commit/fad92c2983caf6e6a2fc70db782bc023f693610e))
* add PoolView ([db9d46d](https://www.github.com/aeternity/dex-ui/commit/db9d46d2de8d48edbd9662f908cfeb56f7fec082))
* add SelectTokenModal component ([5ea5446](https://www.github.com/aeternity/dex-ui/commit/5ea544695e87085f8e05026d1a236e2d445e2414))
* add some margin to create_allowance ([ac62280](https://www.github.com/aeternity/dex-ui/commit/ac622802e27d1f9834f1dea5c181463843bd07ac))
* add SubmitTransactionModal ([1eb80d1](https://www.github.com/aeternity/dex-ui/commit/1eb80d1e51bdedd2c05e58486ce5da54f9d4b212))
* add SwapView ([1d2acb9](https://www.github.com/aeternity/dex-ui/commit/1d2acb98d73d569b3eac01416124a3d11c9e9a83))
* add TooltipModal component ([de468ce](https://www.github.com/aeternity/dex-ui/commit/de468cecab9968f8f310791cc8a92be4045e0125))
* adjust ActionMenu component ([827be7d](https://www.github.com/aeternity/dex-ui/commit/827be7df52458ba312d39246ab8aa33f8684dc45))
* adjustments based on review and minimize colors ([8f6b368](https://www.github.com/aeternity/dex-ui/commit/8f6b3689b71e2ad0405806d3870421be65407f29))
* **ae:** fetches tokens based on network ([a1c7190](https://www.github.com/aeternity/dex-ui/commit/a1c71907a6bb325d4797dd8f86cc1a10d1ab511e))
* **ae:** fixes token balance getter ([b3abfa4](https://www.github.com/aeternity/dex-ui/commit/b3abfa4e762aad5b92017c5269a89d5185cf26a2))
* **ae:** polls ae balance based on network ([11d85e5](https://www.github.com/aeternity/dex-ui/commit/11d85e542a23809bb7807f3c66649144b50e3461))
* **ae:** stores network in state ([8988672](https://www.github.com/aeternity/dex-ui/commit/89886727e5f4a7b7132de789d31816c390295230))
* **App:** set font-family for each element ([09830aa](https://www.github.com/aeternity/dex-ui/commit/09830aa4ff04812c5478552cfc85a0399fbe0013))
* contract bindings ([#43](https://www.github.com/aeternity/dex-ui/issues/43)) ([e1e8c05](https://www.github.com/aeternity/dex-ui/commit/e1e8c05188e591801ce6fd8e5c1ed136560f2839))
* contract errors - identifier/description mapping ([d74ab5f](https://www.github.com/aeternity/dex-ui/commit/d74ab5fcdd28bf48c9a34fca2e91957b57ffb5f8))
* create a general Header component ([ad86db4](https://www.github.com/aeternity/dex-ui/commit/ad86db49406fa408433b5c36add291adde63958c))
* enforces testnet and shows error message ([17e3ca9](https://www.github.com/aeternity/dex-ui/commit/17e3ca9d39e244f0f508e5c79afab41167ead4a2))
* extract ButtonPlain and ButtonDefault components ([e813329](https://www.github.com/aeternity/dex-ui/commit/e8133298e8f0954bf1e9247fe30a8d7cdec858b8))
* extract ButtonTooltip component ([b4507e8](https://www.github.com/aeternity/dex-ui/commit/b4507e8ad42166ac606a4492c9cc22ff235ed56e))
* Extract common colors, font-patterns etc. in the variables.scss, typography.scss ([d81330b](https://www.github.com/aeternity/dex-ui/commit/d81330b41ae5aec8594a02b18f2f3ef4dfc71f27))
* finishing add liquidity flow ([c479347](https://www.github.com/aeternity/dex-ui/commit/c4793477f349dc709747dba6f18063337533800d))
* getter endpoints ([#75](https://www.github.com/aeternity/dex-ui/issues/75)) ([e355233](https://www.github.com/aeternity/dex-ui/commit/e355233703ef55611d37adfbc35d81e2c752788b))
* **import-pool:** add ability to set selected token ([b37cbc5](https://www.github.com/aeternity/dex-ui/commit/b37cbc59f73beab596d082fe28ffa89b6ae9cf1f))
* initializes wallet scan automatically on rehydration ([20b999d](https://www.github.com/aeternity/dex-ui/commit/20b999dc1116c03fce6f38032988a8d7af91ffbb))
* **main-wrapper:** add working back button ([d7fa289](https://www.github.com/aeternity/dex-ui/commit/d7fa289ad8480646fbe818e43526e0dd7682a8a3))
* modification to complete all swap combinations ([5cc2a2b](https://www.github.com/aeternity/dex-ui/commit/5cc2a2bf2fa52d571f8e6dbb1a3c3c5d3550b5e5))
* **navigation-menu:** make router-links active on nested routes ([964a974](https://www.github.com/aeternity/dex-ui/commit/964a974fed5746561a6ea401fd591b5125ed0339))
* remove liquidity component ([d02bfb2](https://www.github.com/aeternity/dex-ui/commit/d02bfb2604a64038c9832a3b734ca98d11a3aefc))
* **store:** persists balance, network and address ([a7be1fd](https://www.github.com/aeternity/dex-ui/commit/a7be1fd6249d3d075eb23d3d14d9fc17d0bdd0ba))
* **typography:** import font-weight 400, 600 ([419b56a](https://www.github.com/aeternity/dex-ui/commit/419b56af7e84246c83d4194e672d14b599404125))


### Bug Fixes

* adjusts typo leftover from refactoring ([701f37a](https://www.github.com/aeternity/dex-ui/commit/701f37a3005e4baa3c945cdfa6e6f7d0e69a0f63))
* **App:** remove duplicate styles ([5b57853](https://www.github.com/aeternity/dex-ui/commit/5b57853d0cec6d38b62ee03e6df38cdf41e039c7))
* **balance:** defaults to 0 when no balance is available ([61e3649](https://www.github.com/aeternity/dex-ui/commit/61e364944764e7b19f5ffb40ea2a1a5cdfd50cb4))
* **balance:** handling 0 balance on network ([b557e0b](https://www.github.com/aeternity/dex-ui/commit/b557e0b7d6b8290782ac5933d79d8499e8dc2da8))
* **input-amount:** allow only numbers ([292cebb](https://www.github.com/aeternity/dex-ui/commit/292cebb2e4015168090152abe52d8cd9ec0f4ca0))
* liquidity token received modal info for first liquidity added into a dex-pair ([9354a2b](https://www.github.com/aeternity/dex-ui/commit/9354a2b7bf448bf0397d16449d91a8c8cd337eb0))
* **network:** initializes with correct network ([e9484c8](https://www.github.com/aeternity/dex-ui/commit/e9484c83a64a8452899a66800f056fd65bfe712e))
* propagate update event to InputToken's parent ([dbf1f33](https://www.github.com/aeternity/dex-ui/commit/dbf1f335e631e16c49b7dd3d320c3cb101224fcf))


### CI / CD

* adds release please ([18e7466](https://www.github.com/aeternity/dex-ui/commit/18e7466c6dc9a6ea0f779fa05e52826845c6f881))
* **docker:** add app input variable ([ca0ff1d](https://www.github.com/aeternity/dex-ui/commit/ca0ff1ddb2b154344c6d5c49309e74d6be6fe197))
* **docker:** change node version in Dockerfile ([8250412](https://www.github.com/aeternity/dex-ui/commit/825041265ba78996ba8310e5cb475aa61133ef43))
* **docker:** change prod checkout fetch depth ([6762eef](https://www.github.com/aeternity/dex-ui/commit/6762eef1ff483f0143d5e395ece8fda8ebc01772))
* **docker:** change prod checkout settings ([b394249](https://www.github.com/aeternity/dex-ui/commit/b394249902ca637507ab2d97dc991f0471d88988))
* **docker:** fix events in each workflow ([9e4cecb](https://www.github.com/aeternity/dex-ui/commit/9e4cecb422489574a25815b80448a45c1928d527))
* **docker:** gh actions workflows and templates ([9ff7d77](https://www.github.com/aeternity/dex-ui/commit/9ff7d7717ececbc28b63b25161026d7b019419fa))
* **docker:** move prod deploy to separate workflow ([e969cc8](https://www.github.com/aeternity/dex-ui/commit/e969cc80b77fcde34a85a8d95cee2db150d4b0cb))
* **docker:** remove argocd file input ([f831cb8](https://www.github.com/aeternity/dex-ui/commit/f831cb8f69575070a3c8c4fe3298fd3e60b4e4b4))
* **docker:** remove develop branch from staging deployments and make master - main ([de08ab1](https://www.github.com/aeternity/dex-ui/commit/de08ab111d0b4fcef25de7d73cd21454f86cec97))
* **docker:** remove stale yml for now ([0414843](https://www.github.com/aeternity/dex-ui/commit/04148437d7a3c521d7e8521c39ea92dff3374ee0))
* **docker:** switches node version to 14 ([1a0e093](https://www.github.com/aeternity/dex-ui/commit/1a0e093c159df8378dcb5f07b6495fad80d8fc2e))
* don't fix linter error ([037dd22](https://www.github.com/aeternity/dex-ui/commit/037dd223c7417ceaecb56664b64779a9dd328401))
* **github:** actions fixes ([#37](https://www.github.com/aeternity/dex-ui/issues/37)) ([735f67a](https://www.github.com/aeternity/dex-ui/commit/735f67a3e1db1e1e600acae3d4d8e63395cf815b))
* **github:** change branch to stg ([c1ef40a](https://www.github.com/aeternity/dex-ui/commit/c1ef40ab662fd2a9ad52d63ba99e2cf1bb7b1dc8))
* **github:** fixe pr sync events ([6b6dddb](https://www.github.com/aeternity/dex-ui/commit/6b6dddbbb24b89080434b3be76ffab4daab23e63))
* **github:** pr on synchronize ([3d0bfe0](https://www.github.com/aeternity/dex-ui/commit/3d0bfe069483987278c73455387ff81abcf82293))
* **github:** revert test pr on synchronize ([53b4398](https://www.github.com/aeternity/dex-ui/commit/53b4398e844f96e1bb3fb2d7ef2c5ed7226fa634))
* **github:** test pr on synchronize ([008193e](https://www.github.com/aeternity/dex-ui/commit/008193eaa267004dcd81ff1d47fc307b3140eed1))
* prod cache configs ([089ee25](https://www.github.com/aeternity/dex-ui/commit/089ee25b7c4ebd9aa96c36802d20a550e36268e2))
* remove new cache only on open and sync prs ([7a227d2](https://www.github.com/aeternity/dex-ui/commit/7a227d29989b771e0d9bbe709c0051cab1a4ff58))
* run linter on container build ([d8b0246](https://www.github.com/aeternity/dex-ui/commit/d8b02463fd050b97f357e96fa253fe91668bc53f))
* test docker cache config ([fd9ab9c](https://www.github.com/aeternity/dex-ui/commit/fd9ab9cfc610cce549c2b9987fc9db9fac5711e3))
* test docker cache config ([f80c952](https://www.github.com/aeternity/dex-ui/commit/f80c952260eceb8c9f65b1b094a06b46ed6d3d00))
* trigger cache build ([ae09e27](https://www.github.com/aeternity/dex-ui/commit/ae09e27b8d40877eadeaea09f0722373d7d6e038))
* update version to trigger cache build ([0e69c2f](https://www.github.com/aeternity/dex-ui/commit/0e69c2ffffba368a10f0ec65606ec754000c16c3))


### Miscellaneous

* **deps:** reference contract repo for sources ([45c713e](https://www.github.com/aeternity/dex-ui/commit/45c713e29db3599f85ff773dc14dba5ff22e78ab))
* **deps:** uses published version of token repo ([335a258](https://www.github.com/aeternity/dex-ui/commit/335a258e8bf8d79d928c11b6bcaea5d1ebdf71ba))
* disable remote token list ([5002c73](https://www.github.com/aeternity/dex-ui/commit/5002c736c93faf01077053d5c28aff81471fbc45))
* followup feedback from pr [#93](https://www.github.com/aeternity/dex-ui/issues/93) ([8e76fee](https://www.github.com/aeternity/dex-ui/commit/8e76fee60bcb386afe328c61c9c090bd26f9dddc))
* input range component ([b8fdd25](https://www.github.com/aeternity/dex-ui/commit/b8fdd2516b7619d63b27f28bd851ea2667a8ba67))
* realigns with changes from main ([2c140a4](https://www.github.com/aeternity/dex-ui/commit/2c140a491f083c45add4ddd5af420e6396572539))
* remove boilerplate code ([454e361](https://www.github.com/aeternity/dex-ui/commit/454e36163891df0be4c592c775997285e2ee3d31))
* remove referencing test ([3ad27b0](https://www.github.com/aeternity/dex-ui/commit/3ad27b0fa2fccc317f97f0076972ec6ddc5628b4))


### Refactorings

* **ErrorModal:** remove unused property ([bd4513f](https://www.github.com/aeternity/dex-ui/commit/bd4513f21af4dfc3c5d76efb3e369ffb7c34851a))
* **liquidity:** enables balance checks ([408259d](https://www.github.com/aeternity/dex-ui/commit/408259dc121779b2f417903cc49eb207c221a0c1))
* **liquidity:** rename from / to --> tokenA / tokenB ([73d692f](https://www.github.com/aeternity/dex-ui/commit/73d692fa7a6f4af54824625364d34ede801333ac))
