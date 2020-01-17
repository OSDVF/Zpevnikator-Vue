<template>
  <main class="container">
    <div class="p">
      <button class="btn btn-secondary pwa-d-none mb-2" onclick="checkState(false,true)">Stáhnout offline</button>
      <button class="btn btn-light mb-2" @click="updateIndex">Aktualizovat index písní</button>&ensp;
      <a data-toggle="collapse" href="#moreOptions">Více...</a>
      <p class="collapse" id="moreOptions">
        <button class="btn btn-danger mb-2 mr-2" @click="purgeSongs">Smazat databázi</button>
        <button class="btn btn-danger mb-2" @click="resetSettings">Tovární předvolby</button>
      </p>
    </div>
    <div class="card bg-white fw p mb-4">
      <div class="card-body bg-white">
        <h5 class="card-title bg-white">Aktuální stav</h5>
      </div>
      <div class="list-group list-group-flush">
        <span :class="$store.state.workerState>=1?'list-group-item' :'list-group-item disabled'" id="registrated">
          <i class="material-icons">info</i>&ensp;Registrace v prohlížeči
          <i class="material-icons rotating d-none loading-icon">autorenew</i>
        </span>
        <span :class="'list-group-item' + ($store.state.workerState>=4?'':' disabled')" id="basic">
          <i class="material-icons">cloud_download</i>&ensp;Stáhnutí základních souborů
          <i class="material-icons rotating d-none loading-icon">autorenew</i>
        </span>
        <span :class="'list-group-item' + ($store.state.workerState>=6?'':' disabled')" id="extended">
          <i class="material-icons">offline_bolt</i>&ensp;Stáhnutí externích souborů
          <i class="material-icons rotating d-none loading-icon">autorenew</i>
        </span>
        <span :class="'list-group-item' + (insidePwa?'':' disabled')" id="installation">
          <i class="material-icons">exit_to_app</i>&ensp;Instalace
          <span class="float-right">
            <button id="offlineEnable" class="btn btn-outline-secondary d-none">Počkejte prosím..</button>&ensp;
            <i class="material-icons rotating d-none loading-icon">autorenew</i>
          </span>
        </span>
        <div :class="'list-group-item' + (allSongsDown?'':' disabled')" id="all_song_download">
          <i class="material-icons">touch_app</i> Stáhnutí písní
          <span class="float-right">
            <button class="btn btn-outline-secondary" id="songDownloadBtn" onclick="downloadAllSongs()">Stáhnout všechny písně</button>&ensp;
            <i class="material-icons rotating d-none" id="songProgressCircle">autorenew</i>
          </span>
          <br style="clear:both" />
          <span id="songStatus" class="text-warning"></span>
        </div>
      </div>
    </div>
    <h4>Správa písní</h4>
    <div class="mb-4">
      <input type="file" class="custom-file-input w-25 position-absolute" id="inputFile" accept=".songs" multiple />
      <label class="btn btn-primary" for="inputFile" id="importButton">Importovat písně</label>
      <br />
      <span class="text-muted typography-caption">- nebo -</span>
      <br />
      <button class="btn btn-secondary mt-2" id="exportButton">Zálohovat stažené do souboru</button>
    </div>
    <h4 class="pwa-d-none">Je možné stáhnout apliakci?</h4>
    <h4 class="d-none pwa-d-initial">Váš systém</h4>
    <p>
      Verze Chrome/Safari: <span :class="browserDetected?'text-success':'text-warning'">{{browserVersion}}</span>
      <br />
      <span class="pwa-d-none">
        Verdikt: <span :class="verdictClass" v-html="detectionResult"></span>
      </span>
      <span class="d-none pwa-d-initial">
        Verze stažené aplikace: {{version}}
      </span>
    </p>
    <h4 class="pwa-d-none">
      <a id="navody">Nelze nainstalovat?</a>
    </h4>
    <div class="list-group pwa-d-none" id="installManuals">
      <div class="expansion-panel pwa-d-none list-group-item manualInstallation">
        <a aria-controls="collapseInstallOne" aria-expanded="false" class="expansion-panel-toggler collapsed manualInstallation" data-toggle="collapse" href="#collapseInstallOne">
          Manuální přidání na Androidu
          <div class="expansion-panel-icon ml-3 text-light-50">
            <i class="collapsed-show material-icons">keyboard_arrow_down</i>
            <i class="collapsed-hide material-icons">keyboard_arrow_up</i>
          </div>
        </a>
        <div class="collapse manualInstallation" data-parent="#installManuals" id="collapseInstallOne">
          <div class="expansion-panel-body">
            V nabídce vpravo nahoře najděte "Přidat na plochu"
            <picture class="d-block">
              <source srcset="images/to_screen.webp" type="image/webp" />
              <img id="manualInstalImg" src="images/to_screen.png" />
            </picture>
          </div>
        </div>
      </div>
      <div class="expansion-panel pwa-d-none list-group-item iOSInstallation">
        <a aria-controls="collapseInstalliOS" aria-expanded="false" class="expansion-panel-toggler collapsed iOSInstallation" data-toggle="collapse" href="#collapseInstalliOS">
          Manuální přidání na iOS
          <div class="expansion-panel-icon ml-3 text-light-50">
            <i class="collapsed-show material-icons">keyboard_arrow_down</i>
            <i class="collapsed-hide material-icons">keyboard_arrow_up</i>
          </div>
        </a>
        <div class="collapse iOSInstallation" data-parent="#installManuals" id="collapseInstalliOS">
          <div class="expansion-panel-body">
            V nabídce
            <img src="images/iOSoptions.png" class="rounded" /> najděte "Přidat na plochu"
            <img class="d-block mt-2 rounded" src="images/a2hsiOS.png" />
          </div>
        </div>
      </div>
      <div class="expansion-panel pwa-d-none list-group-item desktopManual">
        <a aria-controls="collapseInstallTwo" aria-expanded="false" class="expansion-panel-toggler collapsed desktopManual" data-toggle="collapse" href="#collapseInstallTwo">
          Manuální přidání na PC
          <div class="expansion-panel-icon ml-3 text-light-50">
            <i class="collapsed-show material-icons">keyboard_arrow_down</i>
            <i class="collapsed-hide material-icons">keyboard_arrow_up</i>
          </div>
        </a>
        <div class="collapse desktopManual" data-parent="#installManuals" id="collapseInstallTwo">
          <div class="expansion-panel-body">
            Najděte v menu "Přidat zástupce" nebo "Nainstalovat aplikaci D&amp;M Zpěvník
            <picture class="d-block mb-1">
              <source srcset="images/to_desktop.webp" type="image/webp" />
              <img src="images/to_desktop.png" />
            </picture>
          </div>
        </div>
      </div>
    </div>
    <br />
    <h4>Podrobnosti o offline aplikaci</h4>
    <ul>
      <li>
        <a href="offline-internals">Jak to funguje?</a>
      </li>
      <li>
        <a href="offline-internals#pozadavky">Co k tomu potřebuji?</a>
      </li>
      <li>
        <a href="offline-internals#faq">Řešení problémů...</a>
      </li>
    </ul>
    <div class="modal fade light" id="manualInstallPrompt" tabindex="-1" role="dialog" aria-labelledby="manualInstallLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="manualInstallLabel">Nainstalujte manuálně</h5>
          </div>
          <div class="modal-body">
            <P class="ios-d-none">
              Je to trochu zapeklité..
              <ul>
                <li>Váš prohlížeč ještě nepodporuje instalaci aplikací přímo ze stránky nebo..</li>
                <li>Aplikaci už máte dávno nainstalovanou (podívejte se na vaši plochu nebo chrome://apps)</li>
                <li>Nebo prostě vznikla jiná chyba 😅. Postupujte podle návodu Manuální instalace.</li>
              </ul>
            </P>
            <P class="ios-d-block">Na Apple zařízejích není automatická instalce možná, prosím postupujte podle návodu 🔽</P>
            <button class="btn btn-secondary" data-dismiss="modal" onclick="document.getElementById('navody').scrollIntoView()" aria-label="Jít na návod">Jít na návod</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { MyServiceWorker, Environment, UIHelpers, SongProcessing } from "../js/Helpers";
import { SongDB } from '../js/databases/SongDB';
const WorkerStates = Object.freeze({0:'dead',1:'ready',3:'downloadingLocal',4:'downloadedLocal',5:'downloadingExternal',6:'downloadedExternal',7:'essential_ok'});
export default {
	data() {
		return {
			detectionResult: "Nevím jestli to bude fungovat, ale můžete to zkusit :D",
			browserVersion: "Neznámá",
			browserDetected: false,
			verdictClass: "text-primary",
			allSongsDown:true
		};
	},
	created() {
		this.version = process.env.VUE_APP_VERSION;
		this.insidePwa = Environment.InsidePwa;
	},
	mounted() {
		"use strict";
		MyServiceWorker.Ready().then(function() {
			var btn = $("#offlineEnable").html("Stáhnout aplikaci..");
			btn.tooltip("disable");
		});
		//checkState(true); //Without download
		var fileInput = document.getElementById("inputFile");
		var importButton = document.getElementById("importButton");
		var btnAdd = $("#offlineEnable")[0];
		const mess = "<span class='text-success'>&nbsp;(Váš případ)</span>";
		var raw = navigator.userAgent.match(/Chrom(e|ium)\/(\d+)\./);
		var chromeVersion = raw ? parseInt(raw[2], 10) : 0;

		var rawSafari = navigator.userAgent.match(/Version\/(\d+).*Safari/);
		var safariVersion = rawSafari ? parseInt(rawSafari[1], 10) : 0;
		if (chromeVersion) {
      this.browserVersion = chromeVersion;
      this.browserDetected = true;
    }
		else if (safariVersion) {
			this.browserVersion = safariVersion;
			this.detectionResult = "Aplikace není pro iOS a MacOS optimalizována. Ale měla by fungovat od <b>Safari 11</b>.<br>Na jiných prohlížečích na těchto systémech <b>nefunguje</b>";
      this.verdictClass = "text-warning";
      this.browserDetected = true;
		}
		if (Environment.isMobile.Android()) {
			$(".manualInstallation").addClass("show");
			$(".manualInstallation .expansion-panel-icon").prepend(mess);
		} else if (Environment.isMobile.iOS()) {
			$(".ios-d-none").hide();
			$(".ios-d-block").show();
			$(".iOSInstallation").addClass("show");
			$(".iOSInstallation .expansion-panel-icon").prepend(mess);
		} else {
			$(".ios-d-block").hide();
			$(".desktopManual").addClass("show");
			$(".desktopManual .expansion-panel-icon").prepend(mess);
		}
		if (chromeVersion >= 70) {
			this.detectionResult = "Jupí, u vás není pochybností, že by to nemohlo fungovat!<br>" + "Spustě automatickou instalaci tlačítkem.";
			this.verdictClass = "text-success";
		} else if (chromeVersion > 67) {
			this.detectionResult =
				"Je hodně pravděpodobné ze by to mohlo fungovat<br>" + "Po kliknutí na tlačítko a stažení stránek se zobrazí výzva k instalaci aplikace. Pokud ne, postupujte podle návodu:";
			this.verdictClass = "text-success";
		} else if (chromeVersion >= 57) {
			this.detectionResult =
				"Je hodně pravděpodobné ze by to mohlo fungovat<br>" + "Po kliknutí na tlačítko a stažení stránek se zobrazí výzva k instalaci aplikace. Pokud ne, postupujte podle návodu:";
			this.verdictClass = "text-success";
		} else if (chromeVersion >= 45) {
			this.detectionResult =
				"Nebudete zpěvník sice vidět v seznamu aplikací, ale budete mít zástupce na ploše. Po kliknutí na tlačítko a stažení stránek se zobrazí výzva k přidání aplikace.<br>Pokud ne, postupujte podle návodu:";
			this.verdictClass = "text-success";
		} else if (chromeVersion > 39) {
			this.detectionResult = "Minimálně když zobrazíte v prohlížeči stránku chvaly.dorostmladez.cz, měla by být dostupná offline. Jestli vam půjde nainstalovat aplikaci je neznáme...";
		} else {
			this.detectionResult = "Vám to spíš nebude vůbec fungovat.";
      this.verdictClass = "text-danger";
      this.browserDetected = false;
		}
	},
	methods: {
		exportSong() {
			var songsArray = [];
			caches.open(process.env.VUE_APP_SONG_DB_NAME).then(function(cache) {
				return cache.keys().then(function(keys) {
					cache.matchAll("/api/getsong.php", { ignoreSearch: true }).then(function(responses) {
						return SongDB.read(function(songStore) {
							for (let i = 0; i < responses.length; i++) {
								var response = responses[i];
								var url = response.url;
								if (url == "") url = response.headers.get("Referer"); //In case of imported songs

								var startIndex = url.indexOf("id=");
								var endIndex = (url.indexOf("&") + 1 || url.length + 1) - 1;
								let id = url.substring(startIndex + 3, endIndex);

								let songInfo = {};
								var dbPromise = new Promise(function(resolve, reject) {
									songStore.get(id).onsuccess = function(event) {
										if (event.target.result) {
											songInfo.info = event.target.result;
											if (songInfo.info.status) delete songInfo.info.status;
											if (songInfo.info.offlineOnly) delete songInfo.info.offlineOnly;
											resolve();
										} else {
											console.error('Could not find info about song "' + id + '"');
											reject();
										}
									};
								});
								var cachePromise = response.text().then(function(text) {
									songInfo.contents = text;
									return Promise.resolve();
								});
								Promise.all([dbPromise, cachePromise]).then(function() {
									songsArray.push(songInfo);
									if (i == responses.length - 1) {
										UIHelpers.Dialog(
											'<div class="d-flex"><input type="text" id="downFileName" placeholder="Jméno souboru" value="ZpěvníkátorExport" class="form-control mr-2"><div class="m-auto mr-1">.songs</div></div>',
											function(result) {
												if (result == "ok") {
													var fileName = document.getElementById("downFileName").value;
													var pson = new PSON.ProgressivePair();
													var buffer = pson.toArrayBuffer(songsArray);
													// var url = IOUtils.CreateUrlForDownload(JSON.stringify(songsArray));
													var url = IOUtils.CreateUrlForDownload(buffer);
													var aProxy = document.createElement("a");
													aProxy.style = "display: none";
													aProxy.href = url;
													aProxy.download = fileName + ".songs";
													document.body.appendChild(aProxy);
													aProxy.click();
													UIHelpers.Dialog(
														'Soubor "' +
															fileName +
															".songs\" by nyní měl být ve vaší složce stažených souborů.<br>Na stránce <a href='/offline'><span class='pwa-d-none'>Stáhnout</span></a> pak můžete vy nebo někdo, komu písně pošlete, písně ze souborů importovat.",
														function() {
															window.URL.revokeObjectURL(url);
															aProxy.remove();
														},
														UIHelpers.DialogType.Ok,
														"Stáhnutí"
													);
												}
											},
											UIHelpers.DialogType.OkCancel,
											"Zadejte jméno exportovaného souboru"
										);
									}
								});
							}
						});
					});
				});
			});
		},
		purgeSongs() {
			UIHelpers.Dialog(
				"Bude smazán index písní a všechny offline písně včetně rozepsaných a nepublikovaných. Poté je můžete stáhnou znovu nebo importovat ze souborů.",
				function(res) {
					if (res == "yes") {
						caches.delete(songCache);
						function fReload() {
							location.reload(true);
						}
						SongDB.delete(fReload, fReload);
					}
				},
				UIHelpers.DialogType.YesNo,
				"Chcete pokračovat?"
			);
		},
		resetSettings() {
			UIHelpers.Dialog(
				"Nastavení aplikace včetně vybrané transpozice písní bude obnoveno na počáteční hodnoty. Offline databáze zůstane zachována.",
				function(res) {
					if (res == "yes") {
						localStorage.clear();
						location.reload(true);
					}
				},
				UIHelpers.DialogType.YesNo,
				"Chcete pokračovat?"
			);
		},
		fileImport(event) {
			var curFiles = this.files;
			if (curFiles.length === 0) {
				UIHelpers.Message("Žádné soubory nevybrány", "danger", 3000);
			} else {
				var newSongs = 0;
				var changedSongs = 0;
				var exceptions = [];
				for (let i = 0; i < curFiles.length; i++) {
					let file = curFiles[i];
					var r = new FileReader();
					r.onload = function(e) {
						try {
							caches.open(songCache).then(function(cache) {
								var pson = new PSON.ProgressivePair();
								var songsInfo = pson.decode(e.target.result);
								if (songsInfo.length)
									for (let j = 0; j < songsInfo.length; j++) {
										let songInfo = songsInfo[j];
										if (songInfo.info && songInfo.info.url && songInfo.info.name && songInfo.contents) {
											songInfo.info.imported = true;
											SongDB.Inject(cache, songInfo.info.url, songInfo.contents);
											SongDB.updateSong(null, songInfo.info, function(changedInfo) {
												if (changedInfo.isNew) newSongs++;
												else if (changedInfo.isChanged) changedSongs++;

												if (i == curFiles.length - 1 && j == songsInfo.length - 1) {
													SongDB.informAboutChanges(changedSongs, newSongs);
													importButton.insertAdjacentHTML("afterend", '<i class="ml-4 text-success material-icons">check</i>');
													$("#inputFile").val("");
												}
											});
										} else {
											if (i == curFiles.length - 1 && j == songsInfo.length - 1) {
												SongDB.informAboutChanges(changedSongs, newSongs);
												importButton.insertAdjacentHTML(
													"afterend",
													'<i class="ml-4 text-success material-icons">check</i><span class="text-warning"> (byly nalezeny chyby)</span>'
												);
												$("#inputFile").val("");
											}
											exceptions.push(new SyntaxError("Song JSON badly formatted", file.name, j));
										}
									}
								else {
									exceptions.push(new SyntaxError("Song list JSON badly formatted", file.name));
								}
								for (var ex of exceptions) console.warn(ex);
							});
						} catch (e) {
							console.warn(e);
							UIHelpers.Message("Chyba při čtení souboru " + file.name, "warning", 3000);
							if (i == curFiles.length - 1) {
								importButton.insertAdjacentHTML("afterend", '<i class="ml-4 text-warning material-icons">warning</i><span class="text-warning"> (byly nalezeny chyby)</span>');
								SongDB.informAboutChanges(changedSongs, newSongs);
								$("#inputFile").val("");
							}
						}
					};
					r.readAsArrayBuffer(file);
				}
			}
		},
		updateIndex()
		{
			SongDB.downloadIndex();
		}
	},
	activated() {
		this.$store.commit("changeTitle", "Správa aplikace");
	}
};
</script>