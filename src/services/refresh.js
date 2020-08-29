import { firebase } from '@/firebase';

async function spotify() {
  try {
    const refreshAction = firebase.functions().httpsCallable('spotifyRefreshToken');

    const { uid } = firebase.auth().currentUser;

    const { data } = await refreshAction({ uid });

    localStorage.setItem('spotify_token', data.access_token);

    return Promise.resolve(data.access_token);
  } catch (error) {
    return Promise.reject();
  }
}

export default {
  spotify,
};
