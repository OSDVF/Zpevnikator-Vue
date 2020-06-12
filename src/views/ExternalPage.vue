<template>
  <main class="container" ref="innerContent">
  </main>
</template>
<script>
import Settings from "../js/Settings.js";
/**
 * Displays verbatim the content of a remote resource
 * @module ExternalPage
 * @note Should be protected agains XSS (does not execute script elements)
 */
export default {
	props: {
		remoteUrl: String
	},
	data() {
		return {
			url: this.remoteUrl
		};
	},
	watch: {
		url(val) {
			if (!val) {
				this.$refs.innerContent.innerHTML = "Aplikace nedokáže zjistit, jakou stránku se snažíte zobrazit. To je pravděpodobně chyba programátora.";
				return;
			}
			fetch(val).then(resp =>
				resp.text().then(text => {
					this.$refs.innerContent.innerHTML = text;
					Settings.applyThemeToComponents($(this.$refs.innerContent));

					this.afterContentLoad();
				})
			);
		}
	},
	methods: {
		afterContentLoad() {
            //Expand target expansion panel and scroll to it
            var hashWithoutHash = location.hash.substring(1);
			$("[aria-labelledby='" + hashWithoutHash + "']").collapse("show");
			let targetElement = document.getElementById(hashWithoutHash);
			if (targetElement != null) targetElement.scrollIntoView();
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			if (to.params.url) vm.url = to.params.url;
		});
	},
	deactivated() {
		this.url = this.remoteUrl;
	}
};
</script>