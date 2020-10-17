<template>
  <article class="top-artists">
    <div class="top-artists-loading fa-2x" v-if="loading">
      <span class="fas fa-spin fa-circle-notch" />
    </div>

    <div class="top-artists-error" v-else-if="error">
      <div>Opa, ocorreu algum erro ao carregar os artistas mais ouvidos</div>
      <button class="button" @click="getTopArtists()">Tentar novamente</button>
    </div>

    <template v-else-if="artists.length">
      <h3 class="top-artists-title">Meus top artistas das últimas semanas</h3>

      <div class="top-artists-list">
        <div class="top-artists-item" v-for="artist in artists" :key="artist.id">
          <img
            :alt="artist.name"
            class="top-artists-image"
            :src="getSmallestImage(artist.images)"
          />

          <span class="top-artists-name">{{ artist.name }}</span>
        </div>

        <router-link :to="{ name: 'Tops' }" class="top-artists-item top-artists-item__more">
          <span class="fa fa-chevron-circle-right fa-2x"></span>

          <span class="top-artists-item__more-label">Ver Mais</span>
        </router-link>
      </div>

      <div class="top-artists-disclaimer">
        * Os dados são buscados do Spotify e exibidos na tela, o Spottly não mantém nenhum histórico
        próprio.
      </div>
    </template>

    <div class="top-artists-empty" v-else>
      <div>Poxa, não encontrei nenhum dado de artistas</div>
    </div>
  </article>
</template>

<script>
import services from '@/services';
import { mapGetters } from 'vuex';

export default {
  name: 'TopArtists',

  data: () => ({
    artists: [],
    error: false,
    loading: false,
    range: 'short_term',
  }),

  watch: {
    isConnectedOnSpotify: {
      immediate: true,
      handler(isConnected) {
        if (isConnected) {
          this.getTopArtists();
        }
      },
    },
  },

  computed: {
    ...mapGetters(['isConnectedOnSpotify']),
  },

  methods: {
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
.top-artists {
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

@media (max-width: 768px) {
  .top-artists {
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

@media (max-width: 375px) {
  .top-artists {
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
</style>
