import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
    spotify: {
      accessToken: '',
    },
  },

  mutations: {
    SET_USER(state, payload) {
      state.user = payload;
    },

    SET_SPOTIFY_ACCESS_TOKEN(state, payload) {
      state.spotify.accessToken = payload;
    },
  },

  getters: {
    isLogged({ user }) {
      return !!user.uid;
    },

    isConnectedOnSpotify({ spotify }) {
      return !!spotify.accessToken;
    },
  },

  actions: {
    ACTION_SET_USER({ commit }, payload) {
      commit('SET_USER', payload);
    },

    ACTION_SET_SPOTIFY_ACCESS_TOKEN({ commit }, payload) {
      commit('SET_SPOTIFY_ACCESS_TOKEN', payload);
    },
  },

  modules: {},
});
