<template>
  <div class="import-pool">
    <MainWrapper
      title="Import V2 Pool"
      back-button
    >
      <Tip tip="Use this tool to find v2 pools that don't automatically appear in the interface." />
      <ButtonToken
        fill="transparent"
        title="ETH"
        arrow
      >
        <template v-slot:icon>
          <img src="../assets/logo.png">
        </template>
      </ButtonToken>
      <img src="../assets/plus.svg">
      <ButtonToken
        fill="transparent"
        title="Select token"
        arrow
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

export default {
  components: {
    MainWrapper,
    ButtonToken,
    Tip,
  },
  computed: mapState(['address']),
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
