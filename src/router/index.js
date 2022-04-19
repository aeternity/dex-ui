import { h } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';
import SwapView from '../views/SwapView.vue';
import PoolView from '../views/PoolView.vue';
import ImportPool from '../views/ImportPool.vue';
import AddLiquidity from '../views/AddLiquidity.vue';
import RemoveLiquidity from '../views/RemoveLiquidity.vue';
import OverViewLayout from '../components/overview/OverViewLayout.vue';
import Overview from '../views/overview/Overview.vue';
import TokenOverview from '../views/overview/TokenOverview.vue';
import TokenDetailView from '../views/overview/TokenDetailView.vue';
import PoolOverview from '../views/overview/PoolOverview.vue';

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
    },
    {
      path: 'remove/:id',
      name: 'remove-pool',
      component: RemoveLiquidity,
    }],
  },
  {
    path: '/overview',
    component: { render: () => h(OverViewLayout) },
    children: [
      {
        path: '',
        name: 'overview',
        component: Overview,
      },
      {
        path: 'pools',
        name: 'overview-pools',
        component: PoolOverview,
      },
      {
        path: 'tokens',
        name: 'overview-tokens',
        component: TokenOverview,
      },
      {
        path: 'tokens/:address',
        name: 'overview-token-details',
        component: TokenDetailView,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
