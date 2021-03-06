import './css/style.css';
import './css/material.scss';
import Vue from 'vue'
import vueDebounce from 'vue-debounce'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import globalManager from './js/global';
import SyncProvider from './js/databases/SyncProvider';

//HTTPS Check
if (process.env.NODE_ENV == 'production' && location.protocol == "http:") location.replace("https://" + location.host + location.pathname + location.search)

window.globalManager = globalManager;
Vue.config.productionTip = true;
Vue.use(vueDebounce, {
  listenTo: ['input']
})

const appInstance = new Vue({
  router,
  store,
  render: h => h(App)
});
globalManager.Vue = appInstance;
new SyncProvider(appInstance);
appInstance.stable = !location.hostname.startsWith("dev.") && location.hostname != "localhost"; //Development hostname
appInstance.$mount('#app');
