//Dependent on together API
import Settings from './Settings'
function isLoggedIn() {
    return (localStorage.getItem(Settings.KeyPrefix + "loginCredentials") !== null);
}

function checkLogin() {
    if (typeof Together != 'undefined') Together(); //Initialize Zpěvníkátor Together API
    if (isLoggedIn()) {
        $('#addSongIcon').parent().parent().show();
        $("#loginButton").attr("title", "Můj profil").find(".sr-only").html("Můj profil");

        if (typeof Sentry != 'undefined')//If we have a Sentry, inform it about user
            Sentry.configureScope(function (scope) {
                scope.setUser({
                    "id": UserStoredInfo.ID,
                    "username": UserStoredInfo.Name
                });
            });
    } else {
        $('#addSongIcon').parent().parent().hide();
    }
}
var UserStoredInfo = {
    PurgeUserDBInfo: function (callback) {
        SongDB.write(function (songStore) {
            var request = songStore.openCursor();
            request.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.status) {
                        cursor.delete(); //Delete others songs
                    }
                    cursor.continue();
                } else
                    callback(true);
            };
            request.onerror = function (event) {
                console.error("Error reading songs from DB ", event);
                callback(false);
            }
        })
    },
    BindCheckbox: function (element, settingName, changed) {
        var initialVal = UserStoredInfo[settingName];
        if (initialVal.then) {
            initialVal.then(function (value) {
                element.checked = value;
                element.addEventListener('change', function () {
                    UserStoredInfo[settingName] = element.checked;
                    if (changed) changed(element.checked);
                });
            })
        } else {
            element.checked = initialVal;
            element.addEventListener('change', function () {
                UserStoredInfo[settingName] = element.checked;
                if (changed) changed(element.checked);
            });
        }
    }
};
Object.defineProperties(UserStoredInfo, {
    Credentials: {
        get: function () {
            return localStorage.getItem(Settings.KeyPrefix + "loginCredentials");
        }
    },
    IsLogged: {
        get: isLoggedIn
    },
    ID: {
        get: function () {
            return localStorage.getItem(Settings.KeyPrefix + "userID");
        }
    },
    Name: {
        get: function () {
            return localStorage.getItem(Settings.KeyPrefix + "userName");
        }
    },
    SyncNotes: {
        get: function () {
            return new Promise(function (res, rej) {
                NetworkUtils.getNoCache("/api/userinfo.php?get=syncNotes").done(function (response) {
                    if (response == "true")
                        localStorage.setItem(Settings.KeyPrefix + 'user_syncNotes', true);
                    else if (response == "false")
                        localStorage.setItem(Settings.KeyPrefix + 'user_syncNotes', false);
                    res(response == "true");
                }).fail(function () {
                    rej(localStorage.getItem(Settings.KeyPrefix + 'user_syncNotes') != "false")
                })
            })
        },
        set: function (mode) {
            localStorage.setItem(Settings.KeyPrefix + 'user_syncNotes', mode);
            return new Promise(function (res, rej) {
                NetworkUtils.getNoCache("/api/userinfo.php?set=syncNotes&value=" + mode.toString()).done(function (response) {
                    if (response == "true")
                        res(true);
                    else if (response == "false")
                        rej(true);
                    else rej(false)
                }).fail(function () {
                    rej(false)
                })
            })
        }
    },
})
export default UserStoredInfo;