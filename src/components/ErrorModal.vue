<template>
  <ModalDefault
    class="error-modal"
    title="Error"
    close
    @close="resolve"
  >
    <div class="error-details">
      <img
        src="../assets/alert.svg"
        alt="Warning icon"
      >
      <h4>{{ msg }}</h4>
    </div>
    <ButtonDefault
      fill="transparent-blue"
      @click="resolve"
    >
      Dismiss
    </ButtonDefault>
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
  },
};
</script>

<style lang="scss" scoped>
.error-modal {
  .error-details {
    padding: 20px 30px;
    max-width: 480px;

    img {
      width: 50px;
    }

    h4 {
      color: white;
      margin-top: 5px;
    }
  }

  .button-default {
    padding: 8px 12px;
    margin-bottom: 20px;
    font-size: 18px;
  }
}
</style>
