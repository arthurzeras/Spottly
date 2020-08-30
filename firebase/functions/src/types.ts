export interface SpotifyCredentials {
  accessToken?: string;
  refreshToken?: string;
}

export interface TwitterCredentials {
  secret: string
  accessToken: string
}

export interface Artist {
  name: string
  quantity: number
}

export interface History {
  track: string,
  playedAt: string,
  artists: string[],
}

export interface User {
  uid?: string;
  postDay?: string;
  twitterActive: boolean;
  storeHistoryActivated?: boolean;

  log?: {
    lastPostTime: string;
  }

  credentials: {
    spotify?: SpotifyCredentials
    twitter: TwitterCredentials
  }

  metadata: {
    uid: string;
    photoURL: string;
    username: string;
    privderId: string;
    displayName: string;
  }
}
