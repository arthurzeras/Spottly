<template>
  <article class="twitter-status">
    <h2 class="twitter-status__title">
      Postagem automática no twitter
    </h2>

    <div class="twitter-status__info">
      Ativada - Toda Segunda
    </div>

    <div class="twitter-status__buttons">
      <button class="twitter-status__button-status">
        Desativar
      </button>

      <button class="twitter-status__button-day">
        Alterar dia
      </button>
    </div>
  </article>
</template>

<script>
export default {
  name: 'TwitterStatus',
};
</script>

<style lang="scss">
.twitter-status {
  text-align: center;

  &__button {
    &-status {
      @include button();

      font-size: 1rem;
      margin-right: 5px;
      padding: 2px 20px;
    }

    &-day {
      @include button();

      font-size: 1rem;
      margin-left: 5px;
      padding: 2px 20px;
      color: var(--primary);
      border: 1px solid var(--dark);
      background-color: var(--white);

      &:hover {
        background-color: var(--dark);
      }
    }
  }
}
</style>
