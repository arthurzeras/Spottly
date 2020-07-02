<template>
  <div id="app">
    <app-alert />
    <app-loader />
    <app-header v-if="isLogged" />
    <router-view />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AppAlert from './components/global/Alert.vue';
import AppLoader from './components/global/Loader.vue';
import AppHeader from './components/layout/AppHeader.vue';

export default {
  name: 'App',

  components: {
    AppAlert,
    AppHeader,
    AppLoader,
  },

  mounted() {
    this.$firebase.auth().onAuthStateChanged((user) => {
      this.$root.$emit('Loader::show');

      if (!user) return this.$root.$emit('Loader::hide');

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

      const spotifyToken = localStorage.getItem('spotify_token');

      if (spotifyToken) {
        this.ACTION_SET_SPOTIFY_ACCESS_TOKEN(spotifyToken);
      }

      this.$root.$emit('Loader::hide');

      if (this.$route.name === 'Home') {
        this.$router.push({ name: 'Dashboard' });
      }
    });
  },

  computed: {
    ...mapGetters(['isLogged']),
  },

  methods: {
    ...mapActions(['ACTION_SET_USER', 'ACTION_SET_SPOTIFY_ACCESS_TOKEN']),
  },
};
</script>

<style lang="scss"></style>
