import * as admin from 'firebase-admin';

export async function clearHistoryFromLastWeek(uid: string) {
  if (!uid) return;

  const snapshot = await admin.database().ref(`history/${uid}`).once('value');
  const history = snapshot.val();

  const clearList = Object.keys(history)
    .filter((item) => Number(item) < Date.now())
    .map((item) => admin.database().ref(`history/${uid}/${item}`).set(null));

  return Promise.all(clearList);
}
