import { firebase } from '@/firebase';

const ACTION_SET_LOADER = ({ commit }, payload) => {
  commit('SET_LOADER', payload);
};

const ACTION_SET_USER = ({ commit }, payload) => {
  commit('SET_USER', payload);
};

const ACTION_SET_SPOTIFY_ACCESS_TOKEN = ({ commit }, payload) => {
  commit('SET_SPOTIFY_ACCESS_TOKEN', payload);
  localStorage.setItem('spotify_token', payload);
};

const ACTION_SET_SKIP_CONFIG = ({ commit }) => {
  commit('SET_SKIP_CONFIG', true);
};

const ACTION_SET_USER_CONFIG = async ({ commit, state }) => {
  try {
    let user = {};
    const firestoreRef = firebase.firestore().collection('users');
    const document = await firestoreRef.doc(state.user.uid).get();

    if (!document.exists) {
      commit('SET_HAS_FIRESTORE', false);
      const ref = firebase.database().ref(`users/${state.user.uid}`);
      const snapshot = await ref.once('value');
      user = snapshot.val();
    }

    if (document.exists) {
      commit('SET_HAS_FIRESTORE', true);
      user = document.data();
    }

    commit('SET_USER_CONFIG', user);

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

const ACTION_ACTIVATE_AUTO_POST = async ({ state, dispatch }, payload) => {
  try {
    if (state.hasFirestore) {
      const ref = firebase.firestore().collection('users').doc(state.user.uid);

      await ref.update({
        twitterActive: true,
        postDay: payload.postDay,
      });
    }

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

const ACTION_LOGOUT_SPOTIFY = async ({ state, commit }) => {
  localStorage.removeItem('spotify_token');
  localStorage.removeItem('spotify_refresh');

  commit('SET_SPOTIFY_ACCESS_TOKEN', '');

  if (state.hasFirestore) {
    const firestoreRef = firebase.firestore().collection('users').doc(state.user.uid);

    await firestoreRef.set(
      {
        credentials: {
          spotify: {
            accessToken: '',
            refreshToken: '',
          },
        },
      },
      {
        merge: true,
      }
    );
  }

  const ref = firebase.database().ref(`users/${state.user.uid}/credentials/spotify`);

  return ref.update({
    accessToken: '',
    refreshToken: '',
  });
};

export default {
  ACTION_SET_USER,
  ACTION_SET_LOADER,
  ACTION_LOGOUT_SPOTIFY,
  ACTION_SET_SKIP_CONFIG,
  ACTION_SET_USER_CONFIG,
  ACTION_ACTIVATE_AUTO_POST,
  ACTION_SET_SPOTIFY_ACCESS_TOKEN,
};
