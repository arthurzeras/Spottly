const axios = require('axios');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const localFunctions = require('./local-functions');

admin.initializeApp();

exports.spotifyAuthorize = functions.https.onCall(async (params) => {
  try {
    const data = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      data.append(key, params[key]);
    });

    const { id, secret } = functions.config().spotify;
    const clientCode = Buffer.from(`${id}:${secret}`).toString('base64');

    const payload = {
      data,
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization: `Basic ${clientCode}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const response = await axios(payload);

    return response.data;
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const code = status === 400 ? 'invalid-argument' : 'internal';
    const detail = error.response ? error.response.data.error : null;
    const message = error.response ? error.response.data.error_description : 'Internal Error';

    throw new functions.https.HttpsError(code, message, detail);
  }
});

exports.spotifyRefreshToken = functions.https.onCall(async (params) => {
  try {
    const data = await localFunctions.spotifyRefreshToken(params, functions.config().spotify);
    return data;
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const code = status === 400 ? 'invalid-argument' : 'internal';
    const detail = error.response ? error.response.data.error : null;
    const message = error.response ? error.response.data.error_description : 'Internal Error';

    throw new functions.https.HttpsError(code, message, detail);
  }
});

exports.postScheduler = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date().getDay();

  const ref = admin.database().ref('users');
  const snapshot = await ref.once('value');

  const users = snapshot.val();

  Object.keys(users).forEach(async (user) => {
    const current = users[user];

    if (current.twitterActive && days[today] === current.postDay) {
      try {
        const artists = await localFunctions.getSpotifyTopArtists(
          current,
          functions.config().spotify
        );

        const twitterConfig = {
          artists,
          credentials: {
            consumer_key: functions.config().twitter.key,
            consumer_secret: functions.config().twitter.secret,
            access_token_secret: current.credentials.twitter.secret,
            access_token_key: current.credentials.twitter.accessToken,
          },
        };

        await localFunctions.twitterPostTopArtists(twitterConfig);
      } catch (error) {
        console.log('Erro ao postar top artistas: ', error);
      }
    }
  });
});
