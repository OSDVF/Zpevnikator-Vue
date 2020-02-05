<template>
  <div :class="['modal fade',dark?'dark':'light']" id="settingsWidnow" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Nastavení aplikace</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Zavřít">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form id="settingsForm">
            <h5 class="text-primary">Vzhled</h5>
            <div class="mb-3 d-flex justify-content-between">
              <span class="my-auto">Barvy</span>
              <select aria-label="Barvy" id="themeSelect" class="selectpicker input-group ml-3" :data-style="dark?'btn-dark':'btn-light'">
                <option value="light" id="lightSelect">Světlé</option>
                <option value="dark" id="darkSelect" :selected='dark'>Tmavé</option>
              </select>
            </div>
            <div class="mb-3 d-flex justify-content-between">
              Zobrazit akordy
              <div class="custom-control custom-switch ml-3">
                <input class="custom-control-input" id="showChords" type="checkbox" :checked='customization.ShowChords' />
                <span class="custom-control-track"></span>
                <label class="custom-control-label" for="showChords"></label>
              </div>
            </div>
            <div class="mb-3 d-flex justify-content-between">
              Plovoucí horní lišta všude
              <div class="custom-control custom-switch ml-3">
                <input class="custom-control-input" id="fixedNavbar" type="checkbox" :checked="preferences.FixedNavbar" />
                <span class="custom-control-track"></span>
                <label class="custom-control-label" for="fixedNavbar"></label>
              </div>
            </div>
            <div class="mb-3 d-flex justify-content-between">
              Vícestránkový seznam písní
              <div class="custom-control custom-switch ml-3" @click='message("Bude potřeba znovu načíst stránku", "info", null)'>
                <input class="custom-control-input" id="tablePaging" type="checkbox" />
                <span class="custom-control-track"></span>
                <label class="custom-control-label" for="tablePaging"></label>
              </div>
            </div>
            <h5 class="text-primary">Cool funkce</h5>
            <div class="mb-3 d-flex justify-content-between">
              Zabránit vypnutí displeje na stránkách písní
              <div class="custom-control custom-switch ml-3">
                <input class="custom-control-input" id="wakeLock" type="checkbox" :checked="preferences.WakeLock" @change="wakelockNotif" />
                <span class="custom-control-track"></span>
                <label class="custom-control-label" for="wakeLock"></label>
              </div>
            </div>
            <div class="mb-3 d-flex justify-content-between">
              <span>
                Vylepšit výkon
                <sup>
                  <a data-toggle="popover" data-container="#settingsForm" tabindex="0" data-trigger="focus" class="text-primary" data-content="Vypne některé 'nepořebné funkce' (animace, bubliny s nápovědou)">[?]</a>
                </sup>
              </span>
              <div class="custom-control custom-switch ml-3">
                <input class="custom-control-input" id="optimizations" type="checkbox" :checked="preferences.Optimizations" />
                <span class="custom-control-track"></span>
                <label class="custom-control-label" for="optimizations"></label>
              </div>
            </div>
            <h5 class="text-primary">Pokročilé funkce</h5>
            <div class="mb-3 d-flex justify-content-between">
              Zobrazovat možnost načíst online verzi stránky
              <div class="custom-control custom-switch ml-3">
                <input class="custom-control-input" id="showReloadPrompt" type="checkbox" :checked="preferences.ShowReloadPrompt" />
                <span class="custom-control-track"></span>
                <label class="custom-control-label" for="showReloadPrompt"></label>
              </div>
            </div>
            <div class="mb-3 d-flex justify-content-between">
              Povolit notifikace
              <div class="custom-control custom-switch ml-3">
                <input class="custom-control-input" id="notifEnable" type="checkbox" :checked="preferences.EnableNotifications" />
                <span class="custom-control-track"></span>
                <label class="custom-control-label" for="notifEnable"></label>
              </div>
            </div>
            <span id="notificationStatus" class="text-danger d-none">
              Notifikace není možné přijímat.
              <a href="#" data-target onclick="subscribe(false)">Zkontrolovat znovu</a>
            </span>
          </form>
          <a class="btn btn-info my-2" data-toggle="tooltip" title="Vymaže nastavení a cache prohlížeče a stáhne program znovu" @click="clearCache">
            <i class="material-icons">refresh</i>&ensp;Aktualizovat aplikaci
          </a>
          <br />
          <router-link to="/about">
            <i class="material-icons">info</i> O aplikaci
          </router-link>
        </div>
        <div class="modal-footer">
          <div id="settingsResponse"></div>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Zavřít</button>
          <button type="button" class="btn btn-primary" @click="saveSettings">Uložit změny</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Settings from "../../js/Settings";
import { UIHelpers } from "../../js/Helpers";
import globalManager from "../../js/global";
export default {
	data() {
		return {
      preferences: this.$parent.preferences,
      customization: this.$parent.customization
		};
  },
  computed:
  {
    dark()
    {
      return this.preferences.Theme == 'dark'
    }
  },
	mounted() {
		$(this.$el)
			.modal("show")
			.find(".selectpicker")
			.selectpicker();
	},
	beforeDestroy() {
		$(this.$el)
			.find(".selectpicker")
			.selectpicker("destroy");
	},
	methods: {
		saveSettings() {
			try {
				Settings.applySettings();
				UIHelpers.Message("Nastavení uloženo", "success", 3000);

        //Update properties
        this.$parent.customization = Settings.SongCustomization;
        this.$parent.preferences = Settings.Preferences;
				/*this.$parent.optimizations = Settings.Optimizations;
				this.$parent.darkTheme = this.dark = Settings.Theme == "dark";
        this.$parent.fixedNavbar = Settings.FixedNavbar;*/
        
        $(this.$el).modal('hide');
			} catch (e) {
				console.error(e);
				if (typeof Sentry != "undefined") Sentry.captureException(e);
			}
		},
		clearCache() {
			function doCleanDialog() {
				UIHelpers.Dialog(
					"Ujistěte se že jste připojeni k internetu abyste mohli stáhnout data aplikace znovu. Vaše osobní poznámky, nastavení a offline písně budou zachovány.<br> Chcete teď smazat a znovu stáhnout aplikaci?",
					function(result) {
						if (result == "yes") {
							navigator.serviceWorker.getRegistration().then(function(reg) {
								if (reg && reg.waiting) reg.waiting.postMessage({ tag: "skipWaiting" });
							});
							$("#settingsWidnow").modal("hide");
							UIHelpers.Dialog(
								'Probíhá stahování nové verze...<br><br><div class="progress"><div class="progress-bar progress-bar-indeterminate" role="progressbar"></div></div>',
								null,
								UIHelpers.DialogType.NoButtons,
								"Stahování"
							);
							caches
								.keys()
								.then(function(keyList) {
									return Promise.all(
										keyList.map(function(key) {
											if (typeof songCache == "undefined") return caches.delete(key);
											else if (key != songCache) return caches.delete(key);
										})
									);
								})
								.then(function() {
									if (!globalManager.registerSync("clean")) location.reload(true);
								});
						}
					},
					UIHelpers.DialogType.YesNo,
					"Vymazat?"
				);
			}
			if (!navigator.onLine)
				UIHelpers.Dialog(
					"Vypadá to, že jste offline, chcete přesto pokračovat?",
					null,
					UIHelpers.DialogType.YesNo,
					'<i class="material-icons">signal_wifi_off</i>&ensp;Pokračovat?',
					null,
					doCleanDialog
				);
			else doCleanDialog();
		},
		message(alert, type, timeout) {
			return UIHelpers.Message(alert, type, timeout);
		},
		wakelockNotif(event) {
			if (event.target.checked != Settings.WakeLock)
				UIHelpers.Dalog("Vypnutí displeje bude zabráněno jen po kliknutí na některý řádek v seznamu písní a zobrazení písně<br><small>(Omezení systému)</small>");
		}
	}
};
</script>