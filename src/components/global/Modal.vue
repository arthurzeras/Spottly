<template>
  <div class="modal" v-if="visible">
    <div class="modal__window">
      <div class="modal__window-header">
        <div class="modal__window-title">
          {{ title }}
        </div>

        <button class="modal__window-close" @click="close()">
          <span class="fa fa-times" />
        </button>
      </div>

      <div class="modal__window-body">
        <slot></slot>
      </div>

      <div class="modal__window-footer" v-if="hasFooterSlot">
        <slot name="footer"></slot>
      </div>
    </div>

    <div class="modal__backdrop" @click="close()" />
  </div>
</template>

<script>
export default {
  name: 'AppModal',

  data: () => ({
    visible: false,
  }),

  props: {
    title: {
      type: String,
      default: '',
    },
  },

  computed: {
    hasFooterSlot() {
      return this.$slots.footer;
    },
  },

  methods: {
    open() {
      this.visible = true;
    },

    close() {
      this.$emit('close');
      this.visible = false;
    },
  },
};
</script>

<style lang="scss">
.modal {
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: center;

  &__window {
    width: 50%;
    z-index: 2;
    text-align: left;
    position: absolute;
    border-radius: 10px;
    background-color: var(--white);

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--neutral);
    }

    &-title {
      padding-left: 15px;
    }

    &-close {
      width: 50px;
      height: 50px;
      border: none;
      line-height: 1;
      cursor: pointer;
      font-size: 1.3rem;
      color: var(--neutral-2);
      background-color: transparent;
    }

    &-body {
      padding: 15px;
    }

    &-footer {
      padding: 15px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid var(--neutral);
    }
  }

  &__backdrop {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    position: fixed;
    background-color: rgba(0, 0, 0, 0.7);
  }
}

@media (max-width: 576px) {
  .modal {
    &__window {
      width: calc(100% - 30px);

      &-close {
        font-size: 1rem;
      }
    }
  }
}
</style>
