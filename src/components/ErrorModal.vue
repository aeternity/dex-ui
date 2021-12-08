<template>
  <ModalDefault class="error-modal" title="Error" close @close="resolve">
    <div class="error-details">
        <img src="../assets/warning.svg" alt="Warning icon" />
        <h4>{{ msg }}</h4>
    </div>
    <div>
      <ButtonDefault
        :class="['error-msg-btn']"
        fill="transparent-blue"
        @click.prevent="resolve"
      >
        <span class="name">Dismiss</span>
      </ButtonDefault>
    </div>
  </ModalDefault>
</template>

<script>
import ModalDefault from './ModalDefault.vue';
import ButtonDefault from './ButtonDefault.vue';

export default {
  name: 'ErrorModal',
  components: {
    ModalDefault,
    ButtonDefault,
  },
  props: {
    msg: { type: String, required: true },
    resolve: { type: Function, required: true },
    close: { type: Function, default: null },
  },
  data() {
    return {
      showMenu: false,
    };
  },
};
</script>

<style lang="scss" scoped>
.error-modal {
    .error-details {
        padding: 20px 30px;
        max-width: 480px;

        img {
            max-width: 50px;
        }

        h4 {
          color: white;
          margin-top: 5px;
        }
    }

    :deep(.error-msg-btn) {
        padding: 8px 12px;
        margin-bottom: 20px;
        white-space: nowrap;
        font-size: 18px;
    }
}
</style>
