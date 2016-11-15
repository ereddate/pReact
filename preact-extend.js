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
				return (typeof val == "string" && $.trim(val) == "" || val == null || typeof val == "undefined" || $.is("object", val) && map.isEmptyObject(val) || $.is("array", val) && val.length == 0) && filterCondition;
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

		}
	}
})), pReact.tmplLangExtend({
	ifend: function(html) {
		var a = html.split("{{ if ");
		if (a.length > 1) {
			pReact.each(a, function(i, str) {
				if (/{{\s+end\s+if\s+}}/.test(str)) {
					var a = ("{{ if " + str).split("{{ end if }}"),
						o = a[0] + "{{ end if }}",
						t = o;
					a = t.replace(/{{\s+[^}]+\s+}}/gi, function(a, b) {
						if (/{{\s+if\s+/.test(a)) {
							a = a.replace("{{ ", "var _ifend = _###__###_;").replace(" }}", "{ _ifend = _###_").replace(/\'/gi, "_###_").replace(/\"/gi, "_###_");
						} else if (/{{\s+else\s+if\s+/.test(a)) {
							a = a.replace("{{ ", "_###_;}").replace(" }}", "{ _ifend = _###_").replace(/\'/gi, "_###_").replace(/\"/gi, "_###_");
						} else if (/{{\s+else\s+}}/.test(a)) {
							a = "_###_;}else{ _ifend = _###_";
						} else if (/{{\s+end\s+if\s+}}/.test(a)) {
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
		var a = html.split("{{ switch ");
		if (a.length > 1) {
			pReact.each(a, function(i, str) {
				if (/{{\s+end\s+switch\s+}}/.test(str)) {
					var a = ("{{ switch " + str).split("{{ end switch }}"),
						o = a[0] + "{{ end switch }}",
						t = o;
					a = t.replace(/{{\s+[^}]+\s+}}/gi, function(a, b) {
						if (/{{\s+switch\s+/.test(a)) {
							a = a.replace("{{ ", "var switchstr= _###__###_;").replace(" }}", "{").replace(/\'/gi, "_###_").replace(/\"/gi, "_###_");
						} else if (/{{\s+end\s+switch\s+}}/.test(a)) {
							a = "}";
						} else if (/{{\s+case\s+/.test(a)) {
							a = a.replace("{{ ", "").replace(" }}", " : switchstr = _###_").replace(/\'/gi, "_###_").replace(/\"/gi, "_###_");
						} else if (/{{\s+end\s+case\s+}}/.test(a)) {
							a = a.replace(/{{\s+end\s+case\s+}}/, "_###_;break;");
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
	$.extend($, {
		ua: ua,
		device: device,
		toHTML5: function() {
			var head = document.getElementsByTagName("head")[0],
				style = document.createElement("style");
			head.appendChild(style);
			style.innerHTML = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,object,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video{display:block}";
			var e = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,object,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video".split(',');
			var i = e.length;
			while (i--) {
				document.createElement(e[i])
			}
			return this;
		},
		toMobile: function(num) {
			num = num || 16;

			function setFontSize() {
				var iWidth = document.documentElement.clientWidth;
				document.getElementsByTagName('html')[0].style.fontSize = (iWidth / num).toFixed(2) + 'px';
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
							parent = item;
							return false;
						}
						if (/^\./.test(id) && pReact.jq(item).hasClass(id.replace(".", ""))) {
							parent = item;
							return false;
						}
					});
				}
			}
			return parent;
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
})(pReact, this));