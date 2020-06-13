<template>
  <div class="likeMain">
    <div class="card bg-light">
      <div class="card-body">
        <h5 class="card-title"><i class="material-icons" :style="$parent.getHslColor(name)">person_pin</i><span class="pl-3">{{name}}</span></h5>
        <div class="card-text">
          <div class="row">
            <span class="col-6 list-group-item strong">Jméno</span>
            <span class="col-6 list-group-item">{{fullName}}</span>
          </div>
          <div class="row">
            <span class="col-6 list-group-item strong">Mých písní</span>
            <span class="col-6 list-group-item">{{addedSongs}}</span>
          </div>
          <div class="row">
            <span class="col-6 list-group-item strong">Publikovaných písní</span>
            <span class="col-6 list-group-item">{{publishedSongs}}</span>
          </div>
        </div>

      </div>
    </div>
    <div class="list-group list-group-flush mt-2">
      <div class="list-group-item"><strong>Možnosti</strong></div>
      <button @click="editProfile" type="button" class="list-group-item list-group-item-action" data-toggle="tooltip" title="Bude nutné znovu zadat jméno a heslo 😐"><i class="material-icons">admin_panel_settings</i>&ensp;Upravit profil</button>
      <button @click="logout" type="button" class="list-group-item list-group-item-action"><i class="material-icons">exit_to_app</i>&ensp;Odhlásit se</button>
    </div>
  </div>
</template>
<script>
import { SongDB } from "../../js/databases/SongDB";
import SyncProvider from "../../js/databases/SyncProvider";
export default {
	data() {
		return {
			addedSongs: "Neznámé",
			publishedSongs: "Neznámé"
		};
	},
	activated() {
		this.updateSongsCount();
	},
	computed: {
		name() {
			return this.$store.state.loginState.name || "Nepřihlášen";
		},
		fullName() {
			return this.$store.state.loginState.fullName;
		}
	},
	methods: {
		logout() {
			SyncProvider.logOut();
		},
		updateSongsCount() {
			SongDB.read(db => {
				var request = db.openCursor();
				this.publishedSongs = this.addedSongs = 0;
				request.onsuccess = event => {
					var cursor = event.target.result;
					if (cursor) {
						var value = cursor.value;
						if (value.status) {
							if (value.status == "publish") this.publishedSongs++;
							this.addedSongs++;
						}
						cursor.continue();
					}
				};
				request.onerror = () => {
					this.addedSongs = this.publishedSongs = "Chyba při zjišťování";
				};
			});
		},
		shown() {
			this.updateSongsCount();
		},
		editProfile() {
			location.href = process.env.VUE_APP_API_URL + "/shared/go.php?editProfile=" + this.$store.state.loginState.id;
		}
	}
};
</script>

<style>
.strong {
	font-weight: bold;
}
</style>