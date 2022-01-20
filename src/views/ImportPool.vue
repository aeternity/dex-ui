<template>
  <div class="import-pool">
    <MainWrapper
      title="Import V2 Pool"
      back-button
    >
      <Tip tip="Use this tool to find v2 pools that don't automatically appear in the interface." />
      <ButtonToken
        fill="transparent"
        :token="tokenA"
        :include-wae="false"
        arrow
        @update:token="setSelectedToken($event, true)"
      />
      <img src="../assets/plus.svg">
      <ButtonToken
        fill="transparent"
        :token="tokenB"
        :include-wae="false"
        arrow
        @update:token="setSelectedToken($event, false)"
      />
      <div class="connect">
        {{ footerText }}
      </div>
    </MainWrapper>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import MainWrapper from '@/components/MainWrapper.vue';
import ButtonToken from '@/components/ButtonToken.vue';
import Tip from '@/components/Tip.vue';
import { calculateSelectedToken, handleUnknownError } from '../lib/utils';

export default {
  components: {
    MainWrapper,
    ButtonToken,
    Tip,
  },
  data: () => ({
    tokenA: null,
    tokenB: null,
    imported: false,
    importing: false,
  }),
  computed: {
    ...mapState(['address']),
    footerText() {
      if (this.importing) return 'Fetching data...';
      if (!this.address) return 'Connect to a wallet to find pools';
      if (!this.tokenA || !this.tokenB) return 'Select both tokens to find your provided liquidity.';
      if (this.imported) return 'The liquidity is imported, you can go back to see your provided liquidity in the main pool screen';
      return 'You have no provided liquidity for the selected tokens';
    },
  },
  methods: {
    async setSelectedToken(token, isFrom) {
      [this.tokenA, this.tokenB] = calculateSelectedToken(token, this.tokenA, this.tokenB, isFrom);
      if (this.tokenA && this.tokenB) {
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
            return;
          }
        } catch (e) {
          if (e.message !== 'PAIR NOT FOUND') {
            handleUnknownError(e);
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

  .connect {
    color: white;
    width: 100%;
    padding: 45px 16px;
    border-radius: 16px;
    border: 1px solid variables.$color-black;
    background-color: variables.$color-black2;
  }
}
</style>
