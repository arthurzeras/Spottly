<template>
  <section class="genres">
    <h1>Meus estilos preferidos</h1>

    <div class="genres__nav">
      <nav class="genres__nav-container">
        <button
          :key="range.code"
          v-html="range.text"
          v-for="range in ranges"
          class="genres__nav-item"
          @click="changeCurrentRange(range.code)"
          :class="{ 'genres__nav-item__active': range.code === currentRange }"
        />
      </nav>
    </div>
  </section>
</template>

<script>
import services from '@/services';

export default {
  name: 'Genres',

  data: () => ({
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

        this.getGenresFromData(data.items);
      } catch (error) {
        console.log(error);
        this.$root.$emit('Alert::show', 'Não foi possível carregar as informações');
      } finally {
        this.loading = false;
      }
    },

    getGenresFromData(items) {
      const reducer = (total, current) => {
        const _total = total;

        current.genres.forEach((genre) => {
          const index = total.findIndex((i) => i.genre === genre);

          if (index === -1) {
            return _total.push({ genre, total: 1 });
          }

          _total[index].total += 1;
        });

        return _total;
      };

      const sorter = (a, b) => {
        if (a.total < b.total) return 1;
        if (a.total > b.total) return -1;
        return 0;
      };

      const addPercent = (genre, index, arr) => {
        const total = arr.reduce((a, c) => {
          const _a = a + c.total;
          return _a;
        }, 0);

        return {
          ...genre,
          percent: +((genre.total / total) * 100).toFixed(2),
        };
      };

      const genres = items.reduce(reducer, []).sort(sorter).map(addPercent).splice(0, 30);

      console.log(genres);
    },

    changeCurrentRange(code) {
      this.currentRange = code;
    },
  },
};
</script>

<style lang="scss">
.genres {
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
}
</style>
