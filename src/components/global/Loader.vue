<template>
  <div class="loader" v-if="loader">
    <div class="fa-4x">
      <span class="fas fa-spin fa-circle-notch" />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState(['loader']),
  },

  mtehods: {
    ...mapActions(['ACTION_SET_LOADER']),
  },
};
</script>

<style lang="scss">
.loader {
  top: 0;
  width: 100%;
  z-index: 100;
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: absolute;
  align-items: center;
  color: var(--primary);
  justify-content: center;
  background-color: var(--white);
}
</style>
