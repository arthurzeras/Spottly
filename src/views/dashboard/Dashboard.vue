<template>
  <section class="dashboard">
    <spotify-connect v-if="isConnectedOnSpotify" />

    <auto-post-config v-else-if="isFirstConfig" />

    <template v-else>
      <twitter-status @post-now="postCurrentTopArtists()" />

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

            <router-link
              :to="{ name: 'Tops' }"
              class="dashboard__top-artists-item dashboard__top-artists-item__more"
            >
              <span class="fa fa-chevron-circle-right fa-2x"></span>

              <span class="dashboard__top-artists-item__more-label">Ver Mais</span>
            </router-link>
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
import SpotifyConnect from './components/SpotifyConnect.vue';
import AutoPostConfig from './components/AutoPostConfig.vue';

export default {
  name: 'Dashboard',

  components: {
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
    this.getTopArtists();
    this.searchForRouteParams();
  },

  computed: {
    ...mapState(['user', 'userConfig']),
    ...mapGetters(['isConnectedOnSpotify', 'isFirstConfig']),
  },

  methods: {
    ...mapActions(['ACTION_SET_LOADER', 'ACTION_SET_USER_CONFIG']),

    async getTopArtists() {
      if (!this.isConnectedOnSpotify) return;

      try {
        this.error = false;
        this.loading = true;

        const params = {
          limit: 2,
          time_range: this.range,
        };

        const { data } = await services.spotify.topArtists(params);

        this.artists = data.items;
      } catch (error) {
        this.error = true;
      } finally {
        this.loading = false;
      }
    },

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
  overflow-y: auto;
  align-items: center;
  flex-direction: column;
  height: calc(100vh - 110px);
  justify-content: space-around;

  &__button {
    @include button();
  }

  &__top-artists {
    width: 100%;
    padding: 0 15px;
    margin-top: 15px;

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
      font-size: 1.5rem;
      text-align: center;
    }

    &-list {
      width: 100vw;
      display: flex;
      overflow-x: auto;
      margin-left: -15px;
      margin-right: -15px;
      justify-content: center;
    }

    &-item {
      padding: 0 15px 10px 15px;

      &__more {
        display: flex;
        align-items: center;
        color: var(--primary);
        flex-direction: column;
        text-decoration: none;
        justify-content: center;

        &-label {
          margin-top: 5px;
        }
      }
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
      text-align: center;
      font-size: 0.8rem;
      font-style: italic;
      color: var(--neutral-2);
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    &__top-artists {
      &-title {
        font-size: 1.2rem;
      }

      &-item {
        width: 30%;
        flex: 0 0 30%;
        text-align: center;
      }

      &-image {
        width: 100%;
        height: auto;
        border-radius: 5px;
      }
    }
  }
}

@media (max-width: 375px) {
  .dashboard {
    &__top-artists {
      padding: 0 5px;

      &-title {
        font-size: 1rem;
      }

      &-list {
        margin-left: -5px;
        margin-right: -5px;
      }

      &-item {
        font-size: 0.9rem;
        padding: 0 5px 2px 5px;

        &__more {
          .fa-2x {
            font-size: 1rem;
          }
        }
      }

      &-disclaimer {
        font-size: 0.7rem;
      }
    }
  }
}
</style>
