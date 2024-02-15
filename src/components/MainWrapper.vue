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
          <BackArrow />
        </ButtonDefault>
      </div>
      <div class="title">
        {{ title }}
      </div>
      <div
        class="right"
        @click="settingsClickHandler"
        @keydown="settingsClickHandler"
      >
        <ActionsMenu v-if="settings">
          <template #display>
            <Cog />
          </template>
          <div class="settings">
            <div class="title">
              {{ $t('swap.transactSettings') }}
            </div>
            <SettingsItem
              :title="$t('swap.slipTolerance')"
              :description="$t('swap.transactSettingsPopup')"
              class="slippage"
            >
              <div>
                <ButtonDefault
                  :fill="showedSlippage ? 'second-dark' : 'primary'"
                  @click="resetData()"
                >
                  {{ $t('swap.auto') }}
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
                    <Warning
                      v-show="slippageStatus === 'warning'"
                    />
                  </template>
                  <template #right>
                    <span>%</span>
                  </template>
                </InputAmount>
              </div>
              <div :class="['message', slippageStatus]">
                {{
                  slippageStatus && slippageStatus === 'warning'
                    ? $t('swap.transactionFrontrun')
                    : $t('swap.enterSlipPercentage')
                }}
              </div>
            </SettingsItem>
            <SettingsItem
              :title="$t('swap.transactDeadline')"
              :description="$t('swap.transactDeadlinePopup')"
              class="deadline"
            >
              <InputAmount
                :value="showedDeadline"
                :placeholder="DEFAULT_DEADLINE"
                :class="{ error: isInvalidDeadline }"
                @update:value="updateDeadline($event)"
              />
              <span>{{ $t('swap.minutes') }}</span>
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
import BackArrow from '@/assets/back.svg';
import Cog from '@/assets/cog.svg';
import Warning from '@/assets/warning.svg';
import {
  DEFAULT_SLIPPAGE, MIN_SLIPPAGE, MAX_SLIPPAGE, DEFAULT_DEADLINE, MIN_DEADLINE, MAX_DEADLINE,
} from '@/lib/constants';
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
    BackArrow,
    Cog,
    Warning,
  },
  props: {
    backButton: { type: Boolean },
    title: { type: String, required: true },
    settings: { type: Boolean },
  },
  data: () => ({
    showedSlippage: '',
    showedDeadline: '',
    DEFAULT_SLIPPAGE,
    DEFAULT_DEADLINE,
  }),
  computed: {
    ...mapState('aeternity', ['slippage', 'deadline']),
    slippageStatus() {
      if (this.showedSlippage > MIN_SLIPPAGE * 2 && this.showedSlippage < MAX_SLIPPAGE) return 'warning';
      if (this.showedSlippage && (this.showedSlippage >= MAX_SLIPPAGE || this.showedSlippage < DEFAULT_SLIPPAGE)) return 'alert';
      return '';
    },
    isInvalidDeadline() {
      return (this.showedDeadline
        && (this.showedDeadline > MAX_DEADLINE || this.showedDeadline < MIN_DEADLINE));
    },
  },
  methods: {
    settingsClickHandler() {
      this.showedSlippage = this.slippage === DEFAULT_SLIPPAGE ? '' : this.slippage;
      this.showedDeadline = this.deadline === DEFAULT_DEADLINE ? '' : this.deadline;
    },
    resetData() {
      this.updateSlippage(DEFAULT_SLIPPAGE);
      this.updateDeadline(DEFAULT_DEADLINE);
    },
    updateSlippage(newSlippage) {
      this.showedSlippage = newSlippage;
      this.$store.commit('aeternity/setSlippage', newSlippage);
    },
    updateDeadline(newDeadline) {
      this.showedDeadline = newDeadline;
      this.$store.commit('aeternity/setDeadline', newDeadline);
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
@use '../styles/typography.scss';
@use '../styles/mixins.scss';

.main-wrapper {
  display: flex;
  flex-direction: column;
  margin: 4vh auto 0;
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
    padding: 20px 20px 0;

    .left,
    .right {
      flex-grow: 1;
      flex-basis: 0;
      display: flex;
    }

    .left svg {
      height: 24px;
      width: 24px;
      color: white;
    }

    .title {
      @extend %face-sans-18-semi-bold;

      color: white;
      white-space: nowrap;
    }

    .right {
      justify-content: flex-end;

      .actions-menu {
        svg {
          height: 24px;
          width: 24px;
        }

        :deep(.small-modal > .content) {
          border: 1px solid variables.$color-gray;
          top: 30px;
        }

        .settings {
          width: 440px;
          max-width: 100%;
          cursor: auto;
          padding: 16px;
          color: white;
          text-align: left;

          @include mixins.phone {
            width: 90%;
          }

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

              svg {
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

            &.error :deep(.input-field) {
              color: variables.$color-red;
            }
          }

          .input-amount {
            max-width: 100px;
            height: 38px;
            padding: 0 16px;
            border-radius: 16px;

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
