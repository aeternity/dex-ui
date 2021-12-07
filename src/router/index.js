import { createRouter, createWebHistory } from 'vue-router';
import SwapView from '../views/SwapView.vue';
import ImportPool from '../views/ImportPool.vue';

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
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
  },
  {
    path: '/pool/import',
    name: 'import-pool',
    component: ImportPool,
  },

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
