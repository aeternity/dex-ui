<template>
  <div class="flex flex-col text-right md:text-left pb-2">
    <div class="text-xs">{{ title }}</div>
    <div class="inline-flex flex-row justify-end md:justify-start">
      <div class="text-2xl font-bold">{{ value }}</div>
      <div v-if="change" class="text-xs">{{ change }}</div>
    </div>
    <div v-if="value2" class="text-2xl font-bold">{{ value2 }}</div>
  </div>
</template>
<script>
export default {
  name: 'StatElement',
  props: {
    title: { type: String, required: true },
    value: { type: String, required: true },
    value2: { type: String, required: false, default: null },
    change: { type: String, required: false, default: null },
  },
};
</script>
<style lang="scss" scoped></style>
