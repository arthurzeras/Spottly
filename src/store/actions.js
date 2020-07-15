import { firebase } from '@/firebase';

const ACTION_SET_LOADER = ({ commit }, payload) => {
  commit('SET_LOADER', payload);
};

const ACTION_SET_USER = ({ commit }, payload) => {
  commit('SET_USER', payload);
};

const ACTION_SET_SPOTIFY_ACCESS_TOKEN = ({ commit }, payload) => {
  commit('SET_SPOTIFY_ACCESS_TOKEN', payload);
};

const ACTION_SET_SKIP_CONFIG = ({ commit }) => {
  commit('SET_SKIP_CONFIG', true);
};

const ACTION_SET_USER_CONFIG = async ({ commit, state }) => {
  try {
    const ref = firebase.database().ref(`users/${state.user.uid}`);
    const snapshot = await ref.once('value');

    commit('SET_USER_CONFIG', snapshot.val());

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

const ACTION_ACTIVATE_AUTO_POST = async ({ state, dispatch }, payload) => {
  try {
    const ref = firebase.database().ref(`users/${state.user.uid}`);

    await ref.update({
      twitterActive: true,
      postDay: payload.postDay,
    });

    await dispatch('ACTION_SET_USER_CONFIG');

    return Promise.resolve();
  } catch (error) {
    return Promise.error(error);
  }
};

export default {
  ACTION_SET_USER,
  ACTION_SET_LOADER,
  ACTION_SET_SKIP_CONFIG,
  ACTION_SET_USER_CONFIG,
  ACTION_ACTIVATE_AUTO_POST,
  ACTION_SET_SPOTIFY_ACCESS_TOKEN,
};
