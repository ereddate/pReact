/*!
 * pReact & pjs template v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/pReact
 */
 pReact && (function(win, pReact) {
	var iscroll = function(elem, options) {
		return new iscroll.fn.init(elem, options);
	};
	iscroll.fn = iscroll.prototype = {
		init: function(elem, options) {
			pReact.extend(this, pReact.extend(options, {
				parent: pReact.jq(elem),
				content: pReact.jq(options.content),
				upElem: pReact.jq(options.upElem),
				downElem: pReact.jq(options.downElem)
			}));
			this.topOffset = options.upElemHeight || this.upElem.height();
			this.bottomOffset = options.downElemHeight || this.downElem.height();
			this.maxscroll = this.parent.height();
			var that = this;
			return this;
		},
		refresh: function(){
			console.log("refresh")
			this.maxscroll = this.parent.height();
		},
		done: function(callback) {
			var that = this;
			pReact.jq(window).on("scroll", function(e) {
				var top = pReact.jq(this).scrollTop();
				console.log(top , that.maxscroll , that.parent[0].scrollHeight)
				if (top + that.maxscroll >= that.parent[0].scrollHeight) {
					this.timeout && clearTimeout(this.timeout);
					this.timeout = setTimeout(function() {
						that.loadMore && that.loadMore.call(that);
					}, 500);
				}
			})
			that.parent[0].ontouchstart = function(e) {
				var touch = e.changedTouches[0];
				this.pointY = touch.pageY - (this.currentY || 0);
				that.parent[0].ontouchmove = function(e) {
					var touch = e.changedTouches[0];
					var deltaY = touch.pageY - this.pointY - that.topOffset;
					this.currentY = touch.pageY + deltaY + that.topOffset;
					!that.isscroll && that.content.css({
						transform: "translate(0px, " + deltaY + "px) translateZ(0px)"
					});
					this.deltaY = deltaY;
					that.touchMove && that.touchMove.call(that, deltaY);
				};
				that.parent[0].ontouchend = function(e) {
					if (this.currentY > 0) {
						that.touchEnd ? that.touchEnd.call(that, this.deltaY, function() {
							that.content.css({
								transform: "translate(0px, 0px) translateZ(0px)"
							});
							console.log("loading")
						}, function() {
							that.content.css({
								transform: "translate(0px, -" + that.topOffset + "px) translateZ(0px)"
							});
							console.log("loaded")
						}) : that.content.css({
							transform: "translate(0px, -" + that.topOffset + "px) translateZ(0px)"
						});
						this.currentY = 0;
					} else if (this.currentY < this.maxscroll) {
						that.content.css({
							transform: "translate(0px, " + this.maxscroll + "px) translateZ(0px)"
						});
					}
					that.parent[0].ontouchmove = that.parent[0].ontouchend = null;
				};
			};
			return this;
		}
	};
	iscroll.fn.init.prototype = iscroll.fn;
	pReact.scroll = iscroll;
})(this, pReact);