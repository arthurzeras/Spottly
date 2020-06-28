<template>
  <header class="header">
    <div class="header__logo">
      <img src="~@/assets/img/logo.png" alt="Logo" class="header__logo-img" />
      <span class="header__logo-title">Spottly</span>
    </div>

    <div class="header__user" ref="userElement">
      <img
        alt="User Image"
        :src="user.photoURL"
        class="header__user-img"
        @click="dropdownVisible = !dropdownVisible"
      />

      <div class="header__user-dropdown" v-show="dropdownVisible">
        <div class="header__user-name">{{ nameTruncated }}</div>

        <button class="header__user-logout">
          <span class="fa fa-power-off" />
          Sair
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState } from 'vuex';

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
    documentClickHandler(event = null) {
      const { target } = event;
      const el = this.$refs.userElement;

      if (target !== el && !el.contains(target)) {
        this.dropdownVisible = false;
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
  flex: 0 0 50%;
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
      margin-top: 10px;
      padding: 2px 15px;
      font-size: 1rem;
      border-radius: 4px;
      color: var(--white);
      background-color: transparent;
      border: 1px solid var(--white);
    }
  }
}
</style>
