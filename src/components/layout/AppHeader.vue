<template>
  <header class="header">
    <div class="header__logo">
      <img src="~@/assets/img/logo.png" alt="Logo" class="header__logo-img" />
      <span class="header__logo-title">Spottly</span>
    </div>

    <span class="header__beta-info">BETA</span>

    <div class="header__user" ref="userElement">
      <img
        alt="User Image"
        :src="user.photoURL"
        class="header__user-img"
        @click="dropdownVisible = !dropdownVisible"
      />

      <div class="header__user-info">
        <span :title="user.displayName">Olá, {{ nameTruncated }}</span>

        <button class="header__user-logout" title="Sair" @click="logout()">
          <span class="fa fa-power-off" />
        </button>
      </div>

      <div class="header__user-dropdown" v-show="dropdownVisible">
        <div class="header__user-name">{{ nameTruncated }}</div>

        <button class="header__user-logout header__user-logout-mobile" @click="logout()">
          <span class="fa fa-power-off" />
          Sair
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'AppHeader',

  data: () => ({
    dropdownVisible: false,
  }),

  mounted() {
    document.addEventListener('click', (event) => this.documentClickHandler(event));
  },

  computed: {
    ...mapState(['user']),

    nameTruncated() {
      const { displayName: name } = this.user;
      const newName = name.substr(0, 27);

      return name.length > 30 ? `${newName}...` : name;
    },
  },

  methods: {
    ...mapActions(['ACTION_SET_USER']),

    documentClickHandler(event = null) {
      const { target } = event;
      const el = this.$refs.userElement;

      if (target !== el && !!el && !el.contains(target)) {
        this.dropdownVisible = false;
      }
    },

    async logout() {
      await this.$firebase.auth().signOut();

      this.ACTION_SET_USER({});

      this.$router.push({ name: 'Home' });
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
  flex: 0 0 50%;
  display: flex;
  align-items: center;
}

.header {
  width: 100%;
  height: 50px;
  display: flex;
  padding: 0 15px;

  &__beta-info {
    top: 15px;
    left: 120px;
    position: absolute;
  }

  &__logo {
    @include columns();

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
  }

  &__user {
    @include columns();
    justify-content: flex-end;

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
}

@media (max-width: 576px) {
  .header__user-info {
    display: none;
  }
}
</style>
