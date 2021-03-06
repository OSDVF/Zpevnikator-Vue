import Tasks from '../Notifications'
import Vue from 'vue'
import
{
    NetworkUtils
} from '../Helpers';
const dbName = process.env.VUE_APP_SONG_DB_NAME
const buildNumber = process.env.VUE_APP_DB_BUILDNUMBER
/**
* @callback databaseResolveCallback
* @param {IDBObjectStore} store
*/
/**
 * @typedef SongInfo
 * @property url
 * @property author
 * @property language
 * @property imported
 * @property offlineOnly
 */
/**
 * A song database based on indexedDB
 * @class
 * @hideconstructor
 */
const SongDB = {
    eventBus: new Vue(),
    updatingIndex: false,
    pendingDBRequests: [],
    cacheName: process.env.VUE_APP_SONG_DB_NAME,
    onmessage: console.log,
    /**
     * Returns CacheStorage that is assigned to be the place to store downloaded offline songs
     * @returns {Promise<Cache>} Returns the opened cache object or a rejected Promise on error
     */
    openCache()
    {
        if ('caches' in window)
        {
            return caches.open(this.cacheName);
        }
        this.onmessage('Nelze otevřít offline databázi písní', 'warning');
        return Promise.reject();
    },
    /**
     * Requests the backend API for a public version of the song index and updates the local database with its values
     */
    downloadPublicIndex(callback)
    {
        let createIndexTask;
        SongDB.onmessage("Aktualizace indexu písní...", null, 2000);
        this.eventBus.$emit("indexUpdating");
        if (callback)
            $("#songStatus").html("Stahování indexu...");
        createIndexTask = Tasks.AddActive("Stahování seznamu písní", null, "assignment");
        NetworkUtils.getNoCache(`${process.env.VUE_APP_API_URL}/songs/list.php`).then(response => response.json()).then(songArray =>
        {
            this.updateIndex(songArray, () =>
            {
                createIndexTask.completed();
                if (callback) callback();
            }, () =>
            {
                createIndexTask.failed();
                const str = "Nepodařilo se uložit databázi";
                SongDB.onmessage(str, "danger", 2000);
                createIndexTask.element.find("label").html(str);
                $("#songStatus").html(str);
            });
        }).catch(e =>
        {
            console.error(e)
            createIndexTask.failed();
            const str = "Připojení selhalo.";
            SongDB.onmessage(str, "danger", 2000);
            createIndexTask.element.find("label").html(str);
            $("#songStatus").html(str);
        })
    },
    /**
     * Updates the client mirror of the database with values of an array
     * @param {SongInfo[]} songArray
     * @param {Function} onerror
     * @param {Function} oncomplete
     */
    updateIndex(songArray, oncomplete, onerror)
    {
        this.updatingIndex = true;
        function executeDBTask(songStore)
        {
            let newSongs = 0;
            let changedSongs = 0;
            for (let i = 0; i < songArray.length; i++)
            {
                SongDB.updateSong(songStore, songArray[i], ({ isNew, isChanged }) =>
                {
                    if (isNew) newSongs++;
                    else if (isChanged) changedSongs++;
                });
            }
            try
            {
                const cRequest = songStore.openCursor();
                cRequest.onsuccess = ({ target }) =>
                {
                    const cursor = target.result;
                    if (cursor)
                    {
                        let found = false;
                        for (let i = 0; i < songArray.length; i++)
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
        SongDB.write(executeDBTask, null, () =>
        {
            SongDB.updatingIndex = false;
            SongDB.eventBus.$emit("indexUpdated");
            if (oncomplete) oncomplete()
        }, () =>
        {
            if (onerror) onerror()
        });
    },
    getDB(callback)
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

    /**
     * Opens a read pipe
     * @param {databaseResolveCallback} resolve 
     */
    read(resolve, reject, oncomplete)
    {
        const _this = this;
        _this.getDB(db =>
        {
            try
            {
                const trans = db.transaction("songIndex", "readonly");
                trans.onerror = ({ target }) =>
                {
                    if (reject) reject(target.error);
                }
                trans.oncomplete = oncomplete;
                if (resolve) resolve(trans.objectStore("songIndex"));
            } catch (e)
            {
                if (e.name == 'InvalidStateError')
                {
                    if (_this.requestingDB)
                        _this.pendingDBRequests.push(() =>
                        {
                            _this.getDB(db =>
                            {
                                const trans = db.transaction("songIndex", "readonly");
                                trans.onerror = ({ target }) =>
                                {
                                    if (reject) reject(target.error);
                                }
                                trans.oncomplete = oncomplete;
                                if (resolve) resolve(trans.objectStore("songIndex"));
                            })
                        })
                    else
                    {
                        _this._requestDB(); //Refresh DB
                        _this.getDB(db =>
                        {
                            const trans = db.transaction("songIndex", "readonly");
                            trans.onerror = ({ target }) =>
                            {
                                if (reject) reject(target.error);
                            }
                            trans.oncomplete = oncomplete;
                            if (resolve) resolve(trans.objectStore("songIndex"));
                        })
                    }
                } else
                {
                    if (reject) reject(e);
                }
            }
        });
    },
    /**
     * 
     * @param {string} id Identifier of the stored SongInfo object
     * @param {databaseResolveCallback} resolve 
     * @param {Function} reject 
     */
    get(id, resolve, reject)
    {
        this.read(songStore =>
        {
            const getReq = songStore.get(id);
            getReq.onsuccess = ({ target }) =>
            {
                if (!target.result && !id.startsWith("offline:"))
                {
                    //Může se stát že píseň nějak chybí v indexu, tak ho pro jsitotu stáhneme znova
                    const clb = () => this.get(id, resolve, reject);
                    if (this.updatingIndex)
                        this.eventBus.$on("indexUpdated", clb);
                    else
                        this.downloadPublicIndex(clb);
                    return;
                }
                else if (resolve) resolve(target.result)
            }
            getReq.onerror = ({ target }) =>
            {
                if (reject) reject(target.error)
            }
        }, reject)
    },
    /**
     * Opens a writing pipe to indexedDB
     * @param {databaseResolveCallback} resolve 
     * @param {Function} reject 
     * @param {Function} oncomplete 
     * @param {Function} onerror 
     */
    write(resolve, reject, oncomplete, onerror)
    {
        const _this = this;
        _this.getDB(db =>
        {
            try
            {
                const trans = db.transaction("songIndex", "readwrite");
                trans.onerror = ({ target }) =>
                {
                    if (onerror) onerror(target.error);
                }
                trans.oncomplete = oncomplete;
                if (resolve) resolve(trans.objectStore("songIndex"));
            } catch (e)
            {
                if (e.name == 'InvalidStateError')
                {
                    _this.db = null;
                    _this._requestDB(); //Refresh DB
                    _this.getDB(db =>
                    {
                        const trans = db.transaction("songIndex", "readwrite");
                        trans.onerror = ({ target }) =>
                        {
                            if (onerror) onerror(target.error);
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
    /**
     * @typedef UpdateResult
     * @property {boolean} isChanged The operation changed existing data
     * @property {boolean} isNew The operation added new item to the database
     */
    /**
     * @callback UpdateResultCallback
     * @property {UpdateResult} result
     */
    /**
     * Update a single SongInfo item
     * @param {IDBObjectStore} [songStore] You can supply previously got ObjectStore to speed the process up
     * @param {SongInfo} songInfo 
     * @param {UpdateResultCallback} callback 
     */
    updateSong(songStore, songInfo, callback)
    {
        const result = {
            isNew: false,
            isChanged: false
        };

        function upd()
        {
            const readRequest = songStore.get(songInfo.url);
            readRequest.onsuccess = ({ target }) =>
            {
                if (target.result)
                {
                    if (target.result.name != songInfo.name || target.result.video != songInfo.video || target.result.author != songInfo.author || target.result.language != songInfo.language)
                        result.isChanged = true;
                } else
                    result.isNew = true;
                if (callback) callback(result);
            }
            songStore.put(songInfo);
        }
        if (!songStore)
        {
            SongDB.getDB(db =>
            {
                const trans = db.transaction("songIndex", "readwrite");
                songStore = trans.objectStore("songIndex");
                upd();
            });
        } else upd();

    },
    Exists(songStore, songId, resolve, reject)
    {
        const readRequest = songStore.get(songId);
        readRequest.onsuccess = ({ target }) =>
        {
            if (target.result)
            {
                if (resolve) resolve(target.result);
            } else
                if (reject) reject();
        }
    },
    Inject(cache, songId, contents)
    {
        const url = `${process.env.VUE_APP_API_URL}/songs/get.php?id=${songId}`;
        const req = new Request(url);
        const hdr = new Headers();
        hdr.append("Referer", url);
        return cache.put(req, new Response(new Blob([contents], {
            type: 'text/html;charset=utf-8'
        }), {
            headers: hdr
        }));
    },
    informAboutChanges(changedSongs, newSongs)
    {
        if (changedSongs)
            if (newSongs)
                SongDB.onmessage(`${newSongs} nových a ${changedSongs} změněných písní v seznamu`, null, 2500);
            else
                SongDB.onmessage(`${changedSongs} změněných písní v seznamu`, null, 2500);
        else
            if (newSongs)
                SongDB.onmessage(`${newSongs} nových písní v seznamu`, null, 2500);
    },
    _requestDB()
    {
        this.requestingDB = true;
        const _class = this;
        try
        {
            let request;
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
            request.onerror = ({ target }) =>
            {
                const err = `Chyba při přístupu k indexu. //Kód chyby ${target.error.code}`;
                SongDB.onmessage(err, 'danger', 7000, true);
                if (typeof (Sentry) != 'undefined')
                    Sentry.captureException(target.error);
                _class.requestingDB = false;
                console.error(target.error)
                if (NetworkUtils.revalidateCache) NetworkUtils.revalidateCache("version.js");
            };
            let upgraded = false;
            request.onsuccess = ({ target }) =>
            {
                _class.db = target.result;
                _class.requestingDB = false;
                if (!upgraded) //To not run twice when upgrade wa needed
                {
                    _class.pendingDBRequests.forEach(fn => fn(_class.db));
                }
            };
            request.onblocked = ({ target }) =>
            {
                console.error("Blocked indexedDB: ", target.error)
            };
            request.onupgradeneeded = ({ target }) =>
            {
                upgraded = true;
                // Save the IDBDatabase interface
                _class.db = target.result;
                const offlines = [];
                if (_class.db.objectStoreNames.contains("songIndex"))
                {
                    const trans = target.transaction;
                    const songStore = trans.objectStore("songIndex");
                    const req = songStore.openCursor();
                    req.onsuccess = ({ target }) =>
                    {
                        const cursor = target.result;
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
                    let objectStore;
                    objectStore = _class.db.createObjectStore("songIndex", {
                        keyPath: "url"
                    });
                    for (const entry of offlines)
                    {
                        objectStore.put(entry);
                    }
                    console.log("Created song index DB");
                    if (!SongDB.updatingIndex)
                        SongDB.downloadPublicIndex(() =>
                        {
                            for (let i = 0; i < _class.pendingDBRequests.length; i++)
                                _class.pendingDBRequests.pop()(_class.db);
                        });
                }
            }
            request.onversionchange = ({ target }) =>
            {
                console.info("SongDB changing version");
                if (_class.deleting)
                {
                    target.close();
                    console.log("Connection closed for deleting the DB");
                    return;
                }
            }
        } catch (e)
        {
            console.error(e)
        }
    },
    close(resolve, reject)
    {
        const _this = this;
        _this.requestingDB = false;
        if (_this.db)
        {
            _this.db.onclose = resolve;
            _this.db.close();
        } else
            if (reject) reject();
    },
    delete(resolve, reject)
    {
        this.deleting = true;
        const req = indexedDB.deleteDatabase(dbName);
        req.onsuccess = () =>
        {
            console.info("Deleted database successfully");
            if (resolve) resolve();
        };
        req.onerror = ({ target }) =>
        {
            console.error("Couldn't delete database");
            if (reject) reject(target.error);
        };
        req.onblocked = event =>
        {
            console.error("Couldn't delete database due to the operation being blocked");
            if (reject) reject("blocked")
        };
    },
    DeleteUserSpecificSongs(callback)
    {
        this.write(function (songStore)
        {
            var request = songStore.openCursor();
            request.onsuccess = function (event)
            {
                var cursor = event.target.result;
                if (cursor)
                {
                    if (cursor.value.status)
                    {
                        cursor.delete(); //Delete others songs
                    }
                    cursor.continue();
                } else
                    if (callback) callback(true);
            };
            request.onerror = function (event)
            {
                console.error("Error reading songs from DB ", event);
                if (callback) callback(false);
            }
        })
    },
}
export
{
    SongDB
};