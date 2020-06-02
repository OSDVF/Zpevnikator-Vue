<template>
  <main ref="main">
    <div v-show="loggedIn" style="position: absolute; left: 0px; right: 0px; bottom: 0px; top: 0px;">
      <div id="songsTab">
        <songs @scroll.passive="onTabScroll" />
      </div>
      <div id="groupsTab">
        <groups @scroll.passive="onTabScroll" />
      </div>
      <div id="playlistsTab">
        <playlists @scroll.passive="onTabScroll" />
      </div>
      <div id="settingsTab">
        <settings @scroll.passive="onTabScroll" />
      </div>
      <div class="fixed-bottom" id="bottomNav" ref="bottomNav">
        <ul id="bottomTabs" class="nav tabs nav-justified">
          <li class="tab nav-item"><a href="#songsTab" class="active" data-target="tooltip" title="Mé písně"><i class="material-icons">music_note</i></a></li>
          <li class="tab nav-item"><a href="#groupsTab" data-target="tooltip" title="Skupiny"><i class="material-icons">group</i></a></li>
          <li class="tab nav-item"><a href="#playlistsTab" data-target="tooltip" title="Playlisty"><i class="material-icons">queue_music</i></a></li>
          <li class="tab nav-item"><a href="#settingsTab" data-target="tooltip" title="Můj profil"><i class="material-icons">person</i></a></li>
        </ul>
      </div>
    </div>
    <div v-if="!loggedIn" class="container">
      <form id="loginForm" method="POST" @submit.prevent="tryLogin">
        <div class="form-group">
          <label for="login">Jméno</label>
          <input type="text" class="form-control" v-model="typedUsername" name="username" placeholder="Uživatelské jméno" autocomplete="username0" required>
        </div>
        <div class="form-group">
          <label for="password">Heslo</label>
          <input type="password" class="form-control" v-model="typedPassword" name="password" autocomplete="current-password" placeholder="Heslo" required>
        </div>

        <div v-show="loginInfoShow" :class='("text-")+(loginInfoShow&&!loginPending?"danger":"primary")'>{{pendinInfo}}</div>

        <button type="submit" class="btn btn-outline-primary" style="float:left;">Přihlásit</button>

        <div id="loginProgressCircle" v-if="loginPending" class="progress-circular progress-circular-primary ml-1 float-left">
          <div class="progress-circular-wrapper">
            <div class="progress-circular-inner">
              <div class="progress-circular-left">
                <div class="progress-circular-spinner"></div>
              </div>
              <div class="progress-circular-gap"></div>
              <div class="progress-circular-right">
                <div class="progress-circular-spinner"></div>
              </div>
            </div>
          </div>
        </div>
        <small id="emailHelp" class="form-text text-muted" style="clear:both;">Rehgistrace uživatelů zařízena přes <a href="http://dorostmladez.cz/">dorostmladez.cz</a></small>
      </form>
      <p class="mt-2">
        Přihlášením dostanete možnost přidávat písně.
      </p>
      Registrace je možná <a href="http://dorostmladez.cz/wp-register.php">zde</a> | <a href="https://dorostmladez.cz/wp-login.php?action=lostpassword">Zapomenuté heslo?</a>
    </div>
  </main>
</template>
<script>
import { SongDB } from "../js/databases/SongDB";
import GroupsTab from "./together/GroupsTab";
import SettingsTab from "./together/SettingsTab";
import SongsTab from "./together/SongsTab";
import PlaylistsTab from "./together/PlaylistsTab";

const loginFailed = "Přihlášení pomocí těchto údajů se nezdařilo!";
export default {
	data() {
		return {
			loginPending: false,
			loginInfoShow: false,
			pendinInfo: loginFailed,
			typedUsername: null,
			typedPassword: null
		};
	},
	components: {
		songs: SongsTab,
		playlists: PlaylistsTab,
		settings: SettingsTab,
		groups: GroupsTab
	},
	computed: {
		loggedIn() {
			const ret = this.$store.getters.loggedIn;
			try {
				if (ret == false && this.tabs) this.tabs.destroy(); //We must destroy the tabview when loggin off, otherwise it would conflict with DOM
			} catch (e) {}
			this.$store.commit("changeTitle", ret ? "Mé písně" : "Přihlášení");
			return ret;
		}
	},
	created() {
		this.themeState = false;
	},
	mounted() {
		this.prevScroll = 0;
		this.navShown = true;
		if (this.loggedIn) $(this.whileLogged);

		var m = $(this.$refs.main);
		m.css("--offsetMain", m.offset().left + "px");
	},
	activated() {
		this.$parent.applyThemeToChildren(); //Because tabs would stay unaffected
	},
	methods: {
		onTabScroll(event) {
			var scr = event.target.scrollTop;
			if (scr < this.prevScroll && !this.navShown) {
				this.$refs.bottomNav.classList.remove("hidden");
				this.navShown = true;
			} else if (scr > this.prevScroll && this.navShown) {
				this.navShown = false;
				this.$refs.bottomNav.classList.add("hidden");
			}
			this.prevScroll = scr;
		},
		tryLogin(event) {
			this.loginPending = true;
			this.loginInfoShow = false;
			var formData = new FormData(event.target);
			fetch(process.env.VUE_APP_REMOTE_URL + "/api/auth/login.php", {
				method: "POST",
				body: formData
			})
				.then(result => {
					result
						.json()
						.then(response => {
							if (response.status === "OK") {
								SongDB.DeleteUserSpecificSongs(() => {
									SongDB.downloadIndex(() => {
										this.loginPending = false;
										this.loginInfoShow = false;
										this.$store.commit("logItIn", { id: response.id, credentials: response.data, name: this.typedUsername });
										this.$nextTick(this.whileLogged);
									});
								});
								console.info("Login succesfull");

								this.pendinInfo = "Čekání na informace o účtu....";
								this.loginInfoShow = true;
							} else {
								console.warn("Login failed");

								this.loginInfoShow = true;
								this.loginPending = false;
								this.pendinInfo = loginFailed;
							}
						})
						.catch(e => {
							if (typeof Sentry != "undefined") Sentry.captureException(e);
							this.pendinInfo = "Nepodařilo se přečíst odpověď serveru";

							this.loginPending = false;
							this.loginInfoShow = true;
						});
				})
				.catch(() => {
					this.pendinInfo = "Připojení se nezdařilo";

					this.loginPending = false;
					this.loginInfoShow = true;
				});
		},
		whileLogged() {
			this.tabs = M.Tabs.init(document.getElementById("bottomTabs"), {
				swipeable: true,
				onShow: () => {
					this.$refs.bottomNav.classList.remove("hidden");
				},
				onTabClick: a => {
					this.$store.commit("changeTitle", a[0].title);
				}
			});
		}
	}
};
</script>
<style>
main {
	min-height: 100vh;
}
.swiper {
	overflow: hidden;
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	-webkit-perspective: 500px;
	perspective: 500px;
	-webkit-transform-style: preserve-3d;
	transform-style: preserve-3d;
	-webkit-transform-origin: 0% 50%;
	transform-origin: 0% 50%;
}

.swiper.swiper-slider {
	top: 0;
	left: 0;
}

.swiper.swiper-slider .swiper-item {
	width: 100%;
	height: 100%;
	min-height: 400px;
	position: absolute;
	top: 0;
	left: 0;
	visibility: hidden;
	overflow: auto;
}
.swiper-item > .likeMain {
	position: relative;
	padding: var(--offsetTop) var(--offsetMain);
}
.indicator {
	position: absolute;
	height: 1.9px;
	background-color: var(--secondary);
	will-change: transform;
	transition: transform 0.2s ease;
}
.tabs {
	overflow-x: auto;
	overflow-y: hidden;
	height: 48px;
	width: 100%;
	background-color: #fff;
	margin: 0 auto;
	padding: 0;
	white-space: nowrap;
}

.tabs .tab {
	line-height: 48px;
	height: 48px;
	padding: 0;
	margin: 0;
	text-transform: uppercase;
}

.tabs .tab a {
	display: block;
	width: 100%;
	height: 100%;
	padding: 0 24px;
	overflow: hidden;
	-webkit-transition: color 0.28s ease, background-color 0.28s ease;
	transition: color 0.28s ease, background-color 0.28s ease;
}

.tabs .tab a:active,
.tabs .tab a:hover {
	background-color: rgba(0, 0, 0, 0.12);
}
#bottomTabs {
	margin-top: -1px;
}
#bottomNav {
	backface-visibility: hidden;
	transform: translateY(0);
	transition: transform 0.2s ease;
	border-image-source: linear-gradient(#ffffff00 20%, #00000030);
	border-top: 7px solid;
	border-image-slice: 100% 0 0 0;
}
#bottomNav.hidden {
	transform: translateY(100%);
}
</style>