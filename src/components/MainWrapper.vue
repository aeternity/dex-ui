<template>
  <div class="main-wrapper">
    <div class="header">
      <div
        v-if="backButton"
        class="left"
      >
        <ButtonDefault
          fill="plain"
          @click="back"
        >
          <img src="../assets/back.svg">
        </ButtonDefault>
      </div>
      <div class="title">
        {{ title }}
      </div>
      <div class="right">
        <ActionsMenu v-if="settings">
          <template #display>
            <img src="../assets/cog.svg">
          </template>
          <div class="settings">
            <div class="title">
              Transaction settings
            </div>
            <SettingsItem
              title="Slippage tolerance"
              tooltip="Your transaction will revert if the price
                changes unfavorably by more than this percentage."
              class="slippage"
            >
              <div>
                <ButtonDefault>Auto</ButtonDefault>
                <InputAmount
                  v-model:value="slip"
                  placeholder="0.10"
                  :class="slippageStatus"
                >
                  <template
                    #left
                  >
                    <img
                      v-show="slippageStatus === 'warning'"
                      src="../assets/warning.svg"
                    >
                  </template>
                  <template #right>
                    <span>%</span>
                  </template>
                </InputAmount>
              </div>
              <div :class="['message', slippageStatus]">
                {{
                  slippageStatus && slippageStatus === 'warning'
                    ? 'Your transaction may be frontrun'
                    : 'Enter a valid slippage percentage'
                }}
              </div>
            </SettingsItem>
            <SettingsItem
              title="Transaction deadline"
              tooltip="Your transaction will revert if
                it is pending for more than this period of time."
              class="deadline"
            >
              <InputAmount
                v-model:value="slip"
                placeholder="30"
              />
              <span>minutes</span>
            </SettingsItem>
          </div>
        </ActionsMenu>
      </div>
    </div>
    <main>
      <div class="content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script>
import ButtonDefault from './ButtonDefault.vue';
import ActionsMenu from './ActionsMenu.vue';
import SettingsItem from './SettingsItem.vue';
import InputAmount from './InputAmount.vue';

export default {
  components: {
    ButtonDefault,
    ActionsMenu,
    SettingsItem,
    InputAmount,
  },
  props: {
    backButton: { type: Boolean },
    title: { type: String, required: true },
    settings: { type: Boolean },
  },
  data: () => ({
    slip: null,
  }),
  computed: {
    slippageStatus() {
      if (this.slip > 10 && this.slip < 51) return 'warning';
      if (this.slip > 51 || this.slip < 0) return 'alert';
      return '';
    },
  },
  methods: {
    back() {
      if (!this.$store.state.route.from.name) {
        this.$router.push({ name: 'swap' });
        return;
      }
      this.$router.go(-1);
    },
  },
};
</script>

<style lang="scss" scoped>
.main-wrapper {
  display: flex;
  flex-direction: column;
  margin: 4vh auto 0 auto;
  border-radius: 24px;
  max-width: 480px;
  background: rgb(25, 27, 31);
  box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px,
    rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;

  .header {
    display: flex;
    padding: 16px 16px 0 16px;

    .left, .right {
      flex-grow: 1;
      flex-basis: 0;
      display: flex;
    }

    .left img {
      height: 24px;
      width: 24px;
      color: white;
    }

    .title {
      font-size: 20px;
      color: white;
      white-space: nowrap;
    }

    .right {
      justify-content: end;

      .actions-menu {
        img {
          height: 24px;
          width: 24px;
        }

        :deep(.small-modal > .content) {
          border: 1px solid rgb(64, 68, 79);
          top: 30px;
        }

        .settings {
          min-width: 270px;
          cursor: auto;
          padding: 16px;
          color: white;
          text-align: left;

          .slippage :deep(.content) {
            display: flex;
            flex-direction: column;
          }

          .slippage div {
            display: flex;

            .button-default {
              border: 1px solid rgb(64, 68, 79);
              padding: 6px 8px;
              margin-right: 8px;
              font-size: 16px;
            }

            .input-amount {
              &.alert {
                border-color: rgb(255, 67, 67);

                :deep(.input-field) {
                  color: rgb(255, 67, 67);
                }
              }

              img {
                width: 20px;
                height: 20px;
              }

              :deep(span) {
                margin: 0 0 2px 2px;
              }
            }

            &.message {
              display: none;
              font-size: 14px;
              padding-top: 7px;

              &.alert {
                display: flex;
                color: rgb(255, 67, 67);
              }

              &.warning {
                display: flex;
                color: #ffaa29;
              }
            }
          }

          .deadline .input-amount {
            width: 80px;
            margin-right: 8px;
          }

          .input-amount {
            height: 32px;
            padding: 0 12px;
            border-radius: 36px;

            :deep(.input-field) {
              font-size: 16px;
            }
          }
        }
      }
    }
  }

  .content {
    padding: 20px;
  }
}
</style>
