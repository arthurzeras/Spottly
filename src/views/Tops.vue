<template>
  <section class="tops">
    <h1>Meus top artistas</h1>

    <div class="tops__nav">
      <nav class="tops__nav-container">
        <button
          :key="range.code"
          v-html="range.text"
          v-for="range in ranges"
          class="tops__nav-item"
          @click="changeCurrentRange(range.code)"
          :class="{ 'tops__nav-item__active': range.code === currentRange }"
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
          v-for="item in rangesData[this.currentRange]"
        >
          <img
            width="50"
            :alt="item.name"
            :src="getSmallestImage(item.images)"
            class="tops__container-list__item-image"
          />

          <div class="tops__container-list__item-name">
            {{ item.name }}
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
    currentRange: 'short',
    ranges: [
      { code: 'short', text: '~ mês' },
      { code: 'medium', text: '~ 6 meses' },
      { code: 'long', text: '~ todo o tempo' },
    ],
    rangesData: {
      long: [],
      short: [],
      medium: [],
    },
  }),

  mounted() {
    this.getData();
  },

  methods: {
    async getData() {
      try {
        if (this.rangesData[this.currentRange].length) return;

        this.loading = true;

        const params = {
          limit: 50,
          time_range: `${this.currentRange}_term`,
        };

        const { data } = await services.spotify.topArtists(params);

        this.rangesData[this.currentRange] = data.items;
      } catch (error) {
        this.$root.$emit('Alert::show', 'Não foi possível carregar as informações');
      } finally {
        this.loading = false;
      }
    },

    changeCurrentRange(code) {
      this.currentRange = code;
      this.getData();
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

    &__container {
      width: 50%;
    }
  }
}
</style>
