<template>
  <transition appear>
    <div
      class="modal"
      @click.self="$emit('close')"
    >
      <div class="container">
        <div
          v-if="title || close"
          class="header"
        >
          <span>{{ title }}</span>
          <ButtonPlain
            v-if="close"
            class="close"
            @click="$emit('close')"
          >
            <img src="../assets/times.svg">
          </ButtonPlain>
        </div>
        <div
          v-if="$slots.default"
          class="body"
        >
          <slot />
        </div>
        <div
          v-if="$slots.footer"
          class="footer"
        >
          <div class="content">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import ButtonPlain from './ButtonPlain.vue';

export default {
  components: {
    ButtonPlain,
  },
  props: {
    close: Boolean,
    title: { type: String, default: '' },
  },
  emits: ['close'],
};
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.424);
  display: flex;

  .container {
    overflow: hidden;
    position: relative;
    min-width: 20vw;
    margin: auto;
    background-color: rgb(25, 27, 31);
    border: 1px solid rgb(33, 36, 41);
    box-shadow: rgb(0 0 0 / 5%) 0px 4px 8px 0px;
    border-radius: 20px;

    .header {
      padding: 20px 20px 16px 20px;
      color: white;
      font-size: 19px;
      font-weight: 500;
      word-break: break-word;
      text-align: center;
      display: flex;
      justify-content: space-between;

      .close {
        width: 24px;
        height: 24px;
        color: white;

        svg {
          width: 24px;
        }
      }
    }

    .body {
      word-break: break-word;
      text-align: center;
    }

    .footer .content {
      display: flex;
      justify-content: center;

      :deep(.button) {
        margin: 0 10px;
        width: 120px;
        font-weight: 700;
      }
    }
  }

  &.v-enter-active,
  &.v-leave-active {
    transition: opacity 0.3s;

    .container {
      transition: transform 0.3s;
    }
  }

  &.v-enter,
  &.v-leave-to {
    opacity: 0;

    .container {
      transform: scale(1.1);
    }
  }
}
</style>
