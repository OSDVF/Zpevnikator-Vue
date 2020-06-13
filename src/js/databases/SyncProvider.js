import { SongDB } from './SongDB'
import UserStoredInfo from './UserInfo'
import { NetworkUtils, UIHelpers } from '../Helpers';
import GlobalEvents from '../GlobalEvents';

/**
 * Provides static functions for refreshing user-saved content.  <br>
 * User credentials are fetched from {@link UserStoredInfo}.
 * When any error occurs, the {@link onError} handler is called
 * @class
 * @hideconstructor
 * @requires Vue
 * @requires SongDB
 * @property {Vue} eventBus
 */
class SyncProvider
{
    /**
     * Initialize the SyncProvider singleton.  <br>
     * Doesn't have to be stored in an instance variable. It is a static class. <br>
     * Note: it updates current Vuex state if a user is logged in
     * @param {Vue} eventBus
     */
    constructor(eventBus)
    {
        /**
         * Vue event bus. You can use Vue's $emit and $on methods on it
         */
        SyncProvider.eventBus = eventBus;
        if (UserStoredInfo.IsLoggedIn)
            eventBus.$store.commit('logItIn', UserStoredInfo.Info);

        SongDB.eventBus.$on(GlobalEvents.indexUpdated, () =>
        {
            SyncProvider.eventBus.$emit(GlobalEvents.indexUpdated);
        })
        SongDB.eventBus.$on(GlobalEvents.indexUpdating, () =>
        {
            SyncProvider.eventBus.$emit(GlobalEvents.indexUpdating);
        })
    }
    /**
     * Downloads **all** the changes from the online backend and tries to pull them to local databases.  <br>
     * Uses {@link pullAPIQuery} internally  <br>
     * If no user is signed in it downloads just the public song index ({@link SongDB.downloadIndex})
     * @returns {Promise<TogetherQueryResult>|undefined} Returned promise resolves when all the data is downloaded or 'undefined' when nobody is logged in
     */
    static pull()
    {
        this.eventBus.$emit(GlobalEvents.pullStarted);
        SyncProvider.pullInProgress = true;
        if (UserStoredInfo.IsLoggedIn)
        {
            return this.pullAPIQuery({ userInfo: true, songs: true, groups: true, playlists: true, notes: true }).then(togetherQueryResult =>
            {
                var songIndexPromise = this.updateSongIndexPromised(togetherQueryResult.songs);
                return Promise.all([songIndexPromise]).then(()=>{
                    SyncProvider.pullInProgress = false;
                    this.eventBus.$emit(GlobalEvents.pullCompleted);
                    return togetherQueryResult;
                });
            })
        }
        else
        {
            return new Promise((resolve) => SongDB.downloadPublicIndex(resolve)).then(()=>{
                SyncProvider.pullInProgress = false;
                this.eventBus.$emit(GlobalEvents.pullCompleted);
                return undefined;
            });
        }
    }

    /**
     * Downloads the song index only  <br>
    * Uses {@link pullAPIQuery} internally  <br>
     * If no user is signed in it downloads just the public song index ({@link SongDB.downloadIndex()})
     * @returns {Promise<SongInfo[]>|undefined} Returned promise resolves when the index is downloaded or 'undefined' when nobody is logged in
     */
    static pullSongs()
    {
        SyncProvider.pullInProgress = true;
        this.eventBus.$emit(GlobalEvents.pullStarted);
        if (UserStoredInfo.IsLoggedIn)
        {
            return this.pullAPIQuery().then(togetherQueryResult =>//Default parameters are enough
            {
                return this.updateSongIndexPromised(togetherQueryResult.songs).then(()=>{
                    SyncProvider.pullInProgress = false;
                    this.eventBus.$emit(GlobalEvents.pullCompleted);
                    return togetherQueryResult.songs;
                });
            });
        }
        else
        {
            return new Promise((resolve) => SongDB.downloadPublicIndex(resolve)).then(()=>{
                SyncProvider.pullInProgress = false;
                this.eventBus.$emit(GlobalEvents.pullCompleted);
                return undefined;
            });
        }
    }

    /**
     * Sends a query to the backend for pulling various data
     * @param {Object} params Parameters for the query
     * @param {bool} [params.userInfo=true] Retrieve information about currently logged user profile
     * @param {bool} [params.songs=true] Retrieve the user's own song database (along with the public database)
     * @param {bool} [params.notes=true] Retrieve groups of which the user is a member
     * @param {bool} [params.playlists=false] Retrieve playlists created by the user or shared in its groups
     * @param {bool} [params.notes=true] Retrieve notes created by the user or shared in its groups
     * @return {Promise<TogetherQueryResult>}
     */
    static pullAPIQuery({ userInfo = true, songs = true, groups = false, playlists = false, notes = false } = {})
    {
        return fetch(process.env.VUE_APP_API_URL + '/users/refresh.php',
            {
                method: 'POST',
                body: this.constructRequestBody()

            }).then(rawResult =>
            {
                return rawResult.json().catch(this.onError)
            })
    }
    /**
     * Sends all local user-created content to the backend.
     * @note Uses {@link pushAPIQuery} internally
     * @see {@link https://api.dorostmladez.cz/docs/|Backend API Documentation}
     */
    static push()
    {
        this.pushInProgress = true;
        this.eventBus.$emit(GlobalEvents.pushStarted);
        this.eventBus.$emit(GlobalEvents.pushCompleted);
        this.pushInProgress = false;
    }
    static constructRequestBody()
    {
        return NetworkUtils.CreateBody({
            id: UserStoredInfo.id,
            credentials: UserStoredInfo.credentials
        })
    }
    /**
     * Sets the stored user data and updates current application state
     * @param {UserInfo} params
     */
    static setLoggedUserData(params = {})
    {
        const { id = UserStoredInfo.id, name = UserStoredInfo.name, fullName = UserStoredInfo.fullName, credentials = UserStoredInfo.credentials } = params;
        UserStoredInfo.id = id;
        UserStoredInfo.name = name;
        UserStoredInfo.credentials = credentials;
        UserStoredInfo.fullName = fullName;
        this.eventBus.$store.commit("logItIn", params);
    }
    /**
     * Sends a login request to the backend and updates all local databases with the new user's data
     * @param {FormData|Object} usernameAndPassword Should contain a 'username' and a 'password' inner field
     * @returns {TogetherQueryResult}
     */
    static tryLogIn(usernameAndPassword)
    {
        if (!(usernameAndPassword instanceof FormData)) usernameAndPassword = this.CreateBody(usernameAndPassword);

        return fetch(process.env.VUE_APP_API_URL + "/users/login.php", {
            method: "POST",
            body: usernameAndPassword
        }).then(response =>
        {
            return response.json().then(jsonResponse =>
            {
                this.setLoggedUserData(jsonResponse.userInfo);
                var songPromise = this.updateSongIndexPromised(jsonResponse.songs);

                return Promise.all([songPromise]).then(() =>
                {
                    UIHelpers.Message("Přihlášeno úspěšně");
                    console.info("Login succesfull");
                    this.eventBus.$emit(GlobalEvents.loggedIn);
                    return jsonResponse;
                }).catch(
                    () =>
                    {
                        UIHelpers.Message("Přihlášení se nezdařilo", "danger");
                        return jsonResponse;
                    }
                );
            })
        })
    }
    /**
     * Log the current user out, delete its data and update app state
     */
    static logOut()
    {
        this.eventBus.$store.commit('logItIn', { name: null, id: null, credentials: null });
        this.eventBus.$emit(GlobalEvents.loggedOut);
        SongDB.DeleteUserSpecificSongs();
        UserStoredInfo.Delete();
    }
    static updateSongIndexPromised(songs)
    {
        return new Promise((resolve) => SongDB.updateIndex(songs, resolve))
    }
}
/**
 * Assign a custom function here. Gets called on every error in any sync or async process
 * @field onError
 * @memberof SyncProvider
 * @param {Error|*} error The thrown error, or something returned by a rejected Promise
 */
SyncProvider.onError = function (error)
{
    console.error(error);
    if (typeof Sentry != 'undefined') Sentry.captureException(error);
}
/**
 * @type {boolean}
 */
SyncProvider.pullInProgress = false;
/**
 * @type {boolean}
 */
SyncProvider.pushInProgress = false;
export default SyncProvider;

/**
 * @typedef TogetherQueryResult
 * Result from a query to Zpěvníkátor Together backend API query
 * @property {UserInfo} userInfo
 * @property {SongInfo[]} songs
 * @property {Group[]} groups
 * @property {Playlist[]} playlists
 * @property {Note[]} notes
 */