import { Spotify } from './spotify';
import { Twitter } from './twitter';
import * as admin from 'firebase-admin';
import { User, Artist, History } from './types';
import * as functions from 'firebase-functions';
import { clearHistoryFromLastWeek, storePlaybackHistory } from './general';

admin.initializeApp();
const spotify = new Spotify();
const twitter = new Twitter();

/**
 * Busca os tokens de acesso do Spotify, salva no banco e os retorna.
 *
 * Ref: https://developer.spotify.com/documentation/general/guides/authorization-guide/
 *
 * @params {
 *  @string uid: Firebase id do usuário
 *  @string code: Código retornado do primeiro passo da autenticação
 *  @string redirectUri: URL de callback usada no primeiro passo da autenticação
 * }
 */
export const spotifyAuthorize = functions.https.onCall(async (params) => {
  try {
    const { uid } = params;

    delete params.uid;

    const { data } = await spotify.getAccessToken(params);

    await admin.database().ref(`users/${uid}/credentials/spotify`).update({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    });

    functions.logger.log('✅ spotifyAuthorize ✅');

    return data;
  } catch (error) {
    functions.logger.error('❌ spotifyAuthorize ❌', error.message, error);

    const status = error?.response?.status || 500;
    const code = status === 400 ? 'invalid-argument' : 'internal';

    throw new functions.https.HttpsError(code, 'Erro interno');
  }
});

/**
 * Busca o refresh token salvo no banco, faz o refresh, salva o novo access token e o retorna.
 *
 * Ref: https://developer.spotify.com/documentation/general/guides/authorization-guide/
 *
 * @params {
 *  @string uid: Firebase id do usuário
 * }
 */
export const spotifyRefreshToken = functions.https.onCall(async (params) => {
  try {
    const snapshot = await admin.database()
      .ref(`users/${params.uid}/credentials/spotify/refreshToken`)
      .once('value');

    const refreshToken = snapshot.val();

    if (!refreshToken) {
      throw new functions.https.HttpsError('invalid-argument', 'Refresh token inválido');
    }

    const { data } = await spotify.getRefreshedToken(refreshToken);

    await admin.database().ref(`users/${params.uid}/credentials/spotify`).update({
      accessToken: data.access_token,
    });

    functions.logger.log('✅ spotifyRefreshToken ✅');

    return data;
  } catch (error) {
    const status = error?.response?.status || 500;
    const code = status === 400 ? 'invalid-argument' : 'internal';

    throw new functions.https.HttpsError(code, error.message || 'Erro interno');
  }
})

/**
 * Scheduler que roda todo dia as 20 horas.
 * - Busca usuários no banco com a postagem automática ativada;
 * - Verifica se tem alguem com a postagem ativada para o dia atual;
 * - Verifica se existem as credenciais do Spotify salvas;
 * - Verifica se é para postar no modo History ou no modo Spotify;
 * - Tenta fazer a postagem de cada usuário;
 * - Se estiver no modo History, também remove o conteúdo da última semana;
 */
export const postScheduler = functions
  // .https.onCall(async () => {
  .runWith({ timeoutSeconds: 360 })
  .pubsub.schedule('0 20 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();

    const snapshot = await admin.database().ref('users').once('value');
    const users: { [key: string]: User } = snapshot.val();

    const usersToPostToday = Object.keys(users)
      .reduce((listUsers: User[], user: string) => {
        const current: User = users[user];

        const credentials = current?.credentials?.spotify || {};
        const hasSpotifyCredentials =
          Boolean(credentials.accessToken) && Boolean(credentials.refreshToken);

        if (current.twitterActive && days[today] === current.postDay && hasSpotifyCredentials) {
          listUsers.push({ ...current, uid: user });
        }

        return listUsers;
      }, []);

    if (!usersToPostToday.length) {
      return functions.logger.info('🤷‍♂️ postScheduler 🤷‍♂️ Sem nada para postar hoje!');
    }

    for (const user of usersToPostToday) {
      try {
        if (user.storeHistoryActivated) {
          const snapshot = await admin.database().ref(`history/${user.uid}`).once('value');

          if (!snapshot.val()) continue;

          const history: History[] = Object.keys(snapshot.val()).map((key) => snapshot.val()[key]);

          await twitter.postTweetFromHistory(user.credentials.twitter, history);
          await clearHistoryFromLastWeek(user.uid || '');
          continue;
        }

        const { data } = await spotify.getTopArtists(user.credentials.spotify || {});

        if (!data.items.length) continue;

        const artists: Artist[] = data.items.map((artist: any) => ({
          quantity: 0,
          name: artist.name,
        }));

        twitter.postTweet(user.credentials.twitter, artists);
      } catch (error) {
        const log = `❌ postScheduler ❌ | user: ${user.uid} | name: ${user.metadata.displayName} | `;
        functions.logger.error(log, error.message, error);
      }
    }

    functions.logger.log('✅ postScheduler ✅: Scheduler finalizado');
  })

export const getHistoryScheduler = functions
  // .https.onCall(async () => {
  .runWith({ timeoutSeconds: 360, memory: '256MB' })
  .pubsub.schedule('58 * * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async () => {
    const snapshot = await admin.database().ref('users').once('value');
    const users = snapshot.val();

    const storeList = Object.keys(users)
      .filter((user) => users[user].storeHistoryActivated)
      .map((user) => storePlaybackHistory({ uid: user, ...users[user] }));

    try {
      await Promise.all(storeList);
    } catch (error) {
      functions.logger.error('❌ Get History Scheduler: ', error.message, error);
    }
  });
