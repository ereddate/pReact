pReact && pReact.jq && (pReact.canvasDraw = function(select, ops) {
	var doc = window.document;

	var draw = function(select, ops) {
		return draw.fn.init(select, ops);
	};
	draw.fn = draw.prototype = {
		init: function(select, ops) {
			if (pReact.support.canvas) {
				var parent = pReact.jq(select),
					canvas = doc.createElement("canvas");

				canvas.id = (Math.random(10000) + "").replace(".", "");
				canvas.parent = parent;
				canvas.width = ops.width || screen.width;
				canvas.height = ops.height || 200;
				canvas.ctx = canvas.getContext("2d");
				parent.append(canvas);
				pReact.extend(this, {
					parent: parent,
					canvas: canvas,
					ctx: canvas.ctx
				});
				return this;
			} else {
				return;
			}
		},
		setData: function(callback) {
			callback && (this.canvas.baseData = callback(this.canvas));
			return this;
		}
	};
	draw.fn.init.prototype = draw.fn;

	pReact.extend(draw.fn, {
		clearRect: function() {
			this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			return this;
		},
		drawDashLine: function(style, width, dir, data) {
			var self = this;
			data = data || self.canvas.baseData;
			var ctx = self.canvas.ctx,
				i, len = data.length;
			ctx.strokeStyle = draw.color[style] || style;
			ctx.lineWidth = width;
			ctx.save();
			if (typeof data == "function") {
				self.drawDashLine(data(self.canvas, function(canvas) {
					self.canvas = canvas;
				}), style, width);
			} else {
				ctx.beginPath();
				for (i = 0; i < len; i++) {
					if (data[i].from && data[i].to) {
						var p = dir == "left" ? data[i].to[0] : data[i].to[1] / 5;
						var fx = data[i].from[0],
							fy = data[i].from[1],
							tx = data[i].to[0],
							ty = data[i].to[1];
						for (x = 0; x < p; x++) {
							if (x % 2 === 0) {
								ctx.moveTo(dir == "left" ? fx + 5 * x : fx, dir != "left" ? fy + 5 * x : fy);
							} else {
								ctx.lineTo(dir == "left" ? fx + 5 * x : fx, dir != "left" ? ty + 5 * x : ty);
							}
						}
					}
				}
				ctx.stroke();
			}
			return self;
		},
		drawLine: function(style, width, data) {
			var self = this;
			data = data || self.canvas.baseData;
			canvas = self.canvas;
			var ctx = canvas.getContext("2d"),
				i, len = data.length;
			ctx.strokeStyle = draw.color[style] || style;
			ctx.lineWidth = width;
			ctx.save();
			if (typeof data == "function") {
				self.drawLine(data(canvas, function(rcanvas) {
					self.canvas = rcanvas;
				}), style, width);
			} else {
				for (i = 0; i < len; i++) {
					if (data[i].from && data[i].to) {
						ctx.beginPath();
						var fx = data[i].from[0],
							fy = data[i].from[1];
						ctx.moveTo(fx, fy);
						var tx = data[i].to[0],
							ty = data[i].to[1];
						ctx.lineTo(tx, ty);
						ctx.stroke();
					}
				}
			}
			return self;
		},
		drawString: function(text, x, y, dir, style) {
			var ctx = this.ctx;
			ctx.save();
			ctx.fillStyle = draw.color[style] || style || draw.color.black;
			ctx.textAlign = dir || "right";
			ctx.fillText(text, x, y);
			ctx.restore();
			return this;
		},
		drawViewLine: function(style, width){
			var canvas = this.canvas;
			this.drawLine(style, width, [{
				from:[0, 0],
				to:[canvas.width, 0]
			},{
				from:[canvas.width, 0],
				to:[canvas.width, canvas.height]
			},{
				from:[canvas.width, canvas.height],
				to:[0, canvas.height]
			},{
				from:[0, canvas.height],
				to:[0, 0]
			}]);
			return this;
		}
	});

	pReact.extend(draw, {
		color: {
			red: "rgba(255,0,0,1)",
			green: "rgba(50,205,50,1)",
			blue: "rgba(30,144,255,1)",
			black: "rgba(0,0,0,1)",
			powder: "rgba(255,0,255,1)",
			lightgrey: "rgba(211,211,211,1)"
		}
	});

	return draw(select, ops);
});