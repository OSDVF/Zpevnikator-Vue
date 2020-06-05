<template>
  <div class="list-group list-group-flush">
    <div v-if="typeof onItemClick == 'function'">
      <button class="list-group-item list-group-item-action" v-for="group of groups" @click="itemClicked(group)">
        <i class="material-icons" :style="getHslColor(group.name)">campaign</i>&ensp;{{group.name}}
      </button>
    </div>
    <div v-else>
      <div class="list-group-item" v-for="group of groups">
        <i class="material-icons" :style="getHslColor(group.name)">campaign</i>&ensp;{{group.name}}
      </div>
    </div>
  </div>
</template>

<script>
/**
 * List of Groups visible to currently logged user. With nice colors :)
 * @vue-prop {Array} groups Pass here the array of groups to be displayed
 * @vue-prop {EventHandler} onItemClick If assigned, the items will be clickable
 */
import { SongProcessing } from "@/js/Helpers";
export default {
	props: {
		groups: Array,
		onItemClick: Function
	},
	methods: {
		getHslColor(str) {
			return "color:hsl(" + (SongProcessing.strHash(str) % 360) + ",54%,50%)";
		},
		itemClicked(group) {
			if (typeof this.onItemClick == "function") this.onItemClick(group);
		}
	}
};
</script>