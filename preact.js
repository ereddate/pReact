(function(win, $, ceval) {
	var doc = win.document;
	Object.prototype.toArray = function(fn) {
		var a = [];
		for (name in this) {
			var result = fn(this[name]);
			result && a.push(this[name]);
		}
		return a;
	};
	Array.prototype.del = function(num) {
		this.splice(num, 1);
		return this;
	};
	$.extend($, {
		createClass: function() {
			var args = arguments,
				len = args.length;
			return len > 0 && $.extend({}, args[0]);
		},
		renderDom: function(html, data, parent) {
			var result = map.tmpl(typeof html == "string" ? html : typeof html == "function" ? (new html()).render() : html.render(), data);
			if (typeof html == "string") {
				parent.innerHTML = parent.innerHTML + result;
			} else {
				parent.appendChild(map.renderHandle(result, html));
			}
			return this;
		},
		each: function(obj, callback) {
			map.each(obj, callback);
			return this;
		}
	});

	function activeEmi() {
		var self = this,
			a = this.emi || [];

		function exec(n, a) {
			switch (a[n].type) {
				case "load":
					var item = doc.createElement("script");
					item.src = a[n].url;
					item.callback = a[n].callback;
					item.onload = item.onerror = function() {
						try {
							this.callback && this.callback();
							self.emi && self.emi.del(n), exec(0, self.emi), doc.body.removeChild(this);
						} catch (e) {
							doc.body.removeChild(this), self.emi && self.emi.del(n), exec(0, self.emi);
						}
					};
					doc.body.appendChild(item);
					return self;
					break;
				case "done":
					var $a = self.files || [],
						p = self.path || "",
						t = self.ext || ".pjs";

					function loadFile($n, $a) {
						$.load(p + $a[$n] + t, function(context) {
							var item = doc.createElement("script");
							item.type = "text/pReact";
							item.innerHTML = context;
							doc.body.appendChild(item);
							$a && $a.del(0);
							if (!$a || $a && $a.length === 0) {
								var b = doc.getElementsByTagName('script'),
									i;
								b = b.toArray(function(obj) {
									return map.isElement(obj) ? obj : false;
								});
								for (i = 0; i <= b.length; i++) {
									var elem = b[i];
									elem && elem.type && elem.type == "text/pReact" && (html = elem.innerHTML, elem.parentNode.removeChild(elem), map.render(elem.innerHTML));
								}
							} else {
								loadFile(0, $a);
							}
						});
					}
					$.load && loadFile(0, $a);
					break;
			}
			a && a.del(n);
			if (!a || a && a.length === 0) {} else {
				exec(0, a);
			}
		}
		exec(0, a);
	}
	$.extend($.fn, {
		load: function(url, callback) {
			!this.emi && (this.emi = []);
			this.emi && this.emi.push({
				type: "load",
				url: url,
				callback: callback
			});
			return this;
		},
		set: function(ops) {
			ops && $.extend(this, ops);
			return this;
		},
		done: function() {
			!this.emi && (this.emi = []);
			this.emi && this.emi.push({
				type: "done"
			});
			activeEmi.call(this);
			return this;
		}
	});
	win.pReact = $;
	var map = {
		findDom: function(a, obj) {
			if (a.children.length > 0) {
				map.each(a.children, function(i, elem) {
					map.each("onClick onCopy onCut onPaste onKeyDown onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onTouchCancel onTouchEnd onTouchMove onTouchStart onScroll onWheel".split(' '), function(i, name) {
						var val = elem.getAttribute(name);
						if (val) {
							var result = /\{\{\s*(.+)\s*\}\}/.exec(val);
							result && result[1] && (elem.removeAttribute(name), elem[name.toLowerCase()] = function(e) {
								try {
									var fn = ceval('return function(e){' + result[1] + '(e);}', "e");
									fn.call(typeof obj == "function" ? (new obj) : obj, e);
								} catch (e) {
									console.log(e.message);
								}
							});
						}
					});
					map.findDom(elem, obj);
				});
			} else {
				map.each("onClick onCopy onCut onPaste onKeyDown onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onTouchCancel onTouchEnd onTouchMove onTouchStart onScroll onWheel".split(' '), function(i, name) {
					var val = a.getAttribute(name);
					if (val) {
						var result = /\{\{\s*(.+)\s*\}\}/.exec(val);
						result && result[1] && (a.removeAttribute(name), a[name.toLowerCase()] = function(e) {
							try {
								var fn = ceval('return function(e){' + result[1] + '(e);}', "e");
								fn.call(typeof obj == "function" ? (new obj) : obj, e);
							} catch (e) {
								console.log(e.message);
							}
						});
					}
				});
			}
		},
		renderHandle: function(html, obj) {
			var fragment = doc.createDocumentFragment();
			var elem = doc.createElement("div"),
				i;
			elem.innerHTML = html;
			var len = elem.children.length;
			for (i = 0; i < len; i++) {
				var item = elem.children[0];
				fragment.appendChild(item), map.findDom(item, obj);
			}
			return fragment;
		},
		renderExp: /render\s*\:\s*function\(\)\s*\{\s*.*\s*return\s*\(\s*(.+)\s*\);*\s*\}\}\);*/,
		renderExpA: /render\s*\(\)\s*\{\s*.*\s*return\s*\(\s*(.+)\s*\);*\s*\}\}/,
		renderDomExp: /\.renderDom\s*\(\s*\<\s*(.+)\/\>/gi,
		renderObjExp: /\{\{\s*\$([^\}\s*]+)\s*\}\}/gi,
		evalHtml: function(html) {
			html = html.replace(/\s{2,}/gi, "").replace(/[\r|\n|\r\n]*/gi, "");
			html = html.replace(map.renderExp, function(a, b) {
				if (b) {
					var exp = "\'" + b.replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"") + "\'";
					a = a.replace(b, exp);
				}
				return a;
			}).replace(map.renderExpA, function(a, b) {
				if (b) {
					var exp = "\'" + b.replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"") + "\'";
					a = a.replace(b, exp);
				}
				return a;
			}).replace(map.renderDomExp, function(a, b) {
				if (b) {
					var k = b.split(' ');
					a = a.replace(b, k[0] + "," + b.replace(k[0] + " ", "").replace(/\/\>/, "")).replace(/\<|\/\>/gi, "");
				}
				return a;
			}).replace(map.renderObjExp, function(a, b) {
				return "\'+" + b + "+\'"
			});
			return html;
		},
		render: function(html, dom) {
			html = map.evalHtml(html);
			try {
				ceval(html);
			} catch (e) {
				console.log(e.message)
			}
		},
		each: function(obj, callback) {
			function r(a) {
				var b = "length" in a && a.length,
					c = (typeof a).toLowerCase();
				return "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a
			}
			if (r(obj)) {
				var len = obj.length,
					i;
				for (i = 0; i < len; i++) {
					var result = callback.call(obj[i], i, obj[i]);
					if (result == false) {
						break;
					}
				}
			} else {
				for (name in obj) {
					var result = callback.call(obj[name], name, obj[name]);
					if (result == false) {
						break;
					}
				}
			}
		},
		isEmptyObject: function(obj) {
			var name;
			for (name in obj) {
				return false;
			}
			return true;
		},
		isElement: function(obj) {
			return !!obj && obj.nodeType === 1;
		},
		tmpl: function(html, data) {
			if (map.isEmptyObject(data)) return html;
			map.each(data, function(name, val) {
				var reg = new RegExp("{{\\s*(" + name + ")\\s*}}", "gi"),
					result = reg.exec(html);
				if (result) {
					while (result != null && result[1]) {
						html = html.replace(result[0], val);
						result = reg.exec(html);
					}
				}
			});
			return html;
		}
	};
	win.onload = function() {
		var a = doc.getElementsByTagName('script'),
			i, html;
		a = a.toArray(function(obj) {
			return map.isElement(obj) ? obj : false;
		});
		for (i = 0; i <= a.length; i++) {
			var elem = a[i];
			elem && elem.type && elem.type == "text/pReact" && (html = elem.innerHTML, elem.parentNode.removeChild(elem), map.render(html));
		}
	}
})(this, function() {
	var a = function(b) {
		return new a.fn.init(b);
	};
	a.fn = a.prototype = {
		init: function(b) {
			b && a.extend(this, b);
			return this;
		}
	};
	a.name = "pReact";
	a.extend = function(c, d) {
		c = c || {};
		for (e in d) c[e] = d[e];
		return c;
	};
	a.fn.init.prototype = a.fn;
	return a;
}(), function(s, ops) {
	return new Function(ops, s)(ops);
});
