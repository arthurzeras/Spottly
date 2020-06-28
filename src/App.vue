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

        const spotifyToken = localStorage.getItem('spotify_token');

        if (spotifyToken) {
          this.ACTION_SET_SPOTIFY_ACCESS_TOKEN(spotifyToken);
        }

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
    ...mapActions(['ACTION_SET_USER', 'ACTION_SET_SPOTIFY_ACCESS_TOKEN']),
  },
};
</script>

<style lang="scss"></style>
