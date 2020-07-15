const ACTION_SET_LOADER = ({ commit }, payload) => {
  commit('SET_LOADER', payload);
};

const ACTION_SET_USER = ({ commit }, payload) => {
  commit('SET_USER', payload);
};

const ACTION_SET_SPOTIFY_ACCESS_TOKEN = ({ commit }, payload) => {
  commit('SET_SPOTIFY_ACCESS_TOKEN', payload);
};

export default {
  ACTION_SET_USER,
  ACTION_SET_LOADER,
  ACTION_SET_SPOTIFY_ACCESS_TOKEN,
};
