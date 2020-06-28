/* eslint-disable import/prefer-default-export */

export const spotifyAuthorization = window.btoa(
  `${process.env.VUE_APP_SPOTIFY_CLIENT_ID}:${process.env.VUE_APP_SPOTIFY_CLIENT_SECRET}`
);
