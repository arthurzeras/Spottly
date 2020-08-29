import { User } from './types';
import { Spotify } from './spotify';
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

export async function storePlaybackHistory(user: User): Promise<void> {
  const ref = admin.database().ref(`history/${user.uid}`);
  const historySnapshot = await ref.once('value');
  const keys = Object.keys(historySnapshot.val() || {});
  const timestampAfter = keys.length ? Number(keys[keys.length - 1]) : null;

  const spotify = new Spotify();

  const { data: history } = await spotify
    .getPlaybackHistory(user.credentials.spotify || {}, timestampAfter);

  const items = history.items
    .map((item: any) => ({
      track: item.track.name,
      playedAt: item.played_at,
      artists: item.track.artists.map((artist: any) => artist.name),
    }))
    .reduce((keyedItems: any, item: any) => {
      keyedItems[new Date(item.playedAt).getTime()] = item;
      return keyedItems;
    }, {});

  await ref.update(items);
}
