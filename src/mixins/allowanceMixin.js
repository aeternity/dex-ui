import { mapState } from 'vuex';
import { handleUnknownError, addSlippage, expandDecimals } from '@/lib/utils';

export default {
  computed: {
    ...mapState(['address']),
    ...mapState('aeternity', ['slippage']),
  },
  data: {
    allowances: {},
    allowanceFailed: false,
    fetchingAllowance: false,
  },
  methods: {
    /**
     * @description calculates if there is enough allowance
     * for a given amount. It takes in consideration also the slippage
     * @async
     * @param {string} tokenId the tokenId. any unique key
     * @param {number|BigNumber} amount token amount
     * @param {number} decimals token decimals
    */
    enoughTokenAllowance(tokenId, amount, decimals) {
      if (!tokenId || !amount) return false;

      const allowance = this.allowances[tokenId] ?? 0n;
      return allowance >= this.amountWithSlippage(amount, decimals);
    },
    amountWithSlippage(amount, decimals) {
      return addSlippage(expandDecimals(amount ?? 0n, decimals), this.slippage);
    },

    fetchAllowance(tokenId) {
      return this.$store.dispatch('aeternity/getRouterTokenAllowance', { token: tokenId });
    },

    async createAndRefreshAllowance(token, amount) {
      await this.$store.dispatch('aeternity/createTokenAllowance', {
        token,
        amount: expandDecimals(amount, token.decimals),
      });
      if (token && !token.is_ae) {
        this.safeRefreshAllowance(token.contract_id, amount, token.decimals, this.fetchAllowance);
      }
    },

    /**
     * @description refresh the allowance
     * NOTE: Pair tokens can be used as well. see remove-liquidity view
     * @async
     * @param {string} tokenId the tokenId. any unique key
     * @param {function} fetchAllowance an @async function taking tokenId
     * as parameter and returning the allowance for this token from outside
    */
    async refreshAllowance(tokenId, fetchAlowance) {
      if (!tokenId) return;
      this.allowances[tokenId] = null;
      await this.fetchAllowanceIfNone(tokenId, fetchAlowance);
    },

    /**
     * @description refresh the allowance if previous fetching did not fail
     * or will infer one from the parameters if it did failed before
     * NOTE: Pair tokens can be used as well. see remove-liquidity view
     * @async
     * @param {string} tokenId the tokenId. any unique key
     * @param {number|BigNumber} amount amount of the token
     * @param {number} decimals token decimals
     * @param {function} fetchAllowance an @async function taking tokenId
     * as parameter and returning the allowance for this token from outside
    */
    async safeRefreshAllowance(tokenId, amount, decimals, fetchAlowance) {
      // NOTE: if for any reason pulling any allowance from outside failed
      // we promised to give the user a chance to swap, so we are going
      // to set the allowance by ourselves after the approval.
      if (this.allowanceFailed) {
        this.allowances[tokenId] = this.amountWithSlippage(amount, decimals);
      } else {
        await this.refreshAllowance(tokenId, fetchAlowance);
      }
    },

    /**
     * @description fetching the allowance for an token and storing it
     * into this.allowances.
     * The fetch occurs only if `this.allowances[tokenId] == null`
     * NOTE: Pair tokens can be used as well. see remove-liquidity view
     * @async
     * @param {string} tokenId the tokenId. any unique key
     * @param {function} fetchAllowance an @async function taking tokenId
     * as parameter and returning the allowance for this token from outside
    */
    async fetchAllowanceIfNone(tokenId, fetchAllowance) {
      // if there is no wallet there is no allowance to ask for
      if (!tokenId || !this.address) return;
      // if there is already allowance we must abort
      if (this.allowances[tokenId] != null) return;

      try {
        this.fetchingAllowance = true;
        const allowance = await fetchAllowance(tokenId);
        this.allowances[tokenId] = allowance;
        this.allowanceFailed = false;
      } catch (e) {
        // by setting allowanceFailed we are enabling Approve button
        // and give the user the chance to force the approval
        this.allowanceFailed = true;
        handleUnknownError(e);
      } finally {
        this.fetchingAllowance = false;
      }
    },
  },
};
