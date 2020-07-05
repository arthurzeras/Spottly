<template>
  <section class="spotify-handler">
    <h1>Um momento...</h1>
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'SpotifyHandler',

  mounted() {
    this.getSpotifyTokens();
  },

  watch: {
    loader: {
      immediate: true,
      handler(state) {
        if (!state) {
          this.ACTION_SET_LOADER(true);
        }
      },
    },
  },

  computed: {
    ...mapState(['loader', 'user']),
  },

  methods: {
    ...mapActions(['ACTION_SET_SPOTIFY_ACCESS_TOKEN', 'ACTION_SET_LOADER']),

    async getSpotifyTokens() {
      try {
        const { code } = this.$route.query;

        if (code) {
          const params = {
            code,
            grant_type: 'authorization_code',
            redirect_uri: `${window.location.origin}/spotify/callback`,
          };

          const authorize = this.$firebase.functions().httpsCallable('spotifyAuthorize');

          const { data } = await authorize(params);

          localStorage.setItem('spotify_token', data.access_token);
          localStorage.setItem('spotify_refresh', data.refresh_token);

          const databaseRef = this.$firebase
            .database()
            .ref(`users/${this.user.uid}/credentials/spotify`);

          databaseRef.update({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          });

          this.ACTION_SET_SPOTIFY_ACCESS_TOKEN(data.access_token);

          this.$router.push({ name: 'Dashboard' });
        }
      } catch (error) {
        this.$router.push({ name: 'Dashboard', params: { error: error?.code } });
      } finally {
        this.ACTION_SET_LOADER(false);
      }
    },
  },

  destroyed() {
    this.ACTION_SET_LOADER(false);
  },
};
</script>
