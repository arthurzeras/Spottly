<template>
  <section class="dashboard">
    <h2>Olá, {{ user.displayName }}!</h2>

    <p>Conecte sua conta do Spotify ao Spottly para iniciar</p>

    <button class="dashboard__button" @click="spotifyAuth()">
      Conectar ao Spotify
      <span class="fab fa-spotify" />
    </button>
  </section>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Dashboard',

  computed: {
    ...mapState(['user']),
  },

  methods: {
    spotifyAuth() {
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
.dashboard {
  width: 100%;
  display: flex;
  padding: 0 30px;
  text-align: center;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  height: calc(100vh - 50px);

  &__button {
    border: none;
    outline: none;
    cursor: pointer;
    transition: 0.4s;
    margin-top: 20px;
    font-size: 1.2rem;
    padding: 5px 30px;
    color: var(--white);
    border-radius: 30px;
    background-color: var(--primary);

    &:hover {
      background-color: var(--p-hover);
    }

    .fa-spotify {
      margin-left: 5px;
      color: var(--dark);
    }
  }
}
</style>
