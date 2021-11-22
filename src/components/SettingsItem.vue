<template>
  <div class="settings-item">
    <div class="title">
      <span>{{ title }}</span>
      <ButtonPlain>?</ButtonPlain>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script>
import ButtonPlain from './ButtonPlain.vue';

export default {
  components: {
    ButtonPlain,
  },
  props: {
    title: { type: String, required: true },
    // hint: { type: String, required: true },
  },
};
</script>
<style lang="scss" scoped>
.settings-item {
  .title {
    margin: 12px 0;
    font-weight: 500;
    font-size: 14px;
    color: rgb(195, 197, 203);;

    .button-plain {
      color: white;
      margin-left: 8px;
    }
  }

  .content {
    display: flex;
    align-items: center;
    width: fit-content;
  }
}
</style>
