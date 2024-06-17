<template>
  <div class="relative overflow-x-auto">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-400 uppercase">
        <tr>
          <th v-for="col in columns" :key="col.key" scope="col" class="px-6 py-3">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in dataPaginated" :key="d.id" class="border-b border-b-gray-700">
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            <TableCell :text="d[columns[0].key].text" :link="d[columns[0].key].link" />
          </th>

          <td v-for="(col, index) in nonHeaderColumns" :key="index" class="px-6 py-4">
            <TableCell :text="d[col.key].text" :link="d[col.key].link" />
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="rows.length > 10">
      <div class="flex justify-end gap-4 p-4">
        <ButtonDefault fill="transparent" :disabled="page === 0" @click="setFirstPage">
          First
        </ButtonDefault>
        <ButtonDefault fill="transparent" :disabled="page === 0" @click="prevPage">
          Previous
        </ButtonDefault>
        <div class="py-2 px-1">
          {{ page + 1 }}
        </div>
        <ButtonDefault fill="transparent" :disabled="lastPage" @click="nextPage">
          Next
        </ButtonDefault>
        <ButtonDefault fill="transparent" :disabled="lastPage" @click="setLastPage">
          Last
        </ButtonDefault>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonDefault from '@/components/ButtonDefault.vue';
import { mapGetters } from 'vuex';
import TableCell from '@/components/explore/TableCell.vue';

export default {
  name: 'BaseTable',
  components: { TableCell, ButtonDefault },
  props: {
    columns: {
      type: Array,
      required: true,
    },
    rows: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      page: 0,
    };
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    dataPaginated() {
      return this.rows.slice(this.page * 10, this.page * 10 + 10);
    },
    lastPage() {
      return this.page * 10 + 10 >= this.rows.length;
    },
    nonHeaderColumns() {
      return this.columns.slice(1);
    },
  },
  methods: {
    nextPage() {
      if (!this.lastPage) this.page += 1;
    },
    prevPage() {
      if (this.page > 0) this.page -= 1;
    },
    setFirstPage() {
      this.page = 0;
    },
    setLastPage() {
      this.page = Math.floor(this.rows.length / 10);
    },
  },
};
</script>

<style scoped lang="scss">
.button-default {
  padding: 8px 16px;
  font-size: 16px;
}
</style>
