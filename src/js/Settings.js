import { NoSleepHelper } from '../js/Helpers';

///
///Customization
///
var Settings = {
	KeyPrefix: 'pref-',
	changeTheme(toWhat, forceIt)
	{
		if (this.Theme != toWhat || forceIt)
		{
			this.Theme = toWhat;
			this.applyThemeToComponents($('body'));
			$("meta[name='theme-color']").attr("content", toWhat == 'dark' ? "#424242" : process.env.VUE_APP_THEME_COLOR);
		}
	},
	applyThemeToComponents(parent)
	{
		parent.find(".dark, .light").toggleClass("dark").toggleClass("light");
		parent.find(".btn-outline-dark, .btn-outline-light").toggleClass("btn-outline-dark").toggleClass("btn-outline-light");
		parent.find(".bg-light, .bg-dark").toggleClass("bg-light").toggleClass("bg-dark");
		parent.find(".text-light, .text-dark").toggleClass("text-light").toggleClass("text-dark");
		if (this.Theme == 'dark')
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
	applySettings()
	{
		this.changeTheme($("#themeSelect").val());
		Settings.ShowChords = document.getElementById("showChords").checked;
		Settings.FixedNavbar = document.getElementById("fixedNavbar").checked;
		Settings.ShowReloadPrompt = document.getElementById('showReloadPrompt').checked;
		Settings.Optimizations = document.getElementById('optimizations').checked;
		Settings.TablePaging = document.getElementById("tablePaging").checked;
		Settings.EnableNotifications = document.getElementById("notifEnable").checked;
		if (Settings.EnableNotifications)
		{
			//initialisePush();
			$("#notificationStatus").removeClass("d-none");
		}
		else
		{
			$("#notificationStatus").addClass("d-none");
		}
		Settings.WakeLock = document.getElementById("wakeLock").checked;
		if (!Settings.WakeLock)
		{
			NoSleepHelper._nosleep.disable();
		}

		/*this.applyCustomization();
		this.updateSettingsIndicators();*/
	},
	set LineHeight(spacing)
	{
		localStorage.setItem(Settings.KeyPrefix + 'lineHeight', spacing);
	},
	get LineHeight()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'lineHeight') || 1.5;
	},
	set ParagraphMargin(spacing)
	{
		localStorage.setItem(Settings.KeyPrefix + 'pMargin', spacing);
	},
	get ParagraphMargin()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'pMargin') || 1;
	},
	/*get AlterationChange()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'alterationChange_' + GET['id']) == "true" || false;
	},
	set AlterationChange(change)
	{
		localStorage.setItem(Settings.KeyPrefix + 'alterationChange_' + GET['id'], change);
	},*/
	get Optimizations()
	{
		var sh = localStorage.getItem(Settings.KeyPrefix + 'optimizations');
		return sh === "true" || false;
	},
	set Optimizations(sh)
	{
		localStorage.setItem(Settings.KeyPrefix + 'optimizations', sh);
	},
	get ShowOptionalChords()
	{
		var sh = localStorage.getItem(Settings.KeyPrefix + 'showOptional');
		return sh === "false" ? false : true;
	},
	set ShowOptionalChords(sh)
	{
		localStorage.setItem(Settings.KeyPrefix + 'showOptional', sh);
	},
	get ShowBassChords()
	{
		var sh = localStorage.getItem(Settings.KeyPrefix + 'showBass');
		return sh === "false" ? false : true;
	},
	set ShowBassChords(sh)
	{
		localStorage.setItem(Settings.KeyPrefix + 'showBass', sh);
	},
	get ShowReloadPrompt()
	{
		var sh = localStorage.getItem(Settings.KeyPrefix + 'showReloadPrompt');
		return sh == "true";
	},
	set ShowReloadPrompt(sh)
	{
		localStorage.setItem(Settings.KeyPrefix + 'showReloadPrompt', sh);
	},
	get WakeLock()
	{
		var wakelock = localStorage.getItem(Settings.KeyPrefix + 'wakeLock');
		return wakelock === "false" ? false : true;
	},
	set WakeLock(wakelock)
	{
		localStorage.setItem(Settings.KeyPrefix + 'wakeLock', wakelock);
	},
	get FixedNavbar()
	{
		return localStorage.getItem(Settings.KeyPrefix + 'fixedNavbar') == "false" ? false : true;
	},
	set FixedNavbar(display)
	{
		localStorage.setItem(Settings.KeyPrefix + 'fixedNavbar', display);
	},
	get ShowChords()
	{
		var show = localStorage.getItem(Settings.KeyPrefix + 'showChords');
		return show === "false" ? false : true;
	},
	set ShowChords(show)
	{
		localStorage.setItem(Settings.KeyPrefix + 'showChords', show);
	}
};
Object.defineProperties(Settings, {
	TablePaging:
	{
		get: function ()
		{
			var paging = localStorage.getItem(Settings.KeyPrefix + 'tablePaging');
			return paging == "true";
		},
		set: function (paging)
		{
			localStorage.setItem(Settings.KeyPrefix + 'tablePaging', paging);
		}
	},
	CookiesAccepted: {
		get: function ()
		{
			var val = localStorage.getItem(Settings.KeyPrefix + 'DataAccepted');
			return val == "true";
		},
		set: function (val)
		{
			localStorage.setItem(Settings.KeyPrefix + 'DataAccepted', val);
		}
	},
	ViewedAddSongTutor: {
		get: function ()
		{
			var val = localStorage.getItem(Settings.KeyPrefix + 'ViewedAddSongTutor');
			return val == "true";
		},
		set: function (val)
		{
			localStorage.setItem(Settings.KeyPrefix + 'ViewedAddSongTutor', val);
		}
	},
	ShownNoteInfo: {
		get: function ()
		{
			var val = localStorage.getItem(Settings.KeyPrefix + 'ShownNoteInfo');
			return val == "true";
		},
		set: function (val)
		{
			localStorage.setItem(Settings.KeyPrefix + 'ShownNoteInfo', val);
		}
	},
	DisplayedOfflineListInfo: {
		get: function ()
		{
			var val = localStorage.getItem(Settings.KeyPrefix + 'DisplayedOfflineListInfo');
			return val == "true";
		},
		set: function (val)
		{
			localStorage.setItem(Settings.KeyPrefix + 'DisplayedOfflineListInfo', val);
		}
	},
	ShownComunismAlert: {
		get: function ()
		{
			var val = localStorage.getItem(Settings.KeyPrefix + 'ShownComunismAlert');
			return val == "true";
		},
		set: function (val)
		{
			localStorage.setItem(Settings.KeyPrefix + 'ShownComunismAlert', val);
		}
	},
	TextSize: {
		get: function ()
		{
			return localStorage.getItem(Settings.KeyPrefix + 'textSize') || '1';
		},
		set: function (size)
		{
			localStorage.setItem(Settings.KeyPrefix + 'textSize', size);
		}
	},
	ChordSize: {
		get: function ()
		{
			return localStorage.getItem(Settings.KeyPrefix + 'chordSize') || '1';
		},
		set: function (size)
		{
			localStorage.setItem(Settings.KeyPrefix + 'chordSize', size);
		}
	},
	Theme: {
		get: function ()
		{
			return localStorage.getItem(Settings.KeyPrefix + 'theme') || 'light';
		},
		set: function (theme)
		{
			localStorage.setItem(Settings.KeyPrefix + 'theme', theme);
		}
	},

	PageMargins: {
		get: function ()
		{
			return localStorage.getItem(Settings.KeyPrefix + 'pageMargins') || "20";
		},
		set: function (margins)
		{
			localStorage.setItem(Settings.KeyPrefix + 'pageMargins', margins);
		}
	},
	ChordStyle: {
		get: function ()
		{
			return localStorage.getItem(Settings.KeyPrefix + 'chordStyle') || "above";
		},
		set: function (style)
		{
			localStorage.setItem(Settings.KeyPrefix + 'chordStyle', style);
		}
	},
	HighlightAnchors: {
		get: function ()
		{
			return localStorage.getItem(Settings.KeyPrefix + 'HighlightAnchors') != "false";
		},
		set: function (val)
		{
			localStorage.setItem(Settings.KeyPrefix + 'HighlightAnchors', val)
		}
	},
	EnableNotifications:
	{
		get: function ()
		{
			var enable = localStorage.getItem(Settings.KeyPrefix + 'enableNotifications');
			return enable === "false" ? false : true;
		},
		set: function (enable)
		{
			localStorage.setItem(Settings.KeyPrefix + 'enableNotifications', enable);
			document.getElementById("notifEnable").checked = enable;
		}
	}
});
/*

function transposeChord(chord, amount) {
	"use strict";
	const scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "H"];
	var matchedh = [];
	var normal = chord.replace(/([CDEFGAH](?![#b]))/g, function(match) {
		var i = (scale.indexOf(match) + amount) % scale.length;
		var changed = scale[ i < 0 ? i + scale.length : i ];
		matchedh.push(changed);
		return changed;
	});
	var withHash = normal.replace(/[CDEFGAH]#/g, function(match) {
		if(matchedh.includes(match))
			return match;
		var i = (scale.indexOf(match) + amount) % scale.length;
		chord;
		var changed = scale[ i < 0 ? i + scale.length : i ];
		matchedh.push(changed);
		return changed;
	});
	var withB = withHash.replace(/[CDEFGAH]b/g, function(match){
		if(matchedh.includes(match))
			return match;
		let altered = changeAlteration(match);
		let i = (scale.indexOf(altered) + amount) % scale.length;
		chord;
		return changeAlteration(scale[ i < 0 ? i + scale.length : i ]);
	});
	return withB;
}
function changeAlteration(chord)
{
	const sharps = ["C#","D#","F#","G#","A#"];
	const flats = ["Db","Eb","Gb","Ab","Hb"];
	const neutral = ["C","D","E","F","G","A","H"];
	for (var i=0; i<sharps.length; i++) {
		if(chord.includes(sharps[i]))
		{
			return chord.replace(sharps[i],flats[i]);
		}
		else if(chord.includes(flats[i]))
		{
			return chord.replace(flats[i],sharps[i]);
		}
	}
	for (var i=0; i<neutral.length; i++) {
		if(chord.includes(neutral[i]))
		{
			return chord;
		}
	}
	console.error("Found chord \""+chord+"\" in which alteration cannot be changed");
	return chord;
}
function applyChordSpacing()
{
	$("i.space").remove();
	var wrp = document.getElementById('songWrapper');
	if(!wrp)
		return;
	var wrpRight = wrp.getBoundingClientRect().right;
	$(".chord+.lyric+.chord").each(function(){
		var preceedingLyric = this.previousElementSibling;
		var preceedingChord = preceedingLyric.previousElementSibling;//Now select previous chord
		var nextLyric = this.nextElementSibling;
		if(preceedingChord.offsetTop + preceedingChord.offsetHeight<nextLyric.offsetTop)
		{
			if(preceedingChord.offsetTop == this.offsetTop)//Chords are on same line
			{
				var spaceElem = document.createElement("i");
				spaceElem.className = "space break";
				this.parentNode.insertBefore(spaceElem, this);
			}
			return;//If we are on different line that preceeding chord
		}
		var lastTextInLyric;
		for(var child of preceedingLyric.childNodes)
		{
			if(child.nodeName=='#text')
			{
				lastTextInLyric = child;
			}
			else if(child.nodeName=='BR')
				return;
			else if(child.nodeName==='B')
			{
				for(var child2 of child.childNodes)//To make emphasized sequences work
				{
					if(child2.nodeName=='#text')
					{
						lastTextInLyric = child2;
					}
					else if(child2.nodeName=='BR')
						return;
				}
			}
		}
		var range = document.createRange();
		range.selectNode(lastTextInLyric);
		var rect = range.getBoundingClientRect();
		range.detach();
		var spaceElem = document.createElement("i");
		spaceElem.className = "space";
		spaceElem.style.width = (preceedingChord.clientWidth - rect.width + 5) + "px";
		this.parentNode.insertBefore(spaceElem, this);
	});
}
function applyTransposition(amount)
{
	"use strict";
	$("#songWrapper .chord").each(function(){
		var elem = $(this);
		if(!elem.attr('data-original'))
			elem.attr('data-original',this.innerHTML)
		elem.html(transposeChord(
			elem.attr('data-original'),//Get the original chord and transpose it
			amount*2
		));
	});
	applyChordSpacing();
	if(amount==0)
	{
		$("#transpositionInfo").html("");
	}
	else
	{
		$("#transpositionInfo").html("Transponováno o "+ amount.toString() + ((amount<0) ? " dolů" : " nahoru"));
	}
}
function alterAll()
{
	$(".chord").each(function()
					 {
		const elem = this;
		elem.innerHTML = changeAlteration(elem.innerHTML);
	});
}
function optionalChords(show)
{
	if(show)
		$("#songWrapper .chord:contains('(')").show()
	else
		$("#songWrapper .chord:contains('(')").hide()
}
function bassChords(show)
{
	if(show)
		$("#songWrapper .chord .d-none").removeClass("d-none");
	else
	{
		var found = $("#songWrapper .chord span").addClass("d-none").length;
		if(!found)
			$("#songWrapper .chord:contains('/')").each(function(){
				var index = this.innerHTML.indexOf('/');
				var newSpan= document.createElement('span');
				newSpan.className = 'd-none';
				newSpan.innerHTML = this.innerHTML.substr(index);
				this.innerHTML = this.innerHTML.substr(0,index);

				this.appendChild(newSpan);
			})
	}
}
function applyCustomization()
{
	var wrp = $('#songWrapper');
	wrp.attr('style','--lheight:'+((Settings.ShowChords?1:0)+parseFloat(Settings.LineHeight))+';--lwchheight:'+Settings.LineHeight+
			 ";--chordSize:"+Settings.ChordSize +'rem;--pMargin:'+Settings.ParagraphMargin+'rem;font-size:'+Settings.TextSize +'rem');
	$("body").css("--mainMargin","-"+Settings.PageMargins+"px");
	if(Settings.ShowChords)
	{
		if(Settings.ChordStyle=='inside')//Hovorka style
			wrp.addClass("inside");
		else
			wrp.removeClass("inside");
		if(Settings.AlterationChange == true)
		{
			alterAll();
		}
		if(Settings.ShowOptionalChords == false)
		{
			optionalChords(false);
		}
		if(Settings.ShowBassChords == false)
		{
			bassChords(false);
		}
		$("#songWrapper").removeClass("no-chords")
		applyTransposition(Settings.GetTransposition(GET['id']));
	}
	else
	{
		$("#songWrapper").addClass("no-chords")
	}
	$('#text-size').val(Settings.TextSize);
	$('#chord-size').val(Settings.ChordSize) ;
	$('#line-height').val(Settings.LineHeight);
	$('#pMargin').val(Settings.ParagraphMargin);
	$('#page-margins').val(Settings.PageMargins);
	$("#chordStyle" ).val(Settings.ChordStyle);
	$("#chord-shift").val(Settings.GetTransposition(GET['id']));
	document.getElementById("alterationChange").checked = Settings.AlterationChange;
	document.getElementById("showOptional").checked = Settings.ShowOptionalChords;
	document.getElementById("showBass").checked = Settings.ShowBassChords;
}

$('#customization').on('show.md.navdrawer',function(){$('#mainNavCollapse').collapse('hide')});*/
export default Settings;