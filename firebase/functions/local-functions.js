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

async function getSpotifyTopArtists(
  userCredentials,
  spotifyCredentials,
  updatedAccessToken = null
) {
  const { accessToken, refreshToken } = userCredentials;

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
      const data = await spotifyRefreshToken({ refreshToken }, spotifyCredentials);
      return getSpotifyTopArtists(userCredentials, spotifyCredentials, data.access_token);
    }

    return Promise.reject(error);
  }
}

async function twitterPostTopArtists(config) {
  try {
    // const client = new Twitter(config.credentials);
    const artists = config.artists.map((a) => `- ${a.name}`);

    // await client.post('statuses/update', {
    //   status: parseTweetString(artists),
    // });

    console.log(parseTweetString(artists));

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

function parseTweetString(artists) {
  const base = (a = '') =>
    `Meus top 5 artistas do Spotify nas últimas semanas:\n\n${a}\n\nvia #Spottly spott-ly.web.app`;

  const totalLen = artists.length - 1 + artists.reduce((a, c) => a + c.length, base().length);

  if (totalLen > 280) {
    const _artists = artists;
    const greater = _artists.reduce((a, c) => (a.length > c.length ? a : c), '');

    _artists[_artists.indexOf(greater)] = `${greater.substring(0, greater.length - 4).trim()}...`;

    return parseTweetString(_artists);
  }

  return base(artists.join('\n'));
}

module.exports = {
  spotifyRefreshToken,
  getSpotifyTopArtists,
  twitterPostTopArtists,
};
