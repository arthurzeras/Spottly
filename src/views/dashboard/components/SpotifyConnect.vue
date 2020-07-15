<template>
  <article class="spotify-connect">
    <h2>Olá, {{ user.displayName }}!</h2>

    <h3>Vamos começar?</h3>

    <p>Primeiro, conecte sua conta do Spotify ao Spottly</p>

    <button class="spotify-connect__button" @click="spotifyAuth()">
      Conectar ao Spotify
      <span class="fab fa-spotify" />
    </button>
  </article>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'SpotifyConnect',

  computed: {
    ...mapState(['user']),
  },

  methods: {
    ...mapActions(['ACTION_SET_LOADER']),

    spotifyAuth() {
      this.ACTION_SET_LOADER(true);

      const redirectURI = encodeURIComponent(`${window.location.origin}/spotify/callback`);

      let redirectURL = 'https://accounts.spotify.com/authorize';
      redirectURL += `?client_id=${process.env.VUE_APP_SPOTIFY_CLIENT_ID}`;
      redirectURL += '&scope=user-top-read';
      redirectURL += '&response_type=code';
      redirectURL += `&redirect_uri=${redirectURI}`;

      window.location.href = redirectURL;
    },
  },
};
</script>

<style lang="scss">
.spotify-connect {
  padding: 0 30px;
  text-align: center;

  &__button {
    @include button();
    margin-top: 10px;

    .fa-spotify {
      margin-left: 5px;
      color: var(--dark);
    }
  }
}
</style>
