<template>

  <body id="app" class="body-white">
    <header class="navbar navbar-expand-xl navbar-light fixed-top">
      <a class="navbar-brand" id="title" href="#">{{headerTitle}}</a>
      <button class="navbar-toggler hidden-md-up" type="button" data-toggle="collapse" data-target="#mainNavCollapse" aria-controls="mainNavCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse navbar-toggleable-sm bg-light" id="mainNavCollapse">
        <ul class="navbar-nav mr-auto mt-md-2 mt-xl-0 flex-md-nowrap">
          <li v-for="item of navPages" class="nav-item mr-xl-2" v-if="!('condition' in item)||item.condition">
            <router-link :class="'nav-link'+ (pathname==item.href ? ' active':'')" :to="item.href">
              <i class="material-icons">{{item.icon}}</i>
              {{item.text}}
            </router-link>
          </li>
        </ul>
        <div id="mainButtonNav" class="d-flex justify-content-between flex-wrap flex-xl-nowrap mt-3 mt-xl-0">
          <input class="form-control" style="flex-grow:4" type="text" id="searchBar" onkeydown="searchInputSubmit()" data-targeturl="seznam" placeholder="Vyhledat" aria-label="Vyhledat" />
          <button data-toggle="tooltip" data-placement="bottom" id="searchBtn" title="Hledat píseň" onclick="searchInputSubmit({keyCode:13})" data-container="#mainButtonNav" class="btn btn-outline-success mt-2 mt-lg-0">
            <i class="material-icons" aria-hidden="true">search</i>
            <span class="sr-only">Hledat</span>
          </button>
          <span @click="settingsDialogShow=true" class="mt-2 mt-lg-0 btn btn-outline-dark" data-toggle="modal" data-target="#settingsWidnow">
            <a data-toggle="tooltip" class="d-block w-100" data-container="#mainButtonNav" data-placement="bottom" title="Nastavení" aria-label="Nastavení">
              <i class="material-icons" aria-hidden="true">settings</i>
              <span class="sr-only">Nastavení</span>
            </a>
          </span>
          <span data-toggle="modal" data-target="#tasks" class="mt-2 mt-lg-0 btn btn-outline-dark">
            <a data-toggle="tooltip" class="d-block w-100" data-container="#mainButtonNav" data-placement="bottom" title="Probíhající úlohy" aria-label="Probíhající úlohy">
              <i class="material-icons" aria-hidden="true">assistant</i>
              <span class="sr-only">Probíhající úlohy</span>
            </a>
          </span>
          <router-link to="/profile" id="loginButton" data-placement="bottom" class="nav-link btn btn-outline-secondary mt-2 mt-lg-0" data-toggle="tooltip" data-container="#mainButtonNav" title="Přihlásit se">
            <i class="material-icons">person</i>
            <span class="sr-only">Přihlásit</span>
          </router-link>
        </div>
      </div>
      <div class="navbar-cover bg-light"></div>
    </header>
    <header class="navbar-light fixed-top bg-light nav-sec" style="z-index:1">
      <a class="navbar-brand smallnav">Dorostomládežový Zpěvníkátor</a>
    </header>
    <!-- There is space for dialog components -->
    <div id="dialogArea">
      <ModalDialog v-for="n in modalsCount" :ref="'dialog'+n" :key="n" />
    </div>
    <AcceptTermsDialog v-if="notAcceptedTerms" />
    <keep-alive>
      <SettingsDialog v-if="settingsDialogShow" />
    </keep-alive>
    <transition :name="transitionName" mode="out-in">
      <keep-alive>
        <router-view />
      </keep-alive>
    </transition>
  </body>
</template>

<script>
import Settings from "./js/Settings";
import { UIHelpers } from "./js/Helpers";
export default {
	data: function() {
		return {
			pathname: window.location.pathname,
			notAcceptedTerms: false,
			settingsDialogShow: false,
			navPages: [
				{
					href: "/",
					text: "O projektu",
					icon: "info"
				},
				{
					href: "/seznam",
					text: "Písně",
					icon: "view_list"
				},
				{
					condition: !this.$store.state.insidePWA,
					href: "/offline",
					text: "Aplikace",
					icon: "cloud_download"
				},
				{
					condition: this.$store.state.insidePWA,
					href: "/offline",
					text: "Správa stažených",
					icon: "cloud_download"
				},
				{
					condition: this.$store.state.userLogged,
					href: "/editorTest",
					text: "Přidat píseň",
					icon: "add_box"
				}
			],
			transitionName: "slide-left"
		};
	},
	components: {
		AcceptTermsDialog: () => import(/* webpackChunkName: "dialogs" */ "./views/dialogs/AcceptTerms"),
		SettingsDialog: () => import(/* webpackChunkName: "dialogs" */ "./views/dialogs/Settings"),
		ModalDialog: () => import(/* webpackChunkName: "dialogs" */ "./components/Dialog")
	},
	computed: {
		headerTitle() {
			return this.$store.state.title;
		},
		modalsCount() {
			return this.$store.state.modalsCount;
		}
	},
	mounted: function() {
		this.localHistory = [this.pathname];
		var _class = this;
		UIHelpers.appReferences = this.$refs;
		this.$router.beforeEach((to, from, next) => {
			_class.pathname = to.path;
			const toDepth = to.path.split("/").length;
			const fromDepth = from.path.split("/").length;
			if (_class.localHistory.length < 2) {
				_class.localHistory.push(to.path);
			} else {
				if (_class.localHistory[_class.localHistory.length - 2] == to.path) {
					_class.localHistory.pop();
					_class.transitionName = "slide-right";
				} else {
					_class.transitionName = toDepth < fromDepth ? "slide-right" : "slide-left";
					_class.localHistory.push(to.path);
				}
			}
			next();
		});
		var navCollapse = $(".navbar-collapse");
		if (!Settings.CookiesAccepted) this.notAcceptedTerms = true;
		var nav = $(".navbar");
		navCollapse.on("show.bs.collapse", function() {
			navCollapse.addClass("expanded");
			nav.css("--navbarUlHeight", navCollapse.height() + 61);
		});
		navCollapse.on("hide.bs.collapse", function() {
			navCollapse.removeClass("expanded");
		});
	}
};
</script>