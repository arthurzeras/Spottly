<template>
  <section class="spotify-handler">
    <h1>Um momento...</h1>
  </section>
</template>

<script>
import services from '@/services';
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
        const { code } = this.$route.query;

        if (code) {
          const params = {
            code,
            grant_type: 'authorization_code',
            redirect_uri: `${window.location.origin}/spotify/callback`,
          };

          const { data } = await services.spotify.authorize(params);

          localStorage.setItem('spotify_token', data.access_token);
          localStorage.setItem('spotify_refresh', data.refresh_token);
          this.ACTION_SET_SPOTIFY_ACCESS_TOKEN(data.access_token);

          this.$router.push({ name: 'Dashboard' });
        }
      } catch (error) {
        // TODO error
        // eslint-disable-next-line no-console
        console.error(error);
      }
    },
  },
};
</script>
