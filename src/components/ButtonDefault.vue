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
        'second-dark',
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
      background-color: variables.$color-blue-hover;
    }
  }

  &.transparent {
    background-color: transparent;
    border: 1px solid variables.$color-black;

    &:hover {
      box-shadow: rgb(86 90 105) 0 0 0 1px;
    }
  }

  &.transparent-blue {
    border: 1px solid variables.$color-blue2;
    color: variables.$color-blue;
    background-color: variables.$color-blue2;

    &:active {
      box-shadow: rgb(55 107 173 / 44%) 0 0 0 1pt;
    }

    &:hover {
      border: 1px solid variables.$color-blue2-hover;
      color: variables.$color-blue-hover;
    }
  }

  &.dark {
    background: variables.$color-black3;

    &:hover {
      background-color: variables.$color-black;
    }

    &:active {
      background-color: variables.$color-black3;
    }
  }

  &.second-dark {
    background: variables.$color-black2;

    &:hover {
      background: variables.$color-black;
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
