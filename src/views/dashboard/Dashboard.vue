<template>
  <section class="dashboard">
    <spotify-connect v-if="!isConnectedOnSpotify" />

    <auto-post-config v-else-if="isFirstConfig" />

    <template v-else>
      <h1>Olá, {{ user.displayName }}</h1>

      <twitter-status @post-now="postCurrentTopArtists()" />

      <top-artists />
    </template>
  </section>
</template>

<script>
import TopArtists from './components/TopArtists.vue';
import { mapState, mapGetters, mapActions } from 'vuex';
import TwitterStatus from './components/TwitterStatus.vue';
import SpotifyConnect from './components/SpotifyConnect.vue';
import AutoPostConfig from './components/AutoPostConfig.vue';

export default {
  name: 'Dashboard',

  components: {
    TopArtists,
    TwitterStatus,
    SpotifyConnect,
    AutoPostConfig,
  },

  data: () => ({
    artists: [],
    error: false,
    loading: false,
    range: 'short_term',
  }),

  mounted() {
    this.getUserConfig();
    this.searchForRouteParams();
  },

  computed: {
    ...mapState(['user', 'userConfig']),
    ...mapGetters(['isConnectedOnSpotify', 'isFirstConfig']),
  },

  methods: {
    ...mapActions(['ACTION_SET_LOADER', 'ACTION_SET_USER_CONFIG']),

    async getUserConfig() {
      try {
        this.ACTION_SET_LOADER(true);

        await this.ACTION_SET_USER_CONFIG();
      } catch (error) {
        this.$root.$emit(
          'Alert::show',
          'Ops, não consegui buscar suas configurações, tente atualizar a página'
        );
      } finally {
        this.ACTION_SET_LOADER(false);
      }
    },

    async postCurrentTopArtists() {
      try {
        this.ACTION_SET_LOADER(true);

        const postFunction = this.$firebase.functions().httpsCallable('manuallyPostTweet');
        const params = {
          uid: this.user.uid,
          artists: this.artists.slice(0, 5),
        };

        await postFunction(params);

        this.$root.$emit('Alert::show', 'Tweet postado com sucesso', 'success');
      } catch (error) {
        const type = !error?.message || error?.message === 'internal' ? 'error' : 'warn';
        const message =
          !error?.message || error?.message === 'internal'
            ? 'Desculpe, não foi possível publicar o tweet'
            : error.message;

        this.$root.$emit('Alert::show', message, type);
      } finally {
        this.ACTION_SET_LOADER(false);
      }
    },

    searchForRouteParams() {
      if (Object.prototype.hasOwnProperty.call(this.$route.params, 'error')) {
        const message =
          this.$route.params.error === 'invalid-argument'
            ? 'Poxa, não consegui encontrar seus dados no spotify dessa vez, pode tentar novamente?'
            : 'Poxa, estou com algum problema de comunicação com o Spotify, pode tentar novamente?';

        this.$root.$emit('Alert::show', message);
      }
    },
  },
};
</script>

<style lang="scss">
.dashboard {
  display: flex;
  padding: 0 15px;
  overflow-y: auto;
  flex-direction: column;
  height: calc(100vh - 110px);

  &__button {
    @include button();
  }
}
</style>
