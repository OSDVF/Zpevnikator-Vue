<template>
  <main class="homeWrapper">
    <div class="mainback"></div>
    <div class="mainInner"></div>
    <div class="mainpage container">
      <h1 class="typography-display-3 my-4" style="line-height:1.35">
        <span class="d-none d-md-inline">Dorostomládežový </span>Zpěvníkátor
      </h1>
      <div class="tricker mb-3">
        <h2>Rychlejší 🚀</h2>
        <h2>Kompaktnější 👜</h2>
        <h2>Praktičtější 💡</h2>
        <h2>Nástroj ke chvalám ⬆</h2>
      </div>
      <p class="font-weight-light typography-title mb-2">Písně 🎵 | Akordy 🎼 | Transpozice 📈 | Konverze do Wordu 📑</p>
      <p class="font-weight-light typography-subheading">✏ Editor písní | 📜 Poznámky</p>
      <button class="btn btn-transparent text-white" @click="addStar">
        🌟&ensp;
        <span id="starNum" data-toggle="tooltip" title="Tolik lidí už přidalo hvězdičku 😎">0</span>&ensp;
        <span data-toggle="tooltip" title="Líbí se mi to a chci přidat 🌟" style="background:#ffffff57;padding:15px 17px 15px 13px;margin:0 -17px 0 4px;">+1</span>
      </button>
      <hr />
      <p class="typography-subheading">To vše teď umí dorostomládežový zpěvník. Stačí jen vzít něco do ruky 🎹🎸🎤 a začít!</p>
      <div class="typography-caption p">
        {{stable?'Stabilní':'Experimentální'}} verze {{version}} <a href='#changes' data-toggle='collapse' class="text-visible">(poslední změna {{lastUpdate}})</a>
        <a class="p collapse" id="changes" :href="repository">
          <pre v-html="lastChanges" class="btn-transparent d-inline-block p-3 mt-2"></pre>
        </a>
        <div v-if="stable">
          <br />Pokud chcete vidět nejnovější funkce, podívejte se na
          <a href="https://alpha.dorostmladez.cz" class="text-visible">Experimentální verzi</a>
        </div>
		<div v-else>
			<br />Pokud chcete jistotu že se nestane náhodná chyba, zkuste
          <a href="https://chvaly.dorostmladez.cz" class="text-visible">Stabilní verzi</a>
		</div>
      </div>
      <p class="typography-caption">
        <a href="https://dorostmladez.cz/chvaly" target="_blank" class="text-visible">Stará verze zpěvníku zde (pro staré prohlížeče)</a>
      </p>
    </div>
  </main>
</template>
<style>
.homeWrapper {
	padding: 0;
	max-width: 100%;
}
.body-white .mainpage .text-visible {
	color: #3f51b5;
}
.tricker {
	overflow: hidden;
	height: 4.5rem;
}
.tricker h2 {
	margin: 0;
	font-size: 2rem;
	font-weight: 400;
	letter-spacing: -0.02em;
	height: 4.5rem;
	line-height: 4.5rem;
	transition: margin-top 0.3s ease;
}
.mainback {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgb(6, 3, 61);
	background: radial-gradient(at -20% 0%, rgb(6, 3, 61) 0%, rgb(10, 10, 108) 36%, rgba(255, 0, 108, 1) 200%);
	transition: opacity ease 0.5s;
	z-index: -1;
}
.body-white .mainback {
	background: linear-gradient(150deg, rgba(81, 167, 252, 1) 0%, rgba(108, 188, 245, 1) 100%);
}
.body-white .mainInner {
	z-index: -1;
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	opacity: 0.2;
	background: linear-gradient(-7deg, transparent 500px, white 501px);
}

.mainpage {
	padding-top: var(--offsetTop);
	color: white !important;
	text-align: center;
}
.body-black .mainpage {
	background: unset;
}
</style>

<script>
// @ is an alias to /src
import globalManager from "@/js/global";
import { NetworkUtils } from "@/js/Helpers";
export default {
	name: "home",
	data() {
		return { lastUpdate: "[zjišťování...]", lastChanges: "Zjišťování..." };
	},
	created() {
		this.version = process.env.VUE_APP_VERSION;
		this.repository = process.env.VUE_APP_REPOSITORY;
		this.stable = !location.hostname.startsWith("dev.") && location.hostname != "localhost"; //Development hostname
		const _self = this;
		(async () => {
			var ghApiJson = await fetch(process.env.VUE_APP_REPOSITORY_API + (_self.stable ? "commits/stable" : "commits/master"));
			var json = await ghApiJson.json();
			var d = new Date(json.commit.committer.date);
			_self.lastUpdate = d.toLocaleString();

			_self.lastChanges = json.commit.message;
		})();
	},
	mounted() {
		globalManager.resourcesReady(this, () => {
			NetworkUtils.getNoCache(process.env.VUE_APP_API_URL + "/telemetry/like.php").then(async function(response) {
				$("#starNum").text(await response.text());
			});
			var duration = 1700;
			var current = 1;
			if (window.innerWidth >= 768) {
				$(".tricker").append("<h2>Nebo prostě k jakémukoliv zpěvníkování 🤩</h2>");
				duration = 2500;
			}
			var tricker = $(".tricker");
			var height = tricker.height();
			var number = tricker.children().length;
			var first = tricker.children().first();

			setInterval(function() {
				var interv = current * -1 * height;
				first.css("margin-top", interv + "px");
				if (current == number) {
					first.css("margin-top", "0px");
					current = 1;
				} else {
					current++;
				}
			}, duration);
		});
	},
	methods: {
		addStar: function() {
			localStorage.getItem(settingsPrefix + "likeCount") ? localStorage[settingsPrefix + "likeCount"]++ : (localStorage[settingsPrefix + "likeCount"] = 1);
			if (localStorage[settingsPrefix + "likeCount"] < 4) {
				fetch(vue.app.VUE_APP_API_URL+"/telemetry/like.php", { method: "POST" });
				$("#starNum").text(parseInt($("#starNum").text()) + 1);
			} else {
				message("Zas to s tím lajkováním moc nepřehánějte 😁", null, 3000);
			}
		}
	},
	activated() {
		this.$store.commit("changeTitle", "O projektu");
	}
};
</script>
