<template>
  <div class="info-row">
    <span>
      {{ leftText }}
    </span>
    <span>
      {{ rightText }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    leftText: { type: String, required: true },
    rightText: { type: [String, Number], required: true },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid variables.$color-black2;

  span:first-of-type {
    margin-inline: 4px;
    color: variables.$color-gray2;
  }

  span:last-of-type {
    margin-right: 4px;
  }
}
</style>
