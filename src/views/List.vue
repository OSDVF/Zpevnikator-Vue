<template>
  <main>
    <div class="d-none text-success my-2" id="offlineInfo">
      <i class="material-icons">feedback</i> Písně, které jsou zobrazeny zeleně jsou dostupné offline
      <button class="btn btn-success btn-sm ml-2" onclick="Settings.DisplayedOfflineListInfo=true;$('#offlineInfo').hide()">
        Rozumím
      </button>
    </div>
    <SongList @offline-songs-exist="offlineInfoDisplay" ref="songList" :preferences="$parent.preferences" />
    <ReloadBtn @click="refreshListClicked"/>
  </main>
</template>
<script>
import SongList from "@/components/SongList";
import { SongDB } from "@/js/databases/SongDB.js";
import FloatingActionButton from '../components/FloatingActionButton';

var downloadIndexAtStartup = false;
export default {
	methods: {
		offlineInfoDisplay() {
			document.getElementById("offlineInfo").classList.remove("d-none");
		},
		refreshListClicked() {
			SongDB.downloadIndex(this.$refs.songList.updateTable);
		}
	},
	components: {
		SongList: SongList,
		ReloadBtn: FloatingActionButton
	},
	activated() {
		this.$store.commit("changeTitle", "Písně");
		var lastListScroll = localStorage.getItem(this.$route.name + "lastListScroll");
		if (lastListScroll)
			//Restore previous scroll position
			document.documentElement.scrollTop = lastListScroll;
		localStorage.removeItem(this.$route.name + "lastListScroll");
	},
	created() {
		if (downloadIndexAtStartup) this.refreshListClicked();
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			if ((!from || !from.name) && performance.navigation.type == 1) {
				//Page was reloaded
				downloadIndexAtStartup = true;
			}
		});
	}
};
</script>
