var pendingReady = [];
export default {
    resourcesReady: function (context,callback) {
        if (typeof $ !== 'undefined' && $.isReady)
            callback.call(context);
        pendingReady.push([callback,context]);
    }
}
window.addEventListener('DOMContentLoaded', () => {
    for (var r of pendingReady)
        r[0].call(r[1]);
})