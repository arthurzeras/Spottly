import axios from './axios';

const spotify = {
  topArtists: (params) =>
    axios({
      params,
      url: 'https://api.spotify.com/v1/me/top/artists',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('spotify_token')}`,
      },
    }),

  topTracks: (params) =>
    axios({
      params,
      url: 'https://api.spotify.com/v1/me/top/tracks',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('spotify_token')}`,
      },
    }),
};

export default {
  spotify,
};
