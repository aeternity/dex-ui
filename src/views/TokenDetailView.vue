<template>
  <ExploreWrapper>
    <div>BREADCRUMB</div>
    <div class="header">
      <span v-if="tokenId" class="logo"><AddressAvatar :address="tokenId" /></span>
      <h1>{{ metaInfo?.symbol }} / {{ metaInfo?.name }}</h1>
    </div>
    <!-- Graph that shows price over time -->
    <!-- Stats -->
    <!-- List of transactions -->
    <!-- List of pools -->
  </ExploreWrapper>
</template>
<script>
import { defineComponent } from 'vue';
import ExploreWrapper from '@/components/explore/ExploreWrapper.vue';
import AddressAvatar from '@/components/AddressAvatar.vue';

export default defineComponent({
  components: { AddressAvatar, ExploreWrapper },
  data() {
    return {
      tokenId: null,
      metaInfo: null,
    };
  },
  async mounted() {
    // extract param from URL
    this.tokenId = this.$route.params.id;

    // Fetch token meta info
    const token = await this.$store.dispatch('aeternity/getTokenInstanceMetaInfo', this.tokenId);
    this.metaInfo = token.decodedResult;

    // Fetch token price history
  },
});
</script>
<style lang="scss" scoped>
.logo {
  margin-right: 10px;
  img {
    width: 45px;
    height: 45px;
  }
}
.header {
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-bottom: 20px;
  h1 {
    font-size: 24px;
    font-weight: 500;
  }
}
</style>
