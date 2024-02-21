<template>
  <div class="import-pool">
    <MainWrapper :title="$t('importPool.title')" back-button>
      <Head>
        <title>Import Pool - Superhero DEX</title>
      </Head>
      <Tip :tip="$t('importPool.importTip')" />
      <ButtonToken
        fill="transparent"
        :token="tokenA"
        exclude-wae
        :chosen-tokens="[tokenA, tokenB]"
        arrow
        @update:token="setSelectedToken($event, true)"
      />
      <PlusIcon />
      <ButtonToken
        fill="transparent"
        :token="tokenB"
        exclude-wae
        :chosen-tokens="[tokenB, tokenA]"
        arrow
        @update:token="setSelectedToken($event, false)"
      />
      <div v-if="imported" class="pool-found">
        {{ $t('importPool.poolFound') }}
      </div>
      <div class="connect">
        <div v-if="imported">
          <LiquidityDetails
            :pool-id="poolId"
            :pool-info="providedLiquidity[address][poolId]"
            :pool-info-importing="poolInfoImporting"
            :with-one-button="true"
          />
        </div>
        <div v-if="!imported" class="footer-text">
          {{ footerText }}
        </div>
      </div>
    </MainWrapper>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { Head } from '@vueuse/head';
import MainWrapper from '@/components/MainWrapper.vue';
import ButtonToken from '@/components/ButtonToken.vue';
import Tip from '@/components/Tip.vue';
import PlusIcon from '@/assets/plus.svg';
import LiquidityDetails from '@/components/LiquidityDetails.vue';
import { getPairId, calculateSelectedToken } from '@/lib/utils';

export default {
  components: {
    MainWrapper,
    ButtonToken,
    Tip,
    LiquidityDetails,
    PlusIcon,
    Head,
  },
  data: () => ({
    tokenA: null,
    tokenB: null,
    imported: false,
    importing: false,
    poolInfoImporting: false,
  }),
  computed: {
    poolId() {
      if (!this.tokenA || !this.tokenB) {
        return null;
      }
      return getPairId(this.tokenA.contract_id, this.tokenB.contract_id);
    },
    ...mapState(['address']),
    ...mapState('aeternity', ['providedLiquidity']),
    footerText() {
      if (this.importing) return this.$t('importPool.fetchingData');
      if (!this.address) return this.$t('connectWalletFindPool');
      if (!this.tokenA || !this.tokenB) return this.$t('importPool.selectBothTokens');
      if (this.imported) return this.$t('importPool.imported');
      return this.$t('importPool.footerText');
    },
  },
  methods: {
    async setSelectedToken(token, isFrom) {
      [this.tokenA, this.tokenB] = calculateSelectedToken(token, this.tokenA, this.tokenB, isFrom);
      if (this.address && this.tokenA && this.tokenB) {
        // to refresh liquidity list
        try {
          this.importing = true;
          const balance = await this.$store.dispatch('aeternity/pullAccountLiquidity', {
            tokenA: this.tokenA.contract_id,
            tokenB: this.tokenB.contract_id,
            tokenASymbol: this.tokenA.symbol,
            tokenBSymbol: this.tokenB.symbol,
            tokenADecimals: this.tokenA.decimals,
            tokenBDecimals: this.tokenB.decimals,
          });
          if (balance) {
            this.imported = true;
            this.poolInfoImporting = true;
            await this.$store.dispatch('aeternity/getPairInfo', {
              tokenA: this.tokenA,
              tokenB: this.tokenB,
            });
            this.poolInfoImporting = false;
            return;
          }
        } catch (e) {
          if (e.message !== 'PAIR NOT FOUND') {
            await this.$store.dispatch('showUnknownError', e);
          }
        } finally {
          this.importing = false;
        }
      }
      this.imported = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.import-pool {
  .button-token {
    margin: 12px 0;
  }

  .pool-found {
    margin-bottom: 12px;
    color: variables.$color-white;
  }

  .connect {
    color: variables.$color-white;
    width: 100%;
    padding: 10px 15px;
    border-radius: 16px;
    border: 1px solid variables.$color-black;
    background-color: variables.$color-black2;

    p {
      margin: 0;
    }

    .footer-text {
      width: 100%;
      padding: 35px 0;
    }
  }
}
</style>
