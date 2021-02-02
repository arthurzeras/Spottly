<template>
  <article class="manual-post">
    <header class="manual-post__header">
      <i class="fab fa-twitter"></i>
      <h2 class="manual-post__header--title">Tweetar manualmente</h2>
    </header>

    <p>Poste em sua conta agora os artistas mais ouvidos da últimas semanas</p>

    <button class="manual-post__button" @click="postCurrentTopArtists()">
      Tweetar agora
    </button>
  </article>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'ManualPost',

  computed: {
    ...mapState(['user']),
  },

  methods: {
    ...mapActions(['ACTION_SET_LOADER', 'ACTION_SET_USER_CONFIG']),

    async postCurrentTopArtists() {
      try {
        this.ACTION_SET_LOADER(true);

        const postFunction = this.$firebase.functions().httpsCallable('manuallyPostTweet');
        const params = {
          uid: this.user.uid,
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
  },
};
</script>

<style lang="scss">
.manual-post {
  width: 100%;
  margin-top: 15px;
  padding: 20px 15px;
  border-radius: 20px;
  text-decoration: none;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.3);

  &__header {
    display: flex;
    align-items: center;
    color: var(--neutral-2);

    &--title {
      line-height: 1;
      font-size: 1rem;
      margin: 0 0 0 10px;
      font-weight: normal;
    }
  }

  p {
    font-size: 0.8rem;
  }

  &__button {
    @include button();
    font-size: 0.9rem;
    padding: 3px 20px;
  }
}
</style>
