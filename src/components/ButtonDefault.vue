<template>
  <ButtonPlain
    v-bind="$attrs"
    :class="[fill, 'button-default']"
  >
    <img
      v-if="spinner"
      src="../assets/animated-spinner.svg"
      class="spinner"
    >
    <slot v-else />
  </ButtonPlain>
</template>

<script>
import ButtonPlain from './ButtonPlain.vue';

export default {
  components: {
    ButtonPlain,
  },
  props: {
    fill: {
      type: String,
      validator: (value) => [
        'transparent-blue',
        'blue',
        'dark',
        'transparent',
        'plain',
      ].includes(value),
      default() {
        return 'blue';
      },
    },
    spinner: Boolean,
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.button-default {
  border-radius: 12px;
  color: variables.$color-white;

  &.blue {
    background-color: variables.$color-blue;

    &:hover {
      background-color: variables.$color-blue2;
    }
  }

  &.transparent {
    background-color: transparent;
    border:1px solid variables.$color-black;

    &:hover {
      box-shadow: rgb(86 90 105) 0px 0px 0px 1px;
    }
  }

  &.transparent-blue {
    border: 1px solid variables.$color-blue3;
    color: variables.$color-blue5;
    background-color: variables.$color-blue3;

    &:active {
      box-shadow: rgb(55 107 173 / 44%) 0px 0px 0px 1pt;
    }

    &:hover {
      border: 1px solid variables.$color-blue4;
      color: variables.$color-blue-hover;
    }
  }

  &.dark {
    background: variables.$color-black3;

    &:hover {
      background-color: variables.$color-black;
    }

    &:active {
      background-color: variables.$color-black5;
    }
  }

  &:disabled {
    background-color: variables.$color-black;
    color: variables.$color-white2;
    pointer-events: none;
  }

  .spinner {
    height: 20px;
    width: 20px;
  }
}
</style>
