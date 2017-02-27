((win, tmpl, translateContent, jsonp) => {
	var doc = win.document;
	class Callbacks {
		constructor() {
			let args = arguments && [].slice.call(arguments) || [],
				len = args.length,
				then = this;
			then.emit = [];
			len > 0 && args.forEach((a) => {
				then.emit.push(a)
			});
		}
		add(callback) {
			var then = this;
			then.emit.push((done) => {
				setTimeout(() => {
					callback && callback.call(then, done);
				}, 100)
			});
			return then;
		}
		delay(time, callback) {
			var then = this;
			then.emit.push((done) => {
				setTimeout(() => {
					callback && callback.call(then, done) || done();
				}, time || 1000);
			});
			return then;
		}
		done(callback) {
			var then = this;
			if (!Object.is(then.emit.length, 0)) {
				var i = 0,
					f = then.emit[i];
				f(() => {
					then.emit.splice(i, 1)
					then.done();
				});
			} else {
				callback && callback.call(then);
			}
			return then;
		}
	}

	/*let callbacks = new Callbacks((done) => {
		done()
	}, (done) => {
		done()
	});
	callbacks.add((done) => {
		done()
	}).delay(1000).add((done) => {
		done()
	}).done();*/

	const module = {
		dir(elem, dir) {
			var matched = [];

			while ((elem = elem[dir]) && elem.nodeType !== 9) {
				if (elem.nodeType === 1) {
					matched.push(elem);
				}
			}
			return matched;
		},
		extend(a, b) {
			return Object.assign(a, b)
		},
		toStyle(val) {
			let style = [];
			for (name in val) style.push(name + ":'" + val[name] + "'");
			var a = [];
			style.forEach((e) => {
				e = e.split(':');
				a.push(e[0].replace(/\"/gi, "").replace(/\'/gi, "").replace(/[a-zA-Z]/gim, ((a) => {
					return /[A-Z]/.test(a) ? "-" + a.toLowerCase() : a;
				})) + ":" + e[1].replace(/\"/gi, "").replace(/\'/gi, ""));
			});
			//console.log(val, a.join(';'))
			return a.join(';')
		},
		has(target, obj) {
			var hasIn = false;
			switch (typeof target) {
				case "string":
					return new RegExp(obj, "gim").test(target)
					break;
				case "array":
					var i = 0;
					target.forEach((t) => {
						i += 1;
						if (t === obj) hasIn = i;
					})
					return hasIn;
					break;
				case "object":
					for (name in target) {
						if (typeof obj == "object" && target[name] == obj[name] || typeof obj == "string" && name == obj) hasIn = name;
					}
					return hasIn;
					break;
			}
			return hasIn;
		},
		set(oldElement, options) {
			var i = 0,
				childrens = [];
			if (!module.is(module.has(options, "text"), false)) {
				oldElement._childrens.forEach((e) => {
					i += 1;
					!Object.is(e.nodeType, 3) && childrens.push(e);
				})
			} else {
				childrens = oldElement._childrens;
			}

			var element = pReact.createDom.apply(pReact, [oldElement.tagName,
				module.extend(oldElement._props, options)
			].concat(childrens || []));
			element = tmpl(element, oldElement._data, oldElement._factory);
			module.setElementClass(element, oldElement._factory);
			module.setElementData(element, oldElement._data);

			var parent = oldElement.parentNode;
			parent.replaceChild(element, oldElement);
		},
		fineNode(element, selector) {
			var node = element.querySelectorAll(selector);
			return [].slice.call(node);
		},
		bind(handle, element) {
			for (name in handle) !/element/.test(name) && (element["on" + name] = (e) => {
				if (module.is(typeof handle[e.type], "string")) {
					var fnName = handle[e.type].replace(/\s+/gim, "").replace("{", "").replace("}", "");
					element._factory[fnName].call(element, e);
				} else {
					handle[e.type].call(element, e);
				}
			});
		},
		parents(elem, id) {
			var parent = null;
			parent = module.dir(elem, "parentNode");
			if (id) {
				parent.forEach((item) => {
					if (/^#/.test(id) && item.id && item.id == id.replace("#", "")) {
						parent = [item];
					} else if (/^\./.test(id) && (new RegExp(id.replace(".", ""))).test(item.className)) {
						parent = [item];
					} else if (item.tagName.toLowerCase() == id.toLowerCase()) {
						parent = [item];
					}
				});
			} else {
				return parent;
			}
			return parent && id && parent.length === 1 && parent[0] || parent;
		},
		state: {
			elements: []
		},
		is(a, b) {
			return Object.is(a, b);
		},
		diffElement(element) {
			var classN = null,
				i = -1,
				index = -1;
			this.state.elements.forEach((e) => {
				i += 1;
				module.is(e, element) && module.is(e.tagName, element.tagName) && (classN = e, index = i);
			});
			return {
				index: index,
				class: classN
			};
		},
		evalContent(content) {
			new Function(content)();
		},
		setFontSize(num) {
			var num = num || 16,
				iWidth = document.documentElement.clientWidth,
				iHeight = document.documentElement.clientHeight,
				fontSize = window.orientation && (window.orientation == 90 || window.orientation == -90) || iHeight < iWidth ? iHeight / num : iWidth / num;
			window.baseFontSize = fontSize;
			document.getElementsByTagName('html')[0].style.fontSize = fontSize.toFixed(2) + 'px';
			return fontSize;
		},
		setElementClass(element, obj) {
			!element["_factory"] && (module.is(typeof obj, "string") && module.Class[obj] && (element["_factory"] = module.Class[obj])) || (element["_factory"] = obj);
			element.childNodes && element.childNodes.length > 0 && [].slice.call(element.childNodes).forEach((e) => {
				module.setElementClass(e, obj);
			});
		},
		setElementData(element, data) {
			!element["_data"] && (element["_data"] = data)
			element.childNodes && element.childNodes.length > 0 && [].slice.call(element.childNodes).forEach((e) => {
				module.setElementData(e, data);
			});
		},
		Class: {},
		Styles: {},
		translateFragment(temp, frags, obj, data) {
			[].slice.call(temp.childNodes).forEach((e) => {
				let attrs = {};
				e.attributes && [].slice.call(e.attributes).forEach((e) => {
					attrs[e.name] = e.value;
				})
				let dom = pReact.createDom(module.is(e.nodeType, 3) ? "textNode" : e.tagName, module.extend(attrs, module.is(e.nodeType, 3) ? {
					text: e.nodeValue
				} : {}));
				var classN = module.diffElement(dom);
				if (classN.index > -1) {
					module.setElementClass(module.state.elements[classN.index], obj);
					module.setElementData(module.state.elements[classN.index], data);
				}
				e.childNodes.length > 0 && (dom = module.translateFragment(e, dom, obj, data));
				frags.appendChild(dom);
			});
			return frags;
		},
		isPlainObject(obj) {
			return "Object" == null != obj && null != obj.constructor ? Object.prototype.toString.call(obj).slice(8, -1) : ""
		},
		isEmptyObject(obj) {
			var name;
			for (name in obj) {
				return false;
			}
			return true;
		},
		eventData: []
	}
	win.pReact = {};
	pReact.Class = module.Class;
	pReact.Styles = module.Styles;
	pReact.jsonp = jsonp;
	pReact.extend = module.extend;
	pReact.Callbacks = function() {
		let args = arguments && [].slice.call(arguments) || [],
			len = args.length,
			callback = new Callbacks();
		if (len > 0) args.forEach((a) => {
			callback.add(a);
		});
		return callback;
	};

	module.extend(win.pReact, {
			extend(a, b) {
				a = module.extend(a, b);
				return a;
			},
			createClass(name, classObject) {
				module.Class[name] = module.extend(classObject, {
					_className: name
				});
				return classObject;
			},
			createStyle(style) {
				module.extend(module.Styles, (() => {
					for (name in style) {
						style[name] = module.toStyle(style[name]);
					}
					return style;
				})());
				return style;
			},
			renderDom(name, data, parent, callback) {
				if (!Object.is(parent, null)) {
					let obj = (module.is(typeof name, "string") ? module.Class[name] : name),
						element,
						toElements = (element) => {
							if (module.is(typeof element, "string")) {
								var fragment = document.createDocumentFragment(),
									temp = document.createElement("div");
								element = tmpl(element, data, obj);
								temp.innerHTML = element;
								fragment = module.translateFragment(temp, fragment, obj, data);
								//parent.innerHTML = "";
								parent.appendChild(fragment);
							} else {
								element = tmpl(element, data, obj);
								//parent.innerHTML = "";
								parent.appendChild(element);
							}
						},
						done = (result) => {
							obj._data = result;
							obj.render && (element = obj.render());
							if (element) {
								//console.log(element, parent)
								if (module.is(typeof element, "object") && "length" in element || module.is(typeof element, "array")) {
									element.forEach((e) => {
										toElements(e);
									})
								} else {
									toElements(element);
								}
								parent.className = parent.className.replace(/\s*preactroot/gim, "");
								parent.className += " preactroot";
							}
							callback && callback();
						};

					if (module.isEmptyObject(data) || module.is(data, undefined)) {
						("getInitData" in obj) && (new Promise((resolve, reject) => {
							obj.getInitData(resolve, reject)
						}).then((result) => {
							done(result);
						}, () => {
							done({});
						})) || done({});
					} else {
						done(data);
					}
				}
				return parent;
			},
			toMobile(num) {
				var head = doc.getElementsByTagName("head")[0],
					style = doc.createElement("style");
				head.appendChild(style);
				style.innerHTML = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,object,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video{display:block}";
				var e = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,object,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video".split(',');
				var i = e.length;
				while (i--) {
					doc.createElement(e[i])
				}
				var meta = doc.createElement("meta");
				meta.name = "viewport";
				meta.content = "width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0";
				head.appendChild(meta);
				module.setFontSize(num);
				window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", (() => {
					module.setFontSize(num);
				}), false);
				return this;
			},
			getBaseFontSize(num) {
				return window.baseFontSize || module.setFontSize(num);
			},
			ready(callback) {
				this.toMobile();
				var script = doc.getElementsByTagName("script");
				(module.extend([], [].slice.call(script))).forEach((e) => {
					if (module.is(e.type, "text/pReact")) {
						module.evalContent(translateContent(e.innerHTML));
						e.parentNode.removeChild(e);
					}
				});
				callback && callback();
				return this;
			},
			tmpl(html, data) {
				return tmpl(html, data);
			},
			createDom() {
				let args = arguments,
					len = args.length,
					tagName, attrs, arr = module.extend([], args);
				if (len < 2) return;
				tagName = args[0];
				attrs = args[1];
				var childrens = [],
					i = 0;
				arr.forEach((r) => {
					i += 1;
					if (i > 2) childrens.push(r);
				});
				let element = module.is(tagName, "textNode") ? doc.createTextNode("") : module.is(tagName, "docmentfragment") ? doc.createDocumentFragment() : doc.createElement(tagName);
				if (!module.is(tagName, "docmentfragment")) {
					element._props = {};
					module.extend(element._props, module.extend(attrs, {
						tagName: tagName
					}));
					module.extend(element, {
						_set(options) {
							var then = this;
							module.set(then, options);
						},
						_findNode(selector) {
							var then = this;
							return module.fineNode(then, selector);
						},
						_empty() {
							[].slice.call(this.childNodes).forEach((e) => {
								e._remove();
							})
							return this;
						},
						_parents(selector) {
							var then = this;
							return module.parents(then, selector);
						},
						_attr(name, value) {
							var then = this;
							return !module.is(typeof name, "string") && [].slice.call(name).forEach((e) => {
								element.setAttribute(e.name, e.value);
							}) || !module.is(typeof value, "undefined") && then.setAttribute(name, value) || then.getAttribute(name);
						},
						_removeAttr(name) {
							name.split(' ').forEach((n) => {
								this.removeAttribute(n);
							});
							return this;
						},
						_on(eventName, fn) {
							var then = this;
							eventName = eventName.toLowerCase().split(' ');
							eventName.forEach((ev) => {
								then[/^on/.test(ev) ? ev : "on" + ev] = ((e) => {
									fn.call(this, e)
								});
								module.eventData.push({
									element: then,
									eventName: ev,
									factory: fn
								});
							});
							return this;
						},
						_off(eventName) {
							var then = this,
								i = 0;
							eventName = eventName.toLowerCase().split(' ');
							eventName.forEach((ev) => {
								then[/^on/.test(eventName) ? eventName : "on" + eventName] = null;
								module.eventData.forEach((a) => {
									i += 1;
									if (module.is(a.element, then) && module.is(a.eventName, eventName)) module.eventData.splice(i, 1)
								})
							});
							return this;
						},
						_remove(element) {
							element && element.nodeType && this.removeChild(element) || this.parentNode && this.parentNode.removeChild(this);
							return this;
						},
						_append(element) {
							if (module.is(typeof element, "string")) {
								this.appendChild(new Function("return " + translateContent("(" + tmpl(element) + ")"))());
							} else {
								this.appendChild(element);
							}
							return this;
						},
						_css(name, value) {
							var args = arguments,
								len = args.length;
							if (len === 0) {
								return this;
							} else if (len === 1) {
								if ("style" in this) {
									if (module.is(typeof name, "string")) {
										var f = [],
											then = this;
										name.split(' ').forEach((n) => {
											f.push(then.style[n]);
										});
										return f.length > 1 ? f : f.join('');
									} else if (module.isPlainObject(name)) {
										for (n in name) {
											this.style[n] = name[n]
										}
										return this;
									}
								} else {
									return this;
								}
							} else {
								this.style[name] = value;
								return this;
							}
						},
						_offset() {
							return {
								top: this.offsetTop,
								left: this.offsetLeft
							}
						},
						_previous() {
							return this.previousElementSibling;
						},
						_next() {
							return this.nextElementSibling;
						},
						_has(a, b) {
							return module.has(a, b);
						}
					})
					module.state.elements.push(element);
					var f = (v) => {
						var val = [];
						if (/\{+\s*([^<>}{,]+)\s*\}+/.test(v) && /\./.test(v)) {
							v.replace(/\{+\s*([^<>}{,]+)\s*\}+/gim, function(a, b) {
								if (b) {
									var style = pReact.getStyle(b.split('.')[1]);
									style && val.push(pReact.getStyle(b.split('.')[1]));
									if (val.length === 0) module.Class[b.split('.')[0]] && val.push(module.Class[b.split('.')[0]][b.split('.')[1]]);
								}
							});
						}
						if (val.length === 0) val.push(v);
						return val;
					};
					for (name in attrs) {
						var n = attrs[name],
							v = f(n);
						//console.log(v, name)
						switch (name) {
							case "text":
								v.forEach((sv) => {
									if (module.is(typeof sv, "string") && module.is(element.nodeType, 3)) {
										element.textContent = sv;
									} else if (module.is(typeof sv, "function")) {
										sv = sv();
										if (module.is(typeof sv, "string")) {
											element.textContent = sv;
										} else if (!module.is(sv.nodeType, undefined)) {
											element = sv;
											var r = /\{+\s*([^<>}{,]+)\s*\}+/.exec(n);
											if (r) {
												module.setElementClass(element, r[1].split('.')[0])
											}
										}
									} else {
										var textnode = doc.createTextNode(sv);
										element.appendChild(textnode);
									}
								})
								break;
							case "src":
							case "poster":
								element.setAttribute((/\{+\s*([^<>}{,]+)\s*\}+/.test(v) ? "data-" + name : name), v.join(''));
								break;
							case "html":
								n = module.is(typeof n, "function") ? n() : n;
								element.innerHTML = n.nodeType ? n.innerHTML : n;
								break;
							case "class":
								element.className += " " + v.join(' ');
								break;
							case "handle":
								module.bind(v.join(' '), element);
								break;
							default:
								if (name == "style") {
									element[name].cssText = ""
								}
								v.forEach((sv) => {
									if (/^on/.test(name) || /href/.test(name) && /\{{,1}\s*[^<>}{,]+\s*\}{,1}/.test(sv)) {
										!element._props.handle && (element._props.handle = {});
										let a = {};
										var fn = sv;
										if (/href/.test(name) && /\{\s*[^{}]+\s*\}/.test(sv)) {
											element.setAttribute(name, "javascript:;");
											name = "onclick";
										}
										a[name.replace("on", "")] = fn;
										module.extend(element._props.handle, a);
										module.bind(a, element);
									} else {
										if (name == "style") {
											element[name] && (element[name].cssText += sv);
										} else {
											!/element|tagName/.test(name) && element.setAttribute(name, sv)
										}
									}
								})
								break;
						}
					}
					element._childrens = childrens
				}
				childrens.forEach((e) => {
					if (module.is(typeof e, "function")) {
						var items = e();
						element.appendChild(items);
					} else {
						element.appendChild(e);
					}
				});
				return element;
			},
			getStyle(name) {
				return !Object.is(module.Styles[name], undefined) && module.Styles[name];
			}
		})
		//console.log(module.state)
})(this, (element, data, obj) => {
	var f = (element) => {

			element && ("length" in element ? Object.is(element.nodeType, 11) ? [].slice.call(element.childNodes) : [].slice.call(element) : [element]).forEach((e) => {
				!e["_factory"] && (e["_factory"] = obj);
				!e["_data"] && (e["_data"] = data);
				var attrs = e.attributes && e.attributes.length > 0 && [].slice.call(e.attributes) || false;
				//console.log(attrs)
				if (attrs) {
					attrs.forEach((a) => {
						for (name in data) {
							new RegExp("{{\\s*" + name.toLowerCase() + "\\s*}}").test(a.value.toLowerCase()) && e.setAttribute(a.name, data[name]);
						}
						//console.log(a.name);
						if (/data\-src/.test(a.name.toLowerCase()) || /data\-poster/.test(a.name.toLowerCase()))
							(e.setAttribute(a.name.toLowerCase().replace("data-", ""), /\{+\s*([^<>}{,]+)\s*\}+/.test(a.value) ? (a.value = a.value.replace(/\{+\s*([^<>}{,]+)\s*\}+/gim, ((a, b) => {
								return g(a, b, e);
							}))) : a.value), e._removeAttr("data-src data-poster"));
						else
							e.setAttribute(a.name, /\{+\s*([^<>}{,]+)\s*\}+/.test(a.value) ? (a.value = a.value.replace(/\{+\s*([^<>}{,]+)\s*\}+/gim, ((a, b) => {
								return g(a, b, e);
							}))) : a.value);
					})
				}
				["text", "nodeValue"].forEach((text) => {
					e[text] && (e[text] = e[text].replace(/\{+\s*[^<>}{,]+\s*\}+/gim, ((a) => {
						for (name in data) {
							a = a.replace(new RegExp("{{\\s*" + name + "\\s*}}", "gim"), ((a) => {
								return data[name];
							}))
						}
						a = a.replace(/\{+\s*([^<>}{,]+)\s*\}+/gim, ((a, b) => {
							return g(a, b, e);
						}));
						return a;
					})))
				});
				e.childNodes.length > 0 && f(e.childNodes);
			})

		},
		g = (a, b, e) => {
			let v = data && !Object.is(typeof data[b], "undefined") && !Object.is(typeof data[b], "function") && data[b] || false;
			if (Object.is(v, false)) {
				if (Object.is(v, false) && !Object.is(pReact.getStyle(b.split('.')[1]), false)) v = pReact.getStyle(b.split('.')[1]);
				if (Object.is(v, false) && Object.is(typeof obj[b], "string")) v = obj[b];
				if (Object.is(v, false) && Object.is(typeof obj[b], "function")) v = obj[b]();
				if (Object.is(v, false)) v = a;
			}
			return v;
		};
	if (Object.is(typeof element, "string")) {
		element = element.replace(/\{+\s*[^<>}{,]+\s*\}+/gim, ((a) => {
			for (name in data) {
				a = a.replace(new RegExp("{{\\s*" + name + "\\s*}}", "gim"), ((a) => {
					return data[name];
				}))
			}
			a = a.replace(/\{+\s*([^<>}{,]+)\s*\}+/gim, ((a, b) => {
				return "\"" + g(a, b) + "\"";
			}));
			return a;
		}))
	} else {
		f(element);
	}
	return element;
}, (content) => {
	content = content.replace(/\s{2,}/gim, " ").replace(/((\()\s*<(\w+)(\s+([a-zA-Z-_0-9]+=["'{][^<>]+["'}]))*\s*>[\r\n]*[^\)]+[\r\n]*<\/\w+>\s*(\)))/gim, ((a, b, c, d, e, f, g) => {
		b = b.replace(c, "").replace(new RegExp("\\" + g + "$"), "").replace(/>\s+</gim, "><");
		/*.replace(/<code\s*([a-zA-Z-_0-9]+=["'{][^<>]+["'}])*\s*>(.+)<\/code>/gim, ((a,b,c) => {
			if (c){

				let d = c.replace(/[<>"':;]/gim, ((a) => {
					console.log(a)
				}));
				//a = a.replace(c, d);
			}
			return a;
		}));*/
		var dom = document.createElement("div");
		dom.innerHTML = b;
		var f = (dom) => {
			var p = [];
			dom.childNodes.forEach((e) => {
				var attrs = e.attributes && e.attributes.length > 0 && [].slice.call(e.attributes) || false,
					html = ["pReact.createDom('" + (Object.is(e.nodeType, 3) ? "textNode" : e.tagName) + "'"];
				if (attrs) {
					html.push(",{")
					var attrsJson = []
					attrs.forEach((n) => {
						attrsJson.push("'" + n.name + "':'" + n.value + "'")
					})
					html.push(attrsJson.join(','));
					html.push("}")
				} else {
					Object.is(e.nodeType, 3) && html.push(",{text:\"" + e.nodeValue + "\"}") || html.push(",{}");
				}
				p.push(html.join(''))
				if (e.childNodes.length > 0) {
					let a = f(e);
					!Object.is(a.replace(/\s+/gim, ""), "") && p.push("," + a);
				}
				p.push(")")
			});
			return p.join('');
		};
		var w = "pReact.createDom(\"docmentfragment\",{}," + f(dom).replace(/\)pReact/gim, "),pReact") + ")";
		return w;
	})).replace(/renderDom\s*\(\s*(<(\w+)(\s+([a-zA-Z-_0-9]+=["'{][^<>]+["'}]))*\s*\/>)/gim, ((a, b, c, d) => {
		var temp = document.createElement("div"),
			attrs;
		temp.innerHTML = a;
		temp.children[0] && (attrs = temp.children[0].attributes);
		if (attrs) {
			var f = [];
			[].slice.call(attrs).forEach((t) => {
				f.push(t.name.toLowerCase() + ":\"" + t.value.toLowerCase() + "\"")
			});
			a = a.replace(b, c + ",{" + f.join(',') + "}");
		} else {
			a = a.replace(b, c + ",{}")
		}
		return a;
	}));
	return content;
}, (url, data, ops) => {
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
});