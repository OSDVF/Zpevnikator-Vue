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
        <h3 class="mb-1"> {{$root.stable?'Stabilní':'Experimentální'}} verze</h3>
        Máte verzi {{version}}, která byla zveřejněna {{currentCommitDate}}. <a class="text-visible" data-toggle="collapse" href="#thisVersionChanges">Co bylo naposledy vylepšeno? &darr;</a>
        <a class="p collapse" id="thisVersionChanges" :href="repository">
          <pre v-html="thisVersionChanges" class="btn-transparent d-inline-block p-3 mt-2" data-toggle="tooltip" title="Klikněte pro přesměrování na GitHub, kde se dozvíte více informací o vývoji projektu"></pre>
        </a><br>
        Nejnovější verze aplikace je z {{lastUpdate}}. <a href="#lastChanges" data-toggle='collapse' class="text-visible">Co bylo naposledy vylepšeno? &darr;</a>
        <a class="p collapse" id="lastChanges" :href="repository">
          <pre v-html="lastChanges" class="btn-transparent d-inline-block p-3 mt-2" data-toggle="tooltip" title="Klikněte pro přesměrování na GitHub, kde se dozvíte více informací o vývoji projektu"></pre>
        </a>
        <div v-if="$root.stable">
          <br />Pokud chcete vidět nejnovější funkce, podívejte se na
          <a href="https://alpha.dorostmladez.cz" class="text-visible">Experimentální verzi</a>
        </div>
        <div v-else>
          <br />Pokud chcete aplikaci používat s jistotou, že se nestane náhodná chyba, zkuste
          <a href="https://chvaly.dorostmladez.cz" class="text-visible">Stabilní verzi</a>
        </div>
        <br />
        <h3 class="mb-1">Vývoj</h3>
        <a data-toggle="popover" class="text-secondary" title="Chcete se přidat?" data-html="true" data-content="Pokud vás zajímá proč to vůbec existuje, nebo byste rádi něčím přispěli, neváhejte napsat na o.s.dv.f@seznam.cz, nebo se přidat k vývoji na <a href='https://github.com/OSDVF/Zpevnikator-Vue/'>GitHubu</a>">
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
const pending1 = "[zjišťování...]";
const pending2 = "Zjišťování...";

export default {
	data() {
		return { lastUpdate: pending1, lastChanges: pending2 };
	},
	created() {
		this.date = new Date().getFullYear();
		this.version = process.env.VUE_APP_VERSION;
		this.thisVersionChanges = process.env.VUE_APP_COMMIT_MESSAGE;
		this.currentCommitDate = process.env.VUE_APP_RELEASE_DATE;
		this.repository = process.env.VUE_APP_REPOSITORY;

		const _self = this;

		//Last app version info fetch
		(async () => {
			var ghApiJson = await fetch(process.env.VUE_APP_REPOSITORY_API + (_self.stable ? "commits/stable" : "commits/master"));
			var json = await ghApiJson.json();
			var d = new Date(json.commit.committer.date);
			_self.lastUpdate = d.toLocaleString();

			_self.lastChanges = json.commit.message;
		})();
	}
};
</script>