<template>
  <div class="remove-account">
    <h2>Tem certeza?</h2>

    <button class="remove-account__btn" @click="deleteAccount()">
      Sim, quero excluir minha conta
    </button>
  </div>
</template>

<script>
export default {
  props: {
    databaseRef: {
      require: true,
    },
  },

  methods: {
    async deleteAccount() {
      try {
        await this.databaseRef.set(null);
        await this.$firebase.auth().currentUser.delete();
        localStorage.removeItem('spotify_token');
        localStorage.removeItem('spotify_refresh');
        this.$router.push({ name: 'Home' });
        window.location.reload();
      } catch (error) {
        this.$root.$emit('Alert::show', 'Ops, não foi possível remover sua conta, tente novamente');
      }
    },
  },
};
</script>

<style lang="scss">
.remove-account {
  text-align: center;
  &__btn {
    @include button();
    font-size: 1rem;
    background-color: var(--danger);
  }
}
</style>
