pReact && pReact.jq && pReact.extend(pReact.jq.fn, {
	pinched: function(zoomIn, zoomOut) {
		function getDistance(p1, p2) {
			var x = p2[0] - p1[0],
				y = p2[1] - p1[1];
			return Math.sqrt((x * x) + (y * y));
		}
		var dom = pReact.jq(this),
			touchend = function(e) {
				if (this.isOnTouch > 0) {
					var touchs = e.changedTouches,
						len = touchs.length;
					this.isOnTouch += 1;
					if (len > 1) {
						this.endX = [touchs[0].clientX, touchs[1].clientX];
						this.endY = [touchs[0].clientY, touchs[1].clientY];
						var v = getDistance([this.endX[0], this.endY[0]], [this.endX[1], this.endY[1]]) / getDistance([this.startX[0], this.startY[0]], [this.startX[1], this.startY[1]]);
						if (v < 1) {
							zoomIn && zoomIn.call(this, e);
						} else {
							zoomOut && zoomOut.call(this, e);
						}
					} else if (e.scale && e.scale <= 1) {
						zoomIn && zoomIn.call(this, e);
					} else if (e.scale && e.scale > 1) {
						zoomOut && zoomOut.call(this, e);
					}
				}
				dom.off("touchend", touchend);
			};
		dom.on("touchstart", function(e) {
			this.isOnTouch = 0;
			var touchs = e.targetTouches,
				len = touchs.length;
			if (len > 1) {
				this.isOnTouch += 1;
				this.startX = [touchs[0].clientX, touchs[1].clientX];
				this.startY = [touchs[0].clientY, touchs[1].clientY];
			}
			dom.on("touchend", touchend);
		}).on("touchmove", function(e) {
			e.preventDefault();
		});
		return this;
	}
});