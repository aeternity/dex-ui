import { h } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';
import SwapView from '../views/SwapView.vue';
import PoolView from '../views/PoolView.vue';
import ImportPool from '../views/ImportPool.vue';
import AddLiquidity from '../views/AddLiquidity.vue';
import RemoveLiquidity from '../views/RemoveLiquidity.vue';
import AnalyticsLayout from '../components/analytics/AnalyticsLayout.vue';
import Overview from '../views/analytics/Overview.vue';
import TokenOverview from '../views/analytics/TokenOverview.vue';
import TokenDetailView from '../views/analytics/TokenDetailView.vue';
import PoolOverview from '../views/analytics/PoolOverview.vue';

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
    path: '/analytics',
    component: { render: () => h(AnalyticsLayout) },
    children: [
      {
        path: '',
        name: 'analytics',
        component: Overview,
      },
      {
        path: 'pools',
        name: 'analytics-pools',
        component: PoolOverview,
      },
      {
        path: 'tokens',
        name: 'analytics-tokens',
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
