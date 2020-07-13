<template>
  <div class="app-alert" v-if="visible" @click="visible = false">
    <span class="app-alert__icon fas" :class="[icon, type]" />
    <span class="app-alert__message" v-html="message" />
  </div>
</template>

<script>
export default {
  name: 'AppAlert',

  data: () => ({
    message: '',
    type: 'error',
    visible: false,
  }),

  created() {
    this.$root.$on('Alert::show', (message, type = 'error', timer = 10000) => {
      this.type = type;
      this.visible = true;
      this.message = message;

      setTimeout(() => {
        this.visible = false;
      }, timer);
    });

    this.$root.$on('Alert::hide', () => {
      this.type = 'error';
      this.visible = false;
    });
  },

  computed: {
    icon() {
      return new Map([
        ['error', 'fa-times-circle'],
        ['success', 'fa-check-circle'],
        ['warn', 'fa-exclamation-triangle'],
      ]).get(this.type);
    },
  },
};
</script>

<style lang="scss">
.app-alert {
  left: 50px;
  bottom: 50px;
  display: flex;
  max-width: 75vw;
  padding: 15px 15px;
  position: absolute;
  color: var(--white);
  border-radius: 15px;
  background-color: var(--dark-2);

  &__icon {
    width: 20px;
    display: flex;
    flex: 0 0 20px;
    font-size: 1.2rem;
    align-self: center;
    text-align: center;
    margin: 0 15px 0 0;

    &.error {
      color: var(--danger);
    }

    &.warn {
      color: var(--warn);
    }

    &.success {
      color: var(--primary);
    }
  }

  &__message {
    width: 100%;
    display: flex;
    line-height: 1.2;
    align-self: center;
  }
}

@media (max-width: 576px) {
  .app-alert {
    font-size: 0.9rem;
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
