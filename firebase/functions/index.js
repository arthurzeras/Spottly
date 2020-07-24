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

exports.postScheduler = functions.pubsub
  .schedule('0 20 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async () => {
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

exports.manuallyPostTweet = functions.https.onCall(async (params) => {
  try {
    const ref = admin.database().ref(`users/${params.uid}`);
    const snapshot = await ref.once('value');

    const user = snapshot.val();

    if (user.log && user.log.lastPostTime) {
      const now = Date.now();
      const lastPostTime = new Date(user.log.lastPostTime).getTime();

      if (now - lastPostTime < 900000) {
        throw new Error('failed-precondition');
      }
    }

    const artists = await localFunctions.getSpotifyTopArtists(
      user,
      functions.config().spotify
    );

    const twitterConfig = {
      artists,
      credentials: {
        consumer_key: functions.config().twitter.key,
        consumer_secret: functions.config().twitter.secret,
        access_token_secret: user.credentials.twitter.secret,
        access_token_key: user.credentials.twitter.accessToken,
      },
    };

    await localFunctions.twitterPostTopArtists(twitterConfig);

    await admin.database().ref(`users/${params.uid}/log`).update({
      lastPostTime: new Date().toISOString(),
    });
  } catch (error) {
    const code = error.message === 'failed-precondition' ? 'failed-precondition' : 'internal';
    const message =
      code === 'failed-precondition'
        ? 'Ops, você postou a pouco tempo, aguarde 15 minutos para postar novamente'
        : 'Desculpe, não foi possível publicar o tweet';

    throw new functions.https.HttpsError(code, message);
  }
});

exports.getStatus = functions.https.onCall(async (params) => {
  try {
    if (params.uid !== functions.config().admin.uid) throw new Error('failed-precondition');

    const ref = admin.database().ref('users');
    const snapshot = await ref.once('value');

    return snapshot.val();
  } catch (error) {
    const code = error.message === 'failed-precondition' ? 'failed-precondition' : 'internal';
    const message =
      code === 'failed-precondition'
        ? 'Você não tem permissão para executar essa ação'
        : 'Não foi possível executar essa ação';

    throw new functions.https.HttpsError(code, message);
  }
});
