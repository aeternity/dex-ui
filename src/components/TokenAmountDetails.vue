<template>
  <div class="token-amount-details">
    <label for="token-amount">
      {{ label }}
    </label>
    <div id="token-amount" class="token-amount">
      <div>
        <TokenIcon :token-a="token" />
        {{ symbol }}
      </div>
      {{ amount }}
    </div>
  </div>
</template>

<script>
import TokenIcon from './TokenIcon.vue';

export default {
  components: { TokenIcon },
  props: {
    label: { type: String, required: true },
    symbol: { type: String, required: true },
    token: { type: Object, required: true },
    amount: { type: [String, Number], required: true },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.token-amount-details {
  display: flex;
  flex-direction: column;
  text-align: left;
  border: 1px solid variables.$color-black;
  background-color: variables.$color-black2;
  border-radius: 16px;
  padding: 12px 16px;
  color: white;

  label {
    color: variables.$color-gray2;
    margin-bottom: 8px;

    @extend %face-sans-14-medium;
  }

  div {
    display: flex;
    align-items: center;
  }

  .token-amount {
    font-size: 20px;
    justify-content: space-between;

    & > div {
      word-break: normal;
      margin-right: 12px;
    }
  }

  .token-icon :deep(svg),
  .token-icon :deep(img) {
    width: 20px;
    height: 20px;
    margin-right: 12px;
  }
}
</style>
