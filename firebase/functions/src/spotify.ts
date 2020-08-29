import axios, { AxiosInstance } from 'axios';
import * as functions from 'firebase-functions';

export interface AccessTokenParams {
  grant_type: string,
  redirect_uri: string,
  [code: string]: string,
}

export class Spotify {
  clientId: string;
  clientSecret: string;
  service: AxiosInstance;

  constructor() {
    this.service = axios.create({
      baseURL: 'https://accounts.spotify.com/api/'
    });

    this.clientId = functions.config().spotify.id;
    this.clientSecret = functions.config().spotify.secret;
  }

  private setHeaders(headers: any) {
    this.service.defaults.headers = headers;
  }

  async getAccessToken(payload: AccessTokenParams): Promise<any> {
    const clientCode = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    this.setHeaders({
      Authorization: `Basic ${clientCode}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const data = new URLSearchParams();

    Object.keys(payload).forEach((key) => data.append(key, payload[key]));

    return this.service.post('token', data);
  }
}
