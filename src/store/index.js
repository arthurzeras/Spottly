import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
  },

  mutations: {
    SET_USER(state, payload) {
      state.user = payload;
    },
  },

  getters: {
    isLogged({ user }) {
      return !!user.uid;
    },
  },

  actions: {
    ACTION_SET_USER({ commit }, payload) {
      commit('SET_USER', payload);
    },
  },

  modules: {},
});
