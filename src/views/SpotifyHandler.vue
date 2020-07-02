<template>
  <section class="spotify-handler">
    <h1>Um momento...</h1>
  </section>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'SpotifyHandler',

  mounted() {
    this.getSpotifyTokens();
  },

  methods: {
    ...mapActions(['ACTION_SET_SPOTIFY_ACCESS_TOKEN']),

    async getSpotifyTokens() {
      try {
        this.$root.$emit('Loader::show');

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

          this.ACTION_SET_SPOTIFY_ACCESS_TOKEN(data.access_token);

          this.$router.push({ name: 'Dashboard' });
        }
      } catch (error) {
        this.$router.push({ name: 'Dashboard', params: { error: error?.code } });
      } finally {
        this.$root.$emit('Loader::hide');
      }
    },
  },
};
</script>
