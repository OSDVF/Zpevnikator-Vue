<template>
  <div class="likeMain">
    <SongList :filter="filterMySongs" :preferences="$parent.$parent.preferences" :additionalButtons="shareButton" ref="songList" />
	<ReloadBtn @click="refreshListClicked" shifted-up/>

	<div class="d-none" ref="groupsList">
		<groups-list :groups="$parent.groups" :onItemClick="shareToGroup"/>
	</div>
  </div>
</template>

<script>
import GroupsListVue from "../../components/GroupsList.vue";
import SongList from "@/components/SongList";
import { UIHelpers } from '../../js/Helpers';
import FloatingActionButton from '@/components/FloatingActionButton';
import SyncProvider from '@/js/databases/SyncProvider.js'

export default {
	created() {
		var _class = this;
		this.shareButton = [
			{
				icon: "share",
				title: "Sdílet",
				class: "btn-outline-success",
				onClick() {
					UIHelpers.Dialog(_class.$refs.groupsList, null,UIHelpers.DialogType.Ok);
					_class.$refs.groupsList.classList.remove("d-none");
				}
			}
		];
	},
	components: {
		SongList: SongList,
		GroupsList: GroupsListVue,
		ReloadBtn: FloatingActionButton
	},
	methods: {
		filterMySongs(songInfo, offl) {
			return !!songInfo.status;
		},
		shareToGroup(groupInfo)
		{
			console.log(groupInfo);
		},
		refreshListClicked() {
			SyncProvider.pullSongs().then(this.$refs.songList.updateTable);
		}
	}
};
</script>