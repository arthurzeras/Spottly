<template>
  <section class="status">
    <h1>Spottly Status ✌🏻💋</h1>

    <article class="status__columns">
      <div class="status__column status__column-overall">
        <div class="status__column-users-count">
          <div>{{ counters.total }}</div>
          <small>Total</small>
        </div>

        <div class="status__column-users-count">
          <div>{{ counters.active }}</div>
          <small>PA Ativada</small>
        </div>
      </div>

      <div class="status__column">
        <div class="status__column-list">
          <a
            :key="uid"
            target="_blank"
            :href="user | profileURL"
            v-for="(user, uid) in allUsers"
            class="status__column-list-item"
          >
            <div class="status__column-list-item__metadata">
              <img
                width="50"
                alt="Perfil"
                :src="user | imageURL"
                class="status__column-list-item__img"
              />

              <div class="status__column-list-item__name">
                {{ user | displayName }}
                <small>@{{ user | username }}</small>
              </div>
            </div>

            <div class="status__column-list-item__active">
              <span class="fab fa-twitter" :class="{ active: user.twitterActive }" />
            </div>
          </a>
        </div>
      </div>
    </article>
  </section>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Status',

  data: () => ({
    allUsers: {},
  }),

  mounted() {
    this.getData();
  },

  computed: {
    ...mapState(['user']),

    counters() {
      const keys = Object.keys(this.allUsers);

      const active = keys.reduce((total, item) => {
        let _t = total;
        _t += this.allUsers[item]?.twitterActive ? 1 : 0;
        return _t;
      }, 0);

      return {
        active,
        total: keys.length,
      };
    },
  },

  filters: {
    profileURL(user) {
      const username = user?.metadata?.username;

      return username ? `https://twitter.com/${username}` : '#';
    },

    displayName(user) {
      return user?.metadata?.displayName || '--';
    },

    username(user) {
      return user?.metadata?.username || '--';
    },

    imageURL(user) {
      return (
        user?.metadata?.photoURL ||
        'https://pbs.twimg.com/media/C8QxCLJWsAAvdc9?format=jpg&name=small'
      );
    },
  },

  methods: {
    async getData() {
      try {
        const statusFunction = this.$firebase.functions().httpsCallable('getStatus');

        const params = {
          uid: this.user.uid,
        };

        this.allUsers = (await statusFunction(params)).data;
      } catch (error) {
        this.$root.$emit('Alert::show', error.message || 'Deu ruim');
      }
    },
  },
};
</script>

<style lang="scss">
.status {
  padding: 0 30px;

  h1 {
    font-size: 2rem;
  }

  &__columns {
    display: flex;
  }

  &__column {
    flex: 0 0 50%;

    &-overall {
      display: flex;
    }

    &-users-count {
      flex: 0 0 50%;
      font-size: 2rem;
      text-align: center;
    }

    &-list {
      overflow-y: auto;
      max-height: calc(100vh - 226px);

      &-item {
        padding: 10px;
        display: flex;
        color: var(--dark);
        align-items: center;
        border-radius: 5px;
        margin-bottom: 5px;
        text-decoration: none;
        justify-content: space-between;
        border: 1px solid var(--light);

        &:hover {
          background-color: var(--light);
        }

        &__metadata {
          display: flex;
        }

        &__img {
          border-radius: 50%;
          margin-right: 15px;
        }

        &__name {
          small {
            display: block;
          }
        }

        &__active {
          .fab.active {
            color: var(--primary);
          }
        }
      }
    }
  }
}

@media (max-width: 425px) {
  .status {
    padding: 0 10px;

    h1 {
      font-size: 1.5rem;
    }

    &__columns {
      width: 100%;
      display: flex;
      flex-wrap: nowrap;
      flex-direction: column;
    }

    &__column {
      flex: 0 0 100%;

      &-overall {
        margin-bottom: 15px;
      }

      &-list {
        max-height: calc(100vh - 300px);
      }
    }
  }
}
</style>
