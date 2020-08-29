import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as functions from 'firebase-functions';
import { SpotifyCredentials } from './types';

export interface AccessTokenParams {
  redirectUri: string,
  [code: string]: string,
}

export class Spotify {
  clientId: string;
  clientSecret: string;
  clientBasicToken: string;
  webService: AxiosInstance;
  accountService: AxiosInstance;
  userCredentials: SpotifyCredentials = {};

  constructor() {
    this.accountService = axios.create({
      baseURL: 'https://accounts.spotify.com/api/',
    });

    this.webService = axios.create({
      baseURL: 'https://api.spotify.com/v1/',
    });

    this.clientId = functions.config().spotify.id;
    this.clientSecret = functions.config().spotify.secret;
    this.clientBasicToken = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
  }

  async getAccessToken({ code, redirectUri }: AccessTokenParams) {
    this.accountService.defaults.headers = {
      Authorization: `Basic ${this.clientBasicToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const data = new URLSearchParams();

    data.append('code', code);
    data.append('redirect_uri', redirectUri);
    data.append('grant_type', 'authorization_code');

    return this.accountService.post('token', data);
  }

  async getRefreshedToken(refreshToken?: string) {
    const data = new URLSearchParams();
    data.append('grant_type', 'refresh_token');
    data.append('refresh_token', this.userCredentials.refreshToken || refreshToken || '');

    this.accountService.defaults.headers = {
      Authorization: `Basic ${this.clientBasicToken}`,
    };

    return this.accountService.post('token', data);
  }

  async getTopArtists(credentials: SpotifyCredentials): Promise<any> {
    this.userCredentials = credentials || {};

    try {
      const config: AxiosRequestConfig = {
        params: {
          limit: 5,
          time_range: 'short_term',
        },
      };

      const token = this.userCredentials.accessToken;

      this.webService.defaults.headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await this.webService.get('me/top/artists', config);

      return response;
    } catch (error) {
      if (error?.response?.status === 401) {
        const { data } = await this.getRefreshedToken();

        this.userCredentials.accessToken = data.access_token;

        return this.getTopArtists(this.userCredentials);
      }

      return Promise.reject(error);
    }
  }

  async getPlaybackHistory(credentials: SpotifyCredentials, timestampAfter: number|null): Promise<any> {
    this.userCredentials = credentials || {};

    try {
      const config: AxiosRequestConfig = {
        params: {
          limit: 50,
          after: timestampAfter,
        },
      };

      const token = this.userCredentials.accessToken;

      this.webService.defaults.headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await this.webService.get('me/player/recently-played', config);
      return response;
    } catch (error) {
      if (error?.response?.status === 401) {
        const { data } = await this.getRefreshedToken();

        this.userCredentials.accessToken = data.access_token;

        return this.getPlaybackHistory(this.userCredentials, timestampAfter);
      }

      return Promise.reject(error);
    }
  }
}
