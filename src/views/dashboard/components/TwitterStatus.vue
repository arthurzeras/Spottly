<template>
  <article class="twitter-status">
    <h2 class="twitter-status__title">
      Postagem automática no twitter
    </h2>

    <div class="twitter-status__info">
      <span v-html="statusText"></span>
      <span v-if="active"> - {{ dayText }}</span>
    </div>

    <div class="twitter-status__buttons">
      <button class="twitter-status__button-status" @click="toggleStatus(true)">
        {{ btnChangeStatusText }}
      </button>

      <button class="twitter-status__button-day" v-if="active" @click="handleUpdateDay()">
        Alterar dia
      </button>
    </div>

    <div class="twitter-status__disclaimer">
      As postagens automáticas acontecem no dia configurado as 20 horas horário de Brasília.
    </div>

    <div class="twitter-status__post-now">
      <button class="twitter-status__post-now__btn" @click="$emit('postNow')">
        Tweetar agora
      </button>
    </div>

    <app-modal title="Dia de postagem" ref="changeDayModal">
      <div class="twitter-status__post-day">
        <label class="twitter-status__post-day__label">
          Selecione o dia para as postagens:
        </label>

        <select class="twitter-status__select" v-model="postDay">
          <option :key="key" :value="key" v-for="(day, key) in weekDays">{{ day }}</option>
        </select>
      </div>

      <template slot="footer">
        <button class="twitter-status__post-day__button" @click="toggleStatus()">
          Ativar
        </button>
      </template>
    </app-modal>
  </article>
</template>

<script>
import { mapState } from 'vuex';
import WeekDays from '../mixins/week';
import AppModal from '@/components/global/Modal.vue';

export default {
  name: 'TwitterStatus',

  components: { AppModal },

  mixins: [WeekDays],

  data: () => ({
    active: false,
    postDay: 'monday',
    databaseRef: null,
    updatingDay: false,
  }),

  mounted() {
    this.getData();
  },

  computed: {
    ...mapState(['user']),

    statusText() {
      return this.active ? 'Ativada' : 'Desativada';
    },

    btnChangeStatusText() {
      return this.active ? 'Desativar' : 'Ativar';
    },

    dayText() {
      const day = this.weekDays[this.postDay];
      const prefix = day.endsWith('o') ? 'Todo' : 'Toda';

      return `${prefix} ${day}`;
    },
  },

  methods: {
    async getData() {
      try {
        this.databaseRef = this.$firebase.database().ref(`users/${this.user.uid}`);

        const snapshot = await this.databaseRef.once('value');
        const { twitterActive, postDay } = snapshot.val();

        this.active = twitterActive;
        this.postDay = postDay || 'monday';
      } catch (error) {
        this.$root.$emit(
          'Alert::show',
          'Ops, não consegui buscar as informações de postagens automaticas'
        );
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

        const message = !this.active
          ? 'Postagem automática ativada, agora basta aguardar o dia selecionado e o Spottly irá postar automaticamente seus artistas'
          : 'Postagem automatica desativada';

        this.$root.$emit('Alert::show', message);

        this.getData();
      } catch (error) {
        const action = this.active ? 'desativar' : 'ativar';

        const message = this.updatingDay
          ? `Ops, não consegui alterar o dia da postagem automatica, pode tentar novamente?`
          : `Ops, não consegui ${action} a postagem automatica, pode tentar novamente?`;

        this.$root.$emit('Alert::show', message);
      }
    },

    async handleUpdateDay() {
      this.updatingDay = true;
      this.$refs.changeDayModal.open();
    },
  },
};
</script>

<style lang="scss">
.twitter-status {
  text-align: center;

  &__button {
    &-status {
      @include button();

      font-size: 1rem;
      margin-top: 20px;
      margin-right: 5px;
      padding: 2px 20px;
    }

    &-day {
      @include button();

      font-size: 1rem;
      margin-left: 5px;
      margin-top: 20px;
      padding: 2px 20px;
      color: var(--primary);
      border: 1px solid var(--dark);
      background-color: var(--white);

      &:hover {
        background-color: var(--dark);
      }
    }
  }

  &__post-day {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;

    &__button {
      @include button();
      font-size: 1rem;
      padding: 2px 20px;
    }
  }

  &__disclaimer {
    padding: 0 15px;
    margin-top: 10px;
  }

  &__post-now {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--light);

    &__btn {
      @include button();

      font-size: 1rem;
      margin-right: 5px;
      padding: 2px 20px;
      background-color: var(--dark-2);

      &:hover {
        background-color: var(--dark);
      }
    }
  }

  &__select {
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

@media (max-width: 576px) {
  .twitter-status {
    &__select {
      width: 90%;
      padding: 2px 8px;
      font-size: 0.8rem;
    }
  }
}
</style>
