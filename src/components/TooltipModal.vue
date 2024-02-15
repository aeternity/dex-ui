<template>
  <Transition @after-leave="popper.destroy()">
    <div
      v-if="visible"
      id="tooltip"
      class="tooltip-modal"
      @mouseenter="enterHandler"
      @focusin="enterHandler"
      @mouseleave="leaveHandler"
      @focusout="leaveHandler"
    >
      <slot />
      <template v-if="!$slots.default">
        {{ tooltip }}
      </template>
      <div
        id="arrow"
        data-popper-arrow
      />
    </div>
  </Transition>
</template>

<script>
import { createPopper } from '@popperjs/core';

export default {
  props: {
    reference: { type: typeof Element !== 'undefined' ? Element : null, required: true },
    tooltip: { type: String, default: '' },
    resolve: { type: Function, required: true },
  },
  data: () => ({
    popper: null,
    setVisibility: null,
    visible: false,
  }),
  mounted() {
    this.setVisibility = this.setVisibilityDirectly;
    this.setVisibility(true);
    this.reference.addEventListener('mouseenter', this.enterHandler);
    this.reference.addEventListener('mouseleave', this.leaveHandler);
  },
  methods: {
    enterHandler() {
      this.setVisibility(true);
    },
    leaveHandler() {
      this.setVisibility(false);
    },
    setVisibilityDirectly(isVisible) {
      if (!isVisible) {
        this.resolve();
        return;
      }
      if (this.visible) return;
      this.visible = true;
      this.$nextTick(() => {
        this.popper = createPopper(this.reference, this.$el, {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 10],
              },
            },
          ],
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.tooltip-modal {
  display: flex;
  padding: 10px 16px;
  max-width: 256px;
  word-break: break-word;
  background: variables.$color-black3;
  color: variables.$color-white2;
  border-radius: 12px;
  text-align: left;
  border: 1px solid variables.$color-black;
  box-shadow: rgb(0 0 0 / 10%) 0 4px 8px 0;

  &.v-enter-active,
  &.v-leave-active {
    transition: opacity 0.3s;
  }

  &.v-enter,
  &.v-leave-to {
    opacity: 0;
  }

  #arrow,
  #arrow::before {
    position: absolute;
    right: 1px;
    width: 8px;
    height: 8px;
    background: inherit;
  }

  #arrow {
    visibility: hidden;
  }

  #arrow::before {
    visibility: visible;
    content: '';
    transform: rotate(45deg);
  }
}

#tooltip[data-popper-placement^='top'] > #arrow {
  bottom: -4px;
}

#tooltip[data-popper-placement^='bottom'] > #arrow {
  top: -4px;
}

#tooltip[data-popper-placement^='left'] > #arrow {
  right: -4px;
}

#tooltip[data-popper-placement^='right'] > #arrow {
  left: -4px;
}
</style>
