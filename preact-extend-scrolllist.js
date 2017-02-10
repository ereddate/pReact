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
			this.unit = options.unit || "rem";
			var that = this;
			return this;
		},
		refresh: function() {
			//console.log("refresh")
			var fz = screen.width / 16;
			this.topOffset = parseFloat(this.upElem.height())/fz;
			this.bottomOffset = parseFloat(this.downElem.height())/fz;
			this.maxscroll = parseFloat(this.parent.height())/fz;
		},
		done: function(callback) {
			var that = this;
			pReact.jq(window).on("scroll", function(e) {
				that.scrollFilterCallback && that.scrollFilterCallback(that, function() {
					var top = pReact.jq(this).scrollTop();
					//console.log(top , that.maxscroll , that.parent[0].scrollHeight)
					if (top + that.maxscroll >= that.parent[0].scrollHeight) {
						this.timeout && clearTimeout(this.timeout);
						this.timeout = setTimeout(function() {
							that.loadMore && that.loadMore.call(that);
						}, 500);
					}
				});
			})
			that.parent[0].ontouchstart = function(e) {
				var touch = e.changedTouches[0];
				this.pointY = touch.pageY - (this.currentY || 0);
			};
			that.parent[0].ontouchmove = function(e) {
				var touch = e.changedTouches[0];
				var deltaY = touch.pageY - this.pointY - that.topOffset;
				this.currentY = touch.pageY + deltaY + that.topOffset;
				iscroll.animate(that.content, 0, deltaY, 0, that.unit);
				this.deltaY = deltaY;
				that.touchMove && that.touchMove.call(that, deltaY);
			};
			that.parent[0].ontouchend = function(e) {
				if (this.currentY > 0) {
					that.touchEnd ? that.touchEnd.call(that, this.deltaY, function() {
						iscroll.animate(that.content, 0, 0, 0, that.unit);
					}, function() {
						iscroll.animate(that.content, 0, "-" + that.topOffset, 0, that.unit);
					}) : iscroll.animate(that.content, 0, "-" + that.topOffset, 0, that.unit);
					this.currentY = 0;
				} else if (this.currentY < this.maxscroll) {
					iscroll.animate(that.content, 0, this.maxscroll, 0, that.unit);
				}
				that.parent[0].ontouchmove = that.parent[0].ontouchend = null;
			};
			callback && callback.call(that);
			return this;
		}
	};
	iscroll.animate = function(elem, x, y, z, unit) {
		(typeof elem == "string" ? pReact.jq(elem) : elem).css({
			transform: "translate(" + x + unit + ", " + y + unit + ") translateZ(" + z + unit + ")"
		});
	};
	iscroll.fn.init.prototype = iscroll.fn;
	pReact.scroll = iscroll;
})(this, pReact);