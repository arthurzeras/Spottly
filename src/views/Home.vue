<template>
  <section class="home">
    <aside class="home__image-container">
      <img
        class="home__image"
        alt="headset image"
        src="https://images.unsplash.com/photo-1495305379050-64540d6ee95d?"
      />
    </aside>

    <article class="home__content">
      <h2>Olá!</h2>

      <p>Você gosta de ver as estatísticas de suas músicas ouvidas?</p>

      <p>
        Eu sou o Spottly, meu objetivo é usar suas informações de músicas ouvidas no Spotify e
        postar automaticamente no seu twitter para você!
      </p>

      <div class="home__button-container">
        <button class="home__button" @click="login()">
          Entrar com meu twitter
          <span class="fab fa-twitter" />
        </button>
      </div>
    </article>
  </section>
</template>

<script>
import { auth } from 'firebase/app';

export default {
  name: 'Home',

  methods: {
    async login() {
      try {
        await this.$firebase.auth().setPersistence(auth.Auth.Persistence.LOCAL);

        const provider = new auth.TwitterAuthProvider();

        const result = await this.$firebase.auth().signInWithPopup(provider);

        const credentials = JSON.stringify({
          secret: result.credentials.secret,
          accessToken: result.credentials.accessToken,
        });

        localStorage.setItem('credentials', credentials);
      } catch (error) {
        // TODO error
        // eslint-disable-next-line no-console
        console.error(error);
      }
    },
  },
};
</script>

<style lang="scss">
$off-container-padding: 50px;

.home {
  margin: 50px;
  display: flex;
  align-items: center;
  width: calc(100% - 100px);
  height: calc(100vh - 100px);

  &__image-container {
    flex: 0 0 30%;
    padding: 0 30px 0 $off-container-padding;
  }

  &__image {
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.8);
  }

  &__content {
    padding: 0 $off-container-padding 0 30px;

    h2 {
      margin: 0;
      padding: 0;
      font-size: 3rem;
    }

    p:nth-child(2) {
      font-size: 1.5rem;
    }
  }

  &__button-container {
    margin-top: 40px;
    text-align: center;
  }

  &__button {
    margin: 0 20px;
    line-height: 1;
    cursor: pointer;
    font-size: 1rem;
    transition: 0.4s;
    padding: 10px 50px;
    border-radius: 20px;
    border: 1px solid var(--dark);
    background-color: var(--light);

    &:hover {
      background-color: var(--white);
    }

    .fa-twitter {
      margin-left: 5px;
      color: #1a91da;
    }
  }
}
</style>
