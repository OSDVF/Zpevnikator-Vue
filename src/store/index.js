import Vue from 'vue'
import Vuex from 'vuex'
import UserStoredInfo from '../js/databases/UserInfo';

Vue.use(Vuex)

/**
 * @namespace VuexStore
 */
/**
 * @typedef LoginState
 * @property {string} name
 * @property {Number} id Wordpress-side User ID
 * @property {string} credentials Credentials hash
 */
/**
 * The Vuex state object
 * @typedef AppState
 * @property {string} title Title currently shown in navbar and the browser window header
 * @property {WorkerState} workerState State of currently registered ServiceWorker
 * @property {Number} modalsCount Internal number of currently shown modal dialogs
 * @property {LoginState} loginState Info about currently logged user
 * @property {Task[]} tasks List of currently ongoing tasks (also the completed ones)
 */
export default new Vuex.Store({
  /**
   * Hold current application state object
   * @memberof VuexStore
   * @type AppState
   */
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
  /**
   * Most of them are used internally and don't require manual manipulation
   * @example
   * $store.commit('nameOfMutation',params..)
   * 
   * @name mutations
   * @memberof VuexStore
   * @property {string} changeTitle Changes the title displayed in navbar and broser tab header
   * @property {WorkerState} workerState Internal method to update current serviceWorker state info
   * @property addDialog Prepare new Dialog object for displaying
   * @property removeDialog
   * @property {LoginState} logItIn Update info about currently logged user
   */
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
        if (state.tasks[i].id == id)
          state.tasks.splice(i, 1);
      }
    }
  },
  /**
   * Provide ways to get properties from the AppState
   * @example
   * $state.getters.getterName
   * 
   * @name getters
   * @memberof VuexStore
   * @property {boolean} loggedIn Is there any logged user in this app?
   */
  getters: {
    loggedIn(state)
    {
      return state.loginState.name != null;
    }
  },
  /**
   * Actions that change current AppState.
   * Use them externally as you wish
   * @example
   * $store.dispatch('actionName')
   * 
   * @name actions
   * @property logout Log current user out
   * @memberof VuexStore
   */
  actions: {
    logout(store)
    {
      store.commit('logItIn', { name: null, id: null, credentials: null });
      UserStoredInfo.Delete();
    }
  },
  modules: {
  },
})
