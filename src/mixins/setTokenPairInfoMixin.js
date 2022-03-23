import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import { handleUnknownError, calculateSelectedToken } from '../lib/utils';

export default {
  computed: {
    ...mapState({
      factory: (state) => state.aeternity.factory?.deployInfo.address,
    }),
  },
  watch: {
    async factory(newVal) {
      // we have wallet connection
      if (newVal && this.tokenB && this.tokenA) {
        await this.setPairInfo();
        if (this.amountTokenA || this.amountTokenB) {
          this.setAmount(
            this.isLastInputTokenA ? this.amountTokenA : this.amountTokenB, this.isLastInputTokenA,
          );
        }
      }
    },
  },
  methods: {
    async setSelectedToken(token, isTokenA) {
      let switched;
      [this.tokenA, this.tokenB, switched] = calculateSelectedToken(
        token, this.tokenA, this.tokenB, isTokenA,
      );
      if (switched) {
        const swap = this.amountTokenA;
        this.amountTokenA = this.amountTokenB;
        this.amountTokenB = swap;
        this.isLastInputTokenA = !this.isLastInputTokenA;
        const swapReserve = this.reserveTokenA;
        this.reserveTokenA = this.reserveTokenB;
        this.reserveTokenB = swapReserve;
      }
      if (!switched) {
        const tokenA = isTokenA ? this.tokenA : this.tokenB;
        if (tokenA && !tokenA.is_ae) {
          await this.fetchAllowanceIfNone(tokenA.contract_id, this.fetchAllowance);
        }
      }

      this.saveTokenSelection(this.tokenA, this.tokenB);

      if (!switched) {
        await this.setPairInfo();
      }
      this.setAmount(
        this.isLastInputTokenA ? this.amountTokenA : this.amountTokenB, this.isLastInputTokenA,
      );
    },
    async setPairInfo() {
      try {
        [
          this.totalSupply,
          this.reserveTokenA,
          this.reserveTokenB,
        ] = await this.$store.dispatch('aeternity/getPairInfo', {
          tokenA: this.tokenA,
          tokenB: this.tokenB,
        });
      } catch (e) {
        handleUnknownError(e);
      }
    },
    setAmount(amount, isLastInputTokenA) {
      this.isLastInputTokenA = isLastInputTokenA;
      if (isLastInputTokenA) {
        this.amountTokenA = amount;
        this.amountTokenB = this.ratio && amount ? BigNumber(amount).div(this.ratio).toString() : '';
      } else {
        this.amountTokenB = amount;
        this.amountTokenA = this.ratio && amount ? BigNumber(amount).times(this.ratio).toString() : '';
      }
      this.saveAmountSelection(amount, isLastInputTokenA);
    },
  },
};
