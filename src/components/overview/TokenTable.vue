<template>
  <div class="token-table">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
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
          <td>{{ token.id }}</td>
          <td>{{ token.name }}</td>
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
  @use '../../styles/variables.scss';
  @use '../../styles/typography.scss';

  .token-table{
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
