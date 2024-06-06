<template>
  <img :src="`https://avatars.z52da5wt.xyz/${address}`" :alt="address" />
</template>
<script>
export default {
  name: 'AddressAvatar',
  props: {
    address: {
      type: String,
      required: true,
    },
  },
};
</script>
<style scoped lang="scss"></style>
