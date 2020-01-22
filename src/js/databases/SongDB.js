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
        this.updatingIndex = true;
        let createIndexTask;
        SongDB.onmessage("Aktualizace indexu písní...", null, 2000);
        if (callback)
            $("#songStatus").html("Stahování indexu...");
        createIndexTask = Tasks.AddActive("Stahování seznamu písní", null, "assignment");
        NetworkUtils.getNoCache(`${process.env.VUE_APP_REMOTE_URL}/api/listsongs.php${UserStoredInfo.ID ? (`?user=${UserStoredInfo.ID}&name=${UserStoredInfo.Name}`) : ''}`).then(response => response.json()).then(songArray =>
        {
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
                createIndexTask.completed();
                SongDB.updatingIndex = false;
                if (callback) callback();
                for (let y = 0; y < SongDB.afterIndexCallbacks.length; y++)
                    SongDB.afterIndexCallbacks.pop()();
            }, () =>
            {
                createIndexTask.failed();
                const str = "Nepodařilo se uložit databázi";
                SongDB.onmessage(str, "danger", 2000);
                createIndexTask.element.find("label").html(str);
                SongDB.updatingIndex = false;
                $("#songStatus").html(str);
            })
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
    read(resolve, reject, oncomplete, onerror)
    {
        const _this = this;
        _this.getDB(db =>
        {
            try
            {
                const trans = db.transaction("songIndex", "readonly");
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
                    if (_this.requestingDB)
                        _this.pendingDBRequests.push(() =>
                        {
                            _this.getDB(db =>
                            {
                                const trans = db.transaction("songIndex", "readonly");
                                trans.onerror = ({ target }) =>
                                {
                                    if (onerror) onerror(target.error);
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
                                if (onerror) onerror(target.error);
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
    get(id, resolve, reject)
    {
        SongDB.read(songStore =>
        {
            const getReq = songStore.get(id);
            getReq.onsuccess = ({ target }) =>
            {
                if (resolve) resolve(target.result)
            }
            getReq.onerror = ({ target }) =>
            {
                if (reject) reject(target.error)
            }
        })
    },
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
        const url = `${location.protocol}//${location.host}/api/getsong.php?id=${songId}&nospace=true`;
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
                    for (let i = 0; i < _class.pendingDBRequests.length; i++)
                        _class.pendingDBRequests.pop()(_class.db);
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
                        SongDB.downloadIndex(() =>
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
    }
}
export
{
    SongDB
};