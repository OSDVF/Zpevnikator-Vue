<template>
  <main>
    <div class="d-none text-success my-2" id="offlineInfo">
      <i class="material-icons">feedback</i> Písně, které jsou zobrazeny zeleně jsou dostupné offline
      <button class="btn btn-success btn-sm ml-2" onclick="Settings.DisplayedOfflineListInfo=true;$('#offlineInfo').hide()">
        Rozumím
      </button>
    </div>
    <SongList @offline-songs-exist="offlineInfoDisplay" ref="songList"/>
	<div class="fab-right">
      <button class="btn btn-float btn-secondary m-3" type="button" data-placement="left" data-toggle="tooltip" title="Aktualizovat seznam" @click="refreshListClicked">
        <i class="material-icons">refresh</i>
      </button>
    </div>
  </main>
</template>
<script>
import SongList from "@/components/SongList";
import { SongDB } from "@/js/databases/SongDB.js";
export default {
	methods: {
		offlineInfoDisplay()
		{
			document.getElementById("offlineInfo").classList.remove("d-none");
		},
		refreshListClicked() {
			SongDB.downloadIndex(this.$refs.songList.updateTable);
		}
	},
	components: {
		SongList: SongList
	},
	activated() {
		this.$store.commit("changeTitle", "Písně");
		var lastListScroll = localStorage.getItem(this.$route.name+"lastListScroll");
		if (lastListScroll)
			//Restore previous scroll position
			document.documentElement.scrollTop = lastListScroll;
		localStorage.removeItem(this.$route.name+"lastListScroll");

		if(performance.navigation.type ==1)//Page was reloaded
		{
			this.refreshListClicked();
		}
	}
};
</script>
