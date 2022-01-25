<template>
  <section class="about">
    <article class="about__content">
      <h1>Sobre</h1>

      <p>
        O Spottly é um serviço semelhante ao

        <a
          target="_blank"
          class="about__link"
          v-html="'tweekly.fm'"
          rel="noopener noreferrer"
          href="https://tweekly.fm"
        />, porém, ao invés de buscar as estatísticas musicais do

        <a
          target="_blank"
          v-html="'last.fm'"
          class="about__link"
          href="https://last.fm"
          rel="noopener noreferrer"
        />, busca do Spotify, através de sua API.
      </p>

      <p>
        Mantemos apenas os dados necessários para buscar as estatísticas do Spotify e os dados para
        postá-los no twitter, não armazenamos dados pessoais e/ou postamos spam ou algo que não seja
        os artistas mais ouvidos.
      </p>

      <h3>Cookies</h3>

      <p>
        O que são cookies? Cookies são pequenos arquivos de dados armazenados em seu navegador ou
        dispositivo. Eles podem ser atendidos pela entidade que opera o site que você está visitando
        (chamados de “cookies primários”) ou por outras empresas (chamados “cookies de terceiros”).
      </p>

      <p>
        Quando você usa o Spottly, é coletado ou recebido automaticamente algumas informações sobre
        como você acessa o site, incluindo o tipo de dispositivo, sistema operacional e navegador
        que você usa, e quão rápida ou estável é sua conexão com a Internet. As informações que
        recebemos dependem do dispositivo que você está usando e de quais serviços você acessa.
      </p>

      <p>
        Desenvolvido e mantido por Arthur Oliveira.
      </p>

      <div>
        <a
          target="_blank"
          rel="noopener noreferrer"
          class="about__link-social"
          href="https://twitter.com/arthurzeras"
        >
          <span class="fab fa-2x fa-twitter" />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          class="about__link-social"
          href="https://instagram.com/arthurzeras_"
        >
          <span class="fab fa-2x fa-instagram" />
        </a>
      </div>
    </article>
  </section>
</template>

<script>
export default {
  name: 'About',
};
</script>

<style lang="scss">
.about {
  padding: 15px;
  display: flex;
  justify-content: center;

  &__content {
    width: 50%;
    h1 {
      font-size: 2rem;
    }

    p {
      text-align: justify;
    }
  }

  &__link {
    color: var(--primary);
    text-decoration: none;

    &-social {
      color: var(--dark);
      margin-right: 15px;

      &:hover {
        color: var(--primary);
      }
    }
  }
}

@media (max-width: 768px) {
  .about {
    &__content {
      width: 100%;
    }
  }
}
</style>
