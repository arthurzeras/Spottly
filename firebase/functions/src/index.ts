import * as functions from 'firebase-functions';

export const TypeScriptTest = functions.https.onCall((params) => {
  return params;
});
