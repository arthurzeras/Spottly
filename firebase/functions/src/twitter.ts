import * as functions from 'firebase-functions';
import TwitterLite, { TwitterOptions } from 'twitter-lite';
import { TwitterCredentials, Artist, History } from './types';

export class Twitter {
  consumerKey: string;
  consumerSecret: string;

  constructor() {
    this.consumerKey = functions.config().twitter.key;
    this.consumerSecret = functions.config().twitter.secret;
  }

  private formatTweet(artists: Artist[]): string {
    if (!artists.length) return '';

    const base = (a: string = ''): string => (
      `Meus top artistas do Spotify nas últimas semanas:\n\n${a}\n\nvia #Spottly spott-ly.web.app`
    );

    const totalLen = artists.reduce(
      (len, artist) => {
        const quantity = artist.quantity !== undefined ? `(${artist.quantity})` : '';
        const total = len + `- ${artist.name} ${quantity}`.trim().length;
        return total;
      },
      base().length + artists.length - 1
    );

    if (totalLen > 280) {
      const greaterName = artists.reduce((_greater, { name }) => (
        _greater.length > name.length ? _greater : name
      ), '');

      const greater = artists.findIndex((artist) => artist.name === greaterName);

      artists[greater].name = `${greaterName.substring(0, greaterName.length - 4).trim()}...`;

      return this.formatTweet(artists);
    }

    const _artists = artists.map((artist) => {
      const quantity = artist.quantity > 0 ? `(${artist.quantity})` : '';
      return `- ${artist.name} ${quantity}`.trim();
    });

    return base(_artists.join('\n'));
  }

  postTweet(credentials: TwitterCredentials, artists: Artist[]) {
    const status = this.formatTweet(artists);

    if (!status) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Não há nenhum artista para ser postado'
      );
    }

    const options: TwitterOptions = {
      consumer_key: this.consumerKey,
      consumer_secret: this.consumerSecret,
      access_token_secret: credentials.secret,
      access_token_key: credentials.accessToken,
    };

    const client = new TwitterLite(options);

    return client.post('statuses/update', { status });
  }

  postTweetFromHistory(credentials: TwitterCredentials, history: History[]) {
    const countArtists = (_artists: Artist[], item: History) => {
      item.artists.forEach((itemArtist) => {
        const artistIndex = _artists.findIndex((i) => itemArtist === i.name);

        if (artistIndex !== -1) {
          _artists[artistIndex].quantity += 1;
        } else {
          _artists.push({ quantity: 1, name: itemArtist });
        }
      });

      return _artists;
    };

    const sortDesc = (a: Artist, b: Artist) => {
      if (a.quantity < b.quantity) return 1;
      if (a.quantity > b.quantity) return -1;
      return 0;
    };

    const artists: Artist[] = history.reduce(countArtists, []).sort(sortDesc).slice(0, 5);

    return this.postTweet(credentials, artists);
  }
}
