<template>
  <div id="app">
    <app-alert />
    <app-loader />
    <app-header v-if="isLogged" />
    <router-view />
    <app-footer />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AppAlert from './components/global/Alert.vue';
import AppLoader from './components/global/Loader.vue';
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';

export default {
  name: 'App',

  components: {
    AppAlert,
    AppHeader,
    AppLoader,
    AppFooter,
  },

  mounted() {
    this.$firebase.auth().onAuthStateChanged((user) => {
      this.ACTION_SET_LOADER(true);

      if (!user) return this.ACTION_SET_LOADER(false);

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

      this.ACTION_SET_LOADER(false);

      if (this.$route.name === 'Home') {
        this.$router.push({ name: 'Dashboard' });
      }
    });
  },

  computed: {
    ...mapGetters(['isLogged']),
  },

  methods: {
    ...mapActions(['ACTION_SET_USER', 'ACTION_SET_SPOTIFY_ACCESS_TOKEN', 'ACTION_SET_LOADER']),
  },
};
</script>

<style lang="scss">
#app {
  padding-bottom: 40px;
}
</style>
