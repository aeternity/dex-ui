<template>
  <ModalDefault
    class="about-dex-modal"
    close
    @close="resolve"
  >
    <div class="wrapper">
      <h1 class="info-headline">
        {{ $t('onboardingModal.headline') }}
      </h1>
      <p class="info-text">
        {{ $t('onboardingModal.body') }}
      </p>
      <p class="info-text">
        <a
          href="https://dex.superhero.com/superhero-dex-and-ios"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://dex.superhero.com/superhero-dex-and-ios
        </a>
      </p>
      <ButtonDefault
        class="confirm-button"
        fill="primary"
        @click.prevent="resolve"
      >
        {{ $t('onboardingModal.confirm') }}
      </ButtonDefault>
    </div>
  </ModalDefault>
</template>

<script>
import ButtonDefault from './ButtonDefault.vue';
import ModalDefault from './ModalDefault.vue';

export default {
  components: {
    ButtonDefault,
    ModalDefault,
  },
  props: {
    resolve: { type: Function, required: true },
    reject: { type: Function, required: true },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';
@use '../styles/mixins.scss';

.about-dex-modal {
  .wrapper {
    padding: 0 16px  16px;

    .info-headline {
      color: variables.$color-white;
    }

    .info-text {
      color: variables.$color-gray2;
      text-align: left;
      line-height: 1.5;

      @extend %face-sans-16-regular;
    }

    a {
      color: variables.$color-white;
      text-decoration: none;
      display: flex;
      justify-content: center;

      @extend %face-sans-16-regular;
    }

    .confirm-button {
      width: 100%;
      padding: 16px;
      margin-top: 12px;
      border-radius: 16px;
    }
  }
}
</style>
