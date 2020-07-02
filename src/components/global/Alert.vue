<template>
  <div class="app-alert" v-if="visible">
    <span class="app-alert__message" v-html="message" />

    <button class="app-alert__close" @click="visible = false">
      <span class="fa fa-times" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'AppAlert',

  data: () => ({
    message: '',
    visible: false,
  }),

  created() {
    this.$root.$on('Alert::show', (message, timer = 10000) => {
      this.visible = true;
      this.message = message;

      setTimeout(() => {
        this.visible = false;
      }, timer);
    });

    this.$root.$on('Alert::hide', () => {
      this.visible = false;
    });
  },
};
</script>

<style lang="scss">
.app-alert {
  left: 50px;
  bottom: 50px;
  display: flex;
  padding: 15px;
  max-width: 50%;
  border-radius: 5px;
  position: absolute;
  color: var(--white);
  background-color: var(--dark-2);

  &__message {
    display: flex;
    align-self: center;
  }

  &__close {
    border: none;
    outline: none;
    height: 37px;
    flex: 0 0 20px;
    font-size: 1rem;
    margin-left: 15px;
    padding: 5px 10px;
    color: var(--white);
    background-color: transparent;

    &:hover {
      opacity: 0.6;
    }
  }
}

@media (max-width: 576px) {
  .app-alert {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .app-alert {
    left: 15px;
    bottom: 30px;
    max-width: calc(100% - 30px);
  }
}
</style>
