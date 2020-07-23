<template>
  <footer class="app-footer">
    <router-link class="app-footer__link" v-if="isLogged" :to="{ name: 'Dashboard' }">
      <span class="fa fa-home" />
      <small>Inicio</small>
    </router-link>
    <router-link
      :to="{ name: 'Tops' }"
      class="app-footer__link"
      v-if="isConnectedOnSpotify && isLogged"
    >
      <span class="fa fa-stream" />
      <small>Tops</small>
    </router-link>
    <router-link class="app-footer__link" :to="{ name: 'About' }">
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
  height: 40px;
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
    text-decoration: none;
    flex-direction: column;
    color: var(--neutral-2);
    justify-content: center;
  }
}
</style>
