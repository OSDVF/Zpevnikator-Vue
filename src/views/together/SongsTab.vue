<template>
  <div class="likeMain">
    <SongList :filter="filterMySongs" :preferences="$parent.$parent.preferences"/>
  </div>
</template>

<script>
import SongList from "@/components/SongList";

export default {
	components: {
		SongList: SongList
	},
	methods:{
		filterMySongs(songInfo,offl)
		{
			return !!songInfo.status;
		}
	}
};
</script>