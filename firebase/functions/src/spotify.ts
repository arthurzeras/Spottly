import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as functions from 'firebase-functions';

export interface AccessTokenParams {
  redirectUri: string,
  [code: string]: string,
}

export class Spotify {
  clientId: string;
  clientSecret: string;
  service: AxiosInstance;
  clientBasicToken: string;

  constructor() {
    this.service = axios.create({
      baseURL: 'https://accounts.spotify.com/api/'
    });

    this.clientId = functions.config().spotify.id;
    this.clientSecret = functions.config().spotify.secret;
    this.clientBasicToken = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
  }

  private setHeaders(headers: any) {
    this.service.defaults.headers = headers;
  }

  async getAccessToken({ code, redirectUri }: AccessTokenParams): Promise<AxiosRequestConfig> {
    this.setHeaders({
      Authorization: `Basic ${this.clientBasicToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const data = new URLSearchParams();

    data.append('code', code);
    data.append('redirect_uri', redirectUri);
    data.append('grant_type', 'authorization_code');

    return this.service.post('token', data);
  }

  async getRefreshedToken(refreshToken: string): Promise<AxiosRequestConfig> {
    const data = new URLSearchParams();
    data.append('grant_type', 'refresh_token');
    data.append('refresh_token', refreshToken);

    this.setHeaders({
      Authorization: `Basic ${this.clientBasicToken}`,
    });

    return this.service.post('token', data);
  }
}
