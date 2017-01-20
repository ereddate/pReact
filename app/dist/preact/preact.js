/*!
 * pReact & pjs template v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/pReact
 */
(function(win, $, define) {
	$ = $();
	define = define($);

	define("pReact", [], function() {
		return $;
	});

	win.pReact = $;
	win.define = define;

})(this,
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
		var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
		a.extend(a, {
			isEmpty: function(v) {
				var a = function(e) {
					var t;
					for (t in e) return !1;
					return !0
				};
				return typeof v == "undefined" || v == null || typeof v == "string" && trim(v) == "" || isArray(v) && v.length == 0 || typeof v == "object" && a(v) ? true : false;
			},
			trim: function(text) {
				return text == null ?
					"" :
					(text + "").replace(rtrim, "");
			},
			each: function(a, b, c) {
				var d, e = 0,
					f = a.length,
					g = this.isArray(a);
				if (c) {
					if (g) {
						for (; f > e; e++)
							if (d = b.apply(a[e], c), d === !1) break
					} else
						for (e in a)
							if (d = b.apply(a[e], c), d === !1) break
				} else if (g) {
					for (; f > e; e++)
						if (d = b.call(a[e], e, a[e]), d === !1) break
				} else
					for (e in a)
						if (d = b.call(a[e], e, a[e]), d === !1) break;
				return a
			},
			isArray: function(a) {
				if (!a) return false;
				var b = "length" in a && a.length,
					c = (typeof a).toLowerCase();
				return "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a
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
		});
		/*var args = arguments,
			len = args.length,
			i;
		for (i = 0; i < len; i++) args[i](a);*/

		return a;
	},
	function($) {
		var define = function() {
			var args = arguments,
				len = args.length,
				name, dependencies, factory;
			if (len == 1) {
				factory = args[0];
			} else if (len == 2) {
				name = args[0], factory = args[1];
			} else if (len == 3) {
				name = args[0], dependencies = args[1], factory = args[2];
			}

			_analyDefine((!name && ("model_" + Math.random()) || name), dependencies, factory);
			return this;
		};
		define.amd = {};

		var model = function() {
			return new model.fn.init();
		};

		var createElement = function(url, complete, i) {
			var callback;
			var script = document.createElement(/\.js/.test(url) && "script" || "link");
			if (/\.js/.test(url)) {
				script.charset = "utf-8";
				script.src = url;
			} else if (/\.css/.test(url)) {
				script.rel = "stylesheet";
				script.href = url;
			}
			script.id = "defineUse_" + i;
			script.onload = (callback = function(evt) {
				/\.js/.test(url) && document.head.removeChild(this);
				callback = null;
				complete(this);
			});
			script.onerror = callback;
			document.head.appendChild(script);
		}

		model.fn = model.prototype = {
			init: function() {
				define.amd = {};
				return this;
			},
			use: function(name, complete) {
				var result;
				if (isArray(name) || typeof name == "string" && name.split(' ').length > 1) {
					result = {};
					if (typeof name == "string") name = name.split(' ');
					$.each(name, function(i, str) {
						if (name in define.amd)(result[str] = _require(str), complete && complete(result));
						else {
							createElement(str, function(elem) {
								if (parseInt(elem.id.replace("defineUse_", "")) >= name.length - 1) {
									complete({});
								}
							}, i);
						}
					});
				} else {
					if (name in define.amd)(result = _require(name), complete && complete(result));
					else {
						createElement(str, function(elem) {
							complete({});
						}, i);
					}
				}

				return this;
			}
		};

		model.fn.init.prototype = model.fn;

		define.require = model();

		function _analyRequire(func) {
			var funContext = func.toString(),
				fixContext = $.trim(funContext.replace(/(\r|\n)/gi, ""));
			var require = []
			fixContext.replace(/\s*require\s*\(\s*[\"|\'](.+?)[\"|\']\s*\)\s*/gi, function(a, b) {
				require.push(b);
			});
			return {
				dependencies: require
			};
		}

		function _require(name) {
			var require = define.require,
				options = define.amd[name] || false,
				result;
			if (name && options) {
				if (options.status == 3) {
					result = typeof options.exports == "function" && options.exports || options.exports;
				} else if (options.status < 3 && options.status > 0) {
					result = _exec(options);
				}
			}
			return result;
		}

		function _exec(options) {
			var _exprots = {},
				module = {
					exports: {}
				},
				than, result;
			if (options.status == 2) {
				$.each(options.dependencies, function(i, name) {
					_require(name);
				});
			}
			try {
				result = options.factory(_require, _exprots, module),
					than = result || _exprots || "exprots" in module && module.exports,
					options.exports = than,
					options.status = STATUS.executed;
			} catch (e) {
				options.exports = {},
					options.status = STATUS.error;
			}
			return result;
		}

		var STATUS = {
			loaded: 1,
			readed: 2,
			executed: 3,
			error: 4
		};

		function _analyDefine(name, dependencies, factory) {
			var options = {
				name: (!name && ("model_" + Math.random()) || name),
				dependencies: dependencies,
				factory: factory,
				exports: {},
				status: $.isArray(dependencies) || typeof dependencies != "undefined" ? STATUS.readed : STATUS.loaded
			};
			var ops = _analyRequire(factory);
			options = $.extend(options, ops);

			define.amd[options.name] = options;

			_exec(options);
		}

		return define;
	});

pReact && define && (define("promise", ["pReact"], function() {
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
	pReact.extend(promise.fn, {
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
	pReact.extend(when.fn, {
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

	pReact.promise = promise;
}), define("jsonp", ["pReact"], function() {
	pReact.jsonp = function(url, data, ops) {
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
}), define("ajax", ["pReact"], function() {
	var $ = pReact;
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

	var ajax = function(options) {
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
}), define("map", function() {
	return {
		createDom: function(a, url, done) {
			var map = this;
			var doc = document,
				type = /\.js$/.test(url) ? "script" : "link",
				item = doc.createElement(type);
			if (type == "script") {
				item.src = url;
			} else {
				item.rel = "stylesheet";
				item.href = url;
			}
			item.callback = a.callback;
			item.onload = item.onerror = function() {
				type == "script" && doc.body.removeChild(this), this.callback && this.callback(), map && map.obj.emi && map.obj.emi.del(a.index), done && done(0, map.obj.emi);
			};
			type == "script" ? doc.body.appendChild(item) : doc.getElementsByTagName("head")[0].appendChild(item);
		},
		emiTypeFn: {
			load: function(a, map, done) {
				var urls = typeof a.url == "string" ? a.url.split(' ') : a.url && "length" in a.url && a.url;
				if (urls.length === 1) {
					map.createDom(a, urls[0], done);
				} else if (urls.length > 1) {
					pReact.each(urls, function(i, url) {
						map.createDom.call(map, a, url, done);
					});
				}
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
								return pReact.isElement(obj) ? obj : false;
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
				pReact.each(_.binds, function(name, fn) {
					typeof fn == "function" && fn(a, obj);
					pReact.each(a.children, function(i, elem) {
						_.findDom(elem, obj);
					});
				});
			} else {
				//console.log(a)
				pReact.each(_.binds, function(name, fn) {
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
				//console.log(a)
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
			html = html.replace(/\s{2,}/gi, "").replace(/[\r\n]*/gi, "").replace(_.renderDomExp, function(a, b) {
				if (b) {
					var k = b.split(' ');
					var c = b.replace(k[0] + " ", "").replace(/\/\>/, "");
					a = a.replace(b, "lookName(pReact.extend((!pReact.Class['" + k[0] + "'] && (pReact.Class['" + k[0] + "']={}) || pReact.Class['" + k[0] + "']), " + k[0] + "), " + k[0] + ")," + (c == "" ? "undefined" : c)).replace(/\<|\/\>/gi, "");
				}
				return a;
			}).replace(_.renderObjExp, function(a, b) {
				return "\'+" + b + "+\'"
			});
			//console.log(html)
			return html;
		},
		render: function(html, dom) {
			var _ = this;
			!pReact.Class && (pReact.Class = {});
			html = "function lookName(obj, name){return name;}" + (_.evalHtml(html));
			_.ceval(html);
		}
	};
}), define(function(require, exports, module) {
	var map = require("map"),
		$ = pReact = require("pReact"),
		win = window;
	require("promise");
	require("jsonp");
	require("ajax");

	$.extend(Array.prototype, {
		del: function(num) {
			typeof num != "undefined" && this.splice(num, 1) || (this.length = 0);
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
		tmpl: function(html, data) {
			if (pReact.isEmptyObject(data)) return html;
			pReact.each(data, function(name, val) {
				html = html.replace(/{{\s+[^<>}{,]+\s+}}/gim, function(a) {
					if ((new RegExp("{{\\s+(" + name + ")\\s+([^<>,]+\\s+)*}}")).test(a)) {
						a = a.replace(new RegExp("{{\\s+(" + name + ")\\s+([^<>,}]+\\s+)*}}"), function(a, b, c) {
							if (c) {
								var result = c.split('|')[1].split(' : ');
								a = a.replace(a, map.tmplFilter[$.trim(result[0])](val, result[1] && $.trim(result[1]).replace(/[\'\"]/gim, "") || 0));
							} else {
								a = a.replace(new RegExp("{{\\s+" + name + "\\s+}}", "gim"), val);
							}
							return a;
						});
					} else if (/[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+/.test(a) && !/this\.|this\[/.test(a) && !/{{\s+\$/.test(a)) {
						var x = /([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/.exec(a);
						if (x) {
							a = a.replace(new RegExp("{{\\s+(" + x[1] + "\\." + name + ")\\s+([^<>,}]+\\s+)*}}"), function(a, b, c) {
								if (c) {
									var result = c.split('|')[1].split(' : ');
									a = a.replace(a, map.tmplFilter[$.trim(data[name])](val, result[1] && $.trim(result[1]).replace(/[\'\"]/gim, "") || 0));
								} else {
									a = a.replace(new RegExp("{{\\s+" + x[1] + "\\." + name + "\\s+}}", "gim"), val);
								}
								return a;
							});
						}
					}
					return a;
				});
			});
			html = html.replace(/{{\s+[^<>}{,]+\s+}}/gim, function(a) {
				a = a.replace(new RegExp("{{\\s+(.+)\\s+([^<>,}]+\\s+)*}}"), function(a, b, c) {
					if (b) {
						b = b.split(' | ');
						if (b.length > 1) {
							var c = b[1].split(' : ');
							a = a.replace(a, map.tmplFilter[c[0]](b[0], c[1]));
						}
					}
					return a;
				});
				return a;
			});
			return html;
		}
	});
	$.tmplModel = {};
	$.tmplModel.filters = map.tmplFilter;
	$.tmplModel.langs = map.tmplLang;
	$.tmplModel.binds = map.binds;

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
			html = map.tmpl(html, data);
			pReact.each(map.tmplLang, function(name, fn) {
				html = fn(html, data);
			});
			return html;
		},
		sEval: function(s, ops) {
			return map.ceval(s, ops);
		},
		createClass: function() {
			var args = arguments,
				len = args.length;
			return len === 1 ? $.extend({}, args[0]) : len > 1 && (!this.Class && (this.Class = {}), (this.Class[args[0]] = $.extend({}, args[1])));
		},
		renderDom: function(html, data, parent, callback) {
			var obj = typeof html == "function" ? (new html()) : html;
			if (data) obj.state = !obj.state ? pReact.extend({}, data) : pReact.extend(obj.state, data);
			$.promise.when(function(resolve, reject) {
				if ("getInitData" in obj && typeof obj.getInitData == "function" || data && "data" in data) {
					var fn = (data && "getInitData" in data ? data : obj).getInitData,
						fnStr = fn.toString();
					try {
						new Function("a", "b", "c", "(" + fnStr + ").call(a, b, c)")(obj, resolve, reject);
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
		ready: function(callback) {
			var a = doc.getElementsByTagName('script'),
				i, html;
			a = pReact.jsonToArray(a, function(obj) {
				return pReact.isElement(obj) ? obj : false;
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
}));/*!
 * pReact & pjs template v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/pReact
 */
(function(root, factory) {
  var jqlite = factory(root);

  if (typeof pReact === 'function') {
    pReact.jq = jqlite;
    if (typeof define === 'function' && define.amd) {
      define('pReact.jq', function() {
        return pReact.jq;
      });
    }
  }

})(this, function(root, isNodejs) {
  'use strict';

  function _isType(type) {
    return function(o) {
      return (typeof o === type);
    };
  }

  function _instanceOf(_constructor) {
    return function(o) {
      return (o instanceof _constructor);
    };
  }

  var _isObject = _isType('object'),
    _isFunction = _isType('function'),
    _isString = _isType('string'),
    _isNumber = _isType('number'),
    _isBoolean = _isType('boolean'),
    _isArray = Array.isArray || _instanceOf(Array),
    _isDate = _instanceOf(Date),
    _isRegExp = _instanceOf(RegExp),
    _isElement = function(o) {
      return o && o.nodeType === 1;
    },
    _find = function(list, iteratee) {
      if (!(iteratee instanceof Function)) {
        var value = iteratee;
        iteratee = function(item) {
          return item === value;
        };
      }

      for (var i = 0, n = list.length; i < n; i++) {
        if (iteratee(list[i])) {
          return {
            index: i,
            found: list[i]
          };
        }
      }

      return {
        index: -1
      };
    };

  var arrayShift = Array.prototype.shift;

  function _merge() {
    var dest = arrayShift.call(arguments),
      src = arrayShift.call(arguments),
      key;

    while (src) {

      if (typeof dest !== typeof src) {
        dest = _isArray(src) ? [] : (_isObject(src) ? {} : src);
      }

      if (_isObject(src)) {

        for (key in src) {
          if (src[key] !== undefined) {
            if (typeof dest[key] !== typeof src[key]) {
              dest[key] = _merge(undefined, src[key]);
            } else if (_isArray(dest[key])) {
              [].push.apply(dest[key], src[key]);
            } else if (_isObject(dest[key])) {
              dest[key] = _merge(dest[key], src[key]);
            } else {
              dest[key] = src[key];
            }
          }
        }
      }
      src = arrayShift.call(arguments);
    }

    return dest;
  }

  function _extend() {
    var dest = arrayShift.call(arguments),
      src = arrayShift.call(arguments),
      key;

    while (src) {
      for (key in src) {
        dest[key] = src[key];
      }
      src = arrayShift.call(arguments);
    }

    return dest;
  }

  if (!Element.prototype.matchesSelector) {
    Element.prototype.matchesSelector = (
      Element.prototype.webkitMatchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector
    );
  }

  function stopEvent(e) {
    if (e) e.stopped = true;
    if (e && e.preventDefault) e.preventDefault();
    else if (window.event && window.event.returnValue) window.eventReturnValue = false;
  }

  var triggerEvent = document.createEvent ? function(element, eventName, args, data) {
    var event = document.createEvent("HTMLEvents");
    event.data = data;
    event.args = args;
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
    return event;
  } : function(element, eventName, args, data) {
    var event = document.createEventObject();
    event.data = data;
    event.args = args;
    element.fireEvent("on" + eventName, event);
    return event;
  };

  var RE_HAS_SPACES = /\s/,
    RE_ONLY_LETTERS = /^[a-zA-Z]+$/,
    RE_IS_ID = /^\#[^\.\[]/,
    RE_IS_CLASS = /^\.[^#\[]/,
    runScripts = eval,
    noop = function noop() {},
    auxArray = [],
    auxDiv = document.createElement('div'),
    detached = document.createElement('div'),
    classListEnabled = !!auxDiv.classList;

  // Events support

  if (!auxDiv.addEventListener && !document.body.attachEvent) {
    throw 'Browser not compatible with element events';
  }

  var _attachElementListener = auxDiv.addEventListener ? function(element, eventName, listener) {
      return element.addEventListener(eventName, listener, false);
    } : function(element, eventName, listener) {
      return element.attachEvent('on' + eventName, listener);
    },
    _detachElementListener = auxDiv.removeEventListener ? function(element, eventName, listener) {
      return element.removeEventListener(eventName, listener, false);
    } : function(element, eventName, listener) {
      return element.detachEvent('on' + eventName, listener);
    };

  function detachElementListener(element, eventName, srcListener) {

    if (srcListener === undefined) {
      if (element.$$jqListeners && element.$$jqListeners[eventName]) {
        for (var i = 0, n = element.$$jqListeners[eventName].length; i < n; i++) {
          _detachElementListener(element, eventName, element.$$jqListeners[eventName][i]);
        }
        element.$$jqListeners[eventName] = [];
      }
      return;
    }

    if (element.$$jqListeners && element.$$jqListeners[eventName]) {
      var _listener = _find(element.$$jqListeners[eventName], function(l) {
        return l.srcListener === srcListener;
      });

      if (_listener.found) {
        element.$$jqListeners[eventName].splice(_listener.index, 1);
        _detachElementListener(element, eventName, _listener.found);
      }
    }
  }

  function attachElementListener(element, eventName, listener, once) {

    var _listener = once ? function(e) {
      listener.apply(element, [e].concat(e.args));
      detachElementListener(element, eventName, listener);
    } : function(e) {
      listener.apply(element, [e].concat(e.args));
    };

    _listener.srcListener = listener;

    element.$$jqListeners = element.$$jqListeners || {};
    element.$$jqListeners[eventName] = element.$$jqListeners[eventName] || [];

    element.$$jqListeners[eventName].push(_listener);

    _attachElementListener(element, eventName, _listener);
  }

  // jqlite function

  function pushMatches(list, matches) {
    for (var i = 0, len = matches.length; i < len; i++) {
      list[i] = matches[i];
    }
    list.length += len;
    return list;
  }

  var RE_TAG = /^[a-z-_]$/i;

  function stringMatches(selector, element) {
    var char0 = selector[0];

    if (char0 === '<') {
      auxDiv.innerHTML = selector;
      var jChildren = pushMatches(new ListDOM(), auxDiv.children);
      return jChildren;
    } else if (selector.indexOf(' ') !== -1 || selector.indexOf(':') !== -1) {
      return pushMatches(new ListDOM(), element.querySelectorAll(selector));
    } else if (char0 === '#') {
      var found = element.getElementById(selector.substr(1));
      if (found) {
        var listdom = new ListDOM();
        listdom[0] = found;
        listdom.length = 1;
        return listdom;
      } else {
        return pushMatches(new ListDOM(), element.querySelectorAll(selector));
      }
    } else if (char0 === '.') {
      return pushMatches(new ListDOM(), element.getElementsByClassName(selector.substr(1)));
    } else if (RE_TAG.test(selector)) {
      // console.log(document.getElementsByTagName(selector), element.getElementsByTagName(selector).length);
      return pushMatches(new ListDOM(), element.getElementsByTagName(selector));
    }
    return pushMatches(new ListDOM(), element.querySelectorAll(selector));
  }

  function initList(selector) {

    if (selector instanceof ListDOM) {
      return selector;
    } else if (_isArray(selector) || selector instanceof NodeList || selector instanceof HTMLCollection) {
      return pushMatches(new ListDOM(), selector);
    } else if (selector === window || selector === document || selector instanceof HTMLElement || selector instanceof Element || _isElement(selector)) {
      var list2 = new ListDOM();
      list2[0] = selector;
      list2.length = 1;
      return list2;

    } else if (_isFunction(selector)) {
      ready(selector);
    } else if (selector === undefined) {
      return new ListDOM();
    }
  }

  function jqlite(selector, element) {
    if (_isString(selector)) {
      return stringMatches(selector, element || document);
    }
    return initList(selector);
  }

  jqlite.noop = noop;

  jqlite.extend = function(deep) {
    var args = [].slice.call(arguments);
    if (_isBoolean(deep)) {
      args.shift();
    } else {
      deep = false;
    }
    if (deep) {
      _merge.apply(null, args);
    } else {
      _extend.apply(null, args);
    }
  };

  jqlite.isObject = _isObject;
  jqlite.isFunction = _isFunction;
  jqlite.isString = _isString;
  jqlite.isNumber = _isNumber;
  jqlite.isBoolean = _isBoolean;
  jqlite.isArray = _isArray;
  jqlite.isDate = _isDate;
  jqlite.isRegExp = _isRegExp;
  jqlite.isElement = _isElement;

  var $ = jqlite;

  // document ready

  var _onLoad = window.addEventListener ? function(listener) {
    window.addEventListener('load', listener, false);
  } : function(listener) {
    window.attachEvent('onload', listener);
  };

  function ready(callback) {
    if (_isFunction(callback)) {
      if (/loaded|complete/.test(document.readyState)) {
        callback();
      } else {
        _onLoad(callback);
      }
    }
  }

  jqlite.ready = ready;

  // ListDOM

  function ListDOM() {}

  ListDOM.prototype = [];
  ListDOM.prototype.ready = ready;
  ListDOM.prototype.extend = function(deep) {
    var args = [].slice.call(arguments);
    if (_isBoolean(deep)) {
      args.shift();
    } else {
      deep = false;
    }
    if (deep) {
      _merge.apply(null, [ListDOM.prototype].concat(args));
    } else {
      _extend.apply(null, [ListDOM.prototype].concat(args));
    }
  };

  jqlite.fn = ListDOM.prototype;

  function filterDuplicated(list) {
    if (list.length <= 1) {
      return list;
    }

    var filteredList = list.filter(function() {
      if (this.___found___) {
        return false;
      }
      this.___found___ = true;
      return true;
    });

    for (var i = 0, len = filteredList.length; i < len; i++) {
      delete filteredList[i].___found___;
    }
    return filteredList;
  }

  ListDOM.prototype.get = function(pos) {
    return pos ? this[pos] : this;
  };

  ListDOM.prototype.eq = function(pos) {
    if (!_isNumber(pos)) {
      throw 'number required';
    }
    var item = (pos < 0) ? this[this.length - pos] : this[pos],
      list = new ListDOM();

    if (item) {
      list[0] = item;
      list.length = 1;
    }
    return list;
  };

  ListDOM.prototype.first = function() {
    var list = new ListDOM();

    if (this.length) {
      list[0] = this[0];
      list.length = 1;
    }
    return list;
  };

  ListDOM.prototype.last = function() {
    var list = new ListDOM();

    if (this.length) {
      list[0] = this[this.length - 1];
      list.length = 1;
    }
    return list;
  };

  ListDOM.prototype.find = function(selector) {
    var list = this,
      elems = new ListDOM(),
      n = 0,
      i, j, len, len2, found;

    if (!selector) {
      return list;
    }

    if (/^\s*>/.test(selector)) {
      selector = selector.replace(/^\s*>\s*([^\s]*)\s*/, function(match, selector2) {
        list = list.children(selector2);
        return '';
      });
    }

    for (i = 0, len = list.length; i < len; i++) {
      found = list[i].querySelectorAll(selector);
      for (j = 0, len2 = found.length; j < len2; j++) {
        elems[n++] = found[j];
      }
    }
    elems.length = n;

    return filterDuplicated(elems);
  };


  ListDOM.prototype.$ = ListDOM.prototype.find;

  ListDOM.prototype.add = function(selector, element) {
    var el2add = jqlite(selector, element),
      i, len, n = this.length,
      elems = new ListDOM();

    for (i = 0, len = this.length; i < len; i++) {
      elems[i] = this[i];
    }

    for (i = 0, len = el2add.length; i < len; i++) {
      elems[n++] = el2add[i];
    }
    elems.length = n;

    return filterDuplicated(elems);
  };

  ListDOM.prototype.each = function(each) {
    if (_isFunction(each)) {
      for (var i = 0, len = this.length, elem; i < len; i++) {
        each.call(this[i], i, this[i]);
      }
    }
    return this;
  };

  ListDOM.prototype.empty = function() {
    for (var i = 0, len = this.length, elem, child; i < len; i++) {
      elem = this[i];
      child = elem.firstChild;
      while (child) {
        elem.removeChild(child);
        child = elem.firstChild;
      }
    }
    return this;
  };

  ListDOM.prototype.filter = function(selector) {
    var elems = new ListDOM(),
      elem, i, len;

    if (_isFunction(selector)) {
      for (i = 0, len = this.length, elem; i < len; i++) {
        elem = this[i];
        if (selector.call(elem, i, elem)) {
          elems.push(elem);
        }
      }
    } else if (_isString(selector)) {
      for (i = 0, len = this.length, elem; i < len; i++) {
        elem = this[i];
        if (Element.prototype.matchesSelector.call(elem, selector)) {
          elems.push(elem);
        }
      }
    }
    return elems;
  };

  var _getClosest = auxDiv.closest ? function(element, selector) {
    return element.closest(selector);
  } : function(element, selector) {
    var elem = element.parentElement;

    while (elem) {
      if (elem.matchesSelector(selector)) {
        return elem;
      }
      elem = elem.parentElement;
    }
    return null;
  };

  ListDOM.prototype.closest = function(selector) {
    var elems = new ListDOM(),
      n = 0,
      elem;

    if (!selector) {
      return this;
    }

    for (var i = 0, len = this.length; i < len; i++) {
      elem = _getClosest(this[i], selector);
      if (elem) {
        elems[n++] = elem;
      }
    }
    elems.length = n;

    return filterDuplicated(elems);
  };

  ListDOM.prototype.children = auxDiv.children ? function(selector) {
    var elems = new ListDOM();

    for (var i = 0, len = this.length; i < len; i++) {
      pushMatches(elems, this[i].children);
    }

    return selector ? elems.filter(selector) : elems;

  } : function(selector) {
    var elems = new ListDOM(),
      elem;

    Array.prototype.forEach.call(this, function(elem) {
      elem = elem.firstElementChild || elem.firstChild;
      while (elem) {
        elems[elems.length] = elem;
        elem = elem.nextElementSibling || elem.nextSibling;
      }
    });

    return selector ? elems.filter(selector) : elems;
  };

  ListDOM.prototype.parent = function(selector) {
    var list = new ListDOM(),
      n = 0;

    for (var i = 0, len = this.length; i < len; i++) {
      if (this[i].parentElement) {
        list[n++] = this[i].parentElement;
      }
    }
    list.length = n;

    return filterDuplicated(selector ? list.filter(selector) : list);
  };

  ListDOM.prototype.contents = function(selector) {
    var elems = new ListDOM(),
      elem;

    Array.prototype.forEach.call(this, function(elem) {
      elem = elem.firstChild;
      while (elem) {
        elems[elems.length] = elem;
        elem = elem.nextSibling;
      }
    });

    return selector ? elems.filter(selector) : elems;
  };

  // function _cloneEvents(nodeSrc, nodeDest) {
  //   console.log('getEventListeners', getEventListeners);
  //   var events = getEventListeners(nodeSrc),
  //       e, i, len;

  //   for( e in events ) {
  //     for( i = 0, len = events[e].length; i < len ; i++ ) {
  //       nodeDest.addEventListener(e, events[e][i].listener, events[e][i].useCapture);
  //     }
  //   }
  // }

  ListDOM.prototype.clone = function(deep, cloneEvents) {
    var elems = new ListDOM(),
      i, len;
    deep = deep === undefined || deep;

    for (i = 0, len = this.length; i < len; i++) {
      elems[i] = this[i].cloneNode(deep);

      // if(cloneEvents) {
      //   _cloneEvents(this[i], list[i]);
      // }
    }

    elems.length = len;
    return elems;
  };

  ListDOM.prototype.data = function(key, value) {
    if (!this.length) {
      return value ? this : undefined;
    }

    if (value === undefined) {
      var data = this[0].$$jqliteData && this[0].$$jqliteData[key];
      if (data === undefined) {
        data = this.dataset(key);
        if (data === undefined) {
          return undefined;
        } else if (data.charAt(0) === '{' || data.charAt(0) === '[') {
          return JSON.parse(data);
        } else if (/^\d+$/.test(data)) {
          return Number(data);
        } else {
          return data;
        }
      }
      return data;
    }

    for (var i = 0, n = this.length; i < n; i++) {
      this[i].$$jqliteData = this[i].$$jqliteData || {};
      this[i].$$jqliteData[key] = value;
    }
  };

  ListDOM.prototype.removeData = function(key) {
    for (var i = 0, n = this.length; i < n; i++) {
      if (this[i].$$jqliteData && this[i].$$jqliteData[key]) {
        delete this[i].$$jqliteData[key];
      }
    }
    return this;
  };

  ListDOM.prototype.dataset = auxDiv.dataset ? function(key, value) {
    var i, len;

    if (value === undefined) {
      if (key === undefined) {
        return this[0] ? this[0].dataset : {};
      } else {
        return (this[0] || {}).dataset[key];
      }
    } else {
      for (i = 0, len = this.length; i < len; i++) {
        this[i].dataset[key] = value;
      }
      return this;
    }
  } : function(key, value) {
    var i, len;
    if (value === undefined) {
      var values = [];
      for (i = 0, len = this.length; i < len; i++) {
        values.push(this[i].getAttribute('data-' + key));
      }
      return (this[0] || {
        getAttribute: function() {
          return false;
        }
      }).getAttribute(key);
    } else {
      for (i = 0, len = this.length; i < len; i++) {
        this[i].setAttribute('data-' + key, value);
      }
    }
  };

  ListDOM.prototype.removeDataset = auxDiv.dataset ? function(key) {
    var i, len;
    if (typeof key === 'string') {
      for (i = 0, len = this.length; i < len; i++) {
        delete this[i].dataset[key];
      }
    } else if (_isArray(key)) {
      for (i = 0, len = key.length; i < len; i++) {
        this.removeData(key[i]);
      }
    }
    return this;
  } : function(key) {
    var i, len;
    if (typeof key === 'string') {
      for (i = 0, len = this.length; i < len; i++) {
        this[i].removeAttribute('data-' + key);
      }
    } else if (_isArray(key)) {
      for (i = 0, len = key.length; i < len; i++) {
        this.removeData(key[i]);
      }
    }
    return this;
  };

  ListDOM.prototype.attr = function(key, value) {
    var args = arguments,
      argsLen = args.length;
    if (argsLen > 1) {
      var i, len;
      if (_isFunction(value)) {
        for (i = 0, len = this.length; i < len; i++) {
          this[i].setAttribute(key, value(i, this[i].getAttribute(key)));
        }
      } else if (value !== undefined) {
        for (i = 0, len = this.length; i < len; i++) {
          this[i].setAttribute(key, value);
        }
      } else if (this[0]) {
        return this[0].getAttribute(key);
      }
    }else if (argsLen === 1 && _isObject(args[0])){
      for (name in args[0]){
        for (i = 0, len = this.length; i < len; i++) {
          this[i].setAttribute(name, args[0][name]);
        }
      }
    }else if (argsLen === 1 && typeof args[0] == "string"){
      return this[0].getAttribute(args[0]);
    }
    return this;
  };

  ListDOM.prototype.removeAttr = function(key) {
    for (var i = 0, len = this.length; i < len; i++) {
      this[i].removeAttribute(key);
    }
    return this;
  };

  ListDOM.prototype.prop = function(key, value) {
    var i, len;

    if (_isFunction(value)) {
      for (i = 0, len = this.length; i < len; i++) {
        this[i][key] = value(i, this[i][key]);
      }
    } else if (value !== undefined) {
      for (i = 0, len = this.length; i < len; i++) {
        this[i][key] = value;
      }
    } else if (this[0]) {
      return this[0][key];
    }
    return this;
  };

  ListDOM.prototype.val = function(value) {
    var element;
    if (value === undefined) {
      element = this[0];
      if (element.nodeName === 'select') {
        return element.options[element.selectedIndex].value;
      } else {
        return (this[0].value || this[0].getAttribute('value'));
      }
    } else {
      for (var i = 0, len = this.length; i < len; i++) {
        if (this[i].nodeName === 'select') {
          element = this[i];
          for (var j = 0, len2 = element.options.length; j < len2; j++) {
            if (element.options[j].value === value) {
              element.options[j].selected = true;
              break;
            }
          }
        } else if (this[i].value !== undefined) {
          this[i].value = value;
        } else {
          this[i].setAttribute('value', value);
        }
      }
    }
    return this;
  };

  var REclassListFallback = {
      has: {},
      rm: {}
    },
    classListHas = classListEnabled ? function(el, className) {
      return el.classList.contains(className);
    } : function(el, className) {
      if (!REclassListFallback.has[className]) {
        REclassListFallback.has[className] = new RegExp('\\b' + (className || '') + '\\b', '');
      }
      return REclassListFallback.has[className].test(el.className);
    },
    classListAdd = classListEnabled ? function(el, className) {
      el.classList.add(className);
    } : function(el, className) {
      if (!classListMethods.has(el, className)) {
        el.className += ' ' + className;
      }
    },
    classListRemove = classListEnabled ? function(el, className) {
      el.classList && el.classList.remove(className);
    } : function(el, className) {
      if (!REclassListFallback.rm[className]) {
        REclassListFallback.rm[className] = new RegExp('\\s*' + className + '\\s*', 'g');
      }
      el.className = el.className.replace(REclassListFallback.rm[className], ' ');
    };

  ListDOM.prototype.addClass = function(className) {
    var i, n;

    if (className instanceof Function) {
      for (i = 0, n = this.length; i < n; i++) {
        classListAdd(this[i], className.call(this[i], i, this[i].className));
      }
    } else if (className.indexOf(' ') >= 0) {
      className.split(/\s+/).forEach(function(_className) {
        for (var i = 0, n = this.length; i < n; i++) {
          classListAdd(this[i], _className);
        }
      }.bind(this));
    } else {
      for (i = 0, n = this.length; i < n; i++) {
        classListAdd(this[i], className);
      }
    }

    return this;
  };

  ListDOM.prototype.removeClass = function(className) {
    var i, n;
    if (className instanceof Function) {
      for (i = 0, n = this.length; i < n; i++) {
        classListRemove(this[i], className.call(this[i], i, this[i].className));
      }
    } else if (className.indexOf(' ') >= 0) {
      className.split(/\s+/).forEach(function(_className) {
        for (var i = 0, n = this.length; i < n; i++) {
          classListRemove(this[i], _className);
        }
      }.bind(this));
    } else {
      for (i = 0, n = this.length; i < n; i++) {
        classListRemove(this[i], className);
      }
    }
    return this;
  };

  ListDOM.prototype.hasClass = function(className) {
    for (var i = 0, n = this.length; i < n; i++) {
      if (classListHas(this[i], className)) {
        return true;
      }
    }
    return false;
  };

  ListDOM.prototype.toggleClass = function(className, state) {
    var i, n, _state, _className;

    if (className instanceof Function) {

      for (i = 0, n = this.length; i < n; i++) {
        _className = className.call(this[i], i, this[i].className, state);
        _state = state === undefined ? !classListHas(this[i], _className) : state;
        (_state ? classListAdd : classListRemove)(this[i], _className);
      }

    } else if (className.indexOf(' ') >= 0) {

      className.split(/\s+/).forEach(function(_className) {
        for (i = 0, n = this.length; i < n; i++) {
          _state = state === undefined ? !classListHas(this[i], _className) : state;
          (_state ? classListAdd : classListRemove)(this[i], _className);
        }
      }.bind(this));

    } else {
      for (i = 0, n = this.length; i < n; i++) {
        _state = state === undefined ? !classListHas(this[i], className) : state;
        (_state ? classListAdd : classListRemove)(this[i], className);
      }
    }


    return this;
  };

  ListDOM.prototype.append = function(content) {
    var jContent = $(content),
      jContent2, i, j, len, len2, element;

    jContent.remove();

    for (i = 0, len = this.length; i < len; i++) {
      jContent2 = (i ? jContent.clone(true) : jContent);
      element = this[i];
      for (j = 0, len2 = jContent2.length; j < len2; j++) {
        element.appendChild(jContent2[j]);
      }
    }

    return this;
  };

  ListDOM.prototype.appendTo = function(target) {
    $(target).append(this);
  };

  ListDOM.prototype.prepend = function(content) {
    var jContent = $(content),
      jContent2, i, j, len, len2, element, previous;

    jContent.remove();

    for (i = 0, len = this.length; i < len; i++) {
      jContent2 = (i ? jContent.clone(true) : jContent);
      element = this[i];
      previous = element.firstChild;

      if (previous) {
        for (j = 0, len2 = jContent2.length; j < len2; j++) {
          element.insertBefore(jContent2[j], previous);
        }
      } else {
        for (j = 0, len2 = jContent2.length; j < len2; j++) {
          element.appendChild(jContent2[j]);
        }
      }

    }

    return this;
  };

  ListDOM.prototype.before = function(content) {
    var jContent = $(content),
      jContent2, i, j, len, len2, parent;

    jContent.remove();

    for (i = 0, len = this.length; i < len; i++) {
      jContent2 = (i ? jContent.clone(true) : jContent);
      parent = this[i].parentElement || this[i].parentNode;

      for (j = 0, len2 = jContent2.length; j < len2; j++) {
        parent.insertBefore(jContent2[j], this[i]);
      }
    }

    return this;
  };

  ListDOM.prototype.after = function(content) {
    var jContent = $(content),
      jContent2, i, j, len, len2, element, parent;

    jContent.remove();

    for (i = 0, len = this.length; i < len; i++) {
      jContent2 = (i ? jContent.clone(true) : jContent);
      parent = this[i].parentElement || this[i].parentNode;
      element = this[i].nextElementSibling || this[i].nextSibling;
      if (element) {
        for (j = 0, len2 = jContent2.length; j < len2; j++) {
          parent.insertBefore(jContent2[j], element);
          element = jContent2[j];
        }
      } else {
        for (j = 0, len2 = jContent2.length; j < len2; j++) {
          parent.appendChild(jContent2[j]);
        }
      }
    }

    return this;
  };

  ListDOM.prototype.replaceWith = function(content) {
    var jContent = $(content),
      jContent2, i, j, len, len2, element, parent, next;

    if (!jContent.length) {
      return this;
    }

    for (i = this.length - 1; i >= 0; i--) {
      jContent2 = (i ? jContent.clone(true) : jContent);
      element = this[i];
      parent = element.parentElement;

      parent.replaceChild(jContent2[0], element);

      if (jContent2[1]) {
        next = jContent2[0].nextElementSibling;
        if (next) {
          for (j = 1, len2 = jContent2.length; j < len2; j++) {
            parent.insertBefore(jContent2[j], next);
          }
        } else {
          for (j = 1, len2 = jContent2.length; j < len2; j++) {
            parent.appendChild(jContent2[j]);
          }
        }
      }
    }

    return this;
  };

  ListDOM.prototype.wrap = function(content) {
    var getWrapper = _isFunction(content) ? function(i) {
      return $(content(i));
    } : (function() {
      var jContent = $(content),
        jDolly = jContent.clone(true);

      return function(i) {
        return i ? jDolly.clone(true) : jContent;
      };
    })();

    this.each(function(i, elem) {
      var wrapper = getWrapper(i)[0],
        parent = this.parentElement,
        firstChild = wrapper;

      while (firstChild.firstElementChild) {
        firstChild = firstChild.firstElementChild;
      }

      if (parent) {
        parent.replaceChild(wrapper, this);
        firstChild.appendChild(this);
      }

    });

    return this;
  };

  ListDOM.prototype.wrapAll = function(content) {
    var element = $(_isFunction(content) ? content() : content)[0],
      parent = this[0].parentElement;

    parent.replaceChild(element, this[0]);

    if (element) {
      while (element.firstElementChild) {
        element = element.firstElementChild;
      }
    }

    for (var i = 0, len = this.length; i < len; i++) {
      element.appendChild(this[i]);
    }

    return $(element);
  };

  ListDOM.prototype.unwrap = function() {

    var parents = this.parent(),
      parent;

    for (var i = 0, len = parents.length; i < len; i++) {
      parent = parents.eq(i);
      parent.replaceWith(parent.children());
    }

    return this;
  };

  ListDOM.prototype.next = function(selector) {
    var list = new ListDOM(),
      elem, n = 0;

    for (var i = 0, len = this.length; i < len; i++) {
      elem = this[i].nextElementSibling;
      if (elem) {
        list[n++] = elem;
      }
    }
    list.length = n;

    return (typeof selector === 'string') ? list.filter(selector) : list;
  };

  ListDOM.prototype.nextAll = function(selector) {
    var list = new ListDOM(),
      elem, n = 0;

    for (var i = 0, len = this.length; i < len; i++) {
      elem = this[i].nextElementSibling;
      while (elem) {
        list[n++] = elem;
        elem = elem.nextElementSibling;
      }
    }
    list.length = n;

    return filterDuplicated(selector ? list.filter(selector) : list);
  };

  ListDOM.prototype.prev = function(selector) {
    var list = new ListDOM(),
      elem, n = 0;

    for (var i = 0, len = this.length; i < len; i++) {
      elem = this[i].previousElementSibling;
      if (elem) {
        list[n++] = elem;
      }
    }
    list.length = n;

    return selector ? list.filter(selector) : list;
  };

  function _prevAll(list, element, n) {
    if (element) {
      if (element.previousElementSibling) {
        n = _prevAll(list, element.previousElementSibling, n);
      }
      list[n++] = element;
    }
    return n;
  }

  ListDOM.prototype.prevAll = function(selector) {
    var list = new ListDOM(),
      elem, n = 0;

    for (var i = 0, len = this.length; i < len; i++) {
      n = _prevAll(list, this[i].previousElementSibling, n);
    }
    list.length = n;

    return filterDuplicated(selector ? list.filter(selector) : list);
  };

  ListDOM.prototype.remove = function(selector) {
    var list = selector ? this.filter(selector) : this,
      parent;

    for (var i = 0, len = list.length; i < len; i++) {
      parent = list[i].parentElement || list[i].parentNode;
      if (parent) {
        parent.removeChild(list[i]);
      }
    }

    return this;
  };

  ListDOM.prototype.detach = function(selector) {
    var list = selector ? this.filter(selector) : this,
      elems = new ListDOM();

    for (var i = 0, len = list.length; i < len; i++) {
      detached.appendChild(list[i]);
      elems.push(list[i]);
    }

    return elems;
  };

  ListDOM.prototype.css = function(key, value) {

    if (value !== undefined) {
      var i, len;
      value = (value instanceof Function) ? value() : (value instanceof Number ? (value + 'px') : value);

      if (typeof value === 'string' && /^\+=|\-=/.test(value)) {
        value = (value.charAt(0) === '-') ? -parseFloat(value.substr(2)) : parseFloat(value.substr(2));

        for (i = 0, len = this.length; i < len; i++) {
          this[i].style[key] = parseFloat(this[i].style[key]) + value + 'px';
        }
      } else {
        for (i = 0, len = this.length; i < len; i++) {
          this[i].style[key] = value;
        }
      }
      return this;
    } else if (key instanceof Object) {
      for (var k in key) {
        this.css(k, key[k]);
      }
    } else if (this[0]) {
      return this[0].style[key] || window.getComputedStyle(this[0])[key];
    }

    return this;
  };

  var transitionKey = auxDiv.style.webkitTransition !== undefined ? 'webkitTransition' : (
    auxDiv.style.mozTransition !== undefined ? 'mozTransition' : (
      auxDiv.style.msTransition !== undefined ? 'msTransition' : undefined
    )
  );

  function animateFade(list, show, time, timingFunction, callback) {
    if (typeof time === 'string') {
      time = animateFade.times[time];
    }

    timingFunction = timingFunction || 'linear';
    var opacityStart = show ? 0 : 1,
      opacityEnd = show ? 1 : 0;

    for (var i = 0, n = list.length; i < n; i++) {
      list[i].style.opacity = opacityStart;
    }
    setTimeout(function() {
      for (var i = 0, n = list.length; i < n; i++) {
        list[i].$$jqliteTransition = list[i].$$jqliteTransition === undefined ? (list[i].style[transitionKey] || '') : list[i].$$jqliteTransition;
        list[i].style[transitionKey] = 'opacity ' + time + 'ms ' + timingFunction;
        list[i].style.opacity = opacityEnd;
      }
    }, 20);

    setTimeout(function() {
      for (var i = 0, n = list.length; i < n; i++) {
        list[i].style.opacity = '';
        list[i].style[transitionKey] = list[i].$$jqliteTransition;
      }
      callback.call(list);
    }, time);

    return list;
  }

  animateFade.times = {
    slow: 600,
    normal: 400,
    fast: 200
  };

  ListDOM.prototype.show = function(time, easing, callback) {
    if (time) {
      var list = this;
      this.show();
      return animateFade(list, true, time, easing, callback || function() {});
    }

    for (var i = 0, n = this.length; i < n; i++) {
      if (this[i].style.display) {
        this[i].style.display = '';
      }
    }
    return this;
  };

  ListDOM.prototype.hide = function(time, easing, callback) {
    if (time) {
      return animateFade(this, false, time, easing, function() {
        this.hide();
        if (callback) {
          callback.call(this);
        }
      });
    }

    for (var i = 0, n = this.length; i < n; i++) {
      this[i].style.display = 'none';
    }
    return this;
  };

  ListDOM.prototype.position = function() {
    if (this.length) {
      return {
        top: this[0].offsetTop,
        left: this[0].offsetLeft
      };
    }
  };

  ListDOM.prototype.offset = function(coordinates) {
    if (coordinates === undefined) {
      var rect = this[0].getBoundingClientRect();
      return this.length && {
        top: rect.top + document.body.scrollTop,
        left: rect.left
      };
    }
    if (coordinates instanceof Function) {
      coordinates = coordinates();
    }
    if (typeof coordinates === 'object') {
      if (coordinates.top !== undefined && coordinates.left !== undefined) {
        for (var i = 0, len = this.length, position; i < len; i++) {
          // position = this[i].style.position || window.getComputedStyle(this[i]).position;
          this[i].style.position = 'relative';

          var p = this[i].getBoundingClientRect();

          this[i].style.top = coordinates.top - p.top + parseFloat(this[i].style.top || 0) - document.body.scrollTop + 'px';
          this[i].style.left = coordinates.left - p.left + parseFloat(this[i].style.left || 0) + 'px';
        }
        return coordinates;
      }
    }
  };

  ListDOM.prototype.width = function(value, offset) {
    var el;
    if (value === true) {
      if (this.length) {
        el = this[0];
        return el.offsetWidth;
      }
    } else if (value !== undefined) {

      for (var i = 0, len = this.length; i < len; i++) {
        this[i].style.width = value;
      }

    } else if (this.length) {
      el = this[0];
      return el.offsetWidth -
        parseFloat(window.getComputedStyle(el, null).getPropertyValue('border-left-width')) -
        parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-left')) -
        parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-right')) -
        parseFloat(window.getComputedStyle(el, null).getPropertyValue('border-right-width'));
    }
  };

  ListDOM.prototype.height = function(value, offset) {
    var el;
    if (value === true) {
      if (this.length) {
        el = this[0];
        return el.offsetHeight;
      }
    } else if (value !== undefined) {

      for (var i = 0, len = this.length; i < len; i++) {
        this[i].style.height = value;
      }

    } else if (this.length) {
      el = this[0];
      return el.offsetHeight -
        parseFloat(window.getComputedStyle(el, null).getPropertyValue('border-top-width')) -
        parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-top')) -
        parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-bottom')) -
        parseFloat(window.getComputedStyle(el, null).getPropertyValue('border-bottom-width'));
    }
  };

  ListDOM.prototype.html = function(html) {
    var i, len;
    if (html === undefined) {
      html = '';
      for (i = 0, len = this.length; i < len; i++) {
        html += this[i].innerHTML;
      }
      return html;
    } else if (html === true) {
      html = '';
      for (i = 0, len = this.length; i < len; i++) {
        html += this[i].outerHTML;
      }
      return html;
    }

    if (_isFunction(html)) {
      for (i = 0, len = this.length; i < len; i++) {
        this[i].innerHTML = html(i, this[i].innerHTML);
      }
      return this;
    } else {
      for (i = 0, len = this.length; i < len; i++) {
        this[i].innerHTML = html;
      }
    }
    this.find('script').each(function() {
      if ((this.type == 'text/javascript' || !this.type) && this.textContent) {
        try {
          runScripts('(function(){ \'use strict\';' + this.textContent + '})();');
        } catch (err) {
          throw new Error(err.message);
        }
      }
    });

    return this;
  };

  ListDOM.prototype.text = function(text) {
    var i, len;
    if (text === undefined) {
      text = '';
      for (i = 0, len = this.length; i < len; i++) {
        text += this[i].textContent;
      }
      return text;
    } else if (_isFunction(text)) {
      for (i = 0, len = this.length; i < len; i++) {
        this[i].textContent = text(i, this[i].textContent);
      }
      return this;
    } else {
      for (i = 0, len = this.length; i < len; i++) {
        this[i].textContent = text;
      }
      return this;
    }
  };

  function addListListeners(list, eventName, listener, once) {
    var i, len;

    if (typeof eventName === 'string') {

      if (/\s/.test(eventName)) {
        eventName = eventName.split(/\s+/g);
      } else {
        if (!_isFunction(listener)) {
          throw 'listener needs to be a function';
        }

        for (i = 0, len = list.length; i < len; i++) {
          attachElementListener(list[i], eventName, listener, once);
        }
      }
    }

    if (_isArray(eventName)) {
      for (i = 0, len = eventName.length; i < len; i++) {
        addListListeners(list, eventName[i], listener, once);
      }
    } else if (_isObject(eventName)) {
      for (i in eventName) {
        addListListeners(list, i, eventName[i], once);
      }
    }

    return list;
  }

  ListDOM.prototype.on = function(eventName, listener) {
    return addListListeners(this, eventName, listener);
  };

  var eventActions = {
    list: ['click', 'focus', 'blur', 'submit'],
    define: function(name) {
      ListDOM.prototype[name] = function(listener) {
        if (listener) {
          this.on(name, listener);
        } else {
          for (var i = 0, len = this.length; i < len; i++) {
            this[i][name]();
          }
        }
        return this;
      };
    },
    init: function() {
      for (var i = 0, len = eventActions.list.length, name; i < len; i++) {
        eventActions.define(eventActions.list[i]);
      }
    }
  };
  eventActions.init();

  ListDOM.prototype.once = function(eventName, listener) {
    return addListListeners(this, eventName, listener, true);
  };
  // for jQuery compatibility
  ListDOM.prototype.one = ListDOM.prototype.once;

  ListDOM.prototype.off = function(eventName, listener) {
    var i, n;

    if (/\s/.test(eventName)) {
      eventName = eventName.split(/\s+/g);
    }

    if (eventName instanceof Array) {
      for (i = 0, n = this.length; i < n; i++) {
        this.off(eventName[i], listener);
      }
      return this;
    }

    if (eventName === undefined) {
      var registeredEvents, registeredEvent;

      for (i = 0, n = this.length; i < n; i++) {
        registeredEvents = this[i].$$jqListeners || {};
        for (registeredEvent in registeredEvents) {
          detachElementListener(this[i], registeredEvent);
          delete registeredEvents[registeredEvent];
        }
      }
    } else if (typeof eventName !== 'string' || (!_isFunction(listener) && listener !== undefined)) {
      throw 'bad arguments';
    }

    for (i = 0, n = this.length; i < n; i++) {
      detachElementListener(this[i], eventName, listener);
    }
    return this;
  };

  ListDOM.prototype.trigger = function(eventName, args, data) {
    if (typeof eventName !== 'string') {
      throw 'bad arguments';
    }

    for (var i = 0, len = this.length; i < len; i++) {
      triggerEvent(this[i], eventName, args, data);
    }
    return this;
  };

  ListDOM.prototype.stopPropagation = function() {
    for (var i = 0, len = arguments.length; i < len; i++) {
      this.on(arguments[i], function(e) {
        e.stopPropagation();
      });
    }
  };

  // shorthands

  /*['mouseenter', 'mouseleave'].forEach(function(eventName) {
    ListDOM.prototype[eventName] = function(handler) {
      this.on(eventName, handler);
      return this;
    };
  });

  ListDOM.prototype.hover = function(mouseIn, mouseOut) {
    return this.mouseenter(mouseIn).mouseleave(mouseOut);
  };*/

  // finally

  jqlite.noConflict = function() {
    if (root.$ === jqlite) {
      delete root.$;
    }
    return jqlite;
  };

  return jqlite;

});/*!
 * pReact & pjs template v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/pReact
 */
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
	},
	swipe: function(options) {
		var browser = {
			addEventListener: !!window.addEventListener,
			touch: ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch
		};
		options = pReact.extend({}, options);
		var start = {},
			delta = {},
			end = {};

		function calculateAngle(startPoint, endPoint) {
			var x = startPoint.x - endPoint.x;
			var y = endPoint.y - startPoint.y;
			var r = Math.atan2(y, x); //radians
			var angle = Math.round(r * 180 / Math.PI); //degrees
			//ensure value is positive
			if (angle < 0) {
				angle = 360 - Math.abs(angle);
			}

			return angle;
		}

		function calculateDirection(startPoint, endPoint) {
			var angle = calculateAngle(startPoint, endPoint);

			if ((angle <= 45) && (angle >= 0)) {
				return "left";
			} else if ((angle <= 360) && (angle >= 315)) {
				return "left";
			} else if ((angle >= 135) && (angle <= 225)) {
				return "right";
			} else if ((angle > 45) && (angle < 135)) {
				return "down";
			} else {
				return "up";
			}
		}

		function init(element) {
			var events = {
				handleEvent: function(event) {
					switch (event.type) {
						case "touchstart":
							this.start(event);
							break;
						case "touchmove":
							this.move(event);
							break;
						case "touchend":
							this.end(event);
							break;
					}
					if (options.stopPropagation) {
						event.stopPropagation()
					}
				},
				start: function(event) {
					var touches = event.touches[0];
					start = {
						x: touches.pageX,
						y: touches.pageY
					};
					delta = {};
					element.addEventListener("touchmove", this, false);
					element.addEventListener("touchend", this, false)
				},
				move: function(event) {
					if (event.touches.length > 1 || event.scale && event.scale !== 1) {
						return
					}
					if (options.disableScroll) {
						event.preventDefault()
					}
					var touches = event.touches[0];
					end = {
						x: touches.pageX,
						y: touches.pageY
					}
					delta = {
						x: touches.pageX - start.x,
						y: touches.pageY - start.y
					};
				},
				end: function(event) {
					var direction = calculateDirection(start, end);
					var a = 150;
					((delta.x < -a || delta.x > a) || (delta.y < -a || delta.y > a)) && options.callback && options.callback.call(element, event, direction);
					element.removeEventListener("touchmove", events, false);
					element.removeEventListener("touchend", events, false)
				}
			};
			if (browser.addEventListener) {
				if (browser.touch) {
					element.addEventListener("touchstart", events, false)
				}
			}
		}

		var target = this;

		pReact.each(target, function() {
			var element = this;
			init(element);
		});


		return {
			done: function(callback) {
				options.callback = callback;
				return this;
			},
			off: function() {
				if (browser.addEventListener) {
					pReact.jq(target).off("touchstart");
				}
				return this;
			}
		};
	},
	tap: function(callback) {
		var dom = pReact.jq(this),
			start,
			end, deltaX, deltaY, startTime, endTime, doubleTime;
		dom.on("touchstart", function(e) {
			var touches = event.touches[0];
			startTime = new Date();
			start = {
				x: touches.pageX,
				y: touches.pageY
			};
			end = {
				x: 0,
				y: 0
			};
			deltaX = 0;
			deltaY = 0;
			endTime = null;
		}).on("touchmove", function(e) {
			var touches = event.touches[0];
			end = {
				x: touches.pageX,
				y: touches.pageY
			};
		}).on("touchend", function(e) {
			endTime = new Date();
			deltaX = end.x - start.x;
			deltaY = end.y - start.y;
			if (deltaX <= 10 && deltaY <= 10 && endTime - startTime > 500) {
				callback && callback.call(this, e, "singleTap", endTime - startTime);
				doubleTime = null;
			} else if (deltaX <= 10 && deltaY <= 10 && endTime - doubleTime < 500){
				callback && callback.call(this, e, "doubleTap", endTime - doubleTime);
			} else {
				doubleTime = endTime;
			}
		});
		return this;
	}
});/*!
 * pReact & pjs template v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/pReact
 */
pReact && ((function($) {

	function _capitalize(val) {
		return val[0].toUpperCase() + val.substr(1);
	}

	function _date(d, pattern) {
		d = d ? new Date(d) : new Date();
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

	$.getDate = function() {
		return _date(undefined, "yyyy-MM-dd");
	};

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
	var tmplFilter = function($) {
		//filter|json|limitToCharacter|limitTo|indexOf|lowercase|uppercase|toCNRMB|toCNumber|orderBy|date|currency|empty|passcard|encodeURI|decodeURI|toString|capitalize
		return {
			filter: function(val, filterCondition) {
				return _tmplFilterVal(val, filterCondition);
			},
			json: function(val, filterCondition) {
				return $.stringify(val);
			},
			limitToCharacter: function(val, filterCondition) {
				if ($.is("string", val)) {
					return textFix(val, parseInt(filterCondition));
				}
				return val;
			},
			limitTo: function(val, filterCondition) {
				if ($.is("array", val)) {
					var a = [];
					val.forEach(function(n) {
						a.push(n);
					});
					return $.stringify(a.splice(0, parseInt(filterCondition)));
				} else if ($.is("string", val)) {
					return val.substr(0, parseInt(filterCondition)); //textFix(val, parseInt(filterCondition));
				} else if ($.is("number", val) && /\./.test(val + "")) {
					return val.toFixed(filterCondition);
				} else if ($.is("number", val)) {
					var len = (val + "").length;
					return parseInt((val + "").substr(len - parseInt(filterCondition), filterCondition));
				}
				return val;
			},
			indexOf: function(val, filterCondition) {
				var index = -1,
					i;
				if ($.is("array", val)) {
					for (i = 0; i < val.length; i++) {
						if (val[i] == filterCondition) {
							index = i;
							break;
						}
					}
				}
				if ($.is("string", val)) {
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
			toRem: function(val, filterCondition) {
				return (parseFloat(val) / parseFloat(filterCondition)).toFixed(4);
			},
			toCNRMB: function(val, filterCondition) {
				return digitUppercase(parseFloat(val), true);
			},
			toCNumber: function(val, filterCondition) {
				return digitUppercase(parseFloat(val), false);
			},
			orderBy: function(val, filterCondition) {
				if ($.is("array", val) && /reverse|sort/.test(filterCondition.toLowerCase())) {
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
				return (typeof val == "string" && $.trim(val) == "" || val == null || typeof val == "undefined" || $.is("object", val) && pReact.isEmptyObject(val) || $.is("array", val) && val.length == 0) && filterCondition || "";
			},
			passcard: function(val, filterCondition) {
				var num = filterCondition || 4,
					exp = new RegExp("(\\d{" + num + "})(\\d{" + num + "})(\\d{" + num + "})(\\d{" + num + "})(\\d{0,})"),
					regex = exp.exec(val);
				return regex && regex.splice(1, regex.length - 1).join(' ') || val;
			},
			encodeURI: function(val, filterCondition) {
				return encodeURIComponent(val);
			},
			decodeURI: function(val, filterCondition) {
				return decodeURIComponent(val);
			},
			toString: function(val, filterCondition) {
				return $.stringify(val);
			},
			cssPrefix: function(val, filterCondition) {
				val = val.replace(/["']*/gi, "");
				var toAda = [];
				var a = document.createElement("div").style;
				pReact.each(["", "webkit", "o", "ms", "moz"], function(i, name) {
					var valname = val.replace(/\s*/gi, "").split(':')[0];
					valname = valname.split('-');
					if (name != "" && (name + (valname.length > 1 ? _capitalize(valname[0]) + _capitalize(valname[1]) : _capitalize(valname[0])) in a)) {
						toAda.push("-" + name + "-" + val);
					} else if (name == "") {
						toAda.push(val);
					}
				});
				return toAda.join(';') + ";";
			},
			rgbToHex: function(val, filterCondition) {
				var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/,
					that = val;
				if (/^(rgb|RGB)/.test(that)) {
					var aColor = that.replace(/(?:||rgb|RGB)*/g, "").replace(/\s*/gi, "").split(",");
					var strHex = "#";
					for (var i = 0; i < aColor.length; i++) {
						var hex = Number(aColor[i]).toString(16);
						if (hex === "0") {
							hex += hex;
						}
						strHex += hex;
					}
					if (strHex.length !== 7) {
						strHex = that;
					}
					return strHex;
				} else if (reg.test(that)) {
					var aNum = that.replace(/#/, "").split("");
					if (aNum.length === 6) {
						return that;
					} else if (aNum.length === 3) {
						var numHex = "#";
						for (var i = 0; i < aNum.length; i += 1) {
							numHex += (aNum[i] + aNum[i]);
						}
						return numHex;
					}
				} else {
					return that;
				}
			},
			hexToRgb: function(val, filterCondition) {
				var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/,
					sColor = val.toLowerCase();
				if (sColor && reg.test(sColor)) {
					if (sColor.length === 4) {
						var sColorNew = "#";
						for (var i = 1; i < 4; i += 1) {
							sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
						}
						sColor = sColorNew;
					}
					var sColorChange = [];
					for (var i = 1; i < 7; i += 2) {
						sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
					}
					return sColorChange.join(",");
				} else {
					return sColor;
				}
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
	$.tmplFilterExtend(tmplFilter);
})(pReact), pReact.tmplBindsExtend({
	bindHandle: function(elem, obj) {
		pReact.each("onSwipe onClick onCopy onCut onPaste onKeyDown onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onTouchCancel onTouchEnd onTouchMove onTouchStart onScroll onWheel".split(' '), function(i, name) {
			var val = elem.getAttribute(name);
			if (val) {
				var result = /\{\{\s*(.+)\s*\}\}/.exec(val);
				result && result[1] && (elem.removeAttribute(name), /swipe/.test(name.toLowerCase()) && pReact.jq ? pReact.jq(elem).swipe({
					callback: function(e, dir) {
						try {
							var fn = pReact.sEval('return function(e, dir){' + result[1] + '(e, dir);}', "e", "dir"),
								then = typeof obj == "function" ? (new obj) : obj;
							then.elem = e && e.path && (this.path = e.path) && this || this;
							then.setState = function(ops) {
								pReact.extend(!then.state ? (then.state = {}) : then.state, ops);
							}
							fn.call(then, e, dir);
						} catch (e) {
							console.log(e);
						}
					}
				}) : elem[name.toLowerCase()] = function(e) {
					try {
						var fn = pReact.sEval('return function(e){' + result[1] + '(e);}', "e"),
							then = typeof obj == "function" ? (new obj) : obj;
						then.elem = e.path && (this.path = e.path) && this || this;
						then.setState = function(ops) {
							pReact.extend(!then.state ? (then.state = {}) : then.state, ops);
						}
						fn.call(then, pReact.extend(e, {
							target: e.path && (e.target.path = e.path) && e.target || e.target
						}));
					} catch (e) {
						console.log(e);
					}
				});
			}
		});
	},
	bindShow: function(elem, obj) {
		pReact.each("p-show p-hide".split(' '), function(i, name) {
			var val = elem.getAttribute(name);
			if (val == "") {
				if (name == "p-show") {
					var a = elem.style.cssText != "" ? elem.style.cssText.replace(/display\s*\:\s*none\s*;*/gi, "") : "";
					elem.style.cssText = a;
				} else if (name == "p-hide") {
					var a = elem.style.cssText != "" ? elem.style.cssText.replace(/display\s*\:\s*[a-zA-Z-]*\s*;*/gi, "") : "";
					a = a + "display:none";
					elem.style.cssText = a;
				}
				elem.removeAttribute(name);
			}
		});
	},
	bindController: function(elem, obj) {
		var val = elem.getAttribute("p-controller");
		if (val) {
			pReact.tmplModel.binds.controllers[val](elem, obj);
			elem.removeAttribute("p-controller");
		}
	}
}), (pReact.extend(!pReact.tmplModel.valids && (pReact.tmplModel.valids = {}) || pReact.tmplModel.valids, {
	noEmpty: function(elem, valid) {
		if (pReact.trim(elem.value || elem.innerHTML) === "" || ("checked" in elem) && (elem.type == "checkbox" || elem.type == "radio") && !elem.checked) return false;
		return true;
	}
})), (pReact.extend(pReact, {
	tmplControlExtend: function(controllers) {
		controllers && pReact.extend(pReact.tmplModel.binds.controllers, controllers);
		return this;
	},
	tmplValidsExtend: function(valids) {
		valids && pReact.extend(pReact.tmplModel.valids, valids);
		return this;
	}
})), (pReact.extend(pReact.tmplModel.binds, {
	controllers: {
		formController: function(elem, obj) {
			var form = elem.getElementsByTagName("form");
			if (form && form.length > 0) {
				pReact.each(form, function(i, group) {
					var children = [];
					pReact.each("input button select textarea".split(' '), function(i, name) {
						var arr = group.getElementsByTagName(name);
						arr && arr.length > 0 && (children = children.concatAll(arr));
					});
					pReact.each(children, function(i, item) {
						var val = item.getAttribute("p-submit");
						if (val) {
							group.submitButton = item;
							var result = /\{\{\s+(.+)\s+\}\}/.exec(val);
							if (result && result[1]) {
								group.submitButton.removeAttribute("p-submit");
								try {
									var fn = pReact.sEval('return function(e){' + result[1] + '(e);}', "e"),
										then = typeof obj == "function" ? (new obj) : obj;
									then.elem = group;
									group.submitButton_success = function() {
										fn.call(then);
									};
								} catch (e) {
									console.log(e);
								}
							};
						}
						var validName = item.getAttribute("p-valid");
						if (validName) {
							item.validFn = function() {
								var result = true;
								pReact.each(validName.split(','), function(i, valid) {
									valid = valid.split(':');
									result = valid ? pReact.tmplModel.valids[valid[0]](item, valid[1] || undefined) : true;
									return result;
								});
								return result;
							};
						}
					});
					group.onsubmit = function(e) {
						e.preventDefault();
						var result = true;
						pReact.each(children, function(i, item) {
							result = item.validFn ? item.validFn() : true;
							var error = item.getAttribute("p-error"),
								cls = "",
								tip = item.getAttribute("p-tip"),
								tipbox = item.getAttribute("p-for"),
								dom;
							if (tipbox) dom = document.getElementById(tipbox);
							if (!result) {
								error && (cls = item.className.replace(error, ""), item.className = cls + " " + error);
								tip && dom && (dom.innerHTML = tip);
								return false;
							} else {
								error && (item.className = item.className.replace(error, ""));
								tip && dom && (dom.innerHTML = "");
							}
						});
						if (result) {
							this.submitButton_success.call(this);
						}
					};
				});
			}
		},
		iscroll: function(elem, obj){

		},
		videobox: function(elem, obj) {
			var dom = pReact.jq(elem),
				src = dom.attr("src") || "",
				width = dom.attr("width") || "100%",
				height = dom.attr("height") || "240";
			src = src.split(' ');
			pReact.each(src, function(i, item) {
				dom.append('<source src="' + item + '" />');
			});
			dom.removeAttr('src');
			dom.attr({
				width: width,
				height: height,
				controls: "controls"
			});
		},
		topBanner: function(elem, obj) {
			var len = obj.data.length,
				time = parseInt(pReact.jq(elem).attr("p-speed")) || 1000,
				aniTime = parseInt(pReact.jq(elem).attr("p-anispeed")) || 200,
				fsize =	(screen.width/16).toFixed(2) || 0;
			var scrollad = function() {
				return new scrollad.fn.init();
			};
			scrollad.fn = scrollad.prototype = {
				init: function() {
					this.onPlay = true;
					this.num = 0;
					return this;
				},
				done: function() {
					var self = this;
					pReact.jq(elem).parent().swipe({
						callback: function(e, dir) {
							self.stop();
							console.log(dir);
							if (dir == "left") {
								self.nextBanner();
							} else if (dir == "right") {
								self.prevBanner();
							}
						}
					});
					this.onPlay && this.play();
					return this;
				},
				stop: function() {
					this.onPlay = false;
					return this;
				},
				prevBanner: function() {
					this.num--;
					if (this.num < 0) {
						this.num = len - 1;
					}
					pReact.jq(elem).css({
						"transform": "translate3d(" + (this.num === 0 ? "" : "-") + (screen.width * this.num / fsize) + "rem, 0, 0)",
						"transition": "transform " + aniTime + "ms"
					});
					pReact.jq(".topbanner_dot").find("li").removeClass('on').eq(this.num).addClass('on');
					this.onPlay = true;
					this.play();
					return this;
				},
				nextBanner: function() {
					this.num++;
					if (this.num >= len) {
						this.num = 0;
					}
					pReact.jq(elem).css({
						"transform": "translate3d(" + (this.num === 0 ? "" : "-") + (screen.width * this.num / fsize) + "rem, 0, 0)",
						"transition": "transform " + aniTime + "ms"
					});
					pReact.jq(".topbanner_dot").find("li").removeClass('on').eq(this.num).addClass('on');
					this.onPlay = true;
					this.play();
					return this;
				},
				play: function() {
					this.topBannerInterval && clearInterval(this.topBannerInterval);
					if (!this.onPlay) {
						return this;
					}
					var self = this;
					this.topBannerInterval = setInterval(function() {
						self.nextBanner();
						pReact.jq(elem).onAnimationEnd(function() {
							pReact.jq(elem).css({
								"transition": "transform 0ms"
							})
						});
						!self.onPlay && clearInterval(self.topBannerInterval);
					}, time);
					return this;
				}
			};
			scrollad.fn.init.prototype = scrollad.fn;

			scrollad().done();
		}
	}
})), pReact.tmplLangExtend({
	less: function(html, data) {
		var isStyle = false,
			style = [],
			isLess = false,
			lessPath;
		var result = html.split(/<style\s+p-type=/);
		if (result.length > 1) {
			pReact.each(result, function(i, texts) {
				//console.log(a);
				if (/<\/style>/.test(texts)) {
					var a = "<style p-type=" + texts.split(/<\/style>/)[0] + "</style>";
					var b = a.replace(/<style\s*(p-type=['"]*([^'"]+)['"]*\s+p-path=['"]*([^'"]+)['"]*)*>/, function(a, b, c, d) {
						if (c && c.toLowerCase() == "text/less") {
							a = a.replace(b, 'rel="stylesheet/less" type="text/less"');
							isLess = true;
						}
						if (d) {
							lessPath = d;
						}
						return a;
					});
					html = html.replace(a, b);
				}

			});
		}
		return html;
	},
	toRem: function(html, data) {
		html = html.replace(/<\?pjs\s+toRem\(([0-9\.]*),\s+([a-zA-Z0-9\.]*)\)\s+\?>/gi, function(a, b, c) {
			if (b && c) {
				b = parseFloat(b);
				c = /fontSize/.test(c) && /\./.test(c) ? ((c = c.split('.')), parseFloat(pReact.jq(c[0]).css(c[1]))) : parseFloat(c);
				a = (b / c).toFixed(4) || 0;
			}
			return a;
		});
		return html;
	},
	forend: function(html, data) {
		var arr = [];
		var result = html.split("<?pjs for ");
		if (result.length >= 1) {
			var dataTName = "data";
			pReact.each(result, function(i, str) {
				if (/<\?pjs\s+end\s+for\s+\?>/.test(str)) {
					var o = "<?pjs for " + str.split(/<\?pjs\s+end\s+for\s+\?>/)[0] + "<?pjs end for ?>",
						t = o;
					str = t.replace(/<\?pjs\s+[^\?]+\s+\?>/gi, function(a, b) {
						if (/<\?pjs\s+for\s+/.test(a)) {
							var c = /\s*.+\s*[=><]+\s*([^\.0-9-\+\*\/=><]+)\.*[a-zA-Z0-9+-><=\*\/]*/.exec(a);
							if (c) {
								if (c[1] && !/[0-9]/.test(c[1])) dataTName = c[1];
								else if (c[2] && !/[0-9]/.test(c[2])) dataTName = c[2];
							}
						}
						if (/<\?pjs\s+for\s+/.test(a)) {
							a = a.replace("<?pjs for ", dataTName != " " ? "var " + dataTName + " = result, arr = []; for " : "var arr = []; for ").replace(" ?>", dataTName != " " ? "{ arr.push(pReact.tmpl(_###_" : "{ arr.push(_###_");
						}
						if (/<\?pjs\s+end\s+for\s+\?>/.test(a)) {
							a = a.replace("<?pjs end for ?>", dataTName != " " ? "_###_, " + dataTName + "[i])); }" : "_###_); }");
						}
						return a;
					}).replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"").replace(/_###_/gi, "'");
					var reg = new RegExp("{{ " + dataTName + "\\[[a-zA-Z0-9_]\\]\\.", "gim");
					if (reg.test(str)) {
						str = str.replace(reg, "{{ ");
					}
					html = html.replace(o, pReact.sEval("return function(result){" + str + "; return arr.join('');}")(dataTName == "data" ? data : data[dataTName]));
					/*str = str.replace(/<\?pjs\s+[^\?]+\s+\?>/gi, function(a, b){
						if (/<\?pjs\s+if\s+/.test(a)) {
							a = a.replace("<?pjs if ", "_###_+function(){ return ").replace(" ?>", " ? _###_");
						}
						if (/<\?pjs\s+else\s+if\s+/.test(a)) {
							a = a.replace("<?pjs else if ", "_###_ : ").replace(" ?>", " ? _###_");
						}
						if (/<\?pjs\s+else\s+\?>/.test(a)) {
							a = a.replace("<?pjs else ?>", "_###_ : _###_");
						}
						if (/<\?pjs\s+end\s+if\s+\?>/.test(a)) {
							a = a.replace("<?pjs end if ?>", "_###_ }()+_###_");
						}
						return a;
					});*/
				}
			});
		}
		return html;
	},
	ifend: function(html) {
		var a = html.split("<\?pjs if ");
		if (a.length > 1) {
			pReact.each(a, function(i, str) {
				if (/<\?pjs\s+end\s+if\s+\?>/.test(str)) {
					var a = ("<\?pjs if " + str).split("<\?pjs end if \?>"),
						o = a[0] + "<\?pjs end if \?>",
						t = o;
					a = t.replace(/<\?pjs\s+[^\?]+\s+\?>/gi, function(a, b) {
						if (/<\?pjs\s+if\s+/.test(a)) {
							a = a.replace("<\?pjs ", "var _ifend = _###__###_;").replace(" \?>", "{ _ifend = _###_").replace(/\'/gi, "_###_").replace(/\"/gi, "_###_");
						} else if (/<\?pjs\s+else\s+if\s+/.test(a)) {
							a = a.replace("<\?pjs ", "_###_;}").replace(" \?>", "{ _ifend = _###_").replace(/\'/gi, "_###_").replace(/\"/gi, "_###_");
						} else if (/<\?pjs\s+else\s+\?>/.test(a)) {
							a = "_###_;}else{ _ifend = _###_";
						} else if (/<\?pjs\s+end\s+if\s+\?>/.test(a)) {
							a = "_###_;}";
						}
						return a;
					}).replace(/\'/gi, "\\'");
					a = a.replace(/_###_/gi, "'") + "return _ifend;";
					a = pReact.sEval("return function(){" + a + "}")();
					html = html.replace(o, a);
				}
			});
		}
		return html;
	},
	switchend: function(html) {
		var a = html.split("<\?pjs switch ");
		if (a.length > 1) {
			pReact.each(a, function(i, str) {
				if (/<\?pjs\s+end\s+switch\s+\?>/.test(str)) {
					var a = ("<\?pjs switch " + str).split("<\?pjs end switch \?>"),
						o = a[0] + "<\?pjs end switch \?>",
						t = o;
					a = t.replace(/<\?pjs\s+[^}]+\s+\?>/gi, function(a, b) {
						if (/<\?pjs\s+switch\s+/.test(a)) {
							a = a.replace("<\?pjs ", "var switchstr= _###__###_;").replace(" \?>", "{").replace(/\'/gi, "_###_").replace(/\"/gi, "_###_");
						} else if (/<\?pjs\s+end\s+switch\s+\?>/.test(a)) {
							a = "}";
						} else if (/<\?pjs\s+case\s+/.test(a)) {
							a = a.replace("<\?pjs ", "").replace(" \?>", " : switchstr = _###_").replace(/\'/gi, "_###_").replace(/\"/gi, "_###_");
						} else if (/<\?pjs\s+end\s+case\s+\?>/.test(a)) {
							a = a.replace(/<\?pjs\s+end\s+case\s+\?>/, "_###_;break;");
						}
						return a;
					}).replace(/_###_/gi, "'") + "return switchstr;";
					a = pReact.sEval("return function(){" + a + "}")();
					html = html.replace(o, a);
				}
			});
		}
		return html;
	}
}), (function($, win) {
	var doc = win.document;
	var ua = navigator.userAgent.toLowerCase(),
		device = {
			os: {
				version: 0,
				isiOS: ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1 || ua.indexOf("ios") > -1,
				isAndroid: ua.indexOf("android") > -1 || ua.indexOf("adr") > -1 || ua.indexOf("linux;") > -1
			},
			browser: {
				version: 0,
				isFirefox: ua.indexOf("fxios/") > -1,
				isQQ: ua.indexOf("qq/") > -1,
				isqqbrowser: ua.indexOf("mqqbrowser/") > -1,
				isUC: ua.indexOf("ucbrowser/") > -1,
				isWechat: ua.indexOf("micromessenger/") > -1,
				isSamsung: ua.indexOf("samsungbrowser/") > -1,
				isSogou: ua.indexOf("sogoumobilebrowser/") > -1,
				isPinganWifi: ua.indexOf("pawifi") > -1
			}
		};
	device.browser.isSafari = device.os.isiOS && ua.indexOf("safari/") > -1 && !device.browser.isqqbrowser;
	device.browser.isIApp = device.os.isiOS && !device.browser.isSafari && !device.browser.isqqbrowser && !device.browser.isUC && !device.browser.isWechat && !device.browser.isSamsung && !device.browser.isSogou && !device.browser.isPinganWifi;
	var support = {
		touch: "ontouchstart" in doc ? true : false,
		canvas: (function() {
			var a;
			doc.body.appendChild((a = doc.createElement("canvas")));
			var bool = a.getContext ? true : false;
			doc.body.removeChild(a);
			return bool;
		})()
	};

	function hasAttr(arr, type, val) {
		var is = false;
		pReact.each(arr, function() {
			if (this[type] && this[type] == val) {
				is = true;
			}
		});
		return is;
	}

	$.extend($, {
		ua: ua,
		device: device,
		support: support,
		toMobile: function(num) {
			var head = doc.getElementsByTagName("head")[0],
				style = doc.createElement("style");
			head.appendChild(style);
			style.innerHTML = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,object,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video{display:block}";
			var e = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,object,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video".split(',');
			var i = e.length;
			while (i--) {
				doc.createElement(e[i])
			}
			var metas = head.getElementsByTagName("meta");
			isVP = hasAttr(metas, "name", "viewport");
			if (!isVP) {
				var meta = doc.createElement("meta");
				meta.name = "viewport";
				meta.content = "width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0";
				head.appendChild(meta);
			}
			num = num || 16;

			function setFontSize() {
				var iWidth = doc.documentElement.clientWidth,
					iHeight = doc.documentElement.clientHeight,
					fontSize = window.orientation && (window.orientation == 90 || window.orientation == -90) || iHeight < iWidth ? iHeight / num : iWidth / num;
				doc.getElementsByTagName('html')[0].style.fontSize = fontSize.toFixed(2) + 'px';
			}
			setFontSize();
			window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", setFontSize, false);
			return this;
		}
	});
	var dir = function(elem, dir) {
			var matched = [];

			while ((elem = elem[dir]) && elem.nodeType !== 9) {
				if (elem.nodeType === 1) {
					matched.push(elem);
				}
			}
			return matched;
		},
		indexOf = function(list, elem) {
			var i = 0,
				len = list.length;
			for (; i < len; i++) {
				if (list[i] === elem) {
					return i;
				}
			}
			return -1;
		},
		endEventNames = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';

	$.jq && ($.jq.extend($.jq.fn, {
		hasAttr: function(name, val) {
			return hasAttr(this, name, val);
		},
		onAnimationEnd: function(callback) {
			var fn = function(e) {
				$.jq(this).off(endEventNames, fn);
				callback && callback.call(this, e);
			};
			$.jq(this).once(endEventNames, fn);
			return this;
		},
		scrollTo: function(val) {
			pReact.each(this, function(i, elem) {
				$.jq(elem).scrollTop(val || 1);
			});
			return this;
		},
		index: function(elem) {
			if (!elem) {
				return (this[0] && this[0].parentNode) ? this.first().prevAll().length : -1;
			}
			if (typeof elem === "string") {
				return indexOf(pReact.jq(elem), this[0]);
			}
			return indexOf(this,
				elem.jquery ? elem[0] : elem
			);
		},
		parents: function(id) {
			var parent = null;
			if (this.length > 0) {
				var elem = this[0];
				parent = dir(elem, "parentNode");
				if (id) {
					$.each(parent, function(i, item) {
						if (/^#/.test(id) && item.id && item.id == id.replace("#", "")) {
							parent = [item];
							return false;
						}
						if (/^\./.test(id) && pReact.jq(item).hasClass(id.replace(".", ""))) {
							parent = [item];
							return false;
						}
					});
				}
			}
			if (parent && id && parent.length === 1) {
				this[0] = parent[0];
				this.length = 1;
			} else {
				this.length = 0;
			}
			return this;
		}
	}), $.jq.extend($.jq, {
		isWindow: function(obj) {
			return obj != null && obj === obj.window;
		}
	}), pReact.each({
		scrollLeft: "pageXOffset",
		scrollTop: "pageYOffset"
	}, function(method, prop) {
		pReact.jq.fn[method] = function(val) {
			var elem = this[0];

			if (val === undefined) {
				return pReact.jq.isWindow(elem) ? elem[prop] : elem[method];
			}

			if (pReact.jq.isWindow(elem)) {
				elem.scrollTo(val || elem.pageXOffset, val || elem.pageYOffset);
			} else {
				elem[method] = val || 1;
			}
		};
	}));
})(pReact, this));/*!
 * Less - Leaner CSS v2.7.1
 * http://lesscss.org
 *
 * Copyright (c) 2009-2016, Alexis Sellier <self@cloudhead.net>
 * Licensed under the Apache-2.0 License.
 *
 */

/** * @license Apache-2.0
 */

! function(a) {
	if ("object" == typeof exports && "undefined" != typeof module) module.exports = a();
	else if ("function" == typeof define && define.amd) define([], a);
	else {
		var b;
		b = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, b.less = a()
	}
}(function() {
	return function a(b, c, d) {
		function e(g, h) {
			if (!c[g]) {
				if (!b[g]) {
					var i = "function" == typeof require && require;
					if (!h && i) return i(g, !0);
					if (f) return f(g, !0);
					var j = new Error("Cannot find module '" + g + "'");
					throw j.code = "MODULE_NOT_FOUND", j
				}
				var k = c[g] = {
					exports: {}
				};
				b[g][0].call(k.exports, function(a) {
					var c = b[g][1][a];
					return e(c ? c : a)
				}, k, k.exports, a, b, c, d)
			}
			return c[g].exports
		}
		for (var f = "function" == typeof require && require, g = 0; d.length > g; g++) e(d[g]);
		return e
	}({
		1: [function(a, b, c) {
			var d = a("./utils").addDataAttr,
				e = a("./browser");
			b.exports = function(a, b) {
				d(b, e.currentScript(a)), void 0 === b.isFileProtocol && (b.isFileProtocol = /^(file|(chrome|safari)(-extension)?|resource|qrc|app):/.test(a.location.protocol)), b.async = b.async || !1, b.fileAsync = b.fileAsync || !1, b.poll = b.poll || (b.isFileProtocol ? 1e3 : 1500), b.env = b.env || ("127.0.0.1" == a.location.hostname || "0.0.0.0" == a.location.hostname || "localhost" == a.location.hostname || a.location.port && a.location.port.length > 0 || b.isFileProtocol ? "development" : "production");
				var c = /!dumpLineNumbers:(comments|mediaquery|all)/.exec(a.location.hash);
				c && (b.dumpLineNumbers = c[1]), void 0 === b.useFileCache && (b.useFileCache = !0), void 0 === b.onReady && (b.onReady = !0)
			}
		}, {
			"./browser": 3,
			"./utils": 10
		}],
		2: [function(a, b, c) {
			function d(a) {
				a.filename && console.warn(a), e.async || h.removeChild(i)
			}
			a("promise/polyfill.js");
			var e = window.less || {};
			a("./add-default-options")(window, e);
			var f = b.exports = a("./index")(window, e);
			window.less = f;
			var g, h, i;
			e.onReady && (/!watch/.test(window.location.hash) && f.watch(), e.async || (g = "body { display: none !important }", h = document.head || document.getElementsByTagName("head")[0], i = document.createElement("style"), i.type = "text/css", i.styleSheet ? i.styleSheet.cssText = g : i.appendChild(document.createTextNode(g)), h.appendChild(i)), f.registerStylesheetsImmediately(), f.pageLoadFinished = f.refresh("development" === f.env).then(d, d))
		}, {
			"./add-default-options": 1,
			"./index": 8,
			"promise/polyfill.js": 97
		}],
		3: [function(a, b, c) {
			var d = a("./utils");
			b.exports = {
				createCSS: function(a, b, c) {
					var e = c.href || "",
						f = "less:" + (c.title || d.extractId(e)),
						g = a.getElementById(f),
						h = !1,
						i = a.createElement("style");
					i.setAttribute("type", "text/css"), c.media && i.setAttribute("media", c.media), i.id = f, i.styleSheet || (i.appendChild(a.createTextNode(b)), h = null !== g && g.childNodes.length > 0 && i.childNodes.length > 0 && g.firstChild.nodeValue === i.firstChild.nodeValue);
					var j = a.getElementsByTagName("head")[0];
					if (null === g || h === !1) {
						var k = c && c.nextSibling || null;
						k ? k.parentNode.insertBefore(i, k) : j.appendChild(i)
					}
					if (g && h === !1 && g.parentNode.removeChild(g), i.styleSheet) try {
						i.styleSheet.cssText = b
					} catch (l) {
						throw new Error("Couldn't reassign styleSheet.cssText.")
					}
				},
				currentScript: function(a) {
					var b = a.document;
					return b.currentScript || function() {
						var a = b.getElementsByTagName("script");
						return a[a.length - 1]
					}()
				}
			}
		}, {
			"./utils": 10
		}],
		4: [function(a, b, c) {
			b.exports = function(a, b, c) {
				var d = null;
				if ("development" !== b.env) try {
					d = "undefined" == typeof a.localStorage ? null : a.localStorage
				} catch (e) {}
				return {
					setCSS: function(a, b, e, f) {
						if (d) {
							c.info("saving " + a + " to cache.");
							try {
								d.setItem(a, f), d.setItem(a + ":timestamp", b), e && d.setItem(a + ":vars", JSON.stringify(e))
							} catch (g) {
								c.error('failed to save "' + a + '" to local storage for caching.')
							}
						}
					},
					getCSS: function(a, b, c) {
						var e = d && d.getItem(a),
							f = d && d.getItem(a + ":timestamp"),
							g = d && d.getItem(a + ":vars");
						return c = c || {}, f && b.lastModified && new Date(b.lastModified).valueOf() === new Date(f).valueOf() && (!c && !g || JSON.stringify(c) === g) ? e : void 0
					}
				}
			}
		}, {}],
		5: [function(a, b, c) {
			var d = a("./utils"),
				e = a("./browser");
			b.exports = function(a, b, c) {
				function f(b, f) {
					var g, h, i = "less-error-message:" + d.extractId(f || ""),
						j = '<li><label>{line}</label><pre class="{class}">{content}</pre></li>',
						k = a.document.createElement("div"),
						l = [],
						m = b.filename || f,
						n = m.match(/([^\/]+(\?.*)?)$/)[1];
					k.id = i, k.className = "less-error-message", h = "<h3>" + (b.type || "Syntax") + "Error: " + (b.message || "There is an error in your .less file") + '</h3><p>in <a href="' + m + '">' + n + "</a> ";
					var o = function(a, b, c) {
						void 0 !== a.extract[b] && l.push(j.replace(/\{line\}/, (parseInt(a.line, 10) || 0) + (b - 1)).replace(/\{class\}/, c).replace(/\{content\}/, a.extract[b]))
					};
					b.extract && (o(b, 0, ""), o(b, 1, "line"), o(b, 2, ""), h += "on line " + b.line + ", column " + (b.column + 1) + ":</p><ul>" + l.join("") + "</ul>"), b.stack && (b.extract || c.logLevel >= 4) && (h += "<br/>Stack Trace</br />" + b.stack.split("\n").slice(1).join("<br/>")), k.innerHTML = h, e.createCSS(a.document, [".less-error-message ul, .less-error-message li {", "list-style-type: none;", "margin-right: 15px;", "padding: 4px 0;", "margin: 0;", "}", ".less-error-message label {", "font-size: 12px;", "margin-right: 15px;", "padding: 4px 0;", "color: #cc7777;", "}", ".less-error-message pre {", "color: #dd6666;", "padding: 4px 0;", "margin: 0;", "display: inline-block;", "}", ".less-error-message pre.line {", "color: #ff0000;", "}", ".less-error-message h3 {", "font-size: 20px;", "font-weight: bold;", "padding: 15px 0 5px 0;", "margin: 0;", "}", ".less-error-message a {", "color: #10a", "}", ".less-error-message .error {", "color: red;", "font-weight: bold;", "padding-bottom: 2px;", "border-bottom: 1px dashed red;", "}"].join("\n"), {
						title: "error-message"
					}), k.style.cssText = ["font-family: Arial, sans-serif", "border: 1px solid #e00", "background-color: #eee", "border-radius: 5px", "-webkit-border-radius: 5px", "-moz-border-radius: 5px", "color: #e00", "padding: 15px", "margin-bottom: 15px"].join(";"), "development" === c.env && (g = setInterval(function() {
						var b = a.document,
							c = b.body;
						c && (b.getElementById(i) ? c.replaceChild(k, b.getElementById(i)) : c.insertBefore(k, c.firstChild), clearInterval(g))
					}, 10))
				}

				function g(b) {
					var c = a.document.getElementById("less-error-message:" + d.extractId(b));
					c && c.parentNode.removeChild(c)
				}

				function h(a) {}

				function i(a) {
					c.errorReporting && "html" !== c.errorReporting ? "console" === c.errorReporting ? h(a) : "function" == typeof c.errorReporting && c.errorReporting("remove", a) : g(a)
				}

				function j(a, d) {
					var e = "{line} {content}",
						f = a.filename || d,
						g = [],
						h = (a.type || "Syntax") + "Error: " + (a.message || "There is an error in your .less file") + " in " + f + " ",
						i = function(a, b, c) {
							void 0 !== a.extract[b] && g.push(e.replace(/\{line\}/, (parseInt(a.line, 10) || 0) + (b - 1)).replace(/\{class\}/, c).replace(/\{content\}/, a.extract[b]))
						};
					a.extract && (i(a, 0, ""), i(a, 1, "line"), i(a, 2, ""), h += "on line " + a.line + ", column " + (a.column + 1) + ":\n" + g.join("\n")), a.stack && (a.extract || c.logLevel >= 4) && (h += "\nStack Trace\n" + a.stack), b.logger.error(h)
				}

				function k(a, b) {
					c.errorReporting && "html" !== c.errorReporting ? "console" === c.errorReporting ? j(a, b) : "function" == typeof c.errorReporting && c.errorReporting("add", a, b) : f(a, b)
				}
				return {
					add: k,
					remove: i
				}
			}
		}, {
			"./browser": 3,
			"./utils": 10
		}],
		6: [function(a, b, c) {
			b.exports = function(b, c) {
				function d() {
					if (window.XMLHttpRequest && !("file:" === window.location.protocol && "ActiveXObject" in window)) return new XMLHttpRequest;
					try {
						return new ActiveXObject("Microsoft.XMLHTTP")
					} catch (a) {
						return c.error("browser doesn't support AJAX."), null
					}
				}
				var e = a("../less/environment/abstract-file-manager.js"),
					f = {},
					g = function() {};
				return g.prototype = new e, g.prototype.alwaysMakePathsAbsolute = function() {
					return !0
				}, g.prototype.join = function(a, b) {
					return a ? this.extractUrlParts(b, a).path : b
				}, g.prototype.doXHR = function(a, e, f, g) {
					function h(b, c, d) {
						b.status >= 200 && 300 > b.status ? c(b.responseText, b.getResponseHeader("Last-Modified")) : "function" == typeof d && d(b.status, a)
					}
					var i = d(),
						j = b.isFileProtocol ? b.fileAsync : !0;
					"function" == typeof i.overrideMimeType && i.overrideMimeType("text/css"), c.debug("XHR: Getting '" + a + "'"), i.open("GET", a, j), i.setRequestHeader("Accept", e || "text/x-less, text/css; q=0.9, */*; q=0.5"), i.send(null), b.isFileProtocol && !b.fileAsync ? 0 === i.status || i.status >= 200 && 300 > i.status ? f(i.responseText) : g(i.status, a) : j ? i.onreadystatechange = function() {
						4 == i.readyState && h(i, f, g)
					} : h(i, f, g)
				}, g.prototype.supports = function(a, b, c, d) {
					return !0
				}, g.prototype.clearFileCache = function() {
					f = {}
				}, g.prototype.loadFile = function(a, b, c, d, e) {
					b && !this.isPathAbsolute(a) && (a = b + a), c = c || {};
					var g = this.extractUrlParts(a, window.location.href),
						h = g.url;
					if (c.useFileCache && f[h]) try {
						var i = f[h];
						e(null, {
							contents: i,
							filename: h,
							webInfo: {
								lastModified: new Date
							}
						})
					} catch (j) {
						e({
							filename: h,
							message: "Error loading file " + h + " error was " + j.message
						})
					} else this.doXHR(h, c.mime, function(a, b) {
						f[h] = a, e(null, {
							contents: a,
							filename: h,
							webInfo: {
								lastModified: b
							}
						})
					}, function(a, b) {
						e({
							type: "File",
							message: "'" + b + "' wasn't found (" + a + ")",
							href: h
						})
					})
				}, g
			}
		}, {
			"../less/environment/abstract-file-manager.js": 15
		}],
		7: [function(a, b, c) {
			b.exports = function() {
				function b() {
					throw {
						type: "Runtime",
						message: "Image size functions are not supported in browser version of less"
					}
				}
				var c = a("./../less/functions/function-registry"),
					d = {
						"image-size": function(a) {
							return b(this, a), -1
						},
						"image-width": function(a) {
							return b(this, a), -1
						},
						"image-height": function(a) {
							return b(this, a), -1
						}
					};
				c.addMultiple(d)
			}
		}, {
			"./../less/functions/function-registry": 22
		}],
		8: [function(a, b, c) {
			var d = a("./utils").addDataAttr,
				e = a("./browser");
			b.exports = function(b, c) {
				function f(a) {
					return c.postProcessor && "function" == typeof c.postProcessor && (a = c.postProcessor.call(a, a) || a), a
				}

				function g(a) {
					var b = {};
					for (var c in a) a.hasOwnProperty(c) && (b[c] = a[c]);
					return b
				}

				function h(a, b) {
					var c = Array.prototype.slice.call(arguments, 2);
					return function() {
						var d = c.concat(Array.prototype.slice.call(arguments, 0));
						return a.apply(b, d)
					}
				}

				function i(a) {
					for (var b, d = m.getElementsByTagName("style"), e = 0; d.length > e; e++)
						if (b = d[e], b.type.match(t)) {
							var f = g(c);
							f.modifyVars = a;
							var i = b.innerHTML || "";
							f.filename = m.location.href.replace(/#.*$/, ""), n.render(i, f, h(function(a, b, c) {
								b ? r.add(b, "inline") : (a.type = "text/css", a.styleSheet ? a.styleSheet.cssText = c.css : a.innerHTML = c.css)
							}, null, b))
						}
				}

				function j(a, b, e, h, i) {
					function j(c) {
						var d = c.contents,
							g = c.filename,
							i = c.webInfo,
							j = {
								currentDirectory: q.getPath(g),
								filename: g,
								rootFilename: g,
								relativeUrls: k.relativeUrls
							};
						if (j.entryPath = j.currentDirectory, j.rootpath = k.rootpath || j.currentDirectory, i) {
							i.remaining = h;
							var l = s.getCSS(g, i, k.modifyVars);
							if (!e && l) return i.local = !0, void b(null, l, d, a, i, g)
						}
						r.remove(g), k.rootFileInfo = j, n.render(d, k, function(c, e) {
							c ? (c.href = g, b(c)) : (e.css = f(e.css), s.setCSS(a.href, i.lastModified, k.modifyVars, e.css), b(null, e.css, d, a, i, g))
						})
					}
					var k = g(c);
					d(k, a), k.mime = a.type, i && (k.modifyVars = i), q.loadFile(a.href, null, k, o, function(a, c) {
						return a ? void b(a) : void j(c)
					})
				}

				function k(a, b, c) {
					for (var d = 0; n.sheets.length > d; d++) j(n.sheets[d], a, b, n.sheets.length - (d + 1), c)
				}

				function l() {
					"development" === n.env && (n.watchTimer = setInterval(function() {
						n.watchMode && (q.clearFileCache(), k(function(a, c, d, f, g) {
							a ? r.add(a, a.href || f.href) : c && e.createCSS(b.document, c, f)
						}))
					}, c.poll))
				}
				var m = b.document,
					n = a("../less")();
				n.options = c;
				var o = n.environment,
					p = a("./file-manager")(c, n.logger),
					q = new p;
				o.addFileManager(q), n.FileManager = p, a("./log-listener")(n, c);
				var r = a("./error-reporting")(b, n, c),
					s = n.cache = c.cache || a("./cache")(b, c, n.logger);
				a("./image-size")(n.environment), c.functions && n.functions.functionRegistry.addMultiple(c.functions);
				var t = /^text\/(x-)?less$/;
				return n.watch = function() {
					return n.watchMode || (n.env = "development", l()), this.watchMode = !0, !0
				}, n.unwatch = function() {
					return clearInterval(n.watchTimer), this.watchMode = !1, !1
				}, n.registerStylesheetsImmediately = function() {
					var a = m.getElementsByTagName("link") || m.getElementsByTagName("style");
					n.sheets = [];
					for (var b = 0; a.length > b; b++)("stylesheet/less" === a[b].rel || a[b].rel.match(/stylesheet/) && a[b].type.match(t)) && n.sheets.push(a[b])
				}, n.registerStylesheets = function() {
					return new Promise(function(a, b) {
						n.registerStylesheetsImmediately(), a()
					})
				}, n.modifyVars = function(a) {
					return n.refresh(!0, a, !1)
				}, n.refresh = function(a, c, d) {
					return (a || d) && d !== !1 && q.clearFileCache(), new Promise(function(d, f) {
						var g, h, j, l;
						g = h = new Date, l = n.sheets.length, 0 === l ? (h = new Date, j = h - g, n.logger.info("Less has finished and no sheets were loaded."), d({
							startTime: g,
							endTime: h,
							totalMilliseconds: j,
							sheets: n.sheets.length
						})) : k(function(a, c, i, k, m) {
							return a ? (r.add(a, a.href || k.href), void f(a)) : (n.logger.info(m.local ? "Loading " + k.href + " from cache." : "Rendered " + k.href + " successfully."), e.createCSS(b.document, c, k), n.logger.info("CSS for " + k.href + " generated in " + (new Date - h) + "ms"), l--, 0 === l && (j = new Date - g, n.logger.info("Less has finished. CSS generated in " + j + "ms"), d({
								startTime: g,
								endTime: h,
								totalMilliseconds: j,
								sheets: n.sheets.length
							})), void(h = new Date))
						}, a, c), i(c)
					})
				}, n.refreshStyles = i, n
			}
		}, {
			"../less": 31,
			"./browser": 3,
			"./cache": 4,
			"./error-reporting": 5,
			"./file-manager": 6,
			"./image-size": 7,
			"./log-listener": 9,
			"./utils": 10
		}],
		9: [function(a, b, c) {
			b.exports = function(a, b) {
				var c = 4,
					d = 3,
					e = 2,
					f = 1;
				b.logLevel = "undefined" != typeof b.logLevel ? b.logLevel : "development" === b.env ? d : f, b.loggers || (b.loggers = [{
					debug: function(a) {
						b.logLevel >= c && console.log(a)
					},
					info: function(a) {
						b.logLevel >= d && console.log(a)
					},
					warn: function(a) {
						b.logLevel >= e && console.warn(a)
					},
					error: function(a) {
						b.logLevel >= f && console.error(a)
					}
				}]);
				for (var g = 0; b.loggers.length > g; g++) a.logger.addListener(b.loggers[g])
			}
		}, {}],
		10: [function(a, b, c) {
			b.exports = {
				extractId: function(a) {
					return a.replace(/^[a-z-]+:\/+?[^\/]+/, "").replace(/[\?\&]livereload=\w+/, "").replace(/^\//, "").replace(/\.[a-zA-Z]+$/, "").replace(/[^\.\w-]+/g, "-").replace(/\./g, ":")
				},
				addDataAttr: function(a, b) {
					for (var c in b.dataset)
						if (b.dataset.hasOwnProperty(c))
							if ("env" === c || "dumpLineNumbers" === c || "rootpath" === c || "errorReporting" === c) a[c] = b.dataset[c];
							else try {
								a[c] = JSON.parse(b.dataset[c])
							} catch (d) {}
				}
			}
		}, {}],
		11: [function(a, b, c) {
			var d = {};
			b.exports = d;
			var e = function(a, b, c) {
					if (a)
						for (var d = 0; c.length > d; d++) a.hasOwnProperty(c[d]) && (b[c[d]] = a[c[d]])
				},
				f = ["paths", "relativeUrls", "rootpath", "strictImports", "insecure", "dumpLineNumbers", "compress", "syncImport", "chunkInput", "mime", "useFileCache", "processImports", "pluginManager"];
			d.Parse = function(a) {
				e(a, this, f), "string" == typeof this.paths && (this.paths = [this.paths])
			};
			var g = ["paths", "compress", "ieCompat", "strictMath", "strictUnits", "sourceMap", "importMultiple", "urlArgs", "javascriptEnabled", "pluginManager", "importantScope"];
			d.Eval = function(a, b) {
				e(a, this, g), "string" == typeof this.paths && (this.paths = [this.paths]), this.frames = b || [], this.importantScope = this.importantScope || []
			}, d.Eval.prototype.inParenthesis = function() {
				this.parensStack || (this.parensStack = []), this.parensStack.push(!0)
			}, d.Eval.prototype.outOfParenthesis = function() {
				this.parensStack.pop()
			}, d.Eval.prototype.isMathOn = function() {
				return this.strictMath ? this.parensStack && this.parensStack.length : !0
			}, d.Eval.prototype.isPathRelative = function(a) {
				return !/^(?:[a-z-]+:|\/|#)/i.test(a)
			}, d.Eval.prototype.normalizePath = function(a) {
				var b, c = a.split("/").reverse();
				for (a = []; 0 !== c.length;) switch (b = c.pop()) {
					case ".":
						break;
					case "..":
						0 === a.length || ".." === a[a.length - 1] ? a.push(b) : a.pop();
						break;
					default:
						a.push(b)
				}
				return a.join("/")
			}
		}, {}],
		12: [function(a, b, c) {
			b.exports = {
				aliceblue: "#f0f8ff",
				antiquewhite: "#faebd7",
				aqua: "#00ffff",
				aquamarine: "#7fffd4",
				azure: "#f0ffff",
				beige: "#f5f5dc",
				bisque: "#ffe4c4",
				black: "#000000",
				blanchedalmond: "#ffebcd",
				blue: "#0000ff",
				blueviolet: "#8a2be2",
				brown: "#a52a2a",
				burlywood: "#deb887",
				cadetblue: "#5f9ea0",
				chartreuse: "#7fff00",
				chocolate: "#d2691e",
				coral: "#ff7f50",
				cornflowerblue: "#6495ed",
				cornsilk: "#fff8dc",
				crimson: "#dc143c",
				cyan: "#00ffff",
				darkblue: "#00008b",
				darkcyan: "#008b8b",
				darkgoldenrod: "#b8860b",
				darkgray: "#a9a9a9",
				darkgrey: "#a9a9a9",
				darkgreen: "#006400",
				darkkhaki: "#bdb76b",
				darkmagenta: "#8b008b",
				darkolivegreen: "#556b2f",
				darkorange: "#ff8c00",
				darkorchid: "#9932cc",
				darkred: "#8b0000",
				darksalmon: "#e9967a",
				darkseagreen: "#8fbc8f",
				darkslateblue: "#483d8b",
				darkslategray: "#2f4f4f",
				darkslategrey: "#2f4f4f",
				darkturquoise: "#00ced1",
				darkviolet: "#9400d3",
				deeppink: "#ff1493",
				deepskyblue: "#00bfff",
				dimgray: "#696969",
				dimgrey: "#696969",
				dodgerblue: "#1e90ff",
				firebrick: "#b22222",
				floralwhite: "#fffaf0",
				forestgreen: "#228b22",
				fuchsia: "#ff00ff",
				gainsboro: "#dcdcdc",
				ghostwhite: "#f8f8ff",
				gold: "#ffd700",
				goldenrod: "#daa520",
				gray: "#808080",
				grey: "#808080",
				green: "#008000",
				greenyellow: "#adff2f",
				honeydew: "#f0fff0",
				hotpink: "#ff69b4",
				indianred: "#cd5c5c",
				indigo: "#4b0082",
				ivory: "#fffff0",
				khaki: "#f0e68c",
				lavender: "#e6e6fa",
				lavenderblush: "#fff0f5",
				lawngreen: "#7cfc00",
				lemonchiffon: "#fffacd",
				lightblue: "#add8e6",
				lightcoral: "#f08080",
				lightcyan: "#e0ffff",
				lightgoldenrodyellow: "#fafad2",
				lightgray: "#d3d3d3",
				lightgrey: "#d3d3d3",
				lightgreen: "#90ee90",
				lightpink: "#ffb6c1",
				lightsalmon: "#ffa07a",
				lightseagreen: "#20b2aa",
				lightskyblue: "#87cefa",
				lightslategray: "#778899",
				lightslategrey: "#778899",
				lightsteelblue: "#b0c4de",
				lightyellow: "#ffffe0",
				lime: "#00ff00",
				limegreen: "#32cd32",
				linen: "#faf0e6",
				magenta: "#ff00ff",
				maroon: "#800000",
				mediumaquamarine: "#66cdaa",
				mediumblue: "#0000cd",
				mediumorchid: "#ba55d3",
				mediumpurple: "#9370d8",
				mediumseagreen: "#3cb371",
				mediumslateblue: "#7b68ee",
				mediumspringgreen: "#00fa9a",
				mediumturquoise: "#48d1cc",
				mediumvioletred: "#c71585",
				midnightblue: "#191970",
				mintcream: "#f5fffa",
				mistyrose: "#ffe4e1",
				moccasin: "#ffe4b5",
				navajowhite: "#ffdead",
				navy: "#000080",
				oldlace: "#fdf5e6",
				olive: "#808000",
				olivedrab: "#6b8e23",
				orange: "#ffa500",
				orangered: "#ff4500",
				orchid: "#da70d6",
				palegoldenrod: "#eee8aa",
				palegreen: "#98fb98",
				paleturquoise: "#afeeee",
				palevioletred: "#d87093",
				papayawhip: "#ffefd5",
				peachpuff: "#ffdab9",
				peru: "#cd853f",
				pink: "#ffc0cb",
				plum: "#dda0dd",
				powderblue: "#b0e0e6",
				purple: "#800080",
				rebeccapurple: "#663399",
				red: "#ff0000",
				rosybrown: "#bc8f8f",
				royalblue: "#4169e1",
				saddlebrown: "#8b4513",
				salmon: "#fa8072",
				sandybrown: "#f4a460",
				seagreen: "#2e8b57",
				seashell: "#fff5ee",
				sienna: "#a0522d",
				silver: "#c0c0c0",
				skyblue: "#87ceeb",
				slateblue: "#6a5acd",
				slategray: "#708090",
				slategrey: "#708090",
				snow: "#fffafa",
				springgreen: "#00ff7f",
				steelblue: "#4682b4",
				tan: "#d2b48c",
				teal: "#008080",
				thistle: "#d8bfd8",
				tomato: "#ff6347",
				turquoise: "#40e0d0",
				violet: "#ee82ee",
				wheat: "#f5deb3",
				white: "#ffffff",
				whitesmoke: "#f5f5f5",
				yellow: "#ffff00",
				yellowgreen: "#9acd32"
			}
		}, {}],
		13: [function(a, b, c) {
			b.exports = {
				colors: a("./colors"),
				unitConversions: a("./unit-conversions")
			}
		}, {
			"./colors": 12,
			"./unit-conversions": 14
		}],
		14: [function(a, b, c) {
			b.exports = {
				length: {
					m: 1,
					cm: .01,
					mm: .001,
					"in": .0254,
					px: .0254 / 96,
					pt: .0254 / 72,
					pc: .0254 / 72 * 12
				},
				duration: {
					s: 1,
					ms: .001
				},
				angle: {
					rad: 1 / (2 * Math.PI),
					deg: 1 / 360,
					grad: .0025,
					turn: 1
				}
			}
		}, {}],
		15: [function(a, b, c) {
			var d = function() {};
			d.prototype.getPath = function(a) {
				var b = a.lastIndexOf("?");
				return b > 0 && (a = a.slice(0, b)), b = a.lastIndexOf("/"), 0 > b && (b = a.lastIndexOf("\\")), 0 > b ? "" : a.slice(0, b + 1)
			}, d.prototype.tryAppendExtension = function(a, b) {
				return /(\.[a-z]*$)|([\?;].*)$/.test(a) ? a : a + b
			}, d.prototype.tryAppendLessExtension = function(a) {
				return this.tryAppendExtension(a, ".less")
			}, d.prototype.supportsSync = function() {
				return !1
			}, d.prototype.alwaysMakePathsAbsolute = function() {
				return !1
			}, d.prototype.isPathAbsolute = function(a) {
				return /^(?:[a-z-]+:|\/|\\|#)/i.test(a)
			}, d.prototype.join = function(a, b) {
				return a ? a + b : b
			}, d.prototype.pathDiff = function(a, b) {
				var c, d, e, f, g = this.extractUrlParts(a),
					h = this.extractUrlParts(b),
					i = "";
				if (g.hostPart !== h.hostPart) return "";
				for (d = Math.max(h.directories.length, g.directories.length), c = 0; d > c && h.directories[c] === g.directories[c]; c++);
				for (f = h.directories.slice(c), e = g.directories.slice(c), c = 0; f.length - 1 > c; c++) i += "../";
				for (c = 0; e.length - 1 > c; c++) i += e[c] + "/";
				return i
			}, d.prototype.extractUrlParts = function(a, b) {
				var c, d, e = /^((?:[a-z-]+:)?\/{2}(?:[^\/\?#]*\/)|([\/\\]))?((?:[^\/\\\?#]*[\/\\])*)([^\/\\\?#]*)([#\?].*)?$/i,
					f = a.match(e),
					g = {},
					h = [];
				if (!f) throw new Error("Could not parse sheet href - '" + a + "'");
				if (b && (!f[1] || f[2])) {
					if (d = b.match(e), !d) throw new Error("Could not parse page url - '" + b + "'");
					f[1] = f[1] || d[1] || "", f[2] || (f[3] = d[3] + f[3])
				}
				if (f[3]) {
					for (h = f[3].replace(/\\/g, "/").split("/"), c = 0; h.length > c; c++) "." === h[c] && (h.splice(c, 1), c -= 1);
					for (c = 0; h.length > c; c++) ".." === h[c] && c > 0 && (h.splice(c - 1, 2), c -= 2)
				}
				return g.hostPart = f[1], g.directories = h, g.path = (f[1] || "") + h.join("/"), g.fileUrl = g.path + (f[4] || ""), g.url = g.fileUrl + (f[5] || ""), g
			}, b.exports = d
		}, {}],
		16: [function(a, b, c) {
			var d = a("../logger"),
				e = function(a, b) {
					this.fileManagers = b || [], a = a || {};
					for (var c = ["encodeBase64", "mimeLookup", "charsetLookup", "getSourceMapGenerator"], d = [], e = d.concat(c), f = 0; e.length > f; f++) {
						var g = e[f],
							h = a[g];
						h ? this[g] = h.bind(a) : d.length > f && this.warn("missing required function in environment - " + g)
					}
				};
			e.prototype.getFileManager = function(a, b, c, e, f) {
				a || d.warn("getFileManager called with no filename.. Please report this issue. continuing."), null == b && d.warn("getFileManager called with null directory.. Please report this issue. continuing.");
				var g = this.fileManagers;
				c.pluginManager && (g = [].concat(g).concat(c.pluginManager.getFileManagers()));
				for (var h = g.length - 1; h >= 0; h--) {
					var i = g[h];
					if (i[f ? "supportsSync" : "supports"](a, b, c, e)) return i
				}
				return null
			}, e.prototype.addFileManager = function(a) {
				this.fileManagers.push(a)
			}, e.prototype.clearFileManagers = function() {
				this.fileManagers = []
			}, b.exports = e
		}, {
			"../logger": 33
		}],
		17: [function(a, b, c) {
			function d(a, b, c) {
				var d, f, g, h, i = b.alpha,
					j = c.alpha,
					k = [];
				g = j + i * (1 - j);
				for (var l = 0; 3 > l; l++) d = b.rgb[l] / 255, f = c.rgb[l] / 255, h = a(d, f), g && (h = (j * f + i * (d - j * (d + f - h))) / g), k[l] = 255 * h;
				return new e(k, g)
			}
			var e = a("../tree/color"),
				f = a("./function-registry"),
				g = {
					multiply: function(a, b) {
						return a * b
					},
					screen: function(a, b) {
						return a + b - a * b
					},
					overlay: function(a, b) {
						return a *= 2, 1 >= a ? g.multiply(a, b) : g.screen(a - 1, b)
					},
					softlight: function(a, b) {
						var c = 1,
							d = a;
						return b > .5 && (d = 1, c = a > .25 ? Math.sqrt(a) : ((16 * a - 12) * a + 4) * a), a - (1 - 2 * b) * d * (c - a)
					},
					hardlight: function(a, b) {
						return g.overlay(b, a)
					},
					difference: function(a, b) {
						return Math.abs(a - b)
					},
					exclusion: function(a, b) {
						return a + b - 2 * a * b
					},
					average: function(a, b) {
						return (a + b) / 2
					},
					negation: function(a, b) {
						return 1 - Math.abs(a + b - 1)
					}
				};
			for (var h in g) g.hasOwnProperty(h) && (d[h] = d.bind(null, g[h]));
			f.addMultiple(d)
		}, {
			"../tree/color": 50,
			"./function-registry": 22
		}],
		18: [function(a, b, c) {
			function d(a) {
				return Math.min(1, Math.max(0, a))
			}

			function e(a) {
				return h.hsla(a.h, a.s, a.l, a.a)
			}

			function f(a) {
				if (a instanceof i) return parseFloat(a.unit.is("%") ? a.value / 100 : a.value);
				if ("number" == typeof a) return a;
				throw {
					type: "Argument",
					message: "color functions take numbers as parameters"
				}
			}

			function g(a, b) {
				return a instanceof i && a.unit.is("%") ? parseFloat(a.value * b / 100) : f(a)
			}
			var h, i = a("../tree/dimension"),
				j = a("../tree/color"),
				k = a("../tree/quoted"),
				l = a("../tree/anonymous"),
				m = a("./function-registry");
			h = {
				rgb: function(a, b, c) {
					return h.rgba(a, b, c, 1)
				},
				rgba: function(a, b, c, d) {
					var e = [a, b, c].map(function(a) {
						return g(a, 255)
					});
					return d = f(d), new j(e, d)
				},
				hsl: function(a, b, c) {
					return h.hsla(a, b, c, 1)
				},
				hsla: function(a, b, c, e) {
					function g(a) {
						return a = 0 > a ? a + 1 : a > 1 ? a - 1 : a, 1 > 6 * a ? i + (j - i) * a * 6 : 1 > 2 * a ? j : 2 > 3 * a ? i + (j - i) * (2 / 3 - a) * 6 : i
					}
					var i, j;
					return a = f(a) % 360 / 360, b = d(f(b)), c = d(f(c)), e = d(f(e)), j = .5 >= c ? c * (b + 1) : c + b - c * b, i = 2 * c - j, h.rgba(255 * g(a + 1 / 3), 255 * g(a), 255 * g(a - 1 / 3), e)
				},
				hsv: function(a, b, c) {
					return h.hsva(a, b, c, 1)
				},
				hsva: function(a, b, c, d) {
					a = f(a) % 360 / 360 * 360, b = f(b), c = f(c), d = f(d);
					var e, g;
					e = Math.floor(a / 60 % 6), g = a / 60 - e;
					var i = [c, c * (1 - b), c * (1 - g * b), c * (1 - (1 - g) * b)],
						j = [
							[0, 3, 1],
							[2, 0, 1],
							[1, 0, 3],
							[1, 2, 0],
							[3, 1, 0],
							[0, 1, 2]
						];
					return h.rgba(255 * i[j[e][0]], 255 * i[j[e][1]], 255 * i[j[e][2]], d)
				},
				hue: function(a) {
					return new i(a.toHSL().h)
				},
				saturation: function(a) {
					return new i(100 * a.toHSL().s, "%")
				},
				lightness: function(a) {
					return new i(100 * a.toHSL().l, "%")
				},
				hsvhue: function(a) {
					return new i(a.toHSV().h)
				},
				hsvsaturation: function(a) {
					return new i(100 * a.toHSV().s, "%")
				},
				hsvvalue: function(a) {
					return new i(100 * a.toHSV().v, "%")
				},
				red: function(a) {
					return new i(a.rgb[0])
				},
				green: function(a) {
					return new i(a.rgb[1])
				},
				blue: function(a) {
					return new i(a.rgb[2])
				},
				alpha: function(a) {
					return new i(a.toHSL().a)
				},
				luma: function(a) {
					return new i(a.luma() * a.alpha * 100, "%")
				},
				luminance: function(a) {
					var b = .2126 * a.rgb[0] / 255 + .7152 * a.rgb[1] / 255 + .0722 * a.rgb[2] / 255;
					return new i(b * a.alpha * 100, "%")
				},
				saturate: function(a, b, c) {
					if (!a.rgb) return null;
					var f = a.toHSL();
					return f.s += "undefined" != typeof c && "relative" === c.value ? f.s * b.value / 100 : b.value / 100, f.s = d(f.s), e(f)
				},
				desaturate: function(a, b, c) {
					var f = a.toHSL();
					return f.s -= "undefined" != typeof c && "relative" === c.value ? f.s * b.value / 100 : b.value / 100, f.s = d(f.s), e(f)
				},
				lighten: function(a, b, c) {
					var f = a.toHSL();
					return f.l += "undefined" != typeof c && "relative" === c.value ? f.l * b.value / 100 : b.value / 100, f.l = d(f.l), e(f)
				},
				darken: function(a, b, c) {
					var f = a.toHSL();
					return f.l -= "undefined" != typeof c && "relative" === c.value ? f.l * b.value / 100 : b.value / 100, f.l = d(f.l), e(f)
				},
				fadein: function(a, b, c) {
					var f = a.toHSL();
					return f.a += "undefined" != typeof c && "relative" === c.value ? f.a * b.value / 100 : b.value / 100, f.a = d(f.a), e(f)
				},
				fadeout: function(a, b, c) {
					var f = a.toHSL();
					return f.a -= "undefined" != typeof c && "relative" === c.value ? f.a * b.value / 100 : b.value / 100, f.a = d(f.a), e(f)
				},
				fade: function(a, b) {
					var c = a.toHSL();
					return c.a = b.value / 100, c.a = d(c.a), e(c)
				},
				spin: function(a, b) {
					var c = a.toHSL(),
						d = (c.h + b.value) % 360;
					return c.h = 0 > d ? 360 + d : d, e(c)
				},
				mix: function(a, b, c) {
					a.toHSL && b.toHSL || (console.log(b.type), console.dir(b)), c || (c = new i(50));
					var d = c.value / 100,
						e = 2 * d - 1,
						f = a.toHSL().a - b.toHSL().a,
						g = ((e * f == -1 ? e : (e + f) / (1 + e * f)) + 1) / 2,
						h = 1 - g,
						k = [a.rgb[0] * g + b.rgb[0] * h, a.rgb[1] * g + b.rgb[1] * h, a.rgb[2] * g + b.rgb[2] * h],
						l = a.alpha * d + b.alpha * (1 - d);
					return new j(k, l)
				},
				greyscale: function(a) {
					return h.desaturate(a, new i(100))
				},
				contrast: function(a, b, c, d) {
					if (!a.rgb) return null;
					"undefined" == typeof b && (b = h.rgba(0, 0, 0, 1)), "undefined" == typeof c && (c = h.rgba(255, 255, 255, 1));
					var e, f, g = a.luma(),
						i = b.luma(),
						j = c.luma();
					return e = g > i ? (g + .05) / (i + .05) : (i + .05) / (g + .05), f = g > j ? (g + .05) / (j + .05) : (j + .05) / (g + .05), e > f ? b : c
				},
				argb: function(a) {
					return new l(a.toARGB())
				},
				color: function(a) {
					if (a instanceof k && /^#([a-f0-9]{6}|[a-f0-9]{3})$/i.test(a.value)) return new j(a.value.slice(1));
					if (a instanceof j || (a = j.fromKeyword(a.value))) return a.value = void 0, a;
					throw {
						type: "Argument",
						message: "argument must be a color keyword or 3/6 digit hex e.g. #FFF"
					}
				},
				tint: function(a, b) {
					return h.mix(h.rgb(255, 255, 255), a, b)
				},
				shade: function(a, b) {
					return h.mix(h.rgb(0, 0, 0), a, b)
				}
			}, m.addMultiple(h)
		}, {
			"../tree/anonymous": 46,
			"../tree/color": 50,
			"../tree/dimension": 56,
			"../tree/quoted": 73,
			"./function-registry": 22
		}],
		19: [function(a, b, c) {
			b.exports = function(b) {
				var c = a("../tree/quoted"),
					d = a("../tree/url"),
					e = a("./function-registry"),
					f = function(a, b) {
						return new d(b, a.index, a.currentFileInfo).eval(a.context)
					},
					g = a("../logger");
				e.add("data-uri", function(a, e) {
					e || (e = a, a = null);
					var h = a && a.value,
						i = e.value,
						j = this.currentFileInfo,
						k = j.relativeUrls ? j.currentDirectory : j.entryPath,
						l = i.indexOf("#"),
						m = ""; - 1 !== l && (m = i.slice(l), i = i.slice(0, l));
					var n = b.getFileManager(i, k, this.context, b, !0);
					if (!n) return f(this, e);
					var o = !1;
					if (a) o = /;base64$/.test(h);
					else {
						if (h = b.mimeLookup(i), "image/svg+xml" === h) o = !1;
						else {
							var p = b.charsetLookup(h);
							o = ["US-ASCII", "UTF-8"].indexOf(p) < 0
						}
						o && (h += ";base64")
					}
					var q = n.loadFileSync(i, k, this.context, b);
					if (!q.contents) return g.warn("Skipped data-uri embedding of " + i + " because file not found"), f(this, e || a);
					var r = q.contents;
					if (o && !b.encodeBase64) return f(this, e);
					r = o ? b.encodeBase64(r) : encodeURIComponent(r);
					var s = "data:" + h + "," + r + m,
						t = 32768;
					return s.length >= t && this.context.ieCompat !== !1 ? (g.warn("Skipped data-uri embedding of " + i + " because its size (" + s.length + " characters) exceeds IE8-safe " + t + " characters!"), f(this, e || a)) : new d(new c('"' + s + '"', s, !1, this.index, this.currentFileInfo), this.index, this.currentFileInfo)
				})
			}
		}, {
			"../logger": 33,
			"../tree/quoted": 73,
			"../tree/url": 80,
			"./function-registry": 22
		}],
		20: [function(a, b, c) {
			var d = a("../tree/keyword"),
				e = a("./function-registry"),
				f = {
					eval: function() {
						var a = this.value_,
							b = this.error_;
						if (b) throw b;
						return null != a ? a ? d.True : d.False : void 0
					},
					value: function(a) {
						this.value_ = a
					},
					error: function(a) {
						this.error_ = a
					},
					reset: function() {
						this.value_ = this.error_ = null
					}
				};
			e.add("default", f.eval.bind(f)), b.exports = f
		}, {
			"../tree/keyword": 65,
			"./function-registry": 22
		}],
		21: [function(a, b, c) {
			var d = a("../tree/expression"),
				e = function(a, b, c, d) {
					this.name = a.toLowerCase(), this.index = c, this.context = b, this.currentFileInfo = d, this.func = b.frames[0].functionRegistry.get(this.name)
				};
			e.prototype.isValid = function() {
				return Boolean(this.func)
			}, e.prototype.call = function(a) {
				return Array.isArray(a) && (a = a.filter(function(a) {
					return "Comment" !== a.type
				}).map(function(a) {
					if ("Expression" === a.type) {
						var b = a.value.filter(function(a) {
							return "Comment" !== a.type
						});
						return 1 === b.length ? b[0] : new d(b)
					}
					return a
				})), this.func.apply(this, a)
			}, b.exports = e
		}, {
			"../tree/expression": 59
		}],
		22: [function(a, b, c) {
			function d(a) {
				return {
					_data: {},
					add: function(a, b) {
						a = a.toLowerCase(), this._data.hasOwnProperty(a), this._data[a] = b
					},
					addMultiple: function(a) {
						Object.keys(a).forEach(function(b) {
							this.add(b, a[b])
						}.bind(this))
					},
					get: function(b) {
						return this._data[b] || a && a.get(b)
					},
					inherit: function() {
						return d(this)
					}
				}
			}
			b.exports = d(null)
		}, {}],
		23: [function(a, b, c) {
			b.exports = function(b) {
				var c = {
					functionRegistry: a("./function-registry"),
					functionCaller: a("./function-caller")
				};
				return a("./default"), a("./color"), a("./color-blending"), a("./data-uri")(b), a("./math"), a("./number"), a("./string"), a("./svg")(b), a("./types"), c
			}
		}, {
			"./color": 18,
			"./color-blending": 17,
			"./data-uri": 19,
			"./default": 20,
			"./function-caller": 21,
			"./function-registry": 22,
			"./math": 25,
			"./number": 26,
			"./string": 27,
			"./svg": 28,
			"./types": 29
		}],
		24: [function(a, b, c) {
			var d = a("../tree/dimension"),
				e = function() {};
			e._math = function(a, b, c) {
				if (!(c instanceof d)) throw {
					type: "Argument",
					message: "argument must be a number"
				};
				return null == b ? b = c.unit : c = c.unify(), new d(a(parseFloat(c.value)), b)
			}, b.exports = e
		}, {
			"../tree/dimension": 56
		}],
		25: [function(a, b, c) {
			var d = a("./function-registry"),
				e = a("./math-helper.js"),
				f = {
					ceil: null,
					floor: null,
					sqrt: null,
					abs: null,
					tan: "",
					sin: "",
					cos: "",
					atan: "rad",
					asin: "rad",
					acos: "rad"
				};
			for (var g in f) f.hasOwnProperty(g) && (f[g] = e._math.bind(null, Math[g], f[g]));
			f.round = function(a, b) {
				var c = "undefined" == typeof b ? 0 : b.value;
				return e._math(function(a) {
					return a.toFixed(c)
				}, null, a)
			}, d.addMultiple(f)
		}, {
			"./function-registry": 22,
			"./math-helper.js": 24
		}],
		26: [function(a, b, c) {
			var d = a("../tree/dimension"),
				e = a("../tree/anonymous"),
				f = a("./function-registry"),
				g = a("./math-helper.js"),
				h = function(a, b) {
					switch (b = Array.prototype.slice.call(b), b.length) {
						case 0:
							throw {
								type: "Argument",
								message: "one or more arguments required"
							}
					}
					var c, f, g, h, i, j, k, l, m = [],
						n = {};
					for (c = 0; b.length > c; c++)
						if (g = b[c], g instanceof d)
							if (h = "" === g.unit.toString() && void 0 !== l ? new d(g.value, l).unify() : g.unify(), j = "" === h.unit.toString() && void 0 !== k ? k : h.unit.toString(), k = "" !== j && void 0 === k || "" !== j && "" === m[0].unify().unit.toString() ? j : k, l = "" !== j && void 0 === l ? g.unit.toString() : l, f = void 0 !== n[""] && "" !== j && j === k ? n[""] : n[j], void 0 !== f) i = "" === m[f].unit.toString() && void 0 !== l ? new d(m[f].value, l).unify() : m[f].unify(), (a && i.value > h.value || !a && h.value > i.value) && (m[f] = g);
							else {
								if (void 0 !== k && j !== k) throw {
									type: "Argument",
									message: "incompatible types"
								};
								n[j] = m.length, m.push(g)
							}
					else Array.isArray(b[c].value) && Array.prototype.push.apply(b, Array.prototype.slice.call(b[c].value));
					return 1 == m.length ? m[0] : (b = m.map(function(a) {
						return a.toCSS(this.context)
					}).join(this.context.compress ? "," : ", "), new e((a ? "min" : "max") + "(" + b + ")"))
				};
			f.addMultiple({
				min: function() {
					return h(!0, arguments)
				},
				max: function() {
					return h(!1, arguments)
				},
				convert: function(a, b) {
					return a.convertTo(b.value)
				},
				pi: function() {
					return new d(Math.PI)
				},
				mod: function(a, b) {
					return new d(a.value % b.value, a.unit)
				},
				pow: function(a, b) {
					if ("number" == typeof a && "number" == typeof b) a = new d(a), b = new d(b);
					else if (!(a instanceof d && b instanceof d)) throw {
						type: "Argument",
						message: "arguments must be numbers"
					};
					return new d(Math.pow(a.value, b.value), a.unit)
				},
				percentage: function(a) {
					var b = g._math(function(a) {
						return 100 * a
					}, "%", a);
					return b
				}
			})
		}, {
			"../tree/anonymous": 46,
			"../tree/dimension": 56,
			"./function-registry": 22,
			"./math-helper.js": 24
		}],
		27: [function(a, b, c) {
			var d = a("../tree/quoted"),
				e = a("../tree/anonymous"),
				f = a("../tree/javascript"),
				g = a("./function-registry");
			g.addMultiple({
				e: function(a) {
					return new e(a instanceof f ? a.evaluated : a.value)
				},
				escape: function(a) {
					return new e(encodeURI(a.value).replace(/=/g, "%3D").replace(/:/g, "%3A").replace(/#/g, "%23").replace(/;/g, "%3B").replace(/\(/g, "%28").replace(/\)/g, "%29"))
				},
				replace: function(a, b, c, e) {
					var f = a.value;
					return c = "Quoted" === c.type ? c.value : c.toCSS(), f = f.replace(new RegExp(b.value, e ? e.value : ""), c), new d(a.quote || "", f, a.escaped)
				},
				"%": function(a) {
					for (var b = Array.prototype.slice.call(arguments, 1), c = a.value, e = 0; b.length > e; e++) c = c.replace(/%[sda]/i, function(a) {
						var c = "Quoted" === b[e].type && a.match(/s/i) ? b[e].value : b[e].toCSS();
						return a.match(/[A-Z]$/) ? encodeURIComponent(c) : c
					});
					return c = c.replace(/%%/g, "%"), new d(a.quote || "", c, a.escaped);
				}
			})
		}, {
			"../tree/anonymous": 46,
			"../tree/javascript": 63,
			"../tree/quoted": 73,
			"./function-registry": 22
		}],
		28: [function(a, b, c) {
			b.exports = function(b) {
				var c = a("../tree/dimension"),
					d = a("../tree/color"),
					e = a("../tree/expression"),
					f = a("../tree/quoted"),
					g = a("../tree/url"),
					h = a("./function-registry");
				h.add("svg-gradient", function(a) {
					function b() {
						throw {
							type: "Argument",
							message: "svg-gradient expects direction, start_color [start_position], [color position,]..., end_color [end_position] or direction, color list"
						}
					}
					var h, i, j, k, l, m, n, o, p = "linear",
						q = 'x="0" y="0" width="1" height="1"',
						r = {
							compress: !1
						},
						s = a.toCSS(r);
					switch (2 == arguments.length ? (2 > arguments[1].value.length && b(), h = arguments[1].value) : 3 > arguments.length ? b() : h = Array.prototype.slice.call(arguments, 1), s) {
						case "to bottom":
							i = 'x1="0%" y1="0%" x2="0%" y2="100%"';
							break;
						case "to right":
							i = 'x1="0%" y1="0%" x2="100%" y2="0%"';
							break;
						case "to bottom right":
							i = 'x1="0%" y1="0%" x2="100%" y2="100%"';
							break;
						case "to top right":
							i = 'x1="0%" y1="100%" x2="100%" y2="0%"';
							break;
						case "ellipse":
						case "ellipse at center":
							p = "radial", i = 'cx="50%" cy="50%" r="75%"', q = 'x="-50" y="-50" width="101" height="101"';
							break;
						default:
							throw {
								type: "Argument",
								message: "svg-gradient direction must be 'to bottom', 'to right', 'to bottom right', 'to top right' or 'ellipse at center'"
							}
					}
					for (j = '<?xml version="1.0" ?><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none"><' + p + 'Gradient id="gradient" gradientUnits="userSpaceOnUse" ' + i + ">", k = 0; h.length > k; k += 1) h[k] instanceof e ? (l = h[k].value[0], m = h[k].value[1]) : (l = h[k], m = void 0), l instanceof d && ((0 === k || k + 1 === h.length) && void 0 === m || m instanceof c) || b(), n = m ? m.toCSS(r) : 0 === k ? "0%" : "100%", o = l.alpha, j += '<stop offset="' + n + '" stop-color="' + l.toRGB() + '"' + (1 > o ? ' stop-opacity="' + o + '"' : "") + "/>";
					return j += "</" + p + "Gradient><rect " + q + ' fill="url(#gradient)" /></svg>', j = encodeURIComponent(j), j = "data:image/svg+xml," + j, new g(new f("'" + j + "'", j, !1, this.index, this.currentFileInfo), this.index, this.currentFileInfo)
				})
			}
		}, {
			"../tree/color": 50,
			"../tree/dimension": 56,
			"../tree/expression": 59,
			"../tree/quoted": 73,
			"../tree/url": 80,
			"./function-registry": 22
		}],
		29: [function(a, b, c) {
			var d = a("../tree/keyword"),
				e = a("../tree/detached-ruleset"),
				f = a("../tree/dimension"),
				g = a("../tree/color"),
				h = a("../tree/quoted"),
				i = a("../tree/anonymous"),
				j = a("../tree/url"),
				k = a("../tree/operation"),
				l = a("./function-registry"),
				m = function(a, b) {
					return a instanceof b ? d.True : d.False
				},
				n = function(a, b) {
					if (void 0 === b) throw {
						type: "Argument",
						message: "missing the required second argument to isunit."
					};
					if (b = "string" == typeof b.value ? b.value : b, "string" != typeof b) throw {
						type: "Argument",
						message: "Second argument to isunit should be a unit or a string."
					};
					return a instanceof f && a.unit.is(b) ? d.True : d.False
				},
				o = function(a) {
					var b = Array.isArray(a.value) ? a.value : Array(a);
					return b
				};
			l.addMultiple({
				isruleset: function(a) {
					return m(a, e)
				},
				iscolor: function(a) {
					return m(a, g)
				},
				isnumber: function(a) {
					return m(a, f)
				},
				isstring: function(a) {
					return m(a, h)
				},
				iskeyword: function(a) {
					return m(a, d)
				},
				isurl: function(a) {
					return m(a, j)
				},
				ispixel: function(a) {
					return n(a, "px")
				},
				ispercentage: function(a) {
					return n(a, "%")
				},
				isem: function(a) {
					return n(a, "em")
				},
				isunit: n,
				unit: function(a, b) {
					if (!(a instanceof f)) throw {
						type: "Argument",
						message: "the first argument to unit must be a number" + (a instanceof k ? ". Have you forgotten parenthesis?" : "")
					};
					return b = b ? b instanceof d ? b.value : b.toCSS() : "", new f(a.value, b)
				},
				"get-unit": function(a) {
					return new i(a.unit)
				},
				extract: function(a, b) {
					return b = b.value - 1, o(a)[b]
				},
				length: function(a) {
					return new f(o(a).length)
				}
			})
		}, {
			"../tree/anonymous": 46,
			"../tree/color": 50,
			"../tree/detached-ruleset": 55,
			"../tree/dimension": 56,
			"../tree/keyword": 65,
			"../tree/operation": 71,
			"../tree/quoted": 73,
			"../tree/url": 80,
			"./function-registry": 22
		}],
		30: [function(a, b, c) {
			var d = a("./contexts"),
				e = a("./parser/parser"),
				f = a("./plugins/function-importer");
			b.exports = function(a) {
				var b = function(a, b) {
					this.rootFilename = b.filename, this.paths = a.paths || [], this.contents = {}, this.contentsIgnoredChars = {}, this.mime = a.mime, this.error = null, this.context = a, this.queue = [], this.files = {}
				};
				return b.prototype.push = function(b, c, g, h, i) {
					var j = this;
					this.queue.push(b);
					var k = function(a, c, d) {
							j.queue.splice(j.queue.indexOf(b), 1);
							var e = d === j.rootFilename;
							h.optional && a ? i(null, {
								rules: []
							}, !1, null) : (j.files[d] = c, a && !j.error && (j.error = a), i(a, c, e, d))
						},
						l = {
							relativeUrls: this.context.relativeUrls,
							entryPath: g.entryPath,
							rootpath: g.rootpath,
							rootFilename: g.rootFilename
						},
						m = a.getFileManager(b, g.currentDirectory, this.context, a);
					if (!m) return void k({
						message: "Could not find a file-manager for " + b
					});
					c && (b = m.tryAppendExtension(b, h.plugin ? ".js" : ".less"));
					var n = function(a) {
							var b = a.filename,
								c = a.contents.replace(/^\uFEFF/, "");
							l.currentDirectory = m.getPath(b), l.relativeUrls && (l.rootpath = m.join(j.context.rootpath || "", m.pathDiff(l.currentDirectory, l.entryPath)), !m.isPathAbsolute(l.rootpath) && m.alwaysMakePathsAbsolute() && (l.rootpath = m.join(l.entryPath, l.rootpath))), l.filename = b;
							var i = new d.Parse(j.context);
							i.processImports = !1, j.contents[b] = c, (g.reference || h.reference) && (l.reference = !0), h.plugin ? new f(i, l).eval(c, function(a, c) {
								k(a, c, b)
							}) : h.inline ? k(null, c, b) : new e(i, j, l).parse(c, function(a, c) {
								k(a, c, b)
							})
						},
						o = m.loadFile(b, g.currentDirectory, this.context, a, function(a, b) {
							a ? k(a) : n(b)
						});
					o && o.then(n, k)
				}, b
			}
		}, {
			"./contexts": 11,
			"./parser/parser": 38,
			"./plugins/function-importer": 40
		}],
		31: [function(a, b, c) {
			b.exports = function(b, c) {
				var d, e, f, g, h, i = {
					version: [2, 7, 1],
					data: a("./data"),
					tree: a("./tree"),
					Environment: h = a("./environment/environment"),
					AbstractFileManager: a("./environment/abstract-file-manager"),
					environment: b = new h(b, c),
					visitors: a("./visitors"),
					Parser: a("./parser/parser"),
					functions: a("./functions")(b),
					contexts: a("./contexts"),
					SourceMapOutput: d = a("./source-map-output")(b),
					SourceMapBuilder: e = a("./source-map-builder")(d, b),
					ParseTree: f = a("./parse-tree")(e),
					ImportManager: g = a("./import-manager")(b),
					render: a("./render")(b, f, g),
					parse: a("./parse")(b, f, g),
					LessError: a("./less-error"),
					transformTree: a("./transform-tree"),
					utils: a("./utils"),
					PluginManager: a("./plugin-manager"),
					logger: a("./logger")
				};
				return i
			}
		}, {
			"./contexts": 11,
			"./data": 13,
			"./environment/abstract-file-manager": 15,
			"./environment/environment": 16,
			"./functions": 23,
			"./import-manager": 30,
			"./less-error": 32,
			"./logger": 33,
			"./parse": 35,
			"./parse-tree": 34,
			"./parser/parser": 38,
			"./plugin-manager": 39,
			"./render": 41,
			"./source-map-builder": 42,
			"./source-map-output": 43,
			"./transform-tree": 44,
			"./tree": 62,
			"./utils": 83,
			"./visitors": 87
		}],
		32: [function(a, b, c) {
			var d = a("./utils"),
				e = b.exports = function(a, b, c) {
					Error.call(this);
					var e = a.filename || c;
					if (b && e) {
						var f = b.contents[e],
							g = d.getLocation(a.index, f),
							h = g.line,
							i = g.column,
							j = a.call && d.getLocation(a.call, f).line,
							k = f.split("\n");
						this.type = a.type || "Syntax", this.filename = e, this.index = a.index, this.line = "number" == typeof h ? h + 1 : null, this.callLine = j + 1, this.callExtract = k[j], this.column = i, this.extract = [k[h - 1], k[h], k[h + 1]]
					}
					this.message = a.message, this.stack = a.stack
				};
			if ("undefined" == typeof Object.create) {
				var f = function() {};
				f.prototype = Error.prototype, e.prototype = new f
			} else e.prototype = Object.create(Error.prototype);
			e.prototype.constructor = e
		}, {
			"./utils": 83
		}],
		33: [function(a, b, c) {
			b.exports = {
				error: function(a) {
					this._fireEvent("error", a)
				},
				warn: function(a) {
					this._fireEvent("warn", a)
				},
				info: function(a) {
					this._fireEvent("info", a)
				},
				debug: function(a) {
					this._fireEvent("debug", a)
				},
				addListener: function(a) {
					this._listeners.push(a)
				},
				removeListener: function(a) {
					for (var b = 0; this._listeners.length > b; b++)
						if (this._listeners[b] === a) return void this._listeners.splice(b, 1)
				},
				_fireEvent: function(a, b) {
					for (var c = 0; this._listeners.length > c; c++) {
						var d = this._listeners[c][a];
						d && d(b)
					}
				},
				_listeners: []
			}
		}, {}],
		34: [function(a, b, c) {
			var d = a("./less-error"),
				e = a("./transform-tree"),
				f = a("./logger");
			b.exports = function(a) {
				var b = function(a, b) {
					this.root = a, this.imports = b
				};
				return b.prototype.toCSS = function(b) {
					var c, g, h = {};
					try {
						c = e(this.root, b)
					} catch (i) {
						throw new d(i, this.imports)
					}
					try {
						var j = Boolean(b.compress);
						j && f.warn("The compress option has been deprecated. We recommend you use a dedicated css minifier, for instance see less-plugin-clean-css.");
						var k = {
							compress: j,
							dumpLineNumbers: b.dumpLineNumbers,
							strictUnits: Boolean(b.strictUnits),
							numPrecision: 8
						};
						b.sourceMap ? (g = new a(b.sourceMap), h.css = g.toCSS(c, k, this.imports)) : h.css = c.toCSS(k)
					} catch (i) {
						throw new d(i, this.imports)
					}
					if (b.pluginManager)
						for (var l = b.pluginManager.getPostProcessors(), m = 0; l.length > m; m++) h.css = l[m].process(h.css, {
							sourceMap: g,
							options: b,
							imports: this.imports
						});
					b.sourceMap && (h.map = g.getExternalSourceMap()), h.imports = [];
					for (var n in this.imports.files) this.imports.files.hasOwnProperty(n) && n !== this.imports.rootFilename && h.imports.push(n);
					return h
				}, b
			}
		}, {
			"./less-error": 32,
			"./logger": 33,
			"./transform-tree": 44
		}],
		35: [function(a, b, c) {
			var d, e = a("./contexts"),
				f = a("./parser/parser"),
				g = a("./plugin-manager");
			b.exports = function(b, c, h) {
				var i = function(b, c, j) {
					if (c = c || {}, "function" == typeof c && (j = c, c = {}), !j) {
						d || (d = "undefined" == typeof Promise ? a("promise") : Promise);
						var k = this;
						return new d(function(a, d) {
							i.call(k, b, c, function(b, c) {
								b ? d(b) : a(c)
							})
						})
					}
					var l, m, n = new g(this);
					if (n.addPlugins(c.plugins), c.pluginManager = n, l = new e.Parse(c), c.rootFileInfo) m = c.rootFileInfo;
					else {
						var o = c.filename || "input",
							p = o.replace(/[^\/\\]*$/, "");
						m = {
							filename: o,
							relativeUrls: l.relativeUrls,
							rootpath: l.rootpath || "",
							currentDirectory: p,
							entryPath: p,
							rootFilename: o
						}, m.rootpath && "/" !== m.rootpath.slice(-1) && (m.rootpath += "/")
					}
					var q = new h(l, m);
					new f(l, q, m).parse(b, function(a, b) {
						return a ? j(a) : void j(null, b, q, c)
					}, c)
				};
				return i
			}
		}, {
			"./contexts": 11,
			"./parser/parser": 38,
			"./plugin-manager": 39,
			promise: void 0
		}],
		36: [function(a, b, c) {
			b.exports = function(a, b) {
				function c(b) {
					var c = h - q;
					512 > c && !b || !c || (p.push(a.slice(q, h + 1)), q = h + 1)
				}
				var d, e, f, g, h, i, j, k, l, m = a.length,
					n = 0,
					o = 0,
					p = [],
					q = 0;
				for (h = 0; m > h; h++)
					if (j = a.charCodeAt(h), !(j >= 97 && 122 >= j || 34 > j)) switch (j) {
						case 40:
							o++, e = h;
							continue;
						case 41:
							if (--o < 0) return b("missing opening `(`", h);
							continue;
						case 59:
							o || c();
							continue;
						case 123:
							n++, d = h;
							continue;
						case 125:
							if (--n < 0) return b("missing opening `{`", h);
							n || o || c();
							continue;
						case 92:
							if (m - 1 > h) {
								h++;
								continue
							}
							return b("unescaped `\\`", h);
						case 34:
						case 39:
						case 96:
							for (l = 0, i = h, h += 1; m > h; h++)
								if (k = a.charCodeAt(h), !(k > 96)) {
									if (k == j) {
										l = 1;
										break
									}
									if (92 == k) {
										if (h == m - 1) return b("unescaped `\\`", h);
										h++
									}
								}
							if (l) continue;
							return b("unmatched `" + String.fromCharCode(j) + "`", i);
						case 47:
							if (o || h == m - 1) continue;
							if (k = a.charCodeAt(h + 1), 47 == k)
								for (h += 2; m > h && (k = a.charCodeAt(h), !(13 >= k) || 10 != k && 13 != k); h++);
							else if (42 == k) {
								for (f = i = h, h += 2; m - 1 > h && (k = a.charCodeAt(h), 125 == k && (g = h), 42 != k || 47 != a.charCodeAt(h + 1)); h++);
								if (h == m - 1) return b("missing closing `*/`", i);
								h++
							}
							continue;
						case 42:
							if (m - 1 > h && 47 == a.charCodeAt(h + 1)) return b("unmatched `/*`", h);
							continue
					}
					return 0 !== n ? f > d && g > f ? b("missing closing `}` or `*/`", d) : b("missing closing `}`", d) : 0 !== o ? b("missing closing `)`", e) : (c(!0), p)
			}
		}, {}],
		37: [function(a, b, c) {
			var d = a("./chunker");
			b.exports = function() {
				function a(d) {
					for (var e, f, j, p = k.i, q = c, s = k.i - i, t = k.i + h.length - s, u = k.i += d, v = b; t > k.i; k.i++) {
						if (e = v.charCodeAt(k.i), k.autoCommentAbsorb && e === r) {
							if (f = v.charAt(k.i + 1), "/" === f) {
								j = {
									index: k.i,
									isLineComment: !0
								};
								var w = v.indexOf("\n", k.i + 2);
								0 > w && (w = t), k.i = w, j.text = v.substr(j.index, k.i - j.index), k.commentStore.push(j);
								continue
							}
							if ("*" === f) {
								var x = v.indexOf("*/", k.i + 2);
								if (x >= 0) {
									j = {
										index: k.i,
										text: v.substr(k.i, x + 2 - k.i),
										isLineComment: !1
									}, k.i += j.text.length - 1, k.commentStore.push(j);
									continue
								}
							}
							break
						}
						if (e !== l && e !== n && e !== m && e !== o) break
					}
					if (h = h.slice(d + k.i - u + s), i = k.i, !h.length) {
						if (g.length - 1 > c) return h = g[++c], a(0), !0;
						k.finished = !0
					}
					return p !== k.i || q !== c
				}
				var b, c, e, f, g, h, i, j = [],
					k = {},
					l = 32,
					m = 9,
					n = 10,
					o = 13,
					p = 43,
					q = 44,
					r = 47,
					s = 57;
				return k.save = function() {
					i = k.i, j.push({
						current: h,
						i: k.i,
						j: c
					})
				}, k.restore = function(a) {
					(k.i > e || k.i === e && a && !f) && (e = k.i, f = a);
					var b = j.pop();
					h = b.current, i = k.i = b.i, c = b.j
				}, k.forget = function() {
					j.pop()
				}, k.isWhitespace = function(a) {
					var c = k.i + (a || 0),
						d = b.charCodeAt(c);
					return d === l || d === o || d === m || d === n
				}, k.$re = function(b) {
					k.i > i && (h = h.slice(k.i - i), i = k.i);
					var c = b.exec(h);
					return c ? (a(c[0].length), "string" == typeof c ? c : 1 === c.length ? c[0] : c) : null
				}, k.$char = function(c) {
					return b.charAt(k.i) !== c ? null : (a(1), c)
				}, k.$str = function(c) {
					for (var d = c.length, e = 0; d > e; e++)
						if (b.charAt(k.i + e) !== c.charAt(e)) return null;
					return a(d), c
				}, k.$quoted = function() {
					var c = b.charAt(k.i);
					if ("'" === c || '"' === c) {
						for (var d = b.length, e = k.i, f = 1; d > f + e; f++) {
							var g = b.charAt(f + e);
							switch (g) {
								case "\\":
									f++;
									continue;
								case "\r":
								case "\n":
									break;
								case c:
									var h = b.substr(e, f + 1);
									return a(f + 1), h
							}
						}
						return null
					}
				}, k.autoCommentAbsorb = !0, k.commentStore = [], k.finished = !1, k.peek = function(a) {
					if ("string" == typeof a) {
						for (var c = 0; a.length > c; c++)
							if (b.charAt(k.i + c) !== a.charAt(c)) return !1;
						return !0
					}
					return a.test(h)
				}, k.peekChar = function(a) {
					return b.charAt(k.i) === a
				}, k.currentChar = function() {
					return b.charAt(k.i)
				}, k.getInput = function() {
					return b
				}, k.peekNotNumeric = function() {
					var a = b.charCodeAt(k.i);
					return a > s || p > a || a === r || a === q
				}, k.start = function(f, j, l) {
					b = f, k.i = c = i = e = 0, g = j ? d(f, l) : [f], h = g[0], a(0)
				}, k.end = function() {
					var a, c = k.i >= b.length;
					return e > k.i && (a = f, k.i = e), {
						isFinished: c,
						furthest: k.i,
						furthestPossibleErrorMessage: a,
						furthestReachedEnd: k.i >= b.length - 1,
						furthestChar: b[k.i]
					}
				}, k
			}
		}, {
			"./chunker": 36
		}],
		38: [function(a, b, c) {
			var d = a("../less-error"),
				e = a("../tree"),
				f = a("../visitors"),
				g = a("./parser-input"),
				h = a("../utils"),
				i = function j(a, b, c) {
					function i(a, e) {
						throw new d({
							index: o.i,
							filename: c.filename,
							type: e || "Syntax",
							message: a
						}, b)
					}

					function k(a, b, c) {
						var d = a instanceof Function ? a.call(n) : o.$re(a);
						return d ? d : void i(b || ("string" == typeof a ? "expected '" + a + "' got '" + o.currentChar() + "'" : "unexpected token"))
					}

					function l(a, b) {
						return o.$char(a) ? a : void i(b || "expected '" + a + "' got '" + o.currentChar() + "'")
					}

					function m(a) {
						var b = c.filename;
						return {
							lineNumber: h.getLocation(a, o.getInput()).line + 1,
							fileName: b
						}
					}
					var n, o = g();
					return {
						parse: function(g, h, i) {
							var k, l, m, n, p = null,
								q = "";
							if (l = i && i.globalVars ? j.serializeVars(i.globalVars) + "\n" : "", m = i && i.modifyVars ? "\n" + j.serializeVars(i.modifyVars) : "", a.pluginManager)
								for (var r = a.pluginManager.getPreProcessors(), s = 0; r.length > s; s++) g = r[s].process(g, {
									context: a,
									imports: b,
									fileInfo: c
								});
							(l || i && i.banner) && (q = (i && i.banner ? i.banner : "") + l, n = b.contentsIgnoredChars, n[c.filename] = n[c.filename] || 0, n[c.filename] += q.length), g = g.replace(/\r\n?/g, "\n"), g = q + g.replace(/^\uFEFF/, "") + m, b.contents[c.filename] = g;
							try {
								o.start(g, a.chunkInput, function(a, e) {
									throw new d({
										index: e,
										type: "Parse",
										message: a,
										filename: c.filename
									}, b)
								}), k = new e.Ruleset(null, this.parsers.primary()), k.root = !0, k.firstRoot = !0
							} catch (t) {
								return h(new d(t, b, c.filename))
							}
							var u = o.end();
							if (!u.isFinished) {
								var v = u.furthestPossibleErrorMessage;
								v || (v = "Unrecognised input", "}" === u.furthestChar ? v += ". Possibly missing opening '{'" : ")" === u.furthestChar ? v += ". Possibly missing opening '('" : u.furthestReachedEnd && (v += ". Possibly missing something")), p = new d({
									type: "Parse",
									message: v,
									index: u.furthest,
									filename: c.filename
								}, b)
							}
							var w = function(a) {
								return a = p || a || b.error, a ? (a instanceof d || (a = new d(a, b, c.filename)), h(a)) : h(null, k)
							};
							return a.processImports === !1 ? w() : void new f.ImportVisitor(b, w).run(k)
						},
						parsers: n = {
							primary: function() {
								for (var a, b = this.mixin, c = [];;) {
									for (;;) {
										if (a = this.comment(), !a) break;
										c.push(a)
									}
									if (o.finished) break;
									if (o.peek("}")) break;
									if (a = this.extendRule()) c = c.concat(a);
									else if (a = b.definition() || this.rule() || this.ruleset() || b.call() || this.rulesetCall() || this.entities.call() || this.directive()) c.push(a);
									else {
										for (var d = !1; o.$char(";");) d = !0;
										if (!d) break
									}
								}
								return c
							},
							comment: function() {
								if (o.commentStore.length) {
									var a = o.commentStore.shift();
									return new e.Comment(a.text, a.isLineComment, a.index, c)
								}
							},
							entities: {
								quoted: function() {
									var a, b = o.i,
										d = !1;
									return o.save(), o.$char("~") && (d = !0), (a = o.$quoted()) ? (o.forget(), new e.Quoted(a.charAt(0), a.substr(1, a.length - 2), d, b, c)) : void o.restore()
								},
								keyword: function() {
									var a = o.$char("%") || o.$re(/^[_A-Za-z-][_A-Za-z0-9-]*/);
									return a ? e.Color.fromKeyword(a) || new e.Keyword(a) : void 0
								},
								call: function() {
									var a, b, d, f, g = o.i;
									if (!o.peek(/^url\(/i)) return o.save(), (a = o.$re(/^([\w-]+|%|progid:[\w\.]+)\(/)) ? (a = a[1], b = a.toLowerCase(), "alpha" === b && (f = n.alpha()) ? (o.forget(), f) : (d = this.arguments(), o.$char(")") ? (o.forget(), new e.Call(a, d, g, c)) : void o.restore("Could not parse call arguments or missing ')'"))) : void o.forget()
								},
								arguments: function() {
									var a, b, c, d = [],
										f = [],
										g = [];
									for (o.save();;) {
										if (c = n.detachedRuleset() || this.assignment() || n.expression(), !c) break;
										b = c, c.value && 1 == c.value.length && (b = c.value[0]), b && g.push(b), f.push(b), o.$char(",") || (o.$char(";") || a) && (a = !0, g.length > 1 && (b = new e.Value(g)), d.push(b), g = [])
									}
									return o.forget(), a ? d : f
								},
								literal: function() {
									return this.dimension() || this.color() || this.quoted() || this.unicodeDescriptor()
								},
								assignment: function() {
									var a, b;
									return o.save(), (a = o.$re(/^\w+(?=\s?=)/i)) && o.$char("=") && (b = n.entity()) ? (o.forget(), new e.Assignment(a, b)) : void o.restore()
								},
								url: function() {
									var a, b = o.i;
									return o.autoCommentAbsorb = !1, o.$str("url(") ? (a = this.quoted() || this.variable() || o.$re(/^(?:(?:\\[\(\)'"])|[^\(\)'"])+/) || "", o.autoCommentAbsorb = !0, l(")"), new e.URL(null != a.value || a instanceof e.Variable ? a : new e.Anonymous(a), b, c)) : void(o.autoCommentAbsorb = !0)
								},
								variable: function() {
									var a, b = o.i;
									return "@" === o.currentChar() && (a = o.$re(/^@@?[\w-]+/)) ? new e.Variable(a, b, c) : void 0
								},
								variableCurly: function() {
									var a, b = o.i;
									return "@" === o.currentChar() && (a = o.$re(/^@\{([\w-]+)\}/)) ? new e.Variable("@" + a[1], b, c) : void 0
								},
								color: function() {
									var a;
									if ("#" === o.currentChar() && (a = o.$re(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/))) {
										var b = a.input.match(/^#([\w]+).*/);
										return b = b[1], b.match(/^[A-Fa-f0-9]+$/) || i("Invalid HEX color code"), new e.Color(a[1], void 0, "#" + b)
									}
								},
								colorKeyword: function() {
									o.save();
									var a = o.autoCommentAbsorb;
									o.autoCommentAbsorb = !1;
									var b = o.$re(/^[_A-Za-z-][_A-Za-z0-9-]+/);
									if (o.autoCommentAbsorb = a, !b) return void o.forget();
									o.restore();
									var c = e.Color.fromKeyword(b);
									return c ? (o.$str(b), c) : void 0
								},
								dimension: function() {
									if (!o.peekNotNumeric()) {
										var a = o.$re(/^([+-]?\d*\.?\d+)(%|[a-z_]+)?/i);
										return a ? new e.Dimension(a[1], a[2]) : void 0
									}
								},
								unicodeDescriptor: function() {
									var a;
									return a = o.$re(/^U\+[0-9a-fA-F?]+(\-[0-9a-fA-F?]+)?/), a ? new e.UnicodeDescriptor(a[0]) : void 0
								},
								javascript: function() {
									var a, b = o.i;
									o.save();
									var d = o.$char("~"),
										f = o.$char("`");
									return f ? (a = o.$re(/^[^`]*`/)) ? (o.forget(), new e.JavaScript(a.substr(0, a.length - 1), Boolean(d), b, c)) : void o.restore("invalid javascript definition") : void o.restore()
								}
							},
							variable: function() {
								var a;
								return "@" === o.currentChar() && (a = o.$re(/^(@[\w-]+)\s*:/)) ? a[1] : void 0
							},
							rulesetCall: function() {
								var a;
								return "@" === o.currentChar() && (a = o.$re(/^(@[\w-]+)\(\s*\)\s*;/)) ? new e.RulesetCall(a[1]) : void 0
							},
							extend: function(a) {
								var b, d, f, g, h, j = o.i;
								if (o.$str(a ? "&:extend(" : ":extend(")) {
									do {
										for (f = null, b = null; !(f = o.$re(/^(all)(?=\s*(\)|,))/)) && (d = this.element());) b ? b.push(d) : b = [d];
										f = f && f[1], b || i("Missing target selector for :extend()."), h = new e.Extend(new e.Selector(b), f, j, c), g ? g.push(h) : g = [h]
									} while (o.$char(","));
									return k(/^\)/), a && k(/^;/), g
								}
							},
							extendRule: function() {
								return this.extend(!0)
							},
							mixin: {
								call: function() {
									var a, b, d, f, g, h, i = o.currentChar(),
										j = !1,
										k = o.i;
									if ("." === i || "#" === i) {
										for (o.save();;) {
											if (a = o.i, f = o.$re(/^[#.](?:[\w-]|\\(?:[A-Fa-f0-9]{1,6} ?|[^A-Fa-f0-9]))+/), !f) break;
											d = new e.Element(g, f, a, c), b ? b.push(d) : b = [d], g = o.$char(">")
										}
										return b && (o.$char("(") && (h = this.args(!0).args, l(")")), n.important() && (j = !0), n.end()) ? (o.forget(), new e.mixin.Call(b, h, k, c, j)) : void o.restore()
									}
								},
								args: function(a) {
									var b, c, d, f, g, h, j, k = n.entities,
										l = {
											args: null,
											variadic: !1
										},
										m = [],
										p = [],
										q = [];
									for (o.save();;) {
										if (a) h = n.detachedRuleset() || n.expression();
										else {
											if (o.commentStore.length = 0, o.$str("...")) {
												l.variadic = !0, o.$char(";") && !b && (b = !0), (b ? p : q).push({
													variadic: !0
												});
												break
											}
											h = k.variable() || k.literal() || k.keyword()
										}
										if (!h) break;
										f = null, h.throwAwayComments && h.throwAwayComments(), g = h;
										var r = null;
										if (a ? h.value && 1 == h.value.length && (r = h.value[0]) : r = h, r && r instanceof e.Variable)
											if (o.$char(":")) {
												if (m.length > 0 && (b && i("Cannot mix ; and , as delimiter types"), c = !0), g = n.detachedRuleset() || n.expression(), !g) {
													if (!a) return o.restore(), l.args = [], l;
													i("could not understand value for named argument")
												}
												f = d = r.name
											} else if (o.$str("...")) {
											if (!a) {
												l.variadic = !0, o.$char(";") && !b && (b = !0), (b ? p : q).push({
													name: h.name,
													variadic: !0
												});
												break
											}
											j = !0
										} else a || (d = f = r.name, g = null);
										g && m.push(g), q.push({
											name: f,
											value: g,
											expand: j
										}), o.$char(",") || (o.$char(";") || b) && (c && i("Cannot mix ; and , as delimiter types"), b = !0, m.length > 1 && (g = new e.Value(m)), p.push({
											name: d,
											value: g,
											expand: j
										}), d = null, m = [], c = !1)
									}
									return o.forget(), l.args = b ? p : q, l
								},
								definition: function() {
									var a, b, c, d, f = [],
										g = !1;
									if (!("." !== o.currentChar() && "#" !== o.currentChar() || o.peek(/^[^{]*\}/)))
										if (o.save(), b = o.$re(/^([#.](?:[\w-]|\\(?:[A-Fa-f0-9]{1,6} ?|[^A-Fa-f0-9]))+)\s*\(/)) {
											a = b[1];
											var h = this.args(!1);
											if (f = h.args, g = h.variadic, !o.$char(")")) return void o.restore("Missing closing ')'");
											if (o.commentStore.length = 0, o.$str("when") && (d = k(n.conditions, "expected condition")), c = n.block()) return o.forget(), new e.mixin.Definition(a, f, c, d, g);
											o.restore()
										} else o.forget()
								}
							},
							entity: function() {
								var a = this.entities;
								return this.comment() || a.literal() || a.variable() || a.url() || a.call() || a.keyword() || a.javascript()
							},
							end: function() {
								return o.$char(";") || o.peek("}")
							},
							alpha: function() {
								var a;
								if (o.$re(/^opacity=/i)) return a = o.$re(/^\d+/), a || (a = k(this.entities.variable, "Could not parse alpha")), l(")"), new e.Alpha(a)
							},
							element: function() {
								var a, b, d, f = o.i;
								return b = this.combinator(), a = o.$re(/^(?:\d+\.\d+|\d+)%/) || o.$re(/^(?:[.#]?|:*)(?:[\w-]|[^\x00-\x9f]|\\(?:[A-Fa-f0-9]{1,6} ?|[^A-Fa-f0-9]))+/) || o.$char("*") || o.$char("&") || this.attribute() || o.$re(/^\([^&()@]+\)/) || o.$re(/^[\.#:](?=@)/) || this.entities.variableCurly(), a || (o.save(), o.$char("(") ? (d = this.selector()) && o.$char(")") ? (a = new e.Paren(d), o.forget()) : o.restore("Missing closing ')'") : o.forget()), a ? new e.Element(b, a, f, c) : void 0
							},
							combinator: function() {
								var a = o.currentChar();
								if ("/" === a) {
									o.save();
									var b = o.$re(/^\/[a-z]+\//i);
									if (b) return o.forget(), new e.Combinator(b);
									o.restore()
								}
								if (">" === a || "+" === a || "~" === a || "|" === a || "^" === a) {
									for (o.i++, "^" === a && "^" === o.currentChar() && (a = "^^", o.i++); o.isWhitespace();) o.i++;
									return new e.Combinator(a)
								}
								return new e.Combinator(o.isWhitespace(-1) ? " " : null)
							},
							lessSelector: function() {
								return this.selector(!0)
							},
							selector: function(a) {
								for (var b, d, f, g, h, j, l, m = o.i;
									(a && (d = this.extend()) || a && (j = o.$str("when")) || (g = this.element())) && (j ? l = k(this.conditions, "expected condition") : l ? i("CSS guard can only be used at the end of selector") : d ? h = h ? h.concat(d) : d : (h && i("Extend can only be used at the end of selector"), f = o.currentChar(), b ? b.push(g) : b = [g], g = null), "{" !== f && "}" !== f && ";" !== f && "," !== f && ")" !== f););
								return b ? new e.Selector(b, h, l, m, c) : void(h && i("Extend must be used to extend a selector, it cannot be used on its own"))
							},
							attribute: function() {
								if (o.$char("[")) {
									var a, b, c, d = this.entities;
									return (a = d.variableCurly()) || (a = k(/^(?:[_A-Za-z0-9-\*]*\|)?(?:[_A-Za-z0-9-]|\\.)+/)), c = o.$re(/^[|~*$^]?=/), c && (b = d.quoted() || o.$re(/^[0-9]+%/) || o.$re(/^[\w-]+/) || d.variableCurly()), l("]"), new e.Attribute(a, c, b)
								}
							},
							block: function() {
								var a;
								return o.$char("{") && (a = this.primary()) && o.$char("}") ? a : void 0
							},
							blockRuleset: function() {
								var a = this.block();
								return a && (a = new e.Ruleset(null, a)), a
							},
							detachedRuleset: function() {
								var a = this.blockRuleset();
								return a ? new e.DetachedRuleset(a) : void 0
							},
							ruleset: function() {
								var b, c, d, f;
								for (o.save(), a.dumpLineNumbers && (f = m(o.i));;) {
									if (c = this.lessSelector(), !c) break;
									if (b ? b.push(c) : b = [c], o.commentStore.length = 0, c.condition && b.length > 1 && i("Guards are only currently allowed on a single selector."), !o.$char(",")) break;
									c.condition && i("Guards are only currently allowed on a single selector."), o.commentStore.length = 0
								}
								if (b && (d = this.block())) {
									o.forget();
									var g = new e.Ruleset(b, d, a.strictImports);
									return a.dumpLineNumbers && (g.debugInfo = f), g
								}
								o.restore()
							},
							rule: function(b) {
								var d, f, g, h, i, j = o.i,
									k = o.currentChar();
								if ("." !== k && "#" !== k && "&" !== k && ":" !== k)
									if (o.save(), d = this.variable() || this.ruleProperty()) {
										if (i = "string" == typeof d, i && (f = this.detachedRuleset()), o.commentStore.length = 0, !f) {
											h = !i && d.length > 1 && d.pop().value;
											var l = !b && (a.compress || i);
											if (l && (f = this.value()), !f && (f = this.anonymousValue())) return o.forget(), new e.Rule(d, f, !1, h, j, c);
											l || f || (f = this.value()), g = this.important()
										}
										if (f && this.end()) return o.forget(), new e.Rule(d, f, g, h, j, c);
										if (o.restore(), f && !b) return this.rule(!0)
									} else o.forget()
							},
							anonymousValue: function() {
								var a = o.$re(/^([^@+\/'"*`(;{}-]*);/);
								return a ? new e.Anonymous(a[1]) : void 0
							},
							"import": function() {
								var a, b, d = o.i,
									f = o.$re(/^@import?\s+/);
								if (f) {
									var g = (f ? this.importOptions() : null) || {};
									if (a = this.entities.quoted() || this.entities.url()) return b = this.mediaFeatures(), o.$char(";") || (o.i = d, i("missing semi-colon or unrecognised media features on import")), b = b && new e.Value(b), new e.Import(a, b, g, d, c);
									o.i = d, i("malformed import statement")
								}
							},
							importOptions: function() {
								var a, b, c, d = {};
								if (!o.$char("(")) return null;
								do
									if (a = this.importOption()) {
										switch (b = a, c = !0, b) {
											case "css":
												b = "less", c = !1;
												break;
											case "once":
												b = "multiple", c = !1
										}
										if (d[b] = c, !o.$char(",")) break
									}
								while (a);
								return l(")"), d
							},
							importOption: function() {
								var a = o.$re(/^(less|css|multiple|once|inline|reference|optional)/);
								return a ? a[1] : void 0
							},
							mediaFeature: function() {
								var a, b, d = this.entities,
									f = [];
								o.save();
								do a = d.keyword() || d.variable(), a ? f.push(a) : o.$char("(") && (b = this.property(), a = this.value(), o.$char(")") ? b && a ? f.push(new e.Paren(new e.Rule(b, a, null, null, o.i, c, !0))) : a ? f.push(new e.Paren(a)) : i("badly formed media feature definition") : i("Missing closing ')'", "Parse")); while (a);
								return o.forget(), f.length > 0 ? new e.Expression(f) : void 0
							},
							mediaFeatures: function() {
								var a, b = this.entities,
									c = [];
								do
									if (a = this.mediaFeature()) {
										if (c.push(a), !o.$char(",")) break
									} else if (a = b.variable(), a && (c.push(a), !o.$char(","))) break; while (a);
								return c.length > 0 ? c : null
							},
							media: function() {
								var b, d, f, g, h = o.i;
								return a.dumpLineNumbers && (g = m(h)), o.save(), o.$str("@media") ? (b = this.mediaFeatures(), d = this.block(), d || i("media definitions require block statements after any features"), o.forget(), f = new e.Media(d, b, h, c), a.dumpLineNumbers && (f.debugInfo = g), f) : void o.restore()
							},
							plugin: function() {
								var a, b = o.i,
									d = o.$re(/^@plugin?\s+/);
								if (d) {
									var f = {
										plugin: !0
									};
									if (a = this.entities.quoted() || this.entities.url()) return o.$char(";") || (o.i = b, i("missing semi-colon on plugin")), new e.Import(a, null, f, b, c);
									o.i = b, i("malformed plugin statement")
								}
							},
							directive: function() {
								var b, d, f, g, h, j, k, l = o.i,
									n = !0,
									p = !0;
								if ("@" === o.currentChar()) {
									if (d = this["import"]() || this.plugin() || this.media()) return d;
									if (o.save(), b = o.$re(/^@[a-z-]+/)) {
										switch (g = b, "-" == b.charAt(1) && b.indexOf("-", 2) > 0 && (g = "@" + b.slice(b.indexOf("-", 2) + 1)), g) {
											case "@charset":
												h = !0, n = !1;
												break;
											case "@namespace":
												j = !0, n = !1;
												break;
											case "@keyframes":
											case "@counter-style":
												h = !0;
												break;
											case "@document":
											case "@supports":
												k = !0, p = !1;
												break;
											default:
												k = !0
										}
										return o.commentStore.length = 0, h ? (d = this.entity(), d || i("expected " + b + " identifier")) : j ? (d = this.expression(), d || i("expected " + b + " expression")) : k && (d = (o.$re(/^[^{;]+/) || "").trim(), n = "{" == o.currentChar(), d && (d = new e.Anonymous(d))), n && (f = this.blockRuleset()), f || !n && d && o.$char(";") ? (o.forget(), new e.Directive(b, d, f, l, c, a.dumpLineNumbers ? m(l) : null, p)) : void o.restore("directive options not recognised")
									}
								}
							},
							value: function() {
								var a, b = [];
								do
									if (a = this.expression(), a && (b.push(a), !o.$char(","))) break;
								while (a);
								return b.length > 0 ? new e.Value(b) : void 0
							},
							important: function() {
								return "!" === o.currentChar() ? o.$re(/^! *important/) : void 0
							},
							sub: function() {
								var a, b;
								return o.save(), o.$char("(") ? (a = this.addition(), a && o.$char(")") ? (o.forget(), b = new e.Expression([a]), b.parens = !0, b) : void o.restore("Expected ')'")) : void o.restore()
							},
							multiplication: function() {
								var a, b, c, d, f;
								if (a = this.operand()) {
									for (f = o.isWhitespace(-1);;) {
										if (o.peek(/^\/[*\/]/)) break;
										if (o.save(), c = o.$char("/") || o.$char("*"), !c) {
											o.forget();
											break
										}
										if (b = this.operand(), !b) {
											o.restore();
											break
										}
										o.forget(), a.parensInOp = !0, b.parensInOp = !0, d = new e.Operation(c, [d || a, b], f), f = o.isWhitespace(-1)
									}
									return d || a
								}
							},
							addition: function() {
								var a, b, c, d, f;
								if (a = this.multiplication()) {
									for (f = o.isWhitespace(-1);;) {
										if (c = o.$re(/^[-+]\s+/) || !f && (o.$char("+") || o.$char("-")), !c) break;
										if (b = this.multiplication(), !b) break;
										a.parensInOp = !0, b.parensInOp = !0, d = new e.Operation(c, [d || a, b], f), f = o.isWhitespace(-1)
									}
									return d || a
								}
							},
							conditions: function() {
								var a, b, c, d = o.i;
								if (a = this.condition()) {
									for (;;) {
										if (!o.peek(/^,\s*(not\s*)?\(/) || !o.$char(",")) break;
										if (b = this.condition(), !b) break;
										c = new e.Condition("or", c || a, b, d)
									}
									return c || a
								}
							},
							condition: function() {
								function a() {
									return o.$str("or")
								}
								var b, c, d;
								if (b = this.conditionAnd(this)) {
									if (c = a()) {
										if (d = this.condition(), !d) return;
										b = new e.Condition(c, b, d)
									}
									return b
								}
							},
							conditionAnd: function() {
								function a(a) {
									return a.negatedCondition() || a.parenthesisCondition()
								}

								function b() {
									return o.$str("and")
								}
								var c, d, f;
								if (c = a(this)) {
									if (d = b()) {
										if (f = this.conditionAnd(), !f) return;
										c = new e.Condition(d, c, f)
									}
									return c
								}
							},
							negatedCondition: function() {
								if (o.$str("not")) {
									var a = this.parenthesisCondition();
									return a && (a.negate = !a.negate), a
								}
							},
							parenthesisCondition: function() {
								function a(a) {
									var b;
									return o.save(), (b = a.condition()) && o.$char(")") ? (o.forget(), b) : void o.restore()
								}
								var b;
								return o.save(), o.$str("(") ? (b = a(this)) ? (o.forget(), b) : (b = this.atomicCondition()) ? o.$char(")") ? (o.forget(), b) : void o.restore("expected ')' got '" + o.currentChar() + "'") : void o.restore() : void o.restore()
							},
							atomicCondition: function() {
								var a, b, c, d, f = this.entities,
									g = o.i;
								return a = this.addition() || f.keyword() || f.quoted(), a ? (o.$char(">") ? d = o.$char("=") ? ">=" : ">" : o.$char("<") ? d = o.$char("=") ? "<=" : "<" : o.$char("=") && (d = o.$char(">") ? "=>" : o.$char("<") ? "=<" : "="), d ? (b = this.addition() || f.keyword() || f.quoted(), b ? c = new e.Condition(d, a, b, g, !1) : i("expected expression")) : c = new e.Condition("=", a, new e.Keyword("true"), g, !1), c) : void 0
							},
							operand: function() {
								var a, b = this.entities;
								o.peek(/^-[@\(]/) && (a = o.$char("-"));
								var c = this.sub() || b.dimension() || b.color() || b.variable() || b.call() || b.colorKeyword();
								return a && (c.parensInOp = !0, c = new e.Negative(c)), c
							},
							expression: function() {
								var a, b, c = [];
								do a = this.comment(), a ? c.push(a) : (a = this.addition() || this.entity(), a && (c.push(a), o.peek(/^\/[\/*]/) || (b = o.$char("/"), b && c.push(new e.Anonymous(b))))); while (a);
								return c.length > 0 ? new e.Expression(c) : void 0
							},
							property: function() {
								var a = o.$re(/^(\*?-?[_a-zA-Z0-9-]+)\s*:/);
								return a ? a[1] : void 0
							},
							ruleProperty: function() {
								function a(a) {
									var b = o.i,
										c = o.$re(a);
									return c ? (g.push(b), f.push(c[1])) : void 0
								}
								var b, d, f = [],
									g = [];
								o.save();
								var h = o.$re(/^([_a-zA-Z0-9-]+)\s*:/);
								if (h) return f = [new e.Keyword(h[1])], o.forget(), f;
								for (a(/^(\*?)/);;)
									if (!a(/^((?:[\w-]+)|(?:@\{[\w-]+\}))/)) break;
								if (f.length > 1 && a(/^((?:\+_|\+)?)\s*:/)) {
									for (o.forget(), "" === f[0] && (f.shift(), g.shift()), d = 0; f.length > d; d++) b = f[d], f[d] = "@" !== b.charAt(0) ? new e.Keyword(b) : new e.Variable("@" + b.slice(2, -1), g[d], c);
									return f
								}
								o.restore()
							}
						}
					}
				};
			i.serializeVars = function(a) {
				var b = "";
				for (var c in a)
					if (Object.hasOwnProperty.call(a, c)) {
						var d = a[c];
						b += ("@" === c[0] ? "" : "@") + c + ": " + d + (";" === String(d).slice(-1) ? "" : ";")
					}
				return b
			}, b.exports = i
		}, {
			"../less-error": 32,
			"../tree": 62,
			"../utils": 83,
			"../visitors": 87,
			"./parser-input": 37
		}],
		39: [function(a, b, c) {
			var d = function(a) {
				this.less = a, this.visitors = [], this.preProcessors = [], this.postProcessors = [], this.installedPlugins = [], this.fileManagers = []
			};
			d.prototype.addPlugins = function(a) {
				if (a)
					for (var b = 0; a.length > b; b++) this.addPlugin(a[b])
			}, d.prototype.addPlugin = function(a) {
				this.installedPlugins.push(a), a.install(this.less, this)
			}, d.prototype.addVisitor = function(a) {
				this.visitors.push(a)
			}, d.prototype.addPreProcessor = function(a, b) {
				var c;
				for (c = 0; this.preProcessors.length > c && !(this.preProcessors[c].priority >= b); c++);
				this.preProcessors.splice(c, 0, {
					preProcessor: a,
					priority: b
				})
			}, d.prototype.addPostProcessor = function(a, b) {
				var c;
				for (c = 0; this.postProcessors.length > c && !(this.postProcessors[c].priority >= b); c++);
				this.postProcessors.splice(c, 0, {
					postProcessor: a,
					priority: b
				})
			}, d.prototype.addFileManager = function(a) {
				this.fileManagers.push(a)
			}, d.prototype.getPreProcessors = function() {
				for (var a = [], b = 0; this.preProcessors.length > b; b++) a.push(this.preProcessors[b].preProcessor);
				return a
			}, d.prototype.getPostProcessors = function() {
				for (var a = [], b = 0; this.postProcessors.length > b; b++) a.push(this.postProcessors[b].postProcessor);
				return a
			}, d.prototype.getVisitors = function() {
				return this.visitors
			}, d.prototype.getFileManagers = function() {
				return this.fileManagers
			}, b.exports = d
		}, {}],
		40: [function(a, b, c) {
			var d = a("../less-error"),
				e = a("../tree"),
				f = b.exports = function(a, b) {
					this.fileInfo = b
				};
			f.prototype.eval = function(a, b) {
				var c, f, g = {};
				f = {
					add: function(a, b) {
						g[a] = b
					},
					addMultiple: function(a) {
						Object.keys(a).forEach(function(b) {
							g[b] = a[b]
						})
					}
				};
				try {
					c = new Function("functions", "tree", "fileInfo", a), c(f, e, this.fileInfo)
				} catch (h) {
					b(new d({
						message: "Plugin evaluation error: '" + h.name + ": " + h.message.replace(/["]/g, "'") + "'",
						filename: this.fileInfo.filename
					}), null)
				}
				b(null, {
					functions: g
				})
			}
		}, {
			"../less-error": 32,
			"../tree": 62
		}],
		41: [function(a, b, c) {
			var d;
			b.exports = function(b, c, e) {
				var f = function(b, e, g) {
					if ("function" == typeof e && (g = e, e = {}), !g) {
						d || (d = "undefined" == typeof Promise ? a("promise") : Promise);
						var h = this;
						return new d(function(a, c) {
							f.call(h, b, e, function(b, d) {
								b ? c(b) : a(d)
							})
						})
					}
					this.parse(b, e, function(a, b, d, e) {
						if (a) return g(a);
						var f;
						try {
							var h = new c(b, d);
							f = h.toCSS(e)
						} catch (a) {
							return g(a)
						}
						g(null, f)
					})
				};
				return f
			}
		}, {
			promise: void 0
		}],
		42: [function(a, b, c) {
			b.exports = function(a, b) {
				var c = function(a) {
					this.options = a
				};
				return c.prototype.toCSS = function(b, c, d) {
					var e = new a({
							contentsIgnoredCharsMap: d.contentsIgnoredChars,
							rootNode: b,
							contentsMap: d.contents,
							sourceMapFilename: this.options.sourceMapFilename,
							sourceMapURL: this.options.sourceMapURL,
							outputFilename: this.options.sourceMapOutputFilename,
							sourceMapBasepath: this.options.sourceMapBasepath,
							sourceMapRootpath: this.options.sourceMapRootpath,
							outputSourceFiles: this.options.outputSourceFiles,
							sourceMapGenerator: this.options.sourceMapGenerator,
							sourceMapFileInline: this.options.sourceMapFileInline
						}),
						f = e.toCSS(c);
					return this.sourceMap = e.sourceMap, this.sourceMapURL = e.sourceMapURL, this.options.sourceMapInputFilename && (this.sourceMapInputFilename = e.normalizeFilename(this.options.sourceMapInputFilename)), f + this.getCSSAppendage()
				}, c.prototype.getCSSAppendage = function() {
					var a = this.sourceMapURL;
					if (this.options.sourceMapFileInline) {
						if (void 0 === this.sourceMap) return "";
						a = "data:application/json;base64," + b.encodeBase64(this.sourceMap)
					}
					return a ? "/*# sourceMappingURL=" + a + " */" : ""
				}, c.prototype.getExternalSourceMap = function() {
					return this.sourceMap
				}, c.prototype.setExternalSourceMap = function(a) {
					this.sourceMap = a
				}, c.prototype.isInline = function() {
					return this.options.sourceMapFileInline
				}, c.prototype.getSourceMapURL = function() {
					return this.sourceMapURL
				}, c.prototype.getOutputFilename = function() {
					return this.options.sourceMapOutputFilename
				}, c.prototype.getInputFilename = function() {
					return this.sourceMapInputFilename
				}, c
			}
		}, {}],
		43: [function(a, b, c) {
			b.exports = function(a) {
				var b = function(b) {
					this._css = [], this._rootNode = b.rootNode, this._contentsMap = b.contentsMap, this._contentsIgnoredCharsMap = b.contentsIgnoredCharsMap, b.sourceMapFilename && (this._sourceMapFilename = b.sourceMapFilename.replace(/\\/g, "/")), this._outputFilename = b.outputFilename, this.sourceMapURL = b.sourceMapURL, b.sourceMapBasepath && (this._sourceMapBasepath = b.sourceMapBasepath.replace(/\\/g, "/")), b.sourceMapRootpath ? (this._sourceMapRootpath = b.sourceMapRootpath.replace(/\\/g, "/"), "/" !== this._sourceMapRootpath.charAt(this._sourceMapRootpath.length - 1) && (this._sourceMapRootpath += "/")) : this._sourceMapRootpath = "", this._outputSourceFiles = b.outputSourceFiles, this._sourceMapGeneratorConstructor = a.getSourceMapGenerator(), this._lineNumber = 0, this._column = 0
				};
				return b.prototype.normalizeFilename = function(a) {
					return a = a.replace(/\\/g, "/"), this._sourceMapBasepath && 0 === a.indexOf(this._sourceMapBasepath) && (a = a.substring(this._sourceMapBasepath.length), "\\" !== a.charAt(0) && "/" !== a.charAt(0) || (a = a.substring(1))), (this._sourceMapRootpath || "") + a
				}, b.prototype.add = function(a, b, c, d) {
					if (a) {
						var e, f, g, h, i;
						if (b) {
							var j = this._contentsMap[b.filename];
							this._contentsIgnoredCharsMap[b.filename] && (c -= this._contentsIgnoredCharsMap[b.filename], 0 > c && (c = 0), j = j.slice(this._contentsIgnoredCharsMap[b.filename])), j = j.substring(0, c), f = j.split("\n"), h = f[f.length - 1]
						}
						if (e = a.split("\n"), g = e[e.length - 1], b)
							if (d)
								for (i = 0; e.length > i; i++) this._sourceMapGenerator.addMapping({
									generated: {
										line: this._lineNumber + i + 1,
										column: 0 === i ? this._column : 0
									},
									original: {
										line: f.length + i,
										column: 0 === i ? h.length : 0
									},
									source: this.normalizeFilename(b.filename)
								});
							else this._sourceMapGenerator.addMapping({
								generated: {
									line: this._lineNumber + 1,
									column: this._column
								},
								original: {
									line: f.length,
									column: h.length
								},
								source: this.normalizeFilename(b.filename)
							});
						1 === e.length ? this._column += g.length : (this._lineNumber += e.length - 1, this._column = g.length), this._css.push(a)
					}
				}, b.prototype.isEmpty = function() {
					return 0 === this._css.length
				}, b.prototype.toCSS = function(a) {
					if (this._sourceMapGenerator = new this._sourceMapGeneratorConstructor({
							file: this._outputFilename,
							sourceRoot: null
						}), this._outputSourceFiles)
						for (var b in this._contentsMap)
							if (this._contentsMap.hasOwnProperty(b)) {
								var c = this._contentsMap[b];
								this._contentsIgnoredCharsMap[b] && (c = c.slice(this._contentsIgnoredCharsMap[b])), this._sourceMapGenerator.setSourceContent(this.normalizeFilename(b), c)
							}
					if (this._rootNode.genCSS(a, this), this._css.length > 0) {
						var d, e = JSON.stringify(this._sourceMapGenerator.toJSON());
						this.sourceMapURL ? d = this.sourceMapURL : this._sourceMapFilename && (d = this._sourceMapFilename), this.sourceMapURL = d, this.sourceMap = e
					}
					return this._css.join("")
				}, b
			}
		}, {}],
		44: [function(a, b, c) {
			var d = a("./contexts"),
				e = a("./visitors"),
				f = a("./tree");
			b.exports = function(a, b) {
				b = b || {};
				var c, g = b.variables,
					h = new d.Eval(b);
				"object" != typeof g || Array.isArray(g) || (g = Object.keys(g).map(function(a) {
					var b = g[a];
					return b instanceof f.Value || (b instanceof f.Expression || (b = new f.Expression([b])), b = new f.Value([b])), new f.Rule("@" + a, b, !1, null, 0)
				}), h.frames = [new f.Ruleset(null, g)]);
				var i, j = [],
					k = [new e.JoinSelectorVisitor, new e.MarkVisibleSelectorsVisitor(!0), new e.ExtendVisitor, new e.ToCSSVisitor({
						compress: Boolean(b.compress)
					})];
				if (b.pluginManager) {
					var l = b.pluginManager.getVisitors();
					for (i = 0; l.length > i; i++) {
						var m = l[i];
						m.isPreEvalVisitor ? j.push(m) : m.isPreVisitor ? k.splice(0, 0, m) : k.push(m)
					}
				}
				for (i = 0; j.length > i; i++) j[i].run(a);
				for (c = a.eval(h), i = 0; k.length > i; i++) k[i].run(c);
				return c
			}
		}, {
			"./contexts": 11,
			"./tree": 62,
			"./visitors": 87
		}],
		45: [function(a, b, c) {
			var d = a("./node"),
				e = function(a) {
					this.value = a
				};
			e.prototype = new d, e.prototype.type = "Alpha", e.prototype.accept = function(a) {
				this.value = a.visit(this.value)
			}, e.prototype.eval = function(a) {
				return this.value.eval ? new e(this.value.eval(a)) : this
			}, e.prototype.genCSS = function(a, b) {
				b.add("alpha(opacity="), this.value.genCSS ? this.value.genCSS(a, b) : b.add(this.value), b.add(")")
			}, b.exports = e
		}, {
			"./node": 70
		}],
		46: [function(a, b, c) {
			var d = a("./node"),
				e = function(a, b, c, d, e, f) {
					this.value = a, this.index = b, this.mapLines = d, this.currentFileInfo = c, this.rulesetLike = "undefined" == typeof e ? !1 : e, this.allowRoot = !0, this.copyVisibilityInfo(f)
				};
			e.prototype = new d, e.prototype.type = "Anonymous", e.prototype.eval = function() {
				return new e(this.value, this.index, this.currentFileInfo, this.mapLines, this.rulesetLike, this.visibilityInfo())
			}, e.prototype.compare = function(a) {
				return a.toCSS && this.toCSS() === a.toCSS() ? 0 : void 0
			}, e.prototype.isRulesetLike = function() {
				return this.rulesetLike
			}, e.prototype.genCSS = function(a, b) {
				b.add(this.value, this.currentFileInfo, this.index, this.mapLines)
			}, b.exports = e
		}, {
			"./node": 70
		}],
		47: [function(a, b, c) {
			var d = a("./node"),
				e = function(a, b) {
					this.key = a, this.value = b
				};
			e.prototype = new d, e.prototype.type = "Assignment", e.prototype.accept = function(a) {
				this.value = a.visit(this.value)
			}, e.prototype.eval = function(a) {
				return this.value.eval ? new e(this.key, this.value.eval(a)) : this
			}, e.prototype.genCSS = function(a, b) {
				b.add(this.key + "="), this.value.genCSS ? this.value.genCSS(a, b) : b.add(this.value)
			}, b.exports = e
		}, {
			"./node": 70
		}],
		48: [function(a, b, c) {
			var d = a("./node"),
				e = function(a, b, c) {
					this.key = a, this.op = b, this.value = c
				};
			e.prototype = new d, e.prototype.type = "Attribute", e.prototype.eval = function(a) {
				return new e(this.key.eval ? this.key.eval(a) : this.key, this.op, this.value && this.value.eval ? this.value.eval(a) : this.value)
			}, e.prototype.genCSS = function(a, b) {
				b.add(this.toCSS(a))
			}, e.prototype.toCSS = function(a) {
				var b = this.key.toCSS ? this.key.toCSS(a) : this.key;
				return this.op && (b += this.op, b += this.value.toCSS ? this.value.toCSS(a) : this.value), "[" + b + "]"
			}, b.exports = e
		}, {
			"./node": 70
		}],
		49: [function(a, b, c) {
			var d = a("./node"),
				e = a("../functions/function-caller"),
				f = function(a, b, c, d) {
					this.name = a, this.args = b, this.index = c, this.currentFileInfo = d
				};
			f.prototype = new d, f.prototype.type = "Call", f.prototype.accept = function(a) {
				this.args && (this.args = a.visitArray(this.args))
			}, f.prototype.eval = function(a) {
				var b, c = this.args.map(function(b) {
						return b.eval(a)
					}),
					d = new e(this.name, a, this.index, this.currentFileInfo);
				if (d.isValid()) {
					try {
						b = d.call(c)
					} catch (g) {
						throw {
							type: g.type || "Runtime",
							message: "error evaluating function `" + this.name + "`" + (g.message ? ": " + g.message : ""),
							index: this.index,
							filename: this.currentFileInfo.filename
						}
					}
					if (null != b) return b.index = this.index, b.currentFileInfo = this.currentFileInfo, b
				}
				return new f(this.name, c, this.index, this.currentFileInfo)
			}, f.prototype.genCSS = function(a, b) {
				b.add(this.name + "(", this.currentFileInfo, this.index);
				for (var c = 0; this.args.length > c; c++) this.args[c].genCSS(a, b), this.args.length > c + 1 && b.add(", ");
				b.add(")")
			}, b.exports = f
		}, {
			"../functions/function-caller": 21,
			"./node": 70
		}],
		50: [function(a, b, c) {
			function d(a, b) {
				return Math.min(Math.max(a, 0), b)
			}

			function e(a) {
				return "#" + a.map(function(a) {
					return a = d(Math.round(a), 255), (16 > a ? "0" : "") + a.toString(16)
				}).join("")
			}
			var f = a("./node"),
				g = a("../data/colors"),
				h = function(a, b, c) {
					this.rgb = Array.isArray(a) ? a : 6 == a.length ? a.match(/.{2}/g).map(function(a) {
						return parseInt(a, 16)
					}) : a.split("").map(function(a) {
						return parseInt(a + a, 16)
					}), this.alpha = "number" == typeof b ? b : 1, "undefined" != typeof c && (this.value = c)
				};
			h.prototype = new f, h.prototype.type = "Color", h.prototype.luma = function() {
				var a = this.rgb[0] / 255,
					b = this.rgb[1] / 255,
					c = this.rgb[2] / 255;
				return a = .03928 >= a ? a / 12.92 : Math.pow((a + .055) / 1.055, 2.4), b = .03928 >= b ? b / 12.92 : Math.pow((b + .055) / 1.055, 2.4), c = .03928 >= c ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4), .2126 * a + .7152 * b + .0722 * c
			}, h.prototype.genCSS = function(a, b) {
				b.add(this.toCSS(a))
			}, h.prototype.toCSS = function(a, b) {
				var c, e, f = a && a.compress && !b;
				if (this.value) return this.value;
				if (e = this.fround(a, this.alpha), 1 > e) return "rgba(" + this.rgb.map(function(a) {
					return d(Math.round(a), 255)
				}).concat(d(e, 1)).join("," + (f ? "" : " ")) + ")";
				if (c = this.toRGB(), f) {
					var g = c.split("");
					g[1] === g[2] && g[3] === g[4] && g[5] === g[6] && (c = "#" + g[1] + g[3] + g[5])
				}
				return c
			}, h.prototype.operate = function(a, b, c) {
				for (var d = [], e = this.alpha * (1 - c.alpha) + c.alpha, f = 0; 3 > f; f++) d[f] = this._operate(a, b, this.rgb[f], c.rgb[f]);
				return new h(d, e)
			}, h.prototype.toRGB = function() {
				return e(this.rgb)
			}, h.prototype.toHSL = function() {
				var a, b, c = this.rgb[0] / 255,
					d = this.rgb[1] / 255,
					e = this.rgb[2] / 255,
					f = this.alpha,
					g = Math.max(c, d, e),
					h = Math.min(c, d, e),
					i = (g + h) / 2,
					j = g - h;
				if (g === h) a = b = 0;
				else {
					switch (b = i > .5 ? j / (2 - g - h) : j / (g + h), g) {
						case c:
							a = (d - e) / j + (e > d ? 6 : 0);
							break;
						case d:
							a = (e - c) / j + 2;
							break;
						case e:
							a = (c - d) / j + 4
					}
					a /= 6
				}
				return {
					h: 360 * a,
					s: b,
					l: i,
					a: f
				}
			}, h.prototype.toHSV = function() {
				var a, b, c = this.rgb[0] / 255,
					d = this.rgb[1] / 255,
					e = this.rgb[2] / 255,
					f = this.alpha,
					g = Math.max(c, d, e),
					h = Math.min(c, d, e),
					i = g,
					j = g - h;
				if (b = 0 === g ? 0 : j / g, g === h) a = 0;
				else {
					switch (g) {
						case c:
							a = (d - e) / j + (e > d ? 6 : 0);
							break;
						case d:
							a = (e - c) / j + 2;
							break;
						case e:
							a = (c - d) / j + 4
					}
					a /= 6
				}
				return {
					h: 360 * a,
					s: b,
					v: i,
					a: f
				}
			}, h.prototype.toARGB = function() {
				return e([255 * this.alpha].concat(this.rgb))
			}, h.prototype.compare = function(a) {
				return a.rgb && a.rgb[0] === this.rgb[0] && a.rgb[1] === this.rgb[1] && a.rgb[2] === this.rgb[2] && a.alpha === this.alpha ? 0 : void 0
			}, h.fromKeyword = function(a) {
				var b, c = a.toLowerCase();
				return g.hasOwnProperty(c) ? b = new h(g[c].slice(1)) : "transparent" === c && (b = new h([0, 0, 0], 0)), b ? (b.value = a, b) : void 0
			}, b.exports = h
		}, {
			"../data/colors": 12,
			"./node": 70
		}],
		51: [function(a, b, c) {
			var d = a("./node"),
				e = function(a) {
					" " === a ? (this.value = " ", this.emptyOrWhitespace = !0) : (this.value = a ? a.trim() : "", this.emptyOrWhitespace = "" === this.value)
				};
			e.prototype = new d, e.prototype.type = "Combinator";
			var f = {
				"": !0,
				" ": !0,
				"|": !0
			};
			e.prototype.genCSS = function(a, b) {
				var c = a.compress || f[this.value] ? "" : " ";
				b.add(c + this.value + c)
			}, b.exports = e
		}, {
			"./node": 70
		}],
		52: [function(a, b, c) {
			var d = a("./node"),
				e = a("./debug-info"),
				f = function(a, b, c, d) {
					this.value = a, this.isLineComment = b, this.currentFileInfo = d, this.allowRoot = !0
				};
			f.prototype = new d, f.prototype.type = "Comment", f.prototype.genCSS = function(a, b) {
				this.debugInfo && b.add(e(a, this), this.currentFileInfo, this.index), b.add(this.value)
			}, f.prototype.isSilent = function(a) {
				var b = a.compress && "!" !== this.value[2];
				return this.isLineComment || b
			}, b.exports = f
		}, {
			"./debug-info": 54,
			"./node": 70
		}],
		53: [function(a, b, c) {
			var d = a("./node"),
				e = function(a, b, c, d, e) {
					this.op = a.trim(), this.lvalue = b, this.rvalue = c, this.index = d, this.negate = e
				};
			e.prototype = new d, e.prototype.type = "Condition", e.prototype.accept = function(a) {
				this.lvalue = a.visit(this.lvalue), this.rvalue = a.visit(this.rvalue)
			}, e.prototype.eval = function(a) {
				var b = function(a, b, c) {
					switch (a) {
						case "and":
							return b && c;
						case "or":
							return b || c;
						default:
							switch (d.compare(b, c)) {
								case -1:
									return "<" === a || "=<" === a || "<=" === a;
								case 0:
									return "=" === a || ">=" === a || "=<" === a || "<=" === a;
								case 1:
									return ">" === a || ">=" === a;
								default:
									return !1
							}
					}
				}(this.op, this.lvalue.eval(a), this.rvalue.eval(a));
				return this.negate ? !b : b
			}, b.exports = e
		}, {
			"./node": 70
		}],
		54: [function(a, b, c) {
			var d = function(a, b, c) {
				var e = "";
				if (a.dumpLineNumbers && !a.compress) switch (a.dumpLineNumbers) {
					case "comments":
						e = d.asComment(b);
						break;
					case "mediaquery":
						e = d.asMediaQuery(b);
						break;
					case "all":
						e = d.asComment(b) + (c || "") + d.asMediaQuery(b)
				}
				return e
			};
			d.asComment = function(a) {
				return "/* line " + a.debugInfo.lineNumber + ", " + a.debugInfo.fileName + " */\n"
			}, d.asMediaQuery = function(a) {
				var b = a.debugInfo.fileName;
				return /^[a-z]+:\/\//i.test(b) || (b = "file://" + b), "@media -sass-debug-info{filename{font-family:" + b.replace(/([.:\/\\])/g, function(a) {
					return "\\" == a && (a = "/"), "\\" + a
				}) + "}line{font-family:\\00003" + a.debugInfo.lineNumber + "}}\n"
			}, b.exports = d
		}, {}],
		55: [function(a, b, c) {
			var d = a("./node"),
				e = a("../contexts"),
				f = function(a, b) {
					this.ruleset = a, this.frames = b
				};
			f.prototype = new d, f.prototype.type = "DetachedRuleset", f.prototype.evalFirst = !0, f.prototype.accept = function(a) {
				this.ruleset = a.visit(this.ruleset)
			}, f.prototype.eval = function(a) {
				var b = this.frames || a.frames.slice(0);
				return new f(this.ruleset, b)
			}, f.prototype.callEval = function(a) {
				return this.ruleset.eval(this.frames ? new e.Eval(a, this.frames.concat(a.frames)) : a)
			}, b.exports = f
		}, {
			"../contexts": 11,
			"./node": 70
		}],
		56: [function(a, b, c) {
			var d = a("./node"),
				e = a("../data/unit-conversions"),
				f = a("./unit"),
				g = a("./color"),
				h = function(a, b) {
					this.value = parseFloat(a), this.unit = b && b instanceof f ? b : new f(b ? [b] : void 0)
				};
			h.prototype = new d, h.prototype.type = "Dimension", h.prototype.accept = function(a) {
				this.unit = a.visit(this.unit)
			}, h.prototype.eval = function(a) {
				return this
			}, h.prototype.toColor = function() {
				return new g([this.value, this.value, this.value])
			}, h.prototype.genCSS = function(a, b) {
				if (a && a.strictUnits && !this.unit.isSingular()) throw new Error("Multiple units in dimension. Correct the units or use the unit function. Bad unit: " + this.unit.toString());
				var c = this.fround(a, this.value),
					d = String(c);
				if (0 !== c && 1e-6 > c && c > -1e-6 && (d = c.toFixed(20).replace(/0+$/, "")), a && a.compress) {
					if (0 === c && this.unit.isLength()) return void b.add(d);
					c > 0 && 1 > c && (d = d.substr(1))
				}
				b.add(d), this.unit.genCSS(a, b)
			}, h.prototype.operate = function(a, b, c) {
				var d = this._operate(a, b, this.value, c.value),
					e = this.unit.clone();
				if ("+" === b || "-" === b)
					if (0 === e.numerator.length && 0 === e.denominator.length) e = c.unit.clone(), this.unit.backupUnit && (e.backupUnit = this.unit.backupUnit);
					else if (0 === c.unit.numerator.length && 0 === e.denominator.length);
				else {
					if (c = c.convertTo(this.unit.usedUnits()), a.strictUnits && c.unit.toString() !== e.toString()) throw new Error("Incompatible units. Change the units or use the unit function. Bad units: '" + e.toString() + "' and '" + c.unit.toString() + "'.");
					d = this._operate(a, b, this.value, c.value)
				} else "*" === b ? (e.numerator = e.numerator.concat(c.unit.numerator).sort(), e.denominator = e.denominator.concat(c.unit.denominator).sort(), e.cancel()) : "/" === b && (e.numerator = e.numerator.concat(c.unit.denominator).sort(), e.denominator = e.denominator.concat(c.unit.numerator).sort(), e.cancel());
				return new h(d, e)
			}, h.prototype.compare = function(a) {
				var b, c;
				if (a instanceof h) {
					if (this.unit.isEmpty() || a.unit.isEmpty()) b = this, c = a;
					else if (b = this.unify(), c = a.unify(), 0 !== b.unit.compare(c.unit)) return;
					return d.numericCompare(b.value, c.value)
				}
			}, h.prototype.unify = function() {
				return this.convertTo({
					length: "px",
					duration: "s",
					angle: "rad"
				})
			}, h.prototype.convertTo = function(a) {
				var b, c, d, f, g, i = this.value,
					j = this.unit.clone(),
					k = {};
				if ("string" == typeof a) {
					for (b in e) e[b].hasOwnProperty(a) && (k = {}, k[b] = a);
					a = k
				}
				g = function(a, b) {
					return d.hasOwnProperty(a) ? (b ? i /= d[a] / d[f] : i *= d[a] / d[f], f) : a
				};
				for (c in a) a.hasOwnProperty(c) && (f = a[c], d = e[c], j.map(g));
				return j.cancel(), new h(i, j)
			}, b.exports = h
		}, {
			"../data/unit-conversions": 14,
			"./color": 50,
			"./node": 70,
			"./unit": 79
		}],
		57: [function(a, b, c) {
			var d = a("./node"),
				e = a("./selector"),
				f = a("./ruleset"),
				g = function(a, b, c, d, f, g, h, i) {
					var j;
					if (this.name = a, this.value = b, c)
						for (Array.isArray(c) ? this.rules = c : (this.rules = [c], this.rules[0].selectors = new e([], null, null, this.index, f).createEmptySelectors()), j = 0; this.rules.length > j; j++) this.rules[j].allowImports = !0;
					this.index = d, this.currentFileInfo = f, this.debugInfo = g, this.isRooted = h || !1, this.copyVisibilityInfo(i), this.allowRoot = !0
				};
			g.prototype = new d, g.prototype.type = "Directive", g.prototype.accept = function(a) {
				var b = this.value,
					c = this.rules;
				c && (this.rules = a.visitArray(c)), b && (this.value = a.visit(b))
			}, g.prototype.isRulesetLike = function() {
				return this.rules || !this.isCharset()
			}, g.prototype.isCharset = function() {
				return "@charset" === this.name
			}, g.prototype.genCSS = function(a, b) {
				var c = this.value,
					d = this.rules;
				b.add(this.name, this.currentFileInfo, this.index), c && (b.add(" "), c.genCSS(a, b)), d ? this.outputRuleset(a, b, d) : b.add(";")
			}, g.prototype.eval = function(a) {
				var b, c, d = this.value,
					e = this.rules;
				return b = a.mediaPath, c = a.mediaBlocks, a.mediaPath = [], a.mediaBlocks = [], d && (d = d.eval(a)), e && (e = [e[0].eval(a)], e[0].root = !0), a.mediaPath = b, a.mediaBlocks = c, new g(this.name, d, e, this.index, this.currentFileInfo, this.debugInfo, this.isRooted, this.visibilityInfo())
			}, g.prototype.variable = function(a) {
				return this.rules ? f.prototype.variable.call(this.rules[0], a) : void 0
			}, g.prototype.find = function() {
				return this.rules ? f.prototype.find.apply(this.rules[0], arguments) : void 0
			}, g.prototype.rulesets = function() {
				return this.rules ? f.prototype.rulesets.apply(this.rules[0]) : void 0
			}, g.prototype.outputRuleset = function(a, b, c) {
				var d, e = c.length;
				if (a.tabLevel = (0 | a.tabLevel) + 1, a.compress) {
					for (b.add("{"), d = 0; e > d; d++) c[d].genCSS(a, b);
					return b.add("}"), void a.tabLevel--
				}
				var f = "\n" + Array(a.tabLevel).join("  "),
					g = f + "  ";
				if (e) {
					for (b.add(" {" + g), c[0].genCSS(a, b), d = 1; e > d; d++) b.add(g), c[d].genCSS(a, b);
					b.add(f + "}")
				} else b.add(" {" + f + "}");
				a.tabLevel--
			}, b.exports = g
		}, {
			"./node": 70,
			"./ruleset": 76,
			"./selector": 77
		}],
		58: [function(a, b, c) {
			var d = a("./node"),
				e = a("./paren"),
				f = a("./combinator"),
				g = function(a, b, c, d, e) {
					this.combinator = a instanceof f ? a : new f(a), this.value = "string" == typeof b ? b.trim() : b ? b : "", this.index = c, this.currentFileInfo = d, this.copyVisibilityInfo(e)
				};
			g.prototype = new d, g.prototype.type = "Element", g.prototype.accept = function(a) {
				var b = this.value;
				this.combinator = a.visit(this.combinator), "object" == typeof b && (this.value = a.visit(b))
			}, g.prototype.eval = function(a) {
				return new g(this.combinator, this.value.eval ? this.value.eval(a) : this.value, this.index, this.currentFileInfo, this.visibilityInfo())
			}, g.prototype.clone = function() {
				return new g(this.combinator, this.value, this.index, this.currentFileInfo, this.visibilityInfo())
			}, g.prototype.genCSS = function(a, b) {
				b.add(this.toCSS(a), this.currentFileInfo, this.index)
			}, g.prototype.toCSS = function(a) {
				a = a || {};
				var b = this.value,
					c = a.firstSelector;
				return b instanceof e && (a.firstSelector = !0), b = b.toCSS ? b.toCSS(a) : b, a.firstSelector = c, "" === b && "&" === this.combinator.value.charAt(0) ? "" : this.combinator.toCSS(a) + b
			}, b.exports = g
		}, {
			"./combinator": 51,
			"./node": 70,
			"./paren": 72
		}],
		59: [function(a, b, c) {
			var d = a("./node"),
				e = a("./paren"),
				f = a("./comment"),
				g = function(a) {
					if (this.value = a, !a) throw new Error("Expression requires an array parameter")
				};
			g.prototype = new d, g.prototype.type = "Expression", g.prototype.accept = function(a) {
				this.value = a.visitArray(this.value)
			}, g.prototype.eval = function(a) {
				var b, c = this.parens && !this.parensInOp,
					d = !1;
				return c && a.inParenthesis(), this.value.length > 1 ? b = new g(this.value.map(function(b) {
					return b.eval(a)
				})) : 1 === this.value.length ? (this.value[0].parens && !this.value[0].parensInOp && (d = !0), b = this.value[0].eval(a)) : b = this, c && a.outOfParenthesis(), this.parens && this.parensInOp && !a.isMathOn() && !d && (b = new e(b)), b
			}, g.prototype.genCSS = function(a, b) {
				for (var c = 0; this.value.length > c; c++) this.value[c].genCSS(a, b), this.value.length > c + 1 && b.add(" ")
			}, g.prototype.throwAwayComments = function() {
				this.value = this.value.filter(function(a) {
					return !(a instanceof f)
				})
			}, b.exports = g
		}, {
			"./comment": 52,
			"./node": 70,
			"./paren": 72
		}],
		60: [function(a, b, c) {
			var d = a("./node"),
				e = a("./selector"),
				f = function g(a, b, c, d, e) {
					switch (this.selector = a, this.option = b, this.index = c, this.object_id = g.next_id++, this.parent_ids = [this.object_id], this.currentFileInfo = d || {}, this.copyVisibilityInfo(e), this.allowRoot = !0, b) {
						case "all":
							this.allowBefore = !0, this.allowAfter = !0;
							break;
						default:
							this.allowBefore = !1, this.allowAfter = !1
					}
				};
			f.next_id = 0, f.prototype = new d, f.prototype.type = "Extend", f.prototype.accept = function(a) {
				this.selector = a.visit(this.selector)
			}, f.prototype.eval = function(a) {
				return new f(this.selector.eval(a), this.option, this.index, this.currentFileInfo, this.visibilityInfo())
			}, f.prototype.clone = function(a) {
				return new f(this.selector, this.option, this.index, this.currentFileInfo, this.visibilityInfo())
			}, f.prototype.findSelfSelectors = function(a) {
				var b, c, d = [];
				for (b = 0; a.length > b; b++) c = a[b].elements, b > 0 && c.length && "" === c[0].combinator.value && (c[0].combinator.value = " "), d = d.concat(a[b].elements);
				this.selfSelectors = [new e(d)], this.selfSelectors[0].copyVisibilityInfo(this.visibilityInfo())
			}, b.exports = f
		}, {
			"./node": 70,
			"./selector": 77
		}],
		61: [function(a, b, c) {
			var d = a("./node"),
				e = a("./media"),
				f = a("./url"),
				g = a("./quoted"),
				h = a("./ruleset"),
				i = a("./anonymous"),
				j = function(a, b, c, d, e, f) {
					if (this.options = c, this.index = d, this.path = a, this.features = b, this.currentFileInfo = e, this.allowRoot = !0, void 0 !== this.options.less || this.options.inline) this.css = !this.options.less || this.options.inline;
					else {
						var g = this.getPath();
						g && /[#\.\&\?\/]css([\?;].*)?$/.test(g) && (this.css = !0)
					}
					this.copyVisibilityInfo(f)
				};
			j.prototype = new d, j.prototype.type = "Import", j.prototype.accept = function(a) {
				this.features && (this.features = a.visit(this.features)), this.path = a.visit(this.path), this.options.plugin || this.options.inline || !this.root || (this.root = a.visit(this.root))
			}, j.prototype.genCSS = function(a, b) {
				this.css && void 0 === this.path.currentFileInfo.reference && (b.add("@import ", this.currentFileInfo, this.index), this.path.genCSS(a, b), this.features && (b.add(" "), this.features.genCSS(a, b)), b.add(";"))
			}, j.prototype.getPath = function() {
				return this.path instanceof f ? this.path.value.value : this.path.value
			}, j.prototype.isVariableImport = function() {
				var a = this.path;
				return a instanceof f && (a = a.value), a instanceof g ? a.containsVariables() : !0
			}, j.prototype.evalForImport = function(a) {
				var b = this.path;
				return b instanceof f && (b = b.value), new j(b.eval(a), this.features, this.options, this.index, this.currentFileInfo, this.visibilityInfo())
			}, j.prototype.evalPath = function(a) {
				var b = this.path.eval(a),
					c = this.currentFileInfo && this.currentFileInfo.rootpath;
				if (!(b instanceof f)) {
					if (c) {
						var d = b.value;
						d && a.isPathRelative(d) && (b.value = c + d)
					}
					b.value = a.normalizePath(b.value)
				}
				return b
			}, j.prototype.eval = function(a) {
				var b = this.doEval(a);
				return (this.options.reference || this.blocksVisibility()) && (b.length || 0 === b.length ? b.forEach(function(a) {
					a.addVisibilityBlock()
				}) : b.addVisibilityBlock()), b
			}, j.prototype.doEval = function(a) {
				var b, c, d = this.features && this.features.eval(a);
				if (this.options.plugin) return c = a.frames[0] && a.frames[0].functionRegistry, c && this.root && this.root.functions && c.addMultiple(this.root.functions), [];
				if (this.skip && ("function" == typeof this.skip && (this.skip = this.skip()), this.skip)) return [];
				if (this.options.inline) {
					var f = new i(this.root, 0, {
						filename: this.importedFilename,
						reference: this.path.currentFileInfo && this.path.currentFileInfo.reference
					}, !0, !0);
					return this.features ? new e([f], this.features.value) : [f]
				}
				if (this.css) {
					var g = new j(this.evalPath(a), d, this.options, this.index);
					if (!g.css && this.error) throw this.error;
					return g
				}
				return b = new h(null, this.root.rules.slice(0)), b.evalImports(a), this.features ? new e(b.rules, this.features.value) : b.rules
			}, b.exports = j
		}, {
			"./anonymous": 46,
			"./media": 66,
			"./node": 70,
			"./quoted": 73,
			"./ruleset": 76,
			"./url": 80
		}],
		62: [function(a, b, c) {
			var d = {};
			d.Node = a("./node"), d.Alpha = a("./alpha"), d.Color = a("./color"), d.Directive = a("./directive"), d.DetachedRuleset = a("./detached-ruleset"), d.Operation = a("./operation"), d.Dimension = a("./dimension"), d.Unit = a("./unit"), d.Keyword = a("./keyword"), d.Variable = a("./variable"), d.Ruleset = a("./ruleset"), d.Element = a("./element"), d.Attribute = a("./attribute"), d.Combinator = a("./combinator"), d.Selector = a("./selector"), d.Quoted = a("./quoted"), d.Expression = a("./expression"), d.Rule = a("./rule"), d.Call = a("./call"), d.URL = a("./url"), d.Import = a("./import"), d.mixin = {
				Call: a("./mixin-call"),
				Definition: a("./mixin-definition")
			}, d.Comment = a("./comment"), d.Anonymous = a("./anonymous"), d.Value = a("./value"), d.JavaScript = a("./javascript"), d.Assignment = a("./assignment"), d.Condition = a("./condition"), d.Paren = a("./paren"), d.Media = a("./media"), d.UnicodeDescriptor = a("./unicode-descriptor"), d.Negative = a("./negative"), d.Extend = a("./extend"), d.RulesetCall = a("./ruleset-call"), b.exports = d
		}, {
			"./alpha": 45,
			"./anonymous": 46,
			"./assignment": 47,
			"./attribute": 48,
			"./call": 49,
			"./color": 50,
			"./combinator": 51,
			"./comment": 52,
			"./condition": 53,
			"./detached-ruleset": 55,
			"./dimension": 56,
			"./directive": 57,
			"./element": 58,
			"./expression": 59,
			"./extend": 60,
			"./import": 61,
			"./javascript": 63,
			"./keyword": 65,
			"./media": 66,
			"./mixin-call": 67,
			"./mixin-definition": 68,
			"./negative": 69,
			"./node": 70,
			"./operation": 71,
			"./paren": 72,
			"./quoted": 73,
			"./rule": 74,
			"./ruleset": 76,
			"./ruleset-call": 75,
			"./selector": 77,
			"./unicode-descriptor": 78,
			"./unit": 79,
			"./url": 80,
			"./value": 81,
			"./variable": 82
		}],
		63: [function(a, b, c) {
			var d = a("./js-eval-node"),
				e = a("./dimension"),
				f = a("./quoted"),
				g = a("./anonymous"),
				h = function(a, b, c, d) {
					this.escaped = b, this.expression = a, this.index = c, this.currentFileInfo = d
				};
			h.prototype = new d, h.prototype.type = "JavaScript", h.prototype.eval = function(a) {
				var b = this.evaluateJavaScript(this.expression, a);
				return "number" == typeof b ? new e(b) : "string" == typeof b ? new f('"' + b + '"', b, this.escaped, this.index) : new g(Array.isArray(b) ? b.join(", ") : b)
			}, b.exports = h
		}, {
			"./anonymous": 46,
			"./dimension": 56,
			"./js-eval-node": 64,
			"./quoted": 73
		}],
		64: [function(a, b, c) {
			var d = a("./node"),
				e = a("./variable"),
				f = function() {};
			f.prototype = new d, f.prototype.evaluateJavaScript = function(a, b) {
				var c, d = this,
					f = {};
				if (void 0 !== b.javascriptEnabled && !b.javascriptEnabled) throw {
					message: "You are using JavaScript, which has been disabled.",
					filename: this.currentFileInfo.filename,
					index: this.index
				};
				a = a.replace(/@\{([\w-]+)\}/g, function(a, c) {
					return d.jsify(new e("@" + c, d.index, d.currentFileInfo).eval(b))
				});
				try {
					a = new Function("return (" + a + ")")
				} catch (g) {
					throw {
						message: "JavaScript evaluation error: " + g.message + " from `" + a + "`",
						filename: this.currentFileInfo.filename,
						index: this.index
					}
				}
				var h = b.frames[0].variables();
				for (var i in h) h.hasOwnProperty(i) && (f[i.slice(1)] = {
					value: h[i].value,
					toJS: function() {
						return this.value.eval(b).toCSS()
					}
				});
				try {
					c = a.call(f)
				} catch (g) {
					throw {
						message: "JavaScript evaluation error: '" + g.name + ": " + g.message.replace(/["]/g, "'") + "'",
						filename: this.currentFileInfo.filename,
						index: this.index
					}
				}
				return c
			}, f.prototype.jsify = function(a) {
				return Array.isArray(a.value) && a.value.length > 1 ? "[" + a.value.map(function(a) {
					return a.toCSS()
				}).join(", ") + "]" : a.toCSS()
			}, b.exports = f
		}, {
			"./node": 70,
			"./variable": 82
		}],
		65: [function(a, b, c) {
			var d = a("./node"),
				e = function(a) {
					this.value = a
				};
			e.prototype = new d, e.prototype.type = "Keyword", e.prototype.genCSS = function(a, b) {
				if ("%" === this.value) throw {
					type: "Syntax",
					message: "Invalid % without number"
				};
				b.add(this.value)
			}, e.True = new e("true"), e.False = new e("false"), b.exports = e
		}, {
			"./node": 70
		}],
		66: [function(a, b, c) {
			var d = a("./ruleset"),
				e = a("./value"),
				f = a("./selector"),
				g = a("./anonymous"),
				h = a("./expression"),
				i = a("./directive"),
				j = function(a, b, c, g, h) {
					this.index = c, this.currentFileInfo = g;
					var i = new f([], null, null, this.index, this.currentFileInfo).createEmptySelectors();
					this.features = new e(b), this.rules = [new d(i, a)], this.rules[0].allowImports = !0, this.copyVisibilityInfo(h), this.allowRoot = !0
				};
			j.prototype = new i, j.prototype.type = "Media", j.prototype.isRulesetLike = !0, j.prototype.accept = function(a) {
				this.features && (this.features = a.visit(this.features)), this.rules && (this.rules = a.visitArray(this.rules))
			}, j.prototype.genCSS = function(a, b) {
				b.add("@media ", this.currentFileInfo, this.index), this.features.genCSS(a, b), this.outputRuleset(a, b, this.rules)
			}, j.prototype.eval = function(a) {
				a.mediaBlocks || (a.mediaBlocks = [], a.mediaPath = []);
				var b = new j(null, [], this.index, this.currentFileInfo, this.visibilityInfo());
				this.debugInfo && (this.rules[0].debugInfo = this.debugInfo, b.debugInfo = this.debugInfo);
				var c = !1;
				a.strictMath || (c = !0, a.strictMath = !0);
				try {
					b.features = this.features.eval(a)
				} finally {
					c && (a.strictMath = !1)
				}
				return a.mediaPath.push(b), a.mediaBlocks.push(b), this.rules[0].functionRegistry = a.frames[0].functionRegistry.inherit(), a.frames.unshift(this.rules[0]), b.rules = [this.rules[0].eval(a)], a.frames.shift(), a.mediaPath.pop(), 0 === a.mediaPath.length ? b.evalTop(a) : b.evalNested(a)
			}, j.prototype.evalTop = function(a) {
				var b = this;
				if (a.mediaBlocks.length > 1) {
					var c = new f([], null, null, this.index, this.currentFileInfo).createEmptySelectors();
					b = new d(c, a.mediaBlocks), b.multiMedia = !0, b.copyVisibilityInfo(this.visibilityInfo())
				}
				return delete a.mediaBlocks, delete a.mediaPath, b
			}, j.prototype.evalNested = function(a) {
				var b, c, f = a.mediaPath.concat([this]);
				for (b = 0; f.length > b; b++) c = f[b].features instanceof e ? f[b].features.value : f[b].features, f[b] = Array.isArray(c) ? c : [c];
				return this.features = new e(this.permute(f).map(function(a) {
					for (a = a.map(function(a) {
							return a.toCSS ? a : new g(a)
						}), b = a.length - 1; b > 0; b--) a.splice(b, 0, new g("and"));
					return new h(a)
				})), new d([], [])
			}, j.prototype.permute = function(a) {
				if (0 === a.length) return [];
				if (1 === a.length) return a[0];
				for (var b = [], c = this.permute(a.slice(1)), d = 0; c.length > d; d++)
					for (var e = 0; a[0].length > e; e++) b.push([a[0][e]].concat(c[d]));
				return b
			}, j.prototype.bubbleSelectors = function(a) {
				a && (this.rules = [new d(a.slice(0), [this.rules[0]])])
			}, b.exports = j
		}, {
			"./anonymous": 46,
			"./directive": 57,
			"./expression": 59,
			"./ruleset": 76,
			"./selector": 77,
			"./value": 81
		}],
		67: [function(a, b, c) {
			var d = a("./node"),
				e = a("./selector"),
				f = a("./mixin-definition"),
				g = a("../functions/default"),
				h = function(a, b, c, d, f) {
					this.selector = new e(a), this.arguments = b || [], this.index = c, this.currentFileInfo = d, this.important = f, this.allowRoot = !0
				};
			h.prototype = new d, h.prototype.type = "MixinCall", h.prototype.accept = function(a) {
				this.selector && (this.selector = a.visit(this.selector)), this.arguments.length && (this.arguments = a.visitArray(this.arguments))
			}, h.prototype.eval = function(a) {
				function b(b, c) {
					var d, e, f;
					for (d = 0; 2 > d; d++) {
						for (x[d] = !0, g.value(d), e = 0; c.length > e && x[d]; e++) f = c[e], f.matchCondition && (x[d] = x[d] && f.matchCondition(null, a));
						b.matchCondition && (x[d] = x[d] && b.matchCondition(t, a))
					}
					return x[0] || x[1] ? x[0] != x[1] ? x[1] ? A : B : z : y
				}
				var c, d, e, h, i, j, k, l, m, n, o, p, q, r, s, t = [],
					u = [],
					v = !1,
					w = [],
					x = [],
					y = -1,
					z = 0,
					A = 1,
					B = 2;
				for (j = 0; this.arguments.length > j; j++)
					if (h = this.arguments[j], i = h.value.eval(a), h.expand && Array.isArray(i.value))
						for (i = i.value, k = 0; i.length > k; k++) t.push({
							value: i[k]
						});
					else t.push({
						name: h.name,
						value: i
					});
				for (s = function(b) {
						return b.matchArgs(null, a)
					}, j = 0; a.frames.length > j; j++)
					if ((c = a.frames[j].find(this.selector, null, s)).length > 0) {
						for (n = !0, k = 0; c.length > k; k++) {
							for (d = c[k].rule, e = c[k].path, m = !1, l = 0; a.frames.length > l; l++)
								if (!(d instanceof f) && d === (a.frames[l].originalRuleset || a.frames[l])) {
									m = !0;
									break
								}
							m || d.matchArgs(t, a) && (o = {
								mixin: d,
								group: b(d, e)
							}, o.group !== y && w.push(o), v = !0)
						}
						for (g.reset(), q = [0, 0, 0], k = 0; w.length > k; k++) q[w[k].group]++;
						if (q[z] > 0) p = B;
						else if (p = A, q[A] + q[B] > 1) throw {
							type: "Runtime",
							message: "Ambiguous use of `default()` found when matching for `" + this.format(t) + "`",
							index: this.index,
							filename: this.currentFileInfo.filename
						};
						for (k = 0; w.length > k; k++)
							if (o = w[k].group, o === z || o === p) try {
								d = w[k].mixin, d instanceof f || (r = d.originalRuleset || d, d = new f("", [], d.rules, null, !1, null, r.visibilityInfo()), d.originalRuleset = r);
								var C = d.evalCall(a, t, this.important).rules;
								this._setVisibilityToReplacement(C), Array.prototype.push.apply(u, C)
							} catch (D) {
								throw {
									message: D.message,
									index: this.index,
									filename: this.currentFileInfo.filename,
									stack: D.stack
								}
							}
							if (v) return u
					}
				throw n ? {
					type: "Runtime",
					message: "No matching definition was found for `" + this.format(t) + "`",
					index: this.index,
					filename: this.currentFileInfo.filename
				} : {
					type: "Name",
					message: this.selector.toCSS().trim() + " is undefined",
					index: this.index,
					filename: this.currentFileInfo.filename
				}
			}, h.prototype._setVisibilityToReplacement = function(a) {
				var b, c;
				if (this.blocksVisibility())
					for (b = 0; a.length > b; b++) c = a[b], c.addVisibilityBlock()
			}, h.prototype.format = function(a) {
				return this.selector.toCSS().trim() + "(" + (a ? a.map(function(a) {
					var b = "";
					return a.name && (b += a.name + ":"), b += a.value.toCSS ? a.value.toCSS() : "???"
				}).join(", ") : "") + ")"
			}, b.exports = h
		}, {
			"../functions/default": 20,
			"./mixin-definition": 68,
			"./node": 70,
			"./selector": 77
		}],
		68: [function(a, b, c) {
			var d = a("./selector"),
				e = a("./element"),
				f = a("./ruleset"),
				g = a("./rule"),
				h = a("./expression"),
				i = a("../contexts"),
				j = function(a, b, c, f, g, h, i) {
					this.name = a, this.selectors = [new d([new e(null, a, this.index, this.currentFileInfo)])], this.params = b, this.condition = f, this.variadic = g, this.arity = b.length, this.rules = c, this._lookups = {};
					var j = [];
					this.required = b.reduce(function(a, b) {
						return !b.name || b.name && !b.value ? a + 1 : (j.push(b.name), a)
					}, 0), this.optionalParameters = j, this.frames = h, this.copyVisibilityInfo(i), this.allowRoot = !0
				};
			j.prototype = new f, j.prototype.type = "MixinDefinition", j.prototype.evalFirst = !0, j.prototype.accept = function(a) {
				this.params && this.params.length && (this.params = a.visitArray(this.params)), this.rules = a.visitArray(this.rules), this.condition && (this.condition = a.visit(this.condition))
			}, j.prototype.evalParams = function(a, b, c, d) {
				var e, j, k, l, m, n, o, p, q = new f(null, null),
					r = this.params.slice(0),
					s = 0;
				if (b.frames && b.frames[0] && b.frames[0].functionRegistry && (q.functionRegistry = b.frames[0].functionRegistry.inherit()), b = new i.Eval(b, [q].concat(b.frames)), c)
					for (c = c.slice(0), s = c.length, k = 0; s > k; k++)
						if (j = c[k], n = j && j.name) {
							for (o = !1, l = 0; r.length > l; l++)
								if (!d[l] && n === r[l].name) {
									d[l] = j.value.eval(a), q.prependRule(new g(n, j.value.eval(a))), o = !0;
									break
								}
							if (o) {
								c.splice(k, 1), k--;
								continue
							}
							throw {
								type: "Runtime",
								message: "Named argument for " + this.name + " " + c[k].name + " not found"
							}
						}
				for (p = 0, k = 0; r.length > k; k++)
					if (!d[k]) {
						if (j = c && c[p], n = r[k].name)
							if (r[k].variadic) {
								for (e = [], l = p; s > l; l++) e.push(c[l].value.eval(a));
								q.prependRule(new g(n, new h(e).eval(a)))
							} else {
								if (m = j && j.value) m = m.eval(a);
								else {
									if (!r[k].value) throw {
										type: "Runtime",
										message: "wrong number of arguments for " + this.name + " (" + s + " for " + this.arity + ")"
									};
									m = r[k].value.eval(b), q.resetCache()
								}
								q.prependRule(new g(n, m)), d[k] = m
							}
						if (r[k].variadic && c)
							for (l = p; s > l; l++) d[l] = c[l].value.eval(a);
						p++
					}
				return q
			}, j.prototype.makeImportant = function() {
				var a = this.rules ? this.rules.map(function(a) {
						return a.makeImportant ? a.makeImportant(!0) : a
					}) : this.rules,
					b = new j(this.name, this.params, a, this.condition, this.variadic, this.frames);
				return b
			}, j.prototype.eval = function(a) {
				return new j(this.name, this.params, this.rules, this.condition, this.variadic, this.frames || a.frames.slice(0))
			}, j.prototype.evalCall = function(a, b, c) {
				var d, e, j = [],
					k = this.frames ? this.frames.concat(a.frames) : a.frames,
					l = this.evalParams(a, new i.Eval(a, k), b, j);
				return l.prependRule(new g("@arguments", new h(j).eval(a))), d = this.rules.slice(0), e = new f(null, d), e.originalRuleset = this, e = e.eval(new i.Eval(a, [this, l].concat(k))), c && (e = e.makeImportant()), e
			}, j.prototype.matchCondition = function(a, b) {
				return !this.condition || this.condition.eval(new i.Eval(b, [this.evalParams(b, new i.Eval(b, this.frames ? this.frames.concat(b.frames) : b.frames), a, [])].concat(this.frames || []).concat(b.frames)))
			}, j.prototype.matchArgs = function(a, b) {
				var c, d = a && a.length || 0,
					e = this.optionalParameters,
					f = a ? a.reduce(function(a, b) {
						return e.indexOf(b.name) < 0 ? a + 1 : a
					}, 0) : 0;
				if (this.variadic) {
					if (this.required - 1 > f) return !1
				} else {
					if (this.required > f) return !1;
					if (d > this.params.length) return !1
				}
				c = Math.min(f, this.arity);
				for (var g = 0; c > g; g++)
					if (!this.params[g].name && !this.params[g].variadic && a[g].value.eval(b).toCSS() != this.params[g].value.eval(b).toCSS()) return !1;
				return !0
			}, b.exports = j
		}, {
			"../contexts": 11,
			"./element": 58,
			"./expression": 59,
			"./rule": 74,
			"./ruleset": 76,
			"./selector": 77
		}],
		69: [function(a, b, c) {
			var d = a("./node"),
				e = a("./operation"),
				f = a("./dimension"),
				g = function(a) {
					this.value = a
				};
			g.prototype = new d, g.prototype.type = "Negative", g.prototype.genCSS = function(a, b) {
				b.add("-"), this.value.genCSS(a, b)
			}, g.prototype.eval = function(a) {
				return a.isMathOn() ? new e("*", [new f(-1), this.value]).eval(a) : new g(this.value.eval(a))
			}, b.exports = g
		}, {
			"./dimension": 56,
			"./node": 70,
			"./operation": 71
		}],
		70: [function(a, b, c) {
			var d = function() {};
			d.prototype.toCSS = function(a) {
				var b = [];
				return this.genCSS(a, {
					add: function(a, c, d) {
						b.push(a)
					},
					isEmpty: function() {
						return 0 === b.length
					}
				}), b.join("")
			}, d.prototype.genCSS = function(a, b) {
				b.add(this.value)
			}, d.prototype.accept = function(a) {
				this.value = a.visit(this.value)
			}, d.prototype.eval = function() {
				return this
			}, d.prototype._operate = function(a, b, c, d) {
				switch (b) {
					case "+":
						return c + d;
					case "-":
						return c - d;
					case "*":
						return c * d;
					case "/":
						return c / d
				}
			}, d.prototype.fround = function(a, b) {
				var c = a && a.numPrecision;
				return null == c ? b : Number((b + 2e-16).toFixed(c))
			}, d.compare = function(a, b) {
				if (a.compare && "Quoted" !== b.type && "Anonymous" !== b.type) return a.compare(b);
				if (b.compare) return -b.compare(a);
				if (a.type === b.type) {
					if (a = a.value, b = b.value, !Array.isArray(a)) return a === b ? 0 : void 0;
					if (a.length === b.length) {
						for (var c = 0; a.length > c; c++)
							if (0 !== d.compare(a[c], b[c])) return;
						return 0
					}
				}
			}, d.numericCompare = function(a, b) {
				return b > a ? -1 : a === b ? 0 : a > b ? 1 : void 0
			}, d.prototype.blocksVisibility = function() {
				return null == this.visibilityBlocks && (this.visibilityBlocks = 0), 0 !== this.visibilityBlocks
			}, d.prototype.addVisibilityBlock = function() {
				null == this.visibilityBlocks && (this.visibilityBlocks = 0), this.visibilityBlocks = this.visibilityBlocks + 1
			}, d.prototype.removeVisibilityBlock = function() {
				null == this.visibilityBlocks && (this.visibilityBlocks = 0), this.visibilityBlocks = this.visibilityBlocks - 1
			}, d.prototype.ensureVisibility = function() {
				this.nodeVisible = !0
			}, d.prototype.ensureInvisibility = function() {
				this.nodeVisible = !1
			}, d.prototype.isVisible = function() {
				return this.nodeVisible
			}, d.prototype.visibilityInfo = function() {
				return {
					visibilityBlocks: this.visibilityBlocks,
					nodeVisible: this.nodeVisible
				}
			}, d.prototype.copyVisibilityInfo = function(a) {
				a && (this.visibilityBlocks = a.visibilityBlocks, this.nodeVisible = a.nodeVisible)
			}, b.exports = d
		}, {}],
		71: [function(a, b, c) {
			var d = a("./node"),
				e = a("./color"),
				f = a("./dimension"),
				g = function(a, b, c) {
					this.op = a.trim(), this.operands = b, this.isSpaced = c
				};
			g.prototype = new d, g.prototype.type = "Operation", g.prototype.accept = function(a) {
				this.operands = a.visit(this.operands)
			}, g.prototype.eval = function(a) {
				var b = this.operands[0].eval(a),
					c = this.operands[1].eval(a);
				if (a.isMathOn()) {
					if (b instanceof f && c instanceof e && (b = b.toColor()), c instanceof f && b instanceof e && (c = c.toColor()), !b.operate) throw {
						type: "Operation",
						message: "Operation on an invalid type"
					};
					return b.operate(a, this.op, c)
				}
				return new g(this.op, [b, c], this.isSpaced)
			}, g.prototype.genCSS = function(a, b) {
				this.operands[0].genCSS(a, b), this.isSpaced && b.add(" "), b.add(this.op), this.isSpaced && b.add(" "), this.operands[1].genCSS(a, b)
			}, b.exports = g
		}, {
			"./color": 50,
			"./dimension": 56,
			"./node": 70
		}],
		72: [function(a, b, c) {
			var d = a("./node"),
				e = function(a) {
					this.value = a
				};
			e.prototype = new d, e.prototype.type = "Paren", e.prototype.genCSS = function(a, b) {
				b.add("("), this.value.genCSS(a, b), b.add(")")
			}, e.prototype.eval = function(a) {
				return new e(this.value.eval(a))
			}, b.exports = e
		}, {
			"./node": 70
		}],
		73: [function(a, b, c) {
			var d = a("./node"),
				e = a("./js-eval-node"),
				f = a("./variable"),
				g = function(a, b, c, d, e) {
					this.escaped = null == c ? !0 : c, this.value = b || "", this.quote = a.charAt(0), this.index = d, this.currentFileInfo = e
				};
			g.prototype = new e, g.prototype.type = "Quoted", g.prototype.genCSS = function(a, b) {
				this.escaped || b.add(this.quote, this.currentFileInfo, this.index), b.add(this.value), this.escaped || b.add(this.quote)
			}, g.prototype.containsVariables = function() {
				return this.value.match(/(`([^`]+)`)|@\{([\w-]+)\}/)
			}, g.prototype.eval = function(a) {
				function b(a, b, c) {
					var d = a;
					do a = d, d = a.replace(b, c); while (a !== d);
					return d
				}
				var c = this,
					d = this.value,
					e = function(b, d) {
						return String(c.evaluateJavaScript(d, a))
					},
					h = function(b, d) {
						var e = new f("@" + d, c.index, c.currentFileInfo).eval(a, !0);
						return e instanceof g ? e.value : e.toCSS()
					};
				return d = b(d, /`([^`]+)`/g, e), d = b(d, /@\{([\w-]+)\}/g, h), new g(this.quote + d + this.quote, d, this.escaped, this.index, this.currentFileInfo)
			}, g.prototype.compare = function(a) {
				return "Quoted" !== a.type || this.escaped || a.escaped ? a.toCSS && this.toCSS() === a.toCSS() ? 0 : void 0 : d.numericCompare(this.value, a.value)
			}, b.exports = g
		}, {
			"./js-eval-node": 64,
			"./node": 70,
			"./variable": 82
		}],
		74: [function(a, b, c) {
			function d(a, b) {
				var c, d = "",
					e = b.length,
					f = {
						add: function(a) {
							d += a
						}
					};
				for (c = 0; e > c; c++) b[c].eval(a).genCSS(a, f);
				return d
			}
			var e = a("./node"),
				f = a("./value"),
				g = a("./keyword"),
				h = function(a, b, c, d, g, h, i, j) {
					this.name = a, this.value = b instanceof e ? b : new f([b]), this.important = c ? " " + c.trim() : "", this.merge = d, this.index = g, this.currentFileInfo = h, this.inline = i || !1, this.variable = void 0 !== j ? j : a.charAt && "@" === a.charAt(0), this.allowRoot = !0
				};
			h.prototype = new e, h.prototype.type = "Rule", h.prototype.genCSS = function(a, b) {
				b.add(this.name + (a.compress ? ":" : ": "), this.currentFileInfo, this.index);
				try {
					this.value.genCSS(a, b)
				} catch (c) {
					throw c.index = this.index, c.filename = this.currentFileInfo.filename, c
				}
				b.add(this.important + (this.inline || a.lastRule && a.compress ? "" : ";"), this.currentFileInfo, this.index)
			}, h.prototype.eval = function(a) {
				var b, c = !1,
					e = this.name,
					f = this.variable;
				"string" != typeof e && (e = 1 === e.length && e[0] instanceof g ? e[0].value : d(a, e), f = !1), "font" !== e || a.strictMath || (c = !0, a.strictMath = !0);
				try {
					if (a.importantScope.push({}), b = this.value.eval(a), !this.variable && "DetachedRuleset" === b.type) throw {
						message: "Rulesets cannot be evaluated on a property.",
						index: this.index,
						filename: this.currentFileInfo.filename
					};
					var i = this.important,
						j = a.importantScope.pop();
					return !i && j.important && (i = j.important), new h(e, b, i, this.merge, this.index, this.currentFileInfo, this.inline, f)
				} catch (k) {
					throw "number" != typeof k.index && (k.index = this.index, k.filename = this.currentFileInfo.filename), k
				} finally {
					c && (a.strictMath = !1)
				}
			}, h.prototype.makeImportant = function() {
				return new h(this.name, this.value, "!important", this.merge, this.index, this.currentFileInfo, this.inline)
			}, b.exports = h
		}, {
			"./keyword": 65,
			"./node": 70,
			"./value": 81
		}],
		75: [function(a, b, c) {
			var d = a("./node"),
				e = a("./variable"),
				f = function(a) {
					this.variable = a, this.allowRoot = !0
				};
			f.prototype = new d, f.prototype.type = "RulesetCall", f.prototype.eval = function(a) {
				var b = new e(this.variable).eval(a);
				return b.callEval(a)
			}, b.exports = f
		}, {
			"./node": 70,
			"./variable": 82
		}],
		76: [function(a, b, c) {
			var d = a("./node"),
				e = a("./rule"),
				f = a("./selector"),
				g = a("./element"),
				h = a("./paren"),
				i = a("../contexts"),
				j = a("../functions/function-registry"),
				k = a("../functions/default"),
				l = a("./debug-info"),
				m = function(a, b, c, d) {
					this.selectors = a, this.rules = b, this._lookups = {}, this.strictImports = c, this.copyVisibilityInfo(d), this.allowRoot = !0
				};
			m.prototype = new d, m.prototype.type = "Ruleset", m.prototype.isRuleset = !0, m.prototype.isRulesetLike = !0, m.prototype.accept = function(a) {
				this.paths ? this.paths = a.visitArray(this.paths, !0) : this.selectors && (this.selectors = a.visitArray(this.selectors)), this.rules && this.rules.length && (this.rules = a.visitArray(this.rules))
			}, m.prototype.eval = function(a) {
				var b, c, d, f, g = this.selectors,
					h = !1;
				if (g && (c = g.length)) {
					for (b = [], k.error({
							type: "Syntax",
							message: "it is currently only allowed in parametric mixin guards,"
						}), f = 0; c > f; f++) d = g[f].eval(a), b.push(d), d.evaldCondition && (h = !0);
					k.reset()
				} else h = !0;
				var i, l, n = this.rules ? this.rules.slice(0) : null,
					o = new m(b, n, this.strictImports, this.visibilityInfo());
				o.originalRuleset = this, o.root = this.root, o.firstRoot = this.firstRoot, o.allowImports = this.allowImports, this.debugInfo && (o.debugInfo = this.debugInfo), h || (n.length = 0), o.functionRegistry = function(a) {
					for (var b, c = 0, d = a.length; c !== d; ++c)
						if (b = a[c].functionRegistry) return b;
					return j
				}(a.frames).inherit();
				var p = a.frames;
				p.unshift(o);
				var q = a.selectors;
				q || (a.selectors = q = []), q.unshift(this.selectors), (o.root || o.allowImports || !o.strictImports) && o.evalImports(a);
				var r = o.rules,
					s = r ? r.length : 0;
				for (f = 0; s > f; f++) r[f].evalFirst && (r[f] = r[f].eval(a));
				var t = a.mediaBlocks && a.mediaBlocks.length || 0;
				for (f = 0; s > f; f++) "MixinCall" === r[f].type ? (n = r[f].eval(a).filter(function(a) {
					return a instanceof e && a.variable ? !o.variable(a.name) : !0
				}), r.splice.apply(r, [f, 1].concat(n)), s += n.length - 1, f += n.length - 1, o.resetCache()) : "RulesetCall" === r[f].type && (n = r[f].eval(a).rules.filter(function(a) {
					return !(a instanceof e && a.variable)
				}), r.splice.apply(r, [f, 1].concat(n)), s += n.length - 1, f += n.length - 1, o.resetCache());
				for (f = 0; r.length > f; f++) i = r[f], i.evalFirst || (r[f] = i = i.eval ? i.eval(a) : i);
				for (f = 0; r.length > f; f++)
					if (i = r[f], i instanceof m && i.selectors && 1 === i.selectors.length && i.selectors[0].isJustParentSelector()) {
						r.splice(f--, 1);
						for (var u = 0; i.rules.length > u; u++) l = i.rules[u], l.copyVisibilityInfo(i.visibilityInfo()), l instanceof e && l.variable || r.splice(++f, 0, l)
					}
				if (p.shift(), q.shift(), a.mediaBlocks)
					for (f = t; a.mediaBlocks.length > f; f++) a.mediaBlocks[f].bubbleSelectors(b);
				return o
			}, m.prototype.evalImports = function(a) {
				var b, c, d = this.rules;
				if (d)
					for (b = 0; d.length > b; b++) "Import" === d[b].type && (c = d[b].eval(a), c && (c.length || 0 === c.length) ? (d.splice.apply(d, [b, 1].concat(c)), b += c.length - 1) : d.splice(b, 1, c), this.resetCache())
			}, m.prototype.makeImportant = function() {
				var a = new m(this.selectors, this.rules.map(function(a) {
					return a.makeImportant ? a.makeImportant() : a
				}), this.strictImports, this.visibilityInfo());
				return a
			}, m.prototype.matchArgs = function(a) {
				return !a || 0 === a.length
			}, m.prototype.matchCondition = function(a, b) {
				var c = this.selectors[this.selectors.length - 1];
				return c.evaldCondition ? !c.condition || c.condition.eval(new i.Eval(b, b.frames)) : !1
			}, m.prototype.resetCache = function() {
				this._rulesets = null, this._variables = null, this._lookups = {}
			}, m.prototype.variables = function() {
				return this._variables || (this._variables = this.rules ? this.rules.reduce(function(a, b) {
					if (b instanceof e && b.variable === !0 && (a[b.name] = b), "Import" === b.type && b.root && b.root.variables) {
						var c = b.root.variables();
						for (var d in c) c.hasOwnProperty(d) && (a[d] = c[d])
					}
					return a
				}, {}) : {}), this._variables
			}, m.prototype.variable = function(a) {
				return this.variables()[a]
			}, m.prototype.rulesets = function() {
				if (!this.rules) return [];
				var a, b, c = [],
					d = this.rules,
					e = d.length;
				for (a = 0; e > a; a++) b = d[a], b.isRuleset && c.push(b);
				return c
			}, m.prototype.prependRule = function(a) {
				var b = this.rules;
				b ? b.unshift(a) : this.rules = [a]
			}, m.prototype.find = function(a, b, c) {
				b = b || this;
				var d, e, g = [],
					h = a.toCSS();
				return h in this._lookups ? this._lookups[h] : (this.rulesets().forEach(function(h) {
					if (h !== b)
						for (var i = 0; h.selectors.length > i; i++)
							if (d = a.match(h.selectors[i])) {
								if (a.elements.length > d) {
									if (!c || c(h)) {
										e = h.find(new f(a.elements.slice(d)), b, c);
										for (var j = 0; e.length > j; ++j) e[j].path.push(h);
										Array.prototype.push.apply(g, e)
									}
								} else g.push({
									rule: h,
									path: []
								});
								break
							}
				}), this._lookups[h] = g, g)
			}, m.prototype.genCSS = function(a, b) {
				function c(a) {
					return "boolean" == typeof a.isRulesetLike ? a.isRulesetLike : "function" == typeof a.isRulesetLike ? a.isRulesetLike() : !1
				}
				var d, e, f, g, h, i = [],
					j = [];
				a.tabLevel = a.tabLevel || 0, this.root || a.tabLevel++;
				var k, m = a.compress ? "" : Array(a.tabLevel + 1).join("  "),
					n = a.compress ? "" : Array(a.tabLevel).join("  "),
					o = 0,
					p = 0;
				for (d = 0; this.rules.length > d; d++) g = this.rules[d], "Comment" === g.type ? (p === d && p++, j.push(g)) : g.isCharset && g.isCharset() ? (j.splice(o, 0, g), o++, p++) : "Import" === g.type ? (j.splice(p, 0, g), p++) : j.push(g);
				if (j = i.concat(j), !this.root) {
					f = l(a, this, n), f && (b.add(f), b.add(n));
					var q, r = this.paths,
						s = r.length;
					for (k = a.compress ? "," : ",\n" + n, d = 0; s > d; d++)
						if (h = r[d], q = h.length)
							for (d > 0 && b.add(k), a.firstSelector = !0, h[0].genCSS(a, b), a.firstSelector = !1, e = 1; q > e; e++) h[e].genCSS(a, b);
					b.add((a.compress ? "{" : " {\n") + m)
				}
				for (d = 0; j.length > d; d++) {
					g = j[d], d + 1 === j.length && (a.lastRule = !0);
					var t = a.lastRule;
					c(g) && (a.lastRule = !1), g.genCSS ? g.genCSS(a, b) : g.value && b.add(g.value.toString()), a.lastRule = t, a.lastRule ? a.lastRule = !1 : b.add(a.compress ? "" : "\n" + m)
				}
				this.root || (b.add(a.compress ? "}" : "\n" + n + "}"), a.tabLevel--), b.isEmpty() || a.compress || !this.firstRoot || b.add("\n")
			}, m.prototype.joinSelectors = function(a, b, c) {
				for (var d = 0; c.length > d; d++) this.joinSelector(a, b, c[d])
			}, m.prototype.joinSelector = function(a, b, c) {
				function d(a, b) {
					var c, d;
					if (0 === a.length) c = new h(a[0]);
					else {
						var e = [];
						for (d = 0; a.length > d; d++) e.push(new g(null, a[d], b.index, b.currentFileInfo));
						c = new h(new f(e))
					}
					return c
				}

				function e(a, b) {
					var c, d;
					return c = new g(null, a, b.index, b.currentFileInfo), d = new f([c])
				}

				function i(a, b, c, d) {
					var e, f, h;
					if (e = [], a.length > 0 ? (e = a.slice(0), f = e.pop(), h = d.createDerived(f.elements.slice(0))) : h = d.createDerived([]), b.length > 0) {
						var i = c.combinator,
							j = b[0].elements[0];
						i.emptyOrWhitespace && !j.combinator.emptyOrWhitespace && (i = j.combinator), h.elements.push(new g(i, j.value, c.index, c.currentFileInfo)), h.elements = h.elements.concat(b[0].elements.slice(1))
					}
					if (0 !== h.elements.length && e.push(h), b.length > 1) {
						var k = b.slice(1);
						k = k.map(function(a) {
							return a.createDerived(a.elements, [])
						}), e = e.concat(k)
					}
					return e
				}

				function j(a, b, c, d, e) {
					var f;
					for (f = 0; a.length > f; f++) {
						var g = i(a[f], b, c, d);
						e.push(g)
					}
					return e
				}

				function k(a, b) {
					var c, d;
					if (0 !== a.length) {
						if (0 === b.length) return void b.push([new f(a)]);
						for (c = 0; b.length > c; c++) d = b[c], d.length > 0 ? d[d.length - 1] = d[d.length - 1].createDerived(d[d.length - 1].elements.concat(a)) : d.push(new f(a))
					}
				}

				function l(a, b, c) {
					function f(a) {
						var b;
						return "Paren" !== a.value.type ? null : (b = a.value.value, "Selector" !== b.type ? null : b)
					}
					var h, m, n, o, p, q, r, s, t, u, v = !1;
					for (o = [], p = [
							[]
						], h = 0; c.elements.length > h; h++)
						if (s = c.elements[h], "&" !== s.value) {
							var w = f(s);
							if (null != w) {
								k(o, p);
								var x, y = [],
									z = [];
								for (x = l(y, b, w), v = v || x, n = 0; y.length > n; n++) {
									var A = e(d(y[n], s), s);
									j(p, [A], s, c, z)
								}
								p = z, o = []
							} else o.push(s)
						} else {
							for (v = !0, q = [], k(o, p), m = 0; p.length > m; m++)
								if (r = p[m], 0 === b.length) r.length > 0 && r[0].elements.push(new g(s.combinator, "", s.index, s.currentFileInfo)), q.push(r);
								else
									for (n = 0; b.length > n; n++) {
										var B = i(r, b[n], s, c);
										q.push(B)
									}
								p = q, o = []
						}
					for (k(o, p), h = 0; p.length > h; h++) t = p[h].length, t > 0 && (a.push(p[h]), u = p[h][t - 1], p[h][t - 1] = u.createDerived(u.elements, c.extendList));
					return v
				}

				function m(a, b) {
					var c = b.createDerived(b.elements, b.extendList, b.evaldCondition);
					return c.copyVisibilityInfo(a), c
				}
				var n, o, p;
				if (o = [], p = l(o, b, c), !p)
					if (b.length > 0)
						for (o = [], n = 0; b.length > n; n++) {
							var q = b[n].map(m.bind(this, c.visibilityInfo()));
							q.push(c), o.push(q)
						} else o = [
							[c]
						];
				for (n = 0; o.length > n; n++) a.push(o[n])
			}, b.exports = m
		}, {
			"../contexts": 11,
			"../functions/default": 20,
			"../functions/function-registry": 22,
			"./debug-info": 54,
			"./element": 58,
			"./node": 70,
			"./paren": 72,
			"./rule": 74,
			"./selector": 77
		}],
		77: [function(a, b, c) {
			var d = a("./node"),
				e = a("./element"),
				f = function(a, b, c, d, e, f) {
					this.elements = a, this.extendList = b, this.condition = c, this.currentFileInfo = e || {}, c || (this.evaldCondition = !0), this.copyVisibilityInfo(f)
				};
			f.prototype = new d, f.prototype.type = "Selector", f.prototype.accept = function(a) {
				this.elements && (this.elements = a.visitArray(this.elements)), this.extendList && (this.extendList = a.visitArray(this.extendList)), this.condition && (this.condition = a.visit(this.condition))
			}, f.prototype.createDerived = function(a, b, c) {
				var d = this.visibilityInfo();
				c = null != c ? c : this.evaldCondition;
				var e = new f(a, b || this.extendList, null, this.index, this.currentFileInfo, d);
				return e.evaldCondition = c, e.mediaEmpty = this.mediaEmpty, e
			}, f.prototype.createEmptySelectors = function() {
				var a = new e("", "&", this.index, this.currentFileInfo),
					b = [new f([a], null, null, this.index, this.currentFileInfo)];
				return b[0].mediaEmpty = !0, b
			}, f.prototype.match = function(a) {
				var b, c, d = this.elements,
					e = d.length;
				if (a.CacheElements(), b = a._elements.length, 0 === b || b > e) return 0;
				for (c = 0; b > c; c++)
					if (d[c].value !== a._elements[c]) return 0;
				return b
			}, f.prototype.CacheElements = function() {
				if (!this._elements) {
					var a = this.elements.map(function(a) {
						return a.combinator.value + (a.value.value || a.value)
					}).join("").match(/[,&#\*\.\w-]([\w-]|(\\.))*/g);
					a ? "&" === a[0] && a.shift() : a = [], this._elements = a
				}
			}, f.prototype.isJustParentSelector = function() {
				return !this.mediaEmpty && 1 === this.elements.length && "&" === this.elements[0].value && (" " === this.elements[0].combinator.value || "" === this.elements[0].combinator.value)
			}, f.prototype.eval = function(a) {
				var b = this.condition && this.condition.eval(a),
					c = this.elements,
					d = this.extendList;
				return c = c && c.map(function(b) {
					return b.eval(a)
				}), d = d && d.map(function(b) {
					return b.eval(a)
				}), this.createDerived(c, d, b)
			}, f.prototype.genCSS = function(a, b) {
				var c, d;
				if (a && a.firstSelector || "" !== this.elements[0].combinator.value || b.add(" ", this.currentFileInfo, this.index), !this._css)
					for (c = 0; this.elements.length > c; c++) d = this.elements[c], d.genCSS(a, b)
			}, f.prototype.getIsOutput = function() {
				return this.evaldCondition
			}, b.exports = f
		}, {
			"./element": 58,
			"./node": 70
		}],
		78: [function(a, b, c) {
			var d = a("./node"),
				e = function(a) {
					this.value = a
				};
			e.prototype = new d, e.prototype.type = "UnicodeDescriptor", b.exports = e
		}, {
			"./node": 70
		}],
		79: [function(a, b, c) {
			var d = a("./node"),
				e = a("../data/unit-conversions"),
				f = function(a, b, c) {
					this.numerator = a ? a.slice(0).sort() : [], this.denominator = b ? b.slice(0).sort() : [], c ? this.backupUnit = c : a && a.length && (this.backupUnit = a[0])
				};
			f.prototype = new d, f.prototype.type = "Unit", f.prototype.clone = function() {
				return new f(this.numerator.slice(0), this.denominator.slice(0), this.backupUnit)
			}, f.prototype.genCSS = function(a, b) {
				var c = a && a.strictUnits;
				1 === this.numerator.length ? b.add(this.numerator[0]) : !c && this.backupUnit ? b.add(this.backupUnit) : !c && this.denominator.length && b.add(this.denominator[0])
			}, f.prototype.toString = function() {
				var a, b = this.numerator.join("*");
				for (a = 0; this.denominator.length > a; a++) b += "/" + this.denominator[a];
				return b
			}, f.prototype.compare = function(a) {
				return this.is(a.toString()) ? 0 : void 0
			}, f.prototype.is = function(a) {
				return this.toString().toUpperCase() === a.toUpperCase()
			}, f.prototype.isLength = function() {
				return Boolean(this.toCSS().match(/px|em|%|in|cm|mm|pc|pt|ex/))
			}, f.prototype.isEmpty = function() {
				return 0 === this.numerator.length && 0 === this.denominator.length
			}, f.prototype.isSingular = function() {
				return 1 >= this.numerator.length && 0 === this.denominator.length
			}, f.prototype.map = function(a) {
				var b;
				for (b = 0; this.numerator.length > b; b++) this.numerator[b] = a(this.numerator[b], !1);
				for (b = 0; this.denominator.length > b; b++) this.denominator[b] = a(this.denominator[b], !0)
			}, f.prototype.usedUnits = function() {
				var a, b, c, d = {};
				b = function(b) {
					return a.hasOwnProperty(b) && !d[c] && (d[c] = b), b
				};
				for (c in e) e.hasOwnProperty(c) && (a = e[c], this.map(b));
				return d
			}, f.prototype.cancel = function() {
				var a, b, c = {};
				for (b = 0; this.numerator.length > b; b++) a = this.numerator[b], c[a] = (c[a] || 0) + 1;
				for (b = 0; this.denominator.length > b; b++) a = this.denominator[b], c[a] = (c[a] || 0) - 1;
				this.numerator = [], this.denominator = [];
				for (a in c)
					if (c.hasOwnProperty(a)) {
						var d = c[a];
						if (d > 0)
							for (b = 0; d > b; b++) this.numerator.push(a);
						else if (0 > d)
							for (b = 0; - d > b; b++) this.denominator.push(a)
					}
				this.numerator.sort(), this.denominator.sort()
			}, b.exports = f
		}, {
			"../data/unit-conversions": 14,
			"./node": 70
		}],
		80: [function(a, b, c) {
			var d = a("./node"),
				e = function(a, b, c, d) {
					this.value = a, this.currentFileInfo = c, this.index = b, this.isEvald = d
				};
			e.prototype = new d, e.prototype.type = "Url", e.prototype.accept = function(a) {
				this.value = a.visit(this.value)
			}, e.prototype.genCSS = function(a, b) {
				b.add("url("), this.value.genCSS(a, b), b.add(")")
			}, e.prototype.eval = function(a) {
				var b, c = this.value.eval(a);
				if (!this.isEvald && (b = this.currentFileInfo && this.currentFileInfo.rootpath, b && "string" == typeof c.value && a.isPathRelative(c.value) && (c.quote || (b = b.replace(/[\(\)'"\s]/g, function(a) {
						return "\\" + a
					})), c.value = b + c.value), c.value = a.normalizePath(c.value), a.urlArgs && !c.value.match(/^\s*data:/))) {
					var d = -1 === c.value.indexOf("?") ? "?" : "&",
						f = d + a.urlArgs; - 1 !== c.value.indexOf("#") ? c.value = c.value.replace("#", f + "#") : c.value += f
				}
				return new e(c, this.index, this.currentFileInfo, !0)
			}, b.exports = e
		}, {
			"./node": 70
		}],
		81: [function(a, b, c) {
			var d = a("./node"),
				e = function(a) {
					if (this.value = a, !a) throw new Error("Value requires an array argument")
				};
			e.prototype = new d, e.prototype.type = "Value", e.prototype.accept = function(a) {
				this.value && (this.value = a.visitArray(this.value))
			}, e.prototype.eval = function(a) {
				return 1 === this.value.length ? this.value[0].eval(a) : new e(this.value.map(function(b) {
					return b.eval(a)
				}))
			}, e.prototype.genCSS = function(a, b) {
				var c;
				for (c = 0; this.value.length > c; c++) this.value[c].genCSS(a, b), this.value.length > c + 1 && b.add(a && a.compress ? "," : ", ")
			}, b.exports = e
		}, {
			"./node": 70
		}],
		82: [function(a, b, c) {
			var d = a("./node"),
				e = function(a, b, c) {
					this.name = a, this.index = b, this.currentFileInfo = c || {}
				};
			e.prototype = new d, e.prototype.type = "Variable", e.prototype.eval = function(a) {
				var b, c = this.name;
				if (0 === c.indexOf("@@") && (c = "@" + new e(c.slice(1), this.index, this.currentFileInfo).eval(a).value), this.evaluating) throw {
					type: "Name",
					message: "Recursive variable definition for " + c,
					filename: this.currentFileInfo.filename,
					index: this.index
				};
				if (this.evaluating = !0, b = this.find(a.frames, function(b) {
						var d = b.variable(c);
						if (d) {
							if (d.important) {
								var e = a.importantScope[a.importantScope.length - 1];
								e.important = d.important
							}
							return d.value.eval(a)
						}
					})) return this.evaluating = !1, b;
				throw {
					type: "Name",
					message: "variable " + c + " is undefined",
					filename: this.currentFileInfo.filename,
					index: this.index
				}
			}, e.prototype.find = function(a, b) {
				for (var c, d = 0; a.length > d; d++)
					if (c = b.call(a, a[d])) return c;
				return null
			}, b.exports = e
		}, {
			"./node": 70
		}],
		83: [function(a, b, c) {
			b.exports = {
				getLocation: function(a, b) {
					for (var c = a + 1, d = null, e = -1; --c >= 0 && "\n" !== b.charAt(c);) e++;
					return "number" == typeof a && (d = (b.slice(0, a).match(/\n/g) || "").length), {
						line: d,
						column: e
					}
				}
			}
		}, {}],
		84: [function(a, b, c) {
			var d = a("../tree"),
				e = a("./visitor"),
				f = a("../logger"),
				g = function() {
					this._visitor = new e(this), this.contexts = [], this.allExtendsStack = [
						[]
					]
				};
			g.prototype = {
				run: function(a) {
					return a = this._visitor.visit(a), a.allExtends = this.allExtendsStack[0], a
				},
				visitRule: function(a, b) {
					b.visitDeeper = !1
				},
				visitMixinDefinition: function(a, b) {
					b.visitDeeper = !1
				},
				visitRuleset: function(a, b) {
					if (!a.root) {
						var c, e, f, g, h = [],
							i = a.rules,
							j = i ? i.length : 0;
						for (c = 0; j > c; c++) a.rules[c] instanceof d.Extend && (h.push(i[c]), a.extendOnEveryPath = !0);
						var k = a.paths;
						for (c = 0; k.length > c; c++) {
							var l = k[c],
								m = l[l.length - 1],
								n = m.extendList;
							for (g = n ? n.slice(0).concat(h) : h, g && (g = g.map(function(a) {
									return a.clone()
								})), e = 0; g.length > e; e++) this.foundExtends = !0, f = g[e], f.findSelfSelectors(l), f.ruleset = a, 0 === e && (f.firstExtendOnThisSelectorPath = !0), this.allExtendsStack[this.allExtendsStack.length - 1].push(f)
						}
						this.contexts.push(a.selectors)
					}
				},
				visitRulesetOut: function(a) {
					a.root || (this.contexts.length = this.contexts.length - 1)
				},
				visitMedia: function(a, b) {
					a.allExtends = [], this.allExtendsStack.push(a.allExtends)
				},
				visitMediaOut: function(a) {
					this.allExtendsStack.length = this.allExtendsStack.length - 1
				},
				visitDirective: function(a, b) {
					a.allExtends = [], this.allExtendsStack.push(a.allExtends)
				},
				visitDirectiveOut: function(a) {
					this.allExtendsStack.length = this.allExtendsStack.length - 1
				}
			};
			var h = function() {
				this._visitor = new e(this)
			};
			h.prototype = {
				run: function(a) {
					var b = new g;
					if (this.extendIndices = {}, b.run(a), !b.foundExtends) return a;
					a.allExtends = a.allExtends.concat(this.doExtendChaining(a.allExtends, a.allExtends)), this.allExtendsStack = [a.allExtends];
					var c = this._visitor.visit(a);
					return this.checkExtendsForNonMatched(a.allExtends), c
				},
				checkExtendsForNonMatched: function(a) {
					var b = this.extendIndices;
					a.filter(function(a) {
						return !a.hasFoundMatches && 1 == a.parent_ids.length
					}).forEach(function(a) {
						var c = "_unknown_";
						try {
							c = a.selector.toCSS({})
						} catch (d) {}
						b[a.index + " " + c] || (b[a.index + " " + c] = !0, f.warn("extend '" + c + "' has no matches"))
					})
				},
				doExtendChaining: function(a, b, c) {
					var e, f, g, h, i, j, k, l, m = [],
						n = this;
					for (c = c || 0, e = 0; a.length > e; e++)
						for (f = 0; b.length > f; f++) j = a[e], k = b[f], j.parent_ids.indexOf(k.object_id) >= 0 || (i = [k.selfSelectors[0]], g = n.findMatch(j, i), g.length && (j.hasFoundMatches = !0, j.selfSelectors.forEach(function(a) {
							var b = k.visibilityInfo();
							h = n.extendSelector(g, i, a, j.isVisible()), l = new d.Extend(k.selector, k.option, 0, k.currentFileInfo, b), l.selfSelectors = h, h[h.length - 1].extendList = [l], m.push(l), l.ruleset = k.ruleset, l.parent_ids = l.parent_ids.concat(k.parent_ids, j.parent_ids), k.firstExtendOnThisSelectorPath && (l.firstExtendOnThisSelectorPath = !0, k.ruleset.paths.push(h))
						})));
					if (m.length) {
						if (this.extendChainCount++, c > 100) {
							var o = "{unable to calculate}",
								p = "{unable to calculate}";
							try {
								o = m[0].selfSelectors[0].toCSS(), p = m[0].selector.toCSS()
							} catch (q) {}
							throw {
								message: "extend circular reference detected. One of the circular extends is currently:" + o + ":extend(" + p + ")"
							}
						}
						return m.concat(n.doExtendChaining(m, b, c + 1))
					}
					return m
				},
				visitRule: function(a, b) {
					b.visitDeeper = !1
				},
				visitMixinDefinition: function(a, b) {
					b.visitDeeper = !1
				},
				visitSelector: function(a, b) {
					b.visitDeeper = !1
				},
				visitRuleset: function(a, b) {
					if (!a.root) {
						var c, d, e, f, g = this.allExtendsStack[this.allExtendsStack.length - 1],
							h = [],
							i = this;
						for (e = 0; g.length > e; e++)
							for (d = 0; a.paths.length > d; d++)
								if (f = a.paths[d], !a.extendOnEveryPath) {
									var j = f[f.length - 1].extendList;
									j && j.length || (c = this.findMatch(g[e], f), c.length && (g[e].hasFoundMatches = !0, g[e].selfSelectors.forEach(function(a) {
										var b;
										b = i.extendSelector(c, f, a, g[e].isVisible()), h.push(b)
									})))
								}
						a.paths = a.paths.concat(h)
					}
				},
				findMatch: function(a, b) {
					var c, d, e, f, g, h, i, j = this,
						k = a.selector.elements,
						l = [],
						m = [];
					for (c = 0; b.length > c; c++)
						for (d = b[c], e = 0; d.elements.length > e; e++)
							for (f = d.elements[e], (a.allowBefore || 0 === c && 0 === e) && l.push({
									pathIndex: c,
									index: e,
									matched: 0,
									initialCombinator: f.combinator
								}), h = 0; l.length > h; h++) i = l[h], g = f.combinator.value, "" === g && 0 === e && (g = " "), !j.isElementValuesEqual(k[i.matched].value, f.value) || i.matched > 0 && k[i.matched].combinator.value !== g ? i = null : i.matched++, i && (i.finished = i.matched === k.length, i.finished && !a.allowAfter && (d.elements.length > e + 1 || b.length > c + 1) && (i = null)), i ? i.finished && (i.length = k.length, i.endPathIndex = c, i.endPathElementIndex = e + 1, l.length = 0, m.push(i)) : (l.splice(h, 1), h--);
					return m
				},
				isElementValuesEqual: function(a, b) {
					if ("string" == typeof a || "string" == typeof b) return a === b;
					if (a instanceof d.Attribute) return a.op !== b.op || a.key !== b.key ? !1 : a.value && b.value ? (a = a.value.value || a.value, b = b.value.value || b.value, a === b) : !a.value && !b.value;
					if (a = a.value, b = b.value, a instanceof d.Selector) {
						if (!(b instanceof d.Selector) || a.elements.length !== b.elements.length) return !1;
						for (var c = 0; a.elements.length > c; c++) {
							if (a.elements[c].combinator.value !== b.elements[c].combinator.value && (0 !== c || (a.elements[c].combinator.value || " ") !== (b.elements[c].combinator.value || " "))) return !1;
							if (!this.isElementValuesEqual(a.elements[c].value, b.elements[c].value)) return !1
						}
						return !0
					}
					return !1
				},
				extendSelector: function(a, b, c, e) {
					var f, g, h, i, j, k = 0,
						l = 0,
						m = [];
					for (f = 0; a.length > f; f++) i = a[f], g = b[i.pathIndex], h = new d.Element(i.initialCombinator, c.elements[0].value, c.elements[0].index, c.elements[0].currentFileInfo), i.pathIndex > k && l > 0 && (m[m.length - 1].elements = m[m.length - 1].elements.concat(b[k].elements.slice(l)), l = 0, k++), j = g.elements.slice(l, i.index).concat([h]).concat(c.elements.slice(1)), k === i.pathIndex && f > 0 ? m[m.length - 1].elements = m[m.length - 1].elements.concat(j) : (m = m.concat(b.slice(k, i.pathIndex)), m.push(new d.Selector(j))), k = i.endPathIndex, l = i.endPathElementIndex, l >= b[k].elements.length && (l = 0, k++);
					return b.length > k && l > 0 && (m[m.length - 1].elements = m[m.length - 1].elements.concat(b[k].elements.slice(l)), k++), m = m.concat(b.slice(k, b.length)), m = m.map(function(a) {
						var b = a.createDerived(a.elements);
						return e ? b.ensureVisibility() : b.ensureInvisibility(), b
					})
				},
				visitMedia: function(a, b) {
					var c = a.allExtends.concat(this.allExtendsStack[this.allExtendsStack.length - 1]);
					c = c.concat(this.doExtendChaining(c, a.allExtends)), this.allExtendsStack.push(c)
				},
				visitMediaOut: function(a) {
					var b = this.allExtendsStack.length - 1;
					this.allExtendsStack.length = b
				},
				visitDirective: function(a, b) {
					var c = a.allExtends.concat(this.allExtendsStack[this.allExtendsStack.length - 1]);
					c = c.concat(this.doExtendChaining(c, a.allExtends)), this.allExtendsStack.push(c)
				},
				visitDirectiveOut: function(a) {
					var b = this.allExtendsStack.length - 1;
					this.allExtendsStack.length = b
				}
			}, b.exports = h
		}, {
			"../logger": 33,
			"../tree": 62,
			"./visitor": 91
		}],
		85: [function(a, b, c) {
			function d(a) {
				this.imports = [], this.variableImports = [], this._onSequencerEmpty = a, this._currentDepth = 0
			}
			d.prototype.addImport = function(a) {
				var b = this,
					c = {
						callback: a,
						args: null,
						isReady: !1
					};
				return this.imports.push(c),
					function() {
						c.args = Array.prototype.slice.call(arguments, 0), c.isReady = !0, b.tryRun()
					}
			}, d.prototype.addVariableImport = function(a) {
				this.variableImports.push(a)
			}, d.prototype.tryRun = function() {
				this._currentDepth++;
				try {
					for (;;) {
						for (; this.imports.length > 0;) {
							var a = this.imports[0];
							if (!a.isReady) return;
							this.imports = this.imports.slice(1), a.callback.apply(null, a.args)
						}
						if (0 === this.variableImports.length) break;
						var b = this.variableImports[0];
						this.variableImports = this.variableImports.slice(1), b()
					}
				} finally {
					this._currentDepth--
				}
				0 === this._currentDepth && this._onSequencerEmpty && this._onSequencerEmpty()
			}, b.exports = d
		}, {}],
		86: [function(a, b, c) {
			var d = a("../contexts"),
				e = a("./visitor"),
				f = a("./import-sequencer"),
				g = function(a, b) {
					this._visitor = new e(this), this._importer = a, this._finish = b, this.context = new d.Eval, this.importCount = 0, this.onceFileDetectionMap = {}, this.recursionDetector = {}, this._sequencer = new f(this._onSequencerEmpty.bind(this))
				};
			g.prototype = {
				isReplacing: !1,
				run: function(a) {
					try {
						this._visitor.visit(a)
					} catch (b) {
						this.error = b
					}
					this.isFinished = !0, this._sequencer.tryRun()
				},
				_onSequencerEmpty: function() {
					this.isFinished && this._finish(this.error)
				},
				visitImport: function(a, b) {
					var c = a.options.inline;
					if (!a.css || c) {
						var e = new d.Eval(this.context, this.context.frames.slice(0)),
							f = e.frames[0];
						this.importCount++, a.isVariableImport() ? this._sequencer.addVariableImport(this.processImportNode.bind(this, a, e, f)) : this.processImportNode(a, e, f)
					}
					b.visitDeeper = !1
				},
				processImportNode: function(a, b, c) {
					var d, e = a.options.inline;
					try {
						d = a.evalForImport(b)
					} catch (f) {
						f.filename || (f.index = a.index, f.filename = a.currentFileInfo.filename), a.css = !0, a.error = f
					}
					if (!d || d.css && !e) this.importCount--, this.isFinished && this._sequencer.tryRun();
					else {
						d.options.multiple && (b.importMultiple = !0);
						for (var g = void 0 === d.css, h = 0; c.rules.length > h; h++)
							if (c.rules[h] === a) {
								c.rules[h] = d;
								break
							}
						var i = this.onImported.bind(this, d, b),
							j = this._sequencer.addImport(i);
						this._importer.push(d.getPath(), g, d.currentFileInfo, d.options, j)
					}
				},
				onImported: function(a, b, c, d, e, f) {
					c && (c.filename || (c.index = a.index, c.filename = a.currentFileInfo.filename), this.error = c);
					var g = this,
						h = a.options.inline,
						i = a.options.plugin,
						j = a.options.optional,
						k = e || f in g.recursionDetector;
					if (b.importMultiple || (a.skip = k ? !0 : function() {
							return f in g.onceFileDetectionMap ? !0 : (g.onceFileDetectionMap[f] = !0, !1)
						}), !f && j && (a.skip = !0), d && (a.root = d, a.importedFilename = f, !h && !i && (b.importMultiple || !k))) {
						g.recursionDetector[f] = !0;
						var l = this.context;
						this.context = b;
						try {
							this._visitor.visit(d)
						} catch (c) {
							this.error = c
						}
						this.context = l
					}
					g.importCount--, g.isFinished && g._sequencer.tryRun()
				},
				visitRule: function(a, b) {
					"DetachedRuleset" === a.value.type ? this.context.frames.unshift(a) : b.visitDeeper = !1
				},
				visitRuleOut: function(a) {
					"DetachedRuleset" === a.value.type && this.context.frames.shift()
				},
				visitDirective: function(a, b) {
					this.context.frames.unshift(a)
				},
				visitDirectiveOut: function(a) {
					this.context.frames.shift()
				},
				visitMixinDefinition: function(a, b) {
					this.context.frames.unshift(a)
				},
				visitMixinDefinitionOut: function(a) {
					this.context.frames.shift()
				},
				visitRuleset: function(a, b) {
					this.context.frames.unshift(a)
				},
				visitRulesetOut: function(a) {
					this.context.frames.shift()
				},
				visitMedia: function(a, b) {
					this.context.frames.unshift(a.rules[0])
				},
				visitMediaOut: function(a) {
					this.context.frames.shift()
				}
			}, b.exports = g
		}, {
			"../contexts": 11,
			"./import-sequencer": 85,
			"./visitor": 91
		}],
		87: [function(a, b, c) {
			var d = {
				Visitor: a("./visitor"),
				ImportVisitor: a("./import-visitor"),
				MarkVisibleSelectorsVisitor: a("./set-tree-visibility-visitor"),
				ExtendVisitor: a("./extend-visitor"),
				JoinSelectorVisitor: a("./join-selector-visitor"),
				ToCSSVisitor: a("./to-css-visitor")
			};
			b.exports = d
		}, {
			"./extend-visitor": 84,
			"./import-visitor": 86,
			"./join-selector-visitor": 88,
			"./set-tree-visibility-visitor": 89,
			"./to-css-visitor": 90,
			"./visitor": 91
		}],
		88: [function(a, b, c) {
			var d = a("./visitor"),
				e = function() {
					this.contexts = [
						[]
					], this._visitor = new d(this)
				};
			e.prototype = {
				run: function(a) {
					return this._visitor.visit(a)
				},
				visitRule: function(a, b) {
					b.visitDeeper = !1
				},
				visitMixinDefinition: function(a, b) {
					b.visitDeeper = !1
				},
				visitRuleset: function(a, b) {
					var c, d = this.contexts[this.contexts.length - 1],
						e = [];
					this.contexts.push(e), a.root || (c = a.selectors, c && (c = c.filter(function(a) {
						return a.getIsOutput()
					}), a.selectors = c.length ? c : c = null, c && a.joinSelectors(e, d, c)), c || (a.rules = null), a.paths = e)
				},
				visitRulesetOut: function(a) {
					this.contexts.length = this.contexts.length - 1
				},
				visitMedia: function(a, b) {
					var c = this.contexts[this.contexts.length - 1];
					a.rules[0].root = 0 === c.length || c[0].multiMedia
				},
				visitDirective: function(a, b) {
					var c = this.contexts[this.contexts.length - 1];
					a.rules && a.rules.length && (a.rules[0].root = a.isRooted || 0 === c.length || null)
				}
			}, b.exports = e
		}, {
			"./visitor": 91
		}],
		89: [function(a, b, c) {
			var d = function(a) {
				this.visible = a
			};
			d.prototype.run = function(a) {
				this.visit(a)
			}, d.prototype.visitArray = function(a) {
				if (!a) return a;
				var b, c = a.length;
				for (b = 0; c > b; b++) this.visit(a[b]);
				return a
			}, d.prototype.visit = function(a) {
				return a ? a.constructor === Array ? this.visitArray(a) : !a.blocksVisibility || a.blocksVisibility() ? a : (this.visible ? a.ensureVisibility() : a.ensureInvisibility(), a.accept(this), a) : a
			}, b.exports = d
		}, {}],
		90: [function(a, b, c) {
			var d = a("../tree"),
				e = a("./visitor"),
				f = function(a) {
					this._visitor = new e(this), this._context = a
				};
			f.prototype = {
				containsSilentNonBlockedChild: function(a) {
					var b;
					if (null == a) return !1;
					for (var c = 0; a.length > c; c++)
						if (b = a[c], b.isSilent && b.isSilent(this._context) && !b.blocksVisibility()) return !0;
					return !1
				},
				keepOnlyVisibleChilds: function(a) {
					null != a && null != a.rules && (a.rules = a.rules.filter(function(a) {
						return a.isVisible()
					}))
				},
				isEmpty: function(a) {
					return null == a || null == a.rules ? !0 : 0 === a.rules.length
				},
				hasVisibleSelector: function(a) {
					return null == a || null == a.paths ? !1 : a.paths.length > 0
				},
				resolveVisibility: function(a, b) {
					if (!a.blocksVisibility()) {
						if (this.isEmpty(a) && !this.containsSilentNonBlockedChild(b)) return;
						return a
					}
					var c = a.rules[0];
					return this.keepOnlyVisibleChilds(c), this.isEmpty(c) ? void 0 : (a.ensureVisibility(), a.removeVisibilityBlock(), a)
				},
				isVisibleRuleset: function(a) {
					return a.firstRoot ? !0 : this.isEmpty(a) ? !1 : !(!a.root && !this.hasVisibleSelector(a))
				}
			};
			var g = function(a) {
				this._visitor = new e(this), this._context = a, this.utils = new f(a)
			};
			g.prototype = {
				isReplacing: !0,
				run: function(a) {
					return this._visitor.visit(a)
				},
				visitRule: function(a, b) {
					return a.blocksVisibility() || a.variable ? void 0 : a
				},
				visitMixinDefinition: function(a, b) {
					a.frames = []
				},
				visitExtend: function(a, b) {},
				visitComment: function(a, b) {
					return a.blocksVisibility() || a.isSilent(this._context) ? void 0 : a
				},
				visitMedia: function(a, b) {
					var c = a.rules[0].rules;
					return a.accept(this._visitor), b.visitDeeper = !1, this.utils.resolveVisibility(a, c)
				},
				visitImport: function(a, b) {
					return a.blocksVisibility() ? void 0 : a
				},
				visitDirective: function(a, b) {
					return a.rules && a.rules.length ? this.visitDirectiveWithBody(a, b) : this.visitDirectiveWithoutBody(a, b)
				},
				visitDirectiveWithBody: function(a, b) {
					function c(a) {
						var b = a.rules;
						return 1 === b.length && (!b[0].paths || 0 === b[0].paths.length)
					}

					function d(a) {
						var b = a.rules;
						return c(a) ? b[0].rules : b
					}
					var e = d(a);
					return a.accept(this._visitor), b.visitDeeper = !1, this.utils.isEmpty(a) || this._mergeRules(a.rules[0].rules), this.utils.resolveVisibility(a, e)
				},
				visitDirectiveWithoutBody: function(a, b) {
					if (!a.blocksVisibility()) {
						if ("@charset" === a.name) {
							if (this.charset) {
								if (a.debugInfo) {
									var c = new d.Comment("/* " + a.toCSS(this._context).replace(/\n/g, "") + " */\n");
									return c.debugInfo = a.debugInfo, this._visitor.visit(c)
								}
								return
							}
							this.charset = !0
						}
						return a
					}
				},
				checkValidNodes: function(a, b) {
					if (a)
						for (var c = 0; a.length > c; c++) {
							var e = a[c];
							if (b && e instanceof d.Rule && !e.variable) throw {
								message: "Properties must be inside selector blocks. They cannot be in the root",
								index: e.index,
								filename: e.currentFileInfo && e.currentFileInfo.filename
							};
							if (e instanceof d.Call) throw {
								message: "Function '" + e.name + "' is undefined",
								index: e.index,
								filename: e.currentFileInfo && e.currentFileInfo.filename
							};
							if (e.type && !e.allowRoot) throw {
								message: e.type + " node returned by a function is not valid here",
								index: e.index,
								filename: e.currentFileInfo && e.currentFileInfo.filename
							}
						}
				},
				visitRuleset: function(a, b) {
					var c, d = [];
					if (this.checkValidNodes(a.rules, a.firstRoot), a.root) a.accept(this._visitor), b.visitDeeper = !1;
					else {
						this._compileRulesetPaths(a);
						for (var e = a.rules, f = e ? e.length : 0, g = 0; f > g;) c = e[g], c && c.rules ? (d.push(this._visitor.visit(c)), e.splice(g, 1), f--) : g++;
						f > 0 ? a.accept(this._visitor) : a.rules = null, b.visitDeeper = !1
					}
					return a.rules && (this._mergeRules(a.rules), this._removeDuplicateRules(a.rules)), this.utils.isVisibleRuleset(a) && (a.ensureVisibility(), d.splice(0, 0, a)), 1 === d.length ? d[0] : d
				},
				_compileRulesetPaths: function(a) {
					a.paths && (a.paths = a.paths.filter(function(a) {
						var b;
						for (" " === a[0].elements[0].combinator.value && (a[0].elements[0].combinator = new d.Combinator("")), b = 0; a.length > b; b++)
							if (a[b].isVisible() && a[b].getIsOutput()) return !0;
						return !1
					}))
				},
				_removeDuplicateRules: function(a) {
					if (a) {
						var b, c, e, f = {};
						for (e = a.length - 1; e >= 0; e--)
							if (c = a[e], c instanceof d.Rule)
								if (f[c.name]) {
									b = f[c.name], b instanceof d.Rule && (b = f[c.name] = [f[c.name].toCSS(this._context)]);
									var g = c.toCSS(this._context); - 1 !== b.indexOf(g) ? a.splice(e, 1) : b.push(g)
								} else f[c.name] = c
					}
				},
				_mergeRules: function(a) {
					if (a) {
						for (var b, c, e, f = {}, g = 0; a.length > g; g++) c = a[g], c instanceof d.Rule && c.merge && (e = [c.name, c.important ? "!" : ""].join(","), f[e] ? a.splice(g--, 1) : f[e] = [], f[e].push(c));
						Object.keys(f).map(function(a) {
							function e(a) {
								return new d.Expression(a.map(function(a) {
									return a.value
								}))
							}

							function g(a) {
								return new d.Value(a.map(function(a) {
									return a
								}))
							}
							if (b = f[a], b.length > 1) {
								c = b[0];
								var h = [],
									i = [];
								b.map(function(a) {
									"+" === a.merge && (i.length > 0 && h.push(e(i)), i = []), i.push(a)
								}), h.push(e(i)), c.value = g(h)
							}
						})
					}
				},
				visitAnonymous: function(a, b) {
					return a.blocksVisibility() ? void 0 : (a.accept(this._visitor), a)
				}
			}, b.exports = g
		}, {
			"../tree": 62,
			"./visitor": 91
		}],
		91: [function(a, b, c) {
			function d(a) {
				return a
			}

			function e(a, b) {
				var c, d;
				for (c in a)
					if (a.hasOwnProperty(c)) switch (d = a[c], typeof d) {
						case "function":
							d.prototype && d.prototype.type && (d.prototype.typeIndex = b++);
							break;
						case "object":
							b = e(d, b)
					}
					return b
			}
			var f = a("../tree"),
				g = {
					visitDeeper: !0
				},
				h = !1,
				i = function(a) {
					this._implementation = a, this._visitFnCache = [], h || (e(f, 1), h = !0)
				};
			i.prototype = {
				visit: function(a) {
					if (!a) return a;
					var b = a.typeIndex;
					if (!b) return a;
					var c, e = this._visitFnCache,
						f = this._implementation,
						h = b << 1,
						i = 1 | h,
						j = e[h],
						k = e[i],
						l = g;
					if (l.visitDeeper = !0, j || (c = "visit" + a.type, j = f[c] || d, k = f[c + "Out"] || d, e[h] = j, e[i] = k), j !== d) {
						var m = j.call(f, a, l);
						f.isReplacing && (a = m)
					}
					return l.visitDeeper && a && a.accept && a.accept(this), k != d && k.call(f, a), a
				},
				visitArray: function(a, b) {
					if (!a) return a;
					var c, d = a.length;
					if (b || !this._implementation.isReplacing) {
						for (c = 0; d > c; c++) this.visit(a[c]);
						return a
					}
					var e = [];
					for (c = 0; d > c; c++) {
						var f = this.visit(a[c]);
						void 0 !== f && (f.splice ? f.length && this.flatten(f, e) : e.push(f))
					}
					return e
				},
				flatten: function(a, b) {
					b || (b = []);
					var c, d, e, f, g, h;
					for (d = 0, c = a.length; c > d; d++)
						if (e = a[d], void 0 !== e)
							if (e.splice)
								for (g = 0, f = e.length; f > g; g++) h = e[g], void 0 !== h && (h.splice ? h.length && this.flatten(h, b) : b.push(h));
							else b.push(e);
					return b
				}
			}, b.exports = i
		}, {
			"../tree": 62
		}],
		92: [function(a, b, c) {
			"use strict";

			function d() {
				if (i.length) throw i.shift()
			}

			function e(a) {
				var b;
				b = h.length ? h.pop() : new f, b.task = a, g(b)
			}

			function f() {
				this.task = null
			}
			var g = a("./raw"),
				h = [],
				i = [],
				j = g.makeRequestCallFromTimer(d);
			b.exports = e, f.prototype.call = function() {
				try {
					this.task.call()
				} catch (a) {
					e.onerror ? e.onerror(a) : (i.push(a), j())
				} finally {
					this.task = null, h[h.length] = this
				}
			}
		}, {
			"./raw": 93
		}],
		93: [function(a, b, c) {
			(function(a) {
				"use strict";

				function c(a) {
					h.length || (g(), i = !0), h[h.length] = a
				}

				function d() {
					for (; h.length > j;) {
						var a = j;
						if (j += 1, h[a].call(), j > k) {
							for (var b = 0, c = h.length - j; c > b; b++) h[b] = h[b + j];
							h.length -= j, j = 0
						}
					}
					h.length = 0, j = 0, i = !1
				}

				function e(a) {
					var b = 1,
						c = new l(a),
						d = document.createTextNode("");
					return c.observe(d, {
							characterData: !0
						}),
						function() {
							b = -b, d.data = b
						}
				}

				function f(a) {
					return function() {
						function b() {
							clearTimeout(c), clearInterval(d), a()
						}
						var c = setTimeout(b, 0),
							d = setInterval(b, 50)
					}
				}
				b.exports = c;
				var g, h = [],
					i = !1,
					j = 0,
					k = 1024,
					l = a.MutationObserver || a.WebKitMutationObserver;
				g = "function" == typeof l ? e(d) : f(d), c.requestFlush = g, c.makeRequestCallFromTimer = f
			}).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
		}, {}],
		94: [function(a, b, c) {
			"use strict";

			function d() {}

			function e(a) {
				try {
					return a.then
				} catch (b) {
					return r = b, s
				}
			}

			function f(a, b) {
				try {
					return a(b)
				} catch (c) {
					return r = c, s
				}
			}

			function g(a, b, c) {
				try {
					a(b, c)
				} catch (d) {
					return r = d, s
				}
			}

			function h(a) {
				if ("object" != typeof this) throw new TypeError("Promises must be constructed via new");
				if ("function" != typeof a) throw new TypeError("not a function");
				this._45 = 0, this._81 = 0, this._65 = null, this._54 = null, a !== d && p(a, this)
			}

			function i(a, b, c) {
				return new a.constructor(function(e, f) {
					var g = new h(d);
					g.then(e, f), j(a, new o(b, c, g))
				})
			}

			function j(a, b) {
				for (; 3 === a._81;) a = a._65;
				return h._10 && h._10(a), 0 === a._81 ? 0 === a._45 ? (a._45 = 1, void(a._54 = b)) : 1 === a._45 ? (a._45 = 2, void(a._54 = [a._54, b])) : void a._54.push(b) : void k(a, b)
			}

			function k(a, b) {
				q(function() {
					var c = 1 === a._81 ? b.onFulfilled : b.onRejected;
					if (null === c) return void(1 === a._81 ? l(b.promise, a._65) : m(b.promise, a._65));
					var d = f(c, a._65);
					d === s ? m(b.promise, r) : l(b.promise, d)
				})
			}

			function l(a, b) {
				if (b === a) return m(a, new TypeError("A promise cannot be resolved with itself."));
				if (b && ("object" == typeof b || "function" == typeof b)) {
					var c = e(b);
					if (c === s) return m(a, r);
					if (c === a.then && b instanceof h) return a._81 = 3, a._65 = b, void n(a);
					if ("function" == typeof c) return void p(c.bind(b), a)
				}
				a._81 = 1, a._65 = b, n(a)
			}

			function m(a, b) {
				a._81 = 2, a._65 = b, h._97 && h._97(a, b), n(a)
			}

			function n(a) {
				if (1 === a._45 && (j(a, a._54), a._54 = null), 2 === a._45) {
					for (var b = 0; a._54.length > b; b++) j(a, a._54[b]);
					a._54 = null
				}
			}

			function o(a, b, c) {
				this.onFulfilled = "function" == typeof a ? a : null, this.onRejected = "function" == typeof b ? b : null, this.promise = c
			}

			function p(a, b) {
				var c = !1,
					d = g(a, function(a) {
						c || (c = !0, l(b, a))
					}, function(a) {
						c || (c = !0, m(b, a))
					});
				c || d !== s || (c = !0, m(b, r))
			}
			var q = a("asap/raw"),
				r = null,
				s = {};
			b.exports = h, h._10 = null, h._97 = null, h._61 = d, h.prototype.then = function(a, b) {
				if (this.constructor !== h) return i(this, a, b);
				var c = new h(d);
				return j(this, new o(a, b, c)), c
			}
		}, {
			"asap/raw": 93
		}],
		95: [function(a, b, c) {
			"use strict";

			function d(a) {
				var b = new e(e._61);
				return b._81 = 1, b._65 = a, b
			}
			var e = a("./core.js");
			b.exports = e;
			var f = d(!0),
				g = d(!1),
				h = d(null),
				i = d(void 0),
				j = d(0),
				k = d("");
			e.resolve = function(a) {
				if (a instanceof e) return a;
				if (null === a) return h;
				if (void 0 === a) return i;
				if (a === !0) return f;
				if (a === !1) return g;
				if (0 === a) return j;
				if ("" === a) return k;
				if ("object" == typeof a || "function" == typeof a) try {
					var b = a.then;
					if ("function" == typeof b) return new e(b.bind(a))
				} catch (c) {
					return new e(function(a, b) {
						b(c)
					})
				}
				return d(a)
			}, e.all = function(a) {
				var b = Array.prototype.slice.call(a);
				return new e(function(a, c) {
					function d(g, h) {
						if (h && ("object" == typeof h || "function" == typeof h)) {
							if (h instanceof e && h.then === e.prototype.then) {
								for (; 3 === h._81;) h = h._65;
								return 1 === h._81 ? d(g, h._65) : (2 === h._81 && c(h._65), void h.then(function(a) {
									d(g, a)
								}, c))
							}
							var i = h.then;
							if ("function" == typeof i) {
								var j = new e(i.bind(h));
								return void j.then(function(a) {
									d(g, a)
								}, c)
							}
						}
						b[g] = h, 0 === --f && a(b)
					}
					if (0 === b.length) return a([]);
					for (var f = b.length, g = 0; b.length > g; g++) d(g, b[g])
				})
			}, e.reject = function(a) {
				return new e(function(b, c) {
					c(a)
				})
			}, e.race = function(a) {
				return new e(function(b, c) {
					a.forEach(function(a) {
						e.resolve(a).then(b, c)
					})
				})
			}, e.prototype["catch"] = function(a) {
				return this.then(null, a)
			}
		}, {
			"./core.js": 94
		}],
		96: [function(a, b, c) {
			"function" != typeof Promise.prototype.done && (Promise.prototype.done = function(a, b) {
				var c = arguments.length ? this.then.apply(this, arguments) : this;
				c.then(null, function(a) {
					setTimeout(function() {
						throw a
					}, 0)
				})
			})
		}, {}],
		97: [function(a, b, c) {
			a("asap");
			"undefined" == typeof Promise && (Promise = a("./lib/core.js"), a("./lib/es6-extensions.js")), a("./polyfill-done.js")
		}, {
			"./lib/core.js": 94,
			"./lib/es6-extensions.js": 95,
			"./polyfill-done.js": 96,
			asap: 92
		}]
	}, {}, [2])(2)
});/*!
 * pReact & pjs template v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/pReact
 */
 pReact && ((function($) {
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

    function base64encode(str) {
        var out, i, len;
        var c1, c2, c3;

        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    }

    function base64decode(str) {
        var c1, c2, c3, c4;
        var i, len, out;

        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            /* c1 */
            do {
                c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c1 == -1);
            if (c1 == -1)
                break;

            /* c2 */
            do {
                c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c2 == -1);
            if (c2 == -1)
                break;

            out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

            /* c3 */
            do {
                c3 = str.charCodeAt(i++) & 0xff;
                if (c3 == 61)
                    return out;
                c3 = base64DecodeChars[c3];
            } while (i < len && c3 == -1);
            if (c3 == -1)
                break;

            out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

            /* c4 */
            do {
                c4 = str.charCodeAt(i++) & 0xff;
                if (c4 == 61)
                    return out;
                c4 = base64DecodeChars[c4];
            } while (i < len && c4 == -1);
            if (c4 == -1)
                break;
            out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
        }
        return out;
    }

    function utf16to8(str) {
        var out, i, len, c;

        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }

    function utf8to16(str) {
        var out, i, len, c;
        var char2, char3;

        out = "";
        len = str.length;
        i = 0;
        while (i < len) {
            c = str.charCodeAt(i++);
            switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out += str.charAt(i - 1);
                    break;
                case 12:
                case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = str.charCodeAt(i++);
                    char3 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
                    break;
            }
        }

        return out;
    }

    function CharToHex(str) {
        var out, i, len, c, h;
        out = "";
        len = str.length;
        i = 0;
        while (i < len) {
            c = str.charCodeAt(i++);
            h = c.toString(16);
            if (h.length < 2)
                h = "0" + h;

            out += "\\x" + h + " ";
            if (i > 0 && i % 8 == 0)
                out += "\r\n";
        }

        return out;
    }

    function doEncode(content) {
        return base64encode(utf16to8(content));
    }

    function doDecode(content) {
        return CharToHex(base64decode(content));
    }

    function toEncode(contents) {
        return {
            done: function() {
                return doEncode(contents);
            }
        }
    }

    $.tmplFilterExtend({
        base64: function(contents, filterCondition) {
            contents = (new toEncode(contents)).done();
            switch (filterCondition) {
                case "text":
                    type = "text/plain";
                    break;
                case "html":
                    type = "text/html";
                    break;
            }
            return "data:text/plain;charset=UTF-8;base64," + contents;
        }
    });
})(pReact));/*!
 * pReact & pjs template v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/pReact
 */
 pReact && (pReact.share = function($, selector, ops) {
	var win = window;
	var device = pReact.device;
	var Base64 = {
		_keyStr: ops.key,
		encode: function(a) {
			var b, c, d, e, f, g, h, i = "",
				j = 0;
			for (a = Base64._utf8_encode(a); j < a.length;) b = a.charCodeAt(j++), c = a.charCodeAt(j++), d = a.charCodeAt(j++), e = b >> 2, f = (3 & b) << 4 | c >> 4, g = (15 & c) << 2 | d >> 6, h = 63 & d, isNaN(c) ? g = h = 64 : isNaN(d) && (h = 64), i = i + this._keyStr.charAt(e) + this._keyStr.charAt(f) + this._keyStr.charAt(g) + this._keyStr.charAt(h);
			return i
		},
		decode: function(a) {
			var b, c, d, e, f, g, h, i = "",
				j = 0;
			for (a = a.replace(/[^A-Za-z0-9\+\/\=]/g, ""); j < a.length;) e = this._keyStr.indexOf(a.charAt(j++)), f = this._keyStr.indexOf(a.charAt(j++)), g = this._keyStr.indexOf(a.charAt(j++)), h = this._keyStr.indexOf(a.charAt(j++)), b = e << 2 | f >> 4, c = (15 & f) << 4 | g >> 2, d = (3 & g) << 6 | h, i += String.fromCharCode(b), 64 != g && (i += String.fromCharCode(c)), 64 != h && (i += String.fromCharCode(d));
			return i = Base64._utf8_decode(i)
		},
		_utf8_encode: function(a) {
			a = a.replace(/\r\n/g, "\n");
			for (var b = "", c = 0; c < a.length; c++) {
				var d = a.charCodeAt(c);
				128 > d ? b += String.fromCharCode(d) : d > 127 && 2048 > d ? (b += String.fromCharCode(d >> 6 | 192), b += String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224), b += String.fromCharCode(d >> 6 & 63 | 128), b += String.fromCharCode(63 & d | 128))
			}
			return b
		},
		_utf8_decode: function(a) {
			for (var b = "", c = 0, d = c1 = c2 = 0; c < a.length;) d = a.charCodeAt(c), 128 > d ? (b += String.fromCharCode(d), c++) : d > 191 && 224 > d ? (c2 = a.charCodeAt(c + 1), b += String.fromCharCode((31 & d) << 6 | 63 & c2), c += 2) : (c2 = a.charCodeAt(c + 1), c3 = a.charCodeAt(c + 2), b += String.fromCharCode((15 & d) << 12 | (63 & c2) << 6 | 63 & c3), c += 3);
			return b
		}
	};
	var url = ops.url,
		title = ops.title,
		desc = ops.desc,
		img = ops.img,
		form = ops.form,
		id = ops.newsid,
		toStr = function(a, b) {
			var c, d, e;
			for (d in b) e = b[d], c = new RegExp("(" + d + "=)[^&]+", "i"), a.match(c) ? a = a.replace(c, "$1" + e) : a += -1 === a.indexOf("?") ? "?" + d + "=" + e : "&" + d + "=" + e;
			return a
		},
		appList = {
			sinaweibo: ["kSinaWeibo", "SinaWeibo", 11, "\u65B0\u6D6A\u5FAE\u535A"],
			wechatfriends: ["kWeixin", "WechatFriends", 1, "\u5FAE\u4FE1\u597D\u53CB"],
			wechattimeline: ["kWeixinFriend", "WechatTimeline", "8", "\u5FAE\u4FE1\u670B\u53CB\u5708"],
			qq: ["kQQ", "QQ", "4", "QQ\u597D\u53CB"],
			qzone: ["kQZone", "QZone", "3", "QQ\u7A7A\u95F4"]
		};

	function g(a) {
		var b = doc.createElement("div");
		b.style.visibility = "hidden", b.innerHTML = '<iframe src="' + a + '" scrolling="no" width="1" height="1"></iframe>', doc.body.appendChild(b), setTimeout(function() {
			b && b.parentNode && b.parentNode.removeChild(b)
		}, 5e3)
	}

	function celement(a, b) {
		var c = doc.createElement("script"),
			d = doc.getElementsByTagName("body")[0];
		c.setAttribute("src", a), c.onload = c.onreadystatechange = function() {
			this.readyState && "loaded" != this.readyState && "complete" != this.readyState || (b && b(), c.onload = c.onreadystatechange = null, c.parentNode.removeChild(c))
		}, d.appendChild(c)
	}

	function shareto(app) {
		switch (app) {
			case "hexunwb":
				location.href = 'http://m.hexun.com/share.php?type=hx_wb&from_url=' + url + '&title=' + title;
				break;
			case "txwb":
				location.href = 'http://m.hexun.com/share.php?type=qq_wb&from_url=' + url + '&title=' + title;
				break;
			case "wechattimeline":
			case "wechatfriends":
				if (device.browser.isUC) {
					device.os.isiOS && "undefined" != typeof ucbrowser ? (a = appList[app][0], ucbrowser.web_share(title, title, url, a, "", " @" + form + " ", "")) : "undefined" != typeof ucweb ? (a = appList[app][1], ucweb.startRequest("shell.page_share", [title, title + " @" + form + " ", url, a, "", "", ""])) : console.log("UCBrowser native share bypass.");
				} else if (device.browser.isqqbrowser) {
					celement && celement("http://jsapi.qq.com/get?api=app.share", function() {
						var o = {
							url: url,
							title: title,
							img_url: img,
							to_app: appList[app][2],
							cus_txt: title + " @hexun.com "
						};
						typeof browser != "undefined" && browser.app && browser.app.share ? browser.app.share(o) : typeof qb != "undefined" ? qb.share(o) : console.log("QQBrowser native share bypass.");
					});
				} else if (device.browser.isSogou) {
					var p = {
						shareTitle: title,
						shareContent: desc,
						shareImageUrl: img,
						shareUrl: url,
						shareSnapshotTab: "",
						shareType: null
					};
					"wechatfriends" == app || "wechattimeline" == app ? ("wechatfriends" == app ? p.shareType = 2 : "wechattimeline" == app && (p.shareType = 4), SogouMse && SogouMse.Utility && SogouMse.Utility.shareWithInfo ? SogouMse.Utility.shareWithInfo(p) : console.log("sogouBrowser native share error.")) : win.location.href = toStr("http://service.weibo.com/share/share.php?", {
						title: encodeURIComponent(title),
						url: encodeURIComponent(url),
						appkey: "",
						pic: img,
						ralateUid: "",
						count: "n",
						size: "middle"
					})
				} else if (device.browser.isWechat) {

				} else {
					device.os.isiOS && device.os.version > 8 ? win.location.href = "mttbrowser://url=" + url : g("mttbrowser://url=" + url)
				}
				break;
			case "sinaweibo":
				win.location.href = toStr("http://service.weibo.com/share/share.php?", {
					title: encodeURIComponent(title),
					url: encodeURIComponent(url),
					appkey: "",
					pic: img,
					ralateUid: "",
					count: "n",
					size: "middle"
				});
				break;
			case "qzone":
				var d = Base64.encode(url),
					j = Base64.encode(img),
					f = Base64.encode(title),
					i = Base64.encode(desc),
					k = Base64.encode(form);
				var n = {
					android: "mqqapi://share/to_qzone?src_type=app&version=1&file_type=news&req_type=1",
					ios: "mqqapi://share/to_fri?file_type=news&src_type=app&version=1&generalpastboard=1&shareType=1&cflag=1&objectlocation=pasteboard&callback_type=scheme&callback_name=QQ41AF4B2A&"
				};
				device.os.isAndroid ? device.browser.isSamsung ? win.location.href = toStr(n.android, {
					url: d,
					previewimageUrl: j,
					title: f,
					description: i,
					thirdAppDisplayName: k
				}) : g(toStr(n.android, {
					url: d,
					image_url: j,
					title: f,
					description: i,
					app_name: k
				})) : !device.browser.isWechat ? win.location.href = toStr(n.ios, {
					url: d,
					previewimageUrl: j,
					title: f,
					description: i,
					thirdAppDisplayName: k
				}) : location.href = 'http://m.hexun.com/share.php?type=qq_qzone&from_url=' + url + '&title=' + title;
				break;
			case "qq":
				win.location.href = toStr("mqqapi://share/to_fri?src_type=web&version=1&file_type=news", {
					share_id: ops.id || "1101685683",
					title: Base64.encode(title),
					thirdAppDisplayName: Base64.encode(ops.name || "pReact"),
					url: Base64.encode(url),
					previewimageUrl: Base64.encode(img),
					description: Base64.encode(desc)
				});
				break;
			default:
				break;
		}
	}

	function init(selector) {
		var appico = $(selector).find(".page_share_ico");
		device.os.isiOS || device.os.isAndroid ? appico.each(function() {
			if (device.os.isiOS && (device.browser.isQQ || device.browser.isSafari || device.browser.isWechat) && ($(this).hasClass('wt') || $(this).hasClass('wf'))) {
				$(this).hide();
			} else {
				if (device.browser.isWechat && $(this).hasClass('qq')) {
					$(this).hide();
				} else {
					$(this).show().click(function(e) {
						e.preventDefault();
						var app = $(this).attr("data-app");
						shareto(app);
					});
				}
			}
		}) : appico.each(function() {
			if ($(this).hasClass('wb') || $(this).hasClass('txwb') || $(this).hasClass('hexunwb')) {
				$(this).show().click(function(e) {
					e.preventDefault();
					var app = $(this).attr("data-app");
					shareto(app);
				});
			} else {
				$(this).hide();
			}
		});
	}
	init(selector);
});/*!
 * pReact & pjs template v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/pReact
 */
pReact && pReact.jq && (pReact.canvasDraw = function(select, ops) {
	var doc = window.document;

	var drawARC = function(canvas, ops) {
		return new drawARC.fn.init(canvas, ops);
	};
	Array.prototype.del = function(num) {
		this.splice(num, 1);
		return this;
	};

	function emiExec(emi) {
		var len = emi.length,
			i = 0,
			self, val, style, r;

		function b(i) {
			if (emi[i]) {
				self = emi[i].target;
				val = emi[i].val;
				style = emi[i].style;
				r = emi[i].r;
				a();
			}
		}

		function a() {
			setTimeout(function() {
				drawARC.drawARC(self.ctx, self.x, self.y, r || self.r[0], self.sRage, Math.PI * 2 * (self.count / 360) + self.sRage, style || "rgba(0,0,255,1)", function() {
					self.count++;
					drawARC.drawARC(self.ctx, self.x, self.y, self.r[1], 0, Math.PI * 2, self.style[1]);
					drawARC.drawString(self.ctx, ((1 - (360 - self.count) / 360) * 100).toFixed(0) + "%", self.x - 9, self.y + 5, "left", style || "rgba(0,0,255,1)");
					if (self.count <= 360 / 100 * val) {
						a();
					} else {
						emi.del(0);
						self.count = 0;
						b(0);
					}
				});
			}, self.time);
		}
		b(0);
	}
	drawARC.fn = drawARC.prototype = {
		init: function(canvas, ops) {
			this.ctx = canvas.ctx;
			this.sRage = -Math.PI * 0.5;
			this.count = 0;
			this.time = ops && ops.time || 10;
			this.x = ops && ops.x || 0;
			this.y = ops && ops.y || 0;
			this.r = ops && ops.r || [0, 0];
			this.emi = [];
			this.value = ops && ops.val || 100;
			this.style = ops && ops.style || ["rgba(192,192,192, 1)", "rgba(255,255,255,1)"];
			drawARC.drawARC(this.ctx, this.x, this.y, this.r[0], 0, Math.PI * 2, this.style[0]);
			drawARC.drawARC(this.ctx, this.x, this.y, this.r[1], 0, Math.PI * 2, this.style[1]);
			return this;
		},
		draw: function(val, style, r) {
			var self = this;
			self.emi.push({
				val: val || this.value,
				style: style,
				r: r,
				target: self
			});
			return this;
		},
		done: function() {
			emiExec(this.emi);
		}
	};
	drawARC.fn.init.prototype = drawARC.fn;
	drawARC.drawARC = function(ctx, x, y, width, start, end, style, callback) {
		if (ctx) {
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.arc(x, y, width, start, end);
			ctx.fillStyle = style;
			ctx.closePath();
			ctx.fill();
			callback && callback();
		}
		return this;
	};
	drawARC.drawString = function(ctx, text, x, y, dir, style) {
		if (ctx) {
			ctx.save();
			ctx.fillStyle = style || module.color.black;
			ctx.textAlign = dir || "right";
			ctx.fillText(text, x, y);
			ctx.restore();
		}
		return this;
	};

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
				canvas.sRage = -Math.PI * 0.5;
				canvas.start = 0;
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
				self.drawDashLine(style, width, data(canvas, function(canvas) {
					self.canvas = canvas;
				}));
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
				self.drawLine(style, width, data(canvas, function(rcanvas) {
					self.canvas = rcanvas;
				}));
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
		drawArcLoad: function(x, y, val, style, width) {
			drawARC(this.canvas, {
				x: x,
				y: y,
				r: [0, 20]
			}).draw(val, draw.color[style] || style, width).done();
			return this;
		},
		drawARC: function(x, y, r, style) {
			drawARC.drawARC(this.canvas.ctx, x, y, r, 0, Math.PI * 2, style);
			return this;
		},
		drawCurve: function(style, width, data) {
			var self = this;
			data = data || self.canvas.baseData;
			var canvas = self.canvas,
				ctx = canvas.ctx,
				i, len = data.length;
			ctx.strokeStyle = draw.color[style] || style;
			ctx.lineWidth = width;
			ctx.save();
			if (typeof data == "function") {
				self.drawCurve(style, width, data(canvas, function(canvas) {
					self.canvas = canvas;
				}));
			} else if (data[0]) {
				ctx.beginPath();
				for (i = 0; i < len; i++) {
					if (i === 0) {
						ctx.moveTo(data[i].from[0], data[i].from[1]);
					} else {
						ctx.lineTo(data[i].to[0], data[i].to[1]);
					}
				}
				ctx.stroke();
			}
			ctx.closePath();
			ctx.restore();
			return this;
		},
		drawViewLine: function(style, width) {
			var canvas = this.canvas;
			this.drawLine(style, width, [{
				from: [0, 0],
				to: [canvas.width, 0]
			}, {
				from: [canvas.width, 0],
				to: [canvas.width, canvas.height]
			}, {
				from: [canvas.width, canvas.height],
				to: [0, canvas.height]
			}, {
				from: [0, canvas.height],
				to: [0, 0]
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