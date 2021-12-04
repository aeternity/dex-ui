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
.tip {
  color: rgb(80, 144, 234);
  background-color: rgba(21, 61, 111, 0.44);;
  border-radius: 12px;
  padding: 16px;
  text-align: left;
}
</style>
