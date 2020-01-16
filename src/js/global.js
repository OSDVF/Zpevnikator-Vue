//Includes all the global hooks for external scripts which should be executed after DOM load

var pendingReady = [];
const manager = {
    Vue: null,
    resourcesReady: function (context, callback) {
        if (typeof $ !== 'undefined' && $.isReady)
            callback.call(context);
        pendingReady.push([callback, context]);
    }
}
export default manager;
window.addEventListener('DOMContentLoaded', () => {
    if (navigator.onLine) {
        setupSentry(manager.Vue);
        setupTelemetry();
    }
    setupDatatables();
    setupMultilayerDialogs();
    setupEnvironmentFixes();
    for (var r of pendingReady)
        r[0].call(r[1]);
})

function setupMultilayerDialogs() {
    $(document).on('hidden.bs.modal', '.modal', function () {
        $('.modal:visible').length && $(document.body).addClass('modal-open');
    });
    $(document).on('show.bs.modal', '.modal', function () {
        var zIndex = 1040 + (10 * $('.modal.show').length);
        $(this).css('z-index', zIndex);
        setTimeout(function () {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0); //Tweak for multiple modals
    });
}

function setupEnvironmentFixes() {
    if (/Android [4-6]/.test(navigator.appVersion)) {
        window.addEventListener("resize", function () {
            if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
                window.setTimeout(function () {
                    document.activeElement.scrollIntoViewIfNeeded();
                }, 0);
            }
        })
    }
    //Array.equals changer
    Array.prototype.equals&&console.warn("Overriding existing Array.prototype.equals."),Array.prototype.equals=function(e){if(!e)return!1;if(this.length!=e.length)return!1;for(var r=0,t=this.length;r<t;r++)if(this[r]instanceof Array&&e[r]instanceof Array){if(!this[r].equals(e[r]))return!1}else if(this[r]!=e[r])return!1;return!0},Object.defineProperty(Array.prototype,"equals",{enumerable:!1});
}

function setupSentry(Vue) {
    if (localStorage.disableSentry!= 'true'&&typeof (Sentry) != 'undefined')
	{
        Sentry.init({
            dsn: process.env.VUE_APP_SENTRY_DNS,
            release: process.env.DEV_CHANNEL+'@'+process.env.VUE_APP_VERSION,
            integrations: [new Sentry.Integrations.Vue({
                Vue,
                attachProps: true
            })],
        });
	}
}

function setupTelemetry()
{
    if (navigator.connection.type != 'cellular'&&!navigator.connection.saveData) {//If we are on stable connection
		try{//Then init our telemetry muhahaha
			var _paq = window._paq || [];
			/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
			_paq.push(['trackPageView']);
			_paq.push(['enableLinkTracking']);
			(function() {
				var u="//matomo.dorostmladez.cz/";
				_paq.push(['setTrackerUrl', u+'matomo.php']);
				_paq.push(['setSiteId', '1']);
				var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
				g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
			})();
		}
		catch(e)
		{
			console.log("Could not load matomo" + e);
		}
	}
}

function setupDatatables() {
    var _div = document.createElement('div'); //Hijack na searchování v datatables. Povoluje search bez diakritiky.
    jQuery.fn.dataTable.ext.type.search.html = function (data) {
        _div.innerHTML = data;
        return _div.textContent ?
            _div.textContent
            .replace(/[ãá]/gi, 'a')
            .replace(/[çč]/gi, 'c')
            .replace(/ď/gi, 'd')
            .replace(/[èéěê]/gi, 'e')
            .replace(/[îíìï]/gi, 'i')
            .replace(/ň/gi, 'n')
            .replace(/ľ/gi, 'l')
            .replace(/\n/gi, ' ')
            .replace(/[óôõ]/gi, 'o')
            .replace(/ř/gi, 'r')
            .replace(/š/gi, 's')
            .replace(/ť/gi, 't')
            .replace(/[úüů]/gi, 'u')
            .replace(/ý/gi, 'y')
            .replace(/ž/gi, 'z') :
            _div.innerText
            .replace(/[ãá]/gi, 'a')
            .replace(/[çč]/gi, 'c')
            .replace(/ď/gi, 'd')
            .replace(/[èéěê]/gi, 'e')
            .replace(/[îíìï]/gi, 'i')
            .replace(/ľ/gi, 'l')
            .replace(/ň/gi, 'n')
            .replace(/\n/gi, ' ')
            .replace(/[óôõ]/gi, 'o')
            .replace(/ř/gi, 'r')
            .replace(/š/gi, 's')
            .replace(/ť/gi, 't')
            .replace(/[úüů]/gi, 'u')
            .replace(/ý/gi, 'y')
            .replace(/ž/gi, 'z');
    };
    jQuery.fn.dataTable.ext.type.search.string = function (data) {
        return !data ?
            '' :
            typeof data === 'string' ?
            data.replace(/[ãá]/gi, 'a')
            .replace(/[çč]/gi, 'c')
            .replace(/ď/gi, 'd')
            .replace(/[èéěê]/gi, 'e')
            .replace(/[îíìï]/gi, 'i')
            .replace(/ľ/gi, 'l')
            .replace(/ň/gi, 'n')
            .replace(/\n/gi, ' ')
            .replace(/[óôõ]/gi, 'o')
            .replace(/ř/gi, 'r')
            .replace(/š/gi, 's')
            .replace(/ť/gi, 't')
            .replace(/[úüů]/gi, 'u')
            .replace(/ý/gi, 'y')
            .replace(/ž/gi, 'z') :
            data;
    };
    delete $.fn.dataTable.ext.type.order['string-pre'];
    delete $.fn.dataTable.ext.type.order['html-pre'];
    $.fn.dataTable.ext.type.order['html-asc'] = $.fn.dataTable.ext.type.order['string-asc'] = function orderAsc(a, b) {
        return a.localeCompare(b, 'cs')
    }
    $.fn.dataTable.ext.type.order['html-desc'] = $.fn.dataTable.ext.type.order['string-desc'] = function orderDesc(a, b) {
        return b.localeCompare(a, 'cs')
    }
}