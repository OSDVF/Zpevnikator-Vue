//Includes all the global hooks for external scripts which should be executed after DOM load

import { UIHelpers, WorkerStates, Environment } from './Helpers'
import Tasks from './Tasks'
var pendingReady = [];
const manager = {
    /**
     * @type Vue
     */
    _vue: null,
    set Vue(to)
    {
        this._vue = to;
        UIHelpers.store = to.$store;
    },
    get Vue()
    {
        return this._vue;
    },
    resourcesReady: function (context, callback)
    {
        if (typeof $ !== 'undefined' && $.isReady)
            callback.call(context);
        pendingReady.push([callback, context]);
    },
    setupSWMessageBus: setupSWMessageBus,
    workerReadyWaiting: [],
    registerSync: registerSync,
    navigate(url)
    {
        this._vue.$router.push(url);
    },
    appDownload()
    {
        if (Environment.InsidePwa)
        {
            UIHelpers.Message("Aplikace je již nainstalována");
        }

        if (('serviceWorker') in navigator)
        {
            function doTheInstallation()
            {
                if (deferredPrompt)
                {
                    $("#offlineEnable").html("Instalace...");
                    deferredPrompt.prompt();
                    // Wait for the user to respond to the prompt
                    deferredPrompt.userChoice.then(function (choiceResult)
                    {
                        if (choiceResult.outcome === 'accepted')
                        {
                            $("#offlineEnable").html("Aplikace nainstalována");
                        } else
                        {
                            $("#offlineEnable").html("Stáhnout aplikaci");
                        }
                        disableProgressIndicator("#installation");
                    });
                }
                else
                {
                    disableProgressIndicator("#installation");
                    $("#manualInstallPrompt").modal("show");
                }
            }
            if (navigator.onLine)
                doTheInstallation();
            else
            {
                UIHelpers.Dialog("Vypadá to že jste offline. Chcete se přesto pokusit aplikaci instalovat?", function (res)
                {
                    if (res == 'yes')
                        doTheInstallation();
                }, UIHelpers.DialogType.YesNo, "Pokračovat?")
            }
        }
        else
        {
            UIHelpers.Message("Váš prohlížeč nepodporuje offline režim", "danger");
        }
    }
}
export default manager;
window.addEventListener('DOMContentLoaded', () =>
{
    if (navigator.onLine)
    {
        setupSentry(manager.Vue);
        setupTelemetry();
    }
    setupDatatables();
    setupMultilayerDialogs();
    setupEnvironmentFixes();
    for (var r of pendingReady)
        r[0].call(r[1]);
})
window.addEventListener('beforeinstallprompt', function (e)
{
    console.debug("beforeInstallPrompt Fired");
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    manager.deferredPrompt = e;
});
function setupMultilayerDialogs()
{
    $(document).on('hidden.bs.modal', '.modal', function ()
    {
        $('.modal:visible').length && $(document.body).addClass('modal-open');
    });
    $(document).on('show.bs.modal', '.modal', function ()
    {
        var zIndex = 1040 + (10 * $('.modal.show').length);
        $(this).css('z-index', zIndex);
        setTimeout(function ()
        {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0); //Tweak for multiple modals
    });
}

function setupEnvironmentFixes()
{
    if (/Android [4-6]/.test(navigator.appVersion))
    {
        window.addEventListener("resize", function ()
        {
            if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA")
            {
                window.setTimeout(function ()
                {
                    document.activeElement.scrollIntoViewIfNeeded();
                }, 0);
            }
        })
    }
    //Array.equals changer
    Array.prototype.equals && console.warn("Overriding existing Array.prototype.equals."), Array.prototype.equals = function (e) { if (!e) return !1; if (this.length != e.length) return !1; for (var r = 0, t = this.length; r < t; r++)if (this[r] instanceof Array && e[r] instanceof Array) { if (!this[r].equals(e[r])) return !1 } else if (this[r] != e[r]) return !1; return !0 }, Object.defineProperty(Array.prototype, "equals", { enumerable: !1 });
}

function setupSentry(Vue)
{
    if (localStorage.disableSentry != 'true' && typeof (Sentry) != 'undefined')
    {
        Sentry.init({
            dsn: process.env.VUE_APP_SENTRY_DNS,
            release: process.env.DEV_CHANNEL + '@' + process.env.VUE_APP_VERSION,
            integrations: [new Sentry.Integrations.Vue({
                Vue,
                attachProps: true
            })],
        });
    }
}

function setupTelemetry()
{
    if (navigator.connection.type != 'cellular' && !navigator.connection.saveData)
    {//If we are on stable connection
        try
        {//Then init our telemetry muhahaha
            var _paq = window._paq || [];
            /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function ()
            {
                var u = "//matomo.dorostmladez.cz/";
                _paq.push(['setTrackerUrl', u + 'matomo.php']);
                _paq.push(['setSiteId', '1']);
                var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
                g.type = 'text/javascript'; g.async = true; g.defer = true; g.src = u + 'matomo.js'; s.parentNode.insertBefore(g, s);
            })();
        }
        catch (e)
        {
            console.log("Could not load matomo" + e);
        }
    }
}

function setupDatatables()
{
    var _div = document.createElement('div'); //Hijack na searchování v datatables. Povoluje search bez diakritiky.
    jQuery.fn.dataTable.ext.type.search.html = function (data)
    {
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
    jQuery.fn.dataTable.ext.type.search.string = function (data)
    {
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
    $.fn.dataTable.ext.type.order['html-asc'] = $.fn.dataTable.ext.type.order['string-asc'] = function orderAsc(a, b)
    {
        return a.localeCompare(b, 'cs')
    }
    $.fn.dataTable.ext.type.order['html-desc'] = $.fn.dataTable.ext.type.order['string-desc'] = function orderDesc(a, b)
    {
        return b.localeCompare(a, 'cs')
    }
}
function afterWorkerRegistration(clb)
{
    if (manager.$store.state.workerState > 0)
        return clb();
    manager.workerReadyWaiting.push(cls);
}
function registerSync(tag)
{
    return (function registerIt()
    {
        return navigator.serviceWorker.getRegistration().then(function (reg)
        {
            var fallback = function ()
            {
                console.warn("Attempted to register sync\"" + tag + "\" but service worker wasn't registered. Deferring action until registration.");
                afterWorkerRegistration(function () { registerIt(tag) });
                return false;
            }
            if (!reg)
                return fallback();
            reg = reg.active || reg.installing || reg.waiting;
            if (!reg)
                return fallback();
            reg.postMessage({ tag: tag });
            return Promise.resolve(reg);
        })
    })();
}
function setupSWMessageBus()
{
    navigator.serviceWorker.addEventListener('message', function (event)
    {
        console.debug("Received message from SW: ", event.data);
        switch (event.data.messageType)
        {
            case "snackbar":
                UIHelpers.Message(event.data.alert, event.data.type, event.data.timeout, event.data.multiline);
                break;
            case "html-snackbar":
                UIHelpers.queueSnackbar(event.data.html, event.data.type, event.data.timeout, event.data.multiline);
                break;
            case "song-downloading":
                break;
            case "songs-ready":
                UIHelpers.Message(event.data.alert, event.data.type, event.data.timeout);
                break;
            case "forceReloadTry":
                if (navigator.onLine && !reloaded && Settings.ShowReloadPrompt)
                    UIHelpers.queueSnackbar("<div class=\"snackbar-body\">Stránka načtena offline. Chcete ji načíst online?</div><button class=\"btn btn-outline-secondary p-2 ml-lg-2\" type=\"button\" onclick=\"registerSync('reload');\">Ano</button>", null, 6000, true);
                break;
            case "forceReloaded":
                reloaded = true;
                UIHelpers.Message("Online&ensp;<i class='material-icons'>check</i>");
                break;
            case "reloadPermitted":
                location.reload(true);//Bypass cache
                break;
            case "conversion_completed":
                var parts = event.data.url.split('/');
                UIHelpers.Message("Stahování souboru " + parts[parts.length - 1]);
                window.open(event.data.url);
                break;
            case "caching_state_changed":
                manager.Vue.$store.commit('workerState', event.data.actualState);
                switch (event.data.actualState)
                {
                    case WorkerStates.downloadingLocal:
                        UIHelpers.Message('Stahování základních souborů', null, 2000);
                        manager.dowTsk = Tasks.AddActive("Stahování základních souborů", null, "get_app");
                        break;
                    case WorkerStates.downloadedLocal:
                        UIHelpers.Message('Základní soubory staženy', "success", 2000);
                        registerSync("extended-download");
                        if (manager.dowTsk)
                            manager.dowTsk.completed();
                        break;
                    case WorkerStates.downloadingExternal:
                        UIHelpers.Message("Stahování rozšířených souborů...", null, 2000);
                        if (manager.dowTsk)
                            manager.dowTsk.completed();
                        manager.dowTsk = Tasks.AddActive("Stahování rozšířených souborů", null, "get_app");
                        break;
                    case WorkerStates.downloadedExternal:
                        UIHelpers.Message("Rozšířené soubory staženy", "success", 2000);
                        if (manager.deferredPrompt && navigator.onLine)//Pro jistotu, nikdy nevíme jestli 
                        {
                            UIHelpers.Dialog("Zpěvníkátor je možné instalovat jako klasickou aplikaci na vaše zařízení. Budete tam ke všem písním mít snadný offline přístup.<br>Nyní je aplikace zpěvníku připravena k instalaci. Chcete ji instalovat?", null, UIHelpers.DialogType.YesNo, "Aplikace připravena", null, manager.appDownload);
                        }
                        if (manager.dowTsk)
                            manager.dowTsk.completed();
                        break;
                    case WorkerStates.essential_ok:
                        if (manager.dowTsk)
                            manager.dowTsk.completed();
                        console.log("Probably updated service worker and EssentialCache is OK");
                        break;
                }
                break;
        }
    });
}
