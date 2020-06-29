<template>
  <div class="loader" v-if="visible">
    <div class="fa-4x">
      <span class="fas fa-spin fa-circle-notch" />
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({ visible: false }),

  mounted() {
    this.$root.$on('Loader::show', () => {
      this.visible = true;
    });

    this.$root.$on('Loader::hide', () => {
      this.visible = false;
    });
  },

  beforeDestroy() {
    this.$root.$off('Loader::show');
    this.$root.$off('Loader::hide');
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
