<template>
  <main>
    <div class="d-none text-success my-2" id="offlineInfo">
      <i class="material-icons">feedback</i> Písně, které jsou zobrazeny zeleně jsou dostupné offline
      <button class="btn btn-success btn-sm ml-2" onclick="Settings.DisplayedOfflineListInfo=true;$('#offlineInfo').hide()">
        Rozumím
      </button>
    </div>
    <span class="d-flex justify-content-between mx-2">
      <span class="clearable w-100">
        <input class="form-control" id="searchAboveTable" type="text" @keydown="searchTable()" placeholder="Vyhledat" aria-label="Vyhledat p\u00EDse\u0148">
        <i class="clearable__clear" @click="clearSearch">&times;</i>
      </span>
      <button data-toggle="tooltip" data-placement="bottom" @click="searchTable()" title="Hledat p\u00EDse\u0148" class="btn btn-outline-success ml-2">
        <i class="material-icons" aria-hidden="true">search</i>
        <span class="sr-only">Hledat</span>
      </button>
    </span>
    <table id="wpsongbook_list" class="wpsongbook_list table table-striped table-hover table-bordered table-light">
      <thead>
        <tr>
          <th>Název</th>
          <th>Autor</th>
          <th>Jazyk</th>
        </tr>
      </thead>
    </table>
	<br>
    <div class="fab-right">
      <button class="btn btn-float btn-secondary m-3" type="button" data-placement="left" data-toggle="tooltip" title="Aktualizovat seznam" @click="refreshListClicked">
        <i class="material-icons">refresh</i>
      </button>
    </div>
    <link rel="stylesheet" href="https://cdn.datatables.net/1.10.19/css/dataTables.bootstrap4.min.css" crossorigin="anonymous">
  </main>
</template>
<script>
import Settings from "@/js/Settings.js";
import { SongDB } from "@/js/databases/SongDB.js";
import { SongProcessing} from "@/js/Helpers.js"

const language = require("@/assets/Czeski.json");
export default {
	mounted() {
		const _class = this;
		this.cursorEnded = false; //To control whether initialization was completed
		this.searchBar = document.getElementById("searchAboveTable");
		var theTable = $("#wpsongbook_list");
		_class.tab = theTable.DataTable({
			stateSave: true,
			paging: this.$parent.preferences.TablePaging,
			search: {
				caseInsensitive: true
			},
			pageLength: 10,
			dom: '<"table-scroller"t>ip',
			language: language,
			initComplete: function() {
				if (window.waitingForIndex) $(".dataTables_empty").html("Počkejte na stažení indexu...&ensp;<i class='material-icons rotating'>autorenew</i>");
				//window.tableWraperElement = $("#wpsongbook_list_wrapper");
			},
			drawCallback: function() {
				if (SongDB.updatingIndex) {
					SongDB.afterIndexUpdate(function() {
						_class.tab.clear();
						_class.updateTable();
					});
				} else if (_class.cursorEnded) {
					//Now The table IS filled with values
					if (!Settings.Optimizations) {
						$(".imp")
							.parent()
							.parent()
							.tooltip({ title: "Importovaná píseň" });
						$(".draft")
							.parent()
							.parent()
							.tooltip({
								title: "Online jen pro vás, čekající na publikaci"
							});
						$(".pending")
							.parent()
							.parent()
							.tooltip({ title: "Čekající na schválení" });
						$(".future")
							.parent()
							.parent()
							.tooltip({
								title: "Bude publikován v budoucnosti"
							});
						$(".private")
							.parent()
							.parent()
							.tooltip({ title: "Soukromá" });
						$(".publish")
							.parent()
							.parent()
							.tooltip({ title: "Vámi publikováno" });
						$(".oonly")
							.parent()
							.parent()
							.tooltip({ title: "Jen v offline databázi" });
					}

					if (localStorage.lastListScroll)
						//Restore previous scroll position
						document.documentElement.scrollTop = localStorage.lastListScroll;
					localStorage.removeItem("lastListScroll");
				}

				_class.refreshClearables();
			}
		});
		theTable.click(function(e) {
			if (e.target && e.target.nodeName == "TD" && e.target.parentElement.nodeName == "TR") {
				var sId = e.target.parentElement.attributes["href"].value;
				localStorage.lastListScroll = document.documentElement.scrollTop;
				if (sId) _class.$router.push({ name: "song", query: { id: sId } });
				return false;
			}
		});

		_class.updateTable();
	},
	methods: {
		upd(cache) {
			const _class = this;
			try {
				SongDB.read(function(songStore) {
					var request = songStore.openCursor();
					var processedEntries = 0;
					var lastEntryNumber = 0;
					var infDisplayed = false;
					request.onsuccess = function(event) {
						var cursor = event.target.result;
						if (cursor) {
							processedEntries++;
							let value = cursor.value;
							function processRow(match, entryNumber) {
								lastEntryNumber = entryNumber;
								var offl = !!match;
								if (offl && !Settings.DisplayedOfflineListInfo && !infDisplayed) {
									infDisplayed = true;
									document.getElementById("offlineInfo").classList.remove("d-none");
								}
								value.author = value.author || "";
								value.language = value.language || "";
								if (value.imported) value.name += '&ensp;<i class="text-muted imp material-icons">open_in_browser</i>';
								if (value.status) {
									value.name += "&ensp;" + SongProcessing.statusToIcon(value.status);
								} else if (value.offlineOnly) value.name += '&ensp;<i class="text-warning oonly material-icons">cloud_off</i>';
								_class.tab.row.add(
									$(
										"<tr" +
											' href="' +
											value.url +
											'"' +
											(offl ? " class='offline'>" : ">") +
											"<td>" +
											value.name +
											"</td><td>" +
											value.author +
											"</td><td>" +
											value.language +
											"</tr>"
									)[0]
								);
								if (_class.cursorEnded) {
									_class.searchTable();
									console.debug("Cursor ended. Searching");
								}
							}
							if (cache)
								cache.match("/api/getsong.php?id=" + value.url + "&nospace=true").then(function(mtch) {
									processRow(mtch, processedEntries);
								});
							else processRow(null, processedEntries);
							cursor.continue();
						} else if (!processedEntries) {
							setTimeout(function() {
								if (!SongDB.updatingIndex) {
									SongDB.downloadIndex();
								}
								$(".dataTables_empty").html("Počkejte na stažení indexu...&ensp;<i class='material-icons rotating'>autorenew</i><br><a href='offline'>Stáhnout manuálně</a>");
								window.waitingForIndex = true;
							}, 1000); //To give index download job some time to start
						} else {
							_class.cursorEnded = true;
							if (window.tableWraperElement) {
								_class.searchQuery = $("#searchBar").val() || _class.tab.search();
							}
							if (lastEntryNumber == processedEntries) {
								//Cache processed all before this line gets executed
								_class.searchTable();
								console.debug("Last entry number = processedEntries. Searching");
							}
						}
					};
					request.onerror = function(event) {
						console.error("Error reading songs from DB ", event);
						if (Sentry) Sentry.captureException(e);
						message("Chyba při čtení z indexu", "danger", 1000);
					};
				});
			} catch (e) {
				message("Chyba při generování tabulky", "danger", 2000);
				console.error(e);
				if (typeof Sentry != "undefined") Sentry.captureException(e);
			}
		},
		updateTable() {
			this.tab.clear();
			("use strict");
			if ("caches" in window && typeof songCache != "undefined") caches.open(songCache).then(this.upd);
			else this.upd();
		},
		refreshClearables() {
			if (!this.clearables) this.initClearables();
			this.clearables.each(function() {
				var $inp = $(this).find("input[type='text']"),
					$cle = $(this).find(".clearable__clear");
				if ($inp.val()) $cle.show();
				else $cle.hide();
			});
		},
		initClearables() {
			this.clearables = $("main .clearable");
			this.clearables.each(function() {
				var $inp = $(this).find("input[type=text]"),
					$cle = $(this).find(".clearable__clear");
				if ($inp.val()) $cle.show();

				$inp.on("keyup", function() {
					$cle.toggle(!!this.value);
				});

				$cle.on("touchstart click", function(e) {
					e.preventDefault();
					$inp.val("")
						.trigger("input")
						.trigger("keydown")
						.trigger("keyup");
				});
			});
		},
		searchTable() {
			const _class = this;
			if (!this.searchInterval)
				this.searchInterval = setTimeout(function() {
					if (_class.searchBar.value.length) _class.searchBar.focus();
					_class.tab.search(jQuery.fn.DataTable.ext.type.search.html(_class.searchBar.value)).draw();
					_class.searchInterval = 0;
				}, 100);
		},
		clearSearch() {
			this.searchBar.value = "";
			this.searchTable();
			$("#searchBar").val("");
		},
		refreshListClicked() {
			SongDB.downloadIndex(this.updateTable);
		}
	},
	activated() {
		this.$store.commit("changeTitle", "Písně");
		if (localStorage.lastListScroll)
			//Restore previous scroll position
			document.documentElement.scrollTop = localStorage.lastListScroll;
		localStorage.removeItem("lastListScroll");
	}
};
</script>
