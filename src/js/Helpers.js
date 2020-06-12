/**
 * @class
 * @classdesc API for simple network transfer with cache handling
 */
const NetworkUtils = {
	/**
	 * Performs a fetch request with proper headers to supress browser caching
	 * @param {string} uri 
	 * @returns {Promise<Response>}
	 */
	getNoCache: function (uri)
	{
		return fetch(uri, {
			headers: {
				"Cache-Control": "no-store"
			}
		});
	},
	/**
	 * Performs a fetch request with proper headers to force browser caching to revalidate
	 * @param {string} uri 
	 * @returns {Promise<Response>}
	 */
	revalidateCache: function (uri)
	{
		return fetch(uri, {
			headers: {
				"Cache-Control": "must-revalidate"
			}
		});
	},
	/**
	 * Creates a Request object with proper headers to supress browser caching
	 * @param {string} uri 
	 * @returns {Request}
	 */
	noCacheRequest: function (uri)
	{
		var noCacheHead = new Headers();
		noCacheHead.append("Cache-Control", "no-store");
		return new Request(uri, {
			headers: noCacheHead,
			cache: 'no-store'
		})
	},
	/**
	 * Tries to get the resource from cache with the supplied name first and if it fails, it gets it from the internet
	 * 
	 * @param {string} uri 
	 * @param {string} [cacheName]
	 * @returns {Promise<Response>}
	 */
	CacheOrNetwork(uri, cacheName)//Faster than relying on service worker
	{
		if (cacheName)
			return caches.open(cacheName).then((c) =>
			{
				return c.match(uri).then((response) =>
				{
					if (response)
						return response;
					else
						return fetch(uri);
				});
			})
		else return caches.match(uri).then((response) =>
		{
			if (response)
				return response;
			else
				return fetch(uri);
		})
	}
}
/**
 * @class
 * @classdesc Manipulate HTML song data
 */
const SongProcessing = {
	anchorsPattern: /\d(?:\)|\.|x|:)|bridge|coda|intro|outro|sloka|mezihra|předehra|dohra|\/:|:\/|refren|refrén|ref:|ref\.:|ref\./gmi,
	/**
	 * Creates proper url for the 'get me that song' request
	 * @param {string} id The song identifier 'e.g. my-best-song'
	 */
	createGetSongUrl(id)
	{
		return process.env.VUE_APP_API_URL+'/songs/get.php?id='+id;
	},
	makeRightSequencesBold: function (text)
	{
		return text.replace(this.anchorsPattern, this.makeBold)
	},
	makeBold: function (match)
	{
		return "<b>" + match + "</b>";
	},
	chordProToHtml: function (text)
	{
		text = "<span class='lyric'>" + text;
		text = text.replace(/\[([A-Z<(\/][^\[\]]*)\]/gi, function (_match, p1)
		{
			return "</span><span class='chord'>" + p1.charAt(0).toUpperCase() + p1.slice(1) + "</span><span class='lyric'>"; //First letter uppercase
		})
		text += '</span>';
		return text;
	},
	domToClipboardJSON: function (element)
	{
		var output = {
			p: false,
			paragraphs: []
		};
		var i = 0;
		output.paragraphs[i] = '';
		for (var inner of element.childNodes)
		{
			if (!output.paragraphs[i]) output.paragraphs[i] = '';
			switch (inner.nodeName)
			{
				case "#text":
					output.paragraphs[i] += inner.data;
					break;
				case 'SPAN':
					if (inner.classList.contains('chord'))
						output.paragraphs[i] += '[' + inner.innerText + ']';
					else output.paragraphs[i] += inner.innerHTML;
					break;
				case 'BR':
					output.paragraphs[i] += "<br>";
					break;
				case 'P':
					output.p = true;
					for (var inP of inner.childNodes)
					{
						switch (inP.nodeName)
						{
							case "#text":
								output.paragraphs[i] += inP.data;
								break;
							case 'SPAN':
								if (inP.classList.contains('chord'))
									output.paragraphs[i] += '[' + inP.innerText + ']';
								else output.paragraphs[i] += inP.innerHTML;
								break;
							case 'BR':
								output.paragraphs[i] += "<br>";
								break;
						}
					}
					i++;
					break;
			}
		}
		return output;
	},
	slugify: function (string)
	{
		const a = 'àáäâãåăæąçćčđďèéěėëêęǵḧìíïîįłḿǹńňñòóöôœøṕŕřßśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;'
		const b = 'aaaaaaaaacccddeeeeeeeghiiiiilmnnnnooooooprrssssttuuuuuuuuuwxyyzzz------'
		const p = new RegExp(a.split('').join('|'), 'g')

		return string.toString().toLowerCase()
			.replace(/\s+/g, '-') // Replace spaces with -
			.replace(p, function (c)
			{
				return b.charAt(a.indexOf(c))
			}) // Replace special characters
			.replace(/&/g, '-and-') // Replace & with 'and'
			.replace(/[^\w\-]+/g, '') // Remove all non-word characters
			.replace(/\-\-+/g, '-') // Replace multiple - with single -
			.replace(/^-+/, '') // Trim - from start of text
			.replace(/-+$/, '') // Trim - from end of text
	},
	removeUnnecessary: function (string)
	{
		var virtDom = $("<article>" + string + "</article>");
		virtDom.find("i.space").remove();
		virtDom.find(".chord").removeAttr("data-original").removeAttr("contenteditable");
		return virtDom.html();
	},
	statusToIcon: function (status, color)
	{
		switch (status)
		{
			case 'publish':
				return '<i class="text-' + (color ? color : 'muted') + ' publish material-icons">person</i>';
			case 'draft':
				return '<i class="text-secondary draft material-icons">work</i>';
			case 'pending':
				return '<i class="text-secondary pending material-icons">watch_later</i>';
			case 'future':
				return '<i class="text-secondary future material-icons">forward</i>';
			case 'private':
				return '<i class="text-secondary private material-icons">lock</i>';
			default:
				return '<i class="text-danger unknown material-icons">assignment_late</i>';
		}
	},
	statusToDescription: function (status)
	{
		switch (status)
		{
			case 'publish':
				return 'Zveřejněna vámi';
			case 'draft':
				return 'Online jen pro vás, čekající na publikaci';
			case 'pending':
				return 'Čekající na schválení';
			case 'future':
				return 'Bude publikován v budoucnosti';
			case 'private':
				return 'Soukromá';
			default:
				return 'Neznámý typ písně';
		}
	},
	isThereDirtySong: function ()
	{
		var saved = localStorage.getItem(settingsPrefix + 'lastEditedSong');
		saved = saved && saved != '<p><span class="lyric"><br></span></p>';
		saved = saved && localStorage.getItem(settingsPrefix + 'editedDirty') == 'true';
		return saved;
	},
	strHash(str)
	{
		var hash = 0, i, chr;
		for (i = 0; i < str.length; i++)
		{
			chr = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	}
};
/**
 * @class
 * @classdesc Generate files from various data
 */
const IOUtils = {
	CreateTxtBlob: function (txt)
	{
		return new Blob(["\ufeff", txt], {
			encoding: "UTF-8",
			type: "text/plain;charset=UTF-8"
		});
	},
	CreateBufferBlob: function (buffer)
	{
		return new Blob([buffer], {
			type: "application/x-binary"
		});
	},
	CreateUrlForDownload: function (txt)
	{
		return URL.createObjectURL(this.CreateBufferBlob(txt));
	},
	GenerateUUID: function (length)
	{
		return Math.random().toString(36).substr(2, length);
	}
}
/**
 * @class
 * @classdesc Data conversion utilities
 */
const DataUtils = {
	urlB64ToUint8Array(base64String)
	{
		"use strict";
		const padding = '='.repeat((4 - base64String.length % 4) % 4);
		const base64 = (base64String + padding)
			.replace(/\-/g, '+')
			.replace(/_/g, '/');

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i)
		{
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}
}

/**
 * @todo Use the Wakelock API instead when it will be available
 * @class
 * @classdesc Helper for the NoSleep library
 */
const NoSleepHelper = {
	_nosleep: null,
	initialize: function ()
	{
		if (this._nosleep == null)
		{
			try
			{
				this._nosleep = new NoSleep();
			} catch (e)
			{
				if (e instanceof ReferenceError)
				{
					UIHelpers.Message('Nepodařilo se načíst součást pro zabránění vypínaní displeje. Možná není úplně stažena.', "danger", 3000, true)
				}
			}
		}
	}
}

/**
 * @class
 * @classdesc Show various procedural UI elements
 */
const UIHelpers = {
	store: null,
	dialogResult: null,
	DialogType: Object.freeze({
		"Ok": 1,
		"OkCancel": 2,
		"YesNo": 3,
		"AbortRetryIgnore": 4,
		"NoButtons": 5,
		"NoButtonsWeak": 6
	}),
	/**
	 * Enum for selecting dialog buttons
	 * @typedef DialogType
	 * @property Ok
	 * @property OkCancel
	 * @property YesNo
	 * @property AbortRetryIgnore
	 * @property NoButtons
	 * @property NoButtonsWeak Makes the dialog disappeear wher user clicks in outer space
	 */
	/**
	 * Displays a procedural bootstrap modal
	 * @param {string|Node} text Inner text or inner nodes to display
	 * @param {function} callback Occurs when user clicks one of buttons. Gets one value passed: ok|cancel|yes|no
	 * @param {(DialogType|string|Array)} type One of values of DialogType, custom string for custom 'Ok' button text or an Array in format [ok,cancel] for custom text for these buttons
	 * @param {string} header Text in header 
	 * @param {string} footer Text in footer
	 * @param {function} positiveEventListener Callback for clicking on the more 'positive' button (ok/yes)
	 * @returns {JQuery<HTMLElement>}
	 */
	Dialog(text, callback, type = UIHelpers.DialogType.Ok, header, footer, positiveEventListener)
	{
		UIHelpers.store.commit('addDialog');
		if (!callback) callback = new Function();
		if (!positiveEventListener) positiveEventListener = new Function();
		const newDialog = UIHelpers.appReferences['dialog' + (UIHelpers.store.state.modalsCount - 1)][0];//Because Vuex's reaction to commit is too sloow sometimes
		newDialog.setData(text, callback, type, header, footer, positiveEventListener);
		newDialog.show();
	},
	pendingMessages: [],
	placeSnackbar($snackbar, text, type, timeout, multiline)
	{
		$snackbar.addClass(() =>
		{
			setTimeout(() =>
			{
				$snackbar.removeClass('showing')
			}, parseFloat($snackbar.css("transition-duration")) * 1000)

			$snackbar.html(text);
			var children = $snackbar.find(".snackbar-body");
			if (children.length > 0)
			{
				children.removeClass('text-info').removeClass('text-primary').removeClass('text-secondary').removeClass('text-success')
					.removeClass('text-danger').removeClass('text-warning').removeClass('text-info');
				if (typeof type != "undefined")
				{
					children.addClass("text-" + type);
				}
				if (multiline != undefined && multiline === true)
					$snackbar.addClass("snackbar-multi-line");
				else
					$snackbar.removeClass("snackbar-multi-line");
				//children.html(text);
			}
			setTimeout(() =>
			{
				$snackbar.removeClass('show')
				setTimeout(() =>
				{
					if (UIHelpers.pendingMessages.length > 0) UIHelpers.pendingMessages.pop()();
				}, 300)
			}, timeout)
			return 'show showing'
		})
	},
	fillSnackbar(text, type, timeout, multiline)
	{
		"use strict";
		var $snackbar = $('#mainSnackbar')
		if ($snackbar.hasClass('show'))
		{
			if ($snackbar.hasClass('showing'))
			{
				$snackbar.one('webkitTransitionEnd transitionEnd', () =>
				{
					$snackbar.one('webkitTransitionEnd transitionEnd', () =>
					{
						UIHelpers.placeSnackbar($snackbar, text, type, timeout, multiline)
					});
				});
			} else
			{
				$snackbar.one('webkitTransitionEnd transitionEnd', () =>
				{
					UIHelpers.placeSnackbar($snackbar, text, type, timeout, multiline)
				});
			}
		} else
		{
			UIHelpers.placeSnackbar($snackbar, text, type, timeout, multiline)
		}
	},
	queueSnackbar(text, type, timeout, multiline)
	{
		"use strict";
		if (typeof timeout == "undefined")
		{
			timeout = 5000;
		}
		if ($('#mainSnackbar').length == 0)
		{
			$('body').append('<div class="snackbar" id="mainSnackbar"></div>');
		}
		UIHelpers.pendingMessages.push(() =>
		{
			UIHelpers.fillSnackbar(text, type, timeout, multiline)
		});
		if (!$('#mainSnackbar').hasClass('show'))
			UIHelpers.pendingMessages.pop()();
	},
	/**
	 * @description Shows message in message area
	 * @param {string} alert Text to display
	 * @param {string} type Type (success/info/warning/danger)
	 * @param {number} timeout Time to display the message
	 * @param {boolean} multiline Make the snackbar multiline?
	 */
	Message(alert, type, timeout, multiline)
	{
		UIHelpers.queueSnackbar('<div class="snackbar-body">' + alert + '</div>', type, timeout, multiline);
	},
	noSleep: null,
	initializeNoSleep: function ()
	{
		if (UIHelpers.noSleep == undefined)
		{
			try
			{
				UIHelpers.noSleep = new NoSleep();
				return true;
			}
			catch (e)
			{
				if (e instanceof ReferenceError)
				{
					UIHelpers.Message('Nepodařilo se načíst součást pro zabránění vypínaní displeje. Možná není úplně stažena.', "danger", 3000, true)
				}
				return false;
			}
		}
	}
}

/**
 * @class
 * @classdesc Get info about user's device and browser
 */
const Environment = {
	isMobile:
	{
		Android: function ()
		{
			return navigator.userAgent.match(/Android/i);
		},
		BlackBerry: function ()
		{
			return navigator.userAgent.match(/BlackBerry/i);
		},
		iOS: function ()
		{
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
		Opera: function ()
		{
			return navigator.userAgent.match(/Opera Mini/i);
		},
		Windows: function ()
		{
			return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
		},
		any: function ()
		{
			return navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i);
		}

	},
	InsidePwa: ((window.matchMedia('(display-mode: standalone)').matches && (document.referrer.includes('location.host') || (document.referrer == '')))
		|| document.referrer.includes('android-app://')//TWA
		|| window.navigator.standalone),//Safari
	/*html.addClass("inside-pwa");
	$("a.nav-link[href$='offline']").html("<i class='material-icons'>offline_pin</i>&ensp;Spravovat stažené");*/
	DarkMode: (window.matchMedia('(prefers-color-scheme: dark)').matches || window.matchMedia('(prefers-dark-interface)'))

}
/**
 * Enum. All the possible states of underlying serviceWorker
 * @typedef WorkerStates
 * @property dead 0
 * @property ready 1
 * @property registered 2
 * @property downloadingLocal 3
 * @property downloadedLocal 4
 * @property downloadingExternal 5
 * @property downloadedExternal 6
 * @property essential_ok 7
 */
const WorkerStates = Object.freeze({ 'dead': 0, 'ready': 1, 'registered': 2, 'downloadingLocal': 3, 'downloadedLocal': 4, 'downloadingExternal': 5, 'downloadedExternal': 6, 'essential_ok': 7 })
export
{
	NetworkUtils,
	DataUtils,
	IOUtils,
	SongProcessing,
	NoSleepHelper,
	UIHelpers,
	Environment,
	WorkerStates
}