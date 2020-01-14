"use strict";
importScripts("version.js");
const cacheName = `extended-${version}`;
const extraDownloadedCacheName = `extra-${version}`;
const essentialCache = `essentials-${version}`;
const songCache = "songs";
const base = location.host;
let insideConsoleGroup = false;
var db;
var pendingDBRequests = [];
var pendingOnLoad = [];
var reject = Promise.reject();

var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
var chromeVersion = raw ? parseInt(raw[2], 10) : 0;
if(!('finally' in Promise.prototype))
    Promise.prototype['finally'] = function finallyPolyfill(callback) {
        var constructor = this.constructor;

        return this.then((value)=> {
            return constructor.resolve(callback()).then(()=> {
                return value;
            });
        }, (reason) => {
            return constructor.resolve(callback()).then(() => {
                throw reason;
            });
        });
    };
function fetch_retry(url, options, n) {
    return fetch(url, options).then(function(response){
        if (n === 1) throw new Error(response.status + ": "+ response.statusText);
        if(!response.ok)
            return fetch_retry(url, options, n - 1);
        else
            return response;
    }).catch(function(error) {
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
    pendingOnLoad.forEach(function(action){action()});
    pendingOnLoad = [];
}
var precaching = false;
var extendedPrecaching = false;
var afterprecaching = [];
var precachedExtended = false;
var precachedEssential = false;
var forceReloadNextTime = false;
if(navigator.onLine)
    forceReloadNextTime = true;
function whenIsprecaching(callback)
{
    if(precaching == true)
    {
        callback();
        return;
    }
    afterprecaching.push(callback);
}

function cacheSeriallyUnlessExists(urls,cache,noCache)
{
    var lastUrlPromise = Promise.resolve();
    var numberOfFetched = 0;
    return new Promise(function(resolve,reject){
        for(let i = 0;i< urls.length;i++)
        {
            let url = urls[i];
            cache.match(url).then(function(cacheInfo){
                if(cacheInfo != undefined)
                {
                    if(url === urls[urls.length-1]&&numberOfFetched==0)
                        resolve(-1);
                    return cacheInfo;
                }
                else
                {
                    return lastUrlPromise = lastUrlPromise.then(() =>{
                        return fetch(url,{cache: (noCache ? "no-cache": "default")}).then(function(response){
                            if (response.ok) {
                                cache.put(url,response.clone());
                            }
                            numberOfFetched++;
                            if(url === urls[urls.length-1]||numberOfFetched==0)
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
 * @returns {Promise} Promise that resolves when completed
 */
function precacheEssential(noCache)
{
    var message = {};
    message.actualState = "downloading_essential";
    message.messageType= "caching_state_changed";
    postMessageToClient(message);
    precaching = true;
    const essentialUrls = [
        "/version.js",
        "/",
        "/offline",
        "/not_available",
        "/not_available.php",
        "/images/not_available.png",
        "/api/settings.js",
        "/css/loader.css",
        "/css/style.css",
        "/js/pwa-things.js",
        "/js/songProcessing.js",
        "/js/support.js",
        "/js/material.min.js",
        "/css/material.css",
        "/json/manifest.json",
    ];
    const cdnUrls = [
        "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.2.0/js.cookie.min.js",
        "https://code.jquery.com/jquery-3.3.1.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.2/css/bootstrap-select.min.css",
        "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.2/js/bootstrap-select.min.js"
    ];
    return caches.open(essentialCache).then(function(cache){
        var cdnAddition = cache.addAll(cdnUrls);
        return cacheSeriallyUnlessExists(essentialUrls,cache,noCache).then(function(numberOfFetched){
            cdnAddition.then(() =>
            {
                var message = {};
                if(numberOfFetched>0)
                {
                    message.actualState = "downloaded_essential";
                    message.messageType= "caching_state_changed";
                    postMessageToClient(message);
                }
                else if(numberOfFetched == -1)
                {
                    message.actualState = "essential_ok";
                    message.messageType= "caching_state_changed";
                    postMessageToClient(message);
                }
                afterprecaching.forEach(function(clb){clb()});
                precachedEssential = true;
                precaching = false;
            }).catch(()=>{
                precachedEssential = false;
                precaching = false;
            });
        }).catch(()=>{
            precachedEssential = false;
            precaching = false;
        });
    })
}
function precache(noCache)
{
    extendedPrecaching = true;
    return caches.open(cacheName).then(function(cache)
                                       {
        const localUrls = [
            "/seznam",
            "/song",
            "/profile",
            "/editorTest",
            "/editor",
            "/images/grip.png",
            "/images/to_screen.webp",
            "/images/cannot_connect.webp",
            "/images/to_desktop.webp",
            "/images/delet_pc.webp",
            "/images/Gradient.png",
            "/js/profile-things.js",
            "/js/bootstrap-input-spinner.js",
            "/js/NoSleep.js",
            "/js/chordEditor.js",
            "/js/swup.min.js",
            "/js/third-party/PSON.js",
            "/js/third-party/resizable.js",
            "/json/Czeski.json",
            "/css/fonts/MaterialIcons-Regular.woff",
            "/images/icon-32.png",
            "/images/icon-48.png",
            "/images/icon-192.png",
            "/images/AddChord.svg",
            "/images/icon-512.png"
        ];
        const cdnUrls = [
            "https://cdn.datatables.net/1.10.19/css/dataTables.bootstrap4.min.css",
            "https://cdn.datatables.net/1.10.19/js/dataTables.bootstrap4.min.js",
            "https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"
        ];

        var message = {};
        message.actualState = "downloading_extended";
        message.messageType= "caching_state_changed";
        postMessageToClient(message);
        var localUrlPromise = cacheSeriallyUnlessExists(localUrls,cache,noCache).then(() =>{
            consoleGroup();
            console.log("All local urls succesfully cached!");
        });

        //Cache all CDN urls at once, improving total install time of event handler
        var cdnUrlsPromise = cache.addAll(cdnUrls);
        cdnUrlsPromise.then(()=>{console.log("All CDN urls succesfully cached!")});

        //Because of injected Rocket Loader Javascript and its CDN not supporting CORS, its required to fake-cache nothing
        var nothinBlob = new Blob();
        var init = { "status" : 200 , "statusText" : "OK" };
        var rocketLoaderBlankResponse = new Response(nothinBlob,init);
        var rocketLoaderPromise = cache.put("https://ajax.cloudflare.com/cdn-cgi/scripts/2448a7bd/cloudflare-static/rocket-loader.min.js",rocketLoaderBlankResponse);

        rocketLoaderPromise.then(()=>{
            consoleGroup();
            console.log("Rocket loader succesfully \"cached\"")});

        //Wait for all cache operations and then return
        return Promise.all([localUrlPromise,cdnUrlsPromise,rocketLoaderPromise]).then(() =>{
            var message = {};
            message.actualState = "downloaded_extended";
            message.messageType= "caching_state_changed";
            precachedExtended = true;
            extendedPrecaching = false;
            postMessageToClient(message);
            self.skipWaiting();
            endGroup();
            return Promise.resolve();
        }).catch(()=>{
            precachedExtended = false;
            extendedPrecaching = false;
        });
    })
}

self.addEventListener('install', e => {
    const cacheWhitelist = [cacheName,extraDownloadedCacheName,essentialCache,songCache];
    var downloadNew = false;
    e.waitUntil(caches.keys().then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
            if (cacheWhitelist.indexOf(key) === -1) {
                if(!downloadNew&&navigator.onLine)
                {
                    postMessageToClient({alert:"Dostupná nová verze. Probíhá její stáhnutí"})
                    downloadNew = true;
                }
                return caches.delete(key);
            }
        })).then(function(){
            if(downloadNew)
            {
                precachedEssential = precachedExtended = precaching = extendedPrecaching = false;
                precacheEssential(true).then(() => precache(true).then(() => {
                    postMessageToClient({messageType:"html-snackbar",html:"<div class=\"snackbar-body\">Nová verze stáhnuta&ensp;</div><button class=\"btn btn-outline-secondary btn-fluid p-2\" type=\"button\" onclick=\"location.reload('true');\">Instalovat</button>",multiline:true,timeout:10000})
                    self.skipWaiting();
                }))
            }
            self.clients.claim()
        }).then(()=>{
            if(!precaching&&!precachedEssential)
                precacheEssential();//Pro jistotu
        })
    }));
});

function firstPromiseResolve(array) {
    return new Promise(function(resolve, reject) {
        var errors = new Array(array.length);
        var errorCntr = 0;
        array.forEach(function (p, index) {
            // when a promise resolves
            Promise.resolve(p).then(function(val) {
                // only first one to call resolve will actually do anything
                resolve(val);
            }, function(err) {
                errors[index] = err;
                ++errorCntr;
                // if all promises have rejected, then reject
                if (errorCntr === array.length) {
                    reject(errors);
                }
            });
        });
    });
}
const alwaysIgnoreQuery = [
    "/song",
    "/converted",
    "/editorTest",
    "/editor"
]
function fetch_it(event){
    let request = event.request;
    let uri = request.url;
    var navigating = request.mode == "navigate";
    let forceReload = false;
    let ignoreSrch = false;

    for(var fragment of alwaysIgnoreQuery)
    {
        if (uri.includes(fragment)) {
            ignoreSrch = true;
            break;
        }
    }
    if (chromeVersion<49&&uri.includes("/song?")) {
        uri = uri.substring(0, uri.indexOf("?"));
        request = new Request(uri,{headers:request.headers,cache:request.cache,credentials: request.credentials, integrity:request.integrity,method:request.method,mode: request.mode,redirect:request.redirect,referrer:request.referrer,referrerPolicy:request.referrerPolicy});
    }

    /*if(uri.indexOf("%b%") > 0)
        {
            uri = uri.replace("%b%",base);
            request = new Request(uri,{headers:request.headers,cache:request.cache,credentials: request.credentials, integrity:request.integrity,method:request.method,mode: request.mode,redirect:request.redirect,referrer:request.referrer,referrerPolicy:request.referrerPolicy});
        }*/
    if(uri == "https://ajax.cloudflare.com/cdn-cgi/scripts/2448a7bd/cloudflare-static/rocket-loader.min.js")
    {
        var nothinBlob = new Blob();
        var init = { "status" : 200 , "statusText" : "OK" };
        event.respondWith(new Response(nothinBlob,init));
        return;
    }
    if(navigating)
    {
        if(forceReloadNextTime)
        {
            onNextPageLoad(() =>{postMessageToClient({messageType:"forceReloaded"});forceReloadNextTime=false});
            forceReload = true;
        }
        else
        {
            onNextPageLoad(() =>postMessageToClient({messageType:"forceReloadTry"}));
        }
    }
    function getTargetPromise(){
        var fetchPromise = () =>{
            return fetch(request).then(
                function(fetchResponse) {
                    // Check if we received a valid response
                    if(fetchResponse.status == 404&&request.headers.get('X-Requested-With')=="swup")
                    {
                        return fetchResponse.text().then(function(text){
                            return new Response(new Blob([text],{type:"text/html;charset=UTF-8"}));
                        })
                    }
                    if(!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type!== 'basic'||request.method==='POST'||
                       request.headers.get('Cache-Control')=='no-store'||uri.includes("cache=false")) {
                         return Promise.resolve(fetchResponse);
                    }
                    if(uri.includes("getsong.php?"))
                        return caches.open(songCache).then(function(cache) {
                            var responseToCache = fetchResponse.clone();
                            cache.put(uri, responseToCache);
                            return Promise.resolve(fetchResponse);
                        });
                    else return caches.keys().then(function(keyList) {
                        if(keyList.length == 0){
                            caches.open(extraDownloadedCacheName);//Taky musíme ještě vytvořit cache pro nové věci
                        }
                        return caches.keys().then(function(keys2){
                            return firstPromiseResolve(keyList.map(function(key2) {
                                return caches.open(key2).then(function(checkingCache){
                                    return checkingCache.match(uri,{ignoreSearch:ignoreSrch}).then(function(cacheInfo1){
                                        if(cacheInfo1 != undefined)
                                            return Promise.resolve({inf:cacheInfo1,cacheName:key2});
                                        else return reject;
                                    });
                                });
                            })).then(function(result){//Was found in different cache
                                return caches.open(result.cacheName).then(function(cache){
                                    var responseToCache = fetchResponse.clone();
                                    if(ignoreSrch)
                                        cache.put(new URL(uri).pathname,responseToCache);
                                    else
                                        cache.put(result.inf.url, responseToCache);
                                    return Promise.resolve(fetchResponse);
                                });
                            }).catch(() =>{
                                return caches.open(extraDownloadedCacheName).then(function(cache){
                                    var responseToCache = fetchResponse.clone();
                                    cache.put(uri, responseToCache);
                                    return Promise.resolve(fetchResponse);
                                });
                            }).catch(function(errorArray){
                                consoleGroup();
                                errorArray.forEach(function(err){console.error(err)})
                            });
                        });
                    })
                });
        };
        var cachePromise;
        if(uri.includes("getsong.php?"))
        {
            cachePromise = caches.open(songCache).then(function(cache) {
                return cache.match(uri).then(function(response) {
                    if(!response)
                    {
                        if(uri.includes(base))
                        {
                            consoleGroup();
                            console.info("%cCache not found "+uri,"color: red");
                        }
                        return reject;
                    }
                    return Promise.resolve(response);
                })
            });
        }
        else
            cachePromise = caches.match(uri,{ignoreSearch:ignoreSrch})
                .then(function(response) {
                if(!response)
                {
                    if(uri.includes(base))
                    {
                        consoleGroup();
                        console.info("%cCache not found "+uri,"color: red");
                    }
                    return reject;
                }
                return Promise.resolve(response);
            });

        var fallbackPromise = caches.open(essentialCache).then(function(cache) {
            if(event.request.headers.get('X-Requested-With')=='SongFetch')//When retrieving as a song(probably)
                return cache.match(new Request(location.origin+"/not_available.php"));
            else if(uri.endsWith('.webp')||uri.endsWith('.png')||uri.endsWith('.jpg'))
                return cache.match(new Request(location.origin+"/images/not_available.png"));
            else if(!uri.endsWith('.js')&&!uri.endsWith('.css')&&uri.includes(base)&&!uri.includes('/api/'))
                return cache.match(new Request(location.origin+"/not_available"));//When retrieving as a normal page
            else return reject;
        });
        let reloaded = false;
        if(request.method==='POST')
        {
            return fetchPromise().catch(() => fallbackPromise);
        }
        else if(forceReload)
        {
            forceReloadNextTime = false;
            return fetchPromise().catch(() => {
                pendingOnLoad = [];
                onNextPageLoad(() =>postMessageToClient({alert:"Nepodařilo se stáhnout stránku",type:"danger"}));
                return cachePromise.catch(() => fallbackPromise)
            })
        }
        else if(request.headers.get("Cache-Control")=="must-revalidate"|request.headers.get("Cache-Control")=="no-cache")//If there was a page reload or user forced reload from network
            return fetchPromise().catch(() =>
                cachePromise.catch(() =>//Not found anywhere
                    fallbackPromise
                )
            )
        else
        {
            return cachePromise.catch(() => fetchPromise().catch(() =>{
                if(!ignoreSrch)
                {
                    consoleGroup();
                    ignoreSrch = true;//Try it even if there are no that one with saved query string
                    console.log("Trying to find corresponding page without query string...");
                    return cachePromise.catch(() => fallbackPromise);
                }
                else
                    return fallbackPromise;
            })
           )
        }
    }
    event.respondWith(getTargetPromise());
    endGroup();
}

self.addEventListener('message', function(event){
    console.debug("SW got message: ",event.data);
    if (event.data.tag === 'notifyPageLoad') {
        setTimeout(notifyPageLoad,500);
    }
    else if (event.data.tag === 'reload') {
        forceReloadNextTime = true;
        postMessageToClient({messageType:"reloadPermitted"});
    }
    else if(event.data.tag === 'essential-download')
    {
        if(!precaching&&!precachedEssential)
            precacheEssential();//Pro jistotu
        else if(precachedEssential)
            postMessageToClient({actualState:"downloaded_essential",messageType:"caching_state_changed"});

    }
    else if(event.data.tag === 'extended-download')
    {
        if(!extendedPrecaching&&!precachedExtended)
            precache();
        else if(precachedExtended)
            postMessageToClient({actualState:"downloaded_extended",messageType:"caching_state_changed"});
    }
    else if(event.data.tag === 'clean')
    {
        precachedEssential = precachedExtended = precaching = extendedPrecaching = false;
        precacheEssential(true).then(() =>
            precache(true).then(() =>
                postMessageToClient({messageType:"reloadPermitted"})
            )
        )
    }
    else if(event.data.tag==='skipWaiting')
    {
        self.skipWaiting();
    }
});
function consoleGroup()
{
    if(!insideConsoleGroup)
    {
        console.group("[SW]");
        insideConsoleGroup = true;
    }
}
function endGroup()
{
    insideConsoleGroup = false;
    console.groupEnd();
}
function postMessageToClient(data, targetClientId)
{
    if (typeof data.messageType == "undefined")
        data.messageType = "snackbar";
    if (typeof targetClientId != "undefined") {
        self.clients.get(targetClientId).then((client) => {
            client.postMessage(data);
        });
    }
    else {
        clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function (clientList) {
            for (var i = 0; i < clientList.length; i++) {
                clientList[i].postMessage(data);
            }
        });
    }
}
self.addEventListener('push', function(event) {
    console.log('Received a push message', event);
    var info = event.data.json();
    info.url += "?cache=false";
    if(info.type=='conversion_completed')
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
self.addEventListener('notificationclick', function(event) {
    var data = event.notification.data;
    event.notification.close();
    if(event.notification.tag == 'conversion_completed')
    {
        postMessageToClient({messageType:"conversion_completed",url:data});
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
},false);
if(precaching)
    afterprecaching.push(fetch_it);
else
    self.addEventListener("fetch",fetch_it);