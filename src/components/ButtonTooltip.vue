<template>
  <ButtonPlain class="button-tooltip" @click.prevent="mouseEnterHandler">
    <slot />
  </ButtonPlain>
</template>

<script>
import ButtonPlain from './ButtonPlain.vue';

export default {
  components: {
    ButtonPlain,
  },
  props: {
    tooltip: { type: String, default: '' },
    modal: { type: String, default: 'show-tooltip' },
  },
  data: () => ({
    popupBound: false,
  }),
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
