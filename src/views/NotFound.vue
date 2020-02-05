<template>
  <main class="container">
    <h1>Nenale<span class="text-danger">zeleno</span></h1>
    <p>Tuto stránku aplikace (PrAvDěpOdOBnĚ) neposkytuje. Pokud chcete prozkoumat, co jiného umí, podívejte se na <router-link to='/'>hlavní stránku</router-link>
      V některých vesmírech mají tyto chyby různé zajímavé stavové kódy. Naštěstí zde máme zařízení které vám pomůže zjsiti, co znamenají.
    </p>
    <div class="input-group mb-2">
        <input type="text" class='form-control mr-2' v-model='code' /><button class="btn btn-secondary" @click='submitedCode=code'>Co to znamená?</button>
    </div>
    <img :src='"https://http.cat/"+submitedCode' class='w-100 rounded'/>
  </main>
</template>
<script>
export default {
	data() {
		return {
            code:'404',
            submitedCode:'404'
        }
	},
	created() {
		this.$store.commit("changeTitle", "Dorostomládežový Zpěvníkátor");
	}
};
</script>