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
export default {
  name: 'Genres',

  data: () => ({
    currentRange: 'short_term',
    ranges: [
      { code: 'short_term', text: '~ mês' },
      { code: 'medium_term', text: '~ 6 meses' },
      { code: 'long_term', text: '~ todo o tempo' },
    ],
  }),

  methods: {
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
