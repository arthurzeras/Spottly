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

    <article class="dashboard__top-artists" v-else>
      <div class="dashboard__top-artists-loading fa-2x" v-if="loading">
        <span class="fas fa-spin fa-circle-notch" />
      </div>

      <div class="dashboard__top-artists-error" v-if="error">
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
      </template>

      <div class="dashboard__top-artists-empty" v-else>
        <div>Poxa, não encontrei nenhum dado de artistas</div>
      </div>
    </article>
  </section>
</template>

<script>
import services from '@/services';
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'Dashboard',

  data: () => ({
    artists: [],
    error: false,
    loading: false,
    range: 'short_term',
  }),

  mounted() {
    this.getTopArtists();
    this.searchForErrors();
  },

  computed: {
    ...mapState(['user']),
    ...mapGetters(['isConnectedOnSpotify']),
  },

  methods: {
    spotifyAuth() {
      this.$root.$emit('Loader::show');

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

    searchForErrors() {
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
  justify-content: center;
  height: calc(100vh - 50px);

  &__connect-info {
    padding: 0 30px;
    text-align: center;
  }

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

  &__top-artists {
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
      padding: 0 5px;
    }

    &-list {
      width: 100vw;
      display: flex;
      overflow-x: auto;
    }

    &-item {
      padding: 0 5px 10px 5px;
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
  }
}

@media (min-width: 768px) {
  .dashboard {
    &__top-artists {
      &-title {
        padding: 0 15px;
        font-size: 1.5rem;
      }

      &-item {
        flex: 0 0 10%;
        padding: 0 15px 10px 15px;
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
