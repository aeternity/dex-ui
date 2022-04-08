export default {
  data() {
    return {
      restoringTokenSelection: false,
    };
  },
  async mounted() {
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
      if (!this.restoringTokenSelection) {
        const from = this.getTokenIdentifier(_from);
        const to = this.getTokenIdentifier(_to);

        this.saveCurrentSelection({ from, to });
      }
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
      this.restoringTokenSelection = true;
      const {
        from, to,
        amount, isFrom,
      } = this.$route.query;

      const tokenList = [];
      this.$store.state.tokens.providers
        .filter((provider) => provider.active)
        .forEach((provider) => {
          tokenList.push(...provider.tokens);
        });
      tokenList.push(...this.$store.state.tokens.userTokens);

      const getToken = (token) => tokenList.find(
        (_token) => (
          _token.is_ae && _token.symbol === token)
          || (!_token.is_ae && _token.contract_id === token),
      );

      await Promise.all([
        from && this.setSelectedToken(getToken(from), true),
        to && this.setSelectedToken(getToken(to), false),
      ]);

      if (amount) {
        this.setAmount(amount, isFrom);
      }

      this.restoringTokenSelection = false;
    },
  },
};
