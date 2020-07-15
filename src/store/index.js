import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
    loader: false,
    userConfig: {},
    skipConfig: false,
    spotify: {
      accessToken: '',
    },
  },

  mutations: {
    SET_LOADER(state, payload) {
      state.loader = payload;
    },

    SET_USER(state, payload) {
      state.user = payload;
    },

    SET_SPOTIFY_ACCESS_TOKEN(state, payload) {
      state.spotify.accessToken = payload;
    },

    SET_USER_CONFIG(state, payload) {
      state.userConfig = payload;
    },

    SET_SKIP_CONFIG(state, payload) {
      state.skipConfig = payload;
    },
  },

  getters: {
    isLogged({ user }) {
      return !!user.uid;
    },

    isConnectedOnSpotify({ spotify }) {
      return !!spotify.accessToken;
    },

    isFirstConfig({ userConfig, skipConfig }) {
      return !skipConfig && !userConfig?.postDay && !userConfig?.twitterActive;
    },
  },

  actions,

  modules: {},
});
