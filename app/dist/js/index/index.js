window.pReact_web_config = {
	isIndex: false,
	currentpage: 0,
	pages: [{
		index: 0,
		mainTitle: "推荐",
		mainDesc: "...",
		buttonTitle: "推荐"
	}, {
		index: 1,
		mainTitle: "景点",
		mainDesc: "...",
		buttonTitle: "景点"
	}, {
		index: 2,
		mainTitle: "地图",
		mainDesc: "...",
		buttonTitle: "地图"
	}, {
		index: 3,
		mainTitle: "服务",
		mainDesc: "...",
		buttonTitle: "服务"
	}, {
		index: 4,
		mainTitle: "查询",
		mainDesc: "...",
		buttonTitle: "查询"
	}, {
		index: 5,
		mainTitle: "关于",
		mainDesc: "...",
		buttonTitle: "关于"
	}]
}
pReact.ready(function() {
	this.toMobile(16);
	this({
		//path:"./",
		//ext: ".pjs",
		//files:["dist/index/index"],
		debug: true
	}).done();
});