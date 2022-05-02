<template>
  <div class="data-table">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>
            Pool
          </th>
          <th />
          <th>Total Supply</th>
          <th>Volume 24H</th>
          <th>Volume 7d</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(pair, index) of pairs"
          :key="`pair-${index}`"
          @click.prevent="$router.push({
            name: 'overview-pair-details',
            params: {
              address: pair.address
            }
          })"
        >
          <td>{{ index + 1 }}</td>
          <td colspan="2">
            <div class="token">
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
          <td>
            <div v-if="pair.pairToken && pair.pairToken.liquidityInfo">
              {{
                Number(
                  pair.pairToken.liquidityInfo.totalSupply / pair.pairToken.liquidityInfo.reserve0
                ).toFixed(5)
              }} %
            </div>
          </td>
          <td>
            <div v-if="pair.pairToken && pair.pairToken.liquidityInfo">
              {{
                Number(
                  pair.pairToken.liquidityInfo.totalSupply / pair.pairToken.liquidityInfo.reserve1
                ).toFixed(5)
              }} %
            </div>
          </td>
          <td>
            <!-- TODO -->
          </td>
        </tr>
      </tbody>
    </table>

    <pre>
      {{ pairs }}
    </pre>
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
          ...pairs.filter((pair) => (
            pair.token0 === this.token.address || pair.token1 === this.token.address
          )),
        ];

        const tokenPairs = await fetchJson(`http://localhost:3000/tokens/${this.token.address}/pairs`);

        this.pairs = this.pairs.map((pair) => {
          if (pair.token0 === this.token.address && tokenPairs.pairs0) {
            return {
              ...pair,
              pairToken: {
                ...tokenPairs.pairs0.find(
                  (p) => p.oppositeToken.address === pair.token1,
                ),
                token: this.token,
              },
            };
          }
          return pair;
        });

        // const liquidityTokenA = (amountTokenA * this.totalSupply) / this.reserveTokenA;

        console.info('========================');
        console.info('pairs ::', this.pairs);
        console.info('tokenPairs ::', tokenPairs);
        console.info('========================');
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
  @use '../../styles/analytics.scss';
</style>
