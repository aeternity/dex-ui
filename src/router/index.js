import { h } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';
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
    component: { render: () => h(RouterView) },
    children: [{
      path: '',
      name: 'pool',
      component: PoolView,
    },
    {
      path: 'import',
      name: 'import-pool',
      component: ImportPool,
    },
    {
      path: 'add',
      name: 'add-pool',
      component: AddLiquidity,
    }],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
