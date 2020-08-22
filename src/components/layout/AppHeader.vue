<template>
  <header class="header">
    <router-link :to="{ name: 'Dashboard' }" class="header__logo">
      <img src="~@/assets/img/logo.png" alt="Logo" class="header__logo-img" />
      <span class="header__logo-title">Spottly</span>
      <span class="header__logo-beta-info">BETA</span>
    </router-link>

    <nav class="header__nav">
      <router-link
        :key="route.name"
        v-for="route in routes"
        class="header__nav-link"
        :to="{ name: route.name }"
      >
        <span class="fa header__nav-link-icon" :class="`fa-${route.meta.icon}`" />
        <span>{{ route.meta.displayTitle }}</span>
      </router-link>
    </nav>

    <div class="header__user" ref="userElement" v-if="isLogged">
      <img
        alt="User Image"
        :src="user.photoURL"
        class="header__user-img"
        @click="dropdownVisible = !dropdownVisible"
      />

      <div class="header__user-info">
        <span :title="user.displayName">Olá, {{ nameTruncated }}</span>

        <button class="header__user-logout" title="Sair" @click="btnLogoutHandler()">
          <span class="fa fa-power-off" />
        </button>
      </div>

      <div class="header__user-dropdown" v-show="dropdownVisible">
        <div class="header__user-name">{{ nameTruncated }}</div>

        <button @click="btnLogoutHandler()" class="header__user-logout header__user-logout-mobile">
          <span class="fa fa-power-off" />
          Sair
        </button>
      </div>
    </div>

    <app-modal title="Logout" ref="logoutModal">
      <div class="header__logout-modal">
        <button @click="logout()" class="header__logout-modal--button">
          Fazer logout somente do Spotify
        </button>

        <button class="header__logout-modal--button" @click="logout(true)">
          Fazer logout de tudo
        </button>
      </div>
    </app-modal>
  </header>
</template>

<script>
import Messages from '@/utils/messages';
import AppModal from '@/components/global/Modal.vue';
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  name: 'AppHeader',

  components: { AppModal },

  data: () => ({
    dropdownVisible: false,
  }),

  mounted() {
    document.addEventListener('click', (event) => this.documentClickHandler(event));
  },

  computed: {
    ...mapState(['user']),
    ...mapGetters(['isLogged', 'isConnectedOnSpotify']),

    nameTruncated() {
      const { displayName: name } = this.user;
      const newName = name.substr(0, 27);

      return name.length > 30 ? `${newName}...` : name;
    },

    routes() {
      return this.$router.options.routes.filter((route) => {
        return route.name === 'Tops'
          ? this.isConnectedOnSpotify && this.isLogged
          : route.name === 'Dashboard'
          ? this.isLogged
          : route.name === 'About';
      });
    },
  },

  methods: {
    ...mapActions(['ACTION_SET_USER', 'ACTION_LOGOUT_SPOTIFY', 'ACTION_SET_LOADER']),

    documentClickHandler(event = null) {
      const { target } = event;
      const el = this.$refs.userElement;

      if (target !== el && !!el && !el.contains(target)) {
        this.dropdownVisible = false;
      }
    },

    btnLogoutHandler() {
      this.dropdownVisible = false;

      if (!this.isConnectedOnSpotify) return this.logout(true);

      this.$refs.logoutModal.open();
    },

    async logout(fullLogout = false) {
      try {
        this.ACTION_SET_LOADER(true);

        await this.ACTION_LOGOUT_SPOTIFY();

        if (fullLogout) {
          await this.$firebase.auth().signOut();
          this.ACTION_SET_USER({});
        }

        this.ACTION_SET_LOADER(false);
        this.$refs.logoutModal.close();

        if (fullLogout) this.$router.push({ name: 'Home' });
      } catch (error) {
        this.$root.$emit('Alert::show', Messages.Failed.LOGOUT);
      }
    },
  },

  beforeDestroy() {
    document.removeEventListener('click', this.documentClickHandler);
  },
};
</script>

<style lang="scss">
@mixin columns() {
  height: 100%;
  display: flex;
  align-items: center;
}

.header {
  width: 100%;
  height: 50px;
  display: flex;
  padding: 0 15px;

  &__logo {
    @include columns();

    text-decoration: none;

    &-img {
      width: 35px;
      height: 35px;
    }

    &-title {
      padding: 0;
      font-size: 18px;
      margin: 4px 0 0 5px;
      color: var(--primary);
    }

    &-beta-info {
      color: var(--dark);
      margin: 4px 0 0 5px;
    }
  }

  &__nav {
    margin: 0 20px;
    @include columns();

    &-link {
      transition: 0.4s;
      color: var(--dark);
      text-decoration: none;
      padding: 10px 20px 5px 20px;

      &.router-link-exact-active {
        color: var(--primary);
      }

      &-icon {
        margin-right: 5px;
      }

      &:hover {
        color: var(--p-hover);
      }
    }
  }

  &__user {
    margin-left: auto;
    @include columns();

    &-img {
      width: 40px;
      width: 40px;
      border-radius: 50%;
    }

    &-info {
      margin: 0 0 0 10px;
    }

    &-dropdown {
      top: 60px;
      z-index: 10;
      right: 15px;
      position: absolute;
      border-radius: 5px;
      color: var(--white);
      padding: 5px 10px 10px 10px;
      background-color: var(--dark);
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);

      &::after {
        width: 0;
        height: 0;
        top: -8px;
        right: 8px;
        content: '';
        position: absolute;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid var(--dark);
      }
    }

    &-name {
      text-align: center;
      color: var(--neutral);
      border-bottom: 1px solid var(--neutral);
    }

    &-logout {
      border: none;
      outline: none;
      font-size: 1rem;
      cursor: pointer;
      transition: 0.4s;
      margin-top: 10px;
      padding: 2px 15px;
      border-radius: 4px;
      background-color: transparent;

      &-mobile {
        color: var(--white);
        border: 1px solid var(--white);
      }

      &:hover {
        color: var(--primary);
      }
    }
  }

  &__logout-modal {
    display: flex;
    padding: 50px 0;
    align-content: center;
    justify-content: space-around;

    &--button {
      @include button();

      &:last-child {
        background-color: var(--dark-2);
      }
    }
  }
}

@media (max-width: 576px) {
  .header__user-info {
    display: none;
  }
}

@media (max-width: 767px) {
  .header {
    &__nav {
      display: none;
    }

    &__logout-modal {
      flex-direction: column;

      &--button {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
