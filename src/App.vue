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

  data: () => ({
    collection: null,
  }),

  mounted() {
    this.collection = this.$firebase.firestore().collection('users');

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
        const photoURL = providerData[0]?.photoURL || '';

        await this.collection.doc(uid).set(
          {
            metadata: {
              photoURL,
            },
          },
          { merged: true }
        );
      } catch (error) {
        // Do nothing.
      }

      let userDataSnapshot = {};

      try {
        userDataSnapshot = await this.collection.doc(uid).get();

        const { accessToken, refreshToken } = userDataSnapshot.data()?.credentials?.spotify || {};

        if (refreshToken) {
          localStorage.setItem('spotify_refresh', refreshToken);
        }

        if (accessToken) {
          this.ACTION_SET_SPOTIFY_ACCESS_TOKEN(accessToken);
        }
      } catch (error) {
        userDataSnapshot = {};
      }

      this.ACTION_SET_LOADER(false);

      if (this.$route.name === 'Home') {
        this.$router.push({ name: this.$route?.params?.goTo || 'Dashboard' });
      }
    });
  },

  methods: {
    ...mapActions(['ACTION_SET_USER', 'ACTION_SET_SPOTIFY_ACCESS_TOKEN', 'ACTION_SET_LOADER']),
  },
};
</script>

<style lang="scss">
@media (max-width: 576px) {
  #app {
    padding-bottom: 40px;
  }
}
</style>
