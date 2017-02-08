pReact && pReact.extend(pReact.tmplModel.binds.controllers, {
	baidumap: function(elem, obj) {
		if (elem) {
			var key = pReact.jq(elem).attr("p-key");
			pReact.createElement("http://api.map.baidu.com/getscript?v=2.0&ak=" + key + "&services=&t=" + (Math.random(1000) + "").replace(".", ""), function() {
				window.BMap_loadScriptTime = (new Date).getTime();
				var map = new BMap.Map("container");
				map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);
				var opts = {
					type: BMAP_NAVIGATION_CONTROL_LARGE
				};
				map.addControl(new BMap.NavigationControl(opts));
				map.setCurrentCity("北京");
			});
		}
	}
});