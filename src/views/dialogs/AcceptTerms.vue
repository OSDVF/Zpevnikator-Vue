<template>
  <div class="modal fade light" id="cookieRequest" tabindex="-1" data-backdrop="static" role="dialog" aria-labelledby="cookieModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="cookieModalLabel">Potvrzení podmínek</h5>
        </div>
        <div class="modal-body">
          <form id="acceptTerms" @submit="onSubmit">
            <p>
              Pokračováním dál souhlasíte s používáním cookies, a údajů o vašem zařízení těmito stránkami.
              <br />Je to totiž nutné aby to celé vůbec fungovalo :)
              <br />
              <br />Veškerá data a nastavení, která na webu nebo v aplikaci provedete jsou uloženy jen offline na vašem zařízení a nejsou žádným způsobem sdíleny se serverem (kromě vámi publikovaných písní).
              <br />
            </p>
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="suhlas" required />
              <label class="custom-control-label" for="suhlas">Souhlasím</label>
            </div>
            <p></p>
            <p>
              <a class="text-secondary" id="ttAnchor1" data-toggle="tooltip" data-container="#ttAnchor1" title="K uložení nastavení a přizpůsobení aplikace (transpozice akordů, barva na pozadí...)">Proč je používáme?</a>
            </p>
            <input type="submit" class="btn btn-secondary" aria-label="OK" value="OK" />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Settings from "../../js/Settings";
import globalManager from "@/js/global";
import { UIHelpers } from '../../js/Helpers';
import GlobalEvents from '../../js/GlobalEvents';
export default {
	mounted() {
		globalManager.resourcesReady(this, () => {
      $("#cookieRequest").modal("show");
      UIHelpers.currentlyDisplayedDialogs++;
			$("#ttAnchor1").tooltip();
		});
	},
	methods: {
		onSubmit(event) {
			event.preventDefault();
			$("#cookieRequest").modal("hide");
      Settings.Preferences.CookiesAccepted = true;
      //Inform UI provider that we have been closed
      UIHelpers.currentlyDisplayedDialogs--;
      this.$root.$emit(GlobalEvents.dialogClosed);
		}
	}
};
</script>