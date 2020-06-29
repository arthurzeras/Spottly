import axios from 'axios';
import { spotifyAuthorization } from './utils';

async function spotify() {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', localStorage.getItem('spotify_refresh'));

    const options = {
      headers: {
        Authorization: `Basic ${spotifyAuthorization}`,
      },
    };

    const { data } = await axios.post('https://accounts.spotify.com/api/token', params, options);

    localStorage.setItem('spotify_token', data.access_token);

    return Promise.resolve();
  } catch (error) {
    return Promise.reject();
  }
}

export default {
  spotify,
};
