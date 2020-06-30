const axios = require('axios');
const functions = require('firebase-functions');

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
