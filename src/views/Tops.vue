<template>
  <section class="tops">
    <div class="tops__type">
      <button
        class="tops__type-button"
        @click="filters.type = 'artists'"
        :class="{ active: filters.type === 'artists' }"
      >
        <span class="fa fa-guitar" />
        TOP ARTISTAS
      </button>
      <button
        class="tops__type-button"
        @click="filters.type = 'tracks'"
        :class="{ active: filters.type === 'tracks' }"
      >
        <span class="fa fa-music" />
        TOP MÚSICAS
      </button>
    </div>

    <div class="tops__nav">
      <nav class="tops__nav-container">
        <button
          :key="range.code"
          v-html="range.text"
          class="tops__nav-item"
          v-for="range in ranges"
          @click="filters.range = range.code"
          :class="{ 'tops__nav-item__active': range.code === filters.range }"
        />
      </nav>
    </div>

    <article class="tops__container">
      <div class="tops__container-loader fa-3x" v-if="loading">
        <span class="fas fa-spin fa-circle-notch" />
      </div>

      <ul class="tops__container-list">
        <li
          :key="item.id"
          class="tops__container-list__item"
          v-for="item in rangesData[filters.type][filters.range]"
        >
          <img
            width="50"
            :alt="item.name"
            v-if="filters.type === 'artists'"
            :src="getSmallestImage(item.images)"
            class="tops__container-list__item-image"
          />

          <div class="tops__container-list__item-name">
            <strong v-if="filters.type === 'tracks'">{{ item.artists[0].name }} - </strong>
            <span>{{ item.name }}</span>
          </div>
        </li>
      </ul>
    </article>
  </section>
</template>

<script>
import services from '@/services';

export default {
  name: 'Tops',

  data: () => ({
    loading: false,
    filters: {
      range: 'short',
      type: 'artists',
    },
    ranges: [
      { code: 'short', text: '~ mês' },
      { code: 'medium', text: '~ 6 meses' },
      { code: 'long', text: '~ todo o tempo' },
    ],
    rangesData: {
      artists: {
        long: [],
        short: [],
        medium: [],
      },
      tracks: {
        long: [],
        short: [],
        medium: [],
      },
    },
  }),

  watch: {
    filters: {
      deep: true,
      immediate: true,
      handler() {
        this.getData();
      },
    },
  },

  methods: {
    async getData() {
      try {
        if (this.rangesData[this.filters.type][this.filters.range].length) return;

        this.loading = true;

        const params = {
          limit: 50,
          time_range: `${this.filters.range}_term`,
        };

        const action = this.filters.type === 'artists' ? 'topArtists' : 'topTracks';

        const { data } = await services.spotify[action](params);

        this.rangesData[this.filters.type][this.filters.range] = data.items;
      } catch (error) {
        this.$root.$emit('Alert::show', 'Não foi possível carregar as informações');
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
.tops {
  padding: 0 15px;

  &__type {
    margin-top: 20px;
    margin-bottom: 20px;

    &-button {
      @include button();

      width: 50%;
      font-size: 1rem;
      color: var(--primary);
      background-color: transparent;
      border: 1px solid var(--primary);

      &:hover {
        color: var(--white);
        background-color: var(--primary);
      }

      &.active {
        color: var(--white);
        background-color: var(--primary);
      }

      &:last-child {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      &:first-child {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }

  &__nav {
    width: 100%;
    display: flex;
    justify-content: center;

    &-container {
      border-radius: 15px;
      background-color: var(--dark-2);
    }

    &-item {
      border: none;
      outline: none;
      font-size: 1rem;
      padding: 5px 15px;
      border-radius: 15px;
      color: var(--primary);
      background-color: transparent;

      &:nth-child(2) {
        margin: 0 10px;
      }

      &__active {
        color: var(--dark);
        background-color: var(--primary);
      }
    }
  }

  &__container {
    height: calc(100vh - 260px);

    &-loader {
      height: 100%;
      display: flex;
      align-items: center;
      color: var(--primary);
      justify-content: center;
    }

    &-list {
      height: 100%;
      padding-left: 0;
      overflow-y: auto;
      list-style: none;

      &__item {
        display: flex;
        margin-bottom: 5px;
        align-items: center;

        &-image {
          border-radius: 50px;
        }

        &-name {
          margin-left: 5px;
        }
      }
    }
  }
}

@media (min-width: 1024px) {
  .tops {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    &__type,
    &__container {
      width: 50%;
    }

    &__container {
      height: calc(100vh - 204px);
    }
  }
}

@media (min-width: 768px) {
  .tops {
    &__container {
      height: calc(100vh - 204px);
    }
  }
}
</style>
