<template>
  <main class="container">
    <h1><i class="material-icons text-muted">cloud_off</i></h1>
    <h2>Připojení nenalezeno</h2>
    <p class="lead">Navíc tato věc není dostupná offline.<br><small>Zkontrolujte připojení k internetu a zkuste načíst znovu.</small></p>
    <button class="btn btn-secondary" @click="$emit('reload-request')">
      Zkusit znovu
    </button>
    <br>&nbsp;
  </main>
</template>