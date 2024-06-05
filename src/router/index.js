import { h } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';
import ExploreView from '../views/ExploreView.vue';
import SwapView from '../views/SwapView.vue';
import PoolView from '../views/PoolView.vue';
import ImportPool from '../views/ImportPool.vue';
import AddLiquidity from '../views/AddLiquidity.vue';
import RemoveLiquidity from '../views/RemoveLiquidity.vue';
import NotFound from '../views/NotFound.vue';
import TokenDetailView from '../views/TokenDetailView.vue';

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
    children: [
      {
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
      },
    ],
  },
  {
    path: '/explore',
    component: { render: () => h(RouterView) },
    children: [
      {
        path: '',
        name: 'explore',
        component: ExploreView,
      },
      {
        path: 'tokens',
        name: 'token-list',
        component: ExploreView,
      },
      {
        path: 'tokens/:id',
        name: 'token-detail',
        component: TokenDetailView,
      },
      {
        path: 'pools',
        name: 'pool-list',
        component: ExploreView,
      },
      {
        path: 'pools/:id',
        name: 'pool-detail',
        component: ExploreView,
      },
    ],
  },
  {
    path: '/404',
    name: 'not-found',
    component: NotFound,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
