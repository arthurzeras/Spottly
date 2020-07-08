<template>
  <section class="dashboard">
    <article class="dashboard__connect-info" v-if="!isConnectedOnSpotify">
      <h2>Olá, {{ user.displayName }}!</h2>

      <p>Conecte sua conta do Spotify ao Spottly para iniciar</p>

      <button class="dashboard__button" @click="spotifyAuth()">
        Conectar ao Spotify
        <span class="fab fa-spotify" />
      </button>
    </article>

    <template v-else>
      <twitter-status @postNow="postCurrentTopArtists()" />

      <article class="dashboard__top-artists">
        <div class="dashboard__top-artists-loading fa-2x" v-if="loading">
          <span class="fas fa-spin fa-circle-notch" />
        </div>

        <div class="dashboard__top-artists-error" v-else-if="error">
          <div>Opa, ocorreu algum erro ao carregar os artistas mais ouvidos</div>
          <button class="dashboard__button" @click="getTopArtists()">Tentar novamente</button>
        </div>

        <template v-else-if="artists.length">
          <h3 class="dashboard__top-artists-title">Meus top artistas das últimas semanas</h3>

          <div class="dashboard__top-artists-list">
            <div class="dashboard__top-artists-item" v-for="artist in artists" :key="artist.id">
              <img
                :alt="artist.name"
                class="dashboard__top-artists-image"
                :src="getSmallestImage(artist.images)"
              />

              <span class="dashboard__top-artists-name">{{ artist.name }}</span>
            </div>
          </div>

          <div class="dashboard__top-artists-disclaimer">
            * Os dados são buscados do Spotify e exibidos na tela, o Spottly não mantém nenhum
            histórico próprio.
          </div>
        </template>

        <div class="dashboard__top-artists-empty" v-else>
          <div>Poxa, não encontrei nenhum dado de artistas</div>
        </div>
      </article>
    </template>
  </section>
</template>

<script>
import services from '@/services';
import { mapState, mapGetters, mapActions } from 'vuex';
import TwitterStatus from './components/TwitterStatus.vue';

export default {
  name: 'Dashboard',

  components: {
    TwitterStatus,
  },

  data: () => ({
    artists: [],
    error: false,
    loading: false,
    range: 'short_term',
  }),

  mounted() {
    this.getTopArtists();
    this.searchForRouteParams();
  },

  computed: {
    ...mapState(['user']),
    ...mapGetters(['isConnectedOnSpotify']),
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

    async getTopArtists() {
      if (!this.isConnectedOnSpotify) return;

      try {
        this.error = false;
        this.loading = true;

        const params = {
          limit: 10,
          time_range: this.range,
        };

        const { data } = await services.spotify.topArtists(params);

        this.artists = data.items;
      } catch (error) {
        // TODO error
        // eslint-disable-next-line no-console
        console.error(error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },

    async postCurrentTopArtists() {
      try {
        this.ACTION_SET_LOADER(true);

        const postFunction = this.$firebase.functions().httpsCallable('twitterPostTopArtists');
        const params = {
          uid: this.user.uid,
          artists: this.artists.slice(0, 5),
        };

        await postFunction(params);

        this.$root.$emit('Alert::show', 'Tweet postado com sucesso');
      } catch (error) {
        const message =
          !error?.message || error?.message === 'internal'
            ? 'Desculpe, não foi possível publicar o tweet'
            : error.message;

        this.$root.$emit('Alert::show', message);
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

    getSmallestImage(images) {
      const { url } = images.reduce(
        (smallest, current) => (smallest.width > current.width ? current : smallest),
        { width: 1000 }
      );

      return url;
    },
  },
};
</script>

<style lang="scss">
.dashboard {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  height: calc(100vh - 50px);
  justify-content: space-around;

  &__connect-info {
    padding: 0 30px;
    text-align: center;
  }

  &__button {
    @include button();

    .fa-spotify {
      margin-left: 5px;
      color: var(--dark);
    }
  }

  &__top-artists {
    width: 100%;
    padding: 0 15px;

    &-loading {
      text-align: center;
      color: var(--primary);
    }

    &-error,
    &-empty {
      text-align: center;
    }

    &-title {
      margin: 0;
    }

    &-list {
      width: 100vw;
      display: flex;
      overflow-x: auto;
      margin-left: -15px;
      margin-right: -15px;
    }

    &-item {
      padding: 0 15px 10px 15px;
    }

    &-image {
      height: 100px;
      border-radius: 5px;
    }

    &-name {
      display: block;
      line-height: 1.2;
      font-size: 0.8rem;
    }

    &-disclaimer {
      font-size: 0.8rem;
      font-style: italic;
      color: var(--neutral-2);
    }
  }
}

@media (min-width: 768px) {
  .dashboard {
    &__top-artists {
      &-title {
        font-size: 1.5rem;
      }

      &-item {
        flex: 0 0 10%;
      }

      &-image {
        width: 100%;
        height: auto;
        border-radius: 5px;
      }
    }
  }
}
</style>
