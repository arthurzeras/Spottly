import { firebase } from '@/firebase';

async function spotify() {
  try {
    const refreshToken = localStorage.getItem('spotify_refresh');

    if (!refreshToken) throw new Error();

    const refreshAction = firebase.functions().httpsCallable('spotifyRefreshToken');

    const { data } = await refreshAction({ refreshToken });

    localStorage.setItem('spotify_token', data.access_token);

    return Promise.resolve();
  } catch (error) {
    return Promise.reject();
  }
}

export default {
  spotify,
};
