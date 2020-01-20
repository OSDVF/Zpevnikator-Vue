/* eslint-disable no-console */

import { register } from 'register-service-worker'
import globalManager from './js/global'

if (process.env.NODE_ENV === 'production'||process.env.VUE_APP_SWDEBUG) {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      globalManager.Vue.$store.commit('workerState','ready');
      globalManager.setupSWMessageBus();
      for(var clb of globalManager.workerReadyWaiting)
        clb();
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered () {
      console.log('Service worker has been registered.')
    },
    /*cached () {
      console.log('Precache completed.')//This is fake event in my opinion
    },*/
    updatefound () {
      console.log('New content is downloading.')
    },
    updated () {
      console.log('New content is available; please refresh.')
    },
    offline () {
      console.log('App is running in offline mode.')
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
