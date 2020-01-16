const NetworkUtils = {
	getNoCache: function (uri)
	{
		return fetch(uri, {
			headers: {
				"Cache-Control": "no-store"
			}
		});
	},
	revalidateCache: function (uri)
	{
		return fetch(uri, {
			headers: {
				"Cache-Control": "must-revalidate"
			}
		});
	},
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
	 * 
	 * @param {string} uri 
	 * @param {string} [cacheName]
	 * @returns {Promise<Response>}
	 */
	CacheOrNetwork(uri, cacheName)//Faster than relying on service worker
	{
		return new Promise(function (res, rej)
		{
			if (cacheName)
				caches.open(cacheName).then((c) =>
				{
					c.match(uri).then((response) =>
					{
						if (response)
							res(response).catch(rej);
						else
							fetch(uri).then(res).catch(rej);
					});
				})
			else caches.match(uri).then((response) =>
			{
				if (response)
					res(response);
				else
					fetch(uri).then(function (response)
					{
						if (response.ok)
							res(response)
						else
							rej(response)
					});
			}).catch(rej)
		})
	}
}
const SongProcessing = {
	anchorsPattern: /\d(?:\)|\.|x|:)|bridge|coda|intro|outro|sloka|mezihra|předehra|dohra|\/:|:\/|refren|refrén|ref:|ref\.:|ref\./gmi,
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
		text = text.replace(/\[([A-Z<(\/][^\[\]]*)\]/gi, function (match, p1)
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
	}
};
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
					message('Nepodařilo se načíst součást pro zabránění vypínaní displeje. Možná není úplně stažena.', "danger", 3000, true)
				}
			}
		}
	}
}

const UIHelpers = {
	dialogResult: null,
	DialogType: Object.freeze({
		"Ok": 1,
		"OkCancel": 2,
		"YesNo": 3,
		"AbortRetryIgnore": 4,
		"NoButtons": 5,
		"NoButtonsWeak": 6
	}),
	Dialog(text, callback, type, header, footer, positiveEventListener)
	{
		"use strict";
		var id = "dialog-" + Math.floor(Math.random() * 101);
		var clone = $("#dummyDialog").clone().appendTo(".body-black,.body-white").attr("id", id);
		id = "#" + id;
		$(id + " #dummyModalLabel").html(header);
		$(id + " #dummyDialogText").html(text);
		$(id + " .modal-footer span").html(footer);
		if (typeof type == "string")
		{
			$(id + " .yes-no").addClass("d-none");
			$(id + " #cancel").addClass("d-none");
			$(id + " #ok").removeClass("d-none").html(type);
		} else if (type instanceof Array)
		{
			$(id + " .yes-no").addClass("d-none");
			$(id + " .ok-cancel").removeClass("d-none");
			$(id + " #ok").html(type[0]);
			$(id + " #cancel").html(type[1]);
		} else switch (type)
		{
			case 6:
			case 5:
				$(id + " .yes-no").addClass("d-none");
				$(id + " .ok-cancel").addClass("d-none");
				break;
			case 2:
				$(id + " .yes-no").addClass("d-none");
				$(id + " .ok-cancel").removeClass("d-none");
				break;
			case 3:
				$(id + " .yes-no").removeClass("d-none");
				$(id + " .ok-cancel").addClass("d-none");
				break;
			default:
				$(id + " .yes-no").addClass("d-none");
				$(id + " #cancel").addClass("d-none").html("Zrušit");
				$(id + " #ok").removeClass("d-none").html("OK");
				break;
		}
		let posBut = $(id + " #yes")[0];
		if (positiveEventListener)
		{
			posBut.addEventListener('click', function poCl()
			{
				positiveEventListener();
				posBut.removeEventListener('click', poCl);
			});
		}
		clone.one('hide.bs.modal', function ()
		{
			if (typeof callback == "function")
				callback(dialogResult);
		});
		clone.on('hidden.bs.modal', function ()
		{
			clone.modal('dispose');
			clone.remove();
			var dialogCount = $(".modal.show").length;
			$("body:not(.modal-open)").find(".modal-backdrop").each(function (index)
			{
				if (index >= dialogCount)
					$(this).removeClass("show").on("webkitTransitionEnd transitionEnd", function ()
					{
						this.parentNode.removeChild(this);
					});
			});
		});
		if (type == DialogType.NoButtonsWeak)
			clone.attr("data-backdrop", true);
		clone.modal("show");
		return clone;
	},
	/**
	 *  @description Shows message in message area
	 * @param {string} alert Text to display
	 * @param {string} type Type (success/info/warning/danger)
	 * @param {number} timeout Time to display the message
	 * @param {boolean} multiline Make the snackbar multiline?
	 */
	Message(alert, type, timeout, multiline)
	{
		if (jQuery.isReady)
			$(document).ready(function ()
			{
				showSnackbar('<div class="snackbar-body">' + alert + '</div>', type, timeout, multiline);
			});
		else
			showSnackbar('<div class="snackbar-body">' + alert + '</div>', type, timeout, multiline);
	},
	placeSnackbar($snackbar, text, type, timeout, multiline)
	{
		"use strict";
		$snackbar.addClass(function ()
		{
			setTimeout(function ()
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
			setTimeout(function ()
			{
				$snackbar.removeClass('show')
				setTimeout(function ()
				{
					if (pendingMessages.length > 0) pendingMessages.pop()();
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
				$snackbar.one('webkitTransitionEnd transitionEnd', function ()
				{
					$snackbar.one('webkitTransitionEnd transitionEnd', function ()
					{
						placeSnackbar($snackbar, text, type, timeout, multiline)
					});
				});
			} else
			{
				$snackbar.one('webkitTransitionEnd transitionEnd', function ()
				{
					placeSnackbar($snackbar, text, type, timeout, multiline)
				});
			}
		} else
		{
			placeSnackbar($snackbar, text, type, timeout, multiline)
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
		pendingMessages.push(function ()
		{
			fillSnackbar(text, type, timeout, multiline)
		});
		if (!$('#mainSnackbar').hasClass('show'))
			pendingMessages.pop()();
	}
}

const MyServiceWorker = {
	Ready()
	{
		return new Promise(function (resolve, reject)
		{
			if ('serviceWorker' in navigator)
			{
				return navigator.serviceWorker.getRegistration().then(function (reg) { if (reg && (reg.active !== null)) resolve(); else reject() });
			}
			else reject();
		})
	}
}

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

	}
}
export
{
	NetworkUtils,
	DataUtils,
	IOUtils,
	SongProcessing,
	NoSleepHelper,
	UIHelpers,
	MyServiceWorker,
	Environment
}