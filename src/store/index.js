import Vue from 'vue'
import Vuex from 'vuex'
import UserStoredInfo from '../js/databases/UserInfo';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    title: process.env.VUE_APP_NAME,
    workerState: 0,
    modalsCount: 1,
    loginState: {
      name: null,
      id: null,
      credentials: null
    },
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
    logItIn(state, lState)
    {
      UserStoredInfo.ID = lState.id;
      UserStoredInfo.Name = lState.name;
      UserStoredInfo.Credentials = lState.credentials;

      if (typeof Together != 'undefined') Together(); //Initialize Zpěvníkátor Together API

      if (typeof Sentry != 'undefined')//If we have a Sentry, inform it about user
        Sentry.configureScope(function (scope)
        {
          scope.setUser({
            "id": lState.id,
            "username": lState.name
          });
        });

      state.loginState = lState;
    },
    clearCompletedTasks(state)
    {
      for (var i = state.tasks.length - 1; i >= 0; i--)
      {
        if (state.tasks[i].state == 'completed')
        {
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
      for (var i = 0; i < state.tasks.length; i++)
      {
        if (state.tasks[i].id = id)
          state.tasks.splice(i, 1);
      }
    }
  },
  getters: {
    loggedIn(state)
    {
      return state.loginState.name != null;
    }
  },
  actions: {
    logout(store)
    {
      store.commit('logItIn', { name: null, id: null, credentials:null });
      UserStoredInfo.Delete();
    }
  },
  modules: {
  },
})
