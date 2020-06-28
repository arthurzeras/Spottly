<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'App',

  mounted() {
    this.$firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const { uid, displayName, photoURL } = user;
        this.ACTION_SET_USER({ uid, displayName, photoURL });

        if (this.$route.name === 'Home') {
          this.$router.push({ name: 'Dashboard' });
        }
      }
    });
  },

  methods: {
    ...mapActions(['ACTION_SET_USER']),
  },
};
</script>

<style lang="scss"></style>
