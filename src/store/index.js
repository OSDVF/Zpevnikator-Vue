import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    title: process.env.VUE_APP_NAME,
    workerState: 'dead'
  },
  mutations: {
    changeTitle(state,text)
    {
      state.title = text;
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
