<template>
  <div class="import-pool">
    <MainWrapper
      title="Import V2 Pool"
      back-button
    >
      <Tip tip="Use this tool to find v2 pools that don't automatically appear in the interface." />
      <ButtonToken
        fill="transparent"
        :token="from"
        arrow
        @update:token="setSelectedToken($event, true)"
      />
      <img src="../assets/plus.svg">
      <ButtonToken
        fill="transparent"
        :token="to"
        arrow
        @update:token="setSelectedToken($event, false)"
      />
      <div class="connect">
        {{ address
          ? 'Select a token to find your v2 liquidity.'
          : 'Connect to a wallet to find pools'
        }}
      </div>
    </MainWrapper>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import MainWrapper from '@/components/MainWrapper.vue';
import ButtonToken from '@/components/ButtonToken.vue';
import Tip from '@/components/Tip.vue';
import { calculateSelectedToken } from '../lib/utils';

export default {
  components: {
    MainWrapper,
    ButtonToken,
    Tip,
  },
  data: () => ({
    to: null,
    from: null,
  }),
  computed: mapState(['address']),
  methods: {
    setSelectedToken(token, isFrom) {
      [this.from, this.to] = calculateSelectedToken(token, this.from, this.to, isFrom);
    },
  },
};
</script>

<style lang="scss" scoped>
.import-pool {
  .button-token {
    margin: 12px 0;
  }

  .connect {
    color: white;
    width: 100%;
    padding: 45px 0;
    border-radius: 16px;
    border: 1px solid rgb(44, 47, 54);
    background-color: rgb(33, 36, 41);
  }
}
</style>
