<template>
  <ButtonDefault
    v-bind="$attrs"
    :class="['button-token', {active: !!token}]"
    :fill="null"
    @click="selectToken"
  >
    <div class="token">
      <img
        v-if="token"
        :src="token.image ?? `https://avatars.z52da5wt.xyz/${token.contract_id}`"
      >
      <span>{{ token && token.symbol || 'Select token' }}</span>
    </div>
    <DownChevron
      v-if="arrow"
    />
  </ButtonDefault>
</template>

<script>
import ButtonDefault from './ButtonDefault.vue';
import DownChevron from '../assets/arrow.svg?vue-component';

export default {
  components: {
    ButtonDefault,
    DownChevron,
  },
  props: {
    token: { type: Object, default: null },
    arrow: { type: Boolean },
  },
  emits: ['update:token'],
  methods: {
    async selectToken() {
      const token = await this.$store.dispatch('modals/open', { name: 'select-token', ...this.$attrs });
      if (token) this.$emit('update:token', token);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/typography.scss';

.button-token {
  padding: 16px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px;
  background: rgba(142, 152, 186, 0.15);
  border: 2px solid transparent;

  &.active {
    background: rgba(18, 20, 27, 1);
    border-color: rgba(18, 20, 27, 1);
  }

  &:hover {
    border-color: rgba(142, 152, 186, 0.4);
  }

  .token {
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    max-width: 200px;

    img {
      width: 24px;
      height: 24px;
      border-radius: 24px;
    }

    > span {
      margin-left: 12px;

      @extend %face-sans-18-medium;
    }
  }

  svg {
    width: 24px;
    height: 24px;
  }
}
</style>
