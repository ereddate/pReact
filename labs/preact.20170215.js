'use strict';
((win) => {
	var doc = win.document,
		head = doc.getElementsByTagName("head")[0];
	win.pReact = {};

	class Callbacks {
		constructor() {
			let args = arguments && [...arguments] || [],
				len = args.length,
				then = this;
			then.emit = [];
			len > 0 && args.forEach((a) => {
				then.add(a);
			});
		}
		add(callback) {
			let then = this;
			then.emit.push((done) => {
				setTimeout(() => {
					new Promise((resolve, reject) => {
						try {
							callback && callback.call(then, resolve);
						} catch (e) {
							console.log(e);
							reject();
						}
					}).then(done, done);
				}, 25)
			});
			return then;
		}
		delay(time, callback) {
			let then = this;
			then.emit.push((done) => {
				setTimeout(() => {
					new Promise((resolve, reject) => {
						try {
							callback && callback.call(then, resolve);
						} catch (e) {
							console.log(e);
							reject();
						}
					}).then(done, done);
				}, time || 1000);
			});
			return then;
		}
		done(callback) {
			let then = this,
				a = then.emit[Symbol.iterator](),
				b = a.next();
			if (!b.done) {
				then.emit.splice(0, 1);
				b.value(() => {
					then.done(callback)
				})
			} else {
				callback && callback.call(then);
			}
			return then;
		}
	}

	Array.prototype._eq = function(index) {
		return this[index];
	};
	let auxDiv = document.createElement('div'),
		transitionKey = auxDiv.style.webkitTransition !== undefined ? 'webkitTransition' : (
			auxDiv.style.mozTransition !== undefined ? 'mozTransition' : (
				auxDiv.style.msTransition !== undefined ? 'msTransition' : undefined
			)
		);

	const module = {
		translateContent(content) {
			content = content.replace(/\s{2,}/gim, " ").replace(/((\()\s*<(\w+)(\s+([a-zA-Z-_0-9]+=["'{][^<>]+["'}]))*\s*>[\r\n]*[^\)]+[\r\n]*<\/\w+>\s*(\)))/gim, ((a, b, c, d, e, f, g) => {
				b = b.replace(c, "").replace(new RegExp("\\" + g + "$"), "").replace(/>\s+</gim, "><");
				var dom = document.createElement("div");
				dom.innerHTML = b;
				var f = (dom) => {
					var p = [];
					[...dom.childNodes].forEach((e) => {
						var attrs = e.attributes && e.attributes.length > 0 && [...e.attributes] || false,
							html = ["pReact.createDom('" + (Object.is(e.nodeType, 3) ? "textNode" : e.tagName) + "'"];
						if (attrs) {
							html.push(",{")
							var attrsJson = []
							attrs.forEach((n) => {
								/\{+\s*([^<>}{,]+)\s*\}+/.test(a.value) && (n.value = n.value.replace(/\{+\s*([^<>}{,]+)\s*\}+/gim, ((a, b) => {
									return !Object.is(pReact.getStyle(b.split('.')[1]), false) ? pReact.getStyle(b.split('.')[1]) : a;
								})));
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
				dom = null;
				return w;
			})).replace(/renderDom\s*\(\s*(<(\w+)(\s+([a-zA-Z-_0-9]+=["'{][^<>]+["'}]))*\s*\/>)/gim, ((a, b, c, d) => {
				var temp = document.createElement("div"),
					attrs;
				temp.innerHTML = a;
				temp.children[0] && (attrs = temp.children[0].attributes);
				if (attrs) {
					var f = [];
					[...attrs].forEach((t) => {
						f.push(t.name.toLowerCase() + ":\"" + t.value.toLowerCase() + "\"")
					});
					a = a.replace(b, c + ",{" + f.join(',') + "}");
				} else {
					a = a.replace(b, c + ",{}")
				}
				return a;
			}));
			return content;
		},
		tmpl(element, data, obj) {
			var f = (element) => {
					element && (Reflect.has(element, "length") ? Object.is(element.nodeType, 11) ? [...element.childNodes] : [...element] : [element]).forEach((e) => {
						//console.log(e)
						if (e.tagName && !Object.is(pReact.Class[e.tagName.toLowerCase()], undefined)) {
							//console.log(e)
							let parent = e.parentNode;
							var attrs = e.attributes && e.attributes.length > 0 && [...e.attributes] || false,
								options = {};
							if (attrs) {
								attrs.forEach((a) => {
									for (let name in data) {
										let reg = new RegExp("{{\\s*" + name.toLowerCase() + "\\s*(\\|\\s*([^<>,]+)\\s*)*}}", "gim"),
											v = reg.exec(a.value.toLowerCase());
										if (v) {
											if (v[2]) {
												v = v[2].split(':');
												pReact.tmplThesaurus[v[0].replace(/\s+/gim, "")] && (options[a.name] = pReact.tmplThesaurus[v[0].replace(/\s+/gim, "")](data[name], v[1]));
											} else {
												options[a.name] = a.value.replace(reg, data[name])
											}
										}
									}
									if (/data\-src/.test(a.name.toLowerCase()) || /data\-poster/.test(a.name.toLowerCase()))
										options[a.name.toLowerCase().replace("data-", "")] = /\{+\s*([^<>}{,]+)\s*\}+/.test(a.value) ? a.value.replace(/\{+\s*([^<>}{,]+)\s*\}+/gim, ((a, b) => {
											return g(a, b, e);
										})) : a.value;
									else if (/data-style/.test(a.name.toLowerCase()))
										options[a.name.toLowerCase().replace("data-", "")] = e.getAttribute(a.name.toLowerCase().replace("data-", "")) + a.value;
									else
										options[a.name] = /\{+\s*([^<>}{,]+)\s*\}+/.test(a.value) ? a.value = a.value.replace(/\{+\s*([^<>}{,]+)\s*\}+/gim, ((a, b) => {
											return g(a, b, e);
										})) : a.value;
								})
							}
							e.childNodes.length > 0 && f(e.childNodes);
							//console.log(pReact.Class[e.tagName.toLowerCase()].render.toString())
							e._remove();
							pReact.renderDom(
								pReact.Class[e.tagName.toLowerCase()],
								options,
								parent
							);
						} else {
							!e["_factory"] && (e["_factory"] = obj);
							!e["_data"] && (e["_data"] = data);
							var attrs = e.attributes && e.attributes.length > 0 && [...e.attributes] || false;
							if (attrs) {
								attrs.forEach((a) => {
									for (let name in data) {
										let reg = new RegExp("{{\\s*" + name.toLowerCase() + "\\s*(\\|\\s*([^<>,]+)\\s*)*}}", "gim"),
											v = reg.exec(a.value.toLowerCase());
										if (v) {
											if (v[2]) {
												v = v[2].split(':');
												pReact.tmplThesaurus[v[0].replace(/\s+/gim, "")] && e.setAttribute(a.name, pReact.tmplThesaurus[v[0].replace(/\s+/gim, "")](data[name], v[1]));
											} else {
												e.setAttribute(a.name, a.value.replace(reg, data[name]));
											}
										}
									}
									if (/data\-src/.test(a.name.toLowerCase()) || /data\-poster/.test(a.name.toLowerCase()))
										(e.setAttribute(a.name.toLowerCase().replace("data-", ""), /\{+\s*([^<>}{,]+)\s*\}+/.test(a.value) ? (a.value = a.value.replace(/\{+\s*([^<>}{,]+)\s*\}+/gim, ((a, b) => {
											return g(a, b, e);
										}))) : a.value), e._removeAttr("data-src data-poster"));
									else if (/data-style/.test(a.name.toLowerCase()))
										(e.setAttribute(a.name.toLowerCase().replace("data-", ""), e.getAttribute(a.name.toLowerCase().replace("data-", "")) + a.value), e._removeAttr("data-style"));
									else
										e.setAttribute(a.name, /\{+\s*([^<>}{,]+)\s*\}+/.test(a.value) ? (a.value = a.value.replace(/\{+\s*([^<>}{,]+)\s*\}+/gim, ((a, b) => {
											return g(a, b, e);
										}))) : a.value);
								})
							}
							["text", "nodeValue"].forEach((text) => {
								e[text] && e[text].replace && (e[text] = e[text].replace(/\{+\s*[^<>}{,]+\s*\}+/gim, ((a) => {
									for (let name in data) {
										a = a.replace(new RegExp("{{\\s*" + name + "\\s*(\\|\\s*([^<>,]+)\\s*)*}}", "gim"), ((a, b, c) => {
											if (c) {
												let v = c.split(':');
												return pReact.tmplThesaurus[v[0].replace(/\s+/gim, "")] && pReact.tmplThesaurus[v[0].replace(/\s+/gim, "")](data[name], v[1]) || data[name];
											}
											return data[name];
										}))
									}
									a = a.replace(/\{+\s*([^<>}{,]+)\s*\}+/gim, ((a, b) => {
										return g(a, b, e);
									}));
									return a;
								})))
							});
							//console.log(e && e.childNodes)
							e.childNodes.length > 0 && f(e.childNodes);
						}
					})
				},
				g = (a, b, e) => {
					let v = data && !Object.is(typeof data[b], "undefined") && !Object.is(typeof data[b], "function") && data[b] || false;
					if (Object.is(v, false)) {
						if (Object.is(v, false) && !Object.is(pReact.getStyle(b.split('.')[1]), false))(v = pReact.getStyle(b.split('.')[1]));
						if (Object.is(v, false) && obj && obj[b] && Object.is(typeof obj[b], "string")) v = obj[b];
						if (Object.is(v, false) && obj && obj[b] && Object.is(typeof obj[b], "function")) v = obj[b]();
						if (Object.is(v, false)) v = a;
					}
					return v;
				};
			if (Object.is(typeof element, "string")) {
				element = element.replace(/\{+\s*[^<>}{,]+\s*\}+/gim, ((a) => {
					for (let name in data) {
						a = a.replace(new RegExp("{{\\s*" + name + "\\s*(\\|\\s*([^<>,]+)\\s*)*}}", "gim"), ((a, b, c) => {
							if (c) {
								let v = c.split(':');
								return pReact.tmplThesaurus[v[0].replace(/\s+/gim, "")] && pReact.tmplThesaurus[v[0].replace(/\s+/gim, "")](data[name], v[1]) || data[name];
							}
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
		},
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
			for (let name in val) style.push(name + ":'" + val[name] + "'");
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
		animateFade(list, styles, time, timingFunction, callback, transitionKey) {
			let then = this;
			then.timeout && clearTimeout(then.timeout) && (then._timeout && clearTimeout(then._timeout) || true) && (list.style[transitionKey] = "");
			then.timeout = setTimeout(function() {
				let times = {
					slow: 600,
					normal: 400,
					fast: 200
				};
				if (typeof time === 'string') {
					time = times[time];
				}

				timingFunction = timingFunction || 'linear';
				for (let s in styles) {
					list.style[transitionKey] = s + ' ' + time + 'ms ' + timingFunction;
					list.style[s] = styles[s];
				}
				then._timeout = setTimeout(function() {
					list.style[transitionKey] = "";
					callback.call(list);
				}, time + 20);
			}, 20);

			return list;
		},
		animate(list, styles, time, callback, timingFunction) {
			if (module.is(list.style[transitionKey].replace(/\s+/gim, ""), "")) {
				list.style[transitionKey] = "";
			}
			/*list._on(transitionKey + "end " + transitionKey.replace("webkit", "") + "end", function(e) {
				this._off(transitionKey + "end " + transitionKey.replace("webkit", "") + "end");
				this.style[transitionKey] = "";
				callback.call(this);
			});*/
			module.animateFade(list, styles, time, timingFunction, callback, transitionKey);
		},
		toggle(element, callback) {
			element && (element.style.visibility = "hidden");
			callback && callback(element);
			element && (element.style.visibility = "visible");
		},
		mixElement(element) {
			let attrs = {
				_set(options) {
					var then = this;
					module.set(then, options);
					return this;
				},
				_findNode(selector) {
					var then = this,
						result = [];
					selector.split(' ').forEach((e) => {
						result = result.concat(module.fineNode(then, e));
					});
					result.forEach((e) => {
						if (!e.xTagName) {
							module.mixElement(e);
						}
					});
					return result;
				},
				_contents() {
					let elem = this;
					return elem.tagName && elem.tagName.toLowerCase() == "iframe" ? elem.contentDocument || elem.contentWindow.document : elem.childNodes && [...elem.childNodes] || [];
				},
				_empty() {
					module.toggle(this, (element) => {
						[...element.childNodes].forEach((e) => {
							e._remove();
						})
					});
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
				_children(selector) {
					if (selector) {
						return [...this.querySelectorAll(selector)]
					} else {
						return [...this.children];
					}
				},
				_removeAttr(name) {
					name.split(' ').forEach((n) => {
						this.removeAttribute(n);
					});
					return this;
				},
				_text(value) {
					let then = this,
						nodeType = then.nodeType;
					if (nodeType) {
						if ((nodeType === 1 || nodeType === 9 || nodeType === 11) && typeof then.textContent === "string") {
							if (value) {
								then.textContent = value;
								return this;
							} else {
								return then.textContent;
							}
						} else if (nodeType === 3 || nodeType === 4) {
							if (value) {
								then.nodeValue = value;
								return this;
							} else {
								return then.nodeValue;
							}
						} else {
							return value ? this : "";
						}
					} else {
						return value ? this : "";
					}
				},
				_html(value) {
					let then = this;
					if (typeof value != "boolean") {
						if (typeof value == "string") {
							then.innerHTML = value;
						} else if (value.nodeType) {
							then._append(value);
						} else if (typeof value == "function") {
							then._html(value());
						} else {
							return then;
						}
					} else if (value === true) {
						return then.outerHTML;
					} else {
						return then.innerHTML;
					}
				},
				_clone(bool) {
					let nE = this.cloneNode(!module.is(typeof bool, "undefined") ? bool : true);
					bool === true && module.cloneHandle(nE, this);
					return nE;
				},
				_on(eventName, fn) {
					module.on(this, eventName, fn);
					return this;
				},
				_off(eventName) {
					module.off(this, eventName);
					return this;
				},
				_trigger(eventName) {
					module.trigger(this, eventName);
					return this;
				},
				_one(eventName, fn) {
					module.on(this, eventName, fn, true);
					return this;
				},
				_remove(element) {
					module.clearHandle(element);
					element && element.nodeType && this.removeChild(element) || this.parentNode && this.parentNode.removeChild(this);
					return this;
				},
				_append(element) {
					if (module.is(typeof element, "string")) {
						element = new Function("return " + module.translateContent("(" + module.tmpl(element) + ")"))();
						this.appendChild(element);
						module.cloneHandle(element);
					} else if (module.is(typeof element, "function")) {
						element(this);
					} else {
						this.appendChild(element);
						module.cloneHandle(element);
					}
					return this;
				},
				_appendTo(element) {
					element.appendChild(this);
					module.cloneHandle(this);
					return this;
				},
				_prepend(element) {
					let previous = this.firstChild;
					previous && this.insertBefore(element, previous) || this.appendChild(element);
					module.cloneHandle(element);
					return this;
				},
				_prependTo(element) {
					element._prepend(this);
					return this;
				},
				_after(element) {
					let next = this[i].nextElementSibling || this[i].nextSibling;
					next && this.parentNode.insertBefore(element, next) || this.parentNode.appendChild(element);
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
								for (let n in name) {
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
				_addClass(name) {
					let then = this;
					name.split(' ').forEach((n) => {
						then._removeClass(n);
						then.className += " " + n;
					});
					return this;
				},
				_removeClass(name) {
					let then = this;
					name.split(' ').forEach((n) => {
						module.has(then.className, n) && (then.className = then.className.replace(new RegExp("\\s*" + n, "gim"), ""));
					});
					return this;
				},
				_prop(name, value) {
					if (typeof value != "undefined") {
						this[name] = typeof value == "function" ? value.call(this, name, this) : value;
						return this;
					} else {
						return this[name];
					}
				},
				_data(name, value) {
					if (/^data-/.test(name)) {
						return this._attr(name, value);
					}!this._elementData && (this._elementData = {});
					if (typeof value != "undefined") {
						this._elementData[name] = value;
						return this;
					} else {
						return this._elementData[name];
					}
				},
				_removeData(name) {
					if (/^data-/.test(name)) {
						return this._removeAttr(name);
					}
					this._elementData && this._elementData[name] && (delete this._elementData[name]);
					return this;
				},
				_toggleClass(name) {
					let then = this;
					name.split(' ').forEach((n) => {
						module.has(then.className, n) ? then._removeClass(n) : then._addClass(n);
					});
					return this;
				},
				_hasClass(name) {
					let then = this,
						bool = [];
					name.split(' ').forEach((n) => {
						bool.push(module.has(then.className, n));
					});
					return bool.length === 0 ? false : bool.length === 1 ? bool[0] : bool;
				},
				_width(value) {
					let getStyle = window.getComputedStyle(this, null);
					if (value) {
						return this.offsetWidth +
							parseFloat(getStyle.getPropertyValue('border-left-width')) +
							parseFloat(getStyle.getPropertyValue('margin-left')) +
							parseFloat(getStyle.getPropertyValue('margin-right')) +
							parseFloat(getStyle.getPropertyValue('padding-left')) +
							parseFloat(getStyle.getPropertyValue('padding-right')) +
							parseFloat(getStyle.getPropertyValue('border-right-width'))
					} else if (value != undefined) {
						this.style.width = value;
					} else {
						return this.offsetWidth -
							parseFloat(getStyle.getPropertyValue('border-left-width')) -
							parseFloat(getStyle.getPropertyValue('padding-left')) -
							parseFloat(getStyle.getPropertyValue('padding-right')) -
							parseFloat(getStyle.getPropertyValue('border-right-width'));
					}
					return this;
				},
				_animate(styles, time, callback, timingFunction) {
					module.animate(this, styles, time, callback, timingFunction);
					return this;
				},
				_show() {
					this._css({
						display: "block"
					});
					return this;
				},
				_hide() {
					this._css({
						display: "none"
					});
					return this;
				},
				_height(value) {
					let getStyle = window.getComputedStyle(this, null);
					if (value) {
						return this.offsetHeight;
					} else if (value != undefined) {
						this.style.height = value;
					} else {
						return this.offsetHeight -
							parseFloat(getStyle.getPropertyValue('border-top-width')) -
							parseFloat(getStyle.getPropertyValue('padding-top')) -
							parseFloat(getStyle.getPropertyValue('padding-bottom')) -
							parseFloat(getStyle.getPropertyValue('border-bottom-width'));
					}
					return this;
				},
				_tmpl(data) {
					return pReact.tmpl(this.innerHTML, data);
				},
				_offset() {
					return {
						top: this.offsetTop,
						left: this.offsetLeft
					}
				},
				_index() {
					return this.parentNode ? this._prevAll().length : -1;
				},
				_prevAll() {
					return module.dir(this, "previousElementSibling");
				},
				_nextAll() {
					return module.dir(this, "nextElementSibling");
				},
				_previous() {
					return this.previousElementSibling;
				},
				_next() {
					return this.nextElementSibling;
				},
				_has(a, b) {
					return module.has(a, b);
				},
				_scrollLeft(value) {
					if (val === undefined) {
						return this.window == this ? ("pageXOffset" in win) ? win["pageXOffset"] : this.document.documentElement["scrollTop"] : this["scrollLeft"];
					}
					this["scrollLeft"] = val;
					return this;
				},
				_scrollTop(value) {
					if (value === undefined) {
						return this.window == this ? ("pageYOffset" in win) ? win["pageYOffset"] : this.document.documentElement["scrollTop"] : this["scrollTop"];
					}
					this["scrollTop"] = value;
					return this;
				}
			};
			element.tagName && (element.xTagName = "x" + element.tagName.toLowerCase());
			module.extend(element, attrs);
			return element;
		},
		has(target, obj) {
			var hasIn = false;
			switch (typeof target) {
				case "string":
					let reg = new RegExp(obj, "gim");
					return reg.test(target)
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
					for (let name in target) {
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
			element = module.tmpl(element, oldElement._data, oldElement._factory);
			module.setElementClass(element, oldElement._factory);
			module.setElementData(element, oldElement._data);

			var parent = oldElement.parentNode;
			module.toggle(parent, () => {
				parent && parent.replaceChild(element, oldElement);
			});
		},
		fineNode(element, selector) {
			if (/^name=/.test(selector)) {
				let children = document.getElementsByName && document.getElementsByName(selector.toLowerCase().replace(/^name=/gim, ""));
				if (children) {
					return [...children];
				}
			} else if (/\[[^\[\]]+\]/.test(selector)) {
				let reg = /([^\[\]]+)\s*\[([^\[\]]+)\]/.exec(selector);
				if (reg) {
					let nodes = [];
					//console.log(exp);
					[...element.querySelectorAll(reg[1])].forEach((e) => {
						let exp = new RegExp(reg[2].split('=')[1].replace(/\:/gim, "\\s*\\:\\s*"), "gim"),
							is = exp.test(e.getAttribute(reg[2].split('=')[0]));
						if (is) {
							nodes.push(e);
						}
					});
					return nodes;
				}
			}
			var node = element.querySelectorAll(selector);
			return [...node];
		},
		bind(handle, element) {
			for (let name in handle) !/element/.test(name) && (module.on(element, name, ((e) => {
				if (module.is(typeof handle[e.type], "string")) {
					var fnName = handle[e.type].replace(/\s+/gim, "").replace("{", "").replace("}", "");
					element._factory[fnName].call(element, e);
				} else {
					handle[e.type].call(element, e);
				}
			})));
		},
		cloneHandle(oldElement, then) {
			let i = 0;
			module.eventData.forEach((a) => {
				i += 1;
				if (module.is(a.element, oldElement))(then || oldElement)[a.eventName] = ((e) => {
					a.factory.call(this, e)
				});
			});
			return this;
		},
		clearHandle(element) {
			let i = 0,
				handleObj = [];
			module.eventData.forEach((a) => {
				if (module.is(a.element, element)) handleObj.push({
					obj: a,
					index: i
				})
				i += 1;
			});
			handleObj.forEach((a) => {
				module.eventData.splice(a.index, 1)
			});
			return this;
		},
		calculateAngle(startPoint, endPoint) {
			var x = startPoint.x - endPoint.x;
			var y = endPoint.y - startPoint.y;
			var r = Math.atan2(y, x);
			var angle = Math.round(r * 180 / Math.PI);
			if (angle < 0) {
				angle = 360 - Math.abs(angle);
			}
			return angle;
		},
		touchDirection(startPoint, endPoint) {
			var angle = module.calculateAngle(startPoint, endPoint);
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
		},
		on(then, eventName, callback, bool) {
			eventName = eventName.toLowerCase().split(' ');
			eventName.forEach((ev) => {
				let fn = (e) => {
					bool && then._off(ev);
					callback && callback.call(then, e);
				};
				then.addEventListener(ev, fn, false);
				module.eventData.push({
					element: then,
					eventName: ev,
					factory: fn,
					bool: bool
				});
			});
			return this;
		},
		off(then, eventName) {
			var i = 0;
			if (module.is(typeof eventName, "undefined")) {
				module.eventData.forEach((a) => {
					i += 1;
					if (module.is(a.element, then)) module.eventData.splice(i, 1)
				});
				return this;
			}
			eventName = eventName.toLowerCase().split(' ');
			eventName.forEach((ev) => {
				module.eventData.forEach((a) => {
					i += 1;
					if (module.is(a.element, then) && module.is(a.eventName, ev)) {
						then.removeEventListener(ev, a.factory, false);
						module.eventData.splice(i, 1);
					}
				})
			});
			return this;
		},
		trigger(then, eventName) {
			eventName = eventName.toLowerCase().split(' ');
			eventName.forEach((ev) => {
				module.eventData.forEach((a) => {
					if (module.is(a.element, then) && module.is(a.eventName, ev)) {
						if (ev == "scroll") setTimeout(() => {
							window.scrollTo(1, 1)
						}, 1);
						let event = null;
						document.createEvent ? (event = document.createEvent("HTMLEvents"), event.initEvent(eventName, true, true)) : (event = document.createEventObject());
						a.factory.call(a.element, event);
					}
				})
			});
			return this;
		},
		parents(elem, id) {
			var parent = null;
			parent = module.dir(elem, "parentNode");
			if (id) {
				pReact.each(parent, (i, item) => {
					if (/^#/.test(id) && item.id && item.id == id.replace("#", "")) {
						parent = [item];
						return false;
					} else if (/^\./.test(id) && (new RegExp(id.replace(".", ""))).test(item.className)) {
						parent = [item];
						return false;
					} else if (item.tagName.toLowerCase() == id.toLowerCase()) {
						parent = [item];
						return false;
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
			element.childNodes && element.childNodes.length > 0 && [...element.childNodes].forEach((e) => {
				module.setElementClass(e, obj);
			});
		},
		setElementData(element, data) {
			!element["_data"] && (element["_data"] = data)
			element.childNodes && element.childNodes.length > 0 && [...element.childNodes].forEach((e) => {
				module.setElementData(e, data);
			});
		},
		Class: {},
		Styles: {},
		trim(str) {
			return str.replace(/(^\s*)|(\s*$)/g, "");
		},
		translateFragment(temp, frags, obj, data) {
			[...temp.childNodes].forEach((e) => {
				let attrs = {};
				e.attributes && [...e.attributes].forEach((e) => {
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
			for (let name in obj) {
				return false;
			}
			return true;
		},
		eventData: []
	};

	pReact.extend = module.extend;
	pReact.extend(pReact, {
		import (url) {
			let promise = new Promise((resolve, reject) => {
				let isCss = /\.css/.test(url),
					dom = doc.createElement(isCss ? "link" : "script");
				if (!isCss) {
					dom.src = url;
					dom.async = true;
					dom.charset = "utf-8"
				} else {
					dom.rel = "stylesheet";
					dom.href = url;
				}
				head.appendChild(dom);
				pReact.on(dom, "load", function(e) {
					if (!isCss) {
						head.removeChild(dom);
					}
					resolve("success");
				}).on(dom, "error", function(e) {
					reject("error");
				});
			});
			return promise;
		},
		trim: module.trim,
		isPlainObject: module.isPlainObject,
		isEmptyObject: module.isEmptyObject,
		Class: module.Class,
		Styles: module.Styles,
		touchDirection: module.touchDirection,
		mixElement: module.mixElement,
		Callbacks() {
			let args = arguments && [...arguments] || [],
				len = args.length,
				callback = new Callbacks();
			if (len > 0) args.forEach((a) => {
				callback.add(a);
			});
			return callback;
		},
		findNode(element, selector) {
			let elems = [];
			if (!selector) {
				elems = typeof element == "string" ? module.fineNode(document, element) : element.nodeType ? [element] : element.document ? [window] : [element];
			} else {
				select.splice(' ').forEach((e) => {
					elems = elems.concat(module.fineNode(element, e));
				});
			}
			elems.forEach((e) => {
				if (!e.xTagName) {
					module.mixElement(e);
				}
			});
			return elems;
		},
		tmplThesaurus: {},
		is(b, a) {
			if (typeof b == "string") switch (b) {
				case "number":
				case "string":
				case "object":
					return Object.is(typeof a, b);
					break;
				case "array":
					var len = typeof a != "string" && ("length" in a) && a.length,
						c = (typeof a).toLowerCase();
					return "array" === c || 0 === len || "number" == typeof len && len > 0 && len - 1 in a
					break;
			}
			return module.is(a, b);
		},
		on(element, eventName, fn) {
			module.on(element, eventName, fn);
			return this;
		},
		off(element, eventName) {
			module.off(element, eventName);
			return this;
		},
		extend(a, b) {
			a = module.extend(a, b);
			return a;
		},
		createClass(name, classObject) {
			Reflect.defineProperty(module.Class, name.toLowerCase(), {
				value: classObject
			});
			return Reflect.get(module.Class, name.toLowerCase());
		},
		createStyle(style) {
			module.extend(module.Styles, (() => {
				for (let name in style) {
					style[name] = module.toStyle(style[name]);
				}
				return style;
			})());
			return style;
		},
		renderDom(name, data, parent, callback) {
			if (!Object.is(parent, null)) {
				let obj = (module.is(typeof name, "string") ? Reflect.get(module.Class, name.toLowerCase()) : name),
					element,
					toElements = (element) => {
						if (module.is(typeof element, "string")) {
							var fragment = document.createDocumentFragment(),
								temp = document.createElement("div");
							element = module.tmpl(element, data, obj);
							temp.innerHTML = element;
							fragment = module.translateFragment(temp, fragment, obj, data);
							//parent.innerHTML = "";
							parent.appendChild(fragment);
						} else {
							element = module.tmpl(element, data, obj);
							//parent.innerHTML = "";
							parent.appendChild(element);
						}
					},
					done = (result) => {
						obj._data = result;
						obj.render && (element = pReact.tmpl(obj.render(), obj._data));
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

				module.is(obj._data, undefined) && (obj._data = {});
				(!module.is(data, undefined) || module.isPlainObject(data)) && module.extend(obj._data, data);
				("getInitData" in obj) && (new Promise((resolve, reject) => {
					obj.getInitData(resolve, reject)
				}).then((result) => {
					("length" in result) && /object|array/.test(typeof result) ? module.extend(obj._data, {
						data: result
					}) : module.extend(obj._data, result);
					done(obj._data);
				}, (e) => {
					console.log(e);
					done({});
				})) || done(data);
			}
			return this;
		},
		toAmp() {
			let local = pReact.mixElement(document),
				styleContext = ['body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}', 'body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}'];
			local._findNode("html style script").forEach((e) => {
				e._attr(e.tagName.toLowerCase() == "html" ? "amp" : e.tagName.toLowerCase() == "style" ? "amp-custom" : "async", "")
			});
			pReact.findNode("head")[0]._append(pReact.createDom("docmentfragment", {}, pReact.createDom("script", {
				"src": "https://cdn.ampproject.org/v0.js",
				"async": ""
			}), pReact.createDom("link", {
				"href": location.href,
				"rel": "canonical"
			}), pReact.createDom("style", {
				"amp-boilerplate": "",
				html: styleContext[0]
			}), pReact.createDom("noscript", {}, pReact.createDom("style", {
				html: styleContext[1]
			}))));
			return this;
		},
		toMobile(num) {
			pReact.findNode("head")[0]._append(pReact.createDom("docmentfragment", {}, pReact.createDom("style", {
				html: "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,object,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video{display:block}"
			}), pReact.createDom("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0"
			}), pReact.createDom("meta", {
				"http-equiv": "X-UA-Compatible",
				"content": "IE=edge"
			})));
			var e = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,object,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video".split(',');
			var i = e.length;
			while (i--) {
				doc.createElement(e[i])
			}
			module.setFontSize(num);
			window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", (() => {
				module.setFontSize(num);
			}), false);
			return this;
		},
		getBaseFontSize(num) {
			return window.baseFontSize || module.setFontSize(num);
		},
		loading() {
			doc.body.setAttribute("hidden", "hidden");
			return this;
		},
		loaded() {
			doc.body.removeAttribute("hidden");
			return this;
		},
		each(a, b, c) {
			var d, e = 0,
				f = a.length,
				g = pReact.is("array", a);
			if (c) {
				if (g) {
					for (; f > e; e++)
						if (d = b.apply(a[e], c), d === !1) break
				} else
					for (let e in a)
						if (d = b.apply(a[e], c), d === !1) break
			} else if (g) {
				for (; f > e; e++)
					if (d = b.call(a[e], e, a[e]), d === !1) break
			} else
				for (let e in a)
					if (d = b.call(a[e], e, a[e]), d === !1) break;
			return a
		},
		renderPage() {
			let then = this;
			pReact.loading();
			var script = doc.getElementsByTagName("script");
			(module.extend([], [...script])).forEach((e) => {
				if (module.is(e.type, "text/pReact")) {
					module.evalContent(module.translateContent(e.innerHTML));
					e.parentNode.removeChild(e);
				}
			});
			pReact.loaded();
			return then;
		},
		ready(loading) {
			let then = this,
				completed = () => {
					doc.removeEventListener("DOMContentLoaded", completed);
					win.removeEventListener("load", completed);
					loading && loading();
					then.toMobile(16);
					then.renderPage();
				};
			doc.addEventListener("DOMContentLoaded", completed);
			win.addEventListener("load", completed);
			return then;
		},
		tmpl(html, data) {
			return module.tmpl(html, data);
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
				module.mixElement(element);
				module.state.elements.push(element);
				var f = (v) => {
					var val = [];
					if (/\{+\s*([^<>}{,]+)\s*\}+/.test(v) && /\./.test(v)) {
						v.replace(/\{+\s*([^<>}{,]+)\s*\}+/gim, function(a, b) {
							if (b) {
								var style = pReact.getStyle(b.split('.')[1]);
								style && val.push(style);
								if (val.length === 0) Reflect.has(module.Class, b.split('.')[0].toLowerCase()) && val.push(Reflect.get(Reflect.get(module.Class, b.split('.')[0].toLowerCase()), b.split('.')[1]));
							}
						});
					}
					if (val.length === 0) val.push(v);
					return val;
				};
				for (let name in attrs) {
					var n = attrs[name],
						v = f(n);
					//console.log(v, name)
					switch (name) {
						case "text":
							v.forEach((sv) => {
								if (module.is(typeof sv, "string") && module.is(element.nodeType, 3)) {
									element._text(sv);
								} else if (module.is(typeof sv, "function")) {
									sv = sv();
									if (module.is(typeof sv, "string")) {
										element._text(sv);
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
							element._attr((/\{+\s*([^<>}{,]+)\s*\}+/.test(v.join('')) ? "data-" + name : name), v.join(''));
							break;
						case "html":
							n = module.is(typeof n, "function") ? n() : n;
							element._html(n.nodeType ? n.innerHTML : n);
							break;
						case "class":
							element._addClass(v.join(' '));
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
										element._attr(name, "javascript:;");
										name = "onclick";
									}
									a[name.replace("on", "")] = fn;
									module.extend(element._props.handle, a);
									module.bind(a, element);
								} else {
									if (name == "style") {
										element[name] && (element[name].cssText += sv);
									} else {
										!/element|tagName/.test(name) && element._attr(name, sv)
									}
								}
							})
							break;
					}
				}
				element._childrens = childrens
			} else {
				module.mixElement(element);
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
	});

	pReact.ready();
})(this);

pReact && (((pReact) => {
	pReact.jsonp = (url, data, ops) => {
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
	}
})(pReact), ((pReact) => {
	let stringify = (obj) => {
			if (null == obj)
				return "null";
			if ("string" != typeof obj && obj.toJSON)
				return obj.toJSON();
			var type = typeof obj;
			switch (type) {
				case "string":
					return '"' + obj.replace(/[\"\r\n\t\\]+/gim, ((a) => {
						return "\\\\" + a
					})) + '"';
				case "number":
					var ret = obj.toString();
					return /N/.test(ret) ? "null" : ret;
				case "boolean":
					return obj.toString();
				case "date":
					return "new Date(" + obj.getTime() + ")";
				case "array":
					for (var ar = [], i = 0; i < obj.length; i++)
						ar[i] = stringify(obj[i]);
					return "[" + ar.join(",") + "]";
				case "object":
					if (pReact.isPlainObject(obj)) {
						ar = [];
						for (let i in obj)
							ar.push('"' + i.replace(/[\"\r\n\t\\]+/gim, ((a) => {
								return "\\\\" + a
							})) + '":' + stringify(obj[i]));
						return "{" + ar.join(",") + "}"
					}
			}
			return "null"
		},
		_tmplFilterVal = (val, filterCondition) => {
			if (typeof filterCondition == "function") {
				return filterCondition(val);
			} else if (typeof filterCondition == "object") {
				if (pReact.isPlainObject(filterCondition)) {
					for (let name in filterCondition) {
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
		},
		getLen = (str, type) => {
			var str = (str + "").replace(/\r|\n/ig, ""),
				temp1 = str.replace(/([^\x00-\xff]|[A-Z])/g, "**"),
				temp2 = temp1.substring(0),
				x_length = !type ? (temp2.split("\*").length - 1) / 2 + (temp1.replace(/\*/ig, "").length) : temp2.length;
			return x_length;
		},
		textFix = (name, num) => {
			var max = num ? num : 16;
			return getLen(name, true) >= max ? _getText(name, max) : name;
		},
		_getText = (text, max) => {
			var strs = [],
				n = 0,
				len = text.length,
				vtext = "";
			for (var i = 0; i < len; i++) {
				vtext = text.substr(i, 1).replace("¡°", " ").replace("¡±", " ");
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
		},
		_capitalize = (val) => {
			return val[0].toUpperCase() + val.substr(1);
		},
		_date = (d, pattern) => {
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
		},
		_currency = (val, symbol) => {
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
		};

	(pReact.tmplThesaurus || !pReact.tmplThesaurus && (pReact.tmplThesaurus = {})) && pReact.extend(pReact.tmplThesaurus, {
		filter(val, filterCondition) {
			return _tmplFilterVal(val, filterCondition);
		},
		json(val, filterCondition) {
			return stringify(val);
		},
		limitToCharacter(val, filterCondition) {
			if (pReact.is("string", val)) {
				return textFix(val, parseInt(filterCondition));
			}
			return val;
		},
		limitTo(val, filterCondition) {
			if (pReact.is("array", val)) {
				var a = [];
				val.forEach(function(n) {
					a.push(n);
				});
				return stringify(a.splice(0, parseInt(filterCondition)));
			} else if (pReact.is("string", val)) {
				return val.substr(0, parseInt(filterCondition)); //textFix(val, parseInt(filterCondition));
			} else if (pReact.is("number", val) && /\./.test(val + "")) {
				return val.toFixed(filterCondition);
			} else if (pReact.is("number", val)) {
				var len = (val + "").length;
				return parseInt((val + "").substr(len - parseInt(filterCondition), filterCondition));
			}
			return val;
		},
		indexOf(val, filterCondition) {
			var index = -1,
				i;
			if (pReact.is("array", val)) {
				for (i = 0; i < val.length; i++) {
					if (val[i] == filterCondition) {
						index = i;
						break;
					}
				}
			}
			if (pReact.is("string", val)) {
				index = val.indexOf(filterCondition);
			}
			return index;
		},
		lowercase(val, filterCondition) {
			return val.toLowerCase();
		},
		uppercase(val, filterCondition) {
			return val.toUpperCase();
		},
		toRem(val, filterCondition) {
			return (parseFloat(val) / parseFloat(filterCondition)).toFixed(4);
		},
		orderBy(val, filterCondition) {
			if (pReact.is("array", val) && /reverse|sort/.test(filterCondition.toLowerCase())) {
				return val[filterCondition.toLowerCase()]();
			}
			return val;
		},
		date(val, filterCondition) {
			return _date(val, filterCondition);
		},
		currency(val, filterCondition) {
			return _currency(val);
		},
		empty(val, filterCondition) {
			return (typeof val == "string" && $.trim(val) == "" || val == null || typeof val == "undefined" || pReact.is("object", val) && pReact.isEmptyObject(val) || pReact.is("array", val) && val.length == 0) && filterCondition || "";
		},
		passcard(val, filterCondition) {
			var num = filterCondition || 4,
				exp = new RegExp("(\\d{" + num + "})(\\d{" + num + "})(\\d{" + num + "})(\\d{" + num + "})(\\d{0,})"),
				regex = exp.exec(val);
			return regex && regex.splice(1, regex.length - 1).join(' ') || val;
		},
		encodeURI(val, filterCondition) {
			return encodeURIComponent(val);
		},
		decodeURI(val, filterCondition) {
			return decodeURIComponent(val);
		},
		toString(val, filterCondition) {
			return stringify(val);
		},
		cssPrefix(val, filterCondition) {
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
		rgbToHex(val, filterCondition) {
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
		hexToRgb(val, filterCondition) {
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
		capitalize(val, filterCondition) {
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
	});
})(pReact), ((pReact) => {
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
		settings.success && settings.success(status, data, xhr)
	}

	function ajaxError(error, type, xhr, settings) {
		var context = settings.context
		settings.error && settings.error(type, error, xhr)
	}

	function empty() {}

	let ajaxSettings = {
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
		for (let key in ajaxSettings)
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

		setHeader('X-Requested-With', 'XMLHttpRequest')
		setHeader('Accept', mime || '*/*')
		if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
			setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')
		if (settings.headers)
			for (name in settings.headers) setHeader(name, settings.headers[name])
		xhr.setRequestHeader = setHeader
		console.log(headers)
		var nativeSetHeader = xhr.setRequestHeader,
			abortTimeout;


		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				xhr.onreadystatechange = empty
				clearTimeout(abortTimeout)
				var result, error = false
				if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
					dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
					result = xhr.responseText

					try {
						if (dataType == 'json') result = blankRE.test(result) ? null : new Function("return " + result)();
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
			for (let name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

		var async = 'async' in settings ? settings.async : true
		xhr.open(settings.type, settings.url, async, settings.username, settings.password)

		for (let name in headers) {
			console.log(name, headers[name]);
			nativeSetHeader.apply(xhr, headers[name]);
		}

		console.log(xhr)

		if (settings.timeout > 0) abortTimeout = setTimeout(function() {
			xhr.onreadystatechange = empty
			xhr.abort()
			ajaxError(null, 'timeout', xhr, settings)
		}, settings.timeout)

		xhr.send(settings.data ? settings.data : null)
		return {
			error() {

			}
		}
	}

	$.each(["get", "post"], (i, name) => {
		$[name] = (url, data, success, error, type, options) => {
			if (typeof error == "string") {
				options = type;
				type = error;
				error = undefined;
			}
			ajax(!options ? {
				url: url,
				type: name,
				dataType: type,
				data: data,
				success: (type, data, xhr) => {
					success && success(type, data, xhr)
				},
				error: (type, msg, xhr) => {
					error && error(type, data, xhr)
				}
			} : $.extend({
				url: url,
				type: name,
				dataType: type,
				data: data,
				success: (data, xhr) => {
					success && success(type, data, xhr)
				},
				error: (type, msg, xhr) => {
					error && error(type, data, xhr)
				}
			}, options))
			return $;
		}
	});

	var escape = encodeURIComponent

	function serialize(params, obj, traditional, scope) {
		var type, array = $.is("array", obj),
			hash = $.isPlainObject(obj)
		$.each(obj, function(key, value) {
			type = typeof value;
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
		return params.join('&').replace(/%20/g, '')
	}
})(pReact), ((pReact) => {
	pReact.storage = (options) => {
		var type = options.type || 'localStorage';
		var storage = type == "localStorage" ? window.localStorage : document.cookie;
		return {
			set: function(key, value) {
				if (storage) {
					switch (type) {
						case "localStorage":
							storage.setItem(key, value);
							break;
						case "cookie":
							var exp = new Date();
							exp.setTime(exp.getTime() + Number(time) * 3600 * 1000);
							storage = key + "=" + escape(value) + ";expires=" + exp.toGMTString();
							break;
					}
				}
			},
			get: function(key) {
				if (storage) {
					switch (type) {
						case "localStorage":
							return storage.getItem(key) || null;
							break;
						case "cookie":
							var arr, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
							if (arr = storage.match(reg)) {
								return (arr[2]);
							} else {
								return null;
							}
							break;
					}
				}
			},
			delete: function(key) {
				if (storage) {
					switch (type) {
						case "localStorage":
							storage.removeItem(key);
							break;
						case "cookie":
							this.set(name, '', '-1');
							break;
					}
				}
			}
		};
	}
})(pReact));