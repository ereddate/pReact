(function(win, $, ceval) {
	var doc = win.document;
	$.extend($, {
		createClass: function() {
			var args = arguments,
				len = args.length;
			return len > 0 && $.extend({}, args[0]);
		},
		renderDom: function(html, data, parent) {
			var result = map.tmpl(typeof html == "string" ? html : html.render(), data);
			if (typeof html == "string") {
				parent.innerHTML = parent.innerHTML + result;
			} else {
				parent.appendChild(map.renderHandle(result, html));
			}
		}
	});
	win.pReact = $;
	var map = {
		findDom: function(a, obj) {
			map.each(a.children, function(i, elem) {
				map.each("onClick onCopy onCut onPaste onKeyDown onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onTouchCancel onTouchEnd onTouchMove onTouchStart onScroll onWheel".split(' '), function(i, name) {
					var val = elem.getAttribute(name);
					if (val) {
						var result = /\{\{\s*(.+)\s*\}\}/.exec(val);
						result && result[1] && (elem.removeAttribute(name), elem[name.toLowerCase()] = function(e) {
							var fn = ceval('return function(e){' + result[1] + '(e);}', "e");
							fn.call(obj, e);
						});
					}
				});
				map.findDom(elem, obj);
			});
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
		render: function(html, dom) {
			html = html.replace(/\s{2,}/gi, "").replace(/[\r|\n|\r\n]*/gi, "");
			var result = /render\s*\:\s*function\(\)\{\s*.*\s*return\s*\(\s*(.+)\s*\);*\s*\}\}\);*/.exec(html);
			if (result && result[1]) {
				var exp = "\'" + result[1].replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"") + "\'";
				html = html.replace(result[1], exp);
			}
			html = html.replace(/\{\{\s*\$([^\}\s*]+)\s*\}\}/gi, function(a, b) {
				return "\'+" + b + "+\'"
			});
			result = /\.renderDom\s*\(\s*\<\s*(.+)\/\>/.exec(html);
			if (result) {
				var k = result[1].split(' ');
				html = html.replace(result[0], result[0].replace(result[1], k[0] + "," + result[1].replace(k[0] + " ", "").replace(/\/\>/, "")).replace(/\<|\/\>/gi, ""));
			}
			ceval(html);
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
		var a = doc.getElementsByTagName('script');
		map.each(a, function(i, elem) {
			elem.type && elem.type == "text/pReact" && map.render(elem.innerHTML, elem);
		});
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
