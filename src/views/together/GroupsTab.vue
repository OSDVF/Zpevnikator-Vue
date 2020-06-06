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
    <AddBtn title="Vytvořit skupinu" @click="createGroup" icon="group_add" color="success" shifted-up/>
  </div>
</template>
<script>
import {UIHelpers} from '@/js/Helpers';
import newGroupDialogHtml from 'raw-loader!./addGroup.html';
import GroupsListVue from '../../components/GroupsList.vue';
import FloatingActionButton from '../../components/FloatingActionButton.vue';

export default {
	data() {
		return {
			groups: this.$parent.groups
		};
  },
  components:{
    GroupsList: GroupsListVue,
    AddBtn: FloatingActionButton
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
.fab-right.shifted-up {
	bottom: 50px;
}
</style>