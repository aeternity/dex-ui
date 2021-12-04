import { createRouter, createWebHistory } from 'vue-router';
import SwapView from '../views/SwapView.vue';
import PoolView from '../views/PoolView.vue';
import ImportPool from '../views/ImportPool.vue';
import AddLiquidity from '../views/AddLiquidity.vue';

const routes = [
  {
    path: '/swap',
    name: 'swap',
    component: SwapView,
  },
  {
    path: '/',
    redirect: '/swap',
  },
  {
    path: '/pool',
    name: 'pool',
    component: PoolView,
  },
  {
    path: '/pool/import',
    name: 'import-pool',
    component: ImportPool,
  },
  {
    path: '/pool/add',
    name: 'add-pool',
    component: AddLiquidity,
  },

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
