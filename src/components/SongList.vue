<template>
  <div>
    <span class="d-flex justify-content-between mx-2">
      <span class="clearable w-100">
        <input class="form-control" ref='searchBar' type="text" @keydown="searchTable()" placeholder="Vyhledat" aria-label="Vyhledat p\u00EDse\u0148" v-model="searchVal">
        <i class="clearable__clear" @click="clearSearch">&times;</i>
      </span>
      <button data-toggle="tooltip" data-placement="bottom" @click="searchTable()" title="Hledat p\u00EDse\u0148" class="btn btn-outline-success ml-2">
        <i class="material-icons" aria-hidden="true">search</i>
        <span class="sr-only">Hledat</span>
      </button>
    </span>
    <table id="wpsongbook_list" class="wpsongbook_list table table-striped table-hover table-bordered table-light" @click="tableClick">
      <thead>
        <tr>
          <th>Název</th>
          <th>Autor</th>
          <th>Jazyk</th>
          <th v-if="additionalButtons&&additionalButtons.length">Akce</th>
        </tr>
      </thead>
    </table>
    <br>
    <link rel="stylesheet" href="https://cdn.datatables.net/1.10.19/css/dataTables.bootstrap4.min.css" crossorigin="anonymous">
  </div>
</template>

<script>
const language = require("@/assets/Czeski.json");
import { SongProcessing, UIHelpers } from "@/js/Helpers.js";
import { SongDB } from "@/js/databases/SongDB.js";
export default {
	data() {
		return {
			searchVal: ""
		};
	},
	props: {
		filter: {
			type: Function
		},
		additionalButtons: {
			type: Array
		},
		preferences: Object
	},
	mounted() {
		const _class = this;
		this.cursorEnded = false; //To control whether initialization was completed
		var theTable = $("#wpsongbook_list");
		_class.tab = theTable.DataTable({
			stateSave: true,
			paging: this.preferences.TablePaging,
			search: {
				caseInsensitive: true
			},
			pageLength: 10,
			dom: '<"table-scroller"t>ip',
			language: language,
			initComplete: function() {
				SongDB.eventBus.$on("indexUpdating", () => {
					$(".dataTables_empty").html("Počkejte na stažení indexu...&ensp;<i class='material-icons rotating'>autorenew</i>");
				});
				//window.tableWraperElement = $("#wpsongbook_list_wrapper");
			},
			drawCallback: function() {
				if (_class.cursorEnded) {
					//Now The table IS filled with values
					if (!_class.preferences.Optimizations) {
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
					var lastListScroll = localStorage.getItem(_class.$route.name + "lastListScroll");
					if (lastListScroll)
						//Restore previous scroll position
						document.documentElement.scrollTop = lastListScroll;
					localStorage.removeItem(_class.$route.name + "lastListScroll");
				}

				_class.refreshClearables();
			}
		});

		_class.updateTable();
	},
	beforeDestroy() {
		try {
			$("tr i").toolitp("dispose"); //If we don't destroy the tooltip, it would persist for ever
		} catch (e) {
			//No toolitps existed
		}
	},
	methods: {
		tableClick(e) {
			//Set last list scroll variable in local storage to current scroll value
			if (e.target && e.target.nodeName == "TD" && e.target.parentElement.nodeName == "TR") {
				var sId = e.target.parentElement.attributes["href"].value;
				localStorage.setItem(this.$route.name + "lastListScroll", document.documentElement.scrollTop);
				if (sId) this.$router.push({ name: "song", query: { id: sId } });
				return false;
			}
		},
		upd(cache) {
			const _class = this; //TODO: how do we filter author things?
			try {
				SongDB.read(
					function(songStore) {
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
									if (typeof _class.filter == "function" && !_class.filter(value, offl)) return;
									if (offl && !_class.preferences.DisplayedOfflineListInfo && !infDisplayed) {
										infDisplayed = true;
										_class.$emit("offlineSongsExist");
									}
									value.author = value.author || "";
									value.language = value.language || "";
									if (value.imported) value.name += '&ensp;<i class="text-muted imp material-icons">open_in_browser</i>';
									if (value.status) {
										value.name += "&ensp;" + SongProcessing.statusToIcon(value.status);
									} else if (value.offlineOnly) value.name += '&ensp;<i class="text-warning oonly material-icons">cloud_off</i>';

									//Now construct the table
									var tr = document.createElement("TR");
									tr.setAttribute("href", value.url);
									if (offl) tr.classList.add("offline");

									//Additional buttons processing
									var actionsTd;
									if (_class.additionalButtons) {
										var actionsTd = document.createElement("TD");
										actionsTd.className="p-0";//No padding
										for (var btn of _class.additionalButtons) {
											var newButton = document.createElement("SPAN");
											newButton.classList.add("btn");
											newButton.setAttribute("data-target", "tooltip");
											if (btn.class) newButton.classList.add(btn.class);
											if (btn.title) newButton.title = btn.title;
											if (btn.icon) {
												var iconElem = document.createElement("i");
												iconElem.className = "material-icons";
												iconElem.innerHTML = btn.icon;
												newButton.appendChild(iconElem);
											}
											if (typeof btn.onClick == "function") newButton.onclick = btn.onClick;
											actionsTd.appendChild(newButton);
										}
										tr.appendChild(actionsTd);
									}

									//Table cells
									var nameTd = document.createElement("TD");
									nameTd.innerHTML = value.name;
									var authorTd = document.createElement("TD");
									authorTd.innerHTML = value.author;
									var languageTd = document.createElement("TD");
									languageTd.innerHTML = value.language;

									tr.prepend(languageTd);
									tr.prepend(authorTd);
									tr.prepend(nameTd);

									_class.tab.row.add(tr);
									if (_class.cursorEnded && lastEntryNumber != processedEntries) {
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
							UIHelpers.Message("Chyba při čtení z indexu", "danger", 1000);
						};
					},
					function(e) {
						console.error("Chyba při přístupu k databázi", e);
					}
				);
			} catch (e) {
				UIHelpers.Message("Chyba při generování tabulky", "danger", 2000);
				console.error(e);
				if (typeof Sentry != "undefined") Sentry.captureException(e);
			}
		},
		updateTable() {
			this.tab.clear();
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
					if (_class.searchVal.length) _class.$refs.searchBar.focus();
					_class.tab.search(jQuery.fn.DataTable.ext.type.search.html(_class.searchVal)).draw();
					_class.searchInterval = 0;
				}, 100);
		},
		clearSearch() {
			this.searchVal = "";
			this.searchTable();
			$("#searchBar").val("");
		}
	}
};
</script>