import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    title: process.env.VUE_APP_NAME,
    workerState: 0
  },
  mutations: {
    changeTitle(state,text)
    {
      state.title = text;
      document.title = text+' · '+process.env.VUE_APP_NAME;
    },
    workerState(state,wState)
    {
      state.workerState = wState;
    }
  },
  actions: {
  },
  modules: {
  }
})
