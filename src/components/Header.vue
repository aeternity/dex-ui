<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="header">
    <div class="left">
      <span>DEX</span>
      <img src="../assets/ae.svg">
    </div>
    <NavigationMenu />
    <div class="right">
      <button class="connect-wallet">
        Connect Wallet
      </button>
      <ActionsMenu @click.stop>
        <template v-slot:display>
          <div class="more">
            •••
          </div>
        </template>
        <a href="https://aeternity.com/" target="_blank">
          About us
          <img src="../assets/ae.svg">
        </a>
      </ActionsMenu>
    </div>
  </div>
</template>

<script>
import ActionsMenu from './ActionsMenu.vue';
import NavigationMenu from './NavigationMenu.vue';

export default {
  components: {
    ActionsMenu,
    NavigationMenu,
  },
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;

  .left, .right {
    flex-grow: 1;
    flex-basis: 0;
    display: flex;
  }

  .left {
    justify-content: start;
    align-items: center;
    font-size: 24px;
    font-weight: 600;

    span {
      margin-right: 4px;
    }

    img {
      width: 24px;
      height: 24px;
    }
  }

  .right {
    justify-content: end;

    .account-info {
      display: flex;
      align-items: center;
      background-color: rgb(33, 36, 41);
      border-radius: 12px;
      margin-right: 10px;
      color: white;

      span {
        padding: 0 8px 0 12px;
        white-space: nowrap;
      }

      .address {
        display: flex;
        align-items: center;
        color: white;
        padding: 12px 10px;
        background-color: rgb(25, 27, 31);
        border-radius: 12px;
        border: 1px solid rgb(25, 27, 31);
        font-size: 16px;

        img {
          height: 16px;
          width: 16px;
        }
      }
    }

    .connect-wallet {
      padding: 8px;
      margin-right: 10px;
      border-radius: 12px;
      border: 1px solid rgba(21, 61, 111, 0.44);
      color: rgb(80, 144, 234);
      background-color: rgba(21, 61, 111, 0.44);
      cursor: pointer;
      white-space: nowrap;
      font-size: 16px;

      &:active {
        box-shadow: rgb(55 107 173 / 44%) 0px 0px 0px 1pt;
      }

      &:hover {
        border: 1px solid rgba(49, 95, 154, 0.44);
        color: rgb(57, 130, 231);
      }
    }

    .actions-menu {
      .more {
        color: white;
        padding: 10px 12px;
        cursor: pointer;
        border: 1px solid rgb(25, 27, 31);
        border-radius: 12px;
        background-color: rgb(25, 27, 31);

        &:hover {
          border-color: rgb(64, 68, 79);
        }
      }

      a {
        color: rgb(195, 197, 203);
        text-decoration: none;
        display: flex;
        justify-content: space-between;
        min-width: 200px;
        padding: 8px;

        &:hover {
          color: white;
        }

        img {
          height: 16px;
          width: 16px;
        }
      }
    }
  }

  @media (max-width: 480px) {
    .left span {
      display: none;
    }
  }
}
</style>
