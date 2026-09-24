<template>
  <img :src="`https://avatars.superherowallet.com/${address}`" :alt="address" />
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
