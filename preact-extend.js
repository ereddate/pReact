/*!
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
						var self = this;
						try {
							var then = typeof obj == "function" ? (new obj) : obj;
							then.elem = e && e.path && (this.path = e.path) && this || this;
							then.setState = function(ops) {
								pReact.extend(!then.state ? (then.state = {}) : then.state, ops);
								var parent = pReact.jq(self).parents(".preact_rootdom");
								pReact.refresh(parent[0], self);
							}
							then[result[1].replace("this.", "").replace(/this\[["']/gim, "").replace(/["']\]/gim, "").replace(/\s+/gim, "")].call(then, e, dir);
						} catch (e) {
							console.log(e);
						}
					}
				}) : elem[name.toLowerCase()] = function(e) {
					var self = this;
					try {
						var then = typeof obj == "function" ? (new obj) : obj;
						then.elem = e.path && (this.path = e.path) && this || this;
						then.setState = function(ops) {
							pReact.extend(!then.state ? (then.state = {}) : then.state, ops);
							var parent = pReact.jq(self).parents(".preact_rootdom");
							pReact.refresh(parent[0], self);
						}
						then[result[1].replace("this.", "").replace(/this\[["']/gim, "").replace(/["']\]/gim, "").replace(/\s+/gim, "")].call(then, e);
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
				fsize = (screen.width / 16).toFixed(2) || 0;
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
	styles: function(html, data) {
		html = html.replace(/<\?pjs\s+styles\(["'](.+)["']\)\s+\?>/gi, function(a, b, c) {
			if (b && pReact.Styles && pReact.Styles[b]) {
				var json = pReact.Styles[b],
					style = [];
				pReact.each(json, function(name, val) {
					style.push(name.replace(/[A-Z]/gim, function(a) {
						return /[A-Z]/.test(a) ? "-" + a.toLowerCase() : a;
					}) + ":" + val);
				});
				return style.join(';') + ";";
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
						t = o,
						dataIName;
					str = t.replace(/<\?pjs\s+[^\?]+\s+\?>/gi, function(a, b) {
						//console.log(/<\?pjs\s+for\s+\(([^=\s]+)/.exec(a))
						var tname = /<\?pjs\s+for\s+\(([^=\s]+)/.exec(a);
						dataIName = tname && tname[1] || dataIName || "i";
						if (/<\?pjs\s+for\s+/.test(a)) {
							var c = /\s*([^\s=<>\!;]+)\.|in\s+([^\s=<>\!;\)]+)/.exec(a); ///\s*.+\s*[=><]+\s*([^\.0-9-\+\*\/=><]+)\.*[a-zA-Z0-9+-><=\*\/]*/.exec(a);
							//console.log(c)
							if (c) {
								if (c[1] && !/[0-9]/.test(c[1])) dataTName = c[1];
								else if (c[2] && !/[0-9]/.test(c[2])) dataTName = c[2];
							}
							//console.log(dataTName)
						}
						if (/<\?pjs\s+for\s+/.test(a)) {
							var d = dataTName.split('.') && dataTName.split('.')[0] || dataTName.split('[') && dataTName.split('[')[0];
							a = a.replace("<?pjs for ", dataTName != " " ? "var " + d + " = result, arr = []; for " : "var arr = []; for ").replace(" ?>", dataTName != " " ? "{ arr.push(pReact.tmpl(_###_" : "{ arr.push(_###_");
						}
						if (/<\?pjs\s+end\s+for\s+\?>/.test(a)) {
							a = a.replace("<?pjs end for ?>", dataTName != " " ? "_###_, " + dataTName + "[" + dataIName + "])); }" : "_###_); }");
						}
						//console.log(a)
						return a;
					}).replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"").replace(/_###_/gi, "'");
					//console.log(t)
					var reg = new RegExp("{{ " + dataTName.replace(".", "\\.") + "\\[" + dataIName + "\\]\\.|" + dataTName.replace(".", "\\.") + "\\." + dataIName + "\\.", "gim");
					//console.log(reg)
					if (reg.test(str)) {
						str = str.replace(reg, "{{ ");
					}
					//console.log(str)
					var jsstr = "return function(result){" + str + "; return arr.join('');}";
					//console.log(jsstr)
					html = html.replace(o, pReact.sEval(jsstr)(data));
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
		},
		storage: function(options) {
			var type = options.type || 'localStorage';
			return {
				set: function(key, value) {
					var storage = window.localStorage || document.cookie;
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
					var storage = window.localStorage || document.cookie;
					if (storage) {
						switch (type) {
							case "localStorage":
								return storage.getItem(key) || null;
								break;
							case "cookie":
								var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
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
					var storage = window.localStorage || document.cookie;
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
			this.length = pReact.jq.getLength(this);
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
})(pReact, this));