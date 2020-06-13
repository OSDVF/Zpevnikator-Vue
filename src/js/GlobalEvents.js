/**
 * @module GlobalEvents
 */
/**
 * @enum {string}
 * Contains all posible events which can affect whole application behavior
*/
var GlobalEvents =
{
    /** Song index was updated */
    indexUpdated: "indexUpdated",
    /** Song index is being downloaded */
    indexUpdating: "indexUpdating",
    /** User data download has started */
    pullStarted: "pullStarted",
    /** User data download has been completed */
    pullCompleted: "pullCompleted",
    /** User data upload has been completed */
    pushCompleted: "pushCompleted",
    /** User data upload has started */
    pushStarted: "pushStarted",
    /** A user has logged in */
    loggedIn: "loggedIn",
    /** A user has logged out */
    loggedOut: "loggedOut",
};
Object.freeze(GlobalEvents);
export default GlobalEvents;