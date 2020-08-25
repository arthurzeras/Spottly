const axios = require('axios');
const Twitter = require('twitter-lite');

async function spotifyRefreshToken(refreshToken, credentials) {
  try {
    const data = new URLSearchParams();
    data.append('grant_type', 'refresh_token');
    data.append('refresh_token', refreshToken);

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
      const data = await spotifyRefreshToken(refreshToken, spotifyCredentials);
      return getSpotifyTopArtists(userCredentials, spotifyCredentials, data.access_token);
    }

    return Promise.reject(error);
  }
}

async function getPlaybackHistory(
  timestampAfter,
  userCredentials,
  spotifyCredentials,
  updatedAccessToken = null
) {
  const { accessToken, refreshToken } = userCredentials;

  try {
    const params = {
      url: 'https://api.spotify.com/v1/me/player/recently-played',
      params: {
        limit: 50,
        after: timestampAfter,
      },
      headers: {
        Authorization: `Bearer ${updatedAccessToken || accessToken}`,
      },
    };

    const { data } = await axios(params);

    return Promise.resolve(data);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const data = await spotifyRefreshToken(refreshToken, spotifyCredentials);
      return getPlaybackHistory(
        timestampAfter,
        userCredentials,
        spotifyCredentials,
        data.access_token
      );
    }

    return Promise.reject(error);
  }
}

async function storePlaybackHistory({ uid, credentials, spotifyCredentials, admin }) {
  try {
    /*
      Get current history stored on database
      and get the last timestamp to use as filter in spotify request.
    */
    const historySnapshot = await admin.database().ref(`history/${uid}`).once('value');
    const keys = Object.keys(historySnapshot.val() || {});
    const timestampAfter = keys.length ? keys[keys.length - 1] : null;

    // Get playback history
    const history = await getPlaybackHistory(timestampAfter, credentials, spotifyCredentials);

    const items = history.items
      .map((item) => ({
        track: item.track.name,
        playedAt: item.played_at,
        artists: item.track.artists.map((artist) => artist.name),
      }))
      .reduce((keyedItems, item) => {
        keyedItems[new Date(item.playedAt).getTime()] = item;
        return keyedItems;
      }, {});

    await admin.database().ref(`history/${uid}`).update(items);

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

async function clearHistoryFromLastWeek(userId, admin) {
  const snapshot = await admin.database().ref(`history/${userId}`).once('value');
  const history = snapshot.val();

  const clearList = Object.keys(history)
    .filter((item) => Number(item) < Date.now())
    .map((item) => admin.database().ref(`history/${userId}/${item}`).set(null));

  return Promise.all(clearList);
}

async function twitterPostTopArtists(config) {
  try {
    const client = new Twitter(config.credentials);
    const artists = config.artists.map((a) => `- ${a.name}`);

    await client.post('statuses/update', {
      status: parseTweetString(artists),
    });

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

async function postTweetByHistory({ uid, admin, credentials }) {
  const snapshot = await admin.database().ref(`history/${uid}`).once('value');
  const history = snapshot.val();

  const artists = Object.keys(history)
    .reduce((artists, item) => {
      const obj = history[item];

      obj.artists.forEach((itemArtist) => {
        const artistIndex = artists.findIndex((i) => itemArtist === i.name);

        if (artistIndex !== -1) {
          artists[artistIndex].quantity += 1;
        } else {
          artists.push({
            quantity: 1,
            name: itemArtist,
          });
        }
      });

      return artists;
    }, [])
    .sort((a, b) => {
      if (a.quantity < b.quantity) return 1;
      if (a.quantity > b.quantity) return -1;
      return 0;
    })
    .slice(0, 5);

  return twitterPostTopArtists({
    credentials,
    artists: artists.map((artist) => `${artist.name} (${artist.quantity})`),
  });
}

function emulateDelay(ms = 2000) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

module.exports = {
  emulateDelay,
  getPlaybackHistory,
  postTweetByHistory,
  spotifyRefreshToken,
  getSpotifyTopArtists,
  storePlaybackHistory,
  twitterPostTopArtists,
  clearHistoryFromLastWeek,
};
