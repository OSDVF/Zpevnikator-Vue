import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    title: process.env.VUE_APP_NAME,
    workerState: 0,
    modalsCount: 1,
    userLogged: false
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
    }
  },
  actions: {
  },
  modules: {
  }
})
