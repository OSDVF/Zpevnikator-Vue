<template>
  <div :class="['modal fade',dark?'dark':'light']" id="tasks" tabindex="-1" role="dialog" aria-labelledby="tasksLabel" aria-hidden="true">
    <div class="modal-dialog fluid top" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="tasksLabel">Probíhající úlohy</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Zavřít">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p v-if="tasks.length==0">
            Zatím nic. Zde uvidíte soubory, které se konvertují na pozadí a podobné úlohy...
          </p>
          <div class="list-group list-group-flush" v-else>
            <div class="list-group-item list-group-item-action hover-parent" v-for="task in tasks" :key="task.id"><i class="material-icons primaryIcon">{{task.icon}}</i>&ensp;{{task.name}}
              <label class="mt-2 mb-1 ml-3" v-if="task.description" v-html="task.description"></label><i class="material-icons loading-icon text-success parent-hover-disable" v-if="task.state=='completed'">check</i><i class="material-icons loading-icon parent-hover-enable unhover-disable hover-red" v-if="task.state=='completed'" @click="task.delete()">close</i></div>
          </div>
          <a :class="'btn btn-outline-dark '+(completedTasks? 'opaque':'unopaque')" @click="clearCompleted"><i class="material-icons">clear_all</i>&ensp;Smazat dokončené</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Settings from '../../js/Settings';
export default {
	data() {
		return {
			tasks: this.$store.state.tasks,
      completedTasks: 0,
      dark: Settings.Theme=='dark'
		};
	},
	mounted() {
		$(this.$el).on("show.bs.modal", () => {
      this.dark = Settings.Theme == 'dark'
			var count = 0;
			for (var i = this.tasks.length - 1; i >= 0; i--) if (this.tasks[i].state == "completed") count++;
			this.completedTasks = count;
		});
	},
	methods: {
		clearCompleted() {
			this.$store.commit("clearCompletedTasks");
		}
	}
};
</script>