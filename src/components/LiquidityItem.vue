<template>
  <div :class="['liquidity-item', { hidden: !show }]">
    <ButtonPlain
      class="header"
      @click="show = !show"
    >
      <div>
        <img src="../assets/logo.png">
        <img src="../assets/ae.svg">
        <span>VUE/AE</span>
      </div>
      <img
        src="../assets/arrow.svg"
        :class="{ rotated: show }"
      >
    </ButtonPlain>
    <div class="body">
      <div>
        <span>Pooled AE:</span>
        <div>
          0.00015
          <img src="../assets/ae.svg">
        </div>
      </div>
      <div>
        <span>Pooled VUE:</span>
        <div>
          0.00000231212
          <img src="../assets/logo.png">
        </div>
      </div>
      <div>
        <span>Your pool tokens:</span>
        <span>0.000000072</span>
      </div>
      <div>
        <span>Your pool share:</span>
        <span>0.01%</span>
      </div>
    </div>
    <div class="buttons">
      <a
        href="https://aeternity.com/"
        target="_blank"
      >
        View pool information
      </a>
      <div>
        <ButtonDefault
          fill="transparent-blue"
          :to="{ name: 'add-pool' }"
        >
          Add
        </ButtonDefault>
        <ButtonDefault fill="transparent-blue">
          Remove
        </ButtonDefault>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonPlain from './ButtonPlain.vue';
import ButtonDefault from './ButtonDefault.vue';

export default {
  components: {
    ButtonPlain,
    ButtonDefault,
  },
  props: {
    poolInfo: { type: Object, required: true }, // that will be displayed within this component
  },
  data: () => ({
    show: false,
  }),
};
</script>

<style lang="scss" scoped>
.liquidity-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 20px;
  border: 1px solid #2c2f36;
  margin-bottom: 20px;
  overflow: hidden;
  max-height: 700px;
  transition: max-height 0.2s ease-out;

  &.hidden {
    max-height: 49px;
  }

  img {
    height: 20px;
    width: 20px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .rotated {
      transform: rotate(180deg);
    }

    > div {
      display: flex;
      align-items: center;

      img:nth-of-type(1) {
        z-index: 1;
      }

      img:nth-of-type(2) {
        margin-left: -10px;
      }

      span {
        color: white;
        font-size: 18px;
        font-weight: 500;
        margin-left: 15px;
      }
    }
  }

  .body {
    margin-top: 8px;

    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: white;
      margin-top: 8px;

      div {
        display: flex;
        align-items: center;

        img {
          margin-left: 4px;
        }
      }
    }
  }

  .buttons {
    margin-top: 20px;

    a {
      text-decoration: none;
      color: #2172e5;

      &:hover {
        color: #35b6ff;
      }
    }

    > div {
      display: flex;
      justify-content: space-evenly;
      margin-top: 20px;

      .button-default {
        font-weight: 500;
        width: 100%;
        padding: 12px;

        &:first-child {
          margin-right: 16px;
        }
      }
    }
  }
}
</style>
