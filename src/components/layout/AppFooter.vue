<template>
  <footer class="app-footer">
    <router-link
      v-if="isLogged"
      class="app-footer__link"
      :to="{ name: 'Dashboard' }"
      :class="{ active: $route.name === 'Dashboard' }"
    >
      <span class="fa fa-home" />
      <small>Inicio</small>
    </router-link>

    <router-link
      :to="{ name: 'Tops' }"
      class="app-footer__link"
      v-if="isConnectedOnSpotify && isLogged"
      :class="{ active: $route.name === 'Tops' }"
    >
      <span class="fa fa-stream" />
      <small>Tops</small>
    </router-link>

    <router-link
      class="app-footer__link"
      :to="{ name: 'About' }"
      :class="{ active: $route.name === 'About' }"
    >
      <span class="fa fa-info-circle" />
      <small>Sobre</small>
    </router-link>
  </footer>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'AppFooter',

  computed: {
    ...mapGetters(['isConnectedOnSpotify', 'isLogged']),
  },
};
</script>

<style lang="scss">
.app-footer {
  left: 0;
  bottom: 0;
  width: 100%;
  height: 60px;
  display: flex;
  position: fixed;
  align-items: center;
  justify-content: space-around;
  background-color: var(--white);
  border-top: 1px solid var(--neutral);

  &__link {
    width: 20%;
    display: flex;
    font-size: 0.9rem;
    align-items: center;
    color: var(--dark-2);
    text-decoration: none;
    flex-direction: column;
    justify-content: center;

    &.active {
      color: var(--primary);
    }

    small {
      line-height: 1;
      margin-top: 5px;
    }
  }
}

@media (min-width: 768px) {
  .app-footer {
    display: none;
  }
}
</style>
