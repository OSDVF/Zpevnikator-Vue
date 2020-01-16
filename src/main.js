import './css/style.css';
import './css/material.scss';
import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import globalManager from './js/global';

window.globalManager = globalManager;
Vue.config.productionTip = true;

const appInstance = new Vue({
  router,
  store,
  render: h => h(App)
});
globalManager.Vue = appInstance;
appInstance.$mount('#app');
