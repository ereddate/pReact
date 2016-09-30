;
(function($) {
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
})(pReact)
