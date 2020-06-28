import Vue from 'vue';
import store from '../store';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "Home" */ '../views/Home.vue'),
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "Dashboard" */ '../views/Dashboard.vue'),
  },
  {
    name: 'SpotifyCallback',
    path: '/spotify/callback',
    component: () => import(/* webpackChunkName: "Dashboard" */ '../views/SpotifyHandler.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.name === 'Dashboard' && !store.getters.isLogged) {
    return next({ name: 'Home' });
  }

  return next();
});

export default router;
