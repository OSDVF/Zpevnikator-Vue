<template>
  <div class="likeMain">
    <h5>
      Nastavení
    </h5>
    <p>
      Vítejte zpátky! Jste přihlášeni jako <strong>{{$store.state.loginState.name}}</strong> <button @click="logout" class="btn btn-primary btn-sm ml-3 mt-2 mt-md-0">Odhlásit se</button>
    </p>
  </div>
</template>
<script>
export default {
	methods: {
		logout() {
			this.$store.dispatch("logout");
		}
	}
};
</script>