import { Spotify } from './spotify';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const spotify = new Spotify();

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
    functions.logger.error('❌ spotifyAuthorize ❌', error);

    const status = error.response ? error.response.status : 500;
    const code = status === 400 ? 'invalid-argument' : 'internal';

    throw new functions.https.HttpsError(code, 'Erro interno');
  }
});
