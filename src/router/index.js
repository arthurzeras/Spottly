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
    component: () => import(/* webpackChunkName: "Dashboard" */ '../views/dashboard/Dashboard.vue'),
  },
  {
    name: 'About',
    path: '/about',
    component: () => import(/* webpackChunkName: "About" */ '../views/About.vue'),
  },
  {
    name: 'SpotifyHandler',
    path: '/spotify/callback',
    component: () => import(/* webpackChunkName: "SpotifyHandler" */ '../views/SpotifyHandler.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const dontCameFromCallback = from?.name !== 'SpotifyCallback';

  if (to.name === 'Dashboard' && !store.getters.isLogged && dontCameFromCallback) {
    return next({ name: 'Home' });
  }

  return next();
});

export default router;
