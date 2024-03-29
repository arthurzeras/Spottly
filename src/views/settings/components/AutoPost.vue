<template>
  <div class="auto-post">
    <div class="auto-post__loading" v-if="loading">
      Um momento...
    </div>

    <!-- <div class="auto-post__error" v-else-if="error">
      <p>Ops, aconteceu algum erro, tente novamente</p>

      <button class="auto-post__button" @click="getPostCountByDay()">
        Recarregar
      </button>
    </div> -->

    <template v-else>
      <div class="auto-post__post-day">
        <label class="auto-post__post-day--label">
          Selecione o dia para as postagens:
        </label>

        <select class="auto-post__post-day--select" v-model="postDay">
          <option
            :key="key"
            :value="key"
            v-for="(day, key) in weekDays"
            :disabled="checkDayAvailability(key)"
          >
            {{ day }}
          </option>
        </select>
      </div>

      <button class="auto-post__button" @click="toggleStatus()">
        {{ modalBtnText }}
      </button>

      <div class="auto-post__disclaimer">
        As postagens automáticas acontecem no dia configurado a qualquer momento no intervalo das 12
        até as 23 horas.
      </div>

      <div class="auto-post__disclaimer">
        Caso chegue o dia que você escolheu e o Spottly não postou seu tweet, provavelmente o limite
        de posts do dia foi atingido, o twitter limita em 1000 posts por dia, caso já tenha 1000
        postagens no dia que você escolheu, você pode ficar de fora. :(
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

  props: {
    firestoreRef: {
      required: false,
    },
  },

  data: () => ({
    error: true,
    active: false,
    loading: false,
    postDay: 'monday',
    postCountByDay: {},
    updatingDay: false,
  }),

  mounted() {
    this.getData();
    // this.getPostCountByDay();
  },

  computed: {
    ...mapState(['user']),

    modalBtnText() {
      return this.updatingDay ? 'Alterar Dia' : 'Ativar';
    },
  },

  methods: {
    async getData() {
      const snapshot = await this.firestoreRef.get();
      const { twitterActive, postDay } = snapshot.data();

      this.active = twitterActive;
      this.updatingDay = twitterActive;
      this.postDay = postDay || 'monday';
    },

    // async getPostCountByDay() {
    //   try {
    //     this.error = false;
    //     this.loading = true;

    //     const postCountFunction = this.$firebase.functions().httpsCallable('getPostCountByDays');

    //     this.postCountByDay = (await postCountFunction()).data;
    //   } catch (error) {
    //     this.error = true;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    async toggleStatus() {
      try {
        const payload = {
          postDay: this.postDay,
          twitterActive: !this.updatingDay ? !this.active : true,
        };

        if (this.firestoreRef) {
          await this.firestoreRef.update(payload);
        }

        let message = Messages.Success.ACTIVE_AUTO_POST;

        if (this.active) message = Messages.Success.DISABLE_AUTO_POST;
        if (this.updatingDay) message = Messages.Success.CHANGE_POST_DAY;

        this.$root.$emit('Alert::show', message, 'success');

        this.$emit('close');
      } catch (error) {
        const action = this.active ? 'ACTIVE' : 'DISABLE';

        const message = this.updatingDay
          ? Messages.Failed.CHANGE_POST_DAY
          : Messages.Failed[`${action}_AUTO_POST`];

        this.$root.$emit('Alert::show', message);
      }
    },

    checkDayAvailability(day) {
      return this.postCountByDay[day] > 1000;
    },
  },
};
</script>

<style lang="scss">
.auto-post {
  &__loading {
    display: flex;
    padding: 100px 0;
    font-size: 1.5rem;
    align-items: center;
    justify-content: center;
  }

  &__error {
    text-align: center;
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
