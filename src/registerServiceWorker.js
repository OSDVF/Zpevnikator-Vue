/* eslint-disable no-console */

import { register } from 'register-service-worker'
import globalManager from './js/global'
import { WorkerStates } from './js/Helpers.js'

if (process.env.NODE_ENV === 'production' || process.env.VUE_APP_SWDEBUG)
{
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready()
    {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
      globalManager.Vue.$store.commit('workerState', WorkerStates.ready);
    },
    registered()
    {
      console.log('Service worker has been registered.')
      globalManager.Vue.$store.commit('workerState', WorkerStates.registered);
      globalManager.setupSWMessageBus();
      for (var clb of globalManager.workerReadyWaiting)
        clb();
    },
    updatefound()
    {
      console.log('New content is downloading.')
    },
    updated()
    {
      globalManager.swUpdated = true;
    },
    offline()
    {
      console.log('App is running in offline mode.')
    },
    error(error)
    {
      console.error('Error during service worker registration:', error)
    }
  })
}
