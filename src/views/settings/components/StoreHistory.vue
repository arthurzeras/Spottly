<template>
  <div class="store-history">
    <p>
      O armazenamento de histórico possibilita a contagem exata dos artistas ouvidos na semana. Essa
      funcionalidade armazena seu histórico da útlima semana de maneira independente.
    </p>
    <p>
      A diferença para o outro método é que usando a funcionalidade padrão do Spotify, o menor
      intervalo que conseguimos buscar é de mais ou menos do último mês.
    </p>
    <p>
      Essa funcionalidade ainda está em fase de testes, assim que estiver disponível anunciarei
      através do meu perfil no twitter:
      <a href="https://twitter.com/arthurzeras" target="_blank">@arthurzeras</a>.
    </p>

    <button class="store-history__button" disabled>
      Ativar armazenamento de histórico
    </button>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.store-history {
  p {
    font-size: 0.9rem;
  }

  &__button {
    @include button();
    margin: 0 auto;
    display: block;
    font-size: 1rem;
  }
}
</style>
