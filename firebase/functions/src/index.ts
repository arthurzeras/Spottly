import { Spotify } from './spotify';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const spotify = new Spotify();

/**
 * Retorna os tokens de acesso do Spotify.
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

    const status = error.response ? error.response.status : 500;
    const code = status === 400 ? 'invalid-argument' : 'internal';

    throw new functions.https.HttpsError(code, 'Erro interno');
  }
});

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
    const status = error.response ? error.response.status : 500;
    const code = status === 400 ? 'invalid-argument' : 'internal';

    throw new functions.https.HttpsError(code, error.message || 'Erro interno');
  }
})
