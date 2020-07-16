<template>
  <article class="twitter-config">
    <h2>Vamos configurar postagem automática</h2>

    <div class="twitter-config__post-day-container">
      <label for="postDay">
        Escolha o dia para as postagens:
      </label>

      <select class="twitter-config__select" name="postDay" v-model="postDay">
        <option :key="key" :value="key" v-for="(day, key) in weekDays">{{ day }}</option>
      </select>
    </div>

    <p>Ah, as postagens são feitas no dia que você configurar às 20 horas, horario de brasilia.</p>

    <button class="twitter-config__button-active" @click="activateAutoPost()">
      Ativar postagem automática
    </button>

    <button class="twitter-config__button-skip" @click="ACTION_SET_SKIP_CONFIG()">
      Configurar depois
    </button>
  </article>
</template>

<script>
import { mapActions } from 'vuex';
import WeekDays from '@/mixins/week';

export default {
  name: 'AutoPostConfig',

  mixins: [WeekDays],

  data: () => ({
    postDay: 'monday',
  }),

  methods: {
    ...mapActions(['ACTION_SET_SKIP_CONFIG', 'ACTION_ACTIVATE_AUTO_POST', 'ACTION_SET_LOADER']),

    async activateAutoPost() {
      try {
        this.ACTION_SET_LOADER(true);

        const params = {
          postDay: this.postDay,
        };

        await this.ACTION_ACTIVATE_AUTO_POST(params);
      } catch (error) {
        this.$root.$emit(
          'Alert::show',
          'Ops, não foi possível ativar a postagem automática, pode tentar novamente?'
        );
      } finally {
        this.ACTION_SET_LOADER(false);
      }
    },
  },
};
</script>

<style lang="scss">
.twitter-config {
  width: 100%;
  display: flex;
  padding: 0 20px;
  text-align: center;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  &__post-day-container {
    width: 25%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__select {
    width: 100%;
    outline: none;
    display: block;
    font-size: 1rem;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 20px;
    background-color: var(--white);
    border: 1px solid var(--neutral-2);
  }

  &__button {
    &-active {
      @include button();
    }

    &-skip {
      border: none;
      font-size: 1rem;
      margin-top: 30px;
      background-color: transparent;
    }
  }
}

@media (max-width: 768px) {
  .twitter-config {
    &__post-day-container {
      width: 50%;
    }
  }
}

@media (max-width: 425px) {
  .twitter-config {
    &__post-day-container {
      width: 100%;
    }

    &__select {
      font-size: 0.9rem;
    }

    &__button {
      &-active {
        font-size: 1rem;
      }

      &-skip {
        font-size: 0.9rem;
      }
    }

    p {
      font-size: 0.9rem;
    }
  }
}
</style>
