const axios = require('axios');
const Twitter = require('twitter-lite');

async function spotifyRefreshToken(params, credentials) {
  try {
    const data = new URLSearchParams();
    data.append('grant_type', 'refresh_token');
    data.append('refresh_token', params.refreshToken);

    const { id, secret } = credentials;
    const clientCode = Buffer.from(`${id}:${secret}`).toString('base64');

    const payload = {
      data,
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization: `Basic ${clientCode}`,
      },
    };

    const response = await axios(payload);

    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getSpotifyTopArtists(user, credentials, updatedAccessToken = null) {
  const { accessToken, refreshToken } = user.credentials.spotify;

  try {
    const params = {
      url: 'https://api.spotify.com/v1/me/top/artists',
      params: {
        limit: 5,
        time_range: 'short_term',
      },
      headers: {
        Authorization: `Bearer ${updatedAccessToken || accessToken}`,
      },
    };

    const { data } = await axios(params);

    return Promise.resolve(data.items);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const data = await spotifyRefreshToken({ refreshToken }, credentials);
      return getSpotifyTopArtists(user, credentials, data.access_token);
    }

    return Promise.reject(error);
  }
}

async function twitterPostTopArtists(config) {
  try {
    const client = new Twitter(config.credentials);
    const artists = config.artists.map((a) => `- ${a.name}`).join('\n');

    await client.post('statuses/update', {
      status: `Meus top 5 artistas do Spotify na semana: \n${artists} \n via #Spottly`,
    });

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

module.exports = {
  spotifyRefreshToken,
  getSpotifyTopArtists,
  twitterPostTopArtists,
};
