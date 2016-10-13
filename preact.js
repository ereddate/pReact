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
(function(win, map, $) {
	var doc = win.document;
	var tmplFilter = function($) {
		function is(str, obj) {
			var bool = false;
			bool = _getConstructorName(obj).toLowerCase() === str.toLowerCase();
			return bool;
		}

		function _getConstructorName(o) {
			if (o != null && o.constructor != null) {
				return Object.prototype.toString.call(o).slice(8, -1);
			} else {
				return '';
			}
		}

		function _mulReplace(s, arr) {
			for (var i = 0; i < arr.length; i++) {
				s = s.replace(arr[i][0], arr[i][1]);
			}
			return s;
		}

		function _escapeChars(s) {
			return _mulReplace(s, [
				[/\\/g, "\\\\"],
				[/"/g, "\\\""],
				[/\r/g, "\\r"],
				[/\n/g, "\\n"],
				[/\t/g, "\\t"]
			]);
		}

		function _type(obj, bool) {
			var type = _getConstructorName(obj).toLowerCase();
			if (bool) return type;
			switch (type) {
				case 'string':
					return '"' + _escapeChars(obj) + '"';
				case 'number':
					var ret = obj.toString();
					return /N/.test(ret) ? 'null' : ret;
				case 'boolean':
					return obj.toString();
				case 'date':
					return 'new Date(' + obj.getTime() + ')';
				case 'array':
					var ar = [];
					for (var i = 0; i < obj.length; i++) {
						ar[i] = _stringify(obj[i]);
					}
					return '[' + ar.join(',') + ']';
				case 'object':
					if ($.isPlainObject(obj)) {
						ar = [];
						for (i in obj) {
							ar.push('"' + _escapeChars(i) + '":' + _stringify(obj[i]));
						}
						return '{' + ar.join(',') + '}';
					}
			}
			return 'null';
		}

		function _capitalize(val) {
			return val[0].toUpperCase() + val.substr(1);
		}

		function _stringify(obj) {
			if (obj == null) {
				return 'null';
			}
			if (obj.toJSON) {
				return obj.toJSON();
			}
			return _type(obj);
		}

		function _date(d, pattern) {
			d = new Date(d);
			pattern = pattern || 'yyyy-MM-dd';
			var y = d.getFullYear().toString(),
				o = {
					M: d.getMonth() + 1, //month
					d: d.getDate(), //day
					h: d.getHours(), //hour
					m: d.getMinutes(), //minute
					s: d.getSeconds() //second
				};
			pattern = pattern.replace(/(y+)/ig, function(a, b) {
				return y.substr(4 - Math.min(4, b.length));
			});
			for (var i in o) {
				pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
					return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i];
				});
			}
			return pattern;
		}

		function _currency(val, symbol) {
			var places, thousand, decimal;
			places = 2;
			symbol = symbol !== undefined ? symbol : "$";
			thousand = ",";
			decimal = ".";
			var number = val,
				negative = number < 0 ? "-" : "",
				i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
				j = (j = i.length) > 3 ? j % 3 : 0;
			return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
		}

		var digitUppercase = function(n, bool) {
			var fraction = ['角', '分'],
				digit = [
					'零', '壹', '贰', '叁', '肆',
					'伍', '陆', '柒', '捌', '玖'
				],
				unit = [
					['元', '万', '亿'],
					['', '拾', '佰', '仟']
				],
				head = n < 0 ? '欠' : '';
			n = Math.abs(n);
			var s = '';
			for (var i = 0; i < fraction.length; i++) {
				s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + (bool ? fraction[i] : '')).replace(/零./, bool ? '' : '零点');
			}
			s = s || '整';
			n = Math.floor(n);
			for (var i = 0; i < unit[0].length && n > 0; i++) {
				var p = '';
				for (var j = 0; j < unit[1].length && n > 0; j++) {
					p = digit[n % 10] + unit[1][j] + p;
					n = Math.floor(n / 10);
				}
				if (bool) {
					p = p.replace(/(零.)*零$/, '');
				} else {
					p = p.replace(/零./, '零点');
				}
				var dw = unit[0][i];
				if (dw == "元" && !bool) {
					dw = "点";
				}
				s = p.replace(/^$/, '零') + dw + s;
			}
			return head + s.replace(/(零.)*零元/, bool ? '元' : '')
				.replace(/(零.)+/g, bool ? '零' : '零点').replace(/零点$/, "整").replace(/点整$/, "")
				.replace(/^整$/, bool ? '零元整' : '零整');
		};

		var getLen = function(str, type) {
			var str = (str + "").replace(/\r|\n/ig, ""),
				temp1 = str.replace(/([^\x00-\xff]|[A-Z])/g, "**"),
				temp2 = temp1.substring(0),
				x_length = !type ? (temp2.split("\*").length - 1) / 2 + (temp1.replace(/\*/ig, "").length) : temp2.length;
			return x_length;
		};

		var textFix = function(name, num) {
			var max = num ? num : 16;
			return getLen(name, true) >= max ? _getText(name, max) : name;
		};
		var _getText = function(text, max) {
			var strs = [],
				n = 0,
				len = text.length,
				vtext = "";
			for (var i = 0; i < len; i++) {
				vtext = text.substr(i, 1).replace("“", " ").replace("”", " ");
				if (/([^\x00-\xff]|[A-Z])/.test(vtext)) {
					n += 2;
				} else {
					n += 1;
				}
				if (n <= max) {
					strs.push(vtext);
				}
			}
			return strs.join('');
		};
		var _tmplFilterVal = function(val, filterCondition) {
			if (typeof filterCondition == "function") {
				return filterCondition(val);
			} else if (typeof filterCondition == "object") {
				if ($.isPlainObject(filterCondition)) {
					for (name in filterCondition) {
						var oval = filterCondition[name];
						var oreg = new RegExp(oval, "igm");
						if (oreg.test(val)) {
							return val.replace(oreg, "");
						}
					}
				}
			}
			var strRegex = new RegExp(filterCondition, "igm");
			return (val + "").replace(strRegex, "");
		};
		//filter|json|limitToCharacter|limitTo|indexOf|lowercase|uppercase|toCNRMB|toCNumber|orderBy|date|currency|empty|passcard|encodeURI|decodeURI|toString|capitalize
		return {
			filter: function(val, filterCondition) {
				return _tmplFilterVal(val, filterCondition);
			},
			json: function(val, filterCondition) {
				return _stringify(val);
			},
			limitToCharacter: function(val, filterCondition) {
				if (is("string", val)) {
					return textFix(val, parseInt(filterCondition));
				}
				return val;
			},
			limitTo: function(val, filterCondition) {
				if (is("array", val)) {
					var a = [];
					val.forEach(function(n) {
						a.push(n);
					});
					return _stringify(a.splice(0, parseInt(filterCondition)));
				} else if (is("string", val)) {
					return val.substr(0, parseInt(filterCondition)); //textFix(val, parseInt(filterCondition));
				} else if (is("number", val) && /\./.test(val + "")) {
					return val.toFixed(filterCondition);
				} else if (is("number", val)) {
					var len = (val + "").length;
					return parseInt((val + "").substr(len - parseInt(filterCondition), filterCondition));
				}
				return val;
			},
			indexOf: function(val, filterCondition) {
				var index = -1,
					i;
				if (is("array", val)) {
					for (i = 0; i < val.length; i++) {
						if (val[i] == filterCondition) {
							index = i;
							break;
						}
					}
				}
				if (is("string", val)) {
					index = val.indexOf(filterCondition);
				}
				return index;
			},
			lowercase: function(val, filterCondition) {
				return val.toLowerCase();
			},
			uppercase: function(val, filterCondition) {
				return val.toUpperCase();
			},
			toCNRMB: function(val, filterCondition) {
				return digitUppercase(parseFloat(val), true);
			},
			toCNumber: function(val, filterCondition) {
				return digitUppercase(parseFloat(val), false);
			},
			orderBy: function(val, filterCondition) {
				if (is("array", val) && /reverse|sort/.test(filterCondition.toLowerCase())) {
					return val[filterCondition.toLowerCase()]();
				}
				return val;
			},
			date: function(val, filterCondition) {
				return _date(val, filterCondition);
			},
			currency: function(val, filterCondition) {
				return _currency(val);
			},
			empty: function(val, filterCondition) {
				return (typeof val == "string" && $.trim(val) == "" || val == null || typeof val == "undefined" || is("object", val) && map.isEmptyObject(val) || is("array", val) && val.length == 0) && filterCondition;
			},
			passcard: function(val, filterCondition) {
				var regex = /(\d{4})(\d{4})(\d{4})(\d{4})(\d{0,})/igm.exec(val);
				return regex && regex.splice(1, regex.length - 1).join(' ') || val;
			},
			encodeURI: function(val, filterCondition) {
				return encodeURIComponent(val);
			},
			decodeURI: function(val, filterCondition) {
				return decodeURIComponent(val);
			},
			toString: function(val, filterCondition) {
				return _stringify(val);
			},
			capitalize: function(val, filterCondition) {
				switch (filterCondition) {
					case 0:
						return _capitalize(val);
						break;
					default:
						var start = filterCondition - 1,
							end = filterCondition + 1,
							list = [];
						val.split('').forEach(function(str, i) {
							if (i == filterCondition) {
								list.push(str.toUpperCase())
							} else {
								list.push(str);
							}
						});
						return list.length > 0 ? list.join('') : val;
						break;
				}
			}
		};
	};
	tmplFilter = tmplFilter($);
	$.extend($, {
		trim: function(text) {
			var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
			return text == null ?
				"" :
				(text + "").replace(rtrim, "");
		},
		isPlainObject: function(obj) {
			var key, hasOwn = ({}).hasOwnProperty;
			if (!obj || !is("object", obj)) {
				return false;
			}
			try {
				if (obj.constructor &&
					!hasOwn.call(obj, "constructor") &&
					!hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
					return false;
				}
			} catch (e) {
				return false;
			}
			for (key in obj) {}
			return key === undefined || hasOwn.call(obj, key);
		},
		tmpl: function(html, data) {
			if (map.isEmptyObject(data)) return html;
			map.each(data, function(name, val) {
				html = html.replace(/{{\s+[^<>,]+\s+}}/gim, function(a) {
					if ((new RegExp("{{\\s+(" + name + ")\\s+([^<>,]+\\s+)*}}")).test(a)) {
						a = a.replace(new RegExp("{{\\s+(" + name + ")\\s+([^<>,}]+\\s+)*}}"), function(a, b, c) {
							if (c) {
								var result = c.split('|')[0].split(' : ');
								a = a.replace(a, tmplFilter[$.trim(result[0])](val, result[1] && $.trim(result[1]).replace(/[\'\"]/gim, "") || 0));
							} else {
								a = a.replace(new RegExp("{{\\s+" + name + "\\s+}}", "gim"), val);
							}
							return a;
						});
					}
					return a;
				});
			});
			return html;
		},
		createClass: function() {
			var args = arguments,
				len = args.length;
			return len > 0 && $.extend({}, args[0]);
		},
		renderDom: function(html, data, parent) {
			var obj = typeof html == "function" ? (new html()) : html;
			$.promise.when(function(resolve, reject) {
				if (data && "data" in data || !data && "getInitData" in obj && typeof obj.getInitData == "function") {
					var fn = (!data ? obj : data).getInitData,
						fnStr = fn.toString().replace(/getInitData\s*\(/gi, function(a, b) {
							a = a.replace(a, "function(");
							return a;
						});
					new Function("a", "b", "(" + fnStr + ")(a, b)")(resolve, reject);
				} else {
					resolve(data);
				}
			}).done(function(data) {
				var result = $.tmpl(typeof obj == "string" ? obj : obj.render(), data);
				if (typeof html == "string") {
					parent.innerHTML = parent.innerHTML + result;
				} else {
					parent.appendChild(map.renderHandle(result, html));
				}
			});
			return this;
		},
		each: function(obj, callback) {
			map.each(obj, callback);
			return this;
		},
		ready: function(callback) {
			var a = doc.getElementsByTagName('script'),
				i, html;
			a = a.toArray(function(obj) {
				return map.isElement(obj) ? obj : false;
			});
			for (i = 0; i <= a.length; i++) {
				var elem = a[i];
				elem && elem.type && elem.type == "text/pReact" && (html = elem.innerHTML, elem.parentNode.removeChild(elem), map.render(html));
			}
			callback && callback.call($);
		}
	});

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
			map.activeEmi(this, $);
			return this;
		}
	});
	win.pReact = $;
})(this, {
		emiTypeFn: {
			load: function(a, map, done) {
				var doc = document;
				var item = doc.createElement(/\.js$/.test(a.url) ? "script" : "link");
				if (/\.js$/.test(a.url)) {
					item.src = a.url;
					item.callback = a.callback;
					item.onload = item.onerror = function() {
						try {
							this.callback && this.callback();
							doc.body.removeChild(this), map.obj.emi && map.obj.emi.del(a.index), done(0, map.obj.emi);
						} catch (e) {
							doc.body.removeChild(this), map.obj.emi && map.obj.emi.del(a.index), done(0, map.obj.emi);
						}
					};
				} else {
					item.rel = "stylesheet";
					item.href = a.url;
					item.onload = item.onerror = function() {
						map.obj.emi && map.obj.emi.del(a.index), done(0, map.obj.emi);
					}
				}
				doc.body.appendChild(item);
			},
			done: function(a, map, done) {
				var doc = document;
				var $a = map.obj.files || [],
					p = map.obj.path || "",
					t = map.obj.ext || ".pjs";

				function loadFile($n, $a) {
					var html;
					map.preact.load(p + $a[$n] + t, function(context) {
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
				map.preact.load && loadFile(0, $a);
			}
		},
		activeEmi: function(self, $) {
			var _ = this,
				doc = document,
				a = self.emi || [];

			function exec(n, a) {
				if (a[n]) {
					a[n].index = n;
					_.preact = $;
					_.obj = self;
					_.emiTypeFn[a[n].type](a[n], _, exec);
					if (a[n].type == "load") return self;
				}
				a && a.del(n);
				if (!a || a && a.length === 0) {} else {
					exec(0, a);
				}
			}
			exec(0, a);
		},
		bindHandle: function(elem, obj) {
			var _ = this;
			_.each("onClick onCopy onCut onPaste onKeyDown onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onTouchCancel onTouchEnd onTouchMove onTouchStart onScroll onWheel".split(' '), function(i, name) {
				var val = elem.getAttribute(name);
				if (val) {
					var result = /\{\{\s*(.+)\s*\}\}/.exec(val);
					result && result[1] && (elem.removeAttribute(name), elem[name.toLowerCase()] = function(e) {
						try {
							var fn = _.ceval('return function(e){' + result[1] + '(e);}', "e"),
								then = typeof obj == "function" ? (new obj) : obj;
							then.elem = this;
							fn.call(then, e);
						} catch (e) {
							console.log(e);
						}
					});
				}
			});
		},
		ceval: function(s, ops) {
			return new Function(ops, s)(ops);
		},
		findDom: function(a, obj) {
			var _ = this;
			if (a.children.length > 0) {
				_.each(a.children, function(i, elem) {
					_.bindHandle(elem, obj);
					_.findDom(elem, obj);
				});
			} else {
				_.bindHandle(a, obj);
			}
		},
		renderHandle: function(html, obj) {
			var _ = this;
			var fragment = document.createDocumentFragment();
			var elem = document.createElement("div"),
				i;
			elem.innerHTML = html;
			var len = elem.children.length;
			for (i = 0; i < len; i++) {
				var item = elem.children[0];
				fragment.appendChild(item), _.findDom(item, obj);
			}
			return fragment;
		},
		renderExp: /return\s*\(\s*[^\r\n]+\s*\>\s*\)}|return\s*\(\s*[^\r\n]+\s*\>\s*\)/gi,
		renderExpA: /render\s*\(\)\s*\{\s*.*\s*return\s*\(\s*(.+)\s*\);*\s*\}\}/gi,
		renderDomExp: /\.renderDom\s*\(\s*\<\s*([^\>]+)\/\>,[^;]+\)/gi,
		renderObjExp: /\{\{\s*\$([^\}\s*]+)\s*\}\}/gi,
		evalHtml: function(html) {
			var _ = this;
			html = html.replace(/\s{2,}/gi, "");
			html = html.replace(_.renderExp, function(a) {
				var b = /\(\s*([^\r\n]+\s*\>)\s*\)/.exec(a);
				if (b) {
					a = a.replace(b[0], "\'" + b[1].replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"") + "\'");
				}
				return a;
			}).replace(/[\r|\n|\r\n]*/gi, "").replace(_.renderExpA, function(a, b) {
				if (b) {
					var exp = "\'" + b.replace(/\'/gi, "\\\'") + "\'";
					a = a.replace(b, exp);
				}
				return a;
			}).replace(_.renderDomExp, function(a, b) {
				if (b) {
					var k = b.split(' ');
					var c = b.replace(k[0] + " ", "").replace(/\/\>/, "");
					a = a.replace(b, k[0] + "," + (c == "" ? "undefined" : c)).replace(/\<|\/\>/gi, "");
				}
				return a;
			}).replace(_.renderObjExp, function(a, b) {
				return "\'+" + b + "+\'"
			});
			return html;
		},
		render: function(html, dom) {
			var _ = this;
			html = _.evalHtml(html);
			_.ceval(html);
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
		}
	},
	function() {
		var a = function(b) {
			return new a.fn.init(b);
		};
		a.fn = a.prototype = {
			init: function(b) {
				b && a.extend(this, b);
				this.Callbacks = [];
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

		var args = arguments,
			len = args.length,
			i;
		for (i = 0; i < len; i++) args[i](a);

		return a;
	}(function($) {
		var promise = function(callback) {
			return new promise.fn.init(callback);
		};
		promise.statusList = ["init", "exec", "success", "error", "complete"];
		promise.fn = promise.prototype = {
			init: function(callback) {
				this.status = promise.statusList[0];
				var self = this,
					resolve = function() {
						self.thenArgs = arguments;
						self.status = promise.statusList[2];
						emi.call(self, 0, self.emi);
					},
					reject = function() {
						self.catchArgs = arguments;
						self.status = promise.statusList[3];
						emi.call(self, 0, self.emi);
					};
				this.emi = [];
				this.id = "_promise_" + (Math.random(10000) + "").replace(".", "");
				this.done = function() {
					if (!self.catchArgs && self.status == promise.statusList[0]) {
						callback ? callback.call(self, resolve, reject) : emi.call(self, 0, self.emi);
						self.status = promise.statusList[1];
					} else if (!callback) {
						emi.call(self, 0, self.emi);
					}
				};
				return this;
			},
			then: function(callback) {
				this.emi.push({
					callback: callback,
					args: this.thenArgs,
					type: "then"
				});
				this.done();
				return this;
			},
			fail: function(callback) {
				this.emi.fail = {
					callback: callback,
					args: this.catchArgs
				};
				this.done();
				return this;
			},
			always: function(callback) {
				this.emi.always = {
					callback: callback,
					args: this.thenArgs || this.catchArgs
				};
				this.done();
				return this;
			}
		};
		promise.fn.init.prototype = promise.fn;
		promise.extend = function(target, args) {
			target = target || {};
			for (name in args) {
				target[name] = args[name];
			}
			return target;
		};
		promise.extend(promise.fn, {
			wait: function(ms) {
				this.emi.push({
					callback: function(callback) {
						setTimeout(function() {
							callback && callback();
						}, ms * 1000);
					},
					type: "wait"
				});
				return this;
			}
		});
		var emi = function(n, arr) {
				var self = this;
				if (this.catchArgs) {
					this.emi.fail && this.emi.fail.callback && (this.emi.fail.callback.call(this, this.catchArgs && this.catchArgs[0] || this.catchArgs), this.emi.fail = null) || console.log(this.catchArgs[0]);
					this.emi.always && this.emi.always.callback && this.emi.always.callback.call(this, this.thenArgs || this.catchArgs, this.emi.always = null);
					this.status = promise.statusList[4];
					return;
				} else if (arr.length > 0) {
					var _emi = function(n, arr) {
						if (arr.length > 0) {
							var self = this,
								item = arr[n];
							if (item.type == "wait") {
								item.callback(function() {
									arr.del(n);
									_emi.call(self, n, arr);
								});
							} else {
								try {
									item.callback && item.callback.apply(self, item.args || self.thenArgs || []);
								} catch (e) {
									console.log(e);
								} finally {
									arr.del(n);
									_emi.call(self, n, arr);
								}
							}
						} else {
							this.emi.always && this.emi.always.callback && (this.emi.always.callback.call(this, this.thenArgs || this.catchArgs), this.emi.always = null);
							this.status = promise.statusList[4];
						}
					}
					_emi.call(self, n, arr);
				}
			},
			set = function() {
				var args = arguments,
					len = args.length,
					i;
				for (i = 0; i < len; i++) this.emi.push({
					callback: function(callback) {
						return promise(function(resolve, reject) {
							if (typeof callback == "function") {
								callback && callback(resolve, reject);
							} else {
								try {
									resolve(callback);
								} catch (e) {
									reject(e.message);
								}
							}
						});
					},
					args: args[i]
				});
				return this;
			};
		var when = function() {
			var obj = (new when.fn.init());
			return set.apply(obj, arguments);
		};
		when.fn = when.prototype = {
			init: function() {
				this.emi = [];
				return this;
			}
		};
		promise.extend(when.fn, {
			done: function(callback) {
				this.emi.then = callback;
				whenEmi.call(this, "then");
				return this;
			},
			fail: function(callback) {
				this.emi.fail = callback;
				whenEmi.call(this, "fail");
				return this;
			}
		});
		var whenEmi = function(type) {
			var self = this,
				len = self.emi.length,
				i, x,
				thenLen = self.emi.then.length || 0;
			for (i = 0; i < len; i++) {
				self.emi[i].callback ? (self.emi[i] = self.emi[i].callback(self.emi[i].args), self.emi[i][type](self.emi[type])) : self.emi[i][type](self.emi[type]);
			}
		}
		when.fn.init.prototype = when.fn;
		promise.when = when;

		$.promise = promise;
	}, function($) {
		$.jsonp = function(url, data, ops) {
			if (url == "") return;
			if (!data) data = "";

			var complete = function(result, success, error) {
					if (result && result.status === 1) {
						success && success(result.data || result, result.msg || "success.", result.code || 1, result);
					} else if (result && result.status === 0) {
						error && error(result.msg || "unknown error.", result.code || 0);
					} else {
						success && success(result);
					}
				},
				fail = function(error, msg) {
					error && error(msg || "unknown error.", 0);
				},
				jsonp = function(success, error) {
					var head = document.getElementsByTagName("head")[0],
						callback = "preactjsonp_" + (Math.random(10000) + "").replace(".", "");
					while (window[callback]) {
						callback = "preactjsonp_" + (Math.random(10000) + "").replace(".", "");
					}
					window[callback] = function(data) {
						window[callback] = null;
						document.getElementById(callback).parentNode.removeChild(document.getElementById(callback));
						try {
							data = data || new Function('return ' + data)();
							console.log(callback)
							complete(data, success, error);
						} catch (e) {
							fail(error, e.message);
						}
					};
					try {
						var script = document.createElement("script");
						head.appendChild(script);
						script.timeout = setTimeout(function() {
							if (window[callback] != null) {
								window[callback] = null;
								head.removeChild(document.getElementById(callback));
								fail(error, "timeout " + callback);
							}
						}, ops && ops.timeout || 5000);
						script.id = callback;
						script.src = url + (/\?/.test(url) ? "&" : "?") + (ops && ops.callback || "callback") + "=" + callback;
						script.onload = function(a) {
							//console.log(arguments)
						};
						script.onerror = function() {
							head.removeChild(this);
							window[callback] = null;
							fail(error);
						};
					} catch (e) {
						fail(error, e.message);
					}
				};

			return {
				done: function(success, error) {
					setTimeout(function() {
						new jsonp(success, error);
					}, 500);
					return this;
				}
			}
		};
	}, function($) {
		var document = window.document,
			key,
			name,
			scriptTypeRE = /^(?:text|application)\/javascript/i,
			xmlTypeRE = /^(?:text|application)\/xml/i,
			jsonType = 'application/json',
			htmlType = 'text/html',
			blankRE = /^\s*$/

		function ajaxSuccess(data, xhr, settings) {
			var context = settings.context,
				status = 'success'
			settings.success && settings.success(data, xhr)
		}

		function ajaxError(error, type, xhr, settings) {
			var context = settings.context
			settings.error && settings.error(error, xhr)
		}

		function empty() {}

		$.ajaxSettings = {
			type: 'GET',
			success: empty,
			error: empty,
			context: null,
			global: true,
			xhr: function() {
				return new window.XMLHttpRequest()
			},
			accepts: {
				script: 'text/javascript, application/javascript, application/x-javascript',
				json: jsonType,
				xml: 'application/xml, text/xml',
				html: htmlType,
				text: 'text/plain'
			},
			crossDomain: false,
			timeout: 3000,
			processData: true,
			cache: true
		}

		function mimeToDataType(mime) {
			if (mime) mime = mime.split(';', 2)[0]
			return mime && (mime == htmlType ? 'html' :
				mime == jsonType ? 'json' :
				scriptTypeRE.test(mime) ? 'script' :
				xmlTypeRE.test(mime) && 'xml') || 'text'
		}

		function appendQuery(url, query) {
			if (query == '') return url
			return (url + '&' + query).replace(/[&?]{1,2}/, '?')
		}

		function serializeData(options) {
			if (options.processData && options.data && typeof options.data != "string")
				options.data = $.param(options.data, options.traditional)
			if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
				options.url = appendQuery(options.url, options.data), options.data = undefined
		}

		$.ajax = function(options) {
			var settings = $.extend({}, options || {})
			for (key in $.ajaxSettings)
				if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]
			if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
				RegExp.$2 != window.location.host

			if (!settings.url) settings.url = window.location.toString()
			serializeData(settings)
			if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

			var dataType = settings.dataType

			var mime = $.ajaxSettings.accepts[dataType],
				headers = {},
				setHeader = function(name, value) {
					name && (headers[name.toLowerCase()] = [name, value])
				},
				protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
				xhr = $.ajaxSettings.xhr()
			xhr.setRequestHeader = setHeader
			var nativeSetHeader = xhr.setRequestHeader,
				abortTimeout

			setHeader('X-Requested-With', 'XMLHttpRequest')
			setHeader('Accept', mime || '*/*')

			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					xhr.onreadystatechange = empty
					clearTimeout(abortTimeout)
					var result, error = false
					if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
						dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
						result = xhr.responseText

						try {
							if (dataType == 'script')(1, eval)(result)
							else if (dataType == 'xml') result = xhr.responseXML
							else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
						} catch (e) {
							error = e
						}

						if (error) ajaxError(error, 'parsererror', xhr, settings)
						else ajaxSuccess(result, xhr, settings)
					} else {
						ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings)
					}
				}
			}

			if (settings.xhrFields)
				for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

			var async = 'async' in settings ? settings.async : true
			xhr.open(settings.type, settings.url, async, settings.username, settings.password)

			for (name in headers) nativeSetHeader.apply(xhr, headers[name])

			if (settings.timeout > 0) abortTimeout = setTimeout(function() {
				xhr.onreadystatechange = empty
				xhr.abort()
				ajaxError(null, 'timeout', xhr, settings)
			}, settings.timeout)

			xhr.send(settings.data ? settings.data : null)
			return xhr
		}

		$.load = function(url, success) {
			var parts = url.split(/\s/),
				selector,
				options = {
					url: url,
					data: undefined,
					success: success,
					dataType: "html"
				},
				callback = options.success
			if (parts.length > 1) options.url = parts[0], selector = parts[1]
			options.success = function(response) {
				callback && callback(response)
			}
			$.ajax(options)
			return this
		}

		var escape = encodeURIComponent

		function serialize(params, obj, traditional, scope) {
			var type, array = $.isArray(obj),
				hash = $.isPlainObject(obj)
			$.each(obj, function(key, value) {
				type = $.type(value)
				if (scope) key = traditional ? scope :
					scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
				if (!scope && array) params.add(value.name, value.value)
				else if (type == "array" || (!traditional && type == "object"))
					serialize(params, value, traditional, key)
				else params.add(key, value)
			})
		}

		$.param = function(obj, traditional) {
			var params = []
			params.add = function(k, v) {
				this.push(escape(k) + '=' + escape(v))
			}
			serialize(params, obj, traditional)
			return params.join('&').replace(/%20/g, '+')
		}
	}));
