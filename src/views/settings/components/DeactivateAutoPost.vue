<template>
  <div class="deactivate-auto-post">
    <p>Deseja realmente desativar a postagem automática?</p>

    <button class="deactivate-auto-post__button" @click="deactivate()">
      Sim, desativar
    </button>
  </div>
</template>

<script>
export default {
  name: 'DeactivateAutoPost',

  props: {
    databaseRef: {
      require: true,
    },
  },

  methods: {
    async deactivate() {
      try {
        await this.databaseRef.update({
          twitterActive: false,
        });

        this.$emit('close');
      } catch (error) {
        this.$root.$emit(
          'Alert::show',
          'Ops, não consegui desativar a postagem automática, tente novamente'
        );
      }
    },
  },
};
</script>

<style lang="scss">
.deactivate-auto-post {
  text-align: center;

  &__button {
    @include button();
    font-size: 1rem;
    padding: 5px 20px;
  }
}
</style>
