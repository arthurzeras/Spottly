<template>
  <section class="settings">
    <h1>Ajustes</h1>

    <div class="settings__loading" v-if="loading">
      <span class="fas fa-spin fa-circle-notch fa-2x" />
    </div>

    <div v-else-if="error" class="settings__error">
      <button class="settings__error--btn" @click="getData()">
        Tentar Novamente
      </button>
    </div>

    <template v-else>
      <ul class="settings__list">
        <li
          :key="i"
          v-for="(item, i) in items"
          class="settings__list--item"
          @click="setCurrentSetting(item)"
          :class="{ 'settings__list--item__disabled': !item.enabled }"
        >
          <span>{{ item.title }}</span>
          <i class="fa fa-chevron-right"></i>
        </li>
      </ul>

      <button class="settings__btn-remove-account" @click="removeAccount()">
        Excluir conta
      </button>

      <app-modal :title="currentItem.title" ref="modal">
        <component :database-ref="databaseRef" :is="currentItem.component" @close="closeModal()" />
      </app-modal>
    </template>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import AutoPost from './components/AutoPost.vue';
import AppModal from '@/components/global/Modal.vue';
import StoreHistory from './components/StoreHistory.vue';
import RemoveAccount from './components/RemoveAccount.vue';
import DeactivateAutoPost from './components/DeactivateAutoPost.vue';

export default {
  name: 'Settings',

  components: {
    AutoPost,
    AppModal,
    StoreHistory,
    RemoveAccount,
    DeactivateAutoPost,
  },

  data: () => ({
    error: false,
    loading: true,
    currentItem: {},
    databaseRef: null,
    items: [
      {
        enabled: true,
        component: AutoPost,
        title: 'Ativar/Alterar dia de postagem',
      },
      {
        enabled: true,
        component: DeactivateAutoPost,
        title: 'Desativar postagem automática',
      },
      {
        enabled: true,
        component: StoreHistory,
        title: 'Armazenar histórico (Breve)',
      },
    ],
  }),

  mounted() {
    this.getData();
  },

  computed: {
    ...mapState(['user']),
  },

  methods: {
    async getData() {
      try {
        this.error = false;
        this.loading = true;
        this.databaseRef = this.$firebase.database().ref(`users/${this.user.uid}`);

        const snapshot = await this.databaseRef.once('value');
        const { twitterActive } = snapshot.val();

        this.items[1].enabled = twitterActive;
      } catch (error) {
        this.error = true;
        this.$root.$emit(
          'Alert::show',
          'Ops, não consegui buscar as informações de postagens automaticas'
        );
      } finally {
        this.loading = false;
      }
    },

    closeModal() {
      this.$refs.modal.close();
      this.getData();
    },

    setCurrentSetting(item) {
      this.currentItem = item;
      this.$refs.modal.open();
    },

    removeAccount() {
      this.setCurrentSetting({
        title: 'Excluir conta',
        component: RemoveAccount,
      });
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

  &__loading {
    text-align: center;
    color: var(--primary);
  }

  &__error {
    text-align: center;

    &--btn {
      @include button();
    }
  }

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

      &__disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
