<template>
  <section class="home">
    <aside class="home__image-container">
      <img
        class="home__image"
        alt="headset image"
        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
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
import { mapActions } from 'vuex';
import { auth } from 'firebase/app';

export default {
  name: 'Home',

  mounted() {
    this.getRedirectResult();
  },

  methods: {
    ...mapActions(['ACTION_SET_LOADER']),

    async login() {
      try {
        this.ACTION_SET_LOADER(true);

        await this.$firebase.auth().setPersistence(auth.Auth.Persistence.LOCAL);

        const provider = new auth.TwitterAuthProvider();

        this.$firebase.auth().signInWithRedirect(provider);
      } catch (error) {
        this.$root.$emit('Alert::show', 'Não foi possível fazer login no twitter, tente novamente');
      }
    },

    async getRedirectResult() {
      try {
        this.ACTION_SET_LOADER(true);

        const result = await this.$firebase.auth().getRedirectResult();

        if (!result.user || !result?.user?.providerData.length) return;

        const ref = this.$firebase.database().ref(`users/${result.user.uid}`);

        const snapshot = await ref.once('value');

        if (!snapshot.val()?.twitterActive) {
          await ref.set({ twitterActive: false });
        }

        const metadata = {
          ...result.user.providerData[0],
          username: result.additionalUserInfo.username,
        };

        await this.$firebase.database().ref(`users/${result.user.uid}/metadata`).set(metadata);

        await this.$firebase.database().ref(`users/${result.user.uid}/credentials/twitter`).set({
          secret: result.credential.secret,
          accessToken: result.credential.accessToken,
        });
      } catch (error) {
        const message = (error?.code || '').includes('auth')
          ? 'Não foi possível fazer login no twitter, tente novamente'
          : 'Ops, ocorreu algum problema ao salvar suas informações';

        this.$root.$emit('Alert::show', message);
      } finally {
        this.ACTION_SET_LOADER(false);
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

@media (max-width: 768px) {
  .home {
    margin: 15px;
    flex-direction: column;
    justify-content: center;
    width: calc(100% - 30px);

    &__image-container {
      padding: 0 30px;
    }

    &__content {
      padding: 0;
      margin-top: 15px;
      text-align: center;
    }

    &__button {
      margin: 0;
      width: 100%;
    }
  }
}

@media (max-width: 360px) {
  .home {
    &__content {
      h2 {
        font-size: 2rem;
      }

      p:nth-child(2) {
        font-size: 1rem;
      }

      p:nth-child(3) {
        font-size: 0.8rem;
      }
    }

    &__button-container {
      margin-top: 20px;
    }

    &__button {
      font-size: 0.9rem;
    }
  }
}
</style>
