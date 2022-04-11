<template>
  <div class="token-list-manager">
    <div class="list-wrapper">
      <div
        v-for="(provider, index) of providers"
        :key="`provider-${index}`"
      >
        <div
          v-if="activeNetwork
            && provider.tokens.filter(t => t.networkId === activeNetwork.networkId).length"
          :class="['provider', { active: provider.active }]"
          @click.prevent="$store.commit('tokens/toggleProvider', provider)"
        >
          <div class="content">
            <div class="icon">
              <QuestionCircleIcon />
            </div>
            <div class="info">
              <div class="title">
                {{ provider.name }}
              </div>
              <div class="total-tokens">
                {{ provider.tokens.filter(t => t.networkId === activeNetwork.networkId).length }}
                tokens
              </div>
            </div>
          </div>

          <div class="actions">
            <div class="switch">
              <div
                v-if="provider.active"
                class="text"
              >
                ON
              </div>
              <div class="circle" />
              <div
                v-if="!provider.active"
                class="text"
              >
                OFF
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import QuestionCircleIcon from '../../assets/question-circle.svg?vue-component';

export default {
  components: {
    QuestionCircleIcon,
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    ...mapState('tokens', ['providers']),
  },
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables.scss';
@use '../../styles/typography.scss';
@use './style.scss';

.token-list-manager {
  width: 100%;

  .list-wrapper {
    display: flex;
    flex-direction: column;
    max-height: 50vh;
    min-height: 40vh;
    overflow-y: auto;
    border-top: 1px solid variables.$color-gray;
    padding: 20px;

    .provider {
      margin-bottom: 10px;
      border-radius: 8px;
      padding: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: variables.$color-white;
      background-color: variables.$color-black;

      .content {
        display: flex;
        align-items: center;

        .icon {
          width: 28px;
        }

        .info {
          padding-left: 10px;
          text-align: left;

          .title {
            line-height: 22px;

            @extend %face-sans-16-medium;
          }

          .total-tokens {
            line-height: 22px;

            @extend %face-sans-14-regular;
          }
        }
      }

      .switch {
        display: flex;
        align-items: center;
        background-color: variables.$color-black2;
        padding: 6px;
        border-radius: 12px;

        .circle {
          border-radius: 50%;
          width: 15px;
          height: 15px;
          background-color: variables.$color-gray-hover;
        }

        .text {
          padding: 0 4px;

          @extend %face-sans-14-medium;
        }
      }

      &.active {
        background-color: variables.$color-blue;

        .switch .circle {
          background-color: variables.$color-blue;
        }
      }

      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>
