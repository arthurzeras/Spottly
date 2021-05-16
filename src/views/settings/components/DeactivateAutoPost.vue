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
      required: true,
    },

    firestoreRef: {
      required: false,
    },
  },

  methods: {
    async deactivate() {
      try {
        const databasesRefs = [this.databaseRef];

        if (this.firestoreRef) {
          databasesRefs.push(this.firestoreRef);
        }

        const promises = databasesRefs.map((ref) =>
          ref.update({
            twitterActive: false,
          })
        );

        await Promise.all(promises);

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
