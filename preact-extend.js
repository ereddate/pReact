pReact && pReact.tmplBindsExtend({
	bindHandle: function(elem, obj) {
		pReact.each("onClick onCopy onCut onPaste onKeyDown onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onTouchCancel onTouchEnd onTouchMove onTouchStart onScroll onWheel".split(' '), function(i, name) {
			var val = elem.getAttribute(name);
			if (val) {
				var result = /\{\{\s*(.+)\s*\}\}/.exec(val);
				result && result[1] && (elem.removeAttribute(name), elem[name.toLowerCase()] = function(e) {
					try {
						var fn = pReact.sEval('return function(e){' + result[1] + '(e);}', "e"),
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
	bindShow: function(elem, obj) {
		pReact.each("isShow isHide".split(' '), function(i, name) {
			var val = elem.getAttribute(name);
			if (val == "") {
				if (name == "isShow") {
					var a = elem.style.cssText != "" ? elem.style.cssText.replace(/display\s*\:\s*none\s*;*/gi, "") : "";
					elem.style.cssText = a;
				} else if (name == "isHide") {
					var a = elem.style.cssText != "" ? elem.style.cssText.replace(/display\s*\:\s*[a-zA-Z-]*\s*;*/gi, "") : "";
					a = a + "display:none";
					elem.style.cssText = a;
				}
				elem.removeAttribute(name);
			}
		});
	}
});

pReact && pReact.tmplLangExtend({
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
					}).replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"").replace(/_###_/gi, "'") + "return _ifend;";
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
					}).replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"").replace(/_###_/gi, "'") + "return switchstr;";
					a = pReact.sEval("return function(){" + a + "}")();
					html = html.replace(o, a);
				}
			});
		}
		return html;
	}
});
