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
          class="provider"
          @click.prevent="$store.commit('tokens/toggleProvider', provider)"
          @keydown.prevent="$store.commit('tokens/toggleProvider', provider)"
        >
          <div class="content">
            <div class="info">
              <div class="title">
                {{ provider.name }}
              </div>
              <div class="total-tokens">
                {{ provider.tokens.filter(t => t.networkId === activeNetwork.networkId).length }}
                {{ $t('tokens') }}
              </div>
            </div>
          </div>

          <div class="actions">
            <div :class="['switch', { active: provider.active }]">
              <div class="circle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
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
    padding: 16px 0;

    .provider {
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: variables.$color-white;

      .content {
        display: flex;
        align-items: center;

        .info {
          padding-left: 10px;
          text-align: left;

          .title {
            line-height: 22px;

            @extend %face-sans-18-medium;
          }

          .total-tokens {
            line-height: 18.2px;
            color: variables.$color-gray2;

            @extend %face-sans-14-regular;
          }
        }
      }

      .switch {
        display: flex;
        align-items: center;
        background-color: variables.$color-gray3;
        width: 47px;
        height: 26px;
        border-radius: 16px;
        padding: 3px;

        .circle {
          border-radius: 50%;
          width: 20px;
          height: 20px;
          background-color: variables.$color-white;
        }

        &.active {
          background-color: variables.$color-green;
          justify-content: flex-end;
        }
      }

      &:hover {
        cursor: pointer;
        background-color: variables.$color-black2;
      }
    }
  }
}
</style>
