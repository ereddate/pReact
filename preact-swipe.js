pReact && pReact.extend(pReact.jq.fn, {
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
  }
});
