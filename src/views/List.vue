<template>
  <main>
    <SongList @offline-songs-exist="offlineInfoDisplay" ref="songList" :preferences="$parent.preferences" />
    <table class="table table-borderless w-auto">
      <tr>
        <td>
          <i class="rozvoj">R</i>
        </td>
        <td>
          – vytvořeno Na Rozvoji
        </td>
      </tr>
      <tr>
        <td>
          <strong class="text-success">Zeleně</strong>
        </td>
        <td>
          – Uloženo offline
        </td>
      </tr>
    </table>
    <ReloadBtn @click="refreshListClicked" />
  </main>
</template>
<script>
import SongList from "@/components/SongList";
import FloatingActionButton from "../components/FloatingActionButton";
import SyncProvider from "../js/databases/SyncProvider";

export default {
	methods: {
		offlineInfoDisplay() {
			document.getElementById("offlineInfo").classList.remove("d-none");
		},
		refreshListClicked() {
			SyncProvider.pull();
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
	beforeRouteEnter(to, from, next) {
		next(vm => {
			if ((!from || !from.name) && performance.navigation.type == 1) {
				//Page was reloaded
				vm.refreshListClicked();
			}
		});
	}
};
</script>
<style>
i.rozvoj {
	border: 2px solid var(--dark);
	border-radius: 50%;
	width: 20px;
	height: 20px;
	font-weight: bold;
	display: inline-flex;
	justify-content: center;
	align-items: center;
}
</style>
