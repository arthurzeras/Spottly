<template>
  <section class="settings">
    <h1>Ajustes</h1>

    <ul class="settings__list">
      <li
        :key="i"
        v-for="(item, i) in items"
        class="settings__list--item"
        @click="setCurrentSetting(item)"
      >
        <span>{{ item.title }}</span>
        <i class="fa fa-chevron-right"></i>
      </li>
    </ul>

    <button class="settings__btn-remove-account">
      Excluir conta
    </button>

    <app-modal :title="currentItem.title" ref="modal">
      <component :is="currentItem.component" />
    </app-modal>
  </section>
</template>

<script>
import AutoPost from './components/AutoPost.vue';
import AppModal from '@/components/global/Modal.vue';
import StoreHistory from './components/StoreHistory.vue';

export default {
  name: 'Settings',

  components: {
    AutoPost,
    AppModal,
    StoreHistory,
  },

  data: () => ({
    currentItem: {},
    items: [
      {
        component: AutoPost,
        title: 'Ativar/Alterar dia de postagem',
      },
      {
        component: StoreHistory,
        title: 'Armazenar histórico (Breve)',
      },
    ],
  }),

  methods: {
    setCurrentSetting(item) {
      this.currentItem = item;
      this.$refs.modal.open();
    },
  },
};
</script>

<style lang="scss">
.settings {
  display: flex;
  padding: 0 15px;
  flex-direction: column;
  height: calc(100vh - 110px);

  &__list {
    padding: 0;
    list-style: none;

    &--item {
      display: flex;
      cursor: pointer;
      padding: 10px 15px;
      margin-bottom: 15px;
      justify-content: space-between;
      border-bottom: 2px solid var(--light);

      &:hover {
        background-color: var(--light);
      }

      .fa {
        color: var(--neutral-2);
      }
    }
  }

  &__btn-remove-account {
    padding: 5px;
    text-align: center;
    border-radius: 15px;
    color: var(--danger);
    background: var(--white);
    border: 1px solid var(--danger);
  }
}
</style>
