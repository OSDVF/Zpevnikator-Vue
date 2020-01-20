<template>
  <div class="modal fade light" data-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" v-html="title"></h5>
        </div>
        <div class="modal-body">
          <P v-html="text">
          </P>
        </div>
        <div class="modal-footer">
          <span v-html="footer"></span>
          <button type="button" class="btn btn-secondary" v-if='type==DialogType.OkCancel' data-dismiss="modal" aria-label="Zrušit" @click="click('cancel')" v-html="cancelBtnHtml"></button>
          <button type="button" class="btn btn-primary" v-if="type==DialogType.Ok||type==DialogType.OkCancel" data-dismiss="modal" aria-label="OK" @click="click('ok');positiveListener()" v-html='okBtnHtml'></button>
          <button type="button" class="btn btn-secondary" v-if="type==DialogType.YesNo" data-dismiss="modal" aria-label="Ne" @click="click('no')">Ne</button>
          <button type="button" class="btn btn-primary" v-if="type==DialogType.YesNo" data-dismiss="modal" aria-label="Ano" @click="click('yes');positiveListener()">Ano</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { UIHelpers } from "../js/Helpers";
export default {
	data() {
		return {
			title: "",
			footer: "",
			text: "",
			type: UIHelpers.DialogType.Ok,
			okBtnHtml: "OK",
			cancelBtnHtml: "Zrušit"
		};
	},
	props: ["id"],
	created() {
		this.DialogType = UIHelpers.DialogType;
	},
	methods: {
		setData(text, callback, type, header, footer, positiveEventListener) {
			this.text = text;
			this.click = callback;
			this.type = type;
			this.title = header;
			this.footer = footer;
			this.positiveListener = positiveEventListener;
		},
		show() {
			this.$modal = $(this.$el).modal();
			if (typeof this.type == "string") {
				this.okBtnHtml = this.type; //For creating dialogs with custom button texts
				this.type = UIHelpers.DialogType.Ok;
			} else if (this.type instanceof Array) {
				this.okBtnHtml = this.type[0];
				this.cancelBtnHtml = this.type[1];
				this.type = UIHelpers.DialogType.OkCancel;
			}

			if (this.type == UIHelpers.DialogType.NoButtonsWeak) this.$modal.attr("data-backdrop", true);
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