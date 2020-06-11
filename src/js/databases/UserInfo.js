//Dependent on together API
import Settings from '../Settings'

/**
 * Access information about logged user
 * @class
 */
var UserStoredInfo = {
    BindCheckbox: function (element, settingName, changed)
    {
        var initialVal = UserStoredInfo[settingName];
        if (initialVal.then)
        {
            initialVal.then(function (value)
            {
                element.checked = value;
                element.addEventListener('change', function ()
                {
                    UserStoredInfo[settingName] = element.checked;
                    if (changed) changed(element.checked);
                });
            })
        } else
        {
            element.checked = initialVal;
            element.addEventListener('change', function ()
            {
                UserStoredInfo[settingName] = element.checked;
                if (changed) changed(element.checked);
            });
        }
    },
    /**
     * Name and ID
     */
    get Info()
    {
        return {
            name: this.Name,
            id: this.ID
        }
    },
    /**
     * Credentials hash, used for server-side authentification
     * @type string
     */
    get Credentials() { return localStorage.getItem(Settings.KeyPrefix + "loginCredentials") },
    set Credentials(val)
    {
        localStorage[Settings.KeyPrefix + "loginCredentials"] = val
    },
    /**
     * Wordpress-side ID
     * @type Number
     */
    get ID()
    {
        return localStorage.getItem(Settings.KeyPrefix + "userID");
    },
    set ID(val)
    {
        localStorage.setItem(Settings.KeyPrefix + "userID", val);
    },
    set Name(val)
    {
        localStorage[Settings.KeyPrefix + "userName"] = val;
    },
    /**
     * Username (not full name)
     * @type string
     */
    get Name()
    {
        return localStorage.getItem(Settings.KeyPrefix + "userName");
    },
    /**
     * Checks if there is any credentials hash in device storage
     * @returns bool
     */
    get IsLoggedIn() { return (localStorage.getItem(Settings.KeyPrefix + "loginCredentials") !== null); },
    /**
     * Delete stored info abour user = log him out
     */
    Delete()
    {
        localStorage.removeItem(Settings.KeyPrefix + "userName");
        localStorage.removeItem(Settings.KeyPrefix + "userID");
        localStorage.removeItem(Settings.KeyPrefix + "loginCredentials");
    }

};
Object.defineProperties(UserStoredInfo, {
    /**
     * @todo Notes should be implemented as Zpěvníkátor-Together module
     */
    SyncNotes: {
        get: function ()
        {
            return new Promise(function (res, rej)
            {
                NetworkUtils.getNoCache("/api/userinfo.php?get=syncNotes").done(function (response)
                {
                    if (response == "true")
                        localStorage.setItem(Settings.KeyPrefix + 'user_syncNotes', true);
                    else if (response == "false")
                        localStorage.setItem(Settings.KeyPrefix + 'user_syncNotes', false);
                    res(response == "true");
                }).fail(function ()
                {
                    rej(localStorage.getItem(Settings.KeyPrefix + 'user_syncNotes') != "false")
                })
            })
        },
        set: function (mode)
        {
            localStorage.setItem(Settings.KeyPrefix + 'user_syncNotes', mode);
            return new Promise(function (res, rej)
            {
                NetworkUtils.getNoCache("/api/userinfo.php?set=syncNotes&value=" + mode.toString()).done(function (response)
                {
                    if (response == "true")
                        res(true);
                    else if (response == "false")
                        rej(true);
                    else rej(false)
                }).fail(function ()
                {
                    rej(false)
                })
            })
        }
    },
})
export default UserStoredInfo;