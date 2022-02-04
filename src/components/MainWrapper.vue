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
      <div
        class="right"
        @click="settingsClickHandler"
      >
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
                <ButtonDefault
                  :fill="showedSlippage ? 'second-dark' : 'blue'"
                  @click="updateSlippage()"
                >
                  Auto
                </ButtonDefault>
                <InputAmount
                  :value="showedSlippage"
                  :placeholder="DEFAULT_SLIPPAGE"
                  :class="slippageStatus"
                  @update:value="updateSlippage($event)"
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
                v-model:value="deadline"
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
import { mapState } from 'vuex';
import ButtonDefault from './ButtonDefault.vue';
import ActionsMenu from './ActionsMenu.vue';
import SettingsItem from './SettingsItem.vue';
import InputAmount from './InputAmount.vue';
import { DEFAULT_SLIPPAGE, MIN_SLIPPAGE, MAX_SLIPPAGE } from '../lib/constants';

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
    deadline: null,
    showedSlippage: '',
    DEFAULT_SLIPPAGE,
  }),
  computed: {
    ...mapState('aeternity', ['slippage']),
    slippageStatus() {
      if (this.showedSlippage > MIN_SLIPPAGE * 2 && this.showedSlippage < MAX_SLIPPAGE) return 'warning';
      if (this.showedSlippage && (this.showedSlippage >= MAX_SLIPPAGE || this.showedSlippage < DEFAULT_SLIPPAGE)) return 'alert';
      return '';
    },
  },
  methods: {
    settingsClickHandler() {
      this.showedSlippage = this.slippage === DEFAULT_SLIPPAGE ? '' : this.slippage;
    },
    updateSlippage(newSlippage) {
      this.showedSlippage = newSlippage;
      this.$store.commit('aeternity/setSlippage', newSlippage);
    },
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
@use '../styles/variables.scss';

.main-wrapper {
  display: flex;
  flex-direction: column;
  margin: 4vh auto 0 auto;
  border-radius: 24px;
  max-width: 480px;
  background: variables.$color-black3;
  box-shadow:
    rgb(0 0 0 / 1%) 0 0 1px,
    rgb(0 0 0 / 4%) 0 4px 8px,
    rgb(0 0 0 / 4%) 0 16px 24px,
    rgb(0 0 0 / 1%) 0 24px 32px;

  .header {
    display: flex;
    padding: 16px 16px 0 16px;

    .left,
    .right {
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
          border: 1px solid variables.$color-gray;
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
              border: 1px solid variables.$color-gray;
              padding: 6px 8px;
              margin-right: 8px;
              font-size: 16px;
            }

            .input-amount {
              &.alert {
                border-color: variables.$color-red;

                :deep(.input-field) {
                  color: variables.$color-red;
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
                color: variables.$color-red;
              }

              &.warning {
                display: flex;
                color: variables.$color-orange;
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
