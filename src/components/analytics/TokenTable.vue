<template>
  <div class="data-table">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>
            Name
          </th>
          <th />
          <th>Price</th>
          <th>Price Change</th>
          <th>Volume 24H</th>
          <th>TVL</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(token, index) of tokens"
          :key="`token-${index}`"
          @click.prevent="$router.push({
            name: 'overview-token-details', params: {
              address: token.address
            }
          })"
        >
          <td>{{ index + 1 }}</td>
          <td colspan="2">
            <div class="token">
              <img
                :src="token.image ?? `https://avatars.z52da5wt.xyz/${token.address}`"
              >
              <div>
                <div class="name">
                  {{ token.name }}
                </div>
                <div class="symbol">
                  ({{ token.symbol }})
                </div>
              </div>
            </div>
          </td>
          <td>$2.22k</td>
          <td>1.22%</td>
          <td>$4.22b</td>
          <td>$2.18b</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { fetchJson } from '../../lib/utils';

export default {
  name: 'TokenTable',
  data() {
    return {
      tokens: [],
    };
  },
  async mounted() {
    try {
      const tokens = await fetchJson('http://localhost:3000/tokens');
      this.tokens = tokens;
      console.info('========================');
      console.info('tokens ::', tokens);
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
