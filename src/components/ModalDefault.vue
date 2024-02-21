<template>
  <transition appear>
    <div class="modal" @click.self="$emit('close')" @keydown.self="$emit('close')">
      <div class="container">
        <div v-if="title || close" class="header">
          <slot name="header-left" />
          <span>{{ title }}</span>
          <ButtonPlain v-if="close" class="close" @click="$emit('close')">
            <Times />
          </ButtonPlain>
        </div>
        <div v-if="$slots.default" class="body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="footer">
          <div class="content">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Times from '@/assets/times.svg';
import ButtonPlain from './ButtonPlain.vue';

export default {
  components: {
    ButtonPlain,
    Times,
  },
  props: {
    close: Boolean,
    title: { type: String, default: '' },
  },
  emits: ['close'],
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.modal {
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: variables.$color-modal-bg;
  display: flex;

  .container {
    overflow: hidden;
    position: relative;
    width: 440px;
    max-width: 90%;
    margin: 70px auto auto;
    background-color: variables.$color-black3;
    border: 1px solid variables.$color-black2;
    box-shadow: rgb(0 0 0 / 5%) 0 4px 8px 0;
    border-radius: 20px;
    max-height: calc(100vh - 150px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      background: variables.$color-black;
    }

    &::-webkit-scrollbar-thumb {
      background: variables.$color-black2;
    }

    &::-webkit-scrollbar-corner {
      background: variables.$color-black;
    }

    .header {
      padding: 20px 20px 16px;
      color: white;
      word-break: break-word;
      text-align: center;
      display: flex;
      justify-content: space-between;

      @extend %face-sans-18-medium;

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
