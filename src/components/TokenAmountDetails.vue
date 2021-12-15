<template>
  <div class="token-amount-details">
    <label>
      {{ label }}
    </label>
    <div class="token-amount">
      <div>
        <img :src="`https://avatars.z52da5wt.xyz/${contract}`">
        {{ symbol }}
      </div>
      {{ amount }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: { type: String, required: true },
    symbol: { type: String, required: true },
    contract: { type: String, required: true },
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
  }

  img {
    width: 20px;
    height: 20px;
    margin-right: 12px;
  }
}
</style>
