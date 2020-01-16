<template>
  <main class="container">
    <div class="float-md-right">
      <div id="transpositionInfo" class="text-secondary font-weight-bold">{{transpositionInfo}}</div>
    </div>
    <div id="songWrapper" v-html="songHtml">
    </div>
    <div class="pb-2 d-flex flex-row-reverse" style="margin-top:-20px">
      <button data-target="#songInfo" data-toggle="collapse" class="text-muted btn btn-outline-light"><i class="material-icons">info</i></button>
    </div>
    <div class="collapse" id="songInfo">
      <div class="d-inline-block float-left col-sm-12 col-md-5">
        <div class="mb-2"><i class="material-icons">info</i>&ensp;Informace<br></div>
        <div class="list-group list-group-flush">
          <span class="list-group-item dateinfo"><i class="material-icons">schedule</i>&ensp;Změněno&nbsp;<span class="d-inline-block" id="last-changed">{{info.lastChanged}}</span></span>
          <span class="list-group-item dateinfo"><i class="material-icons">cloud_circle</i>&ensp;Staženo&nbsp;<span id="last-downloaded" class="d-inline-block">{{info.downloaded}}</span></span>
          <span :class="'list-group-item'+(songInfo.imported?'': ' d-none')" id="isImported"><i class="material-icons">open_in_browser</i>&ensp;Importovaná píseň</span>
          <span class="list-group-item d-none" id="specialState"><i class="material-icons">info</i>&ensp;<span id="specialStateLabel">Něco extra</span></span>
          <a id="video-link" :class="'list-group-item-action list-group-item'+(songInfo.video?'': ' d-none')"><i class="material-icons">video_library</i>&ensp;Video</a>
          <span class="list-group-item text-muted"><i class="material-icons">developer_mode</i>&ensp;ID: <span id="idInfo">{{songInfo.url}}</span></span>
        </div>
      </div>
      <div class="d-inline-block float-right col-sm-12 col-md-5">
        <div class="mb-2"><i class="material-icons">arrow_forward</i>&ensp;Akce<br></div>
        <div class="list-group list-group-flush">
          <button id="updateSong" class="list-group-item-action list-group-item"><i class="material-icons">update</i>&ensp;Aktualizovat</button>
          <a id="source" target="_blank" class="list-group-item-action list-group-item" :href="'https://dorostmladez.cz/song/'+songInfo.url+'/?print=txt'"><i class="material-icons">code</i>&ensp;Zobrazit zdroj</a>
          <a id="manage" class="list-group-item-action list-group-item" target='_blank' rel="nofollow" :href="info.adminUrl"><i class="material-icons">build</i>&ensp;Spravovat</a>
          <div id="actions">
            <button id="edit" class="list-group-item-action list-group-item"><i class="material-icons">edit</i>&ensp;Upravit&ensp;<span class="d-none text-warning" id="notMyWarn"><i class="material-icons">warning</i> Nebyla přidána vámi</span></button>
            <button id="download" class="list-group-item-action list-group-item"><i class="material-icons">save_alt</i>&ensp;Exportovat soubor</button>
            <button id="delet" class="list-group-item-action list-group-item d-none"><i class="material-icons">delete</i>&ensp;Smazat uloženou</button>
            <button id="exportText" class="list-group-item-action list-group-item"><i class="material-icons">short_text</i>&ensp;Kopírovat text</button>
            <a id="convert" data-html="true" data-content="Nejdříve musíte povolit notifikace. Klikněte na <i class='material-icons' aria-hidden='true'>settings</i> Nastavení -> Povolit notifikace" class="list-group-item-action list-group-item"><i class="material-icons typography-body-1">description</i>&ensp;Převést na Word</a>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<script>
const failText =
	'<p><i class="material-icons">flight_land</i><i class="material-icons">gavel</i><i class="material-icons">highlight_off</i><i class="material-icons">link_off</i><i class="material-icons">cloud_off</i><br><br>Tato píseň nebyla nalezena</p>';
const offlineFailText =
	'<p><i class="material-icons">explore_off</i><i class="material-icons">language</i><i class="material-icons">not_interested</i><br><br>Tato píseň byla pravděpodobně uložena offline na vašem zařízení ale nyní nebyla nalezena</p>';
const opt = { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" };
import { NetworkUtils, SongProcessing } from "../js/Helpers";
import Settings from '../js/Settings';
import {SongDB} from '../js/databases/SongDB'

export default {
	data() {
		return {
			songInfo: { url: "chyba" },
			songHtml: "Načítání",
			transpositionInfo: null,
			info: { lastChanged: "Neznámé", downloaded: "Neznámé", adminUrl: "https://dorostmladez.cz/wp-admin/edit.php?post_type=song" }
		};
	},
	mounted() {
		this.changeDisplayedSong(this.$route.query.id);
	},
	watch: {
		$route(to, from) {
			if (to.name == "song") {
				//This page becomes current
				this.changeDisplayedSong(this.$route.query.id);
			}
		}
	},
	methods: {
		changeDisplayedSong(url) {
      this.songInfo.url = url;
      SongDB.get(url,(inf)=>{
        this.songInfo = inf;
        this.$store.commit('changeTitle',inf.name);
      })
			this.info.adminUrl = process.env.VUE_APP_REMOTE_URL + "/api/go.php?cache=false&edit=" + url;
			const _class = this;
			NetworkUtils.CacheOrNetwork(process.env.VUE_APP_REMOTE_URL + "/api/getsong.php?id=" + url + "&nospace=true")
				.then(response => {
					response.text().then(html => (_class.songHtml = (Settings.HighlightAnchors?SongProcessing.makeRightSequencesBold(html): html)));

					this.info.lastChanged = new Date(response.headers.get("Last-Modified")).toLocaleDateString("cs-CZ", opt);
					//nevím proč, ale Cloudfalre háže datum stažení do hlavičky Expires což je mi teď celkem užitečné :D
					this.info.downloaded = new Date(response.headers.get("Expires")).toLocaleDateString("cs-CZ", opt);
				})
				.catch(() => {
					this.songHtml = url.startsWith("offline:") ? offlineFailText : failText;
				});
		}
	}
};
</script>