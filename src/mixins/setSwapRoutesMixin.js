import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import {
  handleUnknownError, calculateSelectedToken, getPairId,
  expandDecimals, reduceDecimals,
} from '@/lib/utils';
import {
  ratioFromRoute, ratioWithDecimals, getPriceImpactForRoute,
  getReceivedTokensForRoute,
} from '@/lib/swapUtils';

// if there is a direct Pair for tokenA/tokenB or tokenB/tokenA,
// the Dex-Backend will put it at the beginning of the swap-routes list.
// the other paths will follow that first/unique one
const DEFAULT_SELECTED_ROUTE_IX = 0;
export default {
  data: () => ({
    pairInfoTimeoutId: null,
    selectedRouteIx: DEFAULT_SELECTED_ROUTE_IX,
  }),
  computed: {
    ...mapState({
      factory: (state) => state.aeternity.factory?.$options.address,
    }),
    ...mapState('aeternity', ['routes']),
    ...mapState('backend', { backendFailed: 'failed' }),
    swapRoutes() {
      if (!this.tokenA || !this.tokenB) {
        return null;
      }
      return this.routes[getPairId(this.tokenA.contract_id, this.tokenB.contract_id)];
    },
    selectedRoute() {
      if (!this.swapRoutes) {
        return null;
      }
      const routeIx = Math.min(this.selectedRouteIx, this.swapRoutes.length - 1);
      const swapRoute = this.swapRoutes[routeIx];
      if (!swapRoute) {
        return null;
      }
      const tokenA = this.tokenA.contract_id;
      return swapRoute.length < 2
            || swapRoute[0].token0 === tokenA
            || swapRoute[0].token1 === tokenA
        ? swapRoute
        : [...swapRoute].reverse();
    },
    ratio() {
      if (this.isAeVsWae) return 1;
      if (!this.tokenA || !this.tokenB || !this.selectedRoute) return null;
      return ratioWithDecimals(ratioFromRoute(
        this.selectedRoute,
        this.tokenA.contract_id,
      ).toString(), {
        decimalsA: this.tokenA.decimals,
        decimalsB: this.tokenB.decimals,
      }).toNumber();
    },
    priceImpact() {
      if (!this.selectedRoute || !this.amountTokenA) {
        return BigNumber(0);
      }
      return getPriceImpactForRoute(
        this.selectedRoute,
        this.tokenA.contract_id,
        expandDecimals(this.amountTokenA, this.tokenA.decimals),
      );
    },
    receivedTokensByPriceImpact() {
      if (!this.selectedRoute || !this.amountTokenA || !this.amountTokenB) {
        return BigNumber(0);
      }
      if (this.isAeVsWae) return new BigNumber(this.amountTokenA);
      return reduceDecimals(
        getReceivedTokensForRoute(
          this.selectedRoute,
          this.tokenA.contract_id,
          expandDecimals(this.amountTokenA, this.tokenA.decimals),
        ),
        this.tokenB.decimals,
      );
    },
  },
  watch: {
    async factory(newVal) {
      // we have wallet connection
      if (newVal && this.tokenB && this.tokenA) {
        await this.setSwapRoutes();
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
        await this.setSwapRoutes();
      }
    },
  },
  unmounted() {
    clearTimeout(this.pairInfoTimeoutId);
  },
  methods: {
    async switchSelectedTokens() {
      const swapToken = this.tokenA;
      this.tokenA = this.tokenB;
      this.tokenB = swapToken;

      const swapAmount = this.amountTokenA;
      this.amountTokenA = this.amountTokenB;
      this.amountTokenB = swapAmount;
      this.isLastInputTokenA = !this.isLastInputTokenA;

      this.setAmount(
        this.isLastInputTokenA ? this.amountTokenA : this.amountTokenB,
        this.isLastInputTokenA,
      );
      await this.$watchUntilTruly(() => this.$store.state.aeternity.router);

      this.saveTokenSelection(this.tokenA, this.tokenB);
    },
    async setSelectedToken(token, isTokenA) {
      let switched;
      [this.tokenA, this.tokenB, switched] = calculateSelectedToken(
        token,
        this.tokenA,
        this.tokenB,
        isTokenA,
      );
      if (!switched) {
        // TODO: this is a subject of change after user selection
        // of paths is implemented
        this.selectedRouteIx = DEFAULT_SELECTED_ROUTE_IX;
        await this.setSwapRoutes();
      }
      if (switched) {
        const swap = this.amountTokenA;
        this.amountTokenA = this.amountTokenB;
        this.amountTokenB = swap;
        this.isLastInputTokenA = !this.isLastInputTokenA;
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
    async setSwapRoutes() {
      clearTimeout(this.pairInfoTimeoutId);
      if (!this.tokenA || !this.tokenB) {
        return;
      }
      try {
        await this.$store.dispatch('aeternity/fetchSwapRoutes', {
          tokenA: this.tokenA.contract_id,
          tokenB: this.tokenB.contract_id,
        });
      } catch (e) {
        handleUnknownError(e);
      } finally {
        if (!this.backendFailed && this.swapRoutes) {
          this.pairInfoTimeoutId = setTimeout(
            this.setSwapRoutes,
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
          this.amountTokenB = amount ? BigNumber(amount).times(this.ratio).toString() : '';
        }
      } else {
        this.amountTokenB = amount;
        if (this.ratio) {
          this.amountTokenA = amount ? BigNumber(amount).div(this.ratio).toString() : '';
        }
      }
      this.saveAmountSelection(amount, isLastInputTokenA);
    },
  },
};
