import axios from 'axios';

const spotifyAuthorization = window.btoa(
  `${process.env.VUE_APP_SPOTIFY_CLIENT_ID}:${process.env.VUE_APP_SPOTIFY_CLIENT_SECRET}`
);

const spotify = {
  authorize: (params) => {
    const data = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      data.append(key, params[key]);
    });

    return axios({
      data,
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization: `Basic ${spotifyAuthorization}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  topArtists: (params) =>
    axios({
      params,
      url: 'https://api.spotify.com/v1/me/top/artists',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('spotify_token')}`,
      },
    }),
};

export default {
  spotify,
};
