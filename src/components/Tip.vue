<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="tip">
    <b>Tip:</b>{{ ` ${tip}` }}
  </div>
</template>

<script>
export default {
  props: {
    tip: { type: String, required: true },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.tip {
  color: variables.$color-blue;
  background-color: variables.$color-blue2;
  border-radius: 12px;
  padding: 16px;
  text-align: left;
}
</style>
