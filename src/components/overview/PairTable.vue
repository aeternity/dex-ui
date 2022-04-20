<template>
  <div class="pair-table">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>
            Pool
          </th>
          <th />
          <th>TVL</th>
          <th>Volume 24H</th>
          <th>Volume 7d</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(pair, index) of pairs"
          :key="`pair-${index}`"
          @click.prevent="$router.push({
            name: 'overview-pair-details', params: {
              address: pair.address
            }
          })"
        >
          <td>{{ index + 1 }}</td>
          <td colspan="2">
            <div class="pair">
              <img
                :src="pair.image ?? `https://avatars.z52da5wt.xyz/${pair.token0}`"
              >
              <img
                :src="pair.image ?? `https://avatars.z52da5wt.xyz/${pair.token1}`"
              >
              <div class="name">
                <span>
                  {{ tokens[pair.token0].name }} /
                </span>
                <span>
                  {{ tokens[pair.token1].name }}
                </span>
              </div>
            </div>
          </td>
          <td>$2.22k</td>
          <td>1.22%</td>
          <td>$4.22b</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { fetchJson } from '../../lib/utils';

export default {
  name: 'PairTable',
  props: {
    token: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      pairs: [],
      tokens: {},
    };
  },
  async mounted() {
    try {
      const [
        tokens,
        pairs,
      ] = await Promise.all([
        fetchJson('http://localhost:3000/tokens'),
        fetchJson('http://localhost:3000/pairs'),
      ]);

      const localTokens = {};
      tokens.forEach((token) => {
        localTokens[token.address] = token;
      });
      this.tokens = localTokens;

      if (this.token) {
        this.pairs = [
          ...pairs.filter((pair) => pair.token0 === this.token.address),
        ];
      } else {
        this.pairs = pairs;
      }

      console.info('========================');
      console.info('tokens ::', localTokens);
      console.info('========================');
    } catch (error) {
      //
    }
  },
};
</script>
<style lang="scss" scoped>
  @use '../../styles/variables.scss';
  @use '../../styles/typography.scss';

  .pair-table{
    background-color: variables.$color-black2;
    border-radius: 12px;
    padding: 12px;

    table {
      margin: 0;
      padding: 0;
      width: 100%;
      table-layout: fixed;

      th, td {
        padding: 10px;
      }

      .pair {
        display: inline-flex;
        align-items: center;

        .name {
          @extend %face-sans-16-regular;

          padding-right: 6px;
        }

        .symbol {
          @extend %face-sans-14-regular;

          color: variables.$color-gray2;
        }

        img {
          width: 28px;
          height: 28px;
          border-radius: 14px;
          margin-right: 8px;
        }
      }

      tbody tr:hover {
        background-color: variables.$color-black;
      }
    }

  @media screen and (max-width: 600px) {
    table {
      border: 0;
    }

    table caption {
      font-size: 1.3em;
    }

    table thead {
      border: none;
      clip: rect(0 0 0 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
    }

    table tr {
      border-bottom: 3px solid #ddd;
      display: block;
      margin-bottom: .625em;
    }

    table td {
      border-bottom: 1px solid #ddd;
      display: block;
      font-size: .8em;
      text-align: right;
    }

    table td::before {
      /*
      * aria-label has no advantage, it won't be read inside a table
      content: attr(aria-label);
      */
      content: attr(data-label);
      float: left;
      font-weight: bold;
      text-transform: uppercase;
    }

    table td:last-child {
      border-bottom: 0;
    }
  }

  }

</style>
