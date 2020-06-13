//Dependent on together API
import Settings from '../Settings'

/**
 * @interface UserInfo
 * Interface for user information exchange
 * @property {string} name Aka "username"
 * @property {string} fullName E.g. John Doe
 * @property {Number} id
 * @property {string} avatar Url to the avatar image
 */

/**
 * Access information about logged user
 * @class
 * @hideconstructor
 * @implements UserInfo
 */
var UserStoredInfo = {
    /**
     * Name and ID
     */
    get Info()
    {
        return {
            name: this.name,
            id: this.id,
            fullName: this.fullName
        }
    },
    /**
     * Credentials hash, used for server-side authentification
     * @type string
     */
    get credentials() { return localStorage.getItem(Settings.KeyPrefix + "loginCredentials") },
    set credentials(val)
    {
        localStorage[Settings.KeyPrefix + "loginCredentials"] = val
    },
    /**
     * Wordpress-side ID
     * @type Number
     */
    get id()
    {
        return localStorage.getItem(Settings.KeyPrefix + "userID");
    },
    set id(val)
    {
        localStorage.setItem(Settings.KeyPrefix + "userID", val);
    },
    set name(val)
    {
        localStorage[Settings.KeyPrefix + "userName"] = val;
    },
    /**
     * Username (not full name)
     * @type string
     */
    get name()
    {
        return localStorage.getItem(Settings.KeyPrefix + "userName");
    },
    set fullName(val)
    {
        localStorage[Settings.KeyPrefix + "fullName"] = val;
    },
    /**
     * E.g. John doe
     * @type string
     */
    get fullName()
    {
        return localStorage.getItem(Settings.KeyPrefix + "fullName");
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
export default UserStoredInfo;