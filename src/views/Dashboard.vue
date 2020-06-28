<template>
  <section class="dashboard">
    <h2>Olá, {{ user.displayName }}!</h2>

    <p>Conecte sua conta do Spotify ao Spottly para iniciar</p>

    <button class="dashboard__button">
      Conectar ao Spotify
      <span class="fab fa-spotify" />
    </button>
  </section>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Dashboard',

  computed: {
    ...mapState(['user']),
  },
};
</script>

<style lang="scss">
.dashboard {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  &__button {
    border: none;
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
}
</style>
