<template>
  <div id="app">
    <app-alert />
    <app-loader />
    <app-header />
    <router-view />
    <app-footer />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
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
    this.$firebase.auth().onAuthStateChanged(async (user) => {
      this.ACTION_SET_LOADER(true);

      if (!user) return this.ACTION_SET_LOADER(false);

      const { uid, providerData, metadata } = user;

      this.ACTION_SET_USER({
        uid,
        photoURL: providerData[0].photoURL,
        displayName: providerData[0].displayName,
        timestamps: {
          created: metadata.a,
          lastLogin: metadata.b,
        },
      });

      try {
        await this.$firebase.database().ref(`users/${uid}/metadata`).update({
          photoURL: providerData[0].photoURL,
        });
      } catch (error) {
        // Do nothing.
      }

      let userDataSnapshot = {};

      try {
        userDataSnapshot = await this.$firebase.database().ref(`users/${uid}`).once('value');
      } catch (error) {
        userDataSnapshot = {};
      }

      const { accessToken, refreshToken } = userDataSnapshot.val()?.credentials?.spotify || {};

      if (refreshToken) {
        localStorage.setItem('spotify_refresh', refreshToken);
      }

      if (accessToken) {
        this.ACTION_SET_SPOTIFY_ACCESS_TOKEN(accessToken);
      }

      this.ACTION_SET_LOADER(false);

      if (this.$route.name === 'Home') {
        const name =
          uid === process.env.VUE_APP_FIREBASE_ADMIN_UID
            ? 'Status'
            : this.$route?.params?.goTo
            ? this.$route?.params?.goTo
            : 'Dashboard';

        this.$router.push({ name });
      }
    });
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
