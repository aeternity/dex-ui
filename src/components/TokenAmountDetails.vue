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
.token-amount-details {
  display: flex;
  flex-direction: column;
  text-align: left;
  border: 1px solid rgb(44, 47, 54);
  background-color: rgb(33, 36, 41);
  border-radius: 16px;
  padding: 12px 16px;
  color: white;

  label {
    font-weight: 500;
    font-size: 14px;
    color: rgb(143, 150, 172);
    margin-bottom: 8px;
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
