import { NoSleepHelper } from '../js/Helpers';
/**
 * Overall preferences manipulation
 */
class Preferences
{
	/**
	 * C-style copy constructor
	 * @param {Preferences} [init] Preferences object to copy properties from
	 */
	constructor(init)
	{
		for (var prop in init)
		{
			if (prop in this)
			{
				this[prop] = init[prop];//Copy properties
			}
		}
	}
	get Optimizations()
	{
		var sh = localStorage.getItem(Settings.KeyPrefix + 'optimizations');
		return sh === "true" || false;
	}
	set Optimizations(sh)
	{
		localStorage.setItem(Settings.KeyPrefix + 'optimizations', sh);
	}
	get ShowReloadPrompt()
	{
		var sh = localStorage.getItem(Settings.KeyPrefix + 'showReloadPrompt');
		return sh == "true";
	}
	set ShowReloadPrompt(sh)
	{
		localStorage.setItem(Settings.KeyPrefix + 'showReloadPrompt', sh);
	}
	get WakeLock()
	{
		var wakelock = localStorage.getItem(Settings.KeyPrefix + 'wakeLock');
		return wakelock === "false" ? false : true;
	}
	set WakeLock(wakelock)
	{
		localStorage.setItem(Settings.KeyPrefix + 'wakeLock', wakelock);
	}
	get FixedNavbar()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'fixedNavbar') == "false" ? false : true;
	}
	set FixedNavbar(display)
	{
		localStorage.setItem(Settings.KeyPrefix + 'fixedNavbar', display);
	}
	get TablePaging()
	{
		var paging = localStorage.getItem(Settings.KeyPrefix + 'tablePaging');
		return paging == "true";
	}
	set TablePaging(paging)
	{
		localStorage.setItem(Settings.KeyPrefix + 'tablePaging', paging);
	}
	get CookiesAccepted()
	{
		var val = localStorage.getItem(Settings.KeyPrefix + 'DataAccepted');
		return val == "true";
	}
	set CookiesAccepted(val)
	{
		localStorage.setItem(Settings.KeyPrefix + 'DataAccepted', val);
	}
	get ViewedAddSongTutor()
	{
		var val = localStorage.getItem(Settings.KeyPrefix + 'ViewedAddSongTutor');
		return val == "true";
	}
	set ViewedAddSongTutor(val)
	{
		localStorage.setItem(Settings.KeyPrefix + 'ViewedAddSongTutor', val);
	}
	get DisplayedOfflineListInfo()
	{
		var val = localStorage.getItem(Settings.KeyPrefix + 'DisplayedOfflineListInfo');
		return val == "true";
	}
	set DisplayedOfflineListInfo(val)
	{
		localStorage.setItem(Settings.KeyPrefix + 'DisplayedOfflineListInfo', val);
	}

	get ShownComunismAlert()
	{
		var val = localStorage.getItem(Settings.KeyPrefix + 'ShownComunismAlert');
		return val == "true";
	}
	set ShownComunismAlert(val)
	{
		localStorage.setItem(Settings.KeyPrefix + 'ShownComunismAlert', val);
	}

	get Theme()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'theme') || 'light';
	}
	set Theme(theme)
	{
		localStorage.setItem(Settings.KeyPrefix + 'theme', theme);
	}

	get EnableNotifications()
	{
		var enable = localStorage.getItem(Settings.KeyPrefix + 'enableNotifications');
		return enable === "false" ? false : true;
	}
	set EnableNotifications(enable)
	{
		localStorage.setItem(Settings.KeyPrefix + 'enableNotifications', enable);
		document.getElementById("notifEnable").checked = enable;
	}
}
/**
 * Stored settings related to song page appearance
 */
class SongCustomization
{
	/**
	 * C-style copy constructor
	 * @param {SongCustomization} [init] SongCustomization object to copy properties from
	 */
	constructor(init)
	{
		for (var prop in init)
		{
			if (prop in this)
			{
				this[prop] = init[prop];//Copy properties
			}
		}
	}
	get ShownNoteInfo()
	{
		var val = localStorage.getItem(Settings.KeyPrefix + 'ShownNoteInfo');
		return val == "true";
	}
	set ShownNoteInfo(val)
	{
		localStorage.setItem(Settings.KeyPrefix + 'ShownNoteInfo', val);
	}
	get ShowChords()
	{
		var show = localStorage.getItem(Settings.KeyPrefix + 'showChords');
		return show === "false" ? false : true;
	}
	set ShowChords(show)
	{
		localStorage.setItem(Settings.KeyPrefix + 'showChords', show);
	}
	get ShowOptionalChords()
	{
		var sh = localStorage.getItem(Settings.KeyPrefix + 'showOptional');
		return sh === "false" ? false : true;
	}
	set ShowOptionalChords(sh)
	{
		localStorage.setItem(Settings.KeyPrefix + 'showOptional', sh);
	}
	get ShowBassChords()
	{
		var sh = localStorage.getItem(Settings.KeyPrefix + 'showBass');
		return sh === "false" ? false : true;
	}
	set ShowBassChords(sh)
	{
		localStorage.setItem(Settings.KeyPrefix + 'showBass', sh);
	}
	set LineHeight(spacing)
	{
		localStorage.setItem(Settings.KeyPrefix + 'lineHeight', spacing);
	}
	get LineHeight()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'lineHeight') || 1.5;
	}
	set ParagraphMargin(spacing)
	{
		localStorage.setItem(Settings.KeyPrefix + 'pMargin', spacing);
	}
	get ParagraphMargin()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'pMargin') || 1;
	}
	get TextSize()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'textSize') || '1';
	}
	set TextSize(size)
	{
		localStorage.setItem(Settings.KeyPrefix + 'textSize', size);
	}
	get ChordSize()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'chordSize') || '1';
	}
	set ChordSize(size)
	{
		localStorage.setItem(Settings.KeyPrefix + 'chordSize', size);
	}

	get ChordStyle()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'chordStyle') || "above";
	}
	set ChordStyle(style)
	{
		localStorage.setItem(Settings.KeyPrefix + 'chordStyle', style);
	}


	get HighlightAnchors()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'HighlightAnchors') != "false";
	}
	set HighlightAnchors(val)
	{
		localStorage.setItem(Settings.KeyPrefix + 'HighlightAnchors', val)
	}

	get PageMargins()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'pageMargins') || "20";
	}
	set PageMargins(margins)
	{
		localStorage.setItem(Settings.KeyPrefix + 'pageMargins', margins);
	}
}
/**
 * @class
 * @classdesc Holds current user configuration objects
 * @hideconstructor
 */
var Settings = {
	_preferences: new Preferences(),
	_songCustomization: new SongCustomization(),
	Customization:SongCustomization,
	/**
	 * Used to mark localStorage fields which we don't want to delete when downloading a new version of the application
	 * @type {string}
	 * @default
	 */
	KeyPrefix: 'pref-',
	/**
	 * Changes application theme to dark/light
	 * @param {string} toWhat 
	 * @param {boolean} forceIt 
	 */
	changeTheme(toWhat, forceIt)
	{
		if (this._preferences.Theme != toWhat || forceIt)
		{
			this._preferences.Theme = toWhat;
			this.applyThemeToComponents($('body'));
			$("meta[name='theme-color']").attr("content", toWhat == 'dark' ? "#424242" : process.env.VUE_APP_THEME_COLOR);
		}
	},
	/**
	 * Changes css classes of child elements according to current theme settings
	 * @param {JQuery<HTMLElement>} parent 
	 */
	applyThemeToComponents(parent)
	{
		parent.find(".dark, .light").toggleClass("dark").toggleClass("light");
		parent.find(".btn-outline-dark, .btn-outline-light").toggleClass("btn-outline-dark").toggleClass("btn-outline-light");
		parent.find(".bg-light, .bg-dark").toggleClass("bg-light").toggleClass("bg-dark");
		parent.find(".text-light, .text-dark").toggleClass("text-light").toggleClass("text-dark");
		if (this.Preferences.Theme == 'dark')
		{
			parent.find(".btn-light").toggleClass("btn-dark").toggleClass("btn-light");
			parent.find(".bg-white").toggleClass("bg-white").toggleClass("bg-black");
			parent.find(".table-light").toggleClass("table-light").toggleClass("table-dark");
			parent.find(".list-group-item").addClass("list-group-item-dark");
			parent.find(".bg-light-3").removeClass("bg-light-3").addClass("bg-dark-3");
		}
		else
		{
			parent.find(".btn-dark").toggleClass("btn-dark").toggleClass("btn-light");
			parent.find(".bg-black").toggleClass("bg-white").toggleClass("bg-black");
			parent.find(".table-dark").toggleClass("table-light").toggleClass("table-dark");
			parent.find(".list-group-item-dark").removeClass("list-group-item-dark");
			parent.find(".bg-dark-3").addClass("bg-light-3").removeClass("bg-dark-3");
		}
		var selects = parent.find('*[data-style=btn-dark], *[data-style=btn-light]');
		if (selects.attr('data-style') == 'btn-light')
		{
			selects.attr('data-style', "btn-dark");
		} else
		{
			selects.attr('data-style', "btn-light");
		}
	},
	/**
	 * Applies currently selected theme to whole page
	 */
	applySettings()
	{
		this.changeTheme($("#themeSelect").val());
		var newSongCust = {};
		var newPrefs = {};
		newSongCust.ShowChords = document.getElementById("showChords").checked;
		newPrefs.FixedNavbar = document.getElementById("fixedNavbar").checked;
		newPrefs.ShowReloadPrompt = document.getElementById('showReloadPrompt').checked;
		newPrefs.Optimizations = document.getElementById('optimizations').checked;
		newPrefs.TablePaging = document.getElementById("tablePaging").checked;
		newPrefs.EnableNotifications = document.getElementById("notifEnable").checked;
		if (newPrefs.EnableNotifications)
		{
			//initialisePush();
			$("#notificationStatus").removeClass("d-none");
		}
		else
		{
			$("#notificationStatus").addClass("d-none");
		}
		newPrefs.WakeLock = document.getElementById("wakeLock").checked;
		if (!newPrefs.WakeLock&&NoSleepHelper._nosleep)
		{
			NoSleepHelper._nosleep.disable();
		}

		this.SongCustomization = newSongCust;
		this.Preferences = newPrefs;
	},
	/**
	 * @type Preferences
	 */
	get Preferences()
	{
		return this._preferences;
	},
	set Preferences(val)
	{
		this._preferences = new Preferences(val);
	},
	/**
	 * @type SongCustomization
	 */
	get SongCustomization()
	{
		return this._songCustomization;
	},
	set SongCustomization(val)
	{
		this._songCustomization = new SongCustomization(val)
	}
};

/*$('#customization').on('show.md.navdrawer',function(){$('#mainNavCollapse').collapse('hide')});*/
export default Settings;