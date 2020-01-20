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
          <span class="list-group-item" v-if='songInfo.status||songInfo.offlineOnly'><i class="material-icons">info</i>&ensp;<span id="specialStateLabel">Něco extra</span></span>
          <a id="video-link" :class="'list-group-item-action list-group-item'+(songInfo.video?'': ' d-none')"><i class="material-icons">video_library</i>&ensp;Video</a>
          <span class="list-group-item text-muted"><i class="material-icons">developer_mode</i>&ensp;ID: <span id="idInfo">{{songInfo.url}}</span></span>
        </div>
      </div>
      <div class="d-inline-block float-right col-sm-12 col-md-5">
        <div class="mb-2"><i class="material-icons">arrow_forward</i>&ensp;Akce<br></div>
        <div class="list-group list-group-flush">
          <button class="list-group-item-action list-group-item" @click="changeDisplayedSong(songInfo.url,true)"><i class="material-icons">update</i>&ensp;Aktualizovat</button>
          <button class="list-group-item-action list-group-item" @click="share"><i class="material-icons">share</i>&ensp;Sdílet</button>
          <a id="source" target="_blank" class="list-group-item-action list-group-item" :href="'https://dorostmladez.cz/song/'+songInfo.url+'/?print=txt'"><i class="material-icons">code</i>&ensp;Zobrazit zdroj</a>
          <a id="manage" class="list-group-item-action list-group-item" target='_blank' rel="nofollow" :href="info.adminUrl"><i class="material-icons">build</i>&ensp;Spravovat</a>
          <div id="actions">
            <button id="edit" class="list-group-item-action list-group-item" @click="edit"><i class="material-icons">edit</i>&ensp;Upravit&ensp;<span class="d-none text-warning" v-if="!(songInfo.status||songInfo.offlineOnly)"><i class="material-icons">warning</i> Nebyla přidána vámi</span></button>
            <button id="download" class="list-group-item-action list-group-item" @click="downloadSong"><i class="material-icons">save_alt</i>&ensp;Exportovat soubor</button>
            <button id="delet" class="list-group-item-action list-group-item" @click="deleteSong"><i class="material-icons">delete</i>&ensp;Smazat uloženou</button>
            <button id="exportText" class="list-group-item-action list-group-item" @click="exportText"><i class="material-icons">short_text</i>&ensp;Kopírovat text</button>
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
import { NetworkUtils, SongProcessing, UIHelpers, IOUtils } from "../js/Helpers";
import Settings from "../js/Settings";
import { SongDB } from "../js/databases/SongDB";
import PSON from "pson";
SongDB.onmessage = UIHelpers.Message; //Attach message listener

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
	activated() {
		if (Settings.WakeLock) {
			$(() => {
				if (UIHelpers.initializeNoSleep())
					UIHelpers.noSleep
						.enable()
						.then(function() {
							console.log("Enabling NoSleep");
						})
						.catch(function() {
							$(document).one("click mouseup touchend", function() {
								UIHelpers.noSleep.enable();
								console.log("Enabling NoSleep on click interaction");
							});
						});
			});
		}
	},
	deactivated() {
		if (UIHelpers.noSleep) {
			UIHelpers.noSleep.disable();
			UIHelpers.noSleep.enabled = false;
		}
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
		share() {
			if (typeof navigator.share != "undefined") navigator.share({ title: this.$store.state.title, url: location.href });
			else {
				const el = document.createElement("textarea");
				el.value = location.href;
				document.body.appendChild(el);
				el.select();
				document.execCommand("copy");
				document.body.removeChild(el);
				UIHelpers.Message("Zkopírováno do schránky", null, 1200);
			}
		},
		changeDisplayedSong(url, forceFetch) {
			this.songInfo.url = url;
			const _class = this;

			function getInfoFromDB() {
				SongDB.get(url, inf => {
					if (!inf && !url.startsWith("offline:")) {
						//Může se stát že píseň nějak chybí v indexu, tak ho pro jsitotu stáhneme znova
						SongDB.downloadIndex(displaySongInfoFromParams);
						return;
					}
					_class.songInfo = inf;
					_class.$store.commit("changeTitle", inf.name);
					if (inf.status) {
						$("#specialState i").replaceWith(SongProcessing.statusToIcon(inf.status));
						$("#specialStateLabel").html(SongProcessing.statusToDescription(inf.status));
					} else if (inf.offlineOnly) {
						$("#specialState i").html("cloud_off");
						$("#specialStateLabel").html("Jen v offline databázi");
					}
				});
			}

			if (SongDB.updatingIndex) SongDB.afterIndexUpdate(getInfoFromDB);
			else getInfoFromDB();
			this.info.adminUrl = process.env.VUE_APP_REMOTE_URL + "/api/go.php?cache=false&edit=" + url;
			const fetchUri = process.env.VUE_APP_REMOTE_URL + "/api/getsong.php?id=" + url + "&nospace=true";
			const dwnldPromise = forceFetch ? NetworkUtils.getNoCache(fetchUri) : NetworkUtils.CacheOrNetwork(fetchUri);
			dwnldPromise
				.then(response => {
					response.text().then(html => (_class.songHtml = Settings.HighlightAnchors ? SongProcessing.makeRightSequencesBold(html) : html));

					this.info.lastChanged = new Date(response.headers.get("Last-Modified")).toLocaleDateString("cs-CZ", opt);
					//nevím proč, ale Cloudfalre háže datum stažení do hlavičky Expires což je mi teď celkem užitečné :D
          this.info.downloaded = new Date(response.headers.get("Expires")).toLocaleDateString("cs-CZ", opt);
          if(forceFetch) UIHelpers.Message("Aktualizována","success",1000);
				})
				.catch(() => {
					this.songHtml = url.startsWith("offline:") ? offlineFailText : failText;
        });
        //Doesn't really belong here, but we are setting forceFetch only on song update so...
        if(forceFetch) UIHelpers.Message("Aktualizace písně");
		},

		exportText() {
			var cloned = $("#songWrapper").clone();
			cloned.find(".chord").remove();
			cloned.find("br").replaceWith("\n");
			cloned.find(".invisible").remove();
			var blob = IOUtils.CreateTxtBlob(cloned.text());
			var url = URL.createObjectURL(blob);
			var w = window.open(url);
			w.onload = ()=> {
				w.document.title = this.songInfo.name;
				URL.revokeObjectURL(url);
			};
		},
		downloadSong() {
			const sInfo = { info: this.songInfo, contents: this.songHtml };
			if (sInfo.info.status) delete sInfo.info.status;
			if (sInfo.info.offlineOnly) delete sInfo.info.offlineOnly;
			var pson = new PSON.StaticPair();
			var buffer = pson.toArrayBuffer([sInfo]); //Because importer expects a list
			var url = IOUtils.CreateUrlForDownload(buffer);
			var aProxy = document.createElement("a");
			aProxy.style = "display: none";
			aProxy.href = url;
			aProxy.download = sInfo.info.url + ".songs";
			document.body.appendChild(aProxy);
			aProxy.click();
			UIHelpers.Dialog(
				'Soubor "' +
					sInfo.info.url +
					".songs\" by nyní měl být ve vaší složce stažených souborů.<br>Na stránce <a href='/offline'><span class='pwa-d-none'>Aplikace</span><span class='d-none pwa-d-initial'>Spravovat stažené</span></a> pak můžete vy nebo někdo, komu písně pošlete, písně ze souborů importovat.",
				function() {
					window.URL.revokeObjectURL(url);
					aProxy.remove();
				},
				UIHelpers.DialogType.Ok,
				"Stáhnutí"
			);
		},
		deleteSong() {
			UIHelpers.Dialog(
				"Tato píseň " +
					(this.songInfo.imported
						? "pochází z naimportovaného souboru. Pokud ji chcete ještě někdy vidět, ujistěte se, že ji máte odkud znovu naimportovat nebo že existuje online."
						: this.songInfo.offlineOnly
						? "byla vytvořena offline. Není zatím publikována a pokud ji smažete, natrvalo o ni přijdete!"
						: "pochází z online databáze. Po smazání ji budete moct pravděpodobně stáhnout znovu (pokud ji někdo nesmaže z online databáze)."),
				null,
				UIHelpers.DialogType.YesNo,
				"Chcete pokračovat?",
				null,
				() => {
					var deletFromCache = caches.open(process.env.VUE_APP_SONG_DB_NAME).then(cache => {
						return cache.delete("/api/getsong.php?id=" + this.songInfo.url + "&nospace=true").then(response => {
							if (response) return Promise.resolve();
							else return Promise.reject();
						});
					});
					var deletFromList = new Promise((resolve, reject) => {
						SongDB.write(songStore => {
							var request = songStore.delete(this.songInfo.url);
							request.onsuccess = resolve;
							request.onerror = reject;
						});
					});
					Promise.all([deletFromCache, deletFromList])
						.then(function() {
							UIHelpers.Message("Uložená píseň smazána", "success");
						})
						.catch(function(e) {
							UIHelpers.Message("Nepodařilo se smazat", "danger");
							if (typeof Sentry != "undefined") Sentry.captureException(e);
						});
				}
			);
    },
    edit()
    {
      this.$route.push({name:'edit',query:this.songInfo.url});
    }
	}
};
</script>