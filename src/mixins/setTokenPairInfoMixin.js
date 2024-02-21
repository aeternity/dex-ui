import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import { handleUnknownError, calculateSelectedToken, getPairId } from '@/lib/utils';

export default {
  computed: {
    ...mapState({
      factory: (state) => state.aeternity.factory?.$options.address,
    }),
    ...mapState('backend', { backendFailed: 'failed', pairs: 'pairs' }),
    selectedBackendPair() {
      if (!this.pairs || !this.tokenA || !this.tokenB) {
        return null;
      }
      return this.pairs[getPairId(this.tokenA.contract_id, this.tokenB.contract_id)];
    },
  },
  watch: {
    async factory(newVal) {
      // we have wallet connection
      if (newVal && this.tokenB && this.tokenA) {
        await this.setPairInfo();
        if (this.amountTokenA || this.amountTokenB) {
          this.setAmount(
            this.isLastInputTokenA ? this.amountTokenA : this.amountTokenB,
            this.isLastInputTokenA,
          );
        }
      }
    },
    async backendFailed(newVal) {
      if (newVal) {
        clearTimeout(this.pairInfoTimeoutId);
        return;
      }
      // if dex-backend is up again
      if (this.tokenA && this.tokenB) {
        await this.setPairInfo();
      }
    },
  },
  data: () => ({
    pairInfoTimeoutId: null,
  }),
  unmounted() {
    clearTimeout(this.pairInfoTimeoutId);
  },
  methods: {
    async setSelectedToken(token, isTokenA) {
      let switched;
      [this.tokenA, this.tokenB, switched] = calculateSelectedToken(
        token,
        this.tokenA,
        this.tokenB,
        isTokenA,
      );
      if (!switched) {
        await this.setPairInfo();
      }
      if (switched) {
        const swap = this.amountTokenA;
        this.amountTokenA = this.amountTokenB;
        this.amountTokenB = swap;
        this.isLastInputTokenA = !this.isLastInputTokenA;
        const swapReserve = this.reserveTokenA;
        this.reserveTokenA = this.reserveTokenB;
        this.reserveTokenB = swapReserve;
      }
      this.setAmount(
        this.isLastInputTokenA ? this.amountTokenA : this.amountTokenB,
        this.isLastInputTokenA,
      );
      await this.$watchUntilTruly(() => this.$store.state.aeternity.router);
      if (!switched) {
        const tokenA = isTokenA ? this.tokenA : this.tokenB;
        if (tokenA && !tokenA.is_ae) {
          await this.fetchAllowanceIfNone(tokenA.contract_id, this.fetchAllowance);
        }
      }

      this.saveTokenSelection(this.tokenA, this.tokenB);
    },
    async setPairInfo() {
      clearTimeout(this.pairInfoTimeoutId);
      try {
        [this.totalSupply, this.reserveTokenA, this.reserveTokenB] = await this.$store.dispatch(
          'aeternity/getPairInfo',
          {
            tokenA: this.tokenA,
            tokenB: this.tokenB,
          },
        );
      } catch (e) {
        handleUnknownError(e);
      } finally {
        if (!this.backendFailed && this.selectedBackendPair) {
          this.pairInfoTimeoutId = setTimeout(
            this.setPairInfo,
            parseInt(import.meta.env.VITE_DEX_BACKEND_FETCH_INTERVAL || '2000', 10),
          );
        }
      }
    },
    setAmount(amount, isLastInputTokenA) {
      this.isLastInputTokenA = isLastInputTokenA;
      if (isLastInputTokenA) {
        this.amountTokenA = amount;
        if (this.ratio) {
          this.amountTokenB = amount ? BigNumber(amount).div(this.ratio).toString() : '';
        }
      } else {
        this.amountTokenB = amount;
        if (this.ratio) {
          this.amountTokenA = amount ? BigNumber(amount).times(this.ratio).toString() : '';
        }
      }
      this.saveAmountSelection(amount, isLastInputTokenA);
    },
  },
};
