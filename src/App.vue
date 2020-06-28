<template>
  <div id="app">
    <app-header v-if="isLogged" />
    <router-view />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AppHeader from './components/layout/AppHeader.vue';

export default {
  name: 'App',

  components: {
    AppHeader,
  },

  mounted() {
    this.$firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const { uid, displayName, photoURL, metadata } = user;

        this.ACTION_SET_USER({
          uid,
          photoURL,
          displayName,
          timestamps: {
            created: metadata.a,
            lastLogin: metadata.b,
          },
        });

        if (this.$route.name === 'Home') {
          this.$router.push({ name: 'Dashboard' });
        }
      }
    });
  },

  computed: {
    ...mapGetters(['isLogged']),
  },

  methods: {
    ...mapActions(['ACTION_SET_USER']),
  },
};
</script>

<style lang="scss"></style>
