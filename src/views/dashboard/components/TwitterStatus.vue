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
      <select class="twitter-status__select" v-model="postDay" v-if="!active || updateDay">
        <option :key="key" :value="key" v-for="(day, key) in weekDays">{{ day }}</option>
      </select>

      <button class="twitter-status__button-status" @click="toggleStatus()" v-if="!updateDay">
        {{ btnChangeStatusText }}
      </button>

      <button class="twitter-status__button-day" v-if="active" @click="handleUpdateDay()">
        Alterar dia
      </button>
    </div>
  </article>
</template>

<script>
import { mapState } from 'vuex';
import WeekDays from '../mixins/week';

export default {
  name: 'TwitterStatus',

  mixins: [WeekDays],

  data: () => ({
    active: false,
    updateDay: false,
    postDay: 'monday',
    databaseRef: null,
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

        this.postDay = postDay;
        this.active = twitterActive;
      } catch (error) {
        this.$root.$emit(
          'Alert::show',
          'Ops, não consegui buscar as informações de postagens automaticas'
        );
      }
    },

    async toggleStatus() {
      try {
        await this.databaseRef.set({
          postDay: this.postDay,
          twitterActive: !this.active,
        });

        this.getData();
      } catch (error) {
        const action = this.active ? 'desativar' : 'ativar';

        this.$root.$emit(
          'Alert::show',
          `Ops, não consegui ${action} a postagem automatica, pode tentar novamente?`
        );
      }
    },

    async handleUpdateDay() {
      if (!this.updateDay) {
        this.updateDay = true;
        return;
      }

      try {
        await this.databaseRef.set({
          postDay: this.postDay,
          twitterActive: this.active,
        });

        this.updateDay = false;

        this.getData();
      } catch (error) {
        this.$root.$emit(
          'Alert::show',
          `Ops, não consegui alterar o dia da postagem automatica, pode tentar novamente?`
        );
      }
    },
  },
};
</script>

<style lang="scss">
.twitter-status {
  text-align: center;

  &__select {
    margin-right: 10px;
  }

  &__button {
    &-status {
      @include button();

      font-size: 1rem;
      margin-right: 5px;
      padding: 2px 20px;
    }

    &-day {
      @include button();

      font-size: 1rem;
      margin-left: 5px;
      padding: 2px 20px;
      color: var(--primary);
      border: 1px solid var(--dark);
      background-color: var(--white);

      &:hover {
        background-color: var(--dark);
      }
    }
  }
}
</style>
