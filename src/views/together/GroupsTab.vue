<template>
  <div class="likeMain">
    <div v-if="ownGroups.length">
      <h4>
        Jste správcem
      </h4>
      <groups-list :groups="ownGroups" />
    </div>
    <div v-if="foreignGroups.length">
      <h4>
        Jste členem
      </h4>
      <groups-list :groups="ownGroups" />
    </div>
    <div class="fab-right">
      <button class="btn btn-float btn-success m-3" type="button" data-placement="left" data-toggle="tooltip" title="Vytvořit skupinu" @click="createGroup">
        <i class="material-icons">group_add</i>
      </button>
    </div>
  </div>
</template>
<script>
import {UIHelpers} from '@/js/Helpers';
import newGroupDialogHtml from 'raw-loader!./addGroup.html';
import GroupsListVue from '../../components/GroupsList.vue';

export default {
	data() {
		return {
			groups: this.$parent.groups
		};
  },
  components:{
    GroupsList: GroupsListVue
  },
	computed: {
		ownGroups() {
			var own = [];
			for (var group of this.groups) {
				if (group.iAmAdmin == true) own.push(group);
      }
      return own;
		},
		foreignGroups() {
			var foreign = [];
			for (var group of this.groups) {
				if (!group.iAmAdmin) foreign.push(group);
      }
      return foreign;
		}
  },
  methods:{
    createGroup()
    {
      UIHelpers.Dialog(newGroupDialogHtml,null,UIHelpers.DialogType.OkCancel,"Název nové skupiny","Později budete moct přidat členy",()=>{
        alert("Ahoj");
      });
    }
  }
};
</script>
<style>
.fab-right {
	bottom: 50px;
}
</style>