<template>
  <div class="auto-post">
    <div class="auto-post__loading" v-if="loading">
      <span class="fas fa-spin fa-circle-notch fa-2x" />
    </div>

    <template v-else>
      <div class="auto-post__post-day">
        <label class="auto-post__post-day--label">
          Selecione o dia para as postagens:
        </label>

        <select class="auto-post__post-day--select" v-model="postDay">
          <option :key="key" :value="key" v-for="(day, key) in weekDays">{{ day }}</option>
        </select>
      </div>

      <button class="auto-post__button" @click="toggleStatus()">
        {{ modalBtnText }}
      </button>

      <div class="auto-post__disclaimer">
        As postagens automáticas acontecem no dia configurado as 20 horas horário de Brasília.
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import WeekDays from '@/mixins/week';
import Messages from '@/utils/messages';

export default {
  name: 'AutoPost',

  mixins: [WeekDays],

  data: () => ({
    active: false,
    loading: true,
    postDay: 'monday',
    databaseRef: null,
    updatingDay: false,
  }),

  mounted() {
    this.getData();
  },

  computed: {
    ...mapState(['user']),

    modalBtnText() {
      return this.updatingDay ? 'Alterar Dia' : 'Ativar';
    },
  },

  methods: {
    async getData() {
      try {
        this.loading = true;

        this.databaseRef = this.$firebase.database().ref(`users/${this.user.uid}`);

        const snapshot = await this.databaseRef.once('value');
        const { twitterActive, postDay } = snapshot.val();

        this.active = twitterActive;
        this.updatingDay = twitterActive;
        this.postDay = postDay || 'monday';
      } catch (error) {
        this.$root.$emit(
          'Alert::show',
          'Ops, não consegui buscar as informações de postagens automaticas'
        );
      } finally {
        this.loading = false;
      }
    },

    async toggleStatus(openChangeDayModal = false) {
      if (!this.active && openChangeDayModal) {
        this.$refs.changeDayModal.open();
        return;
      }

      try {
        await this.databaseRef.update({
          postDay: this.postDay,
          twitterActive: !this.updatingDay ? !this.active : true,
        });

        this.$refs.changeDayModal.close();

        let message = Messages.Success.ACTIVE_AUTO_POST;

        if (this.active) message = Messages.Success.DISABLE_AUTO_POST;
        if (this.updatingDay) message = Messages.Success.CHANGE_POST_DAY;

        this.$root.$emit('Alert::show', message, 'success');

        this.updatingDay = false;

        this.getData();
      } catch (error) {
        const action = this.active ? 'ACTIVE' : 'DISABLE';

        const message = this.updatingDay
          ? Messages.Failed.CHANGE_POST_DAY
          : Messages.Failed[`${action}_AUTO_POST`];

        this.$root.$emit('Alert::show', message);
      }
    },
  },
};
</script>

<style lang="scss">
.auto-post {
  &__loading {
    text-align: center;
    color: var(--primary);
  }

  &__post-day {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;

    &--select {
      width: 50%;
      outline: none;
      font-size: 1rem;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 20px;
      background-color: var(--white);
      border: 1px solid var(--neutral-2);
    }
  }

  &__button {
    @include button();
    display: block;
    font-size: 1rem;
    padding: 2px 20px;
    margin: 20px auto 0 auto;
  }

  &__disclaimer {
    padding: 0 15px;
    margin-top: 10px;
    text-align: center;
  }
}

@media (max-width: 576px) {
  .auto-post__post-day {
    &--select {
      width: 90%;
      padding: 2px 8px;
      font-size: 0.8rem;
    }
  }
}

@media (max-width: 375px) {
  .auto-post {
    &__disclaimer {
      font-size: 0.8rem;
    }
  }
}
</style>
