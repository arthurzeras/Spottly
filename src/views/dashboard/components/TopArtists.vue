<template>
  <article class="top-artists">
    <div class="top-artists__loading fa-2x" v-if="loading">
      <span class="fas fa-spin fa-circle-notch" />
    </div>

    <div class="top-artists__error" v-else-if="error">
      <div>Opa, ocorreu algum erro ao carregar os artistas mais ouvidos</div>
      <button class="top-artists__error--button" @click="getTopArtists()">Tentar novamente</button>
    </div>

    <template v-else-if="artists.length">
      <header class="top-artists__header">
        <i class="fa fa-stream" />
        <h2 class="top-artists__header--title">Meus top artistas das últimas semanas</h2>
      </header>

      <div class="top-artists__list">
        <div class="top-artists__list--item" v-for="artist in artists" :key="artist.id">
          <img
            :alt="artist.name"
            class="top-artists__list--item__image"
            :src="getSmallestImage(artist.images)"
          />

          <span class="top-artists__list--item__name">{{ artist.name }}</span>
        </div>

        <router-link
          :to="{ name: 'Tops' }"
          class="top-artists__list--item top-artists__list--item__more"
        >
          <span class="fa fa-chevron-circle-right fa-2x"></span>

          <span class="top-artists__list--item__more-label">Ver Mais</span>
        </router-link>
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
  margin-top: 15px;
  padding: 20px 15px;
  border-radius: 20px;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.3);

  &__loading {
    text-align: center;
    color: var(--primary);
  }

  &__header {
    display: flex;
    margin-bottom: 20px;
    align-items: center;
    color: var(--neutral-2);

    &--title {
      line-height: 1;
      font-size: 1rem;
      margin: 0 0 0 10px;
      font-weight: normal;
    }
  }

  &__error,
  &__empty {
    text-align: center;
  }

  &__error {
    &--button {
      @include button();
      font-size: 0.9rem;
      padding: 5px 20px;
    }
  }

  &__list {
    display: flex;
    margin-left: -15px;
    margin-right: -15px;
    justify-content: center;

    &--item {
      padding: 0 15px 10px 15px;

      &__image {
        height: 100px;
        border-radius: 5px;
      }

      &__name {
        display: block;
        line-height: 1.2;
        font-size: 0.8rem;
      }

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
  }
}

@media (max-width: 768px) {
  .top-artists {
    &__list {
      &--item {
        width: 30%;
        flex: 0 0 30%;
        text-align: center;

        &__image {
          width: 100%;
          height: auto;
          border-radius: 5px;
        }
      }
    }
  }
}

@media (max-width: 375px) {
  .top-artists {
    &__list {
      &--item {
        font-size: 0.9rem;
        padding: 0 5px 2px 5px;

        &__more {
          .fa-2x {
            font-size: 1rem;
          }
        }
      }
    }
  }
}
</style>
