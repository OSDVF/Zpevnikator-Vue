<template>
  <a data-toggle="tooltip" class="d-block w-100" data-container="#mainButtonNav" data-placement="bottom" title="Probíhající úlohy" aria-label="Probíhající úlohy">
    <i class="material-icons" aria-hidden="true" ref='tasksBtnIcon'>{{icon}}</i>
    <span class="sr-only">Probíhající úlohy</span>
  </a>
</template>

<script>
import { mapState } from "vuex";
import Tasks from "../js/Tasks";

export default {
	data() {
		return { icon: "assistant" };
	},
	computed: mapState(["tasks"]),
	watch: {
		tasks() {
			this.updateIndicator();
		}
	},
	mounted() {
        Tasks.indicatorElement = this.$refs.tasksBtnIcon;
        this.$root.$on("someTaskCompleted",this.updateIndicator);
    },
    methods:{
        updateIndicator()
        {
            var count = Tasks.UncompletedCount;
			if (count > 9) this.icon = "filter_9_plus";
			else if (count == 0) {
				this.icon = "assistant";
				window.removeEventListener("beforeunload", this.makeUserSure);
				this.assignedSureDetection = false;
			} else {
				this.icon = "filter_" + count;
				if (!this.assignedSureDetection) {
					window.addEventListener("beforeunload", this.makeUserSure);
					this.assignedSureDetection = true;
				}
			}
        }
    }
};
</script>