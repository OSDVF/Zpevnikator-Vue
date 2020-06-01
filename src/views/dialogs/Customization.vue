<template>
  <div aria-hidden="true" class="navdrawer navdrawer-right navdrawer-temporary-sm navdrawer-persistent-md mt-xl-1" id="customization" tabindex="-1">
    <div class="navdrawer-content bg-light text-dark">
      <div class="navdrawer-header bg-light text-dark invisible-lg">
        <a class="navbar-brand px-0" href="#">Přizpůsobit</a>
        <button type="button" class="close my-1" data-toggle="navdrawer" data-target="#customization" aria-label="Zavřít">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="navdrawer-nav">
        <a class="us-none nav-item nav-link" @click="showSettings"><i class="material-icons mt-1 mr-2" aria-hidden="true">settings</i>&ensp;Nastavení aplikace</a>
      </div>
      <div class="navdrawer-divider"></div>
      <p class="navdrawer-subheader">Tato píseň</p>
      <ul class="navdrawer-nav">
        <a class="us-none nav-item nav-link" @click='editNotes'><i class="material-icons  mr-2">{{noteEditBtnIcon}}</i>&ensp;{{noteEditBtnText}}</a>
        <li class="nav-link bg-light text-dark d-flex justify-content-between">
          <label>Transponovat</label><span><input type="number" v-model="transpValue" v-debounce:200="transp" value="0" min="-6.5" max="6.5" step="0.5" data-decimals="1" /></span>
        </li>
        <li class="nav-link bg-light text-dark">
          <label class="d-block">
            Přehodit # / ♭
            <div class="custom-control custom-switch float-right">
              <input class="custom-control-input" id="alterationChange" type="checkbox" @input="transp('alt')" :checked="alter">
              <span class="custom-control-track"></span>
              <label class="custom-control-label" for="alterationChange"></label>
            </div>
          </label>
        </li>
      </ul>
      <div class="navdrawer-divider"></div>
      <p class="navdrawer-subheader">Vlastnosti textu</p>
      <ul class="navdrawer-nav text-dark">
        <li class="nav-link bg-light d-flex justify-content-between"><label>Velikost textu</label><span>
            <input type="number" id='text-size' v-model="customization.TextSize" min="0.8" max="10" step="0.1" data-decimals="1"></span></li>
        <li class="nav-link bg-light d-flex justify-content-between"><label>Velikost akordů</label><span>
            <input type="number" id='chord-size' min="0.8" max="10" step="0.1" data-decimals="1" v-model="customization.ChordSize"></span></li>
        <li class="nav-link bg-light d-flex justify-content-between"><label><i class="material-icons">height</i> Řádků</label><span>
            <input type="number" id='line-height' min="0" max="5" step="0.1" data-decimals="1" v-model="customization.LineHeight"></span></li>
        <li class="nav-link bg-light d-flex justify-content-between"><label><i class="material-icons">height</i> Odstavce</label><span>
            <input type="number" id='pMargin' min="0" max="5" step="0.1" data-decimals="1" v-model="customization.ParagraphMargin"></span></li>
        <li class="nav-link bg-light d-flex justify-content-between"><label>Okraje stránky</label><span>
            <input type="number" id='page-margins' min="0" max="50" step="1" data-decimals="0" v-model="customization.PageMargins"></span></li>
        <li class="nav-link bg-light text-dark">
          <label class="d-block">
            Zobrazit akordy v závorce
            <div class="custom-control custom-switch float-right">
              <input class="custom-control-input" id="showOptional" type="checkbox" v-model="customization.ShowOptionalChords">
              <span class="custom-control-track"></span>
              <label class="custom-control-label" for="showOptional"></label>
            </div>
          </label>
        </li>
        <li class="nav-link bg-light text-dark">
          <label class="d-block">
            Zobrazit basové akordy
            <div class="custom-control custom-switch float-right">
              <input class="custom-control-input" id="showBass" type="checkbox" v-model="customization.ShowBassChords">
              <span class="custom-control-track"></span>
              <label class="custom-control-label" for="showBass"></label>
            </div>
          </label>
        </li>
        <li class="nav-link bg-light text-dark">
          <label class="d-block">
            Zvýraznit <span class="text-muted">(Ref., 1., Coda...)</span>
            <div class="custom-control custom-switch float-right">
              <input class="custom-control-input" id="highloght" type="checkbox" v-model="customization.HighlightAnchors">
              <span class="custom-control-track"></span>
              <label class="custom-control-label" for="highloght"></label>
            </div>
          </label>
        </li>
        <li class="nav-link bg-light text-dark d-flex justify-content-between"><label>Styl akordů</label>
          <select aria-label="Styl akordů" id="chordStyle" class="input-group float-right" data-style="btn-light" v-model="customization.ChordStyle">
            <option value="inside">Uvnitř textu</option>
            <option value="above">Nad textem</option>
          </select></li>
      </ul>
    </div>
  </div>
</template>

<script>
import { UIHelpers } from "../../js/Helpers";
import Settings from "../../js/Settings";
import { SongDB } from "../../js/databases/SongDB";
import "bootstrap-input-spinner";
export default {
	data() {
		return {
			noteEditBtnText: "Editace Poznámek",
			noteEditBtnIcon: "assignment",
			alter: false,
			customization: {
				TextSize: Settings._songCustomization.TextSize,
				ChordSize: Settings._songCustomization.ChordSize,
				ChordStyle: Settings._songCustomization.ChordStyle,
				ShowOptionalChords: Settings._songCustomization.ShowOptionalChords,
				ShowBassChords: Settings._songCustomization.ShowBassChords,
				PageMargins: Settings._songCustomization.PageMargins,
				ParagraphMargin: Settings._songCustomization.ParagraphMargin,
				HighlightAnchors: Settings._songCustomization.HighlightAnchors,
				LineHeight: Settings._songCustomization.LineHeight
			},
			transpValue: 0
		};
	},
	watch: {
		customization: {
			deep: true,
			handler() {
				this.$parent.customization = new Settings.Customization(this.customization);
				$("body").css("--mainMargin", "-" + this.customization.PageMargins + "px");
			}
		}
	},
	mounted() {
		if (Settings.Preferences.Theme == "dark") Settings.applyThemeToComponents($(this.$el));
		SongDB.get(this.$route.query.id, info => {
			this.alter = info.alterationChange;
			this.transpValue = info.transposition ? info.transposition : 0;
		});
		$(() => $(".nav-link>span>input[type='number']").inputSpinner());
		$(document).on("shown.md.navdrawer", () => {
			$(".navdrawer-backdrop").remove(), document.body.classList.remove("navdrawer-open-default");
		});
	},
	methods: {
		editNotes(event) {
			var btn = event.target;
			if (!customization.ShownNoteInfo)
				UIHelpers.Dialog(
					"Klikněte na místo v textu písně pro přidání poznámky. Pro smazání poznámky smažte veškerý její text.",
					function() {
						customization.ShownNoteInfo = true;
					},
					UIHelpers.DialogType.OK,
					"<i class='material-icons'>info</i>&ensp;Jak přidávat poznámky"
				);
			var that = $(this);
			if (window.innerHeight < process.env.VUE_BREAKPOINT_LG) $("#customization").navdrawer("hide");
			this.noteEditBtnIcon = "close";
			this.noteEditBtnText = "Konec editace poznámek";
			$(btn).one("click", exitDesign);
			this.$parent.wrapperClasses += "noteDesign";
		},
		showSettings() {
			this.$parent.settingsDialogShow = true; //Yeah, bad, but performant
			$("#customization").navdrawer("hide");
			this.$nextTick(() => $("#settingsWidnow").modal("show"));
		},
		transp(val) {
			this.$emit("chordsUpdate", val ? val : this.$refs.transp.value);
		}
	}
};
</script>