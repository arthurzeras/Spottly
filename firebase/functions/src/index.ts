import { Spotify } from './spotify';
import { Twitter } from './twitter';
import { isBefore } from 'date-fns';
import * as admin from 'firebase-admin';
import { User, Artist, History } from './types';
import * as functions from 'firebase-functions';
import { clearHistoryFromLastWeek } from './general';

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
    const snapshot = await admin
      .database()
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
});

/**
 * Posta o tweet manualmente, com os dados do momento em que é chamada
 *
 * @params {
 *  @string uid
 * }
 */
export const manuallyPostTweet = functions.https.onCall(async (params) => {
  try {
    const snapshot = await admin.database().ref(`users/${params.uid}`).once('value');
    const user: User = snapshot.val();

    if (user?.log?.lastPostTime) {
      const now = Date.now();
      const lastPostTime = new Date(user.log.lastPostTime).getTime();

      if (now - lastPostTime < 900000) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Ops, você postou a pouco tempo, aguarde 15 minutos para postar novamente'
        );
      }
    }

    const hasSpotifyCredentials =
      Boolean(user?.credentials?.spotify?.accessToken) &&
      Boolean(user?.credentials?.spotify?.refreshToken);

    if (!hasSpotifyCredentials) {
      throw new functions.https.HttpsError(
        'not-found',
        'Não foi encontrado dados de conexão com o Spotify, conecte novamente.'
      );
    }

    const { data } = await spotify.getTopArtists(user.credentials.spotify || {});

    if (!data.items.length) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Você não tem registros de artistas ouvidos ultimamente'
      );
    }

    const artists: Artist[] = data.items.map((artist: any) => ({
      quantity: 0,
      name: artist.name,
    }));

    await twitter.postTweet(user.credentials.twitter, artists);

    await admin.database().ref(`users/${params.uid}/log`).update({
      lastPostTime: new Date().toISOString(),
    });
  } catch (error) {
    const code = error?.code || 'internal';
    const message = error?.message || 'Desculpe, não foi possível publicar o tweet';

    functions.logger.error('❌ manuallyPostTweet ❌ ', error.message, error);

    throw new functions.https.HttpsError(code, message);
  }
});

/**
 * Retorna o número de posts para cada dia da semana
 */
export const getPostCountByDays = functions.https.onCall(async () => {
  const snapshot = await admin.database().ref('users').once('value');
  const users: { [key: string]: User } = snapshot.val();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  return days.reduce(
    (_days, day) => ({
      ..._days,
      [day]: Object.keys(users).filter((uid) => users[uid].postDay === day).length,
    }),
    {}
  );
});

/**
 * Função somente para uso no ambiente de status (admin).
 * Retorna dados de todos os usuários cadastrados.
 *
 * @params {
 *  @string uid
 * }
 */
exports.getStatus = functions.https.onCall(async (params) => {
  try {
    if (params.uid !== functions.config().admin.uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Você não tem permissão para executar essa ação'
      );
    }

    const snapshot = await admin.database().ref('users').once('value');
    return snapshot.val();
  } catch (error) {
    const code = error?.code || 'internal';
    const message = error?.message || 'Não foi possível executar essa ação';

    functions.logger.error('❌ getStatus ❌ ', error.message, error);

    throw new functions.https.HttpsError(code, message);
  }
});

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
  // .https.onRequest(async (req, res) => {
  .runWith({ timeoutSeconds: 540 })
  .pubsub.schedule('0 12-23 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    const currentHour = new Date().getHours();

    // Compara a hora atual e usa uma lógica para separar os posts em blocos de 100
    // por hora de acordo com a preferência de hora. (menores primeiro)
    const hourMappingPreference: { [key: number]: number } = {
      20: 0,
      21: 1,
      22: 2,
      23: 3,
      12: 11,
      13: 10,
      14: 9,
      15: 8,
      16: 7,
      17: 6,
      18: 5,
      19: 4,
    };

    const snapshot = await admin
      .database()
      .ref('users')
      .orderByChild('postDay')
      .equalTo(days[today])
      .once('value');

    const users: { [key: string]: User } = snapshot.val();

    const usersToPostToday = Object.keys(users)
      .reduce((listUsers: User[], user: string) => {
        const current: User = users[user];
        current.createdAt = current.createdAt || new Date().toISOString();

        const hasSpotifyCredentials =
          Boolean(current?.credentials?.spotify?.accessToken) &&
          Boolean(current?.credentials?.spotify?.refreshToken);

        if (current.twitterActive && hasSpotifyCredentials) {
          listUsers.push({ ...current, uid: user });
        }

        return listUsers;
      }, [])
      .sort((a, b) => (isBefore(new Date(a.createdAt), new Date(b.createdAt)) ? -1 : 1))
      .slice(
        hourMappingPreference[currentHour] * 100,
        hourMappingPreference[currentHour] * 100 + 100
      );

    if (!usersToPostToday.length) {
      functions.logger.info('🤷‍♂️ postScheduler 🤷‍♂️ Sem nada para postar nesta hora!');
      return;
    }

    for (const user of usersToPostToday) {
      try {
        if (user.storeHistoryActivated) {
          const historySnapshot = await admin.database().ref(`history/${user.uid}`).once('value');

          if (!historySnapshot.val()) continue;

          const history: History[] = Object.keys(historySnapshot.val()).map(
            (key) => historySnapshot.val()[key]
          );

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

        await twitter.postTweet(user.credentials.twitter, artists);
      } catch (error) {
        const log = `❌ postScheduler ❌ | user: ${user.uid} | name: ${user.metadata.displayName} | `;
        functions.logger.error(log, error.message, error);
      }
    }

    functions.logger.log('✅ postScheduler ✅: Scheduler finalizado');
  });

/**
 * Scheduler para buscar o histórico de músicas ouvidas dos usuarios
 * com a opção storeHistoryActivated = true.
 *
 * Roda toda hora no minuto 58 de cada uma.
 */
// export const getHistoryScheduler = functions
//   // .https.onCall(async () => {
//   .runWith({ timeoutSeconds: 360, memory: '256MB' })
//   .pubsub.schedule('58 * * * *')
//   .timeZone('America/Sao_Paulo')
//   .onRun(async () => {
//     const snapshot = await admin.database().ref('users').once('value');
//     const users = snapshot.val();

//     const storeList = Object.keys(users)
//       .filter((user) => users[user].storeHistoryActivated)
//       .map((user) => storePlaybackHistory({ uid: user, ...users[user] }));

//     try {
//       await Promise.all(storeList);
//     } catch (error) {
//       functions.logger.error('❌ Get History Scheduler: ', error.message, error);
//     }
//   });
