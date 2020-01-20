import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    title: process.env.VUE_APP_NAME,
    workerState: 0,
    modalsCount: 1,
    userLogged: false,
    tasks: []
  },
  mutations: {
    changeTitle(state, text)
    {
      state.title = text;
      document.title = text + ' · ' + process.env.VUE_APP_NAME;
    },
    workerState(state, wState)
    {
      state.workerState = wState;
    },
    addDialog(state)
    {
      state.modalsCount++;
    },
    removeDialog(state)
    {
      state.modalsCount--;
    },
    loginState(state, lState)
    {
      state.userLogged = lState;
    },
    clearCompletedTasks(state)
    {
      for (var i = state.tasks.length - 1; i >= 0; i--)
      {
        if (state.tasks[i].state == 'completed')
        {
          /*let tsk = $("#taskList>#task-" + this.activeTasks[i].id).addClass("unopaque");
          setTimeout(function ()
          {
              tsk.remove();
          }, 500);*/
          state.tasks.splice(i, 1);
        }
      }
    },
    addTask(state, tsk)
    {
      for (var newId = 0; newId < state.tasks.length; newId++)//Make decision about new tasks's id
      {
        var match = false;
        for (var x = 0; x < state.tasks.length; x++)
        {
          if (newId == state.tasks[x].id) match = true;
        }
        if (!match) break;
      }
      tsk.id = newId;
      state.tasks.push(tsk);
    },
    removeTask(state, id)
    {
      for (var i; i < state.tasks.length; i++)
      {
        if (state.tasks[i].id = id)
          state.tasks.splice(i, 1);
      }
    }
  },
  getters: {
    uncompletedTasksCount(state)
    {
      var count = 0;
      for (var i = state.tasks.length - 1; i >= 0; i--)
        if (state.tasks[i].status != 'completed') count++;
      return count;
    },
    completedTasksCount(state)
    {
      var count = 0;
      for (var i = state.tasks.length - 1; i >= 0; i--)
        if (state.tasks[i].status == 'completed') count++;
      return count;
    }
  },
  actions: {
  },
  modules: {
  }
})
