"use strict";
/**
 * @namespace ServiceWorker
 */
importScripts("version.js");
const externalCacheName = `external-${version}`;
const extraDownloadedCacheName = `extra-${version}`;
const internalCacheName = `internal-${version}`;
const songCache = "songs";
const getSongUrl = "songs/get";
const base = location.host;
var pendingDBRequests = [];
var pendingOnLoad = [];
var reject = Promise.reject();
var actualState = false;
const WorkerStates = { 'dead': 0, 'ready': 1, 'registered': 2, 'downloadingLocal': 3, 'downloadedLocal': 4, 'downloadingExternal': 5, 'downloadedExternal': 6, 'essential_ok': 7 };
Object.freeze(WorkerStates);

var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
var chromeVersion = raw ? parseInt(raw[2], 10) : 0;
if (!('finally' in Promise.prototype))
    Promise.prototype['finally'] = function finallyPolyfill(callback)
    {
        var constructor = this.constructor;

        return this.then((value) =>
        {
            return constructor.resolve(callback()).then(() =>
            {
                return value;
            });
        }, (reason) =>
        {
            return constructor.resolve(callback()).then(() =>
            {
                throw reason;
            });
        });
    };
function fetch_retry(url, options, n)
{
    return fetch(url, options).then(function (response)
    {
        if (n === 1) throw new Error(response.status + ": " + response.statusText);
        if (!response.ok)
            return fetch_retry(url, options, n - 1);
        else
            return response;
    }).catch(function (error)
    {
        if (n === 1) throw error;
        return fetch_retry(url, options, n - 1);
    });
}
function onNextPageLoad(callback)
{
    pendingOnLoad.push(callback);
}
function notifyPageLoad()
{
    pendingOnLoad.forEach(function (action) { action() });
    pendingOnLoad = [];
}
var precachingInternal = false;
var extendedPrecaching = false;
var afterprecaching = [];
var precachedExtended = false;
var precachedEssential = false;
var forceReloadNextTime = false;
if (navigator.onLine)
    forceReloadNextTime = true;
function whenIsprecaching(callback)
{
    if (precachingInternal == true)
    {
        callback();
        return;
    }
    afterprecaching.push(callback);
}

/**
 * Stores all urls from the array into the provided cache
 * @param {string[]} urls 
 * @param {CacheStorage} cache Cache Storage to save the items into
 * @param {boolean} noCacheRequest Make all request get fresh data
 * @memberof ServiceWorker
 */
function cacheSeriallyUnlessExists(urls, cache, noCacheRequest)
{
    var lastUrlPromise = Promise.resolve();
    var numberOfFetched = 0;
    return new Promise(function (resolve, reject)
    {
        for (let i = 0; i < urls.length; i++)
        {
            let url = urls[i].url;
            cache.match(url).then(function (cacheInfo)
            {
                if (cacheInfo != undefined)
                {
                    if (url === urls[urls.length - 1].url && numberOfFetched == 0)
                        resolve(-1);
                    return cacheInfo;
                }
                else
                {
                    return lastUrlPromise = lastUrlPromise.then(() =>
                    {
                        return fetch(url, { cache: (noCacheRequest ? "no-cache" : "default") }).then(function (response)
                        {
                            if (response.ok)
                            {
                                cache.put(url, response.clone());
                            }
                            numberOfFetched++;
                            if (url === urls[urls.length - 1].url || numberOfFetched == 0)
                                resolve(numberOfFetched);
                            return response;
                        });
                    });
                }
            })
        }
    })
}

var lc = false;
var localCompleted = () => lc = true;

/**
 * Downloads the most essential files into cache with name of [essentialCache] variable
 * @param {boolean} noCache Perform no-cache requests
 * @param {boolean} [informClient=true] Post notification messages to active client
 * @returns {Promise} Promise that resolves when completed
 * @memberof ServiceWorker
 */
function precacheInternal(noCache, informClient = true)
{
    precachingInternal = true;
    if (informClient)
    {
        var message = {};
        actualState = WorkerStates.downloadingLocal;
        message.actualState = actualState;
        message.messageType = "caching_state_changed";
        message.from = "precacheEssential"
        postMessageToClient(message);
    }
    return caches.open(internalCacheName).then(function (cache)
    {
        __precacheManifest.push('/');//Also cache the main page
        return cacheSeriallyUnlessExists(__precacheManifest/*will be injected*/, cache, noCache).then(function (numberOfFetched)
        {
            if (informClient)
            {
                var message = {};
                if (numberOfFetched > 0)
                {
                    actualState = WorkerStates.downloadedLocal;
                    message.actualState = actualState;
                    message.messageType = "caching_state_changed";
                    message.from = "precacheEssential"
                    postMessageToClient(message);
                }
                else if (numberOfFetched == -1)
                {
                    actualState = WorkerStates.essential_ok;
                    message.actualState = actualState;
                    message.messageType = "caching_state_changed";
                    message.from = "precacheEssential"
                    postMessageToClient(message);
                }
            }
            afterprecaching.forEach(function (clb) { clb() });
            precachedEssential = true;
            precachingInternal = false;
        }).catch(() =>
        {
            precachedEssential = false;
            precachingInternal = false;
        });
    })
}
const cdnUrls = [
    "https://code.jquery.com/jquery-3.4.1.slim.min.js",
    "https://cdn.datatables.net/1.10.19/css/dataTables.bootstrap4.min.css",
    "https://cdn.datatables.net/1.10.19/js/dataTables.bootstrap4.min.js",
    "https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js",
    "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.2.0/js.cookie.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.2/css/bootstrap-select.min.css",
    "https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js",
    "https://fonts.googleapis.com/icon?family=Material+Icons"

];
function precacheExternal(informClient = true)
{
    extendedPrecaching = true;
    return caches.open(externalCacheName).then(function (cache)
    {
        if (informClient)
        {
            var message = {};
            actualState = WorkerStates.downloadingExternal;
            message.actualState = actualState;
            message.messageType = "caching_state_changed";
            message.from = "precacheExternal"
            postMessageToClient(message);
        }

        //Cache all CDN urls at once, improving total install time of event handler
        var cdnUrlsPromise = cache.addAll(cdnUrls);

        //Wait for all cache operations and then return
        return cdnUrlsPromise.then(() =>
        {
            console.log("All CDN urls succesfully cached!")
            if (informClient)
            {
                var message = {};
                actualState = WorkerStates.downloadedExternal;
                message.actualState = actualState;
                message.messageType = "caching_state_changed";
                message.from = "precacheExternal"
                postMessageToClient(message);
            }
            precachedExtended = true;
            extendedPrecaching = false;
            self.skipWaiting();

            return Promise.resolve();
        }).catch(() =>
        {
            precachedExtended = false;
            extendedPrecaching = false;
            return Promise.reject();
        });
    })
}

self.addEventListener('install', e =>
{
    const cacheWhitelist = [externalCacheName, extraDownloadedCacheName, internalCacheName, songCache];
    var downloadNew = false;
    e.waitUntil(caches.keys().then(function (keyList)
    {
        return Promise.all(keyList.map(function (key)
        {
            if (cacheWhitelist.indexOf(key) === -1)
            {
                if (!downloadNew && navigator.onLine)
                {
                    postMessageToClient({ alert: "Dostupná nová verze. Probíhá její stáhnutí" })
                    downloadNew = true;
                }
                return caches.delete(key);
            }
        })).then(function ()
        {
            if (downloadNew)
            {
                precachedEssential = precachedExtended = precachingInternal = extendedPrecaching = false;
                precacheInternal(true, false).then(() => precacheExternal(false).then((() =>
                {
                    postMessageToClient({ messageType: "html-snackbar", html: "<div class=\"snackbar-body\">Nová verze stáhnuta&ensp;</div><button class=\"btn btn-outline-secondary btn-fluid p-2\" type=\"button\" onclick=\"location.reload('true');\">Instalovat</button>", multiline: true, timeout: 10000 })
                })))
            }
        }).then(() =>
        {
            if (!precachingInternal && !precachedEssential)
                precacheInternal().then(() =>
                {
                    self.skipWaiting();
                    self.clients.claim()
                });//Pro jistotu
        })
    }));
});

function firstPromiseResolve(array)
{
    return new Promise(function (resolve, reject)
    {
        var errors = new Array(array.length);
        var errorCntr = 0;
        array.forEach(function (p, index)
        {
            // when a promise resolves
            Promise.resolve(p).then(function (val)
            {
                // only first one to call resolve will actually do anything
                resolve(val);
            }, function (err)
            {
                errors[index] = err;
                ++errorCntr;
                // if all promises have rejected, then reject
                if (errorCntr === array.length)
                {
                    reject(errors);
                }
            });
        });
    });
}
/**
 * Gets called for every request
 * @param {FetchEvent} event 
 * @memberof ServiceWorker
 */
function fetch_it(event)
{
    let request = event.request;
    let uri = request.url;
    var navigating = request.mode == "navigate";
    let forceReload = false;

    if (navigating)
    {
        uri = uri.replace(location.origin, "");
        if (forceReloadNextTime)
        {
            onNextPageLoad(() => { postMessageToClient({ messageType: "forceReloaded" }); forceReloadNextTime = false });
            forceReload = true;
        }
        else
        {
            onNextPageLoad(() => postMessageToClient({ messageType: "forceReloadTry" }));
        }
    }
    function getTargetPromise()
    {
        var fetchPromise = () =>
        {
            return fetch(request).then(
                function (fetchResponse)
                {
                    // Check if we received a valid response
                    if (!fetchResponse || fetchResponse.status !== 200 || request.method === 'POST' ||
                        request.headers.get('Cache-Control') == 'no-store' || uri.includes("cache=false"))
                    {
                        return Promise.resolve(fetchResponse);
                    }
                    if (uri.includes(getSongUrl))
                        return caches.open(songCache).then(function (cache)
                        {
                            var responseToCache = fetchResponse.clone();
                            cache.put(uri, responseToCache);
                            return Promise.resolve(fetchResponse);
                        });
                    else return caches.keys().then(function (keyList)
                    {
                        if (keyList.length == 0)
                        {
                            caches.open(extraDownloadedCacheName);//Taky musíme ještě vytvořit cache pro nové věci
                        }
                        return caches.keys().then(function (keys2)
                        {
                            return firstPromiseResolve(keyList.map(function (key2)
                            {
                                return caches.open(key2).then(function (checkingCache)
                                {
                                    return checkingCache.match(uri, { ignoreSearch: navigating }).then(function (cacheInfo1)
                                    {
                                        if (cacheInfo1 != undefined)
                                            return Promise.resolve({ inf: cacheInfo1, cacheName: key2 });
                                        else return reject;
                                    });
                                });
                            })).then(function (result)
                            {//Was found in different cache
                                return caches.open(result.cacheName).then(function (cache)
                                {
                                    var responseToCache = fetchResponse.clone();
                                    cache.put(result.inf.url, responseToCache);
                                    return Promise.resolve(fetchResponse);
                                });
                            }).catch(() =>
                            {
                                return caches.open(extraDownloadedCacheName).then(function (cache)
                                {
                                    var responseToCache = fetchResponse.clone();
                                    cache.put(uri, responseToCache);
                                    return Promise.resolve(fetchResponse);
                                });
                            }).catch(function (errorArray)
                            {
                                errorArray.forEach(function (err) { console.error(err) })
                            });
                        });
                    })
                });
        };
        var cachePromise;
        if (uri.includes(getSongUrl))
        {
            cachePromise = caches.open(songCache).then(function (cache)
            {
                return cache.match(uri).then(function (response)
                {
                    if (!response)
                    {
                        if (uri.includes(base))
                        {
                            console.info("%cCache not found " + uri, "color: red");
                        }
                        return reject;
                    }
                    return response;
                })
            });
        }
        else
            cachePromise = caches.match(uri, { ignoreSearch: navigating })
                .then(function (response)
                {
                    if (!response)
                    {
                        if (uri.includes(base))
                        {
                            console.info("%cCache not found " + uri, "color: red");
                        }
                        return reject;
                    }
                    return Promise.resolve(response);
                });

        function fallbackPromise()
        {
            caches.open(internalCacheName).then(function (cache)
            {
                if (uri.endsWith('.webp') || uri.endsWith('.png') || uri.endsWith('.jpg'))
                    return cache.match(new Request(location.origin + "/images/not_available.png"));
                else return reject;
            });
        }
        if (request.method === 'POST')
        {
            return fetchPromise().catch(() => fallbackPromise());
        }
        else if (forceReload)
        {
            forceReloadNextTime = false;
            return fetchPromise().catch(() =>
            {
                pendingOnLoad = [];
                onNextPageLoad(() => postMessageToClient({ alert: "Nepodařilo se stáhnout stránku", type: "danger" }));
                return cachePromise.catch(() => fallbackPromise())
            })
        }
        else if (request.headers.get("Cache-Control") == "must-revalidate" | request.headers.get("Cache-Control") == "no-cache")//If there was a page reload or user forced reload from network
            return fetchPromise().catch(() =>
                cachePromise.catch(() =>//Not found anywhere
                    fallbackPromise()
                )
            )
        else
        {
            return cachePromise.catch(() => fetchPromise().catch(() =>
            {
                if (!navigating)
                {
                    navigating = true;//Try it even if there are no that one with saved query string
                    return cachePromise.catch(() => fallbackPromise());
                }
                else
                    return fallbackPromise();
            })
            )
        }
    }
    event.respondWith(getTargetPromise());
}

self.addEventListener('message', function (event)
{
    console.debug("SW got message: ", event.data);
    if (event.data.tag === 'notifyPageLoad')
    {
        setTimeout(notifyPageLoad, 500);
    }
    else if (event.data.tag === 'reload')
    {
        forceReloadNextTime = true;
        postMessageToClient({ messageType: "reloadPermitted" });
    }
    else if (event.data.tag === 'essential-download')
    {
        if (!precachingInternal && !precachedEssential)
            precacheInternal();//Pro jistotu
        else if (precachedEssential)
        {
            actualState = WorkerStates.downloadedLocal;
            postMessageToClient({ actualState: actualState, messageType: "caching_state_changed", from: "messageListener" });
        }

    }
    else if (event.data.tag === 'extended-download')
    {
        if (!extendedPrecaching && !precachedExtended)
            precacheExternal();
        else if (precachedExtended)
        {
            actualState = WorkerStates.downloadedExternal;
            postMessageToClient({ actualState: actualState, messageType: "caching_state_changed", from: "messageListener" });
        }
    }
    else if (event.data.tag === 'clean')
    {
        precachedEssential = precachedExtended = precachingInternal = extendedPrecaching = false;
        precacheInternal(true).then(() =>
            precacheExternal(true).then(() =>
                postMessageToClient({ messageType: "reloadPermitted" })
            )
        )
    }
    else if (event.data.tag === 'skipWaiting')
    {
        self.skipWaiting();
    }
    else if (event.data.tag === 'queryState')
    {
        if (actualState)
        {
            postMessageToClient({ actualState: actualState, messageType: "currentState" });
        }
        else
        {
            checkEssential().then(() =>
            {
                actualState = WorkerStates.downloadedLocal;
                return checkExtended().then(() =>
                {
                    actualState = WorkerStates.downloadingExternal;
                })
            }).finally(() =>
            {
                postMessageToClient({ actualState: actualState, messageType: "currentState" });
            })
        }
    }
});
function postMessageToClient(data, targetClientId)
{
    if (typeof data.messageType == "undefined")
        data.messageType = "snackbar";
    if (typeof targetClientId != "undefined")
    {
        self.clients.get(targetClientId).then((client) =>
        {
            client.postMessage(data);
        });
    }
    else
    {
        clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function (clientList)
        {
            for (var i = 0; i < clientList.length; i++)
            {
                clientList[i].postMessage(data);
            }
        });
    }
}
self.addEventListener('push', function (event)
{
    console.log('Received a push message', event);
    var info = event.data.json();
    info.url += "?cache=false";
    if (info.type == 'conversion_completed')
    {
        event.waitUntil(
            self.registration.showNotification("Převod dokončen", {
                body: "Vás soubor je připravený ke stáhnutí",
                icon: '/images/icon-192.png',
                tag: 'conversion_completed',
                image: null,
                badge: 'images/info.svg',
                //vibrate: [0],
                silent: true,
                data: info.url
            })
        );
    }
    //https://developers.google.com/web/fundamentals/push-notifications/images/notification-ui.png

});
self.addEventListener('notificationclick', function (event)
{
    var data = event.notification.data;
    event.notification.close();
    if (event.notification.tag == 'conversion_completed')
    {
        postMessageToClient({ messageType: "conversion_completed", url: data });
    }
    /*if (event.action === 'like') {
    silentlyLikeItem();
  }
  else if (event.action === 'reply') {
    clients.openWindow("/messages?reply=" + messageId);
  }
  else {
    clients.openWindow("/messages?reply=" + messageId);
  }*/
}, false);
if (precachingInternal)
    afterprecaching.push(fetch_it);
else
    self.addEventListener("fetch", fetch_it);

function checkEssential()
{
    return caches.open(internalCacheName).then(function (cache)
    {
        return cache.keys().then(function (keys)
        {
            if (keys.length >= __precacheManifest.length)
                return Promise.resolve(true);
            return Promise.reject(false);
        });
    })
}
function checkExtended()
{
    return caches.open(externalCacheName).then(function (cache)
    {
        return cache.keys().then(function (keys)
        {
            if (keys.length >= cdnUrls.length)
                return Promise.resolve(true);
            return Promise.reject(false);
        });
    })
}
self.addEventListener('activate', function ()
{
    actualState = WorkerStates.ready;
    postMessageToClient({ actualState: actualState, messageType: "caching_state_changed", from: "activateListener" });
    function checkState(noDownload, downApp)
    {
        checkEssential().then(function ()
        {
            actualState = WorkerStates.downloadedLocal;
            postMessageToClient({ actualState: actualState, messageType: "caching_state_changed", from: "activateListener" });
            checkExtended().then(function ()
            {
                actualState = WorkerStates.downloadedExternal;
                postMessageToClient({ actualState: actualState, messageType: "caching_state_changed", from: "activateListener" });
            })
        }).catch(function (err)
        {
            console.log("[SW] ", err);
            if (noDownload)
                return;
            if (!precachingInternal && !precachedEssential)
                precacheInternal(true);
        })

    }
    checkState();
})
