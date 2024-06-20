<template>
  <div>
    <div class="relative overflow-x-auto">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-400 uppercase">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              :class="{
                'px-6 py-4': true,
                'text-right': col.align === 'right',
              }"
            >
              <a
                v-if="col.sortable"
                class="cursor-pointer"
                @keydown="sortByColumn(col.key)"
                @click="sortByColumn(col.key)"
              >
                {{ col.label }}
              </a>
              <span v-else>{{ col.label }}</span>
              <span v-if="sortBy === col.key" class="ml-1">
                <span v-if="sortDirection === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in rowsPaginated" :key="d.id" class="border-b border-b-gray-700">
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              <TableCell :text="d[columns[0].key].text" :link="d[columns[0].key].link" />
            </th>
            <td
              v-for="(col, index) in nonHeaderColumns"
              :key="index"
              :class="{
                'px-6 py-4': true,
                'text-right': col.align === 'right',
              }"
            >
              <TableCell :text="d[col.key].text" :link="d[col.key].link" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="rows.length > pageSize" class="w-full">
      <div class="flex justify-end gap-2 md:gap-4 p-4">
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
    pageSize: {
      type: Number,
      default: 10,
    },
    initialSortBy: {
      type: String,
      default: null,
    },
    initialSortDirection: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      page: 0,
      sortBy: null,
      sortDirection: null,
    };
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    rowsSorted() {
      if (!this.sortBy) return this.rows;
      return this.rows.slice().sort((a, b) => {
        const aValue = this.tryParseInt(a[this.sortBy].value);
        const bValue = this.tryParseInt(b[this.sortBy].value);
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    },
    rowsPaginated() {
      return this.rowsSorted.slice(
        this.page * this.pageSize,
        this.page * this.pageSize + this.pageSize,
      );
    },
    lastPage() {
      return this.page * this.pageSize + this.pageSize >= this.rows.length;
    },
    nonHeaderColumns() {
      return this.columns.slice(1);
    },
  },
  mounted() {
    this.sortBy = this.initialSortBy;
    this.sortDirection = this.initialSortDirection;
  },
  methods: {
    tryParseInt(value) {
      if (value === undefined || value === null) return 0;
      const parsed = parseFloat(String(value).replace(/[$,]/g, ''));
      return Number.isNaN(parsed) ? 0 : parsed;
    },
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
      this.page = Math.floor(this.rows.length / this.pageSize);
    },
    sortByColumn(key) {
      if (this.sortBy === key) {
        if (this.sortDirection === 'desc') {
          this.sortDirection = 'asc';
        } else {
          this.sortBy = null;
          this.sortDirection = null;
        }
      } else {
        this.sortBy = key;
        this.sortDirection = 'desc';
      }
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
