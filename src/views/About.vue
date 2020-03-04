<template>
  <main class="container">
    <div class="row">
      <div class='col-2'>
        <img src="images/icon-144.png" class="float-md-left mx-auto d-block d-md-inline mx-md-3 mb-3">
      </div>
      <div class='col'>
        <h2 class="mb-2">Dorostomládežový Zpěvníkátor</h2>
        Toto je projekt Dorostu a Mládeže evangelického sboru Na Rozvoji v Českém Těšíně.<br>
        Původně pro vnitřní účely, avšak možno použít všelijak.<br>
        <a href="http://dorostmladez.cz/">dorostmladez.cz</a><br><br>
        <a data-toggle="tooltip" class="text-secondary" title="Pokud vás zajímá proč to vůbec existuje, nebo byste rádi něčím přispěli, neváhejte napsat na o.s.dv.f@seznam.cz!">
          Software by &copy; O.S.DV.F {{date}}</a><br>
        Editor písní vytvořen Davidem Podeszwou<br>
        Technická podpora: ondra@dorostmladez.cz<br>
        <a href='https://github.com/OSDVF/Zpevnikator-Vue' class='d-block p-1'>Github <img src='https://github.com/OSDVF/Zpevnikator-Vue/workflows/Integration/badge.svg' /></a>
        <br>
      </div>
    </div>
  </main>
</template>
<script>
export default {
	computed: {
		date() {
			return new Date().getFullYear();
		}
	}
};
</script>