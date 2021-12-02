<template>
  <div class="settings-item">
    <div class="title">
      <span>{{ title }}</span>
      <ButtonPlain @mouseenter="mouseEnterHandler">
        ?
      </ButtonPlain>
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
  data: () => ({
    popupBound: false,
  }),
  props: {
    title: { type: String, required: true },
  },
  methods: {
    async mouseEnterHandler() {
      if (this.popupBound) return;
      this.popupBound = true;
      await this.$store.dispatch('modals/open', {
        name: 'show-tooltip',
        tooltip: this.$attrs.tooltip,
        reference: this.$el.querySelector('.title > .button-plain'),
      });
      this.popupBound = false;
    },
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
