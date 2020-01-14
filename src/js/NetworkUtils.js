export default {
	getNoCache:function(uri)
	{
		return $.ajax({
			url: uri,
			headers: { "Cache-Control": "no-store" }
		});
	},
	revalidateCache: function(uri)
	{
		return $.ajax({
			url: uri,
			headers: { "Cache-Control": "must-revalidate" }
		});
	},
	noCacheRequest:function(uri)
	{
		var noCacheHead = new Headers();
		noCacheHead.append("Cache-Control", "no-store");
		return new Request(uri, {
			headers: noCacheHead,
			cache: 'no-store'
		})
	}
}