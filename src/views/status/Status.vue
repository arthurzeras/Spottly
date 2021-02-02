<template>
  <section class="status">
    <h1>Spottly Status ✌🏻💋</h1>

    <article class="status__loading" v-if="loading">
      <div class="fa-3x">
        <span class="fas fa-spin fa-circle-notch" />
      </div>
    </article>

    <article class="status__columns" v-else>
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
        <input type="text" class="status__column-filter" v-model="filter" />

        <div class="status__column-list">
          <div :key="uid" class="status__column-list-item" v-for="(user, uid) in listSorted">
            <div class="status__column-list-item__metadata">
              <a :href="user | profileURL">
                <img
                  width="50"
                  alt="Perfil"
                  target="_blank"
                  :src="user | imageURL"
                  class="status__column-list-item__img"
                />
              </a>

              <div class="status__column-list-item__name">
                {{ user | displayName }}
                <small>@{{ user | username }} - {{ uid }}</small>
              </div>
            </div>

            <div class="status__column-list-item__active">
              <span class="fab fa-twitter" :class="{ active: user.twitterActive }" />
              <small v-if="user.twitterActive">{{ user | postDay }}</small>
            </div>
          </div>
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
    filter: '',
    allUsers: {},
    loading: true,
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

    listSorted() {
      const allUsers = {};

      Object.keys(this.allUsers)
        .sort((a) => {
          if (this.allUsers[a].twitterActive) return -1;
          return 1;
        })
        .forEach((uid) => {
          allUsers[uid] = this.allUsers[uid];
        })
        .filter((uid) => {
          const user = this.allUsers[uid];
          if (!this.filter) return true;

          return user.metadata.displayName.toLowerCase().includes(this.filter.toLowerCase());
        });

      return allUsers.splice(0, 50);
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

    postDay(user) {
      return user.postDay.substring(0, 3).toUpperCase();
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
        this.loading = true;
        const statusFunction = this.$firebase.functions().httpsCallable('getStatus');

        const params = {
          uid: this.user.uid,
        };

        this.allUsers = (await statusFunction(params)).data;
      } catch (error) {
        this.$root.$emit('Alert::show', error.message || 'Deu ruim');
      } finally {
        this.loading = false;
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

  &__loading {
    display: flex;
    align-items: center;
    color: var(--primary);
    justify-content: center;
    height: calc(100vh - 220px);
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

    &-filter {
      width: 100%;
      outline: none;
      padding: 10px;
      font-size: 1rem;
      border-radius: 10px;
      border: 1px solid var(--neutral);

      &:hover {
        border-color: var(--neutral-2);
      }
    }

    &-list {
      overflow-y: auto;
      max-height: calc(100vh - 226px);

      &-item {
        padding: 10px;
        display: flex;
        color: var(--dark);
        border-radius: 5px;
        margin-bottom: 5px;
        align-items: center;
        justify-content: space-between;
        border: 1px solid var(--light);

        &:hover {
          background-color: var(--light);
        }

        &__metadata {
          display: flex;
          flex: 0 0 90%;
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
          flex: 0 0 10%;
          text-align: center;

          .fab {
            display: block;

            &.active {
              color: var(--primary);
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
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

      &-users-count {
        font-size: 1.5rem;
      }

      &-list {
        max-height: calc(100vh - 300px);
      }
    }
  }
}
</style>
