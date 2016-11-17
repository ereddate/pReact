var nopjs = pReact.createClass("nopjs", {
	render: function() {
		return '<span style="position:fixed;top:50%;left:0;z-index:100000;">{{ a }}</span>';
	}
});
pReact.renderDom(nopjs, {
	a: "nopjs test"
}, document.body);