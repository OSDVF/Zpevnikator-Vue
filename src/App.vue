<template>

  <body id="app" :class="[darkTheme?'body-black':'body-white',preferences.Optimizations?'optimizations':'']">
    <header :class="['navbar navbar-expand-xl',darkTheme?'navbar-dark':'navbar-light',fixedNavbar?'fixed-top':'']">
      <a class="navbar-brand" id="title" href="#">{{headerTitle}}</a>
      <button class="navbar-toggler hidden-md-up" type="button" data-toggle="collapse" data-target="#mainNavCollapse" aria-controls="mainNavCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse navbar-toggleable-sm bg-light" id="mainNavCollapse" ref="navCollapse">
        <ul class="navbar-nav mr-auto mt-md-2 mt-xl-0 flex-md-nowrap">
          <li v-for="item of navPages" class="nav-item mr-xl-2" v-if="!('condition' in item)||item.condition()" @click="hideNav">
            <router-link :class="'nav-link'+ (pathname==item.href ? ' active':'')" :to="item.href">
              <i class="material-icons mr-2">{{item.icon}}</i>{{item.text}}
            </router-link>
          </li>
        </ul>
        <div id="mainButtonNav" class="d-flex justify-content-between flex-wrap flex-xl-nowrap mt-3 mt-xl-0 mx-2">
          <input class="form-control" style="flex-grow:4" type="text" id="searchBar" onkeydown="searchInputSubmit()" data-targeturl="seznam" placeholder="Vyhledat" aria-label="Vyhledat" />
          <button data-toggle="tooltip" data-placement="bottom" id="searchBtn" title="Hledat píseň" onclick="searchInputSubmit({keyCode:13})" data-container="#mainButtonNav" class="btn btn-outline-success mt-2 mt-lg-0">
            <i class="material-icons" aria-hidden="true">search</i>
            <span class="sr-only">Hledat</span>
          </button>
          <span class="mt-2 mt-lg-0 btn btn-outline-dark" @click="showMainDialog">
            <a data-toggle="tooltip" class="d-block w-100" data-container="#mainButtonNav" data-placement="bottom" title="Nastavení" aria-label="Nastavení">
              <i class="material-icons" aria-hidden="true">settings</i>
              <span class="sr-only">Nastavení</span>
            </a>
          </span>
          <span @click='tasksDialogShow=true' data-toggle="modal" data-target="#tasks" class="mt-2 mt-lg-0 btn btn-outline-dark">
            <TasksButton />
          </span>
          <router-link to="/profile" id="loginButton" data-placement="bottom" @click.native="hideNav()" class="nav-link btn btn-outline-secondary mt-2 mt-lg-0" data-toggle="tooltip" data-container="#mainButtonNav" :title="loggedIn?'Můj profil':'Přihlásit se'">
            <i class="material-icons">person</i>
            <span class="sr-only">Přihlásit</span>
          </router-link>
        </div>
      </div>
      <div class="navbar-cover bg-light"></div>
    </header>
    <header :class="'fixed-top bg-light nav-sec '+(darkTheme?'navbar-dark':'navbar-light')" style="z-index:1">
      <a class="navbar-brand" id="smallnav">{{$store.state.title}}</a>
    </header>
    <!-- There is space for dialog components -->
    <div @click='hideNav' ref='mainContent'>
      <transition :name="transitionName" mode="out-in" v-on:enter='applyThemeToChildren' @beforeLeave='setOverflow' @afterEnter='resetOverflow'>
        <keep-alive>
          <router-view />
        </keep-alive>
      </transition>
    </div>
    <div id="dialogArea">
      <ModalDialog v-for="n in modalsCount" :ref="'dialog'+n" :key="n" />
    </div>
    <AcceptTermsDialog v-if="notAcceptedTerms" />
    <TasksDialog v-if='tasksDialogShow' />
    <CustomizationDrawer v-if='custDialogShow' @chordsUpdate='songAppearanceUpdate' />
    <SettingsDialog v-if="settingsDialogShow" />
  </body>
</template>

<script>
import Settings from "./js/Settings";
import TasksButton from './components/TasksButton';
import { UIHelpers, Environment } from "./js/Helpers";

export default {
	data: function() {
		return {
			preferences: Settings.Preferences,
			customization: Settings.SongCustomization,
			pathname: window.location.pathname,
			notAcceptedTerms: false,
			settingsDialogShow: false,
			tasksDialogShow: false,
			custDialogShow: false,
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
					condition: () => !Environment.InsidePwa,
					href: "/offline",
					text: "Aplikace",
					icon: "cloud_download"
				},
				{
					condition: () => Environment.InsidePwa,
					href: "/offline",
					text: "Správa stažených",
					icon: "cloud_download"
				},
				{
					condition: () => this.loggedIn,
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
		SettingsDialog: () => import(/* webpackChunkName: "dialogs" */ "./views/dialogs/SettingsDialog"),
		CustomizationDrawer: () => import(/* webpackChunkName: "dialogs" */ "./views/dialogs/Customization"),
		TasksDialog: () => import(/* webpackChunkName: "dialogs" */ "./views/dialogs/TaskWindow"),
		ModalDialog: () => import(/* webpackChunkName: "dialogs" */ "./components/Dialog"),
		TasksButton: TasksButton
	},
	computed: {
		headerTitle() {
			if (this.preferences.FixedNavbar) return this.$store.state.title;
			else return process.env.VUE_APP_NAME;
		},
		modalsCount() {
			return this.$store.state.modalsCount;
		},
		darkTheme() {
			return this.preferences.Theme == "dark";
		},
		fixedNavbar() {
			if (this.pathname == "/song")
				//Always unfix on song page
				return false;
			return this.preferences.FixedNavbar;
		},
		loggedIn() {
			return this.$store.getters.loggedIn;
		}
	},
	mounted: function() {
		this.localHistory = [this.pathname];
		var _class = this;
		UIHelpers.appReferences = this.$refs;
		this.$router.beforeEach((to, from, next) => {
			_class.pathname = to.path;
			_class.preferences = Settings.Preferences;
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
		var navCollapse = $(this.$refs.navCollapse);
		if (!this.preferences.CookiesAccepted) this.notAcceptedTerms = true;
		var nav = $(".navbar");
		navCollapse.on("show.bs.collapse", function() {
			navCollapse.addClass("expanded");
			nav.css("--navbarUlHeight", navCollapse.height() + 61);
		});
		navCollapse.on("hide.bs.collapse", function() {
			navCollapse.removeClass("expanded");
		});
		if (this.preferences.Theme == "dark") Settings.changeTheme("dark", true);
	},
	methods: {
		hideNav() {
			$(this.$refs.navCollapse).collapse("hide");
		},
		applyThemeToChildren() {
			Settings.applyThemeToComponents($(this.$refs.mainContent));
		},
		setOverflow() {
			this.$refs.mainContent.style.overflow = "hidden";
		},
		resetOverflow() {
			this.$refs.mainContent.style.overflow = "visible";
		},
		showMainDialog() {
			if (this.pathname == "/song") {
				var wide = window.innerWidth > process.env.VUE_APP_BREAKPOINT_LG;
				this.$nextTick(() => $("#customization").navdrawer({ type: wide ? "persistent" : "temporary" }));
				this.hideNav();
			} else {
				this.settingsDialogShow = true;
				this.$nextTick(() => $("#settingsWidnow").modal("show"));
			}
		},
		songAppearanceUpdate(event) {
			this.$emit("chordsUpdate", event);
		}
	}
};
</script>