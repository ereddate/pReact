(function(win, map, $) {
	$.extend(Array.prototype, {
		del: function(num) {
			this.splice(num, 1);
			return this;
		},
		concatAll: function(arr) {
			var len = arr.length,
				i;
			for (i = 0; i < len; i++) this.push(arr[i]);
			return this;
		},
		replaceAll: function(from, to) {
			var len = this.length,
				i;
			for (i = 0; i < len; i++) {
				var arr = this[i];
				this[i] = arr.replace(from, to);
			}
			return this;
		}
	});
	var doc = win.document,
		is = function is(str, obj) {
			var bool = false;
			bool = _getConstructorName(obj).toLowerCase() === str.toLowerCase();
			return bool;
		},
		_getConstructorName = function(o) {
			if (o != null && o.constructor != null) {
				return Object.prototype.toString.call(o).slice(8, -1);
			} else {
				return '';
			}
		},
		_mulReplace = function(s, arr) {
			for (var i = 0; i < arr.length; i++) {
				s = s.replace(arr[i][0], arr[i][1]);
			}
			return s;
		},
		_escapeChars = function(s) {
			return _mulReplace(s, [
				[/\\/g, "\\\\"],
				[/"/g, "\\\""],
				[/\r/g, "\\r"],
				[/\n/g, "\\n"],
				[/\t/g, "\\t"]
			]);
		},
		_type = function(obj, bool) {
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
		},
		_stringify = function(obj) {
			if (obj == null) {
				return 'null';
			}
			if (obj.toJSON) {
				return obj.toJSON();
			}
			return _type(obj);
		};

	$.extend(map, {
		binds: {},
		tmplLang: {},
		tmplFilter: {},
		repeatTmpl: function(html, data) {
			var arr = [];
			var result = html.split("{{ for ");
			if (result.length >= 1) {
				$.each(result, function(i, str) {
					if (/{{\s+end\s+for\s+}}/.test(str)) {
						var o = "{{ for " + str.split(/{{\s+end\s+for\s+}}/)[0] + "{{ end for }}",
							t = o;
						str = t.replace(/{{\s+[^}]+\s+}}/gi, function(a, b) {
							if (/{{\s+for\s+/.test(a)) {
								a = a.replace("{{ for ", "var data = result, arr = [];for ").replace(" }}", "{arr.push(pReact.tmpl(_###_");
							} else if (/{{\s+end\s+for\s+}}/.test(a)) {
								a = a.replace(/{{\s+end\s+for\s+}}/, "_###_, data[i]));}return arr.join(_###__###_);");
							}
							return a;
						}).replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"").replace(/_###_/gi, "'");
						html = html.replace(o, map.ceval("return function(result){" + str + "}")(data));
					}
				});
			}
			return html;
		},
		tmpl: function(html, data) {
			if (map.isEmptyObject(data)) return html;
			map.each(data, function(name, val) {
				html = html.replace(/{{\s+[^<>,]+\s+}}/gim, function(a) {
					if ((new RegExp("{{\\s+(" + name + ")\\s+([^<>,]+\\s+)*}}")).test(a)) {
						a = a.replace(new RegExp("{{\\s+(" + name + ")\\s+([^<>,}]+\\s+)*}}"), function(a, b, c) {
							if (c) {
								var result = c.split('|')[0].split(' : ');
								a = a.replace(a, map.tmplFilter[$.trim(result[0])](val, result[1] && $.trim(result[1]).replace(/[\'\"]/gim, "") || 0));
							} else {
								a = a.replace(new RegExp("{{\\s+" + name + "\\s+}}", "gim"), val);
							}
							return a;
						});
					}
					return a;
				});
			});
			map.each(map.tmplLang, function(name, fn) {
				html = fn(html);
			});
			return html;
		}
	});
	$.tmplModel = {};
	$.tmplModel.filters = map.tmplFilter;
	$.tmplModel.langs = map.tmplLang;
	$.tmplModel.binds = map.binds;

	getElementsByClassName = function(searchClass, node, tag) {
		if (doc.getElementsByClassName) {
			var nodes = (node || doc).getElementsByClassName(searchClass),
				result = [];
			for (var i = 0; node = nodes[i++];) {
				if (tag && tag !== "*" && node.tagName === tag.toUpperCase()) {
					result.push(node)
				} else {
					result.push(node)
				}
			}
			return result
		} else {
			var result = [];
			node = node || doc;
			tag = tag || "*";
			var classes = searchClass.split(" "),
				elements = (tag && tag === "*" && node.all) ? node.all : node.getElementsByTagName(tag),
				patterns = [],
				current,
				match;
			var i = classes.length;
			while (--i >= 0) {
				patterns.push(new RegExp("(^|\s)" + classes[i] + "(\s|$)"));
			}
			var j = elements.length;
			while (--j >= 0) {
				current = elements[j];
				match = false;
				for (var k = 0, kl = patterns.length; k < kl; k++) {
					match = patterns[k].test(current.className);
					if (!match) break;
				}
				if (match) result.push(current);
			}
			return result;
		}
	}

	$.extend($, {
		jsonToArray: function(obj, fn) {
			var a = [];
			for (name in obj) {
				var result = fn(obj[name]);
				result && a.push(obj[name]);
			}
			return a;
		},
		createFilesDom: function(url, callback) {
			map.emiTypeFn.load({
				url: url,
				callback: callback
			});
			return this;
		},
		stringify: function(obj) {
			return _stringify(obj);
		},
		is: function(str, obj) {
			return is(str, obj);
		},
		tmplFilterExtend: function(filters) {
			filters && $.extend($.tmplModel.filters, filters);
			return this;
		},
		tmplLangExtend: function(langs) {
			langs && $.extend($.tmplModel.langs, langs);
			return this;
		},
		tmplBindsExtend: function(binds) {
			binds && $.extend($.tmplModel.binds, binds);
			return this;
		},
		trim: function(text) {
			var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
			return text == null ?
				"" :
				(text + "").replace(rtrim, "");
		},
		isPlainObject: function(obj) {
			var key, hasOwn = ({}).hasOwnProperty;
			if (!obj || !$.is("object", obj)) {
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
			if ($.is("array", data)) {
				html = map.repeatTmpl(html, data);
			} else if ($.is("object", data)) {
				html = map.tmpl(html, data);
			}
			return html;
		},
		sEval: function(s, ops) {
			return map.ceval(s, ops);
		},
		createClass: function() {
			var args = arguments,
				len = args.length;
			return len > 0 && $.extend({}, args[0]);
		},
		renderDom: function(html, data, parent, callback) {
			var obj = typeof html == "function" ? (new html()) : html;
			$.promise.when(function(resolve, reject) {
				if (data && "data" in data || !data && "getInitData" in obj && typeof obj.getInitData == "function") {
					var fn = (!data ? obj : data).getInitData,
						fnStr = fn.toString();
					try {
						new Function("a", "b", "(" + fnStr + ")(a, b)")(resolve, reject);
					} catch (e) {
						new Function("a", "b", "(" + fnStr.replace(/getInitData\s*\(/gi, function(a, b) {
							a = a.replace(a, "function(");
							return a;
						}) + ")(a, b)")(resolve, reject);
					}
				} else {
					resolve(data);
				}
			}).done(function(data) {
				var result = data ? $.tmpl(typeof obj == "string" ? obj : obj.render(), data) : typeof obj == "string" ? obj : obj.render();
				if (typeof html == "string") {
					parent.innerHTML = parent.innerHTML + result;
				} else {
					(result != "" || result) && parent.appendChild(map.renderHandle(result, html));
				}
				callback && callback();
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
			a = pReact.jsonToArray(a, function(obj) {
				return map.isElement(obj) ? obj : false;
			});
			for (i = 0; i <= a.length; i++) {
				var elem = a[i];
				elem && elem.type && elem.type == "text/pReact" && (html = elem.innerHTML, elem.parentNode.removeChild(elem), map.render(html));
			}
			callback && callback.call($);
			return this;
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
		done: function(callback) {
			!this.emi && (this.emi = []);
			this.emi && this.emi.push({
				type: "done",
				callback: callback
			});
			map.activeEmi(this, $);
			return this;
		}
	});
})(this, {
		emiTypeFn: {
			load: function(a, map, done) {
				var doc = document,
					type = /\.js$/.test(a.url) ? "script" : "link",
					item = doc.createElement(type);
				if (type == "script") {
					item.src = a.url;
				} else {
					item.rel = "stylesheet";
					item.href = a.url;
				}
				item.callback = a.callback;
				item.onload = item.onerror = function() {
					type == "script" && doc.body.removeChild(this), this.callback && this.callback(), map && map.obj.emi && map.obj.emi.del(a.index), done && done(0, map.obj.emi);
				};
				type == "script" ? doc.body.appendChild(item) : doc.getElementsByTagName("head")[0].appendChild(item);
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
							b = pReact.jsonToArray(b, function(obj) {
								return map.isElement(obj) ? obj : false;
							});
							for (i = 0; i <= b.length; i++) {
								var elem = b[i];
								elem && elem.type && elem.type == "text/pReact" && (html = elem.innerHTML, elem.parentNode.removeChild(elem), map.render(elem.innerHTML));
							}
							a.callback && a.callback.call($);
						} else {
							loadFile(0, $a);
						}
					});
				}
				map.preact.load && $a.length > 0 && loadFile(0, $a);
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
		ceval: function(s, ops) {
			//console.log(s)
			return new Function(ops, s)(ops);
		},
		findDom: function(a, obj) {
			var _ = this;
			if (a.children.length > 0) {
				_.each(_.binds, function(name, fn) {
					typeof fn == "function" && fn(a, obj);
					_.each(a.children, function(i, elem) {
						_.findDom(elem, obj);
					});
				});
			} else {
				//console.log(a)
				_.each(_.binds, function(name, fn) {
					typeof fn == "function" && fn(a, obj);
				});
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
		//renderExp: /return\s*\(\r*\n*\s*<.+>\s*\r*\n*\);+\r/gi,
		//renderExpA: /render\s*\(\)\s*\{\s*.*\s*return\s*\(\s*(.+)\s*\);*\s*\}\}/gi,
		renderDomExp: /\.renderDom\s*\(\s*\<\s*([^\>]+)\/\>,[^;]+\)/gi,
		renderObjExp: /\{\{\s*\$([^\}\s*]+)\s*\}\}/gi,
		evalHtml: function(html) {
			var _ = this,
				item = [],
				group = [],
				isIn = false;
			html.replace(/.+[\s\r\n]*/gi, function(a, b) {
				if (/return\s*\([\s\r\n]*/.test(a)) {
					item.push(");");
					isIn = true;
				}
				if (/^\);[\s\r\n]*/.test(a)) {
					item.length > 0 && group.push(item);
					item = [];
					isIn = false;
				}
				if (isIn) {
					item.push(a);
				}
			});
			pReact.each(group, function(i, arr) {
				arr = arr.del(0);
				arr.push(");");
				var cArr = pReact.extend([], arr);
				cArr = cArr.replaceAll(/\'/gi, "\\\'").replaceAll(/\"/gi, "\\\"");
				cArr[0] = cArr[0].replace(/\(/gi, "'");
				cArr[cArr.length - 1] = "';";
				html = html.replace(arr.join(''), cArr.join(''));
			});
			html = html.replace(/\s{2,}/gi, "").replace(/[\r|\n|\r\n]*/gi, "").replace(_.renderDomExp, function(a, b) {
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

		if (typeof define === "function" && define.amd) {
			define("preact", [], function() {
				return a;
			});
		}
		window.pReact = a;

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

		ajaxSettings = {
			type: 'GET',
			success: empty,
			error: empty,
			context: null,
			global: true,
			xhr: function() {
				return new window.XMLHttpRequest()
			},
			accepts: {
				json: jsonType,
				html: htmlType,
				text: 'text/plain'
			},
			timeout: 3000,
			processData: true,
			cache: true
		}

		function mimeToDataType(mime) {
			if (mime) mime = mime.split(';', 2)[0]
			return mime && (mime == htmlType ? 'html' :
				mime == jsonType ? 'json' : 'text')
		}

		function appendQuery(url, query) {
			if (query == '') return url
			return (url + '&' + query).replace(/[&?]{1,2}/, '?')
		}

		function serializeData(options) {
			if (options.processData && options.data && typeof options.data != "string")
				options.data = $.serialize(options.data, options.traditional)
			if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
				options.url = appendQuery(options.url, options.data), options.data = undefined
		}

		ajax = function(options) {
			var settings = $.extend({}, options || {})
			for (key in ajaxSettings)
				if (settings[key] === undefined) settings[key] = ajaxSettings[key]

			if (!settings.url) settings.url = window.location.toString()
			serializeData(settings)
			if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

			var dataType = settings.dataType

			var mime = ajaxSettings.accepts[dataType],
				headers = {},
				setHeader = function(name, value) {
					name && (headers[name.toLowerCase()] = [name, value])
				},
				protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
				xhr = ajaxSettings.xhr()
			xhr.setRequestHeader = setHeader
			var nativeSetHeader = xhr.setRequestHeader,
				abortTimeout;

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
							if (dataType == 'json') result = blankRE.test(result) ? null : $.sEval("return " + result)();
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

		$.load = function(url, success, type) {
			var parts = url.split(/\s/),
				selector,
				options = {
					url: url,
					data: undefined,
					success: success,
					dataType: type || "html"
				},
				callback = options.success
			if (parts.length > 1) options.url = parts[0], selector = parts[1]
			options.success = function(response) {
				callback && callback(response)
			}
			ajax(options);
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

		$.serialize = function(obj, traditional) {
			var params = []
			params.add = function(k, v) {
				this.push(escape(k) + '=' + escape(v))
			}
			serialize(params, obj, traditional)
			return params.join('&').replace(/%20/g, '+')
		}
	}));
