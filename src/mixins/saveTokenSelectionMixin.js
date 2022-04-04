export default {
  async mounted() {
    await this.$watchUntilTruly(() => this.$store.state.sdk);
    await this.$watchUntilTruly(() => this.$store.state.aeternity.router);
    this.restoreCurrentSelection();

    this.$store.watch(
      (state) => state.networkId,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          const query = {
            ...this.$route.query,
          };

          delete query.from;
          delete query.to;

          this.$router.replace({
            query,
          });

          this.$store.commit('navigation/setPool', null);
          this.$store.commit('navigation/setSwap', null);
        }
      },
      {
        deep: true,
      },
    );
  },

  methods: {
    getTokenIdentifier(token) {
      if (!token) return null;
      return token.is_ae ? token.symbol : token.contract_id;
    },
    saveTokenSelection(_from, _to) {
      const from = this.getTokenIdentifier(_from);
      const to = this.getTokenIdentifier(_to);

      this.saveCurrentSelection({ from, to });
    },
    saveAmountSelection(amount, isFrom) {
      if (amount) {
        this.saveCurrentSelection({ amount, isFrom });
      }
    },
    saveCurrentSelection(state) {
      this.$router.replace({
        query: {
          ...this.$route.query,
          ...state,
        },
      });

      if (this.$route.name === 'swap') {
        this.$store.commit('navigation/setSwap', state);
      }
      if (this.$route.name === 'add-pool') {
        this.$store.commit('navigation/setPool', state);
      }
    },

    async restoreCurrentSelection() {
      const {
        from, to,
        amount, isFrom,
      } = this.$route.query;

      const tokenList = (
        this.$store.getters.activeNetwork && this.$store.getters.activeNetwork.tokens)
        ? this.$store.getters.activeNetwork.tokens : [];
      const getToken = (token) => tokenList.find(
        (_token) => (
          _token.is_ae && _token.symbol === token)
          || (!_token.is_ae && _token.contract_id === token),
      );

      if (from) {
        await this.setSelectedToken(getToken(from), true);
      }

      if (to) {
        await this.setSelectedToken(getToken(to), false);
      }

      if (amount) {
        this.setAmount(amount, isFrom);
      }
    },
  },
};
