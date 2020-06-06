<template>
  <div :class="['modal fade',dark?'dark':'light']" data-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" v-html="headerData"></h5>
        </div>
        <div class="modal-body">
          <P v-html="textData" ref="innerContent">
          </P>
        </div>
        <div class="modal-footer">
          <span v-html="footer"></span>
          <button type="button" class="btn btn-secondary" v-if='typeData==DialogType.OkCancel' data-dismiss="modal" aria-label="Zrušit" @click="click('cancel')" v-html="cancelBtnHtml"></button>
          <button type="button" class="btn btn-primary" v-if="typeData==DialogType.Ok||typeData==DialogType.OkCancel" data-dismiss="modal" aria-label="OK" @click="click('ok');positiveListener()" v-html='okBtnHtml'></button>
          <button type="button" class="btn btn-secondary" v-if="typeData==DialogType.YesNo" data-dismiss="modal" aria-label="Ne" @click="click('no')">Ne</button>
          <button type="button" class="btn btn-primary" v-if="typeData==DialogType.YesNo" data-dismiss="modal" aria-label="Ano" @click="click('yes');positiveListener()">Ano</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { UIHelpers } from "../js/Helpers";
import Settings from "../js/Settings";
/**
 * Internal helper object for displaying dialogs. Use UIHelpers.Dialog() to instantiate one
 * @vue-prop {string|HTMLElement} text Can contain text to display or a element to paste (not copy!) into the body of the dialog
 */
export default {
	data() {
		return {
			textData: this.text,
			headerData: this.header,
			footerData: this.footer,
			typeData: this.type,
			okBtnHtml: this.ok,
			cancelBtnHtml: this.cancel,
			preferences: this.$parent.preferences
		};
	},
	computed: {
		dark() {
			return this.preferences.Theme == "dark";
		}
	},
	props: {
		header: String,
		footer: String,
		text: Object,
		type: {
			type: String,
			validator: val => ["top", "right", "bottom", "left"].includes(val),
			default: null
		},
		ok: {
			type: String,
			default: "OK"
		},
		cancel: {
			type: String,
			default: "Zrušit"
		}
	},
	created() {
		this.DialogType = UIHelpers.DialogType;
		this.$parent.DialogType = UIHelpers.DialogType;
	},
	methods: {
		setData(text, callback, type, header, footer, positiveEventListener) {
			if (typeof text == "string") this.textData = text;
			else if (text instanceof Node) this.$refs.innerContent.append(text);
			this.click = callback;
			this.typeData = type;
			this.headerData = header;
			this.footerData = footer;
			this.positiveListener = positiveEventListener;
		},
		show() {
			this.$modal = $(this.$el).modal();
			//this.dark = Settings.Theme == 'dark';
			if (typeof this.typeData == "string") {
				this.okBtnHtml = this.typeData; //For creating dialogs with custom button texts
				this.typeData = UIHelpers.DialogType.Ok;
			} else if (this.typeData instanceof Array) {
				this.okBtnHtml = this.typeData[0];
				this.cancelBtnHtml = this.typeData[1];
				this.typeData = UIHelpers.DialogType.OkCancel;
			}

			if (this.typeData == UIHelpers.DialogType.NoButtonsWeak) this.$modal.attr("data-backdrop", true);
			this.$modal.modal("show");

			//Attach listeners to internal components
			var _self = this;
			this.$nextTick(function() {
				_self.$modal.find('a:not([href^="http"])').click(function(event) {
					//Make links to internal pages trigger router and not page reload (and also hide the dialog)
					event.preventDefault();
					_self.$modal.modal("hide");
					_self.$router.push(this.pathname);
				});
			});
			this.$modal.one("hidden.bs.modal", function() {
				_self.$modal.modal("dispose");
				_self.$store.commit("removeDialog");
				var dialogCount = $(".modal.show").length;
				$("body:not(.modal-open)")
					.find(".modal-backdrop")
					.each(function(index) {
						if (index >= dialogCount)
							$(this)
								.removeClass("show")
								.on("webkitTransitionEnd transitionEnd", function() {
									this.parentNode.removeChild(this);
								});
					});
			});
			return this.$modal;
		}
	}
};
</script>