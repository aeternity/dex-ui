<template>
  <ButtonPlain
    @mouseenter="mouseEnterHandler"
    class="button-tooltip"
  >
    <slot />
  </ButtonPlain>
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
    tooltip: { type: String, default: '' },
    modal: { type: String, default: 'show-tooltip' },
  },
  methods: {
    async mouseEnterHandler() {
      if (this.popupBound) return;
      this.popupBound = true;
      await this.$store.dispatch('modals/open', {
        name: this.modal,
        tooltip: this.tooltip,
        reference: this.$el,
      });
      this.popupBound = false;
    },
  },
};
</script>
