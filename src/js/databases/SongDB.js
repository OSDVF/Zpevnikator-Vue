import Tasks from '../Tasks'
import
{
    NetworkUtils
} from '../Helpers';
import UserStoredInfo from '../Profiles'
const dbName = process.env.VUE_APP_SONG_DB_NAME
const buildNumber = process.env.VUE_APP_DB_BUILDNUMBER
const SongDB = {
    updatingIndex: false,
    afterIndexCallbacks: [],
    pendingDBRequests: [],
    onmessage: console.log,
    afterIndexUpdate(callback)
    {
        this.afterIndexCallbacks.push(callback);
    },
    downloadIndex(callback)
    {
        "use strict"
        this.updatingIndex = true;
        var createIndexTask;
        SongDB.onmessage("Aktualizace indexu písní...", null, 2000);
        if (callback)
            $("#songStatus").html("Stahování indexu...");
        createIndexTask = Tasks.AddActive("Stahování seznamu písní", null, "assignment");
        NetworkUtils.getNoCache(process.env.VUE_APP_REMOTE_URL + '/api/listsongs.php' + (UserStoredInfo.ID ? ('?user=' + UserStoredInfo.ID + '&name=' + UserStoredInfo.Name) : '')).then(function (response)
        {
            return response.json();
        }).then(function (songArray)
        {
            function executeDBTask(songStore)
            {
                var newSongs = 0;
                var changedSongs = 0;
                for (let i = 0; i < songArray.length; i++)
                {
                    SongDB.updateSong(songStore, songArray[i], function (changedInfo)
                    {
                        if (changedInfo.isNew) newSongs++;
                        else if (changedInfo.isChanged) changedSongs++;
                    });
                }
                try
                {
                    var cRequest = songStore.openCursor();
                    cRequest.onsuccess = function (event)
                    {
                        var cursor = event.target.result;
                        if (cursor)
                        {
                            var found = false;
                            for (var i = 0; i < songArray.length; i++)
                            {
                                if (songArray[i].url == cursor.value.url)
                                {
                                    found = true;
                                    break;
                                }
                            }
                            if (!(found || cursor.value.imported || cursor.value.offlineOnly))
                                cursor.delete()
                            cursor.continue();
                        } else
                        {
                            if (!(changedSongs || newSongs))
                                SongDB.onmessage("Již máte aktuální seznam", null, 2000);
                            SongDB.informAboutChanges(changedSongs, newSongs);
                            SongDB.updatingIndex = false;
                        }
                    }
                    localStorage.lastIndexDownloaded = Math.floor(Date.now() / 1000) //Timestamp in seconds
                } catch (e)
                {
                    console.warn(e);
                }
            }
            SongDB.write(executeDBTask, null, function ()
            {
                createIndexTask.completed();
                SongDB.updatingIndex = false;
                if (callback) callback();
                for (var y = 0; y < SongDB.afterIndexCallbacks.length; y++)
                    SongDB.afterIndexCallbacks.pop()();
            }, function ()
            {
                createIndexTask.failed();
                var str = "Nepodařilo se uložit databázi";
                SongDB.onmessage(str, "danger", 2000);
                createIndexTask.element.find("label").html(str);
                SongDB.updatingIndex = false;
                $("#songStatus").html(str);
            })
        }).catch(function (e)
        {
            console.error(e)
            createIndexTask.failed();
            var str = "Připojení selhalo.";
            SongDB.onmessage(str, "danger", 2000);
            createIndexTask.element.find("label").html(str);
            $("#songStatus").html(str);
        })
    },
    getDB: function (callback)
    {
        if (this.db)
            callback(this.db);
        else if (this.requestingDB)
            this.pendingDBRequests.push(callback);
        else
        {
            this.pendingDBRequests.push(callback);
            this._requestDB();
        }
    },
    read: function (resolve, reject, oncomplete, onerror)
    {
        var _this = this;
        _this.getDB(function (db)
        {
            try
            {
                var trans = db.transaction("songIndex", "readonly");
                trans.onerror = function (event)
                {
                    if (onerror) onerror(event.target.error);
                }
                trans.oncomplete = oncomplete;
                if (resolve) resolve(trans.objectStore("songIndex"));
            } catch (e)
            {
                if (e.name == 'InvalidStateError')
                {
                    if (_this.requestingDB)
                        _this.pendingDBRequests.push(function ()
                        {
                            _this.getDB(function (db)
                            {
                                var trans = db.transaction("songIndex", "readonly");
                                trans.onerror = function (event)
                                {
                                    if (onerror) onerror(event.target.error);
                                }
                                trans.oncomplete = oncomplete;
                                if (resolve) resolve(trans.objectStore("songIndex"));
                            })
                        })
                    else
                    {
                        _this._requestDB(); //Refresh DB
                        _this.getDB(function (db)
                        {
                            var trans = db.transaction("songIndex", "readonly");
                            trans.onerror = function (event)
                            {
                                if (onerror) onerror(event.target.error);
                            }
                            trans.oncomplete = oncomplete;
                            if (resolve) resolve(trans.objectStore("songIndex"));
                        })
                    }
                } else
                {
                    if (onerror) onerror(e)
                    if (reject) reject(e);
                }
            }
        });
    },
    get: function (id, resolve, reject)
    {
        SongDB.read(function (songStore)
        {
            var getReq = songStore.get(id);
            getReq.onsuccess = function (event)
            {
                if (resolve) resolve(event.target.result)
            }
            getReq.onerror = function (event)
            {
                if (reject) reject(event.target.error)
            }
        })
    },
    write: function (resolve, reject, oncomplete, onerror)
    {
        var _this = this;
        _this.getDB(function (db)
        {
            try
            {
                var trans = db.transaction("songIndex", "readwrite");
                trans.onerror = function (event)
                {
                    if (onerror) onerror(event.target.error);
                }
                trans.oncomplete = oncomplete;
                if (resolve) resolve(trans.objectStore("songIndex"));
            } catch (e)
            {
                if (e.name == 'InvalidStateError')
                {
                    _this.db = null;
                    _this._requestDB(); //Refresh DB
                    _this.getDB(function (db)
                    {
                        var trans = db.transaction("songIndex", "readwrite");
                        trans.onerror = function (event)
                        {
                            if (onerror) onerror(event.target.error);
                        }
                        trans.oncomplete = oncomplete;
                        if (resolve) resolve(trans.objectStore("songIndex"));
                    })
                } else
                {
                    if (onerror) onerror(e)
                    if (reject) reject(e);
                }
            }
        });
    },
    updateSong: function (songStore, songInfo, callback)
    {
        var result = {
            isNew: false,
            isChanged: false
        };

        function upd()
        {
            var readRequest = songStore.get(songInfo.url);
            readRequest.onsuccess = function (event)
            {
                if (event.target.result)
                {
                    if (event.target.result.name != songInfo.name || event.target.result.video != songInfo.video || event.target.result.author != songInfo.author || event.target.result.language != songInfo.language)
                        result.isChanged = true;
                } else
                    result.isNew = true;
                if (callback) callback(result);
            }
            songStore.put(songInfo);
        }
        if (!songStore)
        {
            SongDB.getDB(function (db)
            {
                var trans = db.transaction("songIndex", "readwrite");
                songStore = trans.objectStore("songIndex");
                upd();
            });
        } else upd();

    },
    Exists: function (songStore, songId, resolve, reject)
    {
        var readRequest = songStore.get(songId);
        readRequest.onsuccess = function (event)
        {
            if (event.target.result)
            {
                if (resolve) resolve(event.target.result);
            } else
                if (reject) reject();
        }
    },
    Inject: function (cache, songId, contents)
    {
        var url = location.protocol + "//" + location.host + "/api/getsong.php?id=" + songId + "&nospace=true";
        var req = new Request(url);
        var hdr = new Headers();
        hdr.append("Referer", url);
        return cache.put(req, new Response(new Blob([contents], {
            type: 'text/html;charset=utf-8'
        }), {
            headers: hdr
        }));
    },
    informAboutChanges: function (changedSongs, newSongs)
    {
        if (changedSongs)
            if (newSongs)
                SongDB.onmessage(newSongs + " nových a " + changedSongs + " změněných písní v seznamu", null, 2500);
            else
                SongDB.onmessage(changedSongs + " změněných písní v seznamu", null, 2500);
        else
            if (newSongs)
                SongDB.onmessage(newSongs + " nových písní v seznamu", null, 2500);
    },
    _requestDB: function ()
    {
        this.requestingDB = true;
        var _class = this;
        try
        {
            var request;
            if (typeof shimIndexedDB != 'undefined' && (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)))
            {
                shimIndexedDB.__setConfig({
                    sysDatabaseBasePath: "Řídící databáze písní",
                    addSQLiteExtension: false,
                    DEFAULT_DB_SIZE: 5 * 1024 * 1024
                });
                shimIndexedDB.__useShim();
                request = shimIndexedDB.open(dbName, buildNumber)
            } else
                request = indexedDB.open(dbName, buildNumber);
            request.onerror = function (event)
            {
                var err = 'Chyba při přístupu k indexu. //Kód chyby ' + event.target.error.code;
                SongDB.onmessage(err, 'danger', 7000, true);
                if (typeof (Sentry) != 'undefined')
                    Sentry.captureException(event.target.error);
                _class.requestingDB = false;
                console.error(event.target.error)
                if (NetworkUtils.revalidateCache) NetworkUtils.revalidateCache("version.js");
            };
            var upgraded = false;
            request.onsuccess = function (event)
            {
                _class.db = event.target.result;
                _class.requestingDB = false;
                if (!upgraded) //To not run twice when upgrade wa needed
                    for (var i = 0; i < _class.pendingDBRequests.length; i++)
                        _class.pendingDBRequests.pop()(_class.db);
            };
            request.onblocked = function (event)
            {
                console.error("Blocked indexedDB: ", event.target.error)
            };
            request.onupgradeneeded = function (event)
            {
                upgraded = true;
                // Save the IDBDatabase interface
                _class.db = event.target.result;
                var offlines = [];
                if (_class.db.objectStoreNames.contains("songIndex"))
                {
                    var trans = event.target.transaction;
                    var songStore = trans.objectStore("songIndex");
                    var req = songStore.openCursor();
                    req.onsuccess = function (event)
                    {
                        var cursor = event.target.result;
                        if (cursor)
                        {
                            if (cursor.value.offlineOnly || cursor.value.imported)
                                offlines.push(cursor.value);
                            cursor.continue();
                        } else
                        {
                            replaceStore();
                        }
                    }
                    req.onerror = replaceStore;
                } else replaceStore();

                function replaceStore()
                {
                    // Create a new objectStore for this database
                    try
                    {
                        _class.db.deleteObjectStore("songIndex");
                    } catch (e)
                    {
                        console.log("Song index doesn't exist...");
                    } //Tohle je jenom pro jistotu
                    var objectStore;
                    objectStore = _class.db.createObjectStore("songIndex", {
                        keyPath: "url"
                    });
                    for (var entry of offlines)
                    {
                        objectStore.put(entry);
                    }
                    console.log("Created song index DB");
                    if (!SongDB.updatingIndex)
                        SongDB.downloadIndex(function ()
                        {
                            for (var i = 0; i < _class.pendingDBRequests.length; i++)
                                _class.pendingDBRequests.pop()(_class.db);
                        });
                }
            }
            request.onversionchange = function (event)
            {
                console.info("SongDB changing version");
                if (_class.deleting)
                {
                    event.target.close();
                    console.log("Connection closed for deleting the DB");
                    return;
                }
            }
        } catch (e)
        {
            console.error(e)
        }
    },
    close: function (resolve, reject)
    {
        var _this = this;
        _this.requestingDB = false;
        if (_this.db)
        {
            _this.db.onclose = resolve;
            _this.db.close();
        } else
            if (reject) reject();
    },
    delete: function (resolve, reject)
    {
        this.deleting = true;
        var req = indexedDB.deleteDatabase(dbName);
        req.onsuccess = function ()
        {
            console.info("Deleted database successfully");
            if (resolve) resolve();
        };
        req.onerror = function (event)
        {
            console.error("Couldn't delete database");
            if (reject) reject(event.target.error);
        };
        req.onblocked = function (event)
        {
            console.error("Couldn't delete database due to the operation being blocked");
            if (reject) reject("blocked")
        };
    }
}
export
{
    SongDB
};