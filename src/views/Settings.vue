<template>
  <section class="settings">
    <h1>Ajustes</h1>

    <ul class="settings__list">
      <li class="settings__list--item" v-for="(item, i) in items" :key="i">
        <span>{{ item }}</span>
        <i class="fa fa-chevron-right"></i>
      </li>
    </ul>

    <button class="settings__btn-remove-account">
      Excluir conta
    </button>
  </section>
</template>

<script>
export default {
  name: 'Settings',

  data: () => ({
    items: ['Postagem automática', 'Dia de postagem', 'Armazenar histórico'],
  }),
};
</script>

<style lang="scss">
.settings {
  display: flex;
  padding: 0 15px;
  flex-direction: column;
  height: calc(100vh - 110px);

  &__list {
    padding: 0;
    list-style: none;

    &--item {
      display: flex;
      padding: 10px 15px;
      margin-bottom: 15px;
      justify-content: space-between;
      border-bottom: 2px solid var(--light);

      .fa {
        color: var(--neutral-2);
      }
    }
  }

  &__btn-remove-account {
    padding: 5px;
    text-align: center;
    border-radius: 15px;
    color: var(--danger);
    background: var(--white);
    border: 1px solid var(--danger);
  }
}
</style>
