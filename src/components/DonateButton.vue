<template>
  <div class="donate">
    <button class="donate__button" @click="$refs.modal.open()">
      Pague uma cerveja 🍻
    </button>

    <app-modal title="Pague uma cerveja 🍻" ref="modal">
      <div class="donate__modal">
        <p>
          Se curtiu o Spottly e quer me agradecer de alguma maneira, salva a gelada do final de
          semana!
        </p>

        <div class="donate__modal--pix">
          <small>vem de pix</small>
          <strong>{{ pixKey }}</strong>

          <button @click="copyText()" class="donate__copy-btn">Copiar</button>
        </div>
      </div>
    </app-modal>
  </div>
</template>

<script>
import AppModal from './global/Modal.vue';

export default {
  components: { AppModal },

  data: () => ({
    pixKey: process.env.VUE_APP_PIX_KEY,
  }),

  methods: {
    async copyText() {
      try {
        await navigator.clipboard.writeText(this.pixKey);
        this.$root.$emit('Alert::show', 'Copiado com sucesso', 'success');
      } catch (error) {
        this.$root.$emit(
          'Alert::show',
          'Não foi possível copiar o texto, talvez seu navegador não tenha suporte'
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.donate {
  padding: 0 15px;

  &__button {
    padding: 0;
    border: none;
    outline: none;
    color: var(--primary);
    background-color: transparent;
  }

  &__modal {
    text-align: center;

    &--pix {
      strong {
        display: block;
      }
    }
  }

  &__copy-btn {
    @include button();
    font-size: 1rem;
    padding: 2px 20px;
  }
}
</style>
