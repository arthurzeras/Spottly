<template>
  <footer class="app-footer">
    <router-link class="app-footer__link" :to="{ name: 'About' }">
      Sobre
    </router-link>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
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
  justify-content: center;
  background-color: var(--white);
  border-top: 1px solid var(--neutral);

  &__link {
    font-size: 0.9rem;
    text-decoration: none;
    color: var(--neutral-2);
  }
}
</style>
