<template>
  <router-link :to="{ name: 'Settings' }" class="twitter-status">
    <header class="twitter-status__header">
      <i class="fa fa-robot"></i>
      <h2 class="twitter-status__header--title">Postagem automática no Twitter</h2>
    </header>

    <div class="twitter-status__loading" v-if="loading">
      <span class="fas fa-spin fa-circle-notch fa-2x" />
    </div>

    <div class="twitter-status__body" v-else>
      <div class="twitter-status__body--columns">
        <div class="twitter-status__body--info" v-html="statusText" />
        <small class="twitter-status__body--day-info" v-if="active">{{ dayText }}</small>
        <small v-else>Clique aqui para ativar</small>
      </div>

      <div class="twitter-status__body--columns">
        <button class="twitter-status__body--btn-configure">
          <i class="fa fa-cog"></i>
        </button>
      </div>
    </div>
  </router-link>
</template>

<script>
import { mapState } from 'vuex';
import WeekDays from '@/mixins/week';

export default {
  name: 'TwitterStatus',

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

    statusText() {
      return this.active ? 'Ativada' : 'Desativada';
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
        this.loading = true;

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
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss">
.twitter-status {
  width: 100%;
  padding: 20px 15px;
  border-radius: 20px;
  text-decoration: none;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.3);

  &__header {
    display: flex;
    margin-bottom: 20px;
    align-items: center;
    color: var(--neutral-2);

    &--title {
      line-height: 1;
      font-size: 1rem;
      margin: 0 0 0 10px;
      font-weight: normal;
    }
  }

  &__loading {
    text-align: center;
    color: var(--primary);
  }

  &__body {
    display: flex;
    font-size: 1.2rem;
    justify-content: space-between;

    &--info {
      line-height: 1;
      font-weight: bold;
      color: var(--primary);
    }

    &--day-info {
      line-height: 1;
      font-size: 0.8rem;
      color: var(--neutral-2);
    }

    &--btn-configure {
      border: none;
      line-height: 1;
      font-size: 2rem;
      box-shadow: none;
      background-color: transparent;

      .fa {
        color: var(--neutral);
      }
    }
  }

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

@media (max-width: 375px) {
  .twitter-status {
    &__title {
      font-size: 1.2rem;
    }

    &__disclaimer {
      font-size: 0.8rem;
    }
  }
}
</style>
