;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Hardcode image path, because Leaflet's autodetection
// fails, because mapbox.js is not named leaflet.js
window.L.Icon.Default.imagePath = '//api.tiles.mapbox.com/mapbox.js/' + 'v' +
    require('./package.json').version + '/images';

L.mapbox = module.exports = {
    VERSION: require('./package.json').version,
    geocoder: require('./src/geocoder'),
    marker: require('./src/marker'),
    tileLayer: require('./src/tile_layer'),
    infoControl: require('./src/info_control'),
    shareControl: require('./src/share_control'),
    legendControl: require('./src/legend_control'),
    geocoderControl: require('./src/geocoder_control'),
    gridControl: require('./src/grid_control'),
    gridLayer: require('./src/grid_layer'),
    markerLayer: require('./src/marker_layer'),
    map: require('./src/map'),
    config: require('./src/config'),
    sanitize: require('sanitize-caja'),
    template: require('mustache').to_html
};

},{"./package.json":7,"./src/config":8,"./src/geocoder":9,"./src/geocoder_control":10,"./src/grid_control":12,"./src/grid_layer":13,"./src/info_control":14,"./src/legend_control":15,"./src/map":17,"./src/marker":18,"./src/marker_layer":19,"./src/share_control":21,"./src/tile_layer":22,"mustache":4,"sanitize-caja":5}],2:[function(require,module,exports){
function xhr(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.domain +
                (location.port ? ':' + location.port : ''));
    }

    var x;

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && (
        // IE7-9 Quirks & Compatibility
        typeof window.XDomainRequest === 'object' ||
        // IE9 Standards mode
        typeof window.XDomainRequest === 'function'
    )) {
        // IE8-10
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    } else {
        x = new window.XMLHttpRequest();
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = xhr;

},{}],3:[function(require,module,exports){
/*! JSON v3.2.5 | http://bestiejs.github.io/json3 | Copyright 2012-2013, Kit Cambridge | http://kit.mit-license.org */
;(function (window) {
  // Convenience aliases.
  var getClass = {}.toString, isProperty, forEach, undef;

  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd, JSON3 = typeof exports == "object" && exports;

  if (JSON3 || isLoader) {
    if (typeof JSON == "object" && JSON) {
      // Delegate to the native `stringify` and `parse` implementations in
      // asynchronous module loaders and CommonJS environments.
      if (JSON3) {
        JSON3.stringify = JSON.stringify;
        JSON3.parse = JSON.parse;
      } else {
        JSON3 = JSON;
      }
    } else if (isLoader) {
      JSON3 = window.JSON = {};
    }
  } else {
    // Export for web browsers and JavaScript engines.
    JSON3 = window.JSON || (window.JSON = {});
  }

  // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
  var isExtended = new Date(-3509827334573292);
  try {
    // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
    // results for certain dates in Opera >= 10.53.
    isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
      // Safari < 2.0.2 stores the internal millisecond time value correctly,
      // but clips the values returned by the date methods to the range of
      // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
      isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
  } catch (exception) {}

  // Internal: Determines whether the native `JSON.stringify` and `parse`
  // implementations are spec-compliant. Based on work by Ken Snyder.
  function has(name) {
    if (name == "bug-string-char-index") {
      // IE <= 7 doesn't support accessing string characters using square
      // bracket notation. IE 8 only supports this for primitives.
      return "a"[0] != "a";
    }
    var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}', isAll = name == "json";
    if (isAll || name == "json-stringify" || name == "json-parse") {
      // Test `JSON.stringify`.
      if (name == "json-stringify" || isAll) {
        var stringify = JSON3.stringify, stringifySupported = typeof stringify == "function" && isExtended;
        if (stringifySupported) {
          // A test function object with a custom `toJSON` method.
          (value = function () {
            return 1;
          }).toJSON = value;
          try {
            stringifySupported =
              // Firefox 3.1b1 and b2 serialize string, number, and boolean
              // primitives as object literals.
              stringify(0) === "0" &&
              // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
              // literals.
              stringify(new Number()) === "0" &&
              stringify(new String()) == '""' &&
              // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
              // does not define a canonical JSON representation (this applies to
              // objects with `toJSON` properties as well, *unless* they are nested
              // within an object or array).
              stringify(getClass) === undef &&
              // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
              // FF 3.1b3 pass this test.
              stringify(undef) === undef &&
              // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
              // respectively, if the value is omitted entirely.
              stringify() === undef &&
              // FF 3.1b1, 2 throw an error if the given value is not a number,
              // string, array, object, Boolean, or `null` literal. This applies to
              // objects with custom `toJSON` methods as well, unless they are nested
              // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
              // methods entirely.
              stringify(value) === "1" &&
              stringify([value]) == "[1]" &&
              // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
              // `"[null]"`.
              stringify([undef]) == "[null]" &&
              // YUI 3.0.0b1 fails to serialize `null` literals.
              stringify(null) == "null" &&
              // FF 3.1b1, 2 halts serialization if an array contains a function:
              // `[1, true, getClass, 1]` serializes as "[1,true,],". These versions
              // of Firefox also allow trailing commas in JSON objects and arrays.
              // FF 3.1b3 elides non-JSON values from objects and arrays, unless they
              // define custom `toJSON` methods.
              stringify([undef, getClass, null]) == "[null,null,null]" &&
              // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
              // where character escape codes are expected (e.g., `\b` => `\u0008`).
              stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
              // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
              stringify(null, value) === "1" &&
              stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
              // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
              // serialize extended years.
              stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
              // The milliseconds are optional in ES 5, but required in 5.1.
              stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
              // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
              // four-digit years instead of six-digit years. Credits: @Yaffle.
              stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
              // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
              // values less than 1000. Credits: @Yaffle.
              stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
          } catch (exception) {
            stringifySupported = false;
          }
        }
        if (!isAll) {
          return stringifySupported;
        }
      }
      // Test `JSON.parse`.
      if (name == "json-parse" || isAll) {
        var parse = JSON3.parse;
        if (typeof parse == "function") {
          try {
            // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
            // Conforming implementations should also coerce the initial argument to
            // a string prior to parsing.
            if (parse("0") === 0 && !parse(false)) {
              // Simple parsing test.
              value = parse(serialized);
              var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
              if (parseSupported) {
                try {
                  // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                  parseSupported = !parse('"\t"');
                } catch (exception) {}
                if (parseSupported) {
                  try {
                    // FF 4.0 and 4.0.1 allow leading `+` signs, and leading and
                    // trailing decimal points. FF 4.0, 4.0.1, and IE 9-10 also
                    // allow certain octal literals.
                    parseSupported = parse("01") !== 1;
                  } catch (exception) {}
                }
              }
            }
          } catch (exception) {
            parseSupported = false;
          }
        }
        if (!isAll) {
          return parseSupported;
        }
      }
      return stringifySupported && parseSupported;
    }
  }

  if (!has("json")) {
    // Common `[[Class]]` name aliases.
    var functionClass = "[object Function]";
    var dateClass = "[object Date]";
    var numberClass = "[object Number]";
    var stringClass = "[object String]";
    var arrayClass = "[object Array]";
    var booleanClass = "[object Boolean]";

    // Detect incomplete support for accessing string characters by index.
    var charIndexBuggy = has("bug-string-char-index");

    // Define additional utility methods if the `Date` methods are buggy.
    if (!isExtended) {
      var floor = Math.floor;
      // A mapping between the months of the year and the number of days between
      // January 1st and the first of the respective month.
      var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      // Internal: Calculates the number of days between the Unix epoch and the
      // first day of the given month.
      var getDay = function (year, month) {
        return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
      };
    }

    // Internal: Determines if a property is a direct property of the given
    // object. Delegates to the native `Object#hasOwnProperty` method.
    if (!(isProperty = {}.hasOwnProperty)) {
      isProperty = function (property) {
        var members = {}, constructor;
        if ((members.__proto__ = null, members.__proto__ = {
          // The *proto* property cannot be set multiple times in recent
          // versions of Firefox and SeaMonkey.
          "toString": 1
        }, members).toString != getClass) {
          // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
          // supports the mutable *proto* property.
          isProperty = function (property) {
            // Capture and break the object's prototype chain (see section 8.6.2
            // of the ES 5.1 spec). The parenthesized expression prevents an
            // unsafe transformation by the Closure Compiler.
            var original = this.__proto__, result = property in (this.__proto__ = null, this);
            // Restore the original prototype chain.
            this.__proto__ = original;
            return result;
          };
        } else {
          // Capture a reference to the top-level `Object` constructor.
          constructor = members.constructor;
          // Use the `constructor` property to simulate `Object#hasOwnProperty` in
          // other environments.
          isProperty = function (property) {
            var parent = (this.constructor || constructor).prototype;
            return property in this && !(property in parent && this[property] === parent[property]);
          };
        }
        members = null;
        return isProperty.call(this, property);
      };
    }

    // Internal: Normalizes the `for...in` iteration algorithm across
    // environments. Each enumerated key is yielded to a `callback` function.
    forEach = function (object, callback) {
      var size = 0, Properties, members, property, forEach;

      // Tests for bugs in the current environment's `for...in` algorithm. The
      // `valueOf` property inherits the non-enumerable flag from
      // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
      (Properties = function () {
        this.valueOf = 0;
      }).prototype.valueOf = 0;

      // Iterate over a new instance of the `Properties` class.
      members = new Properties();
      for (property in members) {
        // Ignore all properties inherited from `Object.prototype`.
        if (isProperty.call(members, property)) {
          size++;
        }
      }
      Properties = members = null;

      // Normalize the iteration algorithm.
      if (!size) {
        // A list of non-enumerable properties inherited from `Object.prototype`.
        members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
        // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
        // properties.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == functionClass, property, length;
          for (property in object) {
            // Gecko <= 1.0 enumerates the `prototype` property of functions under
            // certain conditions; IE does not.
            if (!(isFunction && property == "prototype") && isProperty.call(object, property)) {
              callback(property);
            }
          }
          // Manually invoke the callback for each non-enumerable property.
          for (length = members.length; property = members[--length]; isProperty.call(object, property) && callback(property));
        };
      } else if (size == 2) {
        // Safari <= 2.0.4 enumerates shadowed properties twice.
        forEach = function (object, callback) {
          // Create a set of iterated properties.
          var members = {}, isFunction = getClass.call(object) == functionClass, property;
          for (property in object) {
            // Store each property name to prevent double enumeration. The
            // `prototype` property of functions is not enumerated due to cross-
            // environment inconsistencies.
            if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
              callback(property);
            }
          }
        };
      } else {
        // No bugs detected; use the standard `for...in` algorithm.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == functionClass, property, isConstructor;
          for (property in object) {
            if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
              callback(property);
            }
          }
          // Manually invoke the callback for the `constructor` property due to
          // cross-environment inconsistencies.
          if (isConstructor || isProperty.call(object, (property = "constructor"))) {
            callback(property);
          }
        };
      }
      return forEach(object, callback);
    };

    // Public: Serializes a JavaScript `value` as a JSON string. The optional
    // `filter` argument may specify either a function that alters how object and
    // array members are serialized, or an array of strings and numbers that
    // indicates which properties should be serialized. The optional `width`
    // argument may be either a string or number that specifies the indentation
    // level of the output.
    if (!has("json-stringify")) {
      // Internal: A map of control characters and their escaped equivalents.
      var Escapes = {
        92: "\\\\",
        34: '\\"',
        8: "\\b",
        12: "\\f",
        10: "\\n",
        13: "\\r",
        9: "\\t"
      };

      // Internal: Converts `value` into a zero-padded string such that its
      // length is at least equal to `width`. The `width` must be <= 6.
      var leadingZeroes = "000000";
      var toPaddedString = function (width, value) {
        // The `|| 0` expression is necessary to work around a bug in
        // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
        return (leadingZeroes + (value || 0)).slice(-width);
      };

      // Internal: Double-quotes a string `value`, replacing all ASCII control
      // characters (characters with code unit values between 0 and 31) with
      // their escaped equivalents. This is an implementation of the
      // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
      var unicodePrefix = "\\u00";
      var quote = function (value) {
        var result = '"', index = 0, length = value.length, isLarge = length > 10 && charIndexBuggy, symbols;
        if (isLarge) {
          symbols = value.split("");
        }
        for (; index < length; index++) {
          var charCode = value.charCodeAt(index);
          // If the character is a control character, append its Unicode or
          // shorthand escape sequence; otherwise, append the character as-is.
          switch (charCode) {
            case 8: case 9: case 10: case 12: case 13: case 34: case 92:
              result += Escapes[charCode];
              break;
            default:
              if (charCode < 32) {
                result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                break;
              }
              result += isLarge ? symbols[index] : charIndexBuggy ? value.charAt(index) : value[index];
          }
        }
        return result + '"';
      };

      // Internal: Recursively serializes an object. Implements the
      // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
      var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
        var value = object[property], className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, hasMembers, result;
        try {
          // Necessary for host object support.
          value = object[property];
        } catch (exception) {}
        if (typeof value == "object" && value) {
          className = getClass.call(value);
          if (className == dateClass && !isProperty.call(value, "toJSON")) {
            if (value > -1 / 0 && value < 1 / 0) {
              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              if (getDay) {
                // Manually compute the year, month, date, hours, minutes,
                // seconds, and milliseconds if the `getUTC*` methods are
                // buggy. Adapted from @Yaffle's `date-shim` project.
                date = floor(value / 864e5);
                for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                date = 1 + date - getDay(year, month);
                // The `time` value specifies the time within the day (see ES
                // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                // to compute `A modulo B`, as the `%` operator does not
                // correspond to the `modulo` operation for negative numbers.
                time = (value % 864e5 + 864e5) % 864e5;
                // The hours, minutes, seconds, and milliseconds are obtained by
                // decomposing the time within the day. See section 15.9.1.10.
                hours = floor(time / 36e5) % 24;
                minutes = floor(time / 6e4) % 60;
                seconds = floor(time / 1e3) % 60;
                milliseconds = time % 1e3;
              } else {
                year = value.getUTCFullYear();
                month = value.getUTCMonth();
                date = value.getUTCDate();
                hours = value.getUTCHours();
                minutes = value.getUTCMinutes();
                seconds = value.getUTCSeconds();
                milliseconds = value.getUTCMilliseconds();
              }
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                // Months, dates, hours, minutes, and seconds should have two
                // digits; milliseconds should have three.
                "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                // Milliseconds are optional in ES 5.0, but required in 5.1.
                "." + toPaddedString(3, milliseconds) + "Z";
            } else {
              value = null;
            }
          } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
            // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
            // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
            // ignores all `toJSON` methods on these objects unless they are
            // defined directly on an instance.
            value = value.toJSON(property);
          }
        }
        if (callback) {
          // If a replacement function was provided, call it to obtain the value
          // for serialization.
          value = callback.call(object, property, value);
        }
        if (value === null) {
          return "null";
        }
        className = getClass.call(value);
        if (className == booleanClass) {
          // Booleans are represented literally.
          return "" + value;
        } else if (className == numberClass) {
          // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
          // `"null"`.
          return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
        } else if (className == stringClass) {
          // Strings are double-quoted and escaped.
          return quote(value);
        }
        // Recursively serialize objects and arrays.
        if (typeof value == "object") {
          // Check for cyclic structures. This is a linear search; performance
          // is inversely proportional to the number of unique nested objects.
          for (length = stack.length; length--;) {
            if (stack[length] === value) {
              // Cyclic structures cannot be serialized by `JSON.stringify`.
              throw TypeError();
            }
          }
          // Add the object to the stack of traversed objects.
          stack.push(value);
          results = [];
          // Save the current indentation level and indent one additional level.
          prefix = indentation;
          indentation += whitespace;
          if (className == arrayClass) {
            // Recursively serialize array elements.
            for (index = 0, length = value.length; index < length; hasMembers || (hasMembers = true), index++) {
              element = serialize(index, value, callback, properties, whitespace, indentation, stack);
              results.push(element === undef ? "null" : element);
            }
            result = hasMembers ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
          } else {
            // Recursively serialize object members. Members are selected from
            // either a user-specified list of property names, or the object
            // itself.
            forEach(properties || value, function (property) {
              var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
              if (element !== undef) {
                // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                // is not the empty string, let `member` {quote(property) + ":"}
                // be the concatenation of `member` and the `space` character."
                // The "`space` character" refers to the literal space
                // character, not the `space` {width} argument provided to
                // `JSON.stringify`.
                results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
              }
              hasMembers || (hasMembers = true);
            });
            result = hasMembers ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
          }
          // Remove the object from the traversed object stack.
          stack.pop();
          return result;
        }
      };

      // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
      JSON3.stringify = function (source, filter, width) {
        var whitespace, callback, properties;
        if (typeof filter == "function" || typeof filter == "object" && filter) {
          if (getClass.call(filter) == functionClass) {
            callback = filter;
          } else if (getClass.call(filter) == arrayClass) {
            // Convert the property names array into a makeshift set.
            properties = {};
            for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((getClass.call(value) == stringClass || getClass.call(value) == numberClass) && (properties[value] = 1)));
          }
        }
        if (width) {
          if (getClass.call(width) == numberClass) {
            // Convert the `width` to an integer and create a string containing
            // `width` number of space characters.
            if ((width -= width % 1) > 0) {
              for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
            }
          } else if (getClass.call(width) == stringClass) {
            whitespace = width.length <= 10 ? width : width.slice(0, 10);
          }
        }
        // Opera <= 7.54u2 discards the values associated with empty string keys
        // (`""`) only if they are used directly within an object member list
        // (e.g., `!("" in { "": 1})`).
        return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
      };
    }

    // Public: Parses a JSON source string.
    if (!has("json-parse")) {
      var fromCharCode = String.fromCharCode;

      // Internal: A map of escaped control characters and their unescaped
      // equivalents.
      var Unescapes = {
        92: "\\",
        34: '"',
        47: "/",
        98: "\b",
        116: "\t",
        110: "\n",
        102: "\f",
        114: "\r"
      };

      // Internal: Stores the parser state.
      var Index, Source;

      // Internal: Resets the parser state and throws a `SyntaxError`.
      var abort = function() {
        Index = Source = null;
        throw SyntaxError();
      };

      // Internal: Returns the next token, or `"$"` if the parser has reached
      // the end of the source string. A token may be a string, number, `null`
      // literal, or Boolean literal.
      var lex = function () {
        var source = Source, length = source.length, value, begin, position, isSigned, charCode;
        while (Index < length) {
          charCode = source.charCodeAt(Index);
          switch (charCode) {
            case 9: case 10: case 13: case 32:
              // Skip whitespace tokens, including tabs, carriage returns, line
              // feeds, and space characters.
              Index++;
              break;
            case 123: case 125: case 91: case 93: case 58: case 44:
              // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
              // the current position.
              value = charIndexBuggy ? source.charAt(Index) : source[Index];
              Index++;
              return value;
            case 34:
              // `"` delimits a JSON string; advance to the next character and
              // begin parsing the string. String tokens are prefixed with the
              // sentinel `@` character to distinguish them from punctuators and
              // end-of-string tokens.
              for (value = "@", Index++; Index < length;) {
                charCode = source.charCodeAt(Index);
                if (charCode < 32) {
                  // Unescaped ASCII control characters (those with a code unit
                  // less than the space character) are not permitted.
                  abort();
                } else if (charCode == 92) {
                  // A reverse solidus (`\`) marks the beginning of an escaped
                  // control character (including `"`, `\`, and `/`) or Unicode
                  // escape sequence.
                  charCode = source.charCodeAt(++Index);
                  switch (charCode) {
                    case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                      // Revive escaped control characters.
                      value += Unescapes[charCode];
                      Index++;
                      break;
                    case 117:
                      // `\u` marks the beginning of a Unicode escape sequence.
                      // Advance to the first character and validate the
                      // four-digit code point.
                      begin = ++Index;
                      for (position = Index + 4; Index < position; Index++) {
                        charCode = source.charCodeAt(Index);
                        // A valid sequence comprises four hexdigits (case-
                        // insensitive) that form a single hexadecimal value.
                        if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                          // Invalid Unicode escape sequence.
                          abort();
                        }
                      }
                      // Revive the escaped character.
                      value += fromCharCode("0x" + source.slice(begin, Index));
                      break;
                    default:
                      // Invalid escape sequence.
                      abort();
                  }
                } else {
                  if (charCode == 34) {
                    // An unescaped double-quote character marks the end of the
                    // string.
                    break;
                  }
                  charCode = source.charCodeAt(Index);
                  begin = Index;
                  // Optimize for the common case where a string is valid.
                  while (charCode >= 32 && charCode != 92 && charCode != 34) {
                    charCode = source.charCodeAt(++Index);
                  }
                  // Append the string as-is.
                  value += source.slice(begin, Index);
                }
              }
              if (source.charCodeAt(Index) == 34) {
                // Advance to the next character and return the revived string.
                Index++;
                return value;
              }
              // Unterminated string.
              abort();
            default:
              // Parse numbers and literals.
              begin = Index;
              // Advance past the negative sign, if one is specified.
              if (charCode == 45) {
                isSigned = true;
                charCode = source.charCodeAt(++Index);
              }
              // Parse an integer or floating-point value.
              if (charCode >= 48 && charCode <= 57) {
                // Leading zeroes are interpreted as octal literals.
                if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                  // Illegal octal literal.
                  abort();
                }
                isSigned = false;
                // Parse the integer component.
                for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                // Floats cannot contain a leading decimal point; however, this
                // case is already accounted for by the parser.
                if (source.charCodeAt(Index) == 46) {
                  position = ++Index;
                  // Parse the decimal component.
                  for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                  if (position == Index) {
                    // Illegal trailing decimal.
                    abort();
                  }
                  Index = position;
                }
                // Parse exponents. The `e` denoting the exponent is
                // case-insensitive.
                charCode = source.charCodeAt(Index);
                if (charCode == 101 || charCode == 69) {
                  charCode = source.charCodeAt(++Index);
                  // Skip past the sign following the exponent, if one is
                  // specified.
                  if (charCode == 43 || charCode == 45) {
                    Index++;
                  }
                  // Parse the exponential component.
                  for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                  if (position == Index) {
                    // Illegal empty exponent.
                    abort();
                  }
                  Index = position;
                }
                // Coerce the parsed value to a JavaScript number.
                return +source.slice(begin, Index);
              }
              // A negative sign may only precede numbers.
              if (isSigned) {
                abort();
              }
              // `true`, `false`, and `null` literals.
              if (source.slice(Index, Index + 4) == "true") {
                Index += 4;
                return true;
              } else if (source.slice(Index, Index + 5) == "false") {
                Index += 5;
                return false;
              } else if (source.slice(Index, Index + 4) == "null") {
                Index += 4;
                return null;
              }
              // Unrecognized token.
              abort();
          }
        }
        // Return the sentinel `$` character if the parser has reached the end
        // of the source string.
        return "$";
      };

      // Internal: Parses a JSON `value` token.
      var get = function (value) {
        var results, hasMembers;
        if (value == "$") {
          // Unexpected end of input.
          abort();
        }
        if (typeof value == "string") {
          if (value[0] == "@") {
            // Remove the sentinel `@` character.
            return value.slice(1);
          }
          // Parse object and array literals.
          if (value == "[") {
            // Parses a JSON array, returning a new JavaScript array.
            results = [];
            for (;; hasMembers || (hasMembers = true)) {
              value = lex();
              // A closing square bracket marks the end of the array literal.
              if (value == "]") {
                break;
              }
              // If the array literal contains elements, the current token
              // should be a comma separating the previous element from the
              // next.
              if (hasMembers) {
                if (value == ",") {
                  value = lex();
                  if (value == "]") {
                    // Unexpected trailing `,` in array literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each array element.
                  abort();
                }
              }
              // Elisions and leading commas are not permitted.
              if (value == ",") {
                abort();
              }
              results.push(get(value));
            }
            return results;
          } else if (value == "{") {
            // Parses a JSON object, returning a new JavaScript object.
            results = {};
            for (;; hasMembers || (hasMembers = true)) {
              value = lex();
              // A closing curly brace marks the end of the object literal.
              if (value == "}") {
                break;
              }
              // If the object literal contains members, the current token
              // should be a comma separator.
              if (hasMembers) {
                if (value == ",") {
                  value = lex();
                  if (value == "}") {
                    // Unexpected trailing `,` in object literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each object member.
                  abort();
                }
              }
              // Leading commas are not permitted, object property names must be
              // double-quoted strings, and a `:` must separate each property
              // name and value.
              if (value == "," || typeof value != "string" || value[0] != "@" || lex() != ":") {
                abort();
              }
              results[value.slice(1)] = get(lex());
            }
            return results;
          }
          // Unexpected token encountered.
          abort();
        }
        return value;
      };

      // Internal: Updates a traversed object member.
      var update = function(source, property, callback) {
        var element = walk(source, property, callback);
        if (element === undef) {
          delete source[property];
        } else {
          source[property] = element;
        }
      };

      // Internal: Recursively traverses a parsed JSON object, invoking the
      // `callback` function for each value. This is an implementation of the
      // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
      var walk = function (source, property, callback) {
        var value = source[property], length;
        if (typeof value == "object" && value) {
          // `forEach` can't be used to traverse an array in Opera <= 8.54
          // because its `Object#hasOwnProperty` implementation returns `false`
          // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
          if (getClass.call(value) == arrayClass) {
            for (length = value.length; length--;) {
              update(value, length, callback);
            }
          } else {
            forEach(value, function (property) {
              update(value, property, callback);
            });
          }
        }
        return callback.call(source, property, value);
      };

      // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
      JSON3.parse = function (source, callback) {
        var result, value;
        Index = 0;
        Source = "" + source;
        result = get(lex());
        // If a JSON string contains multiple tokens, it is invalid.
        if (lex() != "$") {
          abort();
        }
        // Reset the parser state.
        Index = Source = null;
        return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
      };
    }
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}(this));

},{}],4:[function(require,module,exports){
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

(function (root, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else {
    var mustache = {};
    factory(mustache);
    if (typeof define === "function" && define.amd) {
      define(mustache); // AMD
    } else {
      root.Mustache = mustache; // <script>
    }
  }
}(this, function (mustache) {

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var nonSpaceRe = /\S/;
  var eqRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var RegExp_test = RegExp.prototype.test;
  function testRegExp(re, string) {
    return RegExp_test.call(re, string);
  }

  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var Object_toString = Object.prototype.toString;
  var isArray = Array.isArray || function (object) {
    return Object_toString.call(object) === '[object Array]';
  };

  function isFunction(object) {
    return typeof object === 'function';
  }

  function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function () {
    return this.tail === "";
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function (re) {
    var match = this.tail.match(re);

    if (match && match.index === 0) {
      var string = match[0];
      this.tail = this.tail.substring(string.length);
      this.pos += string.length;
      return string;
    }

    return "";
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function (re) {
    var index = this.tail.search(re), match;

    switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  function Context(view, parent) {
    this.view = view == null ? {} : view;
    this.parent = parent;
    this._cache = { '.': this.view };
  }

  Context.make = function (view) {
    return (view instanceof Context) ? view : new Context(view);
  };

  Context.prototype.push = function (view) {
    return new Context(view, this);
  };

  Context.prototype.lookup = function (name) {
    var value;
    if (name in this._cache) {
      value = this._cache[name];
    } else {
      var context = this;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;

          var names = name.split('.'), i = 0;
          while (value != null && i < names.length) {
            value = value[names[i++]];
          }
        } else {
          value = context.view[name];
        }

        if (value != null) break;

        context = context.parent;
      }

      this._cache[name] = value;
    }

    if (isFunction(value)) {
      value = value.call(this.view);
    }

    return value;
  };

  function Writer() {
    this.clearCache();
  }

  Writer.prototype.clearCache = function () {
    this._cache = {};
    this._partialCache = {};
  };

  Writer.prototype.compile = function (template, tags) {
    var fn = this._cache[template];

    if (!fn) {
      var tokens = mustache.parse(template, tags);
      fn = this._cache[template] = this.compileTokens(tokens, template);
    }

    return fn;
  };

  Writer.prototype.compilePartial = function (name, template, tags) {
    var fn = this.compile(template, tags);
    this._partialCache[name] = fn;
    return fn;
  };

  Writer.prototype.getPartial = function (name) {
    if (!(name in this._partialCache) && this._loadPartial) {
      this.compilePartial(name, this._loadPartial(name));
    }

    return this._partialCache[name];
  };

  Writer.prototype.compileTokens = function (tokens, template) {
    var self = this;
    return function (view, partials) {
      if (partials) {
        if (isFunction(partials)) {
          self._loadPartial = partials;
        } else {
          for (var name in partials) {
            self.compilePartial(name, partials[name]);
          }
        }
      }

      return renderTokens(tokens, self, Context.make(view), template);
    };
  };

  Writer.prototype.render = function (template, view, partials) {
    return this.compile(template)(view, partials);
  };

  /**
   * Low-level function that renders the given `tokens` using the given `writer`
   * and `context`. The `template` string is only needed for templates that use
   * higher-order sections to extract the portion of the original template that
   * was contained in that section.
   */
  function renderTokens(tokens, writer, context, template) {
    var buffer = '';

    // This function is used to render an artbitrary template
    // in the current context by higher-order functions.
    function subRender(template) {
      return writer.render(template, context);
    }

    var token, tokenValue, value;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];
      tokenValue = token[1];

      switch (token[0]) {
      case '#':
        value = context.lookup(tokenValue);

        if (typeof value === 'object' || typeof value === 'string') {
          if (isArray(value)) {
            for (var j = 0, jlen = value.length; j < jlen; ++j) {
              buffer += renderTokens(token[4], writer, context.push(value[j]), template);
            }
          } else if (value) {
            buffer += renderTokens(token[4], writer, context.push(value), template);
          }
        } else if (isFunction(value)) {
          var text = template == null ? null : template.slice(token[3], token[5]);
          value = value.call(context.view, text, subRender);
          if (value != null) buffer += value;
        } else if (value) {
          buffer += renderTokens(token[4], writer, context, template);
        }

        break;
      case '^':
        value = context.lookup(tokenValue);

        // Use JavaScript's definition of falsy. Include empty arrays.
        // See https://github.com/janl/mustache.js/issues/186
        if (!value || (isArray(value) && value.length === 0)) {
          buffer += renderTokens(token[4], writer, context, template);
        }

        break;
      case '>':
        value = writer.getPartial(tokenValue);
        if (isFunction(value)) buffer += value(context);
        break;
      case '&':
        value = context.lookup(tokenValue);
        if (value != null) buffer += value;
        break;
      case 'name':
        value = context.lookup(tokenValue);
        if (value != null) buffer += mustache.escape(value);
        break;
      case 'text':
        buffer += tokenValue;
        break;
      }
    }

    return buffer;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens(tokens) {
    var tree = [];
    var collector = tree;
    var sections = [];

    var token;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];
      switch (token[0]) {
      case '#':
      case '^':
        sections.push(token);
        collector.push(token);
        collector = token[4] = [];
        break;
      case '/':
        var section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : tree;
        break;
      default:
        collector.push(token);
      }
    }

    return tree;
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens(tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];
      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          lastToken = token;
          squashedTokens.push(token);
        }
      }
    }

    return squashedTokens;
  }

  function escapeTags(tags) {
    return [
      new RegExp(escapeRegExp(tags[0]) + "\\s*"),
      new RegExp("\\s*" + escapeRegExp(tags[1]))
    ];
  }

  /**
   * Breaks up the given `template` string into a tree of token objects. If
   * `tags` is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. ["<%", "%>"]). Of
   * course, the default is to use mustaches (i.e. Mustache.tags).
   */
  function parseTemplate(template, tags) {
    template = template || '';
    tags = tags || mustache.tags;

    if (typeof tags === 'string') tags = tags.split(spaceRe);
    if (tags.length !== 2) throw new Error('Invalid tags: ' + tags.join(', '));

    var tagRes = escapeTags(tags);
    var scanner = new Scanner(template);

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length) {
          delete tokens[spaces.pop()];
        }
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(tagRes[0]);
      if (value) {
        for (var i = 0, len = value.length; i < len; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push(['text', chr, start, start + 1]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr == '\n') stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(tagRes[0])) break;
      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(eqRe);
        scanner.scan(eqRe);
        scanner.scanUntil(tagRes[1]);
      } else if (type === '{') {
        value = scanner.scanUntil(new RegExp('\\s*' + escapeRegExp('}' + tags[1])));
        scanner.scan(curlyRe);
        scanner.scanUntil(tagRes[1]);
        type = '&';
      } else {
        value = scanner.scanUntil(tagRes[1]);
      }

      // Match the closing tag.
      if (!scanner.scan(tagRes[1])) throw new Error('Unclosed tag at ' + scanner.pos);

      token = [type, value, start, scanner.pos];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();
        if (!openSection) {
          throw new Error('Unopened section "' + value + '" at ' + start);
        }
        if (openSection[1] !== value) {
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
        }
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        tags = value.split(spaceRe);
        if (tags.length !== 2) {
          throw new Error('Invalid tags at ' + start + ': ' + tags.join(', '));
        }
        tagRes = escapeTags(tags);
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();
    if (openSection) {
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
    }

    return nestTokens(squashTokens(tokens));
  }

  mustache.name = "mustache.js";
  mustache.version = "0.7.3";
  mustache.tags = ["{{", "}}"];

  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

  mustache.parse = parseTemplate;

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // All Mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates and partials in the default writer.
   */
  mustache.clearCache = function () {
    return defaultWriter.clearCache();
  };

  /**
   * Compiles the given `template` to a reusable function using the default
   * writer.
   */
  mustache.compile = function (template, tags) {
    return defaultWriter.compile(template, tags);
  };

  /**
   * Compiles the partial with the given `name` and `template` to a reusable
   * function using the default writer.
   */
  mustache.compilePartial = function (name, template, tags) {
    return defaultWriter.compilePartial(name, template, tags);
  };

  /**
   * Compiles the given array of tokens (the output of a parse) to a reusable
   * function using the default writer.
   */
  mustache.compileTokens = function (tokens, template) {
    return defaultWriter.compileTokens(tokens, template);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function (template, view, partials) {
    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.
  mustache.to_html = function (template, view, partials, send) {
    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

}));

},{}],5:[function(require,module,exports){
var html_sanitize = require('./sanitizer-bundle.js');

module.exports = function(_) {
    if (!_) return '';
    return html_sanitize(_, cleanUrl, cleanId);
};

// https://bugzilla.mozilla.org/show_bug.cgi?id=255107
function cleanUrl(url) {
    'use strict';
    if (/^https?/.test(url.getScheme())) return url.toString();
    if ('data' == url.getScheme() && /^image/.test(url.getPath())) {
        return url.toString();
    }
}

function cleanId(id) { return id; }

},{"./sanitizer-bundle.js":6}],6:[function(require,module,exports){

// Copyright (C) 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview
 * Implements RFC 3986 for parsing/formatting URIs.
 *
 * @author mikesamuel@gmail.com
 * \@provides URI
 * \@overrides window
 */

var URI = (function () {

/**
 * creates a uri from the string form.  The parser is relaxed, so special
 * characters that aren't escaped but don't cause ambiguities will not cause
 * parse failures.
 *
 * @return {URI|null}
 */
function parse(uriStr) {
  var m = ('' + uriStr).match(URI_RE_);
  if (!m) { return null; }
  return new URI(
      nullIfAbsent(m[1]),
      nullIfAbsent(m[2]),
      nullIfAbsent(m[3]),
      nullIfAbsent(m[4]),
      nullIfAbsent(m[5]),
      nullIfAbsent(m[6]),
      nullIfAbsent(m[7]));
}


/**
 * creates a uri from the given parts.
 *
 * @param scheme {string} an unencoded scheme such as "http" or null
 * @param credentials {string} unencoded user credentials or null
 * @param domain {string} an unencoded domain name or null
 * @param port {number} a port number in [1, 32768].
 *    -1 indicates no port, as does null.
 * @param path {string} an unencoded path
 * @param query {Array.<string>|string|null} a list of unencoded cgi
 *   parameters where even values are keys and odds the corresponding values
 *   or an unencoded query.
 * @param fragment {string} an unencoded fragment without the "#" or null.
 * @return {URI}
 */
function create(scheme, credentials, domain, port, path, query, fragment) {
  var uri = new URI(
      encodeIfExists2(scheme, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_),
      encodeIfExists2(
          credentials, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_),
      encodeIfExists(domain),
      port > 0 ? port.toString() : null,
      encodeIfExists2(path, URI_DISALLOWED_IN_PATH_),
      null,
      encodeIfExists(fragment));
  if (query) {
    if ('string' === typeof query) {
      uri.setRawQuery(query.replace(/[^?&=0-9A-Za-z_\-~.%]/g, encodeOne));
    } else {
      uri.setAllParameters(query);
    }
  }
  return uri;
}
function encodeIfExists(unescapedPart) {
  if ('string' == typeof unescapedPart) {
    return encodeURIComponent(unescapedPart);
  }
  return null;
};
/**
 * if unescapedPart is non null, then escapes any characters in it that aren't
 * valid characters in a url and also escapes any special characters that
 * appear in extra.
 *
 * @param unescapedPart {string}
 * @param extra {RegExp} a character set of characters in [\01-\177].
 * @return {string|null} null iff unescapedPart == null.
 */
function encodeIfExists2(unescapedPart, extra) {
  if ('string' == typeof unescapedPart) {
    return encodeURI(unescapedPart).replace(extra, encodeOne);
  }
  return null;
};
/** converts a character in [\01-\177] to its url encoded equivalent. */
function encodeOne(ch) {
  var n = ch.charCodeAt(0);
  return '%' + '0123456789ABCDEF'.charAt((n >> 4) & 0xf) +
      '0123456789ABCDEF'.charAt(n & 0xf);
}

/**
 * {@updoc
 *  $ normPath('foo/./bar')
 *  # 'foo/bar'
 *  $ normPath('./foo')
 *  # 'foo'
 *  $ normPath('foo/.')
 *  # 'foo'
 *  $ normPath('foo//bar')
 *  # 'foo/bar'
 * }
 */
function normPath(path) {
  return path.replace(/(^|\/)\.(?:\/|$)/g, '$1').replace(/\/{2,}/g, '/');
}

var PARENT_DIRECTORY_HANDLER = new RegExp(
    ''
    // A path break
    + '(/|^)'
    // followed by a non .. path element
    // (cannot be . because normPath is used prior to this RegExp)
    + '(?:[^./][^/]*|\\.{2,}(?:[^./][^/]*)|\\.{3,}[^/]*)'
    // followed by .. followed by a path break.
    + '/\\.\\.(?:/|$)');

var PARENT_DIRECTORY_HANDLER_RE = new RegExp(PARENT_DIRECTORY_HANDLER);

var EXTRA_PARENT_PATHS_RE = /^(?:\.\.\/)*(?:\.\.$)?/;

/**
 * Normalizes its input path and collapses all . and .. sequences except for
 * .. sequences that would take it above the root of the current parent
 * directory.
 * {@updoc
 *  $ collapse_dots('foo/../bar')
 *  # 'bar'
 *  $ collapse_dots('foo/./bar')
 *  # 'foo/bar'
 *  $ collapse_dots('foo/../bar/./../../baz')
 *  # 'baz'
 *  $ collapse_dots('../foo')
 *  # '../foo'
 *  $ collapse_dots('../foo').replace(EXTRA_PARENT_PATHS_RE, '')
 *  # 'foo'
 * }
 */
function collapse_dots(path) {
  if (path === null) { return null; }
  var p = normPath(path);
  // Only /../ left to flatten
  var r = PARENT_DIRECTORY_HANDLER_RE;
  // We replace with $1 which matches a / before the .. because this
  // guarantees that:
  // (1) we have at most 1 / between the adjacent place,
  // (2) always have a slash if there is a preceding path section, and
  // (3) we never turn a relative path into an absolute path.
  for (var q; (q = p.replace(r, '$1')) != p; p = q) {};
  return p;
}

/**
 * resolves a relative url string to a base uri.
 * @return {URI}
 */
function resolve(baseUri, relativeUri) {
  // there are several kinds of relative urls:
  // 1. //foo - replaces everything from the domain on.  foo is a domain name
  // 2. foo - replaces the last part of the path, the whole query and fragment
  // 3. /foo - replaces the the path, the query and fragment
  // 4. ?foo - replace the query and fragment
  // 5. #foo - replace the fragment only

  var absoluteUri = baseUri.clone();
  // we satisfy these conditions by looking for the first part of relativeUri
  // that is not blank and applying defaults to the rest

  var overridden = relativeUri.hasScheme();

  if (overridden) {
    absoluteUri.setRawScheme(relativeUri.getRawScheme());
  } else {
    overridden = relativeUri.hasCredentials();
  }

  if (overridden) {
    absoluteUri.setRawCredentials(relativeUri.getRawCredentials());
  } else {
    overridden = relativeUri.hasDomain();
  }

  if (overridden) {
    absoluteUri.setRawDomain(relativeUri.getRawDomain());
  } else {
    overridden = relativeUri.hasPort();
  }

  var rawPath = relativeUri.getRawPath();
  var simplifiedPath = collapse_dots(rawPath);
  if (overridden) {
    absoluteUri.setPort(relativeUri.getPort());
    simplifiedPath = simplifiedPath
        && simplifiedPath.replace(EXTRA_PARENT_PATHS_RE, '');
  } else {
    overridden = !!rawPath;
    if (overridden) {
      // resolve path properly
      if (simplifiedPath.charCodeAt(0) !== 0x2f /* / */) {  // path is relative
        var absRawPath = collapse_dots(absoluteUri.getRawPath() || '')
            .replace(EXTRA_PARENT_PATHS_RE, '');
        var slash = absRawPath.lastIndexOf('/') + 1;
        simplifiedPath = collapse_dots(
            (slash ? absRawPath.substring(0, slash) : '')
            + collapse_dots(rawPath))
            .replace(EXTRA_PARENT_PATHS_RE, '');
      }
    } else {
      simplifiedPath = simplifiedPath
          && simplifiedPath.replace(EXTRA_PARENT_PATHS_RE, '');
      if (simplifiedPath !== rawPath) {
        absoluteUri.setRawPath(simplifiedPath);
      }
    }
  }

  if (overridden) {
    absoluteUri.setRawPath(simplifiedPath);
  } else {
    overridden = relativeUri.hasQuery();
  }

  if (overridden) {
    absoluteUri.setRawQuery(relativeUri.getRawQuery());
  } else {
    overridden = relativeUri.hasFragment();
  }

  if (overridden) {
    absoluteUri.setRawFragment(relativeUri.getRawFragment());
  }

  return absoluteUri;
}

/**
 * a mutable URI.
 *
 * This class contains setters and getters for the parts of the URI.
 * The <tt>getXYZ</tt>/<tt>setXYZ</tt> methods return the decoded part -- so
 * <code>uri.parse('/foo%20bar').getPath()</code> will return the decoded path,
 * <tt>/foo bar</tt>.
 *
 * <p>The raw versions of fields are available too.
 * <code>uri.parse('/foo%20bar').getRawPath()</code> will return the raw path,
 * <tt>/foo%20bar</tt>.  Use the raw setters with care, since
 * <code>URI::toString</code> is not guaranteed to return a valid url if a
 * raw setter was used.
 *
 * <p>All setters return <tt>this</tt> and so may be chained, a la
 * <code>uri.parse('/foo').setFragment('part').toString()</code>.
 *
 * <p>You should not use this constructor directly -- please prefer the factory
 * functions {@link uri.parse}, {@link uri.create}, {@link uri.resolve}
 * instead.</p>
 *
 * <p>The parameters are all raw (assumed to be properly escaped) parts, and
 * any (but not all) may be null.  Undefined is not allowed.</p>
 *
 * @constructor
 */
function URI(
    rawScheme,
    rawCredentials, rawDomain, port,
    rawPath, rawQuery, rawFragment) {
  this.scheme_ = rawScheme;
  this.credentials_ = rawCredentials;
  this.domain_ = rawDomain;
  this.port_ = port;
  this.path_ = rawPath;
  this.query_ = rawQuery;
  this.fragment_ = rawFragment;
  /**
   * @type {Array|null}
   */
  this.paramCache_ = null;
}

/** returns the string form of the url. */
URI.prototype.toString = function () {
  var out = [];
  if (null !== this.scheme_) { out.push(this.scheme_, ':'); }
  if (null !== this.domain_) {
    out.push('//');
    if (null !== this.credentials_) { out.push(this.credentials_, '@'); }
    out.push(this.domain_);
    if (null !== this.port_) { out.push(':', this.port_.toString()); }
  }
  if (null !== this.path_) { out.push(this.path_); }
  if (null !== this.query_) { out.push('?', this.query_); }
  if (null !== this.fragment_) { out.push('#', this.fragment_); }
  return out.join('');
};

URI.prototype.clone = function () {
  return new URI(this.scheme_, this.credentials_, this.domain_, this.port_,
                 this.path_, this.query_, this.fragment_);
};

URI.prototype.getScheme = function () {
  // HTML5 spec does not require the scheme to be lowercased but
  // all common browsers except Safari lowercase the scheme.
  return this.scheme_ && decodeURIComponent(this.scheme_).toLowerCase();
};
URI.prototype.getRawScheme = function () {
  return this.scheme_;
};
URI.prototype.setScheme = function (newScheme) {
  this.scheme_ = encodeIfExists2(
      newScheme, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_);
  return this;
};
URI.prototype.setRawScheme = function (newScheme) {
  this.scheme_ = newScheme ? newScheme : null;
  return this;
};
URI.prototype.hasScheme = function () {
  return null !== this.scheme_;
};


URI.prototype.getCredentials = function () {
  return this.credentials_ && decodeURIComponent(this.credentials_);
};
URI.prototype.getRawCredentials = function () {
  return this.credentials_;
};
URI.prototype.setCredentials = function (newCredentials) {
  this.credentials_ = encodeIfExists2(
      newCredentials, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_);

  return this;
};
URI.prototype.setRawCredentials = function (newCredentials) {
  this.credentials_ = newCredentials ? newCredentials : null;
  return this;
};
URI.prototype.hasCredentials = function () {
  return null !== this.credentials_;
};


URI.prototype.getDomain = function () {
  return this.domain_ && decodeURIComponent(this.domain_);
};
URI.prototype.getRawDomain = function () {
  return this.domain_;
};
URI.prototype.setDomain = function (newDomain) {
  return this.setRawDomain(newDomain && encodeURIComponent(newDomain));
};
URI.prototype.setRawDomain = function (newDomain) {
  this.domain_ = newDomain ? newDomain : null;
  // Maintain the invariant that paths must start with a slash when the URI
  // is not path-relative.
  return this.setRawPath(this.path_);
};
URI.prototype.hasDomain = function () {
  return null !== this.domain_;
};


URI.prototype.getPort = function () {
  return this.port_ && decodeURIComponent(this.port_);
};
URI.prototype.setPort = function (newPort) {
  if (newPort) {
    newPort = Number(newPort);
    if (newPort !== (newPort & 0xffff)) {
      throw new Error('Bad port number ' + newPort);
    }
    this.port_ = '' + newPort;
  } else {
    this.port_ = null;
  }
  return this;
};
URI.prototype.hasPort = function () {
  return null !== this.port_;
};


URI.prototype.getPath = function () {
  return this.path_ && decodeURIComponent(this.path_);
};
URI.prototype.getRawPath = function () {
  return this.path_;
};
URI.prototype.setPath = function (newPath) {
  return this.setRawPath(encodeIfExists2(newPath, URI_DISALLOWED_IN_PATH_));
};
URI.prototype.setRawPath = function (newPath) {
  if (newPath) {
    newPath = String(newPath);
    this.path_ = 
      // Paths must start with '/' unless this is a path-relative URL.
      (!this.domain_ || /^\//.test(newPath)) ? newPath : '/' + newPath;
  } else {
    this.path_ = null;
  }
  return this;
};
URI.prototype.hasPath = function () {
  return null !== this.path_;
};


URI.prototype.getQuery = function () {
  // From http://www.w3.org/Addressing/URL/4_URI_Recommentations.html
  // Within the query string, the plus sign is reserved as shorthand notation
  // for a space.
  return this.query_ && decodeURIComponent(this.query_).replace(/\+/g, ' ');
};
URI.prototype.getRawQuery = function () {
  return this.query_;
};
URI.prototype.setQuery = function (newQuery) {
  this.paramCache_ = null;
  this.query_ = encodeIfExists(newQuery);
  return this;
};
URI.prototype.setRawQuery = function (newQuery) {
  this.paramCache_ = null;
  this.query_ = newQuery ? newQuery : null;
  return this;
};
URI.prototype.hasQuery = function () {
  return null !== this.query_;
};

/**
 * sets the query given a list of strings of the form
 * [ key0, value0, key1, value1, ... ].
 *
 * <p><code>uri.setAllParameters(['a', 'b', 'c', 'd']).getQuery()</code>
 * will yield <code>'a=b&c=d'</code>.
 */
URI.prototype.setAllParameters = function (params) {
  if (typeof params === 'object') {
    if (!(params instanceof Array)
        && (params instanceof Object
            || Object.prototype.toString.call(params) !== '[object Array]')) {
      var newParams = [];
      var i = -1;
      for (var k in params) {
        var v = params[k];
        if ('string' === typeof v) {
          newParams[++i] = k;
          newParams[++i] = v;
        }
      }
      params = newParams;
    }
  }
  this.paramCache_ = null;
  var queryBuf = [];
  var separator = '';
  for (var j = 0; j < params.length;) {
    var k = params[j++];
    var v = params[j++];
    queryBuf.push(separator, encodeURIComponent(k.toString()));
    separator = '&';
    if (v) {
      queryBuf.push('=', encodeURIComponent(v.toString()));
    }
  }
  this.query_ = queryBuf.join('');
  return this;
};
URI.prototype.checkParameterCache_ = function () {
  if (!this.paramCache_) {
    var q = this.query_;
    if (!q) {
      this.paramCache_ = [];
    } else {
      var cgiParams = q.split(/[&\?]/);
      var out = [];
      var k = -1;
      for (var i = 0; i < cgiParams.length; ++i) {
        var m = cgiParams[i].match(/^([^=]*)(?:=(.*))?$/);
        // From http://www.w3.org/Addressing/URL/4_URI_Recommentations.html
        // Within the query string, the plus sign is reserved as shorthand
        // notation for a space.
        out[++k] = decodeURIComponent(m[1]).replace(/\+/g, ' ');
        out[++k] = decodeURIComponent(m[2] || '').replace(/\+/g, ' ');
      }
      this.paramCache_ = out;
    }
  }
};
/**
 * sets the values of the named cgi parameters.
 *
 * <p>So, <code>uri.parse('foo?a=b&c=d&e=f').setParameterValues('c', ['new'])
 * </code> yields <tt>foo?a=b&c=new&e=f</tt>.</p>
 *
 * @param key {string}
 * @param values {Array.<string>} the new values.  If values is a single string
 *   then it will be treated as the sole value.
 */
URI.prototype.setParameterValues = function (key, values) {
  // be nice and avoid subtle bugs where [] operator on string performs charAt
  // on some browsers and crashes on IE
  if (typeof values === 'string') {
    values = [ values ];
  }

  this.checkParameterCache_();
  var newValueIndex = 0;
  var pc = this.paramCache_;
  var params = [];
  for (var i = 0, k = 0; i < pc.length; i += 2) {
    if (key === pc[i]) {
      if (newValueIndex < values.length) {
        params.push(key, values[newValueIndex++]);
      }
    } else {
      params.push(pc[i], pc[i + 1]);
    }
  }
  while (newValueIndex < values.length) {
    params.push(key, values[newValueIndex++]);
  }
  this.setAllParameters(params);
  return this;
};
URI.prototype.removeParameter = function (key) {
  return this.setParameterValues(key, []);
};
/**
 * returns the parameters specified in the query part of the uri as a list of
 * keys and values like [ key0, value0, key1, value1, ... ].
 *
 * @return {Array.<string>}
 */
URI.prototype.getAllParameters = function () {
  this.checkParameterCache_();
  return this.paramCache_.slice(0, this.paramCache_.length);
};
/**
 * returns the value<b>s</b> for a given cgi parameter as a list of decoded
 * query parameter values.
 * @return {Array.<string>}
 */
URI.prototype.getParameterValues = function (paramNameUnescaped) {
  this.checkParameterCache_();
  var values = [];
  for (var i = 0; i < this.paramCache_.length; i += 2) {
    if (paramNameUnescaped === this.paramCache_[i]) {
      values.push(this.paramCache_[i + 1]);
    }
  }
  return values;
};
/**
 * returns a map of cgi parameter names to (non-empty) lists of values.
 * @return {Object.<string,Array.<string>>}
 */
URI.prototype.getParameterMap = function (paramNameUnescaped) {
  this.checkParameterCache_();
  var paramMap = {};
  for (var i = 0; i < this.paramCache_.length; i += 2) {
    var key = this.paramCache_[i++],
      value = this.paramCache_[i++];
    if (!(key in paramMap)) {
      paramMap[key] = [value];
    } else {
      paramMap[key].push(value);
    }
  }
  return paramMap;
};
/**
 * returns the first value for a given cgi parameter or null if the given
 * parameter name does not appear in the query string.
 * If the given parameter name does appear, but has no '<tt>=</tt>' following
 * it, then the empty string will be returned.
 * @return {string|null}
 */
URI.prototype.getParameterValue = function (paramNameUnescaped) {
  this.checkParameterCache_();
  for (var i = 0; i < this.paramCache_.length; i += 2) {
    if (paramNameUnescaped === this.paramCache_[i]) {
      return this.paramCache_[i + 1];
    }
  }
  return null;
};

URI.prototype.getFragment = function () {
  return this.fragment_ && decodeURIComponent(this.fragment_);
};
URI.prototype.getRawFragment = function () {
  return this.fragment_;
};
URI.prototype.setFragment = function (newFragment) {
  this.fragment_ = newFragment ? encodeURIComponent(newFragment) : null;
  return this;
};
URI.prototype.setRawFragment = function (newFragment) {
  this.fragment_ = newFragment ? newFragment : null;
  return this;
};
URI.prototype.hasFragment = function () {
  return null !== this.fragment_;
};

function nullIfAbsent(matchPart) {
  return ('string' == typeof matchPart) && (matchPart.length > 0)
         ? matchPart
         : null;
}




/**
 * a regular expression for breaking a URI into its component parts.
 *
 * <p>http://www.gbiv.com/protocols/uri/rfc/rfc3986.html#RFC2234 says
 * As the "first-match-wins" algorithm is identical to the "greedy"
 * disambiguation method used by POSIX regular expressions, it is natural and
 * commonplace to use a regular expression for parsing the potential five
 * components of a URI reference.
 *
 * <p>The following line is the regular expression for breaking-down a
 * well-formed URI reference into its components.
 *
 * <pre>
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 * </pre>
 *
 * <p>The numbers in the second line above are only to assist readability; they
 * indicate the reference points for each subexpression (i.e., each paired
 * parenthesis). We refer to the value matched for subexpression <n> as $<n>.
 * For example, matching the above expression to
 * <pre>
 *     http://www.ics.uci.edu/pub/ietf/uri/#Related
 * </pre>
 * results in the following subexpression matches:
 * <pre>
 *    $1 = http:
 *    $2 = http
 *    $3 = //www.ics.uci.edu
 *    $4 = www.ics.uci.edu
 *    $5 = /pub/ietf/uri/
 *    $6 = <undefined>
 *    $7 = <undefined>
 *    $8 = #Related
 *    $9 = Related
 * </pre>
 * where <undefined> indicates that the component is not present, as is the
 * case for the query component in the above example. Therefore, we can
 * determine the value of the five components as
 * <pre>
 *    scheme    = $2
 *    authority = $4
 *    path      = $5
 *    query     = $7
 *    fragment  = $9
 * </pre>
 *
 * <p>msamuel: I have modified the regular expression slightly to expose the
 * credentials, domain, and port separately from the authority.
 * The modified version yields
 * <pre>
 *    $1 = http              scheme
 *    $2 = <undefined>       credentials -\
 *    $3 = www.ics.uci.edu   domain       | authority
 *    $4 = <undefined>       port        -/
 *    $5 = /pub/ietf/uri/    path
 *    $6 = <undefined>       query without ?
 *    $7 = Related           fragment without #
 * </pre>
 */
var URI_RE_ = new RegExp(
      "^" +
      "(?:" +
        "([^:/?#]+)" +         // scheme
      ":)?" +
      "(?://" +
        "(?:([^/?#]*)@)?" +    // credentials
        "([^/?#:@]*)" +        // domain
        "(?::([0-9]+))?" +     // port
      ")?" +
      "([^?#]+)?" +            // path
      "(?:\\?([^#]*))?" +      // query
      "(?:#(.*))?" +           // fragment
      "$"
      );

var URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_ = /[#\/\?@]/g;
var URI_DISALLOWED_IN_PATH_ = /[\#\?]/g;

URI.parse = parse;
URI.create = create;
URI.resolve = resolve;
URI.collapse_dots = collapse_dots;  // Visible for testing.

// lightweight string-based api for loadModuleMaker
URI.utils = {
  mimeTypeOf: function (uri) {
    var uriObj = parse(uri);
    if (/\.html$/.test(uriObj.getPath())) {
      return 'text/html';
    } else {
      return 'application/javascript';
    }
  },
  resolve: function (base, uri) {
    if (base) {
      return resolve(parse(base), parse(uri)).toString();
    } else {
      return '' + uri;
    }
  }
};


return URI;
})();

// Copyright Google Inc.
// Licensed under the Apache Licence Version 2.0
// Autogenerated at Mon Feb 25 13:05:42 EST 2013
// @overrides window
// @provides html4
var html4 = {};
html4.atype = {
  'NONE': 0,
  'URI': 1,
  'URI_FRAGMENT': 11,
  'SCRIPT': 2,
  'STYLE': 3,
  'HTML': 12,
  'ID': 4,
  'IDREF': 5,
  'IDREFS': 6,
  'GLOBAL_NAME': 7,
  'LOCAL_NAME': 8,
  'CLASSES': 9,
  'FRAME_TARGET': 10,
  'MEDIA_QUERY': 13
};
html4[ 'atype' ] = html4.atype;
html4.ATTRIBS = {
  '*::class': 9,
  '*::dir': 0,
  '*::draggable': 0,
  '*::hidden': 0,
  '*::id': 4,
  '*::inert': 0,
  '*::itemprop': 0,
  '*::itemref': 6,
  '*::itemscope': 0,
  '*::lang': 0,
  '*::onblur': 2,
  '*::onchange': 2,
  '*::onclick': 2,
  '*::ondblclick': 2,
  '*::onfocus': 2,
  '*::onkeydown': 2,
  '*::onkeypress': 2,
  '*::onkeyup': 2,
  '*::onload': 2,
  '*::onmousedown': 2,
  '*::onmousemove': 2,
  '*::onmouseout': 2,
  '*::onmouseover': 2,
  '*::onmouseup': 2,
  '*::onreset': 2,
  '*::onscroll': 2,
  '*::onselect': 2,
  '*::onsubmit': 2,
  '*::onunload': 2,
  '*::spellcheck': 0,
  '*::style': 3,
  '*::title': 0,
  '*::translate': 0,
  'a::accesskey': 0,
  'a::coords': 0,
  'a::href': 1,
  'a::hreflang': 0,
  'a::name': 7,
  'a::onblur': 2,
  'a::onfocus': 2,
  'a::shape': 0,
  'a::tabindex': 0,
  'a::target': 10,
  'a::type': 0,
  'area::accesskey': 0,
  'area::alt': 0,
  'area::coords': 0,
  'area::href': 1,
  'area::nohref': 0,
  'area::onblur': 2,
  'area::onfocus': 2,
  'area::shape': 0,
  'area::tabindex': 0,
  'area::target': 10,
  'audio::controls': 0,
  'audio::loop': 0,
  'audio::mediagroup': 5,
  'audio::muted': 0,
  'audio::preload': 0,
  'bdo::dir': 0,
  'blockquote::cite': 1,
  'br::clear': 0,
  'button::accesskey': 0,
  'button::disabled': 0,
  'button::name': 8,
  'button::onblur': 2,
  'button::onfocus': 2,
  'button::tabindex': 0,
  'button::type': 0,
  'button::value': 0,
  'canvas::height': 0,
  'canvas::width': 0,
  'caption::align': 0,
  'col::align': 0,
  'col::char': 0,
  'col::charoff': 0,
  'col::span': 0,
  'col::valign': 0,
  'col::width': 0,
  'colgroup::align': 0,
  'colgroup::char': 0,
  'colgroup::charoff': 0,
  'colgroup::span': 0,
  'colgroup::valign': 0,
  'colgroup::width': 0,
  'command::checked': 0,
  'command::command': 5,
  'command::disabled': 0,
  'command::icon': 1,
  'command::label': 0,
  'command::radiogroup': 0,
  'command::type': 0,
  'data::value': 0,
  'del::cite': 1,
  'del::datetime': 0,
  'details::open': 0,
  'dir::compact': 0,
  'div::align': 0,
  'dl::compact': 0,
  'fieldset::disabled': 0,
  'font::color': 0,
  'font::face': 0,
  'font::size': 0,
  'form::accept': 0,
  'form::action': 1,
  'form::autocomplete': 0,
  'form::enctype': 0,
  'form::method': 0,
  'form::name': 7,
  'form::novalidate': 0,
  'form::onreset': 2,
  'form::onsubmit': 2,
  'form::target': 10,
  'h1::align': 0,
  'h2::align': 0,
  'h3::align': 0,
  'h4::align': 0,
  'h5::align': 0,
  'h6::align': 0,
  'hr::align': 0,
  'hr::noshade': 0,
  'hr::size': 0,
  'hr::width': 0,
  'iframe::align': 0,
  'iframe::frameborder': 0,
  'iframe::height': 0,
  'iframe::marginheight': 0,
  'iframe::marginwidth': 0,
  'iframe::width': 0,
  'img::align': 0,
  'img::alt': 0,
  'img::border': 0,
  'img::height': 0,
  'img::hspace': 0,
  'img::ismap': 0,
  'img::name': 7,
  'img::src': 1,
  'img::usemap': 11,
  'img::vspace': 0,
  'img::width': 0,
  'input::accept': 0,
  'input::accesskey': 0,
  'input::align': 0,
  'input::alt': 0,
  'input::autocomplete': 0,
  'input::checked': 0,
  'input::disabled': 0,
  'input::inputmode': 0,
  'input::ismap': 0,
  'input::list': 5,
  'input::max': 0,
  'input::maxlength': 0,
  'input::min': 0,
  'input::multiple': 0,
  'input::name': 8,
  'input::onblur': 2,
  'input::onchange': 2,
  'input::onfocus': 2,
  'input::onselect': 2,
  'input::placeholder': 0,
  'input::readonly': 0,
  'input::required': 0,
  'input::size': 0,
  'input::src': 1,
  'input::step': 0,
  'input::tabindex': 0,
  'input::type': 0,
  'input::usemap': 11,
  'input::value': 0,
  'ins::cite': 1,
  'ins::datetime': 0,
  'label::accesskey': 0,
  'label::for': 5,
  'label::onblur': 2,
  'label::onfocus': 2,
  'legend::accesskey': 0,
  'legend::align': 0,
  'li::type': 0,
  'li::value': 0,
  'map::name': 7,
  'menu::compact': 0,
  'menu::label': 0,
  'menu::type': 0,
  'meter::high': 0,
  'meter::low': 0,
  'meter::max': 0,
  'meter::min': 0,
  'meter::value': 0,
  'ol::compact': 0,
  'ol::reversed': 0,
  'ol::start': 0,
  'ol::type': 0,
  'optgroup::disabled': 0,
  'optgroup::label': 0,
  'option::disabled': 0,
  'option::label': 0,
  'option::selected': 0,
  'option::value': 0,
  'output::for': 6,
  'output::name': 8,
  'p::align': 0,
  'pre::width': 0,
  'progress::max': 0,
  'progress::min': 0,
  'progress::value': 0,
  'q::cite': 1,
  'select::autocomplete': 0,
  'select::disabled': 0,
  'select::multiple': 0,
  'select::name': 8,
  'select::onblur': 2,
  'select::onchange': 2,
  'select::onfocus': 2,
  'select::required': 0,
  'select::size': 0,
  'select::tabindex': 0,
  'source::type': 0,
  'table::align': 0,
  'table::bgcolor': 0,
  'table::border': 0,
  'table::cellpadding': 0,
  'table::cellspacing': 0,
  'table::frame': 0,
  'table::rules': 0,
  'table::summary': 0,
  'table::width': 0,
  'tbody::align': 0,
  'tbody::char': 0,
  'tbody::charoff': 0,
  'tbody::valign': 0,
  'td::abbr': 0,
  'td::align': 0,
  'td::axis': 0,
  'td::bgcolor': 0,
  'td::char': 0,
  'td::charoff': 0,
  'td::colspan': 0,
  'td::headers': 6,
  'td::height': 0,
  'td::nowrap': 0,
  'td::rowspan': 0,
  'td::scope': 0,
  'td::valign': 0,
  'td::width': 0,
  'textarea::accesskey': 0,
  'textarea::autocomplete': 0,
  'textarea::cols': 0,
  'textarea::disabled': 0,
  'textarea::inputmode': 0,
  'textarea::name': 8,
  'textarea::onblur': 2,
  'textarea::onchange': 2,
  'textarea::onfocus': 2,
  'textarea::onselect': 2,
  'textarea::placeholder': 0,
  'textarea::readonly': 0,
  'textarea::required': 0,
  'textarea::rows': 0,
  'textarea::tabindex': 0,
  'textarea::wrap': 0,
  'tfoot::align': 0,
  'tfoot::char': 0,
  'tfoot::charoff': 0,
  'tfoot::valign': 0,
  'th::abbr': 0,
  'th::align': 0,
  'th::axis': 0,
  'th::bgcolor': 0,
  'th::char': 0,
  'th::charoff': 0,
  'th::colspan': 0,
  'th::headers': 6,
  'th::height': 0,
  'th::nowrap': 0,
  'th::rowspan': 0,
  'th::scope': 0,
  'th::valign': 0,
  'th::width': 0,
  'thead::align': 0,
  'thead::char': 0,
  'thead::charoff': 0,
  'thead::valign': 0,
  'tr::align': 0,
  'tr::bgcolor': 0,
  'tr::char': 0,
  'tr::charoff': 0,
  'tr::valign': 0,
  'track::default': 0,
  'track::kind': 0,
  'track::label': 0,
  'track::srclang': 0,
  'ul::compact': 0,
  'ul::type': 0,
  'video::controls': 0,
  'video::height': 0,
  'video::loop': 0,
  'video::mediagroup': 5,
  'video::muted': 0,
  'video::poster': 1,
  'video::preload': 0,
  'video::width': 0
};
html4[ 'ATTRIBS' ] = html4.ATTRIBS;
html4.eflags = {
  'OPTIONAL_ENDTAG': 1,
  'EMPTY': 2,
  'CDATA': 4,
  'RCDATA': 8,
  'UNSAFE': 16,
  'FOLDABLE': 32,
  'SCRIPT': 64,
  'STYLE': 128,
  'VIRTUALIZED': 256
};
html4[ 'eflags' ] = html4.eflags;
html4.ELEMENTS = {
  'a': 0,
  'abbr': 0,
  'acronym': 0,
  'address': 0,
  'applet': 272,
  'area': 2,
  'article': 0,
  'aside': 0,
  'audio': 0,
  'b': 0,
  'base': 274,
  'basefont': 274,
  'bdi': 0,
  'bdo': 0,
  'big': 0,
  'blockquote': 0,
  'body': 305,
  'br': 2,
  'button': 0,
  'canvas': 0,
  'caption': 0,
  'center': 0,
  'cite': 0,
  'code': 0,
  'col': 2,
  'colgroup': 1,
  'command': 2,
  'data': 0,
  'datalist': 0,
  'dd': 1,
  'del': 0,
  'details': 0,
  'dfn': 0,
  'dialog': 272,
  'dir': 0,
  'div': 0,
  'dl': 0,
  'dt': 1,
  'em': 0,
  'fieldset': 0,
  'figcaption': 0,
  'figure': 0,
  'font': 0,
  'footer': 0,
  'form': 0,
  'frame': 274,
  'frameset': 272,
  'h1': 0,
  'h2': 0,
  'h3': 0,
  'h4': 0,
  'h5': 0,
  'h6': 0,
  'head': 305,
  'header': 0,
  'hgroup': 0,
  'hr': 2,
  'html': 305,
  'i': 0,
  'iframe': 4,
  'img': 2,
  'input': 2,
  'ins': 0,
  'isindex': 274,
  'kbd': 0,
  'keygen': 274,
  'label': 0,
  'legend': 0,
  'li': 1,
  'link': 274,
  'map': 0,
  'mark': 0,
  'menu': 0,
  'meta': 274,
  'meter': 0,
  'nav': 0,
  'nobr': 0,
  'noembed': 276,
  'noframes': 276,
  'noscript': 276,
  'object': 272,
  'ol': 0,
  'optgroup': 0,
  'option': 1,
  'output': 0,
  'p': 1,
  'param': 274,
  'pre': 0,
  'progress': 0,
  'q': 0,
  's': 0,
  'samp': 0,
  'script': 84,
  'section': 0,
  'select': 0,
  'small': 0,
  'source': 2,
  'span': 0,
  'strike': 0,
  'strong': 0,
  'style': 148,
  'sub': 0,
  'summary': 0,
  'sup': 0,
  'table': 0,
  'tbody': 1,
  'td': 1,
  'textarea': 8,
  'tfoot': 1,
  'th': 1,
  'thead': 1,
  'time': 0,
  'title': 280,
  'tr': 1,
  'track': 2,
  'tt': 0,
  'u': 0,
  'ul': 0,
  'var': 0,
  'video': 0,
  'wbr': 2
};
html4[ 'ELEMENTS' ] = html4.ELEMENTS;
html4.ELEMENT_DOM_INTERFACES = {
  'a': 'HTMLAnchorElement',
  'abbr': 'HTMLElement',
  'acronym': 'HTMLElement',
  'address': 'HTMLElement',
  'applet': 'HTMLAppletElement',
  'area': 'HTMLAreaElement',
  'article': 'HTMLElement',
  'aside': 'HTMLElement',
  'audio': 'HTMLAudioElement',
  'b': 'HTMLElement',
  'base': 'HTMLBaseElement',
  'basefont': 'HTMLBaseFontElement',
  'bdi': 'HTMLElement',
  'bdo': 'HTMLElement',
  'big': 'HTMLElement',
  'blockquote': 'HTMLQuoteElement',
  'body': 'HTMLBodyElement',
  'br': 'HTMLBRElement',
  'button': 'HTMLButtonElement',
  'canvas': 'HTMLCanvasElement',
  'caption': 'HTMLTableCaptionElement',
  'center': 'HTMLElement',
  'cite': 'HTMLElement',
  'code': 'HTMLElement',
  'col': 'HTMLTableColElement',
  'colgroup': 'HTMLTableColElement',
  'command': 'HTMLCommandElement',
  'data': 'HTMLElement',
  'datalist': 'HTMLDataListElement',
  'dd': 'HTMLElement',
  'del': 'HTMLModElement',
  'details': 'HTMLDetailsElement',
  'dfn': 'HTMLElement',
  'dialog': 'HTMLDialogElement',
  'dir': 'HTMLDirectoryElement',
  'div': 'HTMLDivElement',
  'dl': 'HTMLDListElement',
  'dt': 'HTMLElement',
  'em': 'HTMLElement',
  'fieldset': 'HTMLFieldSetElement',
  'figcaption': 'HTMLElement',
  'figure': 'HTMLElement',
  'font': 'HTMLFontElement',
  'footer': 'HTMLElement',
  'form': 'HTMLFormElement',
  'frame': 'HTMLFrameElement',
  'frameset': 'HTMLFrameSetElement',
  'h1': 'HTMLHeadingElement',
  'h2': 'HTMLHeadingElement',
  'h3': 'HTMLHeadingElement',
  'h4': 'HTMLHeadingElement',
  'h5': 'HTMLHeadingElement',
  'h6': 'HTMLHeadingElement',
  'head': 'HTMLHeadElement',
  'header': 'HTMLElement',
  'hgroup': 'HTMLElement',
  'hr': 'HTMLHRElement',
  'html': 'HTMLHtmlElement',
  'i': 'HTMLElement',
  'iframe': 'HTMLIFrameElement',
  'img': 'HTMLImageElement',
  'input': 'HTMLInputElement',
  'ins': 'HTMLModElement',
  'isindex': 'HTMLUnknownElement',
  'kbd': 'HTMLElement',
  'keygen': 'HTMLKeygenElement',
  'label': 'HTMLLabelElement',
  'legend': 'HTMLLegendElement',
  'li': 'HTMLLIElement',
  'link': 'HTMLLinkElement',
  'map': 'HTMLMapElement',
  'mark': 'HTMLElement',
  'menu': 'HTMLMenuElement',
  'meta': 'HTMLMetaElement',
  'meter': 'HTMLMeterElement',
  'nav': 'HTMLElement',
  'nobr': 'HTMLElement',
  'noembed': 'HTMLElement',
  'noframes': 'HTMLElement',
  'noscript': 'HTMLElement',
  'object': 'HTMLObjectElement',
  'ol': 'HTMLOListElement',
  'optgroup': 'HTMLOptGroupElement',
  'option': 'HTMLOptionElement',
  'output': 'HTMLOutputElement',
  'p': 'HTMLParagraphElement',
  'param': 'HTMLParamElement',
  'pre': 'HTMLPreElement',
  'progress': 'HTMLProgressElement',
  'q': 'HTMLQuoteElement',
  's': 'HTMLElement',
  'samp': 'HTMLElement',
  'script': 'HTMLScriptElement',
  'section': 'HTMLElement',
  'select': 'HTMLSelectElement',
  'small': 'HTMLElement',
  'source': 'HTMLSourceElement',
  'span': 'HTMLSpanElement',
  'strike': 'HTMLElement',
  'strong': 'HTMLElement',
  'style': 'HTMLStyleElement',
  'sub': 'HTMLElement',
  'summary': 'HTMLElement',
  'sup': 'HTMLElement',
  'table': 'HTMLTableElement',
  'tbody': 'HTMLTableSectionElement',
  'td': 'HTMLTableDataCellElement',
  'textarea': 'HTMLTextAreaElement',
  'tfoot': 'HTMLTableSectionElement',
  'th': 'HTMLTableHeaderCellElement',
  'thead': 'HTMLTableSectionElement',
  'time': 'HTMLTimeElement',
  'title': 'HTMLTitleElement',
  'tr': 'HTMLTableRowElement',
  'track': 'HTMLTrackElement',
  'tt': 'HTMLElement',
  'u': 'HTMLElement',
  'ul': 'HTMLUListElement',
  'var': 'HTMLElement',
  'video': 'HTMLVideoElement',
  'wbr': 'HTMLElement'
};
html4[ 'ELEMENT_DOM_INTERFACES' ] = html4.ELEMENT_DOM_INTERFACES;
html4.ueffects = {
  'NOT_LOADED': 0,
  'SAME_DOCUMENT': 1,
  'NEW_DOCUMENT': 2
};
html4[ 'ueffects' ] = html4.ueffects;
html4.URIEFFECTS = {
  'a::href': 2,
  'area::href': 2,
  'blockquote::cite': 0,
  'command::icon': 1,
  'del::cite': 0,
  'form::action': 2,
  'img::src': 1,
  'input::src': 1,
  'ins::cite': 0,
  'q::cite': 0,
  'video::poster': 1
};
html4[ 'URIEFFECTS' ] = html4.URIEFFECTS;
html4.ltypes = {
  'UNSANDBOXED': 2,
  'SANDBOXED': 1,
  'DATA': 0
};
html4[ 'ltypes' ] = html4.ltypes;
html4.LOADERTYPES = {
  'a::href': 2,
  'area::href': 2,
  'blockquote::cite': 2,
  'command::icon': 1,
  'del::cite': 2,
  'form::action': 2,
  'img::src': 1,
  'input::src': 1,
  'ins::cite': 2,
  'q::cite': 2,
  'video::poster': 1
};
html4[ 'LOADERTYPES' ] = html4.LOADERTYPES;

// Copyright (C) 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview
 * An HTML sanitizer that can satisfy a variety of security policies.
 *
 * <p>
 * The HTML sanitizer is built around a SAX parser and HTML element and
 * attributes schemas.
 *
 * If the cssparser is loaded, inline styles are sanitized using the
 * css property and value schemas.  Else they are remove during
 * sanitization.
 *
 * If it exists, uses parseCssDeclarations, sanitizeCssProperty,  cssSchema
 *
 * @author mikesamuel@gmail.com
 * @author jasvir@gmail.com
 * \@requires html4, URI
 * \@overrides window
 * \@provides html, html_sanitize
 */

// The Turkish i seems to be a non-issue, but abort in case it is.
if ('I'.toLowerCase() !== 'i') { throw 'I/i problem'; }

/**
 * \@namespace
 */
var html = (function(html4) {

  // For closure compiler
  var parseCssDeclarations, sanitizeCssProperty, cssSchema;
  if ('undefined' !== typeof window) {
    parseCssDeclarations = window['parseCssDeclarations'];
    sanitizeCssProperty = window['sanitizeCssProperty'];
    cssSchema = window['cssSchema'];
  }

  // The keys of this object must be 'quoted' or JSCompiler will mangle them!
  // This is a partial list -- lookupEntity() uses the host browser's parser
  // (when available) to implement full entity lookup.
  // Note that entities are in general case-sensitive; the uppercase ones are
  // explicitly defined by HTML5 (presumably as compatibility).
  var ENTITIES = {
    'lt': '<',
    'LT': '<',
    'gt': '>',
    'GT': '>',
    'amp': '&',
    'AMP': '&',
    'quot': '"',
    'apos': '\'',
    'nbsp': '\240'
  };

  // Patterns for types of entity/character reference names.
  var decimalEscapeRe = /^#(\d+)$/;
  var hexEscapeRe = /^#x([0-9A-Fa-f]+)$/;
  // contains every entity per http://www.w3.org/TR/2011/WD-html5-20110113/named-character-references.html
  var safeEntityNameRe = /^[A-Za-z][A-za-z0-9]+$/;
  // Used as a hook to invoke the browser's entity parsing. <textarea> is used
  // because its content is parsed for entities but not tags.
  // TODO(kpreid): This retrieval is a kludge and leads to silent loss of
  // functionality if the document isn't available.
  var entityLookupElement =
      ('undefined' !== typeof window && window['document'])
          ? window['document'].createElement('textarea') : null;
  /**
   * Decodes an HTML entity.
   *
   * {\@updoc
   * $ lookupEntity('lt')
   * # '<'
   * $ lookupEntity('GT')
   * # '>'
   * $ lookupEntity('amp')
   * # '&'
   * $ lookupEntity('nbsp')
   * # '\xA0'
   * $ lookupEntity('apos')
   * # "'"
   * $ lookupEntity('quot')
   * # '"'
   * $ lookupEntity('#xa')
   * # '\n'
   * $ lookupEntity('#10')
   * # '\n'
   * $ lookupEntity('#x0a')
   * # '\n'
   * $ lookupEntity('#010')
   * # '\n'
   * $ lookupEntity('#x00A')
   * # '\n'
   * $ lookupEntity('Pi')      // Known failure
   * # '\u03A0'
   * $ lookupEntity('pi')      // Known failure
   * # '\u03C0'
   * }
   *
   * @param {string} name the content between the '&' and the ';'.
   * @return {string} a single unicode code-point as a string.
   */
  function lookupEntity(name) {
    // TODO: entity lookup as specified by HTML5 actually depends on the
    // presence of the ";".
    if (ENTITIES.hasOwnProperty(name)) { return ENTITIES[name]; }
    var m = name.match(decimalEscapeRe);
    if (m) {
      return String.fromCharCode(parseInt(m[1], 10));
    } else if (!!(m = name.match(hexEscapeRe))) {
      return String.fromCharCode(parseInt(m[1], 16));
    } else if (entityLookupElement && safeEntityNameRe.test(name)) {
      entityLookupElement.innerHTML = '&' + name + ';';
      var text = entityLookupElement.textContent;
      ENTITIES[name] = text;
      return text;
    } else {
      return '&' + name + ';';
    }
  }

  function decodeOneEntity(_, name) {
    return lookupEntity(name);
  }

  var nulRe = /\0/g;
  function stripNULs(s) {
    return s.replace(nulRe, '');
  }

  var ENTITY_RE_1 = /&(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/g;
  var ENTITY_RE_2 = /^(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/;
  /**
   * The plain text of a chunk of HTML CDATA which possibly containing.
   *
   * {\@updoc
   * $ unescapeEntities('')
   * # ''
   * $ unescapeEntities('hello World!')
   * # 'hello World!'
   * $ unescapeEntities('1 &lt; 2 &amp;&AMP; 4 &gt; 3&#10;')
   * # '1 < 2 && 4 > 3\n'
   * $ unescapeEntities('&lt;&lt <- unfinished entity&gt;')
   * # '<&lt <- unfinished entity>'
   * $ unescapeEntities('/foo?bar=baz&copy=true')  // & often unescaped in URLS
   * # '/foo?bar=baz&copy=true'
   * $ unescapeEntities('pi=&pi;&#x3c0;, Pi=&Pi;\u03A0') // FIXME: known failure
   * # 'pi=\u03C0\u03c0, Pi=\u03A0\u03A0'
   * }
   *
   * @param {string} s a chunk of HTML CDATA.  It must not start or end inside
   *     an HTML entity.
   */
  function unescapeEntities(s) {
    return s.replace(ENTITY_RE_1, decodeOneEntity);
  }

  var ampRe = /&/g;
  var looseAmpRe = /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi;
  var ltRe = /[<]/g;
  var gtRe = />/g;
  var quotRe = /\"/g;

  /**
   * Escapes HTML special characters in attribute values.
   *
   * {\@updoc
   * $ escapeAttrib('')
   * # ''
   * $ escapeAttrib('"<<&==&>>"')  // Do not just escape the first occurrence.
   * # '&#34;&lt;&lt;&amp;&#61;&#61;&amp;&gt;&gt;&#34;'
   * $ escapeAttrib('Hello <World>!')
   * # 'Hello &lt;World&gt;!'
   * }
   */
  function escapeAttrib(s) {
    return ('' + s).replace(ampRe, '&amp;').replace(ltRe, '&lt;')
        .replace(gtRe, '&gt;').replace(quotRe, '&#34;');
  }

  /**
   * Escape entities in RCDATA that can be escaped without changing the meaning.
   * {\@updoc
   * $ normalizeRCData('1 < 2 &&amp; 3 > 4 &amp;& 5 &lt; 7&8')
   * # '1 &lt; 2 &amp;&amp; 3 &gt; 4 &amp;&amp; 5 &lt; 7&amp;8'
   * }
   */
  function normalizeRCData(rcdata) {
    return rcdata
        .replace(looseAmpRe, '&amp;$1')
        .replace(ltRe, '&lt;')
        .replace(gtRe, '&gt;');
  }

  // TODO(felix8a): validate sanitizer regexs against the HTML5 grammar at
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/syntax.html
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tree-construction.html

  // We initially split input so that potentially meaningful characters
  // like '<' and '>' are separate tokens, using a fast dumb process that
  // ignores quoting.  Then we walk that token stream, and when we see a
  // '<' that's the start of a tag, we use ATTR_RE to extract tag
  // attributes from the next token.  That token will never have a '>'
  // character.  However, it might have an unbalanced quote character, and
  // when we see that, we combine additional tokens to balance the quote.

  var ATTR_RE = new RegExp(
    '^\\s*' +
    '([-.:\\w]+)' +             // 1 = Attribute name
    '(?:' + (
      '\\s*(=)\\s*' +           // 2 = Is there a value?
      '(' + (                   // 3 = Attribute value
        // TODO(felix8a): maybe use backref to match quotes
        '(\")[^\"]*(\"|$)' +    // 4, 5 = Double-quoted string
        '|' +
        '(\')[^\']*(\'|$)' +    // 6, 7 = Single-quoted string
        '|' +
        // Positive lookahead to prevent interpretation of
        // <foo a= b=c> as <foo a='b=c'>
        // TODO(felix8a): might be able to drop this case
        '(?=[a-z][-\\w]*\\s*=)' +
        '|' +
        // Unquoted value that isn't an attribute name
        // (since we didn't match the positive lookahead above)
        '[^\"\'\\s]*' ) +
      ')' ) +
    ')?',
    'i');

  // false on IE<=8, true on most other browsers
  var splitWillCapture = ('a,b'.split(/(,)/).length === 3);

  // bitmask for tags with special parsing, like <script> and <textarea>
  var EFLAGS_TEXT = html4.eflags['CDATA'] | html4.eflags['RCDATA'];

  /**
   * Given a SAX-like event handler, produce a function that feeds those
   * events and a parameter to the event handler.
   *
   * The event handler has the form:{@code
   * {
   *   // Name is an upper-case HTML tag name.  Attribs is an array of
   *   // alternating upper-case attribute names, and attribute values.  The
   *   // attribs array is reused by the parser.  Param is the value passed to
   *   // the saxParser.
   *   startTag: function (name, attribs, param) { ... },
   *   endTag:   function (name, param) { ... },
   *   pcdata:   function (text, param) { ... },
   *   rcdata:   function (text, param) { ... },
   *   cdata:    function (text, param) { ... },
   *   startDoc: function (param) { ... },
   *   endDoc:   function (param) { ... }
   * }}
   *
   * @param {Object} handler a record containing event handlers.
   * @return {function(string, Object)} A function that takes a chunk of HTML
   *     and a parameter.  The parameter is passed on to the handler methods.
   */
  function makeSaxParser(handler) {
    // Accept quoted or unquoted keys (Closure compat)
    var hcopy = {
      cdata: handler.cdata || handler['cdata'],
      comment: handler.comment || handler['comment'],
      endDoc: handler.endDoc || handler['endDoc'],
      endTag: handler.endTag || handler['endTag'],
      pcdata: handler.pcdata || handler['pcdata'],
      rcdata: handler.rcdata || handler['rcdata'],
      startDoc: handler.startDoc || handler['startDoc'],
      startTag: handler.startTag || handler['startTag']
    };
    return function(htmlText, param) {
      return parse(htmlText, hcopy, param);
    };
  }

  // Parsing strategy is to split input into parts that might be lexically
  // meaningful (every ">" becomes a separate part), and then recombine
  // parts if we discover they're in a different context.

  // TODO(felix8a): Significant performance regressions from -legacy,
  // tested on
  //    Chrome 18.0
  //    Firefox 11.0
  //    IE 6, 7, 8, 9
  //    Opera 11.61
  //    Safari 5.1.3
  // Many of these are unusual patterns that are linearly slower and still
  // pretty fast (eg 1ms to 5ms), so not necessarily worth fixing.

  // TODO(felix8a): "<script> && && && ... <\/script>" is slower on all
  // browsers.  The hotspot is htmlSplit.

  // TODO(felix8a): "<p title='>>>>...'><\/p>" is slower on all browsers.
  // This is partly htmlSplit, but the hotspot is parseTagAndAttrs.

  // TODO(felix8a): "<a><\/a><a><\/a>..." is slower on IE9.
  // "<a>1<\/a><a>1<\/a>..." is faster, "<a><\/a>2<a><\/a>2..." is faster.

  // TODO(felix8a): "<p<p<p..." is slower on IE[6-8]

  var continuationMarker = {};
  function parse(htmlText, handler, param) {
    var m, p, tagName;
    var parts = htmlSplit(htmlText);
    var state = {
      noMoreGT: false,
      noMoreEndComments: false
    };
    parseCPS(handler, parts, 0, state, param);
  }

  function continuationMaker(h, parts, initial, state, param) {
    return function () {
      parseCPS(h, parts, initial, state, param);
    };
  }

  function parseCPS(h, parts, initial, state, param) {
    try {
      if (h.startDoc && initial == 0) { h.startDoc(param); }
      var m, p, tagName;
      for (var pos = initial, end = parts.length; pos < end;) {
        var current = parts[pos++];
        var next = parts[pos];
        switch (current) {
        case '&':
          if (ENTITY_RE_2.test(next)) {
            if (h.pcdata) {
              h.pcdata('&' + next, param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
            pos++;
          } else {
            if (h.pcdata) { h.pcdata("&amp;", param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '<\/':
          if (m = /^([-\w:]+)[^\'\"]*/.exec(next)) {
            if (m[0].length === next.length && parts[pos + 1] === '>') {
              // fast case, no attribute parsing needed
              pos += 2;
              tagName = m[1].toLowerCase();
              if (h.endTag) {
                h.endTag(tagName, param, continuationMarker,
                  continuationMaker(h, parts, pos, state, param));
              }
            } else {
              // slow case, need to parse attributes
              // TODO(felix8a): do we really care about misparsing this?
              pos = parseEndTag(
                parts, pos, h, param, continuationMarker, state);
            }
          } else {
            if (h.pcdata) {
              h.pcdata('&lt;/', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '<':
          if (m = /^([-\w:]+)\s*\/?/.exec(next)) {
            if (m[0].length === next.length && parts[pos + 1] === '>') {
              // fast case, no attribute parsing needed
              pos += 2;
              tagName = m[1].toLowerCase();
              if (h.startTag) {
                h.startTag(tagName, [], param, continuationMarker,
                  continuationMaker(h, parts, pos, state, param));
              }
              // tags like <script> and <textarea> have special parsing
              var eflags = html4.ELEMENTS[tagName];
              if (eflags & EFLAGS_TEXT) {
                var tag = { name: tagName, next: pos, eflags: eflags };
                pos = parseText(
                  parts, tag, h, param, continuationMarker, state);
              }
            } else {
              // slow case, need to parse attributes
              pos = parseStartTag(
                parts, pos, h, param, continuationMarker, state);
            }
          } else {
            if (h.pcdata) {
              h.pcdata('&lt;', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '<\!--':
          // The pathological case is n copies of '<\!--' without '-->', and
          // repeated failure to find '-->' is quadratic.  We avoid that by
          // remembering when search for '-->' fails.
          if (!state.noMoreEndComments) {
            // A comment <\!--x--> is split into three tokens:
            //   '<\!--', 'x--', '>'
            // We want to find the next '>' token that has a preceding '--'.
            // pos is at the 'x--'.
            for (p = pos + 1; p < end; p++) {
              if (parts[p] === '>' && /--$/.test(parts[p - 1])) { break; }
            }
            if (p < end) {
              if (h.comment) {
                var comment = parts.slice(pos, p).join('');
                h.comment(
                  comment.substr(0, comment.length - 2), param,
                  continuationMarker,
                  continuationMaker(h, parts, p + 1, state, param));
              }
              pos = p + 1;
            } else {
              state.noMoreEndComments = true;
            }
          }
          if (state.noMoreEndComments) {
            if (h.pcdata) {
              h.pcdata('&lt;!--', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '<\!':
          if (!/^\w/.test(next)) {
            if (h.pcdata) {
              h.pcdata('&lt;!', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          } else {
            // similar to noMoreEndComment logic
            if (!state.noMoreGT) {
              for (p = pos + 1; p < end; p++) {
                if (parts[p] === '>') { break; }
              }
              if (p < end) {
                pos = p + 1;
              } else {
                state.noMoreGT = true;
              }
            }
            if (state.noMoreGT) {
              if (h.pcdata) {
                h.pcdata('&lt;!', param, continuationMarker,
                  continuationMaker(h, parts, pos, state, param));
              }
            }
          }
          break;
        case '<?':
          // similar to noMoreEndComment logic
          if (!state.noMoreGT) {
            for (p = pos + 1; p < end; p++) {
              if (parts[p] === '>') { break; }
            }
            if (p < end) {
              pos = p + 1;
            } else {
              state.noMoreGT = true;
            }
          }
          if (state.noMoreGT) {
            if (h.pcdata) {
              h.pcdata('&lt;?', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '>':
          if (h.pcdata) {
            h.pcdata("&gt;", param, continuationMarker,
              continuationMaker(h, parts, pos, state, param));
          }
          break;
        case '':
          break;
        default:
          if (h.pcdata) {
            h.pcdata(current, param, continuationMarker,
              continuationMaker(h, parts, pos, state, param));
          }
          break;
        }
      }
      if (h.endDoc) { h.endDoc(param); }
    } catch (e) {
      if (e !== continuationMarker) { throw e; }
    }
  }

  // Split str into parts for the html parser.
  function htmlSplit(str) {
    // can't hoist this out of the function because of the re.exec loop.
    var re = /(<\/|<\!--|<[!?]|[&<>])/g;
    str += '';
    if (splitWillCapture) {
      return str.split(re);
    } else {
      var parts = [];
      var lastPos = 0;
      var m;
      while ((m = re.exec(str)) !== null) {
        parts.push(str.substring(lastPos, m.index));
        parts.push(m[0]);
        lastPos = m.index + m[0].length;
      }
      parts.push(str.substring(lastPos));
      return parts;
    }
  }

  function parseEndTag(parts, pos, h, param, continuationMarker, state) {
    var tag = parseTagAndAttrs(parts, pos);
    // drop unclosed tags
    if (!tag) { return parts.length; }
    if (h.endTag) {
      h.endTag(tag.name, param, continuationMarker,
        continuationMaker(h, parts, pos, state, param));
    }
    return tag.next;
  }

  function parseStartTag(parts, pos, h, param, continuationMarker, state) {
    var tag = parseTagAndAttrs(parts, pos);
    // drop unclosed tags
    if (!tag) { return parts.length; }
    if (h.startTag) {
      h.startTag(tag.name, tag.attrs, param, continuationMarker,
        continuationMaker(h, parts, tag.next, state, param));
    }
    // tags like <script> and <textarea> have special parsing
    if (tag.eflags & EFLAGS_TEXT) {
      return parseText(parts, tag, h, param, continuationMarker, state);
    } else {
      return tag.next;
    }
  }

  var endTagRe = {};

  // Tags like <script> and <textarea> are flagged as CDATA or RCDATA,
  // which means everything is text until we see the correct closing tag.
  function parseText(parts, tag, h, param, continuationMarker, state) {
    var end = parts.length;
    if (!endTagRe.hasOwnProperty(tag.name)) {
      endTagRe[tag.name] = new RegExp('^' + tag.name + '(?:[\\s\\/]|$)', 'i');
    }
    var re = endTagRe[tag.name];
    var first = tag.next;
    var p = tag.next + 1;
    for (; p < end; p++) {
      if (parts[p - 1] === '<\/' && re.test(parts[p])) { break; }
    }
    if (p < end) { p -= 1; }
    var buf = parts.slice(first, p).join('');
    if (tag.eflags & html4.eflags['CDATA']) {
      if (h.cdata) {
        h.cdata(buf, param, continuationMarker,
          continuationMaker(h, parts, p, state, param));
      }
    } else if (tag.eflags & html4.eflags['RCDATA']) {
      if (h.rcdata) {
        h.rcdata(normalizeRCData(buf), param, continuationMarker,
          continuationMaker(h, parts, p, state, param));
      }
    } else {
      throw new Error('bug');
    }
    return p;
  }

  // at this point, parts[pos-1] is either "<" or "<\/".
  function parseTagAndAttrs(parts, pos) {
    var m = /^([-\w:]+)/.exec(parts[pos]);
    var tag = {};
    tag.name = m[1].toLowerCase();
    tag.eflags = html4.ELEMENTS[tag.name];
    var buf = parts[pos].substr(m[0].length);
    // Find the next '>'.  We optimistically assume this '>' is not in a
    // quoted context, and further down we fix things up if it turns out to
    // be quoted.
    var p = pos + 1;
    var end = parts.length;
    for (; p < end; p++) {
      if (parts[p] === '>') { break; }
      buf += parts[p];
    }
    if (end <= p) { return void 0; }
    var attrs = [];
    while (buf !== '') {
      m = ATTR_RE.exec(buf);
      if (!m) {
        // No attribute found: skip garbage
        buf = buf.replace(/^[\s\S][^a-z\s]*/, '');

      } else if ((m[4] && !m[5]) || (m[6] && !m[7])) {
        // Unterminated quote: slurp to the next unquoted '>'
        var quote = m[4] || m[6];
        var sawQuote = false;
        var abuf = [buf, parts[p++]];
        for (; p < end; p++) {
          if (sawQuote) {
            if (parts[p] === '>') { break; }
          } else if (0 <= parts[p].indexOf(quote)) {
            sawQuote = true;
          }
          abuf.push(parts[p]);
        }
        // Slurp failed: lose the garbage
        if (end <= p) { break; }
        // Otherwise retry attribute parsing
        buf = abuf.join('');
        continue;

      } else {
        // We have an attribute
        var aName = m[1].toLowerCase();
        var aValue = m[2] ? decodeValue(m[3]) : '';
        attrs.push(aName, aValue);
        buf = buf.substr(m[0].length);
      }
    }
    tag.attrs = attrs;
    tag.next = p + 1;
    return tag;
  }

  function decodeValue(v) {
    var q = v.charCodeAt(0);
    if (q === 0x22 || q === 0x27) { // " or '
      v = v.substr(1, v.length - 2);
    }
    return unescapeEntities(stripNULs(v));
  }

  /**
   * Returns a function that strips unsafe tags and attributes from html.
   * @param {function(string, Array.<string>): ?Array.<string>} tagPolicy
   *     A function that takes (tagName, attribs[]), where tagName is a key in
   *     html4.ELEMENTS and attribs is an array of alternating attribute names
   *     and values.  It should return a record (as follows), or null to delete
   *     the element.  It's okay for tagPolicy to modify the attribs array,
   *     but the same array is reused, so it should not be held between calls.
   *     Record keys:
   *        attribs: (required) Sanitized attributes array.
   *        tagName: Replacement tag name.
   * @return {function(string, Array)} A function that sanitizes a string of
   *     HTML and appends result strings to the second argument, an array.
   */
  function makeHtmlSanitizer(tagPolicy) {
    var stack;
    var ignoring;
    var emit = function (text, out) {
      if (!ignoring) { out.push(text); }
    };
    return makeSaxParser({
      'startDoc': function(_) {
        stack = [];
        ignoring = false;
      },
      'startTag': function(tagNameOrig, attribs, out) {
        if (ignoring) { return; }
        if (!html4.ELEMENTS.hasOwnProperty(tagNameOrig)) { return; }
        var eflagsOrig = html4.ELEMENTS[tagNameOrig];
        if (eflagsOrig & html4.eflags['FOLDABLE']) {
          return;
        }

        var decision = tagPolicy(tagNameOrig, attribs);
        if (!decision) {
          ignoring = !(eflagsOrig & html4.eflags['EMPTY']);
          return;
        } else if (typeof decision !== 'object') {
          throw new Error('tagPolicy did not return object (old API?)');
        }
        if ('attribs' in decision) {
          attribs = decision['attribs'];
        } else {
          throw new Error('tagPolicy gave no attribs');
        }
        var eflagsRep;
        var tagNameRep;
        if ('tagName' in decision) {
          tagNameRep = decision['tagName'];
          eflagsRep = html4.ELEMENTS[tagNameRep];
        } else {
          tagNameRep = tagNameOrig;
          eflagsRep = eflagsOrig;
        }
        // TODO(mikesamuel): relying on tagPolicy not to insert unsafe
        // attribute names.

        // If this is an optional-end-tag element and either this element or its
        // previous like sibling was rewritten, then insert a close tag to
        // preserve structure.
        if (eflagsOrig & html4.eflags['OPTIONAL_ENDTAG']) {
          var onStack = stack[stack.length - 1];
          if (onStack && onStack.orig === tagNameOrig &&
              (onStack.rep !== tagNameRep || tagNameOrig !== tagNameRep)) {
                out.push('<\/', onStack.rep, '>');
          }
        }

        if (!(eflagsOrig & html4.eflags['EMPTY'])) {
          stack.push({orig: tagNameOrig, rep: tagNameRep});
        }

        out.push('<', tagNameRep);
        for (var i = 0, n = attribs.length; i < n; i += 2) {
          var attribName = attribs[i],
              value = attribs[i + 1];
          if (value !== null && value !== void 0) {
            out.push(' ', attribName, '="', escapeAttrib(value), '"');
          }
        }
        out.push('>');

        if ((eflagsOrig & html4.eflags['EMPTY'])
            && !(eflagsRep & html4.eflags['EMPTY'])) {
          // replacement is non-empty, synthesize end tag
          out.push('<\/', tagNameRep, '>');
        }
      },
      'endTag': function(tagName, out) {
        if (ignoring) {
          ignoring = false;
          return;
        }
        if (!html4.ELEMENTS.hasOwnProperty(tagName)) { return; }
        var eflags = html4.ELEMENTS[tagName];
        if (!(eflags & (html4.eflags['EMPTY'] | html4.eflags['FOLDABLE']))) {
          var index;
          if (eflags & html4.eflags['OPTIONAL_ENDTAG']) {
            for (index = stack.length; --index >= 0;) {
              var stackElOrigTag = stack[index].orig;
              if (stackElOrigTag === tagName) { break; }
              if (!(html4.ELEMENTS[stackElOrigTag] &
                    html4.eflags['OPTIONAL_ENDTAG'])) {
                // Don't pop non optional end tags looking for a match.
                return;
              }
            }
          } else {
            for (index = stack.length; --index >= 0;) {
              if (stack[index].orig === tagName) { break; }
            }
          }
          if (index < 0) { return; }  // Not opened.
          for (var i = stack.length; --i > index;) {
            var stackElRepTag = stack[i].rep;
            if (!(html4.ELEMENTS[stackElRepTag] &
                  html4.eflags['OPTIONAL_ENDTAG'])) {
              out.push('<\/', stackElRepTag, '>');
            }
          }
          if (index < stack.length) {
            tagName = stack[index].rep;
          }
          stack.length = index;
          out.push('<\/', tagName, '>');
        }
      },
      'pcdata': emit,
      'rcdata': emit,
      'cdata': emit,
      'endDoc': function(out) {
        for (; stack.length; stack.length--) {
          out.push('<\/', stack[stack.length - 1].rep, '>');
        }
      }
    });
  }

  var ALLOWED_URI_SCHEMES = /^(?:https?|mailto|data)$/i;

  function safeUri(uri, effect, ltype, hints, naiveUriRewriter) {
    if (!naiveUriRewriter) { return null; }
    try {
      var parsed = URI.parse('' + uri);
      if (parsed) {
        if (!parsed.hasScheme() ||
            ALLOWED_URI_SCHEMES.test(parsed.getScheme())) {
          var safe = naiveUriRewriter(parsed, effect, ltype, hints);
          return safe ? safe.toString() : null;
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function log(logger, tagName, attribName, oldValue, newValue) {
    if (!attribName) {
      logger(tagName + " removed", {
        change: "removed",
        tagName: tagName
      });
    }
    if (oldValue !== newValue) {
      var changed = "changed";
      if (oldValue && !newValue) {
        changed = "removed";
      } else if (!oldValue && newValue)  {
        changed = "added";
      }
      logger(tagName + "." + attribName + " " + changed, {
        change: changed,
        tagName: tagName,
        attribName: attribName,
        oldValue: oldValue,
        newValue: newValue
      });
    }
  }

  function lookupAttribute(map, tagName, attribName) {
    var attribKey;
    attribKey = tagName + '::' + attribName;
    if (map.hasOwnProperty(attribKey)) {
      return map[attribKey];
    }
    attribKey = '*::' + attribName;
    if (map.hasOwnProperty(attribKey)) {
      return map[attribKey];
    }
    return void 0;
  }
  function getAttributeType(tagName, attribName) {
    return lookupAttribute(html4.ATTRIBS, tagName, attribName);
  }
  function getLoaderType(tagName, attribName) {
    return lookupAttribute(html4.LOADERTYPES, tagName, attribName);
  }
  function getUriEffect(tagName, attribName) {
    return lookupAttribute(html4.URIEFFECTS, tagName, attribName);
  }

  /**
   * Sanitizes attributes on an HTML tag.
   * @param {string} tagName An HTML tag name in lowercase.
   * @param {Array.<?string>} attribs An array of alternating names and values.
   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
   *     apply to URI attributes; it can return a new string value, or null to
   *     delete the attribute.  If unspecified, URI attributes are deleted.
   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
   *     to attributes containing HTML names, element IDs, and space-separated
   *     lists of classes; it can return a new string value, or null to delete
   *     the attribute.  If unspecified, these attributes are kept unchanged.
   * @return {Array.<?string>} The sanitized attributes as a list of alternating
   *     names and values, where a null value means to omit the attribute.
   */
  function sanitizeAttribs(tagName, attribs,
    opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
    // TODO(felix8a): it's obnoxious that domado duplicates much of this
    // TODO(felix8a): maybe consistently enforce constraints like target=
    for (var i = 0; i < attribs.length; i += 2) {
      var attribName = attribs[i];
      var value = attribs[i + 1];
      var oldValue = value;
      var atype = null, attribKey;
      if ((attribKey = tagName + '::' + attribName,
           html4.ATTRIBS.hasOwnProperty(attribKey)) ||
          (attribKey = '*::' + attribName,
           html4.ATTRIBS.hasOwnProperty(attribKey))) {
        atype = html4.ATTRIBS[attribKey];
      }
      if (atype !== null) {
        switch (atype) {
          case html4.atype['NONE']: break;
          case html4.atype['SCRIPT']:
            value = null;
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          case html4.atype['STYLE']:
            if ('undefined' === typeof parseCssDeclarations) {
              value = null;
              if (opt_logger) {
                log(opt_logger, tagName, attribName, oldValue, value);
	      }
              break;
            }
            var sanitizedDeclarations = [];
            parseCssDeclarations(
                value,
                {
                  declaration: function (property, tokens) {
                    var normProp = property.toLowerCase();
                    var schema = cssSchema[normProp];
                    if (!schema) {
                      return;
                    }
                    sanitizeCssProperty(
                        normProp, schema, tokens,
                        opt_naiveUriRewriter
                        ? function (url) {
                            return safeUri(
                                url, html4.ueffects.SAME_DOCUMENT,
                                html4.ltypes.SANDBOXED,
                                {
                                  "TYPE": "CSS",
                                  "CSS_PROP": normProp
                                }, opt_naiveUriRewriter);
                          }
                        : null);
                    sanitizedDeclarations.push(property + ': ' + tokens.join(' '));
                  }
                });
            value = sanitizedDeclarations.length > 0 ?
              sanitizedDeclarations.join(' ; ') : null;
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          case html4.atype['ID']:
          case html4.atype['IDREF']:
          case html4.atype['IDREFS']:
          case html4.atype['GLOBAL_NAME']:
          case html4.atype['LOCAL_NAME']:
          case html4.atype['CLASSES']:
            value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          case html4.atype['URI']:
            value = safeUri(value,
              getUriEffect(tagName, attribName),
              getLoaderType(tagName, attribName),
              {
                "TYPE": "MARKUP",
                "XML_ATTR": attribName,
                "XML_TAG": tagName
              }, opt_naiveUriRewriter);
              if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          case html4.atype['URI_FRAGMENT']:
            if (value && '#' === value.charAt(0)) {
              value = value.substring(1);  // remove the leading '#'
              value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
              if (value !== null && value !== void 0) {
                value = '#' + value;  // restore the leading '#'
              }
            } else {
              value = null;
            }
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          default:
            value = null;
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
        }
      } else {
        value = null;
        if (opt_logger) {
          log(opt_logger, tagName, attribName, oldValue, value);
        }
      }
      attribs[i + 1] = value;
    }
    return attribs;
  }

  /**
   * Creates a tag policy that omits all tags marked UNSAFE in html4-defs.js
   * and applies the default attribute sanitizer with the supplied policy for
   * URI attributes and NMTOKEN attributes.
   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
   *     apply to URI attributes.  If not given, URI attributes are deleted.
   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
   *     to attributes containing HTML names, element IDs, and space-separated
   *     lists of classes.  If not given, such attributes are left unchanged.
   * @return {function(string, Array.<?string>)} A tagPolicy suitable for
   *     passing to html.sanitize.
   */
  function makeTagPolicy(
    opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
    return function(tagName, attribs) {
      if (!(html4.ELEMENTS[tagName] & html4.eflags['UNSAFE'])) {
        return {
          'attribs': sanitizeAttribs(tagName, attribs,
            opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger)
        };
      } else {
        if (opt_logger) {
          log(opt_logger, tagName, undefined, undefined, undefined);
        }
      }
    };
  }

  /**
   * Sanitizes HTML tags and attributes according to a given policy.
   * @param {string} inputHtml The HTML to sanitize.
   * @param {function(string, Array.<?string>)} tagPolicy A function that
   *     decides which tags to accept and sanitizes their attributes (see
   *     makeHtmlSanitizer above for details).
   * @return {string} The sanitized HTML.
   */
  function sanitizeWithPolicy(inputHtml, tagPolicy) {
    var outputArray = [];
    makeHtmlSanitizer(tagPolicy)(inputHtml, outputArray);
    return outputArray.join('');
  }

  /**
   * Strips unsafe tags and attributes from HTML.
   * @param {string} inputHtml The HTML to sanitize.
   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
   *     apply to URI attributes.  If not given, URI attributes are deleted.
   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
   *     to attributes containing HTML names, element IDs, and space-separated
   *     lists of classes.  If not given, such attributes are left unchanged.
   */
  function sanitize(inputHtml,
    opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
    var tagPolicy = makeTagPolicy(
      opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger);
    return sanitizeWithPolicy(inputHtml, tagPolicy);
  }

  // Export both quoted and unquoted names for Closure linkage.
  var html = {};
  html.escapeAttrib = html['escapeAttrib'] = escapeAttrib;
  html.makeHtmlSanitizer = html['makeHtmlSanitizer'] = makeHtmlSanitizer;
  html.makeSaxParser = html['makeSaxParser'] = makeSaxParser;
  html.makeTagPolicy = html['makeTagPolicy'] = makeTagPolicy;
  html.normalizeRCData = html['normalizeRCData'] = normalizeRCData;
  html.sanitize = html['sanitize'] = sanitize;
  html.sanitizeAttribs = html['sanitizeAttribs'] = sanitizeAttribs;
  html.sanitizeWithPolicy = html['sanitizeWithPolicy'] = sanitizeWithPolicy;
  html.unescapeEntities = html['unescapeEntities'] = unescapeEntities;
  return html;
})(html4);

var html_sanitize = html['sanitize'];

// Loosen restrictions of Caja's
// html-sanitizer to allow for styling
html4.ATTRIBS['*::style'] = 0;
html4.ELEMENTS['style'] = 0;
html4.ATTRIBS['a::target'] = 0;
html4.ELEMENTS['video'] = 0;
html4.ATTRIBS['video::src'] = 0;
html4.ATTRIBS['video::poster'] = 0;
html4.ATTRIBS['video::controls'] = 0;
html4.ELEMENTS['audio'] = 0;
html4.ATTRIBS['audio::src'] = 0;
html4.ATTRIBS['video::autoplay'] = 0;
html4.ATTRIBS['video::controls'] = 0;

if (typeof module !== 'undefined') {
    module.exports = html_sanitize;
}

},{}],7:[function(require,module,exports){
module.exports={
  "author": "MapBox",
  "name": "mapbox.js",
  "description": "mapbox javascript api",
  "version": "1.5.0",
  "homepage": "http://mapbox.com/",
  "repository": {
    "type": "git",
    "url": "git://github.com/mapbox/mapbox.js.git"
  },
  "main": "index.js",
  "dependencies": {
    "leaflet": "0.7.0",
    "mustache": "0.7.3",
    "corslite": "0.0.5",
    "json3": "git://github.com/bestiejs/json3.git#v3.2.5a",
    "sanitize-caja": "0.0.0",
    "leaflet-hash": "~0.2.1"
  },
  "scripts": {
    "test": "jshint src/*.js && mocha-phantomjs test/index.html"
  },
  "devDependencies": {
    "leaflet-hash": "git://github.com/mlevans/leaflet-hash.git#b039a3aa4e2492a5c7448075172ac26769e601d6",
    "leaflet-fullscreen": "0.0.0",
    "uglify-js": "2.4.3",
    "mocha": "1.14.0",
    "expect.js": "0.2.0",
    "sinon": "1.7.3",
    "mocha-phantomjs": "3.1.6",
    "happen": "0.1.3",
    "browserify": "2.35.4",
    "jshint": "2.3.0"
  },
  "optionalDependencies": {},
  "engines": {
    "node": "*"
  }
}

},{}],8:[function(require,module,exports){
'use strict';

module.exports = {

    HTTP_URLS: [
        'http://a.tiles.mapbox.com/v3/',
        'http://b.tiles.mapbox.com/v3/',
        'http://c.tiles.mapbox.com/v3/',
        'http://d.tiles.mapbox.com/v3/'],

    FORCE_HTTPS: false,

    HTTPS_URLS: [
        'https://a.tiles.mapbox.com/v3/',
        'https://b.tiles.mapbox.com/v3/',
        'https://c.tiles.mapbox.com/v3/',
        'https://d.tiles.mapbox.com/v3/']
};

},{}],9:[function(require,module,exports){
'use strict';

var util = require('./util'),
    urlhelper = require('./url'),
    request = require('./request');

// Low-level geocoding interface - wraps specific API calls and their
// return values.
module.exports = function(_) {

    var geocoder = {}, url;

    geocoder.getURL = function(_) {
        return url;
    };

    geocoder.setURL = function(_) {
        url = urlhelper.jsonify(_);
        return geocoder;
    };

    geocoder.setID = function(_) {
        util.strict(_, 'string');
        geocoder.setURL(urlhelper.base() + _ + '/geocode/{query}.json');
        return geocoder;
    };

    geocoder.setTileJSON = function(_) {
        util.strict(_, 'object');
        geocoder.setURL(_.geocoder);
        return geocoder;
    };

    geocoder.queryURL = function(_) {
        util.strict(_, 'string');
        if (!geocoder.getURL()) throw new Error('Geocoding map ID not set');
        return L.Util.template(geocoder.getURL(), { query: encodeURIComponent(_) });
    };

    geocoder.query = function(_, callback) {
        util.strict(_, 'string');
        util.strict(callback, 'function');
        request(geocoder.queryURL(_), function(err, json) {
            if (json && json.results && json.results.length) {
                var res = {
                    results: json.results,
                    latlng: [json.results[0][0].lat, json.results[0][0].lon]
                };
                if (json.results[0][0].bounds !== undefined) {
                    res.bounds = json.results[0][0].bounds;
                    res.lbounds = util.lbounds(res.bounds);
                }
                callback(null, res);
            } else callback(err || true);
        });

        return geocoder;
    };

    // a reverse geocode:
    //
    //  geocoder.reverseQuery([80, 20])
    geocoder.reverseQuery = function(_, callback) {
        var q = '';

        function norm(x) {
            if (x.lat !== undefined && x.lng !== undefined) return x.lng + ',' + x.lat;
            else if (x.lat !== undefined && x.lon !== undefined) return x.lon + ',' + x.lat;
            else return x[0] + ',' + x[1];
        }

        if (_.length && _[0].length) {
            for (var i = 0, pts = []; i < _.length; i++) pts.push(norm(_[i]));
            q = pts.join(';');
        } else q = norm(_);

        request(geocoder.queryURL(q), function(err, json) {
            callback(err, json);
        });

        return geocoder;
    };

    if (typeof _ === 'string') {
        if (_.indexOf('/') == -1) geocoder.setID(_);
        else geocoder.setURL(_);
    }
    else if (typeof _ === 'object') geocoder.setTileJSON(_);

    return geocoder;
};

},{"./request":20,"./url":23,"./util":24}],10:[function(require,module,exports){
'use strict';

var geocoder = require('./geocoder');

var GeocoderControl = L.Control.extend({
    includes: L.Mixin.Events,

    options: {
        position: 'topleft',
        keepOpen: false
    },

    initialize: function(_, options) {
        L.Util.setOptions(this, options);
        this.geocoder = geocoder(_);
    },

    setURL: function(_) {
        this.geocoder.setURL(_);
        return this;
    },

    getURL: function() {
        return this.geocoder.getURL();
    },

    setID: function(_) {
        this.geocoder.setID(_);
        return this;
    },

    setTileJSON: function(_) {
        this.geocoder.setTileJSON(_);
        return this;
    },

    _toggle: function(e) {
        if (e) L.DomEvent.stop(e);
        if (L.DomUtil.hasClass(this._container, 'active')) {
            L.DomUtil.removeClass(this._container, 'active');
            this._results.innerHTML = '';
            this._input.blur();
        } else {
            L.DomUtil.addClass(this._container, 'active');
            this._input.focus();
            this._input.select();
        }
    },

    _closeIfOpen: function(e) {
        if (L.DomUtil.hasClass(this._container, 'active') &&
            !this.options.keepOpen) {
            L.DomUtil.removeClass(this._container, 'active');
            this._results.innerHTML = '';
            this._input.blur();
        }
    },

    onAdd: function(map) {

        var container = L.DomUtil.create('div', 'leaflet-control-mapbox-geocoder leaflet-bar leaflet-control'),
            link = L.DomUtil.create('a', 'leaflet-control-mapbox-geocoder-toggle mapbox-icon mapbox-icon-geocoder', container),
            results = L.DomUtil.create('div', 'leaflet-control-mapbox-geocoder-results', container),
            wrap = L.DomUtil.create('div', 'leaflet-control-mapbox-geocoder-wrap', container),
            form = L.DomUtil.create('form', 'leaflet-control-mapbox-geocoder-form', wrap),
            input  = L.DomUtil.create('input', '', form);

        link.href = '#';
        link.innerHTML = '&nbsp;';

        input.type = 'text';
        input.setAttribute('placeholder', 'Search');

        L.DomEvent.addListener(form, 'submit', this._geocode, this);
        L.DomEvent.disableClickPropagation(container);

        this._map = map;
        this._results = results;
        this._input = input;
        this._form = form;

        if (this.options.keepOpen) {
            L.DomUtil.addClass(container, 'active');
        } else {
            this._map.on('click', this._closeIfOpen, this);
            L.DomEvent.addListener(link, 'click', this._toggle, this);
        }

        return container;
    },

    _geocode: function(e) {
        L.DomEvent.preventDefault(e);
        L.DomUtil.addClass(this._container, 'searching');

        var map = this._map;
        var onload = L.bind(function(err, resp) {
            L.DomUtil.removeClass(this._container, 'searching');
            if (err || !resp || !resp.results || !resp.results.length) {
                this.fire('error', {error: err});
            } else {
                this._results.innerHTML = '';
                if (resp.results.length === 1 && resp.lbounds) {
                    this._map.fitBounds(resp.lbounds);
                    this._closeIfOpen();
                } else {
                    for (var i = 0, l = Math.min(resp.results.length, 5); i < l; i++) {
                        var name = [];
                        for (var j = 0; j < resp.results[i].length; j++) {
                            if (resp.results[i][j].name) name.push(resp.results[i][j].name);
                        }
                        if (!name.length) continue;

                        var r = L.DomUtil.create('a', '', this._results);
                        r.innerHTML = name.join(', ');
                        r.href = '#';

                        (function(result) {
                            L.DomEvent.addListener(r, 'click', function(e) {
                                var _ = result[0].bounds;
                                map.fitBounds(L.latLngBounds([[_[1], _[0]], [_[3], _[2]]]));
                                L.DomEvent.stop(e);
                            });
                        })(resp.results[i]);
                    }
                    if (resp.results.length > 5) {
                        var outof = L.DomUtil.create('span', '', this._results);
                        outof.innerHTML = 'Top 5 of ' + resp.results.length + '  results';
                    }
                }
                this.fire('found', resp);
            }
        }, this);

        this.geocoder.query(this._input.value, onload);
    }
});

module.exports = function(_, options) {
    return new GeocoderControl(_, options);
};

},{"./geocoder":9}],11:[function(require,module,exports){
'use strict';

function utfDecode(c) {
    if (c >= 93) c--;
    if (c >= 35) c--;
    return c - 32;
}

module.exports = function(data) {
    return function(x, y) {
        if (!data) return;
        var idx = utfDecode(data.grid[y].charCodeAt(x)),
            key = data.keys[idx];
        return data.data[key];
    };
};

},{}],12:[function(require,module,exports){
'use strict';

var util = require('./util'),
    Mustache = require('mustache');

var GridControl = L.Control.extend({

    options: {
        pinnable: true,
        follow: false,
        sanitizer: require('sanitize-caja'),
        touchTeaser: true,
        location: true
    },

    _currentContent: '',

    // pinned means that this control is on a feature and the user has likely
    // clicked. pinned will not become false unless the user clicks off
    // of the feature onto another or clicks x
    _pinned: false,

    initialize: function(_, options) {
        L.Util.setOptions(this, options);
        util.strict_instance(_, L.Class, 'L.mapbox.gridLayer');
        this._layer = _;
    },

    setTemplate: function(template) {
        util.strict(template, 'string');
        this.options.template = template;
        return this;
    },

    _template: function(format, data) {
        if (!data) return;
        var template = this.options.template || this._layer.getTileJSON().template;
        if (template) {
            var d = {};
            d['__' + format + '__'] = true;
            return this.options.sanitizer(
                Mustache.to_html(template, L.extend(d, data)));
        }
    },

    // change the content of the tooltip HTML if it has changed, otherwise
    // noop
    _show: function(content, o) {
        if (content === this._currentContent) return;

        this._currentContent = content;

        if (this.options.follow) {
            this._popup.setContent(content)
                .setLatLng(o.latLng);
            if (this._map._popup !== this._popup) this._popup.openOn(this._map);
        } else {
            this._container.style.display = 'block';
            this._contentWrapper.innerHTML = content;
        }
    },

    hide: function() {
        this._pinned = false;
        this._currentContent = '';

        this._map.closePopup();
        this._container.style.display = 'none';
        this._contentWrapper.innerHTML = '';

        L.DomUtil.removeClass(this._container, 'closable');

        return this;
    },

    _mouseover: function(o) {
        if (o.data) {
            L.DomUtil.addClass(this._map._container, 'map-clickable');
        } else {
            L.DomUtil.removeClass(this._map._container, 'map-clickable');
        }

        if (this._pinned) return;

        var content = this._template('teaser', o.data);
        if (content) {
            this._show(content, o);
        } else {
            this.hide();
        }
    },

    _mousemove: function(o) {
        if (this._pinned) return;
        if (!this.options.follow) return;

        this._popup.setLatLng(o.latLng);
    },

    _navigateTo: function(url) {
        window.top.location.href = url;
    },

    _click: function(o) {

        var location_formatted = this._template('location', o.data);
        if (this.options.location && location_formatted &&
            location_formatted.search(/^https?:/) === 0) {
            return this._navigateTo(this._template('location', o.data));
        }

        if (!this.options.pinnable) return;

        var content = this._template('full', o.data);

        if (!content && this.options.touchTeaser && L.Browser.touch) {
            content = this._template('teaser', o.data);
        }

        if (content) {
            L.DomUtil.addClass(this._container, 'closable');
            this._pinned = true;
            this._show(content, o);
        } else if (this._pinned) {
            L.DomUtil.removeClass(this._container, 'closable');
            this._pinned = false;
            this.hide();
        }
    },

    _onPopupClose: function() {
        this._currentContent = null;
        this._pinned = false;
    },

    _createClosebutton: function(container, fn) {
        var link = L.DomUtil.create('a', 'close', container);

        link.innerHTML = 'close';
        link.href = '#';
        link.title = 'close';

        L.DomEvent
            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'mousedown', L.DomEvent.stopPropagation)
            .on(link, 'dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', fn, this);

        return link;
    },

    onAdd: function(map) {
        this._map = map;

        var className = 'leaflet-control-grid map-tooltip',
            container = L.DomUtil.create('div', className),
            contentWrapper = L.DomUtil.create('div', 'map-tooltip-content');

        // hide the container element initially
        container.style.display = 'none';
        this._createClosebutton(container, this.hide);
        container.appendChild(contentWrapper);

        this._contentWrapper = contentWrapper;
        this._popup = new L.Popup({ autoPan: false, closeOnClick: false });

        map.on('popupclose', this._onPopupClose, this);

        L.DomEvent
            .disableClickPropagation(container)
            // allow people to scroll tooltips with mousewheel
            .addListener(container, 'mousewheel', L.DomEvent.stopPropagation);

        this._layer
            .on('mouseover', this._mouseover, this)
            .on('mousemove', this._mousemove, this)
            .on('click', this._click, this);

        return container;
    },

    onRemove: function (map) {

        map.off('popupclose', this._onPopupClose, this);

        this._layer
            .off('mouseover', this._mouseover, this)
            .off('mousemove', this._mousemove, this)
            .off('click', this._click, this);
    }
});

module.exports = function(_, options) {
    return new GridControl(_, options);
};

},{"./util":24,"mustache":4,"sanitize-caja":5}],13:[function(require,module,exports){
'use strict';

var util = require('./util'),
    url = require('./url'),
    request = require('./request'),
    grid = require('./grid');

// forked from danzel/L.UTFGrid
var GridLayer = L.Class.extend({
    includes: [L.Mixin.Events, require('./load_tilejson')],

    options: {
        template: function() { return ''; }
    },

    _mouseOn: null,
    _tilejson: {},
    _cache: {},

    initialize: function(_, options) {
        L.Util.setOptions(this, options);
        this._loadTileJSON(_);
    },

    _setTileJSON: function(json) {
        util.strict(json, 'object');

        L.extend(this.options, {
            grids: json.grids,
            minZoom: json.minzoom,
            maxZoom: json.maxzoom,
            bounds: json.bounds && util.lbounds(json.bounds)
        });

        this._tilejson = json;
        this._cache = {};
        this._update();

        return this;
    },

    getTileJSON: function() {
        return this._tilejson;
    },

    active: function() {
        return !!(this._map && this.options.grids && this.options.grids.length);
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

    onAdd: function(map) {
        this._map = map;
        this._update();

        this._map
            .on('click', this._click, this)
            .on('mousemove', this._move, this)
            .on('moveend', this._update, this);
    },

    onRemove: function() {
        this._map
            .off('click', this._click, this)
            .off('mousemove', this._move, this)
            .off('moveend', this._update, this);
    },

    getData: function(latlng, callback) {
        if (!this.active()) return;

        var map = this._map,
            point = map.project(latlng.wrap()),
            tileSize = 256,
            resolution = 4,
            x = Math.floor(point.x / tileSize),
            y = Math.floor(point.y / tileSize),
            max = map.options.crs.scale(map.getZoom()) / tileSize;

        x = (x + max) % max;
        y = (y + max) % max;

        this._getTile(map.getZoom(), x, y, function(grid) {
            var gridX = Math.floor((point.x - (x * tileSize)) / resolution),
                gridY = Math.floor((point.y - (y * tileSize)) / resolution);

            callback(grid(gridX, gridY));
        });

        return this;
    },

    _click: function(e) {
        this.getData(e.latlng, L.bind(function(data) {
            this.fire('click', {
                latLng: e.latlng,
                data: data
            });
        }, this));
    },

    _move: function(e) {
        this.getData(e.latlng, L.bind(function(data) {
            if (data !== this._mouseOn) {
                if (this._mouseOn) {
                    this.fire('mouseout', {
                        latLng: e.latlng,
                        data: this._mouseOn
                    });
                }

                this.fire('mouseover', {
                    latLng: e.latlng,
                    data: data
                });

                this._mouseOn = data;
            } else {
                this.fire('mousemove', {
                    latLng: e.latlng,
                    data: data
                });
            }
        }, this));
    },

    _getTileURL: function(tilePoint) {
        var urls = this.options.grids,
            index = (tilePoint.x + tilePoint.y) % urls.length,
            url = urls[index];

        return L.Util.template(url, tilePoint);
    },

    // Load up all required json grid files
    _update: function() {
        if (!this.active()) return;

        var bounds = this._map.getPixelBounds(),
            z = this._map.getZoom(),
            tileSize = 256;

        if (z > this.options.maxZoom || z < this.options.minZoom) return;

        var nwTilePoint = new L.Point(
                Math.floor(bounds.min.x / tileSize),
                Math.floor(bounds.min.y / tileSize)),
            seTilePoint = new L.Point(
                Math.floor(bounds.max.x / tileSize),
                Math.floor(bounds.max.y / tileSize)),
            max = this._map.options.crs.scale(z) / tileSize;

        for (var x = nwTilePoint.x; x <= seTilePoint.x; x++) {
            for (var y = nwTilePoint.y; y <= seTilePoint.y; y++) {
                // x wrapped
                var xw = (x + max) % max, yw = (y + max) % max;
                this._getTile(z, xw, yw);
            }
        }
    },

    _getTile: function(z, x, y, callback) {
        var key = z + '_' + x + '_' + y,
            tilePoint = L.point(x, y);

        tilePoint.z = z;

        if (!this._tileShouldBeLoaded(tilePoint)) {
            return;
        }

        if (key in this._cache) {
            if (!callback) return;

            if (typeof this._cache[key] === 'function') {
                callback(this._cache[key]); // Already loaded
            } else {
                this._cache[key].push(callback); // Pending
            }

            return;
        }

        this._cache[key] = [];

        if (callback) {
            this._cache[key].push(callback);
        }

        request(this._getTileURL(tilePoint), L.bind(function(err, json) {
            var callbacks = this._cache[key];
            this._cache[key] = grid(json);
            for (var i = 0; i < callbacks.length; ++i) {
                callbacks[i](this._cache[key]);
            }
        }, this));
    },

    _tileShouldBeLoaded: function(tilePoint) {
        if (tilePoint.z > this.options.maxZoom || tilePoint.z < this.options.minZoom) {
            return false;
        }

        if (this.options.bounds) {
            var tileSize = 256,
                nwPoint = tilePoint.multiplyBy(tileSize),
                sePoint = nwPoint.add(new L.Point(tileSize, tileSize)),
                nw = this._map.unproject(nwPoint),
                se = this._map.unproject(sePoint),
                bounds = new L.LatLngBounds([nw, se]);

            if (!this.options.bounds.intersects(bounds)) {
                return false;
            }
        }

        return true;
    }
});

module.exports = function(_, options) {
    return new GridLayer(_, options);
};

},{"./grid":11,"./load_tilejson":16,"./request":20,"./url":23,"./util":24}],14:[function(require,module,exports){
'use strict';

var InfoControl = L.Control.extend({
    options: {
        position: 'bottomleft',
        sanitizer: require('sanitize-caja'),
        editLink: false
    },

    initialize: function(options) {
        L.setOptions(this, options);
        this._info = {};
    },

    onAdd: function(map) {
        this._container = L.DomUtil.create('div', 'mapbox-control-info mapbox-small');
        this._content = L.DomUtil.create('div', 'map-info-container', this._container);

        if (this.options.position === 'bottomright' ||
            this.options.position === 'topright') {
            this._container.className += ' mapbox-control-info-right';
        }

        var link = L.DomUtil.create('a', 'mapbox-info-toggle mapbox-icon mapbox-icon-info', this._container);
        link.href = '#';

        L.DomEvent.addListener(link, 'click', this._showInfo, this);
        L.DomEvent.disableClickPropagation(this._container);

        for (var i in map._layers) {
            if (map._layers[i].getAttribution) {
                this.addInfo(map._layers[i].getAttribution());
            }
        }

        map
            .on('layeradd', this._onLayerAdd, this)
            .on('layerremove', this._onLayerRemove, this);

        this._update();
        return this._container;
    },

    onRemove: function(map) {
        map
            .off('layeradd', this._onLayerAdd)
            .off('layerremove', this._onLayerRemove);
    },

    addInfo: function(text) {
        if (!text) return this;
        if (!this._info[text]) this._info[text] = 0;

        this._info[text]++;
        return this._update();
    },

    removeInfo: function (text) {
        if (!text) return this;
        if (this._info[text]) this._info[text]--;
        return this._update();
    },

    _showInfo: function(e) {
        L.DomEvent.preventDefault(e);
        if (this._active === true) return this._hidecontent();

        L.DomUtil.addClass(this._container, 'active');
        this._active = true;
        this._update();
    },

    _hidecontent: function() {
        this._content.innerHTML = '';
        this._active = false;
        L.DomUtil.removeClass(this._container, 'active');
        return;
    },

    _update: function() {
        if (!this._map) { return this; }
        this._content.innerHTML = '';
        var hide = 'none';
        var info = [];

        for (var i in this._info) {
            if (this._info.hasOwnProperty(i) && this._info[i]) {
                info.push(this.options.sanitizer(i));
                hide = 'block';
            }
        }

        this._content.innerHTML += info.join(' | ');

        if (this.options.editLink && !L.Browser.mobile) {
            this._content.innerHTML += (info.length) ? ' | ' : '';
            var edit = L.DomUtil.create('a', '', this._content);
            edit.href = '#';
            edit.innerHTML = 'Improve this map';
            edit.title = 'Edit in OpenStreetMap';
            L.DomEvent.on(edit, 'click', L.bind(this._osmlink, this), this);
        }

        // If there are no results in _info then hide this.
        this._container.style.display = hide;
        return this;
    },

    _osmlink: function() {
        var center = this._map.getCenter();
        var z = this._map.getZoom();
        window.open('http://www.openstreetmap.org/edit?' + 'zoom=' + z +
        '&lat=' + center.lat + '&lon=' + center.lng);
    },

    _onLayerAdd: function(e) {
        if (e.layer.getAttribution) {
            this.addInfo(e.layer.getAttribution());
        }
        if ('on' in e.layer && e.layer.getAttribution) {
            e.layer.on('ready', L.bind(function() { this.addInfo(e.layer.getAttribution()); }, this));
        }
    },

    _onLayerRemove: function (e) {
        if (e.layer.getAttribution) {
            this.removeInfo(e.layer.getAttribution());
        }
    }
});

module.exports = function(options) {
    return new InfoControl(options);
};

},{"sanitize-caja":5}],15:[function(require,module,exports){
'use strict';

var LegendControl = L.Control.extend({

    options: {
        position: 'bottomright',
        sanitizer: require('sanitize-caja')
    },

    initialize: function(options) {
        L.setOptions(this, options);
        this._legends = {};
    },

    onAdd: function(map) {
        this._container = L.DomUtil.create('div', 'map-legends wax-legends');
        L.DomEvent.disableClickPropagation(this._container);

        this._update();

        return this._container;
    },

    addLegend: function(text) {
        if (!text) { return this; }

        if (!this._legends[text]) {
            this._legends[text] = 0;
        }

        this._legends[text]++;
        return this._update();
    },

    removeLegend: function(text) {
        if (!text) { return this; }
        if (this._legends[text]) this._legends[text]--;
        return this._update();
    },

    _update: function() {
        if (!this._map) { return this; }

        this._container.innerHTML = '';
        var hide = 'none';

        for (var i in this._legends) {
            if (this._legends.hasOwnProperty(i) && this._legends[i]) {
                var div = L.DomUtil.create('div', 'map-legend wax-legend', this._container);
                div.innerHTML = this.options.sanitizer(i);
                hide = 'block';
            }
        }

        // hide the control entirely unless there is at least one legend;
        // otherwise there will be a small grey blemish on the map.
        this._container.style.display = hide;

        return this;
    }
});

module.exports = function(options) {
    return new LegendControl(options);
};

},{"sanitize-caja":5}],16:[function(require,module,exports){
'use strict';

var request = require('./request'),
    url = require('./url'),
    util = require('./util');

module.exports = {
    _loadTileJSON: function(_) {
        if (typeof _ === 'string') {
            if (_.indexOf('/') == -1) {
                _ = url.base() + _ + '.json';
            }

            request(url.secureFlag(_), L.bind(function(err, json) {
                if (err) {
                    util.log('could not load TileJSON at ' + _);
                    this.fire('error', {error: err});
                } else if (json) {
                    this._setTileJSON(json);
                    this.fire('ready');
                }
            }, this));
        } else if (_ && typeof _ === 'object') {
            this._setTileJSON(_);
        }
    }
};

},{"./request":20,"./url":23,"./util":24}],17:[function(require,module,exports){
'use strict';

var util = require('./util'),
    tileLayer = require('./tile_layer'),
    markerLayer = require('./marker_layer'),
    gridLayer = require('./grid_layer'),
    gridControl = require('./grid_control'),
    infoControl = require('./info_control'),
    shareControl = require('./share_control'),
    legendControl = require('./legend_control');

var LMap = L.Map.extend({
    includes: [require('./load_tilejson')],

    options: {
        tileLayer: {},
        markerLayer: {},
        gridLayer: {},
        legendControl: {},
        gridControl: {},
        infoControl: {},
        attributionControl: false,
        shareControl: false
    },

    _tilejson: {},

    initialize: function(element, _, options) {
        L.Map.prototype.initialize.call(this, element, options);

        // disable the default 'Leaflet' text
        if (this.attributionControl) this.attributionControl.setPrefix('');

        if (this.options.tileLayer) {
            this.tileLayer = tileLayer(undefined, this.options.tileLayer);
            this.addLayer(this.tileLayer);
        }

        if (this.options.markerLayer) {
            this.markerLayer = markerLayer(undefined, this.options.markerLayer);
            this.addLayer(this.markerLayer);
        }

        if (this.options.gridLayer) {
            this.gridLayer = gridLayer(undefined, this.options.gridLayer);
            this.addLayer(this.gridLayer);
        }

        if (this.options.gridLayer && this.options.gridControl) {
            this.gridControl = gridControl(this.gridLayer, this.options.gridControl);
            this.addControl(this.gridControl);
        }

        if (this.options.infoControl) {
            this.infoControl = infoControl(this.options.infoControl);
            this.addControl(this.infoControl);
        }

        if (this.options.legendControl) {
            this.legendControl = legendControl(this.options.legendControl);
            this.addControl(this.legendControl);
        }

        if (this.options.shareControl) {
            this.shareControl = shareControl(this.options.shareControl);
            this.addControl(this.shareControl);
        }

        this._loadTileJSON(_);
    },

    // Update certain properties on 'ready' event
    addLayer: function(layer) {
        if ('on' in layer) { layer.on('ready', L.bind(function() { this._updateLayer(layer); }, this)); }
        return L.Map.prototype.addLayer.call(this, layer);
    },

    // use a javascript object of tilejson data to configure this layer
    _setTileJSON: function(_) {
        this._tilejson = _;
        this._initialize(_);
        return this;
    },

    getTileJSON: function() {
        return this._tilejson;
    },

    _initialize: function(json) {
        if (this.tileLayer) {
            this.tileLayer._setTileJSON(json);
            this._updateLayer(this.tileLayer);
        }

        if (this.markerLayer && !this.markerLayer.getGeoJSON() && json.data && json.data[0]) {
            this.markerLayer.loadURL(json.data[0]);
        }

        if (this.gridLayer) {
            this.gridLayer._setTileJSON(json);
            this._updateLayer(this.gridLayer);
        }

        if (this.infoControl && json.attribution) {
            this.infoControl.addInfo(json.attribution);
        }

        if (this.legendControl && json.legend) {
            this.legendControl.addLegend(json.legend);
        }

        if (this.shareControl) {
            this.shareControl._setTileJSON(json);
        }

        if (!this._loaded) {
            var zoom = json.center[2],
                center = L.latLng(json.center[1], json.center[0]);

            this.setView(center, zoom);
        }
    },

    _updateLayer: function(layer) {
        if (!layer.options) return;

        if (this.infoControl && this._loaded) {
            this.infoControl.addInfo(layer.options.infoControl);
        }

        if (!(L.stamp(layer) in this._zoomBoundLayers) &&
                (layer.options.maxZoom || layer.options.minZoom)) {
            this._zoomBoundLayers[L.stamp(layer)] = layer;
        }

        this._updateZoomLevels();
    }
});

module.exports = function(element, _, options) {
    return new LMap(element, _, options);
};

},{"./grid_control":12,"./grid_layer":13,"./info_control":14,"./legend_control":15,"./load_tilejson":16,"./marker_layer":19,"./share_control":21,"./tile_layer":22,"./util":24}],18:[function(require,module,exports){
'use strict';

var url = require('./url'),
    sanitize = require('sanitize-caja');

// mapbox-related markers functionality
// provide an icon from mapbox's simple-style spec and hosted markers
// service
function icon(fp) {
    fp = fp || {};

    var sizes = {
            small: [20, 50],
            medium: [30, 70],
            large: [35, 90]
        },
        size = fp['marker-size'] || 'medium',
        symbol = (fp['marker-symbol']) ? '-' + fp['marker-symbol'] : '',
        color = (fp['marker-color'] || '7e7e7e').replace('#', '');

    return L.icon({
        iconUrl: url.base() + 'marker/' +
            'pin-' + size.charAt(0) + symbol + '+' + color +
            // detect and use retina markers, which are x2 resolution
            ((L.Browser.retina) ? '@2x' : '') + '.png',
        iconSize: sizes[size],
        iconAnchor: [sizes[size][0] / 2, sizes[size][1] / 2],
        popupAnchor: [0, -sizes[size][1] / 2]
    });
}

// a factory that provides markers for Leaflet from MapBox's
// [simple-style specification](https://github.com/mapbox/simplestyle-spec)
// and [Markers API](http://mapbox.com/developers/api/#markers).
function style(f, latlon) {
    return L.marker(latlon, {
        icon: icon(f.properties),
        title: (f.properties && f.properties.title) || ''
    });
}

function createPopup(f, sanitizer) {
    if (!f || !f.properties) return '';
    var popup = '';

    if (f.properties.title) {
        popup += '<div class="marker-title">' + f.properties.title + '</div>';
    }

    if (f.properties.description) {
        popup += '<div class="marker-description">' + f.properties.description + '</div>';
    }

    return (sanitizer || sanitize)(popup);
}

module.exports = {
    icon: icon,
    style: style,
    createPopup: createPopup
};

},{"./url":23,"sanitize-caja":5}],19:[function(require,module,exports){
'use strict';

var util = require('./util');
var urlhelper = require('./url');
var request = require('./request');
var marker = require('./marker');

// # markerLayer
//
// A layer of markers, loaded from MapBox or else. Adds the ability
// to reset markers, filter them, and load them from a GeoJSON URL.
var MarkerLayer = L.FeatureGroup.extend({
    options: {
        filter: function() { return true; },
        sanitizer: require('sanitize-caja')
    },

    initialize: function(_, options) {
        L.setOptions(this, options);

        this._layers = {};

        if (typeof _ === 'string') {
            util.idUrl(_, this);
        // javascript object of TileJSON data
        } else if (_ && typeof _ === 'object') {
            this.setGeoJSON(_);
        }
    },

    setGeoJSON: function(_) {
        this._geojson = _;
        this.clearLayers();
        this._initialize(_);
    },

    getGeoJSON: function() {
        return this._geojson;
    },

    loadURL: function(url) {
        if (this._request && 'abort' in this._request) this._request.abort();
        url = urlhelper.jsonify(url);
        this._request = request(url, L.bind(function(err, json) {
            this._request = null;
            if (err && err.type !== 'abort') {
                util.log('could not load markers at ' + url);
                this.fire('error', {error: err});
            } else if (json) {
                this.setGeoJSON(json);
                this.fire('ready');
            }
        }, this));
        return this;
    },

    loadID: function(id) {
        return this.loadURL(urlhelper.base() + id + '/markers.geojson');
    },

    setFilter: function(_) {
        this.options.filter = _;
        if (this._geojson) {
            this.clearLayers();
            this._initialize(this._geojson);
        }
        return this;
    },

    getFilter: function() {
        return this.options.filter;
    },

    _initialize: function(json) {
        var features = L.Util.isArray(json) ? json : json.features,
            i, len;

        if (features) {
            for (i = 0, len = features.length; i < len; i++) {
                // Only add this if geometry or geometries are set and not null
                if (features[i].geometries || features[i].geometry || features[i].features) {
                    this._initialize(features[i]);
                }
            }
        } else if (this.options.filter(json)) {

            var layer = L.GeoJSON.geometryToLayer(json, marker.style),
                popupHtml = marker.createPopup(json, this.options.sanitizer);

            layer.feature = json;

            if (popupHtml) {
                layer.bindPopup(popupHtml, {
                    closeButton: false
                });
            }

            this.addLayer(layer);
        }
    }
});

module.exports = function(_, options) {
    return new MarkerLayer(_, options);
};

},{"./marker":18,"./request":20,"./url":23,"./util":24,"sanitize-caja":5}],20:[function(require,module,exports){
var corslite = require('corslite'),
    JSON3 = require('json3'),
    strict = require('./util').strict;

module.exports = function(url, callback) {
    'use strict';
    strict(url, 'string');
    strict(callback, 'function');
    return corslite(url, onload);
    function onload(err, resp) {
        if (!err && resp) {
            // hardcoded grid response
            if (resp.responseText[0] == 'g') {
                resp = JSON3.parse(resp.responseText
                    .substring(5, resp.responseText.length - 2));
            } else {
                resp = JSON3.parse(resp.responseText);
            }
        }
        callback(err, resp);
    }
};

},{"./util":24,"corslite":2,"json3":3}],21:[function(require,module,exports){
'use strict';

var url = require('./url');

var ShareControl = L.Control.extend({
    includes: [require('./load_tilejson')],

    options: {
        position: 'topleft',
        url: ''
    },

    initialize: function(_, options) {
        L.setOptions(this, options);
        this._loadTileJSON(_);
    },

    _setTileJSON: function(json) {
        this._tilejson = json;
    },

    onAdd: function(map) {
        this._map = map;
        this._url = url;

        var container = L.DomUtil.create('div', 'leaflet-control-mapbox-share leaflet-bar');
        var link = L.DomUtil.create('a', 'mapbox-share mapbox-icon mapbox-icon-share', container);
        link.href = '#';

        this._modal = map._createPane('mapbox-modal', this._map._container);
        this._mask = map._createPane('mapbox-modal-mask', this._modal);
        this._content = map._createPane('mapbox-modal-content', this._modal);

        L.DomEvent.addListener(link, 'click', this._shareClick, this);
        L.DomEvent.disableClickPropagation(container);

        this._map.on('mousedown', this._clickOut, this);

        return container;
    },

    _clickOut: function(e) {
        if (this._sharing) {
            L.DomEvent.preventDefault(e);
            L.DomUtil.removeClass(this._modal, 'active');
            this._content.innerHTML = '';
            this._sharing = null;
            return;
        }
    },

    _shareClick: function(e) {
        L.DomEvent.stop(e);
        if (this._sharing) return this._clickOut(e);

        var tilejson = this._tilejson || this._map._tilejson || {},
            url = encodeURIComponent(this.options.url || tilejson.webpage || window.location),
            name = encodeURIComponent(tilejson.name),
            image = this._url.base() + tilejson.id + '/' + this._map.getCenter().lng + ',' + this._map.getCenter().lat + ',' + this._map.getZoom() + '/600x600.png',
            twitter = '//twitter.com/intent/tweet?status=' + name + ' ' + url,
            facebook = '//www.facebook.com/sharer.php?u=' + url + '&t=' + encodeURIComponent(tilejson.name),
            pinterest = '//www.pinterest.com/pin/create/button/?url=' + url + '&media=' + image + '&description=' + tilejson.name,
            share = ("<h3>Share this map</h3>" +
                    "<div class='mapbox-share-buttons'><a class='mapbox-button mapbox-button-icon mapbox-icon-facebook' target='_blank' href='{{facebook}}'>Facebook</a>" +
                    "<a class='mapbox-button mapbox-button-icon mapbox-icon-twitter' target='_blank' href='{{twitter}}'>Twitter</a>" +
                    "<a class='mapbox-button mapbox-button-icon mapbox-icon-pinterest' target='_blank' href='{{pinterest}}'>Pinterest</a></div>")
                    .replace('{{twitter}}', twitter)
                    .replace('{{facebook}}', facebook)
                    .replace('{{pinterest}}', pinterest),
            embedValue = '<iframe width="100%" height="500px" frameBorder="0" src="{{embed}}"></iframe>'.replace('{{embed}}', tilejson.embed || window.location),
            embedLabel = 'Copy and paste this <strong>HTML code</strong> into documents to embed this map on web pages.';

        L.DomUtil.addClass(this._modal, 'active');

        this._sharing = this._map._createPane('mapbox-modal-body', this._content);
        this._sharing.innerHTML = share;

        var embed = L.DomUtil.create('input', 'mapbox-embed', this._sharing);
        embed.type = 'text';
        embed.value = embedValue;

        var label = L.DomUtil.create('label', 'mapbox-embed-description', this._sharing);
        label.innerHTML = embedLabel;

        var close = L.DomUtil.create('a', 'leaflet-popup-close-button', this._sharing);
        close.href = '#';

        L.DomEvent.disableClickPropagation(this._sharing);
        L.DomEvent.addListener(close, 'click', this._clickOut, this);
        L.DomEvent.addListener(embed, 'click', function(e) {
            e.target.focus();
            e.target.select();
        });
    }
});

module.exports = function(_, options) {
    return new ShareControl(_, options);
};

},{"./load_tilejson":16,"./url":23}],22:[function(require,module,exports){
'use strict';

var util = require('./util'),
    url = require('./url');

var TileLayer = L.TileLayer.extend({
    includes: [require('./load_tilejson')],

    options: {
        format: 'png'
    },

    // http://mapbox.com/developers/api/#image_quality
    formats: [
        'png',
        // PNG
        'png32', 'png64', 'png128', 'png256',
        // JPG
        'jpg70', 'jpg80', 'jpg90'],

    scalePrefix: '@2x.',

    initialize: function(_, options) {
        L.TileLayer.prototype.initialize.call(this, undefined, options);

        this._tilejson = {};

        if (options && options.detectRetina &&
            L.Browser.retina && options.retinaVersion) {
            _ = options.retinaVersion;
        }

        if (options && options.format) {
            util.strict_oneof(options.format, this.formats);
        }

        this._loadTileJSON(_);
    },

    setFormat: function(_) {
        util.strict(_, 'string');
        this.options.format = _;
        this.redraw();
        return this;
    },

    _autoScale: function() {
        return this.options &&
            L.Browser.retina &&
            this.options.detectRetina &&
            (!this.options.retinaVersion) &&
            this.options.autoscale;
    },

    // disable the setUrl function, which is not available on mapbox tilelayers
    setUrl: null,

    _setTileJSON: function(json) {
        util.strict(json, 'object');

        L.extend(this.options, {
            tiles: json.tiles,
            attribution: json.attribution,
            minZoom: json.minzoom,
            maxZoom: json.maxzoom,
            autoscale: json.autoscale || false,
            tms: json.scheme === 'tms',
            bounds: json.bounds && util.lbounds(json.bounds)
        });

        this._tilejson = json;
        this.redraw();
        return this;
    },

    getTileJSON: function() {
        return this._tilejson;
    },

    // this is an exception to mapbox.js naming rules because it's called
    // by `L.map`
    getTileUrl: function(tilePoint) {
        var tiles = this.options.tiles,
            index = Math.floor(Math.abs(tilePoint.x + tilePoint.y) % tiles.length),
            url = tiles[index];

        var templated = L.Util.template(url, tilePoint);
        if (!templated) {
            return templated;
        } else {
            return templated.replace('.png',
                (this._autoScale() ? this.scalePrefix : '.') + this.options.format);
        }
    },

    // TileJSON.TileLayers are added to the map immediately, so that they get
    // the desired z-index, but do not update until the TileJSON has been loaded.
    _update: function() {
        if (this.options.tiles) {
            L.TileLayer.prototype._update.call(this);
        }
    }
});

module.exports = function(_, options) {
    return new TileLayer(_, options);
};

},{"./load_tilejson":16,"./url":23,"./util":24}],23:[function(require,module,exports){
'use strict';

var config = require('./config');

// Return the base url of a specific version of MapBox's API.
//
// `hash`, if provided must be a number and is used to distribute requests
// against multiple `CNAME`s in order to avoid connection limits in browsers
module.exports = {
    isSSL: function() {
        return 'https:' === document.location.protocol || config.FORCE_HTTPS;
    },
    base: function(hash) {
        // By default, use public HTTP urls
        // Support HTTPS if the user has specified HTTPS urls to use, and this
        // page is under HTTPS
        var urls = this.isSSL() ? config.HTTPS_URLS : config.HTTP_URLS;
        if (hash === undefined || typeof hash !== 'number') {
            return urls[0];
        } else {
            return urls[hash % urls.length];
        }
    },
    // Requests that contain URLs need a secure flag appended
    // to their URLs so that the server knows to send SSL-ified
    // resource references.
    secureFlag: function(url) {
        if (!this.isSSL()) return url;
        else if (url.match(/(\?|&)secure/)) return url;
        else if (url.indexOf('?') !== -1) return url + '&secure';
        else return url + '?secure';
    },
    // Convert a JSONP url to a JSON URL. (MapBox TileJSON sometimes hardcodes JSONP.)
    jsonify: function(url) {
        return url.replace(/\.(geo)?jsonp(?=$|\?)/, '.$1json');
    }
};

},{"./config":8}],24:[function(require,module,exports){
'use strict';

module.exports = {
    idUrl: function(_, t) {
        if (_.indexOf('/') == -1) t.loadID(_);
        else t.loadURL(_);
    },
    log: function(_) {
        if (console && typeof console.error === 'function') {
            console.error(_);
        }
    },
    strict: function(_, type) {
        if (typeof _ !== type) {
            throw new Error('Invalid argument: ' + type + ' expected');
        }
    },
    strict_instance: function(_, klass, name) {
        if (!(_ instanceof klass)) {
            throw new Error('Invalid argument: ' + name + ' expected');
        }
    },
    strict_oneof: function(_, values) {
        if (values.indexOf(_) == -1) {
            throw new Error('Invalid argument: ' + _ + ' given, valid values are ' +
                values.join(', '));
        }
    },
    lbounds: function(_) {
        // leaflet-compatible bounds, since leaflet does not do geojson
        return new L.LatLngBounds([[_[1], _[0]], [_[3], _[2]]]);
    }
};

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZWRkaWUvU2l0ZXMvbWFwYm94LmpzL21hcGJveC5qcyIsIi9Vc2Vycy9lZGRpZS9TaXRlcy9tYXBib3guanMvbm9kZV9tb2R1bGVzL2NvcnNsaXRlL2NvcnNsaXRlLmpzIiwiL1VzZXJzL2VkZGllL1NpdGVzL21hcGJveC5qcy9ub2RlX21vZHVsZXMvanNvbjMvbGliL2pzb24zLmpzIiwiL1VzZXJzL2VkZGllL1NpdGVzL21hcGJveC5qcy9ub2RlX21vZHVsZXMvbXVzdGFjaGUvbXVzdGFjaGUuanMiLCIvVXNlcnMvZWRkaWUvU2l0ZXMvbWFwYm94LmpzL25vZGVfbW9kdWxlcy9zYW5pdGl6ZS1jYWphL2luZGV4LmpzIiwiL1VzZXJzL2VkZGllL1NpdGVzL21hcGJveC5qcy9ub2RlX21vZHVsZXMvc2FuaXRpemUtY2FqYS9zYW5pdGl6ZXItYnVuZGxlLmpzIiwiL1VzZXJzL2VkZGllL1NpdGVzL21hcGJveC5qcy9wYWNrYWdlLmpzb24iLCIvVXNlcnMvZWRkaWUvU2l0ZXMvbWFwYm94LmpzL3NyYy9jb25maWcuanMiLCIvVXNlcnMvZWRkaWUvU2l0ZXMvbWFwYm94LmpzL3NyYy9nZW9jb2Rlci5qcyIsIi9Vc2Vycy9lZGRpZS9TaXRlcy9tYXBib3guanMvc3JjL2dlb2NvZGVyX2NvbnRyb2wuanMiLCIvVXNlcnMvZWRkaWUvU2l0ZXMvbWFwYm94LmpzL3NyYy9ncmlkLmpzIiwiL1VzZXJzL2VkZGllL1NpdGVzL21hcGJveC5qcy9zcmMvZ3JpZF9jb250cm9sLmpzIiwiL1VzZXJzL2VkZGllL1NpdGVzL21hcGJveC5qcy9zcmMvZ3JpZF9sYXllci5qcyIsIi9Vc2Vycy9lZGRpZS9TaXRlcy9tYXBib3guanMvc3JjL2luZm9fY29udHJvbC5qcyIsIi9Vc2Vycy9lZGRpZS9TaXRlcy9tYXBib3guanMvc3JjL2xlZ2VuZF9jb250cm9sLmpzIiwiL1VzZXJzL2VkZGllL1NpdGVzL21hcGJveC5qcy9zcmMvbG9hZF90aWxlanNvbi5qcyIsIi9Vc2Vycy9lZGRpZS9TaXRlcy9tYXBib3guanMvc3JjL21hcC5qcyIsIi9Vc2Vycy9lZGRpZS9TaXRlcy9tYXBib3guanMvc3JjL21hcmtlci5qcyIsIi9Vc2Vycy9lZGRpZS9TaXRlcy9tYXBib3guanMvc3JjL21hcmtlcl9sYXllci5qcyIsIi9Vc2Vycy9lZGRpZS9TaXRlcy9tYXBib3guanMvc3JjL3JlcXVlc3QuanMiLCIvVXNlcnMvZWRkaWUvU2l0ZXMvbWFwYm94LmpzL3NyYy9zaGFyZV9jb250cm9sLmpzIiwiL1VzZXJzL2VkZGllL1NpdGVzL21hcGJveC5qcy9zcmMvdGlsZV9sYXllci5qcyIsIi9Vc2Vycy9lZGRpZS9TaXRlcy9tYXBib3guanMvc3JjL3VybC5qcyIsIi9Vc2Vycy9lZGRpZS9TaXRlcy9tYXBib3guanMvc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2wwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzk0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBIYXJkY29kZSBpbWFnZSBwYXRoLCBiZWNhdXNlIExlYWZsZXQncyBhdXRvZGV0ZWN0aW9uXG4vLyBmYWlscywgYmVjYXVzZSBtYXBib3guanMgaXMgbm90IG5hbWVkIGxlYWZsZXQuanNcbndpbmRvdy5MLkljb24uRGVmYXVsdC5pbWFnZVBhdGggPSAnLy9hcGkudGlsZXMubWFwYm94LmNvbS9tYXBib3guanMvJyArICd2JyArXG4gICAgcmVxdWlyZSgnLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uICsgJy9pbWFnZXMnO1xuXG5MLm1hcGJveCA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAgIFZFUlNJT046IHJlcXVpcmUoJy4vcGFja2FnZS5qc29uJykudmVyc2lvbixcbiAgICBnZW9jb2RlcjogcmVxdWlyZSgnLi9zcmMvZ2VvY29kZXInKSxcbiAgICBtYXJrZXI6IHJlcXVpcmUoJy4vc3JjL21hcmtlcicpLFxuICAgIHRpbGVMYXllcjogcmVxdWlyZSgnLi9zcmMvdGlsZV9sYXllcicpLFxuICAgIGluZm9Db250cm9sOiByZXF1aXJlKCcuL3NyYy9pbmZvX2NvbnRyb2wnKSxcbiAgICBzaGFyZUNvbnRyb2w6IHJlcXVpcmUoJy4vc3JjL3NoYXJlX2NvbnRyb2wnKSxcbiAgICBsZWdlbmRDb250cm9sOiByZXF1aXJlKCcuL3NyYy9sZWdlbmRfY29udHJvbCcpLFxuICAgIGdlb2NvZGVyQ29udHJvbDogcmVxdWlyZSgnLi9zcmMvZ2VvY29kZXJfY29udHJvbCcpLFxuICAgIGdyaWRDb250cm9sOiByZXF1aXJlKCcuL3NyYy9ncmlkX2NvbnRyb2wnKSxcbiAgICBncmlkTGF5ZXI6IHJlcXVpcmUoJy4vc3JjL2dyaWRfbGF5ZXInKSxcbiAgICBtYXJrZXJMYXllcjogcmVxdWlyZSgnLi9zcmMvbWFya2VyX2xheWVyJyksXG4gICAgbWFwOiByZXF1aXJlKCcuL3NyYy9tYXAnKSxcbiAgICBjb25maWc6IHJlcXVpcmUoJy4vc3JjL2NvbmZpZycpLFxuICAgIHNhbml0aXplOiByZXF1aXJlKCdzYW5pdGl6ZS1jYWphJyksXG4gICAgdGVtcGxhdGU6IHJlcXVpcmUoJ211c3RhY2hlJykudG9faHRtbFxufTtcbiIsImZ1bmN0aW9uIHhocih1cmwsIGNhbGxiYWNrLCBjb3JzKSB7XG4gICAgdmFyIHNlbnQgPSBmYWxzZTtcblxuICAgIGlmICh0eXBlb2Ygd2luZG93LlhNTEh0dHBSZXF1ZXN0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soRXJyb3IoJ0Jyb3dzZXIgbm90IHN1cHBvcnRlZCcpKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNvcnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciBtID0gdXJsLm1hdGNoKC9eXFxzKmh0dHBzPzpcXC9cXC9bXlxcL10qLyk7XG4gICAgICAgIGNvcnMgPSBtICYmIChtWzBdICE9PSBsb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyBsb2NhdGlvbi5kb21haW4gK1xuICAgICAgICAgICAgICAgIChsb2NhdGlvbi5wb3J0ID8gJzonICsgbG9jYXRpb24ucG9ydCA6ICcnKSk7XG4gICAgfVxuXG4gICAgdmFyIHg7XG5cbiAgICBmdW5jdGlvbiBpc1N1Y2Nlc3NmdWwoc3RhdHVzKSB7XG4gICAgICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMCB8fCBzdGF0dXMgPT09IDMwNDtcbiAgICB9XG5cbiAgICBpZiAoY29ycyAmJiAoXG4gICAgICAgIC8vIElFNy05IFF1aXJrcyAmIENvbXBhdGliaWxpdHlcbiAgICAgICAgdHlwZW9mIHdpbmRvdy5YRG9tYWluUmVxdWVzdCA9PT0gJ29iamVjdCcgfHxcbiAgICAgICAgLy8gSUU5IFN0YW5kYXJkcyBtb2RlXG4gICAgICAgIHR5cGVvZiB3aW5kb3cuWERvbWFpblJlcXVlc3QgPT09ICdmdW5jdGlvbidcbiAgICApKSB7XG4gICAgICAgIC8vIElFOC0xMFxuICAgICAgICB4ID0gbmV3IHdpbmRvdy5YRG9tYWluUmVxdWVzdCgpO1xuXG4gICAgICAgIC8vIEVuc3VyZSBjYWxsYmFjayBpcyBuZXZlciBjYWxsZWQgc3luY2hyb25vdXNseSwgaS5lLiwgYmVmb3JlXG4gICAgICAgIC8vIHguc2VuZCgpIHJldHVybnMgKHRoaXMgaGFzIGJlZW4gb2JzZXJ2ZWQgaW4gdGhlIHdpbGQpLlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3guanMvaXNzdWVzLzQ3MlxuICAgICAgICB2YXIgb3JpZ2luYWwgPSBjYWxsYmFjaztcbiAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChzZW50KSB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgeCA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkZWQoKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIC8vIFhEb21haW5SZXF1ZXN0XG4gICAgICAgICAgICB4LnN0YXR1cyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICAvLyBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgICAgIGlzU3VjY2Vzc2Z1bCh4LnN0YXR1cykpIGNhbGxiYWNrLmNhbGwoeCwgbnVsbCwgeCk7XG4gICAgICAgIGVsc2UgY2FsbGJhY2suY2FsbCh4LCB4LCBudWxsKTtcbiAgICB9XG5cbiAgICAvLyBCb3RoIGBvbnJlYWR5c3RhdGVjaGFuZ2VgIGFuZCBgb25sb2FkYCBjYW4gZmlyZS4gYG9ucmVhZHlzdGF0ZWNoYW5nZWBcbiAgICAvLyBoYXMgW2JlZW4gc3VwcG9ydGVkIGZvciBsb25nZXJdKGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzkxODE1MDgvMjI5MDAxKS5cbiAgICBpZiAoJ29ubG9hZCcgaW4geCkge1xuICAgICAgICB4Lm9ubG9hZCA9IGxvYWRlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB4Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIHJlYWR5c3RhdGUoKSB7XG4gICAgICAgICAgICBpZiAoeC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgbG9hZGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gQ2FsbCB0aGUgY2FsbGJhY2sgd2l0aCB0aGUgWE1MSHR0cFJlcXVlc3Qgb2JqZWN0IGFzIGFuIGVycm9yIGFuZCBwcmV2ZW50XG4gICAgLy8gaXQgZnJvbSBldmVyIGJlaW5nIGNhbGxlZCBhZ2FpbiBieSByZWFzc2lnbmluZyBpdCB0byBgbm9vcGBcbiAgICB4Lm9uZXJyb3IgPSBmdW5jdGlvbiBlcnJvcihldnQpIHtcbiAgICAgICAgLy8gWERvbWFpblJlcXVlc3QgcHJvdmlkZXMgbm8gZXZ0IHBhcmFtZXRlclxuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGV2dCB8fCB0cnVlLCBudWxsKTtcbiAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbigpIHsgfTtcbiAgICB9O1xuXG4gICAgLy8gSUU5IG11c3QgaGF2ZSBvbnByb2dyZXNzIGJlIHNldCB0byBhIHVuaXF1ZSBmdW5jdGlvbi5cbiAgICB4Lm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbigpIHsgfTtcblxuICAgIHgub250aW1lb3V0ID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZXZ0LCBudWxsKTtcbiAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbigpIHsgfTtcbiAgICB9O1xuXG4gICAgeC5vbmFib3J0ID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZXZ0LCBudWxsKTtcbiAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbigpIHsgfTtcbiAgICB9O1xuXG4gICAgLy8gR0VUIGlzIHRoZSBvbmx5IHN1cHBvcnRlZCBIVFRQIFZlcmIgYnkgWERvbWFpblJlcXVlc3QgYW5kIGlzIHRoZVxuICAgIC8vIG9ubHkgb25lIHN1cHBvcnRlZCBoZXJlLlxuICAgIHgub3BlbignR0VUJywgdXJsLCB0cnVlKTtcblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3QuIFNlbmRpbmcgZGF0YSBpcyBub3Qgc3VwcG9ydGVkLlxuICAgIHguc2VuZChudWxsKTtcbiAgICBzZW50ID0gdHJ1ZTtcblxuICAgIHJldHVybiB4O1xufVxuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIG1vZHVsZS5leHBvcnRzID0geGhyO1xuIiwiLyohIEpTT04gdjMuMi41IHwgaHR0cDovL2Jlc3RpZWpzLmdpdGh1Yi5pby9qc29uMyB8IENvcHlyaWdodCAyMDEyLTIwMTMsIEtpdCBDYW1icmlkZ2UgfCBodHRwOi8va2l0Lm1pdC1saWNlbnNlLm9yZyAqL1xuOyhmdW5jdGlvbiAod2luZG93KSB7XG4gIC8vIENvbnZlbmllbmNlIGFsaWFzZXMuXG4gIHZhciBnZXRDbGFzcyA9IHt9LnRvU3RyaW5nLCBpc1Byb3BlcnR5LCBmb3JFYWNoLCB1bmRlZjtcblxuICAvLyBEZXRlY3QgdGhlIGBkZWZpbmVgIGZ1bmN0aW9uIGV4cG9zZWQgYnkgYXN5bmNocm9ub3VzIG1vZHVsZSBsb2FkZXJzLiBUaGVcbiAgLy8gc3RyaWN0IGBkZWZpbmVgIGNoZWNrIGlzIG5lY2Vzc2FyeSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIGByLmpzYC5cbiAgdmFyIGlzTG9hZGVyID0gdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQsIEpTT04zID0gdHlwZW9mIGV4cG9ydHMgPT0gXCJvYmplY3RcIiAmJiBleHBvcnRzO1xuXG4gIGlmIChKU09OMyB8fCBpc0xvYWRlcikge1xuICAgIGlmICh0eXBlb2YgSlNPTiA9PSBcIm9iamVjdFwiICYmIEpTT04pIHtcbiAgICAgIC8vIERlbGVnYXRlIHRvIHRoZSBuYXRpdmUgYHN0cmluZ2lmeWAgYW5kIGBwYXJzZWAgaW1wbGVtZW50YXRpb25zIGluXG4gICAgICAvLyBhc3luY2hyb25vdXMgbW9kdWxlIGxvYWRlcnMgYW5kIENvbW1vbkpTIGVudmlyb25tZW50cy5cbiAgICAgIGlmIChKU09OMykge1xuICAgICAgICBKU09OMy5zdHJpbmdpZnkgPSBKU09OLnN0cmluZ2lmeTtcbiAgICAgICAgSlNPTjMucGFyc2UgPSBKU09OLnBhcnNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgSlNPTjMgPSBKU09OO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNMb2FkZXIpIHtcbiAgICAgIEpTT04zID0gd2luZG93LkpTT04gPSB7fTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gRXhwb3J0IGZvciB3ZWIgYnJvd3NlcnMgYW5kIEphdmFTY3JpcHQgZW5naW5lcy5cbiAgICBKU09OMyA9IHdpbmRvdy5KU09OIHx8ICh3aW5kb3cuSlNPTiA9IHt9KTtcbiAgfVxuXG4gIC8vIFRlc3QgdGhlIGBEYXRlI2dldFVUQypgIG1ldGhvZHMuIEJhc2VkIG9uIHdvcmsgYnkgQFlhZmZsZS5cbiAgdmFyIGlzRXh0ZW5kZWQgPSBuZXcgRGF0ZSgtMzUwOTgyNzMzNDU3MzI5Mik7XG4gIHRyeSB7XG4gICAgLy8gVGhlIGBnZXRVVENGdWxsWWVhcmAsIGBNb250aGAsIGFuZCBgRGF0ZWAgbWV0aG9kcyByZXR1cm4gbm9uc2Vuc2ljYWxcbiAgICAvLyByZXN1bHRzIGZvciBjZXJ0YWluIGRhdGVzIGluIE9wZXJhID49IDEwLjUzLlxuICAgIGlzRXh0ZW5kZWQgPSBpc0V4dGVuZGVkLmdldFVUQ0Z1bGxZZWFyKCkgPT0gLTEwOTI1MiAmJiBpc0V4dGVuZGVkLmdldFVUQ01vbnRoKCkgPT09IDAgJiYgaXNFeHRlbmRlZC5nZXRVVENEYXRlKCkgPT09IDEgJiZcbiAgICAgIC8vIFNhZmFyaSA8IDIuMC4yIHN0b3JlcyB0aGUgaW50ZXJuYWwgbWlsbGlzZWNvbmQgdGltZSB2YWx1ZSBjb3JyZWN0bHksXG4gICAgICAvLyBidXQgY2xpcHMgdGhlIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgZGF0ZSBtZXRob2RzIHRvIHRoZSByYW5nZSBvZlxuICAgICAgLy8gc2lnbmVkIDMyLWJpdCBpbnRlZ2VycyAoWy0yICoqIDMxLCAyICoqIDMxIC0gMV0pLlxuICAgICAgaXNFeHRlbmRlZC5nZXRVVENIb3VycygpID09IDEwICYmIGlzRXh0ZW5kZWQuZ2V0VVRDTWludXRlcygpID09IDM3ICYmIGlzRXh0ZW5kZWQuZ2V0VVRDU2Vjb25kcygpID09IDYgJiYgaXNFeHRlbmRlZC5nZXRVVENNaWxsaXNlY29uZHMoKSA9PSA3MDg7XG4gIH0gY2F0Y2ggKGV4Y2VwdGlvbikge31cblxuICAvLyBJbnRlcm5hbDogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBuYXRpdmUgYEpTT04uc3RyaW5naWZ5YCBhbmQgYHBhcnNlYFxuICAvLyBpbXBsZW1lbnRhdGlvbnMgYXJlIHNwZWMtY29tcGxpYW50LiBCYXNlZCBvbiB3b3JrIGJ5IEtlbiBTbnlkZXIuXG4gIGZ1bmN0aW9uIGhhcyhuYW1lKSB7XG4gICAgaWYgKG5hbWUgPT0gXCJidWctc3RyaW5nLWNoYXItaW5kZXhcIikge1xuICAgICAgLy8gSUUgPD0gNyBkb2Vzbid0IHN1cHBvcnQgYWNjZXNzaW5nIHN0cmluZyBjaGFyYWN0ZXJzIHVzaW5nIHNxdWFyZVxuICAgICAgLy8gYnJhY2tldCBub3RhdGlvbi4gSUUgOCBvbmx5IHN1cHBvcnRzIHRoaXMgZm9yIHByaW1pdGl2ZXMuXG4gICAgICByZXR1cm4gXCJhXCJbMF0gIT0gXCJhXCI7XG4gICAgfVxuICAgIHZhciB2YWx1ZSwgc2VyaWFsaXplZCA9ICd7XCJhXCI6WzEsdHJ1ZSxmYWxzZSxudWxsLFwiXFxcXHUwMDAwXFxcXGJcXFxcblxcXFxmXFxcXHJcXFxcdFwiXX0nLCBpc0FsbCA9IG5hbWUgPT0gXCJqc29uXCI7XG4gICAgaWYgKGlzQWxsIHx8IG5hbWUgPT0gXCJqc29uLXN0cmluZ2lmeVwiIHx8IG5hbWUgPT0gXCJqc29uLXBhcnNlXCIpIHtcbiAgICAgIC8vIFRlc3QgYEpTT04uc3RyaW5naWZ5YC5cbiAgICAgIGlmIChuYW1lID09IFwianNvbi1zdHJpbmdpZnlcIiB8fCBpc0FsbCkge1xuICAgICAgICB2YXIgc3RyaW5naWZ5ID0gSlNPTjMuc3RyaW5naWZ5LCBzdHJpbmdpZnlTdXBwb3J0ZWQgPSB0eXBlb2Ygc3RyaW5naWZ5ID09IFwiZnVuY3Rpb25cIiAmJiBpc0V4dGVuZGVkO1xuICAgICAgICBpZiAoc3RyaW5naWZ5U3VwcG9ydGVkKSB7XG4gICAgICAgICAgLy8gQSB0ZXN0IGZ1bmN0aW9uIG9iamVjdCB3aXRoIGEgY3VzdG9tIGB0b0pTT05gIG1ldGhvZC5cbiAgICAgICAgICAodmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICB9KS50b0pTT04gPSB2YWx1ZTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgc3RyaW5naWZ5U3VwcG9ydGVkID1cbiAgICAgICAgICAgICAgLy8gRmlyZWZveCAzLjFiMSBhbmQgYjIgc2VyaWFsaXplIHN0cmluZywgbnVtYmVyLCBhbmQgYm9vbGVhblxuICAgICAgICAgICAgICAvLyBwcmltaXRpdmVzIGFzIG9iamVjdCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgc3RyaW5naWZ5KDApID09PSBcIjBcIiAmJlxuICAgICAgICAgICAgICAvLyBGRiAzLjFiMSwgYjIsIGFuZCBKU09OIDIgc2VyaWFsaXplIHdyYXBwZWQgcHJpbWl0aXZlcyBhcyBvYmplY3RcbiAgICAgICAgICAgICAgLy8gbGl0ZXJhbHMuXG4gICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgTnVtYmVyKCkpID09PSBcIjBcIiAmJlxuICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IFN0cmluZygpKSA9PSAnXCJcIicgJiZcbiAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIDIgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIHZhbHVlIGlzIGBudWxsYCwgYHVuZGVmaW5lZGAsIG9yXG4gICAgICAgICAgICAgIC8vIGRvZXMgbm90IGRlZmluZSBhIGNhbm9uaWNhbCBKU09OIHJlcHJlc2VudGF0aW9uICh0aGlzIGFwcGxpZXMgdG9cbiAgICAgICAgICAgICAgLy8gb2JqZWN0cyB3aXRoIGB0b0pTT05gIHByb3BlcnRpZXMgYXMgd2VsbCwgKnVubGVzcyogdGhleSBhcmUgbmVzdGVkXG4gICAgICAgICAgICAgIC8vIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkpLlxuICAgICAgICAgICAgICBzdHJpbmdpZnkoZ2V0Q2xhc3MpID09PSB1bmRlZiAmJlxuICAgICAgICAgICAgICAvLyBJRSA4IHNlcmlhbGl6ZXMgYHVuZGVmaW5lZGAgYXMgYFwidW5kZWZpbmVkXCJgLiBTYWZhcmkgPD0gNS4xLjcgYW5kXG4gICAgICAgICAgICAgIC8vIEZGIDMuMWIzIHBhc3MgdGhpcyB0ZXN0LlxuICAgICAgICAgICAgICBzdHJpbmdpZnkodW5kZWYpID09PSB1bmRlZiAmJlxuICAgICAgICAgICAgICAvLyBTYWZhcmkgPD0gNS4xLjcgYW5kIEZGIDMuMWIzIHRocm93IGBFcnJvcmBzIGFuZCBgVHlwZUVycm9yYHMsXG4gICAgICAgICAgICAgIC8vIHJlc3BlY3RpdmVseSwgaWYgdGhlIHZhbHVlIGlzIG9taXR0ZWQgZW50aXJlbHkuXG4gICAgICAgICAgICAgIHN0cmluZ2lmeSgpID09PSB1bmRlZiAmJlxuICAgICAgICAgICAgICAvLyBGRiAzLjFiMSwgMiB0aHJvdyBhbiBlcnJvciBpZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgbm90IGEgbnVtYmVyLFxuICAgICAgICAgICAgICAvLyBzdHJpbmcsIGFycmF5LCBvYmplY3QsIEJvb2xlYW4sIG9yIGBudWxsYCBsaXRlcmFsLiBUaGlzIGFwcGxpZXMgdG9cbiAgICAgICAgICAgICAgLy8gb2JqZWN0cyB3aXRoIGN1c3RvbSBgdG9KU09OYCBtZXRob2RzIGFzIHdlbGwsIHVubGVzcyB0aGV5IGFyZSBuZXN0ZWRcbiAgICAgICAgICAgICAgLy8gaW5zaWRlIG9iamVjdCBvciBhcnJheSBsaXRlcmFscy4gWVVJIDMuMC4wYjEgaWdub3JlcyBjdXN0b20gYHRvSlNPTmBcbiAgICAgICAgICAgICAgLy8gbWV0aG9kcyBlbnRpcmVseS5cbiAgICAgICAgICAgICAgc3RyaW5naWZ5KHZhbHVlKSA9PT0gXCIxXCIgJiZcbiAgICAgICAgICAgICAgc3RyaW5naWZ5KFt2YWx1ZV0pID09IFwiWzFdXCIgJiZcbiAgICAgICAgICAgICAgLy8gUHJvdG90eXBlIDw9IDEuNi4xIHNlcmlhbGl6ZXMgYFt1bmRlZmluZWRdYCBhcyBgXCJbXVwiYCBpbnN0ZWFkIG9mXG4gICAgICAgICAgICAgIC8vIGBcIltudWxsXVwiYC5cbiAgICAgICAgICAgICAgc3RyaW5naWZ5KFt1bmRlZl0pID09IFwiW251bGxdXCIgJiZcbiAgICAgICAgICAgICAgLy8gWVVJIDMuMC4wYjEgZmFpbHMgdG8gc2VyaWFsaXplIGBudWxsYCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgc3RyaW5naWZ5KG51bGwpID09IFwibnVsbFwiICYmXG4gICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCAyIGhhbHRzIHNlcmlhbGl6YXRpb24gaWYgYW4gYXJyYXkgY29udGFpbnMgYSBmdW5jdGlvbjpcbiAgICAgICAgICAgICAgLy8gYFsxLCB0cnVlLCBnZXRDbGFzcywgMV1gIHNlcmlhbGl6ZXMgYXMgXCJbMSx0cnVlLF0sXCIuIFRoZXNlIHZlcnNpb25zXG4gICAgICAgICAgICAgIC8vIG9mIEZpcmVmb3ggYWxzbyBhbGxvdyB0cmFpbGluZyBjb21tYXMgaW4gSlNPTiBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgICAgICAgICAgIC8vIEZGIDMuMWIzIGVsaWRlcyBub24tSlNPTiB2YWx1ZXMgZnJvbSBvYmplY3RzIGFuZCBhcnJheXMsIHVubGVzcyB0aGV5XG4gICAgICAgICAgICAgIC8vIGRlZmluZSBjdXN0b20gYHRvSlNPTmAgbWV0aG9kcy5cbiAgICAgICAgICAgICAgc3RyaW5naWZ5KFt1bmRlZiwgZ2V0Q2xhc3MsIG51bGxdKSA9PSBcIltudWxsLG51bGwsbnVsbF1cIiAmJlxuICAgICAgICAgICAgICAvLyBTaW1wbGUgc2VyaWFsaXphdGlvbiB0ZXN0LiBGRiAzLjFiMSB1c2VzIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlc1xuICAgICAgICAgICAgICAvLyB3aGVyZSBjaGFyYWN0ZXIgZXNjYXBlIGNvZGVzIGFyZSBleHBlY3RlZCAoZS5nLiwgYFxcYmAgPT4gYFxcdTAwMDhgKS5cbiAgICAgICAgICAgICAgc3RyaW5naWZ5KHsgXCJhXCI6IFt2YWx1ZSwgdHJ1ZSwgZmFsc2UsIG51bGwsIFwiXFx4MDBcXGJcXG5cXGZcXHJcXHRcIl0gfSkgPT0gc2VyaWFsaXplZCAmJlxuICAgICAgICAgICAgICAvLyBGRiAzLjFiMSBhbmQgYjIgaWdub3JlIHRoZSBgZmlsdGVyYCBhbmQgYHdpZHRoYCBhcmd1bWVudHMuXG4gICAgICAgICAgICAgIHN0cmluZ2lmeShudWxsLCB2YWx1ZSkgPT09IFwiMVwiICYmXG4gICAgICAgICAgICAgIHN0cmluZ2lmeShbMSwgMl0sIG51bGwsIDEpID09IFwiW1xcbiAxLFxcbiAyXFxuXVwiICYmXG4gICAgICAgICAgICAgIC8vIEpTT04gMiwgUHJvdG90eXBlIDw9IDEuNywgYW5kIG9sZGVyIFdlYktpdCBidWlsZHMgaW5jb3JyZWN0bHlcbiAgICAgICAgICAgICAgLy8gc2VyaWFsaXplIGV4dGVuZGVkIHllYXJzLlxuICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IERhdGUoLTguNjRlMTUpKSA9PSAnXCItMjcxODIxLTA0LTIwVDAwOjAwOjAwLjAwMFpcIicgJiZcbiAgICAgICAgICAgICAgLy8gVGhlIG1pbGxpc2Vjb25kcyBhcmUgb3B0aW9uYWwgaW4gRVMgNSwgYnV0IHJlcXVpcmVkIGluIDUuMS5cbiAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBEYXRlKDguNjRlMTUpKSA9PSAnXCIrMjc1NzYwLTA5LTEzVDAwOjAwOjAwLjAwMFpcIicgJiZcbiAgICAgICAgICAgICAgLy8gRmlyZWZveCA8PSAxMS4wIGluY29ycmVjdGx5IHNlcmlhbGl6ZXMgeWVhcnMgcHJpb3IgdG8gMCBhcyBuZWdhdGl2ZVxuICAgICAgICAgICAgICAvLyBmb3VyLWRpZ2l0IHllYXJzIGluc3RlYWQgb2Ygc2l4LWRpZ2l0IHllYXJzLiBDcmVkaXRzOiBAWWFmZmxlLlxuICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IERhdGUoLTYyMTk4NzU1MmU1KSkgPT0gJ1wiLTAwMDAwMS0wMS0wMVQwMDowMDowMC4wMDBaXCInICYmXG4gICAgICAgICAgICAgIC8vIFNhZmFyaSA8PSA1LjEuNSBhbmQgT3BlcmEgPj0gMTAuNTMgaW5jb3JyZWN0bHkgc2VyaWFsaXplIG1pbGxpc2Vjb25kXG4gICAgICAgICAgICAgIC8vIHZhbHVlcyBsZXNzIHRoYW4gMTAwMC4gQ3JlZGl0czogQFlhZmZsZS5cbiAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBEYXRlKC0xKSkgPT0gJ1wiMTk2OS0xMi0zMVQyMzo1OTo1OS45OTlaXCInO1xuICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgc3RyaW5naWZ5U3VwcG9ydGVkID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghaXNBbGwpIHtcbiAgICAgICAgICByZXR1cm4gc3RyaW5naWZ5U3VwcG9ydGVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBUZXN0IGBKU09OLnBhcnNlYC5cbiAgICAgIGlmIChuYW1lID09IFwianNvbi1wYXJzZVwiIHx8IGlzQWxsKSB7XG4gICAgICAgIHZhciBwYXJzZSA9IEpTT04zLnBhcnNlO1xuICAgICAgICBpZiAodHlwZW9mIHBhcnNlID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBGRiAzLjFiMSwgYjIgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYSBiYXJlIGxpdGVyYWwgaXMgcHJvdmlkZWQuXG4gICAgICAgICAgICAvLyBDb25mb3JtaW5nIGltcGxlbWVudGF0aW9ucyBzaG91bGQgYWxzbyBjb2VyY2UgdGhlIGluaXRpYWwgYXJndW1lbnQgdG9cbiAgICAgICAgICAgIC8vIGEgc3RyaW5nIHByaW9yIHRvIHBhcnNpbmcuXG4gICAgICAgICAgICBpZiAocGFyc2UoXCIwXCIpID09PSAwICYmICFwYXJzZShmYWxzZSkpIHtcbiAgICAgICAgICAgICAgLy8gU2ltcGxlIHBhcnNpbmcgdGVzdC5cbiAgICAgICAgICAgICAgdmFsdWUgPSBwYXJzZShzZXJpYWxpemVkKTtcbiAgICAgICAgICAgICAgdmFyIHBhcnNlU3VwcG9ydGVkID0gdmFsdWVbXCJhXCJdLmxlbmd0aCA9PSA1ICYmIHZhbHVlW1wiYVwiXVswXSA9PT0gMTtcbiAgICAgICAgICAgICAgaWYgKHBhcnNlU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIC8vIFNhZmFyaSA8PSA1LjEuMiBhbmQgRkYgMy4xYjEgYWxsb3cgdW5lc2NhcGVkIHRhYnMgaW4gc3RyaW5ncy5cbiAgICAgICAgICAgICAgICAgIHBhcnNlU3VwcG9ydGVkID0gIXBhcnNlKCdcIlxcdFwiJyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7fVxuICAgICAgICAgICAgICAgIGlmIChwYXJzZVN1cHBvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRkYgNC4wIGFuZCA0LjAuMSBhbGxvdyBsZWFkaW5nIGArYCBzaWducywgYW5kIGxlYWRpbmcgYW5kXG4gICAgICAgICAgICAgICAgICAgIC8vIHRyYWlsaW5nIGRlY2ltYWwgcG9pbnRzLiBGRiA0LjAsIDQuMC4xLCBhbmQgSUUgOS0xMCBhbHNvXG4gICAgICAgICAgICAgICAgICAgIC8vIGFsbG93IGNlcnRhaW4gb2N0YWwgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlU3VwcG9ydGVkID0gcGFyc2UoXCIwMVwiKSAhPT0gMTtcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgIHBhcnNlU3VwcG9ydGVkID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghaXNBbGwpIHtcbiAgICAgICAgICByZXR1cm4gcGFyc2VTdXBwb3J0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHJpbmdpZnlTdXBwb3J0ZWQgJiYgcGFyc2VTdXBwb3J0ZWQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFoYXMoXCJqc29uXCIpKSB7XG4gICAgLy8gQ29tbW9uIGBbW0NsYXNzXV1gIG5hbWUgYWxpYXNlcy5cbiAgICB2YXIgZnVuY3Rpb25DbGFzcyA9IFwiW29iamVjdCBGdW5jdGlvbl1cIjtcbiAgICB2YXIgZGF0ZUNsYXNzID0gXCJbb2JqZWN0IERhdGVdXCI7XG4gICAgdmFyIG51bWJlckNsYXNzID0gXCJbb2JqZWN0IE51bWJlcl1cIjtcbiAgICB2YXIgc3RyaW5nQ2xhc3MgPSBcIltvYmplY3QgU3RyaW5nXVwiO1xuICAgIHZhciBhcnJheUNsYXNzID0gXCJbb2JqZWN0IEFycmF5XVwiO1xuICAgIHZhciBib29sZWFuQ2xhc3MgPSBcIltvYmplY3QgQm9vbGVhbl1cIjtcblxuICAgIC8vIERldGVjdCBpbmNvbXBsZXRlIHN1cHBvcnQgZm9yIGFjY2Vzc2luZyBzdHJpbmcgY2hhcmFjdGVycyBieSBpbmRleC5cbiAgICB2YXIgY2hhckluZGV4QnVnZ3kgPSBoYXMoXCJidWctc3RyaW5nLWNoYXItaW5kZXhcIik7XG5cbiAgICAvLyBEZWZpbmUgYWRkaXRpb25hbCB1dGlsaXR5IG1ldGhvZHMgaWYgdGhlIGBEYXRlYCBtZXRob2RzIGFyZSBidWdneS5cbiAgICBpZiAoIWlzRXh0ZW5kZWQpIHtcbiAgICAgIHZhciBmbG9vciA9IE1hdGguZmxvb3I7XG4gICAgICAvLyBBIG1hcHBpbmcgYmV0d2VlbiB0aGUgbW9udGhzIG9mIHRoZSB5ZWFyIGFuZCB0aGUgbnVtYmVyIG9mIGRheXMgYmV0d2VlblxuICAgICAgLy8gSmFudWFyeSAxc3QgYW5kIHRoZSBmaXJzdCBvZiB0aGUgcmVzcGVjdGl2ZSBtb250aC5cbiAgICAgIHZhciBNb250aHMgPSBbMCwgMzEsIDU5LCA5MCwgMTIwLCAxNTEsIDE4MSwgMjEyLCAyNDMsIDI3MywgMzA0LCAzMzRdO1xuICAgICAgLy8gSW50ZXJuYWw6IENhbGN1bGF0ZXMgdGhlIG51bWJlciBvZiBkYXlzIGJldHdlZW4gdGhlIFVuaXggZXBvY2ggYW5kIHRoZVxuICAgICAgLy8gZmlyc3QgZGF5IG9mIHRoZSBnaXZlbiBtb250aC5cbiAgICAgIHZhciBnZXREYXkgPSBmdW5jdGlvbiAoeWVhciwgbW9udGgpIHtcbiAgICAgICAgcmV0dXJuIE1vbnRoc1ttb250aF0gKyAzNjUgKiAoeWVhciAtIDE5NzApICsgZmxvb3IoKHllYXIgLSAxOTY5ICsgKG1vbnRoID0gKyhtb250aCA+IDEpKSkgLyA0KSAtIGZsb29yKCh5ZWFyIC0gMTkwMSArIG1vbnRoKSAvIDEwMCkgKyBmbG9vcigoeWVhciAtIDE2MDEgKyBtb250aCkgLyA0MDApO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBJbnRlcm5hbDogRGV0ZXJtaW5lcyBpZiBhIHByb3BlcnR5IGlzIGEgZGlyZWN0IHByb3BlcnR5IG9mIHRoZSBnaXZlblxuICAgIC8vIG9iamVjdC4gRGVsZWdhdGVzIHRvIHRoZSBuYXRpdmUgYE9iamVjdCNoYXNPd25Qcm9wZXJ0eWAgbWV0aG9kLlxuICAgIGlmICghKGlzUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eSkpIHtcbiAgICAgIGlzUHJvcGVydHkgPSBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgICAgdmFyIG1lbWJlcnMgPSB7fSwgY29uc3RydWN0b3I7XG4gICAgICAgIGlmICgobWVtYmVycy5fX3Byb3RvX18gPSBudWxsLCBtZW1iZXJzLl9fcHJvdG9fXyA9IHtcbiAgICAgICAgICAvLyBUaGUgKnByb3RvKiBwcm9wZXJ0eSBjYW5ub3QgYmUgc2V0IG11bHRpcGxlIHRpbWVzIGluIHJlY2VudFxuICAgICAgICAgIC8vIHZlcnNpb25zIG9mIEZpcmVmb3ggYW5kIFNlYU1vbmtleS5cbiAgICAgICAgICBcInRvU3RyaW5nXCI6IDFcbiAgICAgICAgfSwgbWVtYmVycykudG9TdHJpbmcgIT0gZ2V0Q2xhc3MpIHtcbiAgICAgICAgICAvLyBTYWZhcmkgPD0gMi4wLjMgZG9lc24ndCBpbXBsZW1lbnQgYE9iamVjdCNoYXNPd25Qcm9wZXJ0eWAsIGJ1dFxuICAgICAgICAgIC8vIHN1cHBvcnRzIHRoZSBtdXRhYmxlICpwcm90byogcHJvcGVydHkuXG4gICAgICAgICAgaXNQcm9wZXJ0eSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICAgICAgLy8gQ2FwdHVyZSBhbmQgYnJlYWsgdGhlIG9iamVjdCdzIHByb3RvdHlwZSBjaGFpbiAoc2VlIHNlY3Rpb24gOC42LjJcbiAgICAgICAgICAgIC8vIG9mIHRoZSBFUyA1LjEgc3BlYykuIFRoZSBwYXJlbnRoZXNpemVkIGV4cHJlc3Npb24gcHJldmVudHMgYW5cbiAgICAgICAgICAgIC8vIHVuc2FmZSB0cmFuc2Zvcm1hdGlvbiBieSB0aGUgQ2xvc3VyZSBDb21waWxlci5cbiAgICAgICAgICAgIHZhciBvcmlnaW5hbCA9IHRoaXMuX19wcm90b19fLCByZXN1bHQgPSBwcm9wZXJ0eSBpbiAodGhpcy5fX3Byb3RvX18gPSBudWxsLCB0aGlzKTtcbiAgICAgICAgICAgIC8vIFJlc3RvcmUgdGhlIG9yaWdpbmFsIHByb3RvdHlwZSBjaGFpbi5cbiAgICAgICAgICAgIHRoaXMuX19wcm90b19fID0gb3JpZ2luYWw7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQ2FwdHVyZSBhIHJlZmVyZW5jZSB0byB0aGUgdG9wLWxldmVsIGBPYmplY3RgIGNvbnN0cnVjdG9yLlxuICAgICAgICAgIGNvbnN0cnVjdG9yID0gbWVtYmVycy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAvLyBVc2UgdGhlIGBjb25zdHJ1Y3RvcmAgcHJvcGVydHkgdG8gc2ltdWxhdGUgYE9iamVjdCNoYXNPd25Qcm9wZXJ0eWAgaW5cbiAgICAgICAgICAvLyBvdGhlciBlbnZpcm9ubWVudHMuXG4gICAgICAgICAgaXNQcm9wZXJ0eSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9ICh0aGlzLmNvbnN0cnVjdG9yIHx8IGNvbnN0cnVjdG9yKS5wcm90b3R5cGU7XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHkgaW4gdGhpcyAmJiAhKHByb3BlcnR5IGluIHBhcmVudCAmJiB0aGlzW3Byb3BlcnR5XSA9PT0gcGFyZW50W3Byb3BlcnR5XSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBtZW1iZXJzID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGlzUHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEludGVybmFsOiBOb3JtYWxpemVzIHRoZSBgZm9yLi4uaW5gIGl0ZXJhdGlvbiBhbGdvcml0aG0gYWNyb3NzXG4gICAgLy8gZW52aXJvbm1lbnRzLiBFYWNoIGVudW1lcmF0ZWQga2V5IGlzIHlpZWxkZWQgdG8gYSBgY2FsbGJhY2tgIGZ1bmN0aW9uLlxuICAgIGZvckVhY2ggPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgICAgdmFyIHNpemUgPSAwLCBQcm9wZXJ0aWVzLCBtZW1iZXJzLCBwcm9wZXJ0eSwgZm9yRWFjaDtcblxuICAgICAgLy8gVGVzdHMgZm9yIGJ1Z3MgaW4gdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQncyBgZm9yLi4uaW5gIGFsZ29yaXRobS4gVGhlXG4gICAgICAvLyBgdmFsdWVPZmAgcHJvcGVydHkgaW5oZXJpdHMgdGhlIG5vbi1lbnVtZXJhYmxlIGZsYWcgZnJvbVxuICAgICAgLy8gYE9iamVjdC5wcm90b3R5cGVgIGluIG9sZGVyIHZlcnNpb25zIG9mIElFLCBOZXRzY2FwZSwgYW5kIE1vemlsbGEuXG4gICAgICAoUHJvcGVydGllcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy52YWx1ZU9mID0gMDtcbiAgICAgIH0pLnByb3RvdHlwZS52YWx1ZU9mID0gMDtcblxuICAgICAgLy8gSXRlcmF0ZSBvdmVyIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBgUHJvcGVydGllc2AgY2xhc3MuXG4gICAgICBtZW1iZXJzID0gbmV3IFByb3BlcnRpZXMoKTtcbiAgICAgIGZvciAocHJvcGVydHkgaW4gbWVtYmVycykge1xuICAgICAgICAvLyBJZ25vcmUgYWxsIHByb3BlcnRpZXMgaW5oZXJpdGVkIGZyb20gYE9iamVjdC5wcm90b3R5cGVgLlxuICAgICAgICBpZiAoaXNQcm9wZXJ0eS5jYWxsKG1lbWJlcnMsIHByb3BlcnR5KSkge1xuICAgICAgICAgIHNpemUrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgUHJvcGVydGllcyA9IG1lbWJlcnMgPSBudWxsO1xuXG4gICAgICAvLyBOb3JtYWxpemUgdGhlIGl0ZXJhdGlvbiBhbGdvcml0aG0uXG4gICAgICBpZiAoIXNpemUpIHtcbiAgICAgICAgLy8gQSBsaXN0IG9mIG5vbi1lbnVtZXJhYmxlIHByb3BlcnRpZXMgaW5oZXJpdGVkIGZyb20gYE9iamVjdC5wcm90b3R5cGVgLlxuICAgICAgICBtZW1iZXJzID0gW1widmFsdWVPZlwiLCBcInRvU3RyaW5nXCIsIFwidG9Mb2NhbGVTdHJpbmdcIiwgXCJwcm9wZXJ0eUlzRW51bWVyYWJsZVwiLCBcImlzUHJvdG90eXBlT2ZcIiwgXCJoYXNPd25Qcm9wZXJ0eVwiLCBcImNvbnN0cnVjdG9yXCJdO1xuICAgICAgICAvLyBJRSA8PSA4LCBNb3ppbGxhIDEuMCwgYW5kIE5ldHNjYXBlIDYuMiBpZ25vcmUgc2hhZG93ZWQgbm9uLWVudW1lcmFibGVcbiAgICAgICAgLy8gcHJvcGVydGllcy5cbiAgICAgICAgZm9yRWFjaCA9IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgdmFyIGlzRnVuY3Rpb24gPSBnZXRDbGFzcy5jYWxsKG9iamVjdCkgPT0gZnVuY3Rpb25DbGFzcywgcHJvcGVydHksIGxlbmd0aDtcbiAgICAgICAgICBmb3IgKHByb3BlcnR5IGluIG9iamVjdCkge1xuICAgICAgICAgICAgLy8gR2Vja28gPD0gMS4wIGVudW1lcmF0ZXMgdGhlIGBwcm90b3R5cGVgIHByb3BlcnR5IG9mIGZ1bmN0aW9ucyB1bmRlclxuICAgICAgICAgICAgLy8gY2VydGFpbiBjb25kaXRpb25zOyBJRSBkb2VzIG5vdC5cbiAgICAgICAgICAgIGlmICghKGlzRnVuY3Rpb24gJiYgcHJvcGVydHkgPT0gXCJwcm90b3R5cGVcIikgJiYgaXNQcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKHByb3BlcnR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTWFudWFsbHkgaW52b2tlIHRoZSBjYWxsYmFjayBmb3IgZWFjaCBub24tZW51bWVyYWJsZSBwcm9wZXJ0eS5cbiAgICAgICAgICBmb3IgKGxlbmd0aCA9IG1lbWJlcnMubGVuZ3RoOyBwcm9wZXJ0eSA9IG1lbWJlcnNbLS1sZW5ndGhdOyBpc1Byb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSkgJiYgY2FsbGJhY2socHJvcGVydHkpKTtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoc2l6ZSA9PSAyKSB7XG4gICAgICAgIC8vIFNhZmFyaSA8PSAyLjAuNCBlbnVtZXJhdGVzIHNoYWRvd2VkIHByb3BlcnRpZXMgdHdpY2UuXG4gICAgICAgIGZvckVhY2ggPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgICAgICAgIC8vIENyZWF0ZSBhIHNldCBvZiBpdGVyYXRlZCBwcm9wZXJ0aWVzLlxuICAgICAgICAgIHZhciBtZW1iZXJzID0ge30sIGlzRnVuY3Rpb24gPSBnZXRDbGFzcy5jYWxsKG9iamVjdCkgPT0gZnVuY3Rpb25DbGFzcywgcHJvcGVydHk7XG4gICAgICAgICAgZm9yIChwcm9wZXJ0eSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgIC8vIFN0b3JlIGVhY2ggcHJvcGVydHkgbmFtZSB0byBwcmV2ZW50IGRvdWJsZSBlbnVtZXJhdGlvbi4gVGhlXG4gICAgICAgICAgICAvLyBgcHJvdG90eXBlYCBwcm9wZXJ0eSBvZiBmdW5jdGlvbnMgaXMgbm90IGVudW1lcmF0ZWQgZHVlIHRvIGNyb3NzLVxuICAgICAgICAgICAgLy8gZW52aXJvbm1lbnQgaW5jb25zaXN0ZW5jaWVzLlxuICAgICAgICAgICAgaWYgKCEoaXNGdW5jdGlvbiAmJiBwcm9wZXJ0eSA9PSBcInByb3RvdHlwZVwiKSAmJiAhaXNQcm9wZXJ0eS5jYWxsKG1lbWJlcnMsIHByb3BlcnR5KSAmJiAobWVtYmVyc1twcm9wZXJ0eV0gPSAxKSAmJiBpc1Byb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2socHJvcGVydHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE5vIGJ1Z3MgZGV0ZWN0ZWQ7IHVzZSB0aGUgc3RhbmRhcmQgYGZvci4uLmluYCBhbGdvcml0aG0uXG4gICAgICAgIGZvckVhY2ggPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgICAgICAgIHZhciBpc0Z1bmN0aW9uID0gZ2V0Q2xhc3MuY2FsbChvYmplY3QpID09IGZ1bmN0aW9uQ2xhc3MsIHByb3BlcnR5LCBpc0NvbnN0cnVjdG9yO1xuICAgICAgICAgIGZvciAocHJvcGVydHkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICBpZiAoIShpc0Z1bmN0aW9uICYmIHByb3BlcnR5ID09IFwicHJvdG90eXBlXCIpICYmIGlzUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSAmJiAhKGlzQ29uc3RydWN0b3IgPSBwcm9wZXJ0eSA9PT0gXCJjb25zdHJ1Y3RvclwiKSkge1xuICAgICAgICAgICAgICBjYWxsYmFjayhwcm9wZXJ0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIE1hbnVhbGx5IGludm9rZSB0aGUgY2FsbGJhY2sgZm9yIHRoZSBgY29uc3RydWN0b3JgIHByb3BlcnR5IGR1ZSB0b1xuICAgICAgICAgIC8vIGNyb3NzLWVudmlyb25tZW50IGluY29uc2lzdGVuY2llcy5cbiAgICAgICAgICBpZiAoaXNDb25zdHJ1Y3RvciB8fCBpc1Byb3BlcnR5LmNhbGwob2JqZWN0LCAocHJvcGVydHkgPSBcImNvbnN0cnVjdG9yXCIpKSkge1xuICAgICAgICAgICAgY2FsbGJhY2socHJvcGVydHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmb3JFYWNoKG9iamVjdCwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICAvLyBQdWJsaWM6IFNlcmlhbGl6ZXMgYSBKYXZhU2NyaXB0IGB2YWx1ZWAgYXMgYSBKU09OIHN0cmluZy4gVGhlIG9wdGlvbmFsXG4gICAgLy8gYGZpbHRlcmAgYXJndW1lbnQgbWF5IHNwZWNpZnkgZWl0aGVyIGEgZnVuY3Rpb24gdGhhdCBhbHRlcnMgaG93IG9iamVjdCBhbmRcbiAgICAvLyBhcnJheSBtZW1iZXJzIGFyZSBzZXJpYWxpemVkLCBvciBhbiBhcnJheSBvZiBzdHJpbmdzIGFuZCBudW1iZXJzIHRoYXRcbiAgICAvLyBpbmRpY2F0ZXMgd2hpY2ggcHJvcGVydGllcyBzaG91bGQgYmUgc2VyaWFsaXplZC4gVGhlIG9wdGlvbmFsIGB3aWR0aGBcbiAgICAvLyBhcmd1bWVudCBtYXkgYmUgZWl0aGVyIGEgc3RyaW5nIG9yIG51bWJlciB0aGF0IHNwZWNpZmllcyB0aGUgaW5kZW50YXRpb25cbiAgICAvLyBsZXZlbCBvZiB0aGUgb3V0cHV0LlxuICAgIGlmICghaGFzKFwianNvbi1zdHJpbmdpZnlcIikpIHtcbiAgICAgIC8vIEludGVybmFsOiBBIG1hcCBvZiBjb250cm9sIGNoYXJhY3RlcnMgYW5kIHRoZWlyIGVzY2FwZWQgZXF1aXZhbGVudHMuXG4gICAgICB2YXIgRXNjYXBlcyA9IHtcbiAgICAgICAgOTI6IFwiXFxcXFxcXFxcIixcbiAgICAgICAgMzQ6ICdcXFxcXCInLFxuICAgICAgICA4OiBcIlxcXFxiXCIsXG4gICAgICAgIDEyOiBcIlxcXFxmXCIsXG4gICAgICAgIDEwOiBcIlxcXFxuXCIsXG4gICAgICAgIDEzOiBcIlxcXFxyXCIsXG4gICAgICAgIDk6IFwiXFxcXHRcIlxuICAgICAgfTtcblxuICAgICAgLy8gSW50ZXJuYWw6IENvbnZlcnRzIGB2YWx1ZWAgaW50byBhIHplcm8tcGFkZGVkIHN0cmluZyBzdWNoIHRoYXQgaXRzXG4gICAgICAvLyBsZW5ndGggaXMgYXQgbGVhc3QgZXF1YWwgdG8gYHdpZHRoYC4gVGhlIGB3aWR0aGAgbXVzdCBiZSA8PSA2LlxuICAgICAgdmFyIGxlYWRpbmdaZXJvZXMgPSBcIjAwMDAwMFwiO1xuICAgICAgdmFyIHRvUGFkZGVkU3RyaW5nID0gZnVuY3Rpb24gKHdpZHRoLCB2YWx1ZSkge1xuICAgICAgICAvLyBUaGUgYHx8IDBgIGV4cHJlc3Npb24gaXMgbmVjZXNzYXJ5IHRvIHdvcmsgYXJvdW5kIGEgYnVnIGluXG4gICAgICAgIC8vIE9wZXJhIDw9IDcuNTR1MiB3aGVyZSBgMCA9PSAtMGAsIGJ1dCBgU3RyaW5nKC0wKSAhPT0gXCIwXCJgLlxuICAgICAgICByZXR1cm4gKGxlYWRpbmdaZXJvZXMgKyAodmFsdWUgfHwgMCkpLnNsaWNlKC13aWR0aCk7XG4gICAgICB9O1xuXG4gICAgICAvLyBJbnRlcm5hbDogRG91YmxlLXF1b3RlcyBhIHN0cmluZyBgdmFsdWVgLCByZXBsYWNpbmcgYWxsIEFTQ0lJIGNvbnRyb2xcbiAgICAgIC8vIGNoYXJhY3RlcnMgKGNoYXJhY3RlcnMgd2l0aCBjb2RlIHVuaXQgdmFsdWVzIGJldHdlZW4gMCBhbmQgMzEpIHdpdGhcbiAgICAgIC8vIHRoZWlyIGVzY2FwZWQgZXF1aXZhbGVudHMuIFRoaXMgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgdGhlXG4gICAgICAvLyBgUXVvdGUodmFsdWUpYCBvcGVyYXRpb24gZGVmaW5lZCBpbiBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLlxuICAgICAgdmFyIHVuaWNvZGVQcmVmaXggPSBcIlxcXFx1MDBcIjtcbiAgICAgIHZhciBxdW90ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gJ1wiJywgaW5kZXggPSAwLCBsZW5ndGggPSB2YWx1ZS5sZW5ndGgsIGlzTGFyZ2UgPSBsZW5ndGggPiAxMCAmJiBjaGFySW5kZXhCdWdneSwgc3ltYm9scztcbiAgICAgICAgaWYgKGlzTGFyZ2UpIHtcbiAgICAgICAgICBzeW1ib2xzID0gdmFsdWUuc3BsaXQoXCJcIik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgdmFyIGNoYXJDb2RlID0gdmFsdWUuY2hhckNvZGVBdChpbmRleCk7XG4gICAgICAgICAgLy8gSWYgdGhlIGNoYXJhY3RlciBpcyBhIGNvbnRyb2wgY2hhcmFjdGVyLCBhcHBlbmQgaXRzIFVuaWNvZGUgb3JcbiAgICAgICAgICAvLyBzaG9ydGhhbmQgZXNjYXBlIHNlcXVlbmNlOyBvdGhlcndpc2UsIGFwcGVuZCB0aGUgY2hhcmFjdGVyIGFzLWlzLlxuICAgICAgICAgIHN3aXRjaCAoY2hhckNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgODogY2FzZSA5OiBjYXNlIDEwOiBjYXNlIDEyOiBjYXNlIDEzOiBjYXNlIDM0OiBjYXNlIDkyOlxuICAgICAgICAgICAgICByZXN1bHQgKz0gRXNjYXBlc1tjaGFyQ29kZV07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlIDwgMzIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gdW5pY29kZVByZWZpeCArIHRvUGFkZGVkU3RyaW5nKDIsIGNoYXJDb2RlLnRvU3RyaW5nKDE2KSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmVzdWx0ICs9IGlzTGFyZ2UgPyBzeW1ib2xzW2luZGV4XSA6IGNoYXJJbmRleEJ1Z2d5ID8gdmFsdWUuY2hhckF0KGluZGV4KSA6IHZhbHVlW2luZGV4XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdCArICdcIic7XG4gICAgICB9O1xuXG4gICAgICAvLyBJbnRlcm5hbDogUmVjdXJzaXZlbHkgc2VyaWFsaXplcyBhbiBvYmplY3QuIEltcGxlbWVudHMgdGhlXG4gICAgICAvLyBgU3RyKGtleSwgaG9sZGVyKWAsIGBKTyh2YWx1ZSlgLCBhbmQgYEpBKHZhbHVlKWAgb3BlcmF0aW9ucy5cbiAgICAgIHZhciBzZXJpYWxpemUgPSBmdW5jdGlvbiAocHJvcGVydHksIG9iamVjdCwgY2FsbGJhY2ssIHByb3BlcnRpZXMsIHdoaXRlc3BhY2UsIGluZGVudGF0aW9uLCBzdGFjaykge1xuICAgICAgICB2YXIgdmFsdWUgPSBvYmplY3RbcHJvcGVydHldLCBjbGFzc05hbWUsIHllYXIsIG1vbnRoLCBkYXRlLCB0aW1lLCBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzZWNvbmRzLCByZXN1bHRzLCBlbGVtZW50LCBpbmRleCwgbGVuZ3RoLCBwcmVmaXgsIGhhc01lbWJlcnMsIHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBOZWNlc3NhcnkgZm9yIGhvc3Qgb2JqZWN0IHN1cHBvcnQuXG4gICAgICAgICAgdmFsdWUgPSBvYmplY3RbcHJvcGVydHldO1xuICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHt9XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIiAmJiB2YWx1ZSkge1xuICAgICAgICAgIGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwodmFsdWUpO1xuICAgICAgICAgIGlmIChjbGFzc05hbWUgPT0gZGF0ZUNsYXNzICYmICFpc1Byb3BlcnR5LmNhbGwodmFsdWUsIFwidG9KU09OXCIpKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPiAtMSAvIDAgJiYgdmFsdWUgPCAxIC8gMCkge1xuICAgICAgICAgICAgICAvLyBEYXRlcyBhcmUgc2VyaWFsaXplZCBhY2NvcmRpbmcgdG8gdGhlIGBEYXRlI3RvSlNPTmAgbWV0aG9kXG4gICAgICAgICAgICAgIC8vIHNwZWNpZmllZCBpbiBFUyA1LjEgc2VjdGlvbiAxNS45LjUuNDQuIFNlZSBzZWN0aW9uIDE1LjkuMS4xNVxuICAgICAgICAgICAgICAvLyBmb3IgdGhlIElTTyA4NjAxIGRhdGUgdGltZSBzdHJpbmcgZm9ybWF0LlxuICAgICAgICAgICAgICBpZiAoZ2V0RGF5KSB7XG4gICAgICAgICAgICAgICAgLy8gTWFudWFsbHkgY29tcHV0ZSB0aGUgeWVhciwgbW9udGgsIGRhdGUsIGhvdXJzLCBtaW51dGVzLFxuICAgICAgICAgICAgICAgIC8vIHNlY29uZHMsIGFuZCBtaWxsaXNlY29uZHMgaWYgdGhlIGBnZXRVVEMqYCBtZXRob2RzIGFyZVxuICAgICAgICAgICAgICAgIC8vIGJ1Z2d5LiBBZGFwdGVkIGZyb20gQFlhZmZsZSdzIGBkYXRlLXNoaW1gIHByb2plY3QuXG4gICAgICAgICAgICAgICAgZGF0ZSA9IGZsb29yKHZhbHVlIC8gODY0ZTUpO1xuICAgICAgICAgICAgICAgIGZvciAoeWVhciA9IGZsb29yKGRhdGUgLyAzNjUuMjQyNSkgKyAxOTcwIC0gMTsgZ2V0RGF5KHllYXIgKyAxLCAwKSA8PSBkYXRlOyB5ZWFyKyspO1xuICAgICAgICAgICAgICAgIGZvciAobW9udGggPSBmbG9vcigoZGF0ZSAtIGdldERheSh5ZWFyLCAwKSkgLyAzMC40Mik7IGdldERheSh5ZWFyLCBtb250aCArIDEpIDw9IGRhdGU7IG1vbnRoKyspO1xuICAgICAgICAgICAgICAgIGRhdGUgPSAxICsgZGF0ZSAtIGdldERheSh5ZWFyLCBtb250aCk7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGB0aW1lYCB2YWx1ZSBzcGVjaWZpZXMgdGhlIHRpbWUgd2l0aGluIHRoZSBkYXkgKHNlZSBFU1xuICAgICAgICAgICAgICAgIC8vIDUuMSBzZWN0aW9uIDE1LjkuMS4yKS4gVGhlIGZvcm11bGEgYChBICUgQiArIEIpICUgQmAgaXMgdXNlZFxuICAgICAgICAgICAgICAgIC8vIHRvIGNvbXB1dGUgYEEgbW9kdWxvIEJgLCBhcyB0aGUgYCVgIG9wZXJhdG9yIGRvZXMgbm90XG4gICAgICAgICAgICAgICAgLy8gY29ycmVzcG9uZCB0byB0aGUgYG1vZHVsb2Agb3BlcmF0aW9uIGZvciBuZWdhdGl2ZSBudW1iZXJzLlxuICAgICAgICAgICAgICAgIHRpbWUgPSAodmFsdWUgJSA4NjRlNSArIDg2NGU1KSAlIDg2NGU1O1xuICAgICAgICAgICAgICAgIC8vIFRoZSBob3VycywgbWludXRlcywgc2Vjb25kcywgYW5kIG1pbGxpc2Vjb25kcyBhcmUgb2J0YWluZWQgYnlcbiAgICAgICAgICAgICAgICAvLyBkZWNvbXBvc2luZyB0aGUgdGltZSB3aXRoaW4gdGhlIGRheS4gU2VlIHNlY3Rpb24gMTUuOS4xLjEwLlxuICAgICAgICAgICAgICAgIGhvdXJzID0gZmxvb3IodGltZSAvIDM2ZTUpICUgMjQ7XG4gICAgICAgICAgICAgICAgbWludXRlcyA9IGZsb29yKHRpbWUgLyA2ZTQpICUgNjA7XG4gICAgICAgICAgICAgICAgc2Vjb25kcyA9IGZsb29yKHRpbWUgLyAxZTMpICUgNjA7XG4gICAgICAgICAgICAgICAgbWlsbGlzZWNvbmRzID0gdGltZSAlIDFlMztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB5ZWFyID0gdmFsdWUuZ2V0VVRDRnVsbFllYXIoKTtcbiAgICAgICAgICAgICAgICBtb250aCA9IHZhbHVlLmdldFVUQ01vbnRoKCk7XG4gICAgICAgICAgICAgICAgZGF0ZSA9IHZhbHVlLmdldFVUQ0RhdGUoKTtcbiAgICAgICAgICAgICAgICBob3VycyA9IHZhbHVlLmdldFVUQ0hvdXJzKCk7XG4gICAgICAgICAgICAgICAgbWludXRlcyA9IHZhbHVlLmdldFVUQ01pbnV0ZXMoKTtcbiAgICAgICAgICAgICAgICBzZWNvbmRzID0gdmFsdWUuZ2V0VVRDU2Vjb25kcygpO1xuICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kcyA9IHZhbHVlLmdldFVUQ01pbGxpc2Vjb25kcygpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFNlcmlhbGl6ZSBleHRlbmRlZCB5ZWFycyBjb3JyZWN0bHkuXG4gICAgICAgICAgICAgIHZhbHVlID0gKHllYXIgPD0gMCB8fCB5ZWFyID49IDFlNCA/ICh5ZWFyIDwgMCA/IFwiLVwiIDogXCIrXCIpICsgdG9QYWRkZWRTdHJpbmcoNiwgeWVhciA8IDAgPyAteWVhciA6IHllYXIpIDogdG9QYWRkZWRTdHJpbmcoNCwgeWVhcikpICtcbiAgICAgICAgICAgICAgICBcIi1cIiArIHRvUGFkZGVkU3RyaW5nKDIsIG1vbnRoICsgMSkgKyBcIi1cIiArIHRvUGFkZGVkU3RyaW5nKDIsIGRhdGUpICtcbiAgICAgICAgICAgICAgICAvLyBNb250aHMsIGRhdGVzLCBob3VycywgbWludXRlcywgYW5kIHNlY29uZHMgc2hvdWxkIGhhdmUgdHdvXG4gICAgICAgICAgICAgICAgLy8gZGlnaXRzOyBtaWxsaXNlY29uZHMgc2hvdWxkIGhhdmUgdGhyZWUuXG4gICAgICAgICAgICAgICAgXCJUXCIgKyB0b1BhZGRlZFN0cmluZygyLCBob3VycykgKyBcIjpcIiArIHRvUGFkZGVkU3RyaW5nKDIsIG1pbnV0ZXMpICsgXCI6XCIgKyB0b1BhZGRlZFN0cmluZygyLCBzZWNvbmRzKSArXG4gICAgICAgICAgICAgICAgLy8gTWlsbGlzZWNvbmRzIGFyZSBvcHRpb25hbCBpbiBFUyA1LjAsIGJ1dCByZXF1aXJlZCBpbiA1LjEuXG4gICAgICAgICAgICAgICAgXCIuXCIgKyB0b1BhZGRlZFN0cmluZygzLCBtaWxsaXNlY29uZHMpICsgXCJaXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUudG9KU09OID09IFwiZnVuY3Rpb25cIiAmJiAoKGNsYXNzTmFtZSAhPSBudW1iZXJDbGFzcyAmJiBjbGFzc05hbWUgIT0gc3RyaW5nQ2xhc3MgJiYgY2xhc3NOYW1lICE9IGFycmF5Q2xhc3MpIHx8IGlzUHJvcGVydHkuY2FsbCh2YWx1ZSwgXCJ0b0pTT05cIikpKSB7XG4gICAgICAgICAgICAvLyBQcm90b3R5cGUgPD0gMS42LjEgYWRkcyBub24tc3RhbmRhcmQgYHRvSlNPTmAgbWV0aG9kcyB0byB0aGVcbiAgICAgICAgICAgIC8vIGBOdW1iZXJgLCBgU3RyaW5nYCwgYERhdGVgLCBhbmQgYEFycmF5YCBwcm90b3R5cGVzLiBKU09OIDNcbiAgICAgICAgICAgIC8vIGlnbm9yZXMgYWxsIGB0b0pTT05gIG1ldGhvZHMgb24gdGhlc2Ugb2JqZWN0cyB1bmxlc3MgdGhleSBhcmVcbiAgICAgICAgICAgIC8vIGRlZmluZWQgZGlyZWN0bHkgb24gYW4gaW5zdGFuY2UuXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvSlNPTihwcm9wZXJ0eSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIC8vIElmIGEgcmVwbGFjZW1lbnQgZnVuY3Rpb24gd2FzIHByb3ZpZGVkLCBjYWxsIGl0IHRvIG9idGFpbiB0aGUgdmFsdWVcbiAgICAgICAgICAvLyBmb3Igc2VyaWFsaXphdGlvbi5cbiAgICAgICAgICB2YWx1ZSA9IGNhbGxiYWNrLmNhbGwob2JqZWN0LCBwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICAgICAgfVxuICAgICAgICBjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKHZhbHVlKTtcbiAgICAgICAgaWYgKGNsYXNzTmFtZSA9PSBib29sZWFuQ2xhc3MpIHtcbiAgICAgICAgICAvLyBCb29sZWFucyBhcmUgcmVwcmVzZW50ZWQgbGl0ZXJhbGx5LlxuICAgICAgICAgIHJldHVybiBcIlwiICsgdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoY2xhc3NOYW1lID09IG51bWJlckNsYXNzKSB7XG4gICAgICAgICAgLy8gSlNPTiBudW1iZXJzIG11c3QgYmUgZmluaXRlLiBgSW5maW5pdHlgIGFuZCBgTmFOYCBhcmUgc2VyaWFsaXplZCBhc1xuICAgICAgICAgIC8vIGBcIm51bGxcImAuXG4gICAgICAgICAgcmV0dXJuIHZhbHVlID4gLTEgLyAwICYmIHZhbHVlIDwgMSAvIDAgPyBcIlwiICsgdmFsdWUgOiBcIm51bGxcIjtcbiAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWUgPT0gc3RyaW5nQ2xhc3MpIHtcbiAgICAgICAgICAvLyBTdHJpbmdzIGFyZSBkb3VibGUtcXVvdGVkIGFuZCBlc2NhcGVkLlxuICAgICAgICAgIHJldHVybiBxdW90ZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVjdXJzaXZlbHkgc2VyaWFsaXplIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGlzIGlzIGEgbGluZWFyIHNlYXJjaDsgcGVyZm9ybWFuY2VcbiAgICAgICAgICAvLyBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2YgdW5pcXVlIG5lc3RlZCBvYmplY3RzLlxuICAgICAgICAgIGZvciAobGVuZ3RoID0gc3RhY2subGVuZ3RoOyBsZW5ndGgtLTspIHtcbiAgICAgICAgICAgIGlmIChzdGFja1tsZW5ndGhdID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAvLyBDeWNsaWMgc3RydWN0dXJlcyBjYW5ub3QgYmUgc2VyaWFsaXplZCBieSBgSlNPTi5zdHJpbmdpZnlgLlxuICAgICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gQWRkIHRoZSBvYmplY3QgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgICAgICAgIHN0YWNrLnB1c2godmFsdWUpO1xuICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAvLyBTYXZlIHRoZSBjdXJyZW50IGluZGVudGF0aW9uIGxldmVsIGFuZCBpbmRlbnQgb25lIGFkZGl0aW9uYWwgbGV2ZWwuXG4gICAgICAgICAgcHJlZml4ID0gaW5kZW50YXRpb247XG4gICAgICAgICAgaW5kZW50YXRpb24gKz0gd2hpdGVzcGFjZTtcbiAgICAgICAgICBpZiAoY2xhc3NOYW1lID09IGFycmF5Q2xhc3MpIHtcbiAgICAgICAgICAgIC8vIFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZSBhcnJheSBlbGVtZW50cy5cbiAgICAgICAgICAgIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBoYXNNZW1iZXJzIHx8IChoYXNNZW1iZXJzID0gdHJ1ZSksIGluZGV4KyspIHtcbiAgICAgICAgICAgICAgZWxlbWVudCA9IHNlcmlhbGl6ZShpbmRleCwgdmFsdWUsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzLCB3aGl0ZXNwYWNlLCBpbmRlbnRhdGlvbiwgc3RhY2spO1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZWxlbWVudCA9PT0gdW5kZWYgPyBcIm51bGxcIiA6IGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0ID0gaGFzTWVtYmVycyA/ICh3aGl0ZXNwYWNlID8gXCJbXFxuXCIgKyBpbmRlbnRhdGlvbiArIHJlc3VsdHMuam9pbihcIixcXG5cIiArIGluZGVudGF0aW9uKSArIFwiXFxuXCIgKyBwcmVmaXggKyBcIl1cIiA6IChcIltcIiArIHJlc3VsdHMuam9pbihcIixcIikgKyBcIl1cIikpIDogXCJbXVwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBSZWN1cnNpdmVseSBzZXJpYWxpemUgb2JqZWN0IG1lbWJlcnMuIE1lbWJlcnMgYXJlIHNlbGVjdGVkIGZyb21cbiAgICAgICAgICAgIC8vIGVpdGhlciBhIHVzZXItc3BlY2lmaWVkIGxpc3Qgb2YgcHJvcGVydHkgbmFtZXMsIG9yIHRoZSBvYmplY3RcbiAgICAgICAgICAgIC8vIGl0c2VsZi5cbiAgICAgICAgICAgIGZvckVhY2gocHJvcGVydGllcyB8fCB2YWx1ZSwgZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gc2VyaWFsaXplKHByb3BlcnR5LCB2YWx1ZSwgY2FsbGJhY2ssIHByb3BlcnRpZXMsIHdoaXRlc3BhY2UsIGluZGVudGF0aW9uLCBzdGFjayk7XG4gICAgICAgICAgICAgIGlmIChlbGVtZW50ICE9PSB1bmRlZikge1xuICAgICAgICAgICAgICAgIC8vIEFjY29yZGluZyB0byBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zOiBcIklmIGBnYXBgIHt3aGl0ZXNwYWNlfVxuICAgICAgICAgICAgICAgIC8vIGlzIG5vdCB0aGUgZW1wdHkgc3RyaW5nLCBsZXQgYG1lbWJlcmAge3F1b3RlKHByb3BlcnR5KSArIFwiOlwifVxuICAgICAgICAgICAgICAgIC8vIGJlIHRoZSBjb25jYXRlbmF0aW9uIG9mIGBtZW1iZXJgIGFuZCB0aGUgYHNwYWNlYCBjaGFyYWN0ZXIuXCJcbiAgICAgICAgICAgICAgICAvLyBUaGUgXCJgc3BhY2VgIGNoYXJhY3RlclwiIHJlZmVycyB0byB0aGUgbGl0ZXJhbCBzcGFjZVxuICAgICAgICAgICAgICAgIC8vIGNoYXJhY3Rlciwgbm90IHRoZSBgc3BhY2VgIHt3aWR0aH0gYXJndW1lbnQgcHJvdmlkZWQgdG9cbiAgICAgICAgICAgICAgICAvLyBgSlNPTi5zdHJpbmdpZnlgLlxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChxdW90ZShwcm9wZXJ0eSkgKyBcIjpcIiArICh3aGl0ZXNwYWNlID8gXCIgXCIgOiBcIlwiKSArIGVsZW1lbnQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGhhc01lbWJlcnMgfHwgKGhhc01lbWJlcnMgPSB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzdWx0ID0gaGFzTWVtYmVycyA/ICh3aGl0ZXNwYWNlID8gXCJ7XFxuXCIgKyBpbmRlbnRhdGlvbiArIHJlc3VsdHMuam9pbihcIixcXG5cIiArIGluZGVudGF0aW9uKSArIFwiXFxuXCIgKyBwcmVmaXggKyBcIn1cIiA6IChcIntcIiArIHJlc3VsdHMuam9pbihcIixcIikgKyBcIn1cIikpIDogXCJ7fVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIG9iamVjdCBmcm9tIHRoZSB0cmF2ZXJzZWQgb2JqZWN0IHN0YWNrLlxuICAgICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIFB1YmxpYzogYEpTT04uc3RyaW5naWZ5YC4gU2VlIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMuXG4gICAgICBKU09OMy5zdHJpbmdpZnkgPSBmdW5jdGlvbiAoc291cmNlLCBmaWx0ZXIsIHdpZHRoKSB7XG4gICAgICAgIHZhciB3aGl0ZXNwYWNlLCBjYWxsYmFjaywgcHJvcGVydGllcztcbiAgICAgICAgaWYgKHR5cGVvZiBmaWx0ZXIgPT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiBmaWx0ZXIgPT0gXCJvYmplY3RcIiAmJiBmaWx0ZXIpIHtcbiAgICAgICAgICBpZiAoZ2V0Q2xhc3MuY2FsbChmaWx0ZXIpID09IGZ1bmN0aW9uQ2xhc3MpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gZmlsdGVyO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZ2V0Q2xhc3MuY2FsbChmaWx0ZXIpID09IGFycmF5Q2xhc3MpIHtcbiAgICAgICAgICAgIC8vIENvbnZlcnQgdGhlIHByb3BlcnR5IG5hbWVzIGFycmF5IGludG8gYSBtYWtlc2hpZnQgc2V0LlxuICAgICAgICAgICAgcHJvcGVydGllcyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwLCBsZW5ndGggPSBmaWx0ZXIubGVuZ3RoLCB2YWx1ZTsgaW5kZXggPCBsZW5ndGg7IHZhbHVlID0gZmlsdGVyW2luZGV4KytdLCAoKGdldENsYXNzLmNhbGwodmFsdWUpID09IHN0cmluZ0NsYXNzIHx8IGdldENsYXNzLmNhbGwodmFsdWUpID09IG51bWJlckNsYXNzKSAmJiAocHJvcGVydGllc1t2YWx1ZV0gPSAxKSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgICBpZiAoZ2V0Q2xhc3MuY2FsbCh3aWR0aCkgPT0gbnVtYmVyQ2xhc3MpIHtcbiAgICAgICAgICAgIC8vIENvbnZlcnQgdGhlIGB3aWR0aGAgdG8gYW4gaW50ZWdlciBhbmQgY3JlYXRlIGEgc3RyaW5nIGNvbnRhaW5pbmdcbiAgICAgICAgICAgIC8vIGB3aWR0aGAgbnVtYmVyIG9mIHNwYWNlIGNoYXJhY3RlcnMuXG4gICAgICAgICAgICBpZiAoKHdpZHRoIC09IHdpZHRoICUgMSkgPiAwKSB7XG4gICAgICAgICAgICAgIGZvciAod2hpdGVzcGFjZSA9IFwiXCIsIHdpZHRoID4gMTAgJiYgKHdpZHRoID0gMTApOyB3aGl0ZXNwYWNlLmxlbmd0aCA8IHdpZHRoOyB3aGl0ZXNwYWNlICs9IFwiIFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGdldENsYXNzLmNhbGwod2lkdGgpID09IHN0cmluZ0NsYXNzKSB7XG4gICAgICAgICAgICB3aGl0ZXNwYWNlID0gd2lkdGgubGVuZ3RoIDw9IDEwID8gd2lkdGggOiB3aWR0aC5zbGljZSgwLCAxMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE9wZXJhIDw9IDcuNTR1MiBkaXNjYXJkcyB0aGUgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCBlbXB0eSBzdHJpbmcga2V5c1xuICAgICAgICAvLyAoYFwiXCJgKSBvbmx5IGlmIHRoZXkgYXJlIHVzZWQgZGlyZWN0bHkgd2l0aGluIGFuIG9iamVjdCBtZW1iZXIgbGlzdFxuICAgICAgICAvLyAoZS5nLiwgYCEoXCJcIiBpbiB7IFwiXCI6IDF9KWApLlxuICAgICAgICByZXR1cm4gc2VyaWFsaXplKFwiXCIsICh2YWx1ZSA9IHt9LCB2YWx1ZVtcIlwiXSA9IHNvdXJjZSwgdmFsdWUpLCBjYWxsYmFjaywgcHJvcGVydGllcywgd2hpdGVzcGFjZSwgXCJcIiwgW10pO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBQdWJsaWM6IFBhcnNlcyBhIEpTT04gc291cmNlIHN0cmluZy5cbiAgICBpZiAoIWhhcyhcImpzb24tcGFyc2VcIikpIHtcbiAgICAgIHZhciBmcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG4gICAgICAvLyBJbnRlcm5hbDogQSBtYXAgb2YgZXNjYXBlZCBjb250cm9sIGNoYXJhY3RlcnMgYW5kIHRoZWlyIHVuZXNjYXBlZFxuICAgICAgLy8gZXF1aXZhbGVudHMuXG4gICAgICB2YXIgVW5lc2NhcGVzID0ge1xuICAgICAgICA5MjogXCJcXFxcXCIsXG4gICAgICAgIDM0OiAnXCInLFxuICAgICAgICA0NzogXCIvXCIsXG4gICAgICAgIDk4OiBcIlxcYlwiLFxuICAgICAgICAxMTY6IFwiXFx0XCIsXG4gICAgICAgIDExMDogXCJcXG5cIixcbiAgICAgICAgMTAyOiBcIlxcZlwiLFxuICAgICAgICAxMTQ6IFwiXFxyXCJcbiAgICAgIH07XG5cbiAgICAgIC8vIEludGVybmFsOiBTdG9yZXMgdGhlIHBhcnNlciBzdGF0ZS5cbiAgICAgIHZhciBJbmRleCwgU291cmNlO1xuXG4gICAgICAvLyBJbnRlcm5hbDogUmVzZXRzIHRoZSBwYXJzZXIgc3RhdGUgYW5kIHRocm93cyBhIGBTeW50YXhFcnJvcmAuXG4gICAgICB2YXIgYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgSW5kZXggPSBTb3VyY2UgPSBudWxsO1xuICAgICAgICB0aHJvdyBTeW50YXhFcnJvcigpO1xuICAgICAgfTtcblxuICAgICAgLy8gSW50ZXJuYWw6IFJldHVybnMgdGhlIG5leHQgdG9rZW4sIG9yIGBcIiRcImAgaWYgdGhlIHBhcnNlciBoYXMgcmVhY2hlZFxuICAgICAgLy8gdGhlIGVuZCBvZiB0aGUgc291cmNlIHN0cmluZy4gQSB0b2tlbiBtYXkgYmUgYSBzdHJpbmcsIG51bWJlciwgYG51bGxgXG4gICAgICAvLyBsaXRlcmFsLCBvciBCb29sZWFuIGxpdGVyYWwuXG4gICAgICB2YXIgbGV4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc291cmNlID0gU291cmNlLCBsZW5ndGggPSBzb3VyY2UubGVuZ3RoLCB2YWx1ZSwgYmVnaW4sIHBvc2l0aW9uLCBpc1NpZ25lZCwgY2hhckNvZGU7XG4gICAgICAgIHdoaWxlIChJbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO1xuICAgICAgICAgIHN3aXRjaCAoY2hhckNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgOTogY2FzZSAxMDogY2FzZSAxMzogY2FzZSAzMjpcbiAgICAgICAgICAgICAgLy8gU2tpcCB3aGl0ZXNwYWNlIHRva2VucywgaW5jbHVkaW5nIHRhYnMsIGNhcnJpYWdlIHJldHVybnMsIGxpbmVcbiAgICAgICAgICAgICAgLy8gZmVlZHMsIGFuZCBzcGFjZSBjaGFyYWN0ZXJzLlxuICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTIzOiBjYXNlIDEyNTogY2FzZSA5MTogY2FzZSA5MzogY2FzZSA1ODogY2FzZSA0NDpcbiAgICAgICAgICAgICAgLy8gUGFyc2UgYSBwdW5jdHVhdG9yIHRva2VuIChge2AsIGB9YCwgYFtgLCBgXWAsIGA6YCwgb3IgYCxgKSBhdFxuICAgICAgICAgICAgICAvLyB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICAgICAgICAgICAgdmFsdWUgPSBjaGFySW5kZXhCdWdneSA/IHNvdXJjZS5jaGFyQXQoSW5kZXgpIDogc291cmNlW0luZGV4XTtcbiAgICAgICAgICAgICAgSW5kZXgrKztcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICAgICAgLy8gYFwiYCBkZWxpbWl0cyBhIEpTT04gc3RyaW5nOyBhZHZhbmNlIHRvIHRoZSBuZXh0IGNoYXJhY3RlciBhbmRcbiAgICAgICAgICAgICAgLy8gYmVnaW4gcGFyc2luZyB0aGUgc3RyaW5nLiBTdHJpbmcgdG9rZW5zIGFyZSBwcmVmaXhlZCB3aXRoIHRoZVxuICAgICAgICAgICAgICAvLyBzZW50aW5lbCBgQGAgY2hhcmFjdGVyIHRvIGRpc3Rpbmd1aXNoIHRoZW0gZnJvbSBwdW5jdHVhdG9ycyBhbmRcbiAgICAgICAgICAgICAgLy8gZW5kLW9mLXN0cmluZyB0b2tlbnMuXG4gICAgICAgICAgICAgIGZvciAodmFsdWUgPSBcIkBcIiwgSW5kZXgrKzsgSW5kZXggPCBsZW5ndGg7KSB7XG4gICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7XG4gICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlIDwgMzIpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFVuZXNjYXBlZCBBU0NJSSBjb250cm9sIGNoYXJhY3RlcnMgKHRob3NlIHdpdGggYSBjb2RlIHVuaXRcbiAgICAgICAgICAgICAgICAgIC8vIGxlc3MgdGhhbiB0aGUgc3BhY2UgY2hhcmFjdGVyKSBhcmUgbm90IHBlcm1pdHRlZC5cbiAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZSA9PSA5Mikge1xuICAgICAgICAgICAgICAgICAgLy8gQSByZXZlcnNlIHNvbGlkdXMgKGBcXGApIG1hcmtzIHRoZSBiZWdpbm5pbmcgb2YgYW4gZXNjYXBlZFxuICAgICAgICAgICAgICAgICAgLy8gY29udHJvbCBjaGFyYWN0ZXIgKGluY2x1ZGluZyBgXCJgLCBgXFxgLCBhbmQgYC9gKSBvciBVbmljb2RlXG4gICAgICAgICAgICAgICAgICAvLyBlc2NhcGUgc2VxdWVuY2UuXG4gICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgc3dpdGNoIChjaGFyQ29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDkyOiBjYXNlIDM0OiBjYXNlIDQ3OiBjYXNlIDk4OiBjYXNlIDExNjogY2FzZSAxMTA6IGNhc2UgMTAyOiBjYXNlIDExNDpcbiAgICAgICAgICAgICAgICAgICAgICAvLyBSZXZpdmUgZXNjYXBlZCBjb250cm9sIGNoYXJhY3RlcnMuXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWUgKz0gVW5lc2NhcGVzW2NoYXJDb2RlXTtcbiAgICAgICAgICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDExNzpcbiAgICAgICAgICAgICAgICAgICAgICAvLyBgXFx1YCBtYXJrcyB0aGUgYmVnaW5uaW5nIG9mIGEgVW5pY29kZSBlc2NhcGUgc2VxdWVuY2UuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQWR2YW5jZSB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIGFuZCB2YWxpZGF0ZSB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAvLyBmb3VyLWRpZ2l0IGNvZGUgcG9pbnQuXG4gICAgICAgICAgICAgICAgICAgICAgYmVnaW4gPSArK0luZGV4O1xuICAgICAgICAgICAgICAgICAgICAgIGZvciAocG9zaXRpb24gPSBJbmRleCArIDQ7IEluZGV4IDwgcG9zaXRpb247IEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQSB2YWxpZCBzZXF1ZW5jZSBjb21wcmlzZXMgZm91ciBoZXhkaWdpdHMgKGNhc2UtXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnNlbnNpdGl2ZSkgdGhhdCBmb3JtIGEgc2luZ2xlIGhleGFkZWNpbWFsIHZhbHVlLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcgfHwgY2hhckNvZGUgPj0gOTcgJiYgY2hhckNvZGUgPD0gMTAyIHx8IGNoYXJDb2RlID49IDY1ICYmIGNoYXJDb2RlIDw9IDcwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnZhbGlkIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAvLyBSZXZpdmUgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlICs9IGZyb21DaGFyQ29kZShcIjB4XCIgKyBzb3VyY2Uuc2xpY2UoYmVnaW4sIEluZGV4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgLy8gSW52YWxpZCBlc2NhcGUgc2VxdWVuY2UuXG4gICAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID09IDM0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFuIHVuZXNjYXBlZCBkb3VibGUtcXVvdGUgY2hhcmFjdGVyIG1hcmtzIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIHN0cmluZy5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgICAgICAgIGJlZ2luID0gSW5kZXg7XG4gICAgICAgICAgICAgICAgICAvLyBPcHRpbWl6ZSBmb3IgdGhlIGNvbW1vbiBjYXNlIHdoZXJlIGEgc3RyaW5nIGlzIHZhbGlkLlxuICAgICAgICAgICAgICAgICAgd2hpbGUgKGNoYXJDb2RlID49IDMyICYmIGNoYXJDb2RlICE9IDkyICYmIGNoYXJDb2RlICE9IDM0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoKytJbmRleCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAvLyBBcHBlbmQgdGhlIHN0cmluZyBhcy1pcy5cbiAgICAgICAgICAgICAgICAgIHZhbHVlICs9IHNvdXJjZS5zbGljZShiZWdpbiwgSW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpID09IDM0KSB7XG4gICAgICAgICAgICAgICAgLy8gQWR2YW5jZSB0byB0aGUgbmV4dCBjaGFyYWN0ZXIgYW5kIHJldHVybiB0aGUgcmV2aXZlZCBzdHJpbmcuXG4gICAgICAgICAgICAgICAgSW5kZXgrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gVW50ZXJtaW5hdGVkIHN0cmluZy5cbiAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIC8vIFBhcnNlIG51bWJlcnMgYW5kIGxpdGVyYWxzLlxuICAgICAgICAgICAgICBiZWdpbiA9IEluZGV4O1xuICAgICAgICAgICAgICAvLyBBZHZhbmNlIHBhc3QgdGhlIG5lZ2F0aXZlIHNpZ24sIGlmIG9uZSBpcyBzcGVjaWZpZWQuXG4gICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA9PSA0NSkge1xuICAgICAgICAgICAgICAgIGlzU2lnbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFBhcnNlIGFuIGludGVnZXIgb3IgZmxvYXRpbmctcG9pbnQgdmFsdWUuXG4gICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1Nykge1xuICAgICAgICAgICAgICAgIC8vIExlYWRpbmcgemVyb2VzIGFyZSBpbnRlcnByZXRlZCBhcyBvY3RhbCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPT0gNDggJiYgKChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4ICsgMSkpLCBjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1NykpIHtcbiAgICAgICAgICAgICAgICAgIC8vIElsbGVnYWwgb2N0YWwgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlzU2lnbmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgLy8gUGFyc2UgdGhlIGludGVnZXIgY29tcG9uZW50LlxuICAgICAgICAgICAgICAgIGZvciAoOyBJbmRleCA8IGxlbmd0aCAmJiAoKGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpKSwgY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpOyBJbmRleCsrKTtcbiAgICAgICAgICAgICAgICAvLyBGbG9hdHMgY2Fubm90IGNvbnRhaW4gYSBsZWFkaW5nIGRlY2ltYWwgcG9pbnQ7IGhvd2V2ZXIsIHRoaXNcbiAgICAgICAgICAgICAgICAvLyBjYXNlIGlzIGFscmVhZHkgYWNjb3VudGVkIGZvciBieSB0aGUgcGFyc2VyLlxuICAgICAgICAgICAgICAgIGlmIChzb3VyY2UuY2hhckNvZGVBdChJbmRleCkgPT0gNDYpIHtcbiAgICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gKytJbmRleDtcbiAgICAgICAgICAgICAgICAgIC8vIFBhcnNlIHRoZSBkZWNpbWFsIGNvbXBvbmVudC5cbiAgICAgICAgICAgICAgICAgIGZvciAoOyBwb3NpdGlvbiA8IGxlbmd0aCAmJiAoKGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQocG9zaXRpb24pKSwgY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpOyBwb3NpdGlvbisrKTtcbiAgICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbiA9PSBJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbGxlZ2FsIHRyYWlsaW5nIGRlY2ltYWwuXG4gICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBJbmRleCA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBleHBvbmVudHMuIFRoZSBgZWAgZGVub3RpbmcgdGhlIGV4cG9uZW50IGlzXG4gICAgICAgICAgICAgICAgLy8gY2FzZS1pbnNlbnNpdGl2ZS5cbiAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPT0gMTAxIHx8IGNoYXJDb2RlID09IDY5KSB7XG4gICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgLy8gU2tpcCBwYXN0IHRoZSBzaWduIGZvbGxvd2luZyB0aGUgZXhwb25lbnQsIGlmIG9uZSBpc1xuICAgICAgICAgICAgICAgICAgLy8gc3BlY2lmaWVkLlxuICAgICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID09IDQzIHx8IGNoYXJDb2RlID09IDQ1KSB7XG4gICAgICAgICAgICAgICAgICAgIEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAvLyBQYXJzZSB0aGUgZXhwb25lbnRpYWwgY29tcG9uZW50LlxuICAgICAgICAgICAgICAgICAgZm9yIChwb3NpdGlvbiA9IEluZGV4OyBwb3NpdGlvbiA8IGxlbmd0aCAmJiAoKGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQocG9zaXRpb24pKSwgY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpOyBwb3NpdGlvbisrKTtcbiAgICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbiA9PSBJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbGxlZ2FsIGVtcHR5IGV4cG9uZW50LlxuICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgSW5kZXggPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQ29lcmNlIHRoZSBwYXJzZWQgdmFsdWUgdG8gYSBKYXZhU2NyaXB0IG51bWJlci5cbiAgICAgICAgICAgICAgICByZXR1cm4gK3NvdXJjZS5zbGljZShiZWdpbiwgSW5kZXgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIEEgbmVnYXRpdmUgc2lnbiBtYXkgb25seSBwcmVjZWRlIG51bWJlcnMuXG4gICAgICAgICAgICAgIGlmIChpc1NpZ25lZCkge1xuICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gYHRydWVgLCBgZmFsc2VgLCBhbmQgYG51bGxgIGxpdGVyYWxzLlxuICAgICAgICAgICAgICBpZiAoc291cmNlLnNsaWNlKEluZGV4LCBJbmRleCArIDQpID09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICAgICAgSW5kZXggKz0gNDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChzb3VyY2Uuc2xpY2UoSW5kZXgsIEluZGV4ICsgNSkgPT0gXCJmYWxzZVwiKSB7XG4gICAgICAgICAgICAgICAgSW5kZXggKz0gNTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlLnNsaWNlKEluZGV4LCBJbmRleCArIDQpID09IFwibnVsbFwiKSB7XG4gICAgICAgICAgICAgICAgSW5kZXggKz0gNDtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBVbnJlY29nbml6ZWQgdG9rZW4uXG4gICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFJldHVybiB0aGUgc2VudGluZWwgYCRgIGNoYXJhY3RlciBpZiB0aGUgcGFyc2VyIGhhcyByZWFjaGVkIHRoZSBlbmRcbiAgICAgICAgLy8gb2YgdGhlIHNvdXJjZSBzdHJpbmcuXG4gICAgICAgIHJldHVybiBcIiRcIjtcbiAgICAgIH07XG5cbiAgICAgIC8vIEludGVybmFsOiBQYXJzZXMgYSBKU09OIGB2YWx1ZWAgdG9rZW4uXG4gICAgICB2YXIgZ2V0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciByZXN1bHRzLCBoYXNNZW1iZXJzO1xuICAgICAgICBpZiAodmFsdWUgPT0gXCIkXCIpIHtcbiAgICAgICAgICAvLyBVbmV4cGVjdGVkIGVuZCBvZiBpbnB1dC5cbiAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIGlmICh2YWx1ZVswXSA9PSBcIkBcIikge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBzZW50aW5lbCBgQGAgY2hhcmFjdGVyLlxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBQYXJzZSBvYmplY3QgYW5kIGFycmF5IGxpdGVyYWxzLlxuICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIltcIikge1xuICAgICAgICAgICAgLy8gUGFyc2VzIGEgSlNPTiBhcnJheSwgcmV0dXJuaW5nIGEgbmV3IEphdmFTY3JpcHQgYXJyYXkuXG4gICAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgICBmb3IgKDs7IGhhc01lbWJlcnMgfHwgKGhhc01lbWJlcnMgPSB0cnVlKSkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IGxleCgpO1xuICAgICAgICAgICAgICAvLyBBIGNsb3Npbmcgc3F1YXJlIGJyYWNrZXQgbWFya3MgdGhlIGVuZCBvZiB0aGUgYXJyYXkgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiXVwiKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gSWYgdGhlIGFycmF5IGxpdGVyYWwgY29udGFpbnMgZWxlbWVudHMsIHRoZSBjdXJyZW50IHRva2VuXG4gICAgICAgICAgICAgIC8vIHNob3VsZCBiZSBhIGNvbW1hIHNlcGFyYXRpbmcgdGhlIHByZXZpb3VzIGVsZW1lbnQgZnJvbSB0aGVcbiAgICAgICAgICAgICAgLy8gbmV4dC5cbiAgICAgICAgICAgICAgaWYgKGhhc01lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCIsXCIpIHtcbiAgICAgICAgICAgICAgICAgIHZhbHVlID0gbGV4KCk7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJdXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVW5leHBlY3RlZCB0cmFpbGluZyBgLGAgaW4gYXJyYXkgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgLy8gQSBgLGAgbXVzdCBzZXBhcmF0ZSBlYWNoIGFycmF5IGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBFbGlzaW9ucyBhbmQgbGVhZGluZyBjb21tYXMgYXJlIG5vdCBwZXJtaXR0ZWQuXG4gICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIixcIikge1xuICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGdldCh2YWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PSBcIntcIikge1xuICAgICAgICAgICAgLy8gUGFyc2VzIGEgSlNPTiBvYmplY3QsIHJldHVybmluZyBhIG5ldyBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAgICAgICAgIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgIGZvciAoOzsgaGFzTWVtYmVycyB8fCAoaGFzTWVtYmVycyA9IHRydWUpKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gbGV4KCk7XG4gICAgICAgICAgICAgIC8vIEEgY2xvc2luZyBjdXJseSBicmFjZSBtYXJrcyB0aGUgZW5kIG9mIHRoZSBvYmplY3QgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwifVwiKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gSWYgdGhlIG9iamVjdCBsaXRlcmFsIGNvbnRhaW5zIG1lbWJlcnMsIHRoZSBjdXJyZW50IHRva2VuXG4gICAgICAgICAgICAgIC8vIHNob3VsZCBiZSBhIGNvbW1hIHNlcGFyYXRvci5cbiAgICAgICAgICAgICAgaWYgKGhhc01lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCIsXCIpIHtcbiAgICAgICAgICAgICAgICAgIHZhbHVlID0gbGV4KCk7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJ9XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVW5leHBlY3RlZCB0cmFpbGluZyBgLGAgaW4gb2JqZWN0IGxpdGVyYWwuXG4gICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIEEgYCxgIG11c3Qgc2VwYXJhdGUgZWFjaCBvYmplY3QgbWVtYmVyLlxuICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gTGVhZGluZyBjb21tYXMgYXJlIG5vdCBwZXJtaXR0ZWQsIG9iamVjdCBwcm9wZXJ0eSBuYW1lcyBtdXN0IGJlXG4gICAgICAgICAgICAgIC8vIGRvdWJsZS1xdW90ZWQgc3RyaW5ncywgYW5kIGEgYDpgIG11c3Qgc2VwYXJhdGUgZWFjaCBwcm9wZXJ0eVxuICAgICAgICAgICAgICAvLyBuYW1lIGFuZCB2YWx1ZS5cbiAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiLFwiIHx8IHR5cGVvZiB2YWx1ZSAhPSBcInN0cmluZ1wiIHx8IHZhbHVlWzBdICE9IFwiQFwiIHx8IGxleCgpICE9IFwiOlwiKSB7XG4gICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXN1bHRzW3ZhbHVlLnNsaWNlKDEpXSA9IGdldChsZXgoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVW5leHBlY3RlZCB0b2tlbiBlbmNvdW50ZXJlZC5cbiAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH07XG5cbiAgICAgIC8vIEludGVybmFsOiBVcGRhdGVzIGEgdHJhdmVyc2VkIG9iamVjdCBtZW1iZXIuXG4gICAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24oc291cmNlLCBwcm9wZXJ0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB3YWxrKHNvdXJjZSwgcHJvcGVydHksIGNhbGxiYWNrKTtcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IHVuZGVmKSB7XG4gICAgICAgICAgZGVsZXRlIHNvdXJjZVtwcm9wZXJ0eV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc291cmNlW3Byb3BlcnR5XSA9IGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIEludGVybmFsOiBSZWN1cnNpdmVseSB0cmF2ZXJzZXMgYSBwYXJzZWQgSlNPTiBvYmplY3QsIGludm9raW5nIHRoZVxuICAgICAgLy8gYGNhbGxiYWNrYCBmdW5jdGlvbiBmb3IgZWFjaCB2YWx1ZS4gVGhpcyBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGVcbiAgICAgIC8vIGBXYWxrKGhvbGRlciwgbmFtZSlgIG9wZXJhdGlvbiBkZWZpbmVkIGluIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjIuXG4gICAgICB2YXIgd2FsayA9IGZ1bmN0aW9uIChzb3VyY2UsIHByb3BlcnR5LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdmFsdWUgPSBzb3VyY2VbcHJvcGVydHldLCBsZW5ndGg7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIiAmJiB2YWx1ZSkge1xuICAgICAgICAgIC8vIGBmb3JFYWNoYCBjYW4ndCBiZSB1c2VkIHRvIHRyYXZlcnNlIGFuIGFycmF5IGluIE9wZXJhIDw9IDguNTRcbiAgICAgICAgICAvLyBiZWNhdXNlIGl0cyBgT2JqZWN0I2hhc093blByb3BlcnR5YCBpbXBsZW1lbnRhdGlvbiByZXR1cm5zIGBmYWxzZWBcbiAgICAgICAgICAvLyBmb3IgYXJyYXkgaW5kaWNlcyAoZS5nLiwgYCFbMSwgMiwgM10uaGFzT3duUHJvcGVydHkoXCIwXCIpYCkuXG4gICAgICAgICAgaWYgKGdldENsYXNzLmNhbGwodmFsdWUpID09IGFycmF5Q2xhc3MpIHtcbiAgICAgICAgICAgIGZvciAobGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBsZW5ndGgtLTspIHtcbiAgICAgICAgICAgICAgdXBkYXRlKHZhbHVlLCBsZW5ndGgsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yRWFjaCh2YWx1ZSwgZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgIHVwZGF0ZSh2YWx1ZSwgcHJvcGVydHksIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2suY2FsbChzb3VyY2UsIHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9O1xuXG4gICAgICAvLyBQdWJsaWM6IGBKU09OLnBhcnNlYC4gU2VlIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjIuXG4gICAgICBKU09OMy5wYXJzZSA9IGZ1bmN0aW9uIChzb3VyY2UsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHQsIHZhbHVlO1xuICAgICAgICBJbmRleCA9IDA7XG4gICAgICAgIFNvdXJjZSA9IFwiXCIgKyBzb3VyY2U7XG4gICAgICAgIHJlc3VsdCA9IGdldChsZXgoKSk7XG4gICAgICAgIC8vIElmIGEgSlNPTiBzdHJpbmcgY29udGFpbnMgbXVsdGlwbGUgdG9rZW5zLCBpdCBpcyBpbnZhbGlkLlxuICAgICAgICBpZiAobGV4KCkgIT0gXCIkXCIpIHtcbiAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlc2V0IHRoZSBwYXJzZXIgc3RhdGUuXG4gICAgICAgIEluZGV4ID0gU291cmNlID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrICYmIGdldENsYXNzLmNhbGwoY2FsbGJhY2spID09IGZ1bmN0aW9uQ2xhc3MgPyB3YWxrKCh2YWx1ZSA9IHt9LCB2YWx1ZVtcIlwiXSA9IHJlc3VsdCwgdmFsdWUpLCBcIlwiLCBjYWxsYmFjaykgOiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIEV4cG9ydCBmb3IgYXN5bmNocm9ub3VzIG1vZHVsZSBsb2FkZXJzLlxuICBpZiAoaXNMb2FkZXIpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIEpTT04zO1xuICAgIH0pO1xuICB9XG59KHRoaXMpKTtcbiIsIi8qIVxuICogbXVzdGFjaGUuanMgLSBMb2dpYy1sZXNzIHt7bXVzdGFjaGV9fSB0ZW1wbGF0ZXMgd2l0aCBKYXZhU2NyaXB0XG4gKiBodHRwOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzXG4gKi9cblxuLypnbG9iYWwgZGVmaW5lOiBmYWxzZSovXG5cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgJiYgZXhwb3J0cykge1xuICAgIGZhY3RvcnkoZXhwb3J0cyk7IC8vIENvbW1vbkpTXG4gIH0gZWxzZSB7XG4gICAgdmFyIG11c3RhY2hlID0ge307XG4gICAgZmFjdG9yeShtdXN0YWNoZSk7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICBkZWZpbmUobXVzdGFjaGUpOyAvLyBBTURcbiAgICB9IGVsc2Uge1xuICAgICAgcm9vdC5NdXN0YWNoZSA9IG11c3RhY2hlOyAvLyA8c2NyaXB0PlxuICAgIH1cbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAobXVzdGFjaGUpIHtcblxuICB2YXIgd2hpdGVSZSA9IC9cXHMqLztcbiAgdmFyIHNwYWNlUmUgPSAvXFxzKy87XG4gIHZhciBub25TcGFjZVJlID0gL1xcUy87XG4gIHZhciBlcVJlID0gL1xccyo9LztcbiAgdmFyIGN1cmx5UmUgPSAvXFxzKlxcfS87XG4gIHZhciB0YWdSZSA9IC8jfFxcXnxcXC98PnxcXHt8Jnw9fCEvO1xuXG4gIC8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vaXNzdWVzLmFwYWNoZS5vcmcvamlyYS9icm93c2UvQ09VQ0hEQi01NzdcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzL2lzc3Vlcy8xODlcbiAgdmFyIFJlZ0V4cF90ZXN0ID0gUmVnRXhwLnByb3RvdHlwZS50ZXN0O1xuICBmdW5jdGlvbiB0ZXN0UmVnRXhwKHJlLCBzdHJpbmcpIHtcbiAgICByZXR1cm4gUmVnRXhwX3Rlc3QuY2FsbChyZSwgc3RyaW5nKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzV2hpdGVzcGFjZShzdHJpbmcpIHtcbiAgICByZXR1cm4gIXRlc3RSZWdFeHAobm9uU3BhY2VSZSwgc3RyaW5nKTtcbiAgfVxuXG4gIHZhciBPYmplY3RfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBPYmplY3RfdG9TdHJpbmcuY2FsbChvYmplY3QpID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09ICdmdW5jdGlvbic7XG4gIH1cblxuICBmdW5jdGlvbiBlc2NhcGVSZWdFeHAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSorPy4sXFxcXFxcXiR8I1xcc10vZywgXCJcXFxcJCZcIik7XG4gIH1cblxuICB2YXIgZW50aXR5TWFwID0ge1xuICAgIFwiJlwiOiBcIiZhbXA7XCIsXG4gICAgXCI8XCI6IFwiJmx0O1wiLFxuICAgIFwiPlwiOiBcIiZndDtcIixcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjMzk7JyxcbiAgICBcIi9cIjogJyYjeDJGOydcbiAgfTtcblxuICBmdW5jdGlvbiBlc2NhcGVIdG1sKHN0cmluZykge1xuICAgIHJldHVybiBTdHJpbmcoc3RyaW5nKS5yZXBsYWNlKC9bJjw+XCInXFwvXS9nLCBmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIGVudGl0eU1hcFtzXTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIFNjYW5uZXIoc3RyaW5nKSB7XG4gICAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG4gICAgdGhpcy50YWlsID0gc3RyaW5nO1xuICAgIHRoaXMucG9zID0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdGFpbCBpcyBlbXB0eSAoZW5kIG9mIHN0cmluZykuXG4gICAqL1xuICBTY2FubmVyLnByb3RvdHlwZS5lb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFpbCA9PT0gXCJcIjtcbiAgfTtcblxuICAvKipcbiAgICogVHJpZXMgdG8gbWF0Y2ggdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvbiBhdCB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICogUmV0dXJucyB0aGUgbWF0Y2hlZCB0ZXh0IGlmIGl0IGNhbiBtYXRjaCwgdGhlIGVtcHR5IHN0cmluZyBvdGhlcndpc2UuXG4gICAqL1xuICBTY2FubmVyLnByb3RvdHlwZS5zY2FuID0gZnVuY3Rpb24gKHJlKSB7XG4gICAgdmFyIG1hdGNoID0gdGhpcy50YWlsLm1hdGNoKHJlKTtcblxuICAgIGlmIChtYXRjaCAmJiBtYXRjaC5pbmRleCA9PT0gMCkge1xuICAgICAgdmFyIHN0cmluZyA9IG1hdGNoWzBdO1xuICAgICAgdGhpcy50YWlsID0gdGhpcy50YWlsLnN1YnN0cmluZyhzdHJpbmcubGVuZ3RoKTtcbiAgICAgIHRoaXMucG9zICs9IHN0cmluZy5sZW5ndGg7XG4gICAgICByZXR1cm4gc3RyaW5nO1xuICAgIH1cblxuICAgIHJldHVybiBcIlwiO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTa2lwcyBhbGwgdGV4dCB1bnRpbCB0aGUgZ2l2ZW4gcmVndWxhciBleHByZXNzaW9uIGNhbiBiZSBtYXRjaGVkLiBSZXR1cm5zXG4gICAqIHRoZSBza2lwcGVkIHN0cmluZywgd2hpY2ggaXMgdGhlIGVudGlyZSB0YWlsIGlmIG5vIG1hdGNoIGNhbiBiZSBtYWRlLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuc2NhblVudGlsID0gZnVuY3Rpb24gKHJlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy50YWlsLnNlYXJjaChyZSksIG1hdGNoO1xuXG4gICAgc3dpdGNoIChpbmRleCkge1xuICAgIGNhc2UgLTE6XG4gICAgICBtYXRjaCA9IHRoaXMudGFpbDtcbiAgICAgIHRoaXMudGFpbCA9IFwiXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDA6XG4gICAgICBtYXRjaCA9IFwiXCI7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgbWF0Y2ggPSB0aGlzLnRhaWwuc3Vic3RyaW5nKDAsIGluZGV4KTtcbiAgICAgIHRoaXMudGFpbCA9IHRoaXMudGFpbC5zdWJzdHJpbmcoaW5kZXgpO1xuICAgIH1cblxuICAgIHRoaXMucG9zICs9IG1hdGNoLmxlbmd0aDtcblxuICAgIHJldHVybiBtYXRjaDtcbiAgfTtcblxuICBmdW5jdGlvbiBDb250ZXh0KHZpZXcsIHBhcmVudCkge1xuICAgIHRoaXMudmlldyA9IHZpZXcgPT0gbnVsbCA/IHt9IDogdmlldztcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLl9jYWNoZSA9IHsgJy4nOiB0aGlzLnZpZXcgfTtcbiAgfVxuXG4gIENvbnRleHQubWFrZSA9IGZ1bmN0aW9uICh2aWV3KSB7XG4gICAgcmV0dXJuICh2aWV3IGluc3RhbmNlb2YgQ29udGV4dCkgPyB2aWV3IDogbmV3IENvbnRleHQodmlldyk7XG4gIH07XG5cbiAgQ29udGV4dC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uICh2aWV3KSB7XG4gICAgcmV0dXJuIG5ldyBDb250ZXh0KHZpZXcsIHRoaXMpO1xuICB9O1xuXG4gIENvbnRleHQucHJvdG90eXBlLmxvb2t1cCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIHZhbHVlO1xuICAgIGlmIChuYW1lIGluIHRoaXMuX2NhY2hlKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMuX2NhY2hlW25hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG5cbiAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgIGlmIChuYW1lLmluZGV4T2YoJy4nKSA+IDApIHtcbiAgICAgICAgICB2YWx1ZSA9IGNvbnRleHQudmlldztcblxuICAgICAgICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoJy4nKSwgaSA9IDA7XG4gICAgICAgICAgd2hpbGUgKHZhbHVlICE9IG51bGwgJiYgaSA8IG5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZVtuYW1lc1tpKytdXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSBjb250ZXh0LnZpZXdbbmFtZV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkgYnJlYWs7XG5cbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucGFyZW50O1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9jYWNoZVtuYW1lXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5jYWxsKHRoaXMudmlldyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIFdyaXRlcigpIHtcbiAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcbiAgfVxuXG4gIFdyaXRlci5wcm90b3R5cGUuY2xlYXJDYWNoZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9jYWNoZSA9IHt9O1xuICAgIHRoaXMuX3BhcnRpYWxDYWNoZSA9IHt9O1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdGFncykge1xuICAgIHZhciBmbiA9IHRoaXMuX2NhY2hlW3RlbXBsYXRlXTtcblxuICAgIGlmICghZm4pIHtcbiAgICAgIHZhciB0b2tlbnMgPSBtdXN0YWNoZS5wYXJzZSh0ZW1wbGF0ZSwgdGFncyk7XG4gICAgICBmbiA9IHRoaXMuX2NhY2hlW3RlbXBsYXRlXSA9IHRoaXMuY29tcGlsZVRva2Vucyh0b2tlbnMsIHRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZm47XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5jb21waWxlUGFydGlhbCA9IGZ1bmN0aW9uIChuYW1lLCB0ZW1wbGF0ZSwgdGFncykge1xuICAgIHZhciBmbiA9IHRoaXMuY29tcGlsZSh0ZW1wbGF0ZSwgdGFncyk7XG4gICAgdGhpcy5fcGFydGlhbENhY2hlW25hbWVdID0gZm47XG4gICAgcmV0dXJuIGZuO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuZ2V0UGFydGlhbCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKCEobmFtZSBpbiB0aGlzLl9wYXJ0aWFsQ2FjaGUpICYmIHRoaXMuX2xvYWRQYXJ0aWFsKSB7XG4gICAgICB0aGlzLmNvbXBpbGVQYXJ0aWFsKG5hbWUsIHRoaXMuX2xvYWRQYXJ0aWFsKG5hbWUpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcGFydGlhbENhY2hlW25hbWVdO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuY29tcGlsZVRva2VucyA9IGZ1bmN0aW9uICh0b2tlbnMsIHRlbXBsYXRlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbiAodmlldywgcGFydGlhbHMpIHtcbiAgICAgIGlmIChwYXJ0aWFscykge1xuICAgICAgICBpZiAoaXNGdW5jdGlvbihwYXJ0aWFscykpIHtcbiAgICAgICAgICBzZWxmLl9sb2FkUGFydGlhbCA9IHBhcnRpYWxzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gcGFydGlhbHMpIHtcbiAgICAgICAgICAgIHNlbGYuY29tcGlsZVBhcnRpYWwobmFtZSwgcGFydGlhbHNbbmFtZV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVuZGVyVG9rZW5zKHRva2Vucywgc2VsZiwgQ29udGV4dC5tYWtlKHZpZXcpLCB0ZW1wbGF0ZSk7XG4gICAgfTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMpIHtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlKHRlbXBsYXRlKSh2aWV3LCBwYXJ0aWFscyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIExvdy1sZXZlbCBmdW5jdGlvbiB0aGF0IHJlbmRlcnMgdGhlIGdpdmVuIGB0b2tlbnNgIHVzaW5nIHRoZSBnaXZlbiBgd3JpdGVyYFxuICAgKiBhbmQgYGNvbnRleHRgLiBUaGUgYHRlbXBsYXRlYCBzdHJpbmcgaXMgb25seSBuZWVkZWQgZm9yIHRlbXBsYXRlcyB0aGF0IHVzZVxuICAgKiBoaWdoZXItb3JkZXIgc2VjdGlvbnMgdG8gZXh0cmFjdCB0aGUgcG9ydGlvbiBvZiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgdGhhdFxuICAgKiB3YXMgY29udGFpbmVkIGluIHRoYXQgc2VjdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIHJlbmRlclRva2Vucyh0b2tlbnMsIHdyaXRlciwgY29udGV4dCwgdGVtcGxhdGUpIHtcbiAgICB2YXIgYnVmZmVyID0gJyc7XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gcmVuZGVyIGFuIGFydGJpdHJhcnkgdGVtcGxhdGVcbiAgICAvLyBpbiB0aGUgY3VycmVudCBjb250ZXh0IGJ5IGhpZ2hlci1vcmRlciBmdW5jdGlvbnMuXG4gICAgZnVuY3Rpb24gc3ViUmVuZGVyKHRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gd3JpdGVyLnJlbmRlcih0ZW1wbGF0ZSwgY29udGV4dCk7XG4gICAgfVxuXG4gICAgdmFyIHRva2VuLCB0b2tlblZhbHVlLCB2YWx1ZTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdG9rZW5zLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgIHRva2VuVmFsdWUgPSB0b2tlblsxXTtcblxuICAgICAgc3dpdGNoICh0b2tlblswXSkge1xuICAgICAgY2FzZSAnIyc6XG4gICAgICAgIHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5WYWx1ZSk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGpsZW4gPSB2YWx1ZS5sZW5ndGg7IGogPCBqbGVuOyArK2opIHtcbiAgICAgICAgICAgICAgYnVmZmVyICs9IHJlbmRlclRva2Vucyh0b2tlbls0XSwgd3JpdGVyLCBjb250ZXh0LnB1c2godmFsdWVbal0pLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgYnVmZmVyICs9IHJlbmRlclRva2Vucyh0b2tlbls0XSwgd3JpdGVyLCBjb250ZXh0LnB1c2godmFsdWUpLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgICAgdmFyIHRleHQgPSB0ZW1wbGF0ZSA9PSBudWxsID8gbnVsbCA6IHRlbXBsYXRlLnNsaWNlKHRva2VuWzNdLCB0b2tlbls1XSk7XG4gICAgICAgICAgdmFsdWUgPSB2YWx1ZS5jYWxsKGNvbnRleHQudmlldywgdGV4dCwgc3ViUmVuZGVyKTtcbiAgICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkgYnVmZmVyICs9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgYnVmZmVyICs9IHJlbmRlclRva2Vucyh0b2tlbls0XSwgd3JpdGVyLCBjb250ZXh0LCB0ZW1wbGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ14nOlxuICAgICAgICB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuVmFsdWUpO1xuXG4gICAgICAgIC8vIFVzZSBKYXZhU2NyaXB0J3MgZGVmaW5pdGlvbiBvZiBmYWxzeS4gSW5jbHVkZSBlbXB0eSBhcnJheXMuXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qcy9pc3N1ZXMvMTg2XG4gICAgICAgIGlmICghdmFsdWUgfHwgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgICAgICBidWZmZXIgKz0gcmVuZGVyVG9rZW5zKHRva2VuWzRdLCB3cml0ZXIsIGNvbnRleHQsIHRlbXBsYXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnPic6XG4gICAgICAgIHZhbHVlID0gd3JpdGVyLmdldFBhcnRpYWwodG9rZW5WYWx1ZSk7XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkgYnVmZmVyICs9IHZhbHVlKGNvbnRleHQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJyYnOlxuICAgICAgICB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuVmFsdWUpO1xuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkgYnVmZmVyICs9IHZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ25hbWUnOlxuICAgICAgICB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuVmFsdWUpO1xuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkgYnVmZmVyICs9IG11c3RhY2hlLmVzY2FwZSh2YWx1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgIGJ1ZmZlciArPSB0b2tlblZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcm1zIHRoZSBnaXZlbiBhcnJheSBvZiBgdG9rZW5zYCBpbnRvIGEgbmVzdGVkIHRyZWUgc3RydWN0dXJlIHdoZXJlXG4gICAqIHRva2VucyB0aGF0IHJlcHJlc2VudCBhIHNlY3Rpb24gaGF2ZSB0d28gYWRkaXRpb25hbCBpdGVtczogMSkgYW4gYXJyYXkgb2ZcbiAgICogYWxsIHRva2VucyB0aGF0IGFwcGVhciBpbiB0aGF0IHNlY3Rpb24gYW5kIDIpIHRoZSBpbmRleCBpbiB0aGUgb3JpZ2luYWxcbiAgICogdGVtcGxhdGUgdGhhdCByZXByZXNlbnRzIHRoZSBlbmQgb2YgdGhhdCBzZWN0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gbmVzdFRva2Vucyh0b2tlbnMpIHtcbiAgICB2YXIgdHJlZSA9IFtdO1xuICAgIHZhciBjb2xsZWN0b3IgPSB0cmVlO1xuICAgIHZhciBzZWN0aW9ucyA9IFtdO1xuXG4gICAgdmFyIHRva2VuO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0b2tlbnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgc3dpdGNoICh0b2tlblswXSkge1xuICAgICAgY2FzZSAnIyc6XG4gICAgICBjYXNlICdeJzpcbiAgICAgICAgc2VjdGlvbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbGxlY3Rvci5wdXNoKHRva2VuKTtcbiAgICAgICAgY29sbGVjdG9yID0gdG9rZW5bNF0gPSBbXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICcvJzpcbiAgICAgICAgdmFyIHNlY3Rpb24gPSBzZWN0aW9ucy5wb3AoKTtcbiAgICAgICAgc2VjdGlvbls1XSA9IHRva2VuWzJdO1xuICAgICAgICBjb2xsZWN0b3IgPSBzZWN0aW9ucy5sZW5ndGggPiAwID8gc2VjdGlvbnNbc2VjdGlvbnMubGVuZ3RoIC0gMV1bNF0gOiB0cmVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbGxlY3Rvci5wdXNoKHRva2VuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJlZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21iaW5lcyB0aGUgdmFsdWVzIG9mIGNvbnNlY3V0aXZlIHRleHQgdG9rZW5zIGluIHRoZSBnaXZlbiBgdG9rZW5zYCBhcnJheVxuICAgKiB0byBhIHNpbmdsZSB0b2tlbi5cbiAgICovXG4gIGZ1bmN0aW9uIHNxdWFzaFRva2Vucyh0b2tlbnMpIHtcbiAgICB2YXIgc3F1YXNoZWRUb2tlbnMgPSBbXTtcblxuICAgIHZhciB0b2tlbiwgbGFzdFRva2VuO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0b2tlbnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlblswXSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbiAmJiBsYXN0VG9rZW5bMF0gPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlblsxXSArPSB0b2tlblsxXTtcbiAgICAgICAgICBsYXN0VG9rZW5bM10gPSB0b2tlblszXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbjtcbiAgICAgICAgICBzcXVhc2hlZFRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzcXVhc2hlZFRva2VucztcbiAgfVxuXG4gIGZ1bmN0aW9uIGVzY2FwZVRhZ3ModGFncykge1xuICAgIHJldHVybiBbXG4gICAgICBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4cCh0YWdzWzBdKSArIFwiXFxcXHMqXCIpLFxuICAgICAgbmV3IFJlZ0V4cChcIlxcXFxzKlwiICsgZXNjYXBlUmVnRXhwKHRhZ3NbMV0pKVxuICAgIF07XG4gIH1cblxuICAvKipcbiAgICogQnJlYWtzIHVwIHRoZSBnaXZlbiBgdGVtcGxhdGVgIHN0cmluZyBpbnRvIGEgdHJlZSBvZiB0b2tlbiBvYmplY3RzLiBJZlxuICAgKiBgdGFnc2AgaXMgZ2l2ZW4gaGVyZSBpdCBtdXN0IGJlIGFuIGFycmF5IHdpdGggdHdvIHN0cmluZyB2YWx1ZXM6IHRoZVxuICAgKiBvcGVuaW5nIGFuZCBjbG9zaW5nIHRhZ3MgdXNlZCBpbiB0aGUgdGVtcGxhdGUgKGUuZy4gW1wiPCVcIiwgXCIlPlwiXSkuIE9mXG4gICAqIGNvdXJzZSwgdGhlIGRlZmF1bHQgaXMgdG8gdXNlIG11c3RhY2hlcyAoaS5lLiBNdXN0YWNoZS50YWdzKS5cbiAgICovXG4gIGZ1bmN0aW9uIHBhcnNlVGVtcGxhdGUodGVtcGxhdGUsIHRhZ3MpIHtcbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlIHx8ICcnO1xuICAgIHRhZ3MgPSB0YWdzIHx8IG11c3RhY2hlLnRhZ3M7XG5cbiAgICBpZiAodHlwZW9mIHRhZ3MgPT09ICdzdHJpbmcnKSB0YWdzID0gdGFncy5zcGxpdChzcGFjZVJlKTtcbiAgICBpZiAodGFncy5sZW5ndGggIT09IDIpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB0YWdzOiAnICsgdGFncy5qb2luKCcsICcpKTtcblxuICAgIHZhciB0YWdSZXMgPSBlc2NhcGVUYWdzKHRhZ3MpO1xuICAgIHZhciBzY2FubmVyID0gbmV3IFNjYW5uZXIodGVtcGxhdGUpO1xuXG4gICAgdmFyIHNlY3Rpb25zID0gW107ICAgICAvLyBTdGFjayB0byBob2xkIHNlY3Rpb24gdG9rZW5zXG4gICAgdmFyIHRva2VucyA9IFtdOyAgICAgICAvLyBCdWZmZXIgdG8gaG9sZCB0aGUgdG9rZW5zXG4gICAgdmFyIHNwYWNlcyA9IFtdOyAgICAgICAvLyBJbmRpY2VzIG9mIHdoaXRlc3BhY2UgdG9rZW5zIG9uIHRoZSBjdXJyZW50IGxpbmVcbiAgICB2YXIgaGFzVGFnID0gZmFsc2U7ICAgIC8vIElzIHRoZXJlIGEge3t0YWd9fSBvbiB0aGUgY3VycmVudCBsaW5lP1xuICAgIHZhciBub25TcGFjZSA9IGZhbHNlOyAgLy8gSXMgdGhlcmUgYSBub24tc3BhY2UgY2hhciBvbiB0aGUgY3VycmVudCBsaW5lP1xuXG4gICAgLy8gU3RyaXBzIGFsbCB3aGl0ZXNwYWNlIHRva2VucyBhcnJheSBmb3IgdGhlIGN1cnJlbnQgbGluZVxuICAgIC8vIGlmIHRoZXJlIHdhcyBhIHt7I3RhZ319IG9uIGl0IGFuZCBvdGhlcndpc2Ugb25seSBzcGFjZS5cbiAgICBmdW5jdGlvbiBzdHJpcFNwYWNlKCkge1xuICAgICAgaWYgKGhhc1RhZyAmJiAhbm9uU3BhY2UpIHtcbiAgICAgICAgd2hpbGUgKHNwYWNlcy5sZW5ndGgpIHtcbiAgICAgICAgICBkZWxldGUgdG9rZW5zW3NwYWNlcy5wb3AoKV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwYWNlcyA9IFtdO1xuICAgICAgfVxuXG4gICAgICBoYXNUYWcgPSBmYWxzZTtcbiAgICAgIG5vblNwYWNlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0LCB0eXBlLCB2YWx1ZSwgY2hyLCB0b2tlbiwgb3BlblNlY3Rpb247XG4gICAgd2hpbGUgKCFzY2FubmVyLmVvcygpKSB7XG4gICAgICBzdGFydCA9IHNjYW5uZXIucG9zO1xuXG4gICAgICAvLyBNYXRjaCBhbnkgdGV4dCBiZXR3ZWVuIHRhZ3MuXG4gICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKHRhZ1Jlc1swXSk7XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHZhbHVlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgY2hyID0gdmFsdWUuY2hhckF0KGkpO1xuXG4gICAgICAgICAgaWYgKGlzV2hpdGVzcGFjZShjaHIpKSB7XG4gICAgICAgICAgICBzcGFjZXMucHVzaCh0b2tlbnMubGVuZ3RoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9uU3BhY2UgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRva2Vucy5wdXNoKFsndGV4dCcsIGNociwgc3RhcnQsIHN0YXJ0ICsgMV0pO1xuICAgICAgICAgIHN0YXJ0ICs9IDE7XG5cbiAgICAgICAgICAvLyBDaGVjayBmb3Igd2hpdGVzcGFjZSBvbiB0aGUgY3VycmVudCBsaW5lLlxuICAgICAgICAgIGlmIChjaHIgPT0gJ1xcbicpIHN0cmlwU3BhY2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBNYXRjaCB0aGUgb3BlbmluZyB0YWcuXG4gICAgICBpZiAoIXNjYW5uZXIuc2Nhbih0YWdSZXNbMF0pKSBicmVhaztcbiAgICAgIGhhc1RhZyA9IHRydWU7XG5cbiAgICAgIC8vIEdldCB0aGUgdGFnIHR5cGUuXG4gICAgICB0eXBlID0gc2Nhbm5lci5zY2FuKHRhZ1JlKSB8fCAnbmFtZSc7XG4gICAgICBzY2FubmVyLnNjYW4od2hpdGVSZSk7XG5cbiAgICAgIC8vIEdldCB0aGUgdGFnIHZhbHVlLlxuICAgICAgaWYgKHR5cGUgPT09ICc9Jykge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKGVxUmUpO1xuICAgICAgICBzY2FubmVyLnNjYW4oZXFSZSk7XG4gICAgICAgIHNjYW5uZXIuc2NhblVudGlsKHRhZ1Jlc1sxXSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd7Jykge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKG5ldyBSZWdFeHAoJ1xcXFxzKicgKyBlc2NhcGVSZWdFeHAoJ30nICsgdGFnc1sxXSkpKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuKGN1cmx5UmUpO1xuICAgICAgICBzY2FubmVyLnNjYW5VbnRpbCh0YWdSZXNbMV0pO1xuICAgICAgICB0eXBlID0gJyYnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbCh0YWdSZXNbMV0pO1xuICAgICAgfVxuXG4gICAgICAvLyBNYXRjaCB0aGUgY2xvc2luZyB0YWcuXG4gICAgICBpZiAoIXNjYW5uZXIuc2Nhbih0YWdSZXNbMV0pKSB0aHJvdyBuZXcgRXJyb3IoJ1VuY2xvc2VkIHRhZyBhdCAnICsgc2Nhbm5lci5wb3MpO1xuXG4gICAgICB0b2tlbiA9IFt0eXBlLCB2YWx1ZSwgc3RhcnQsIHNjYW5uZXIucG9zXTtcbiAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcblxuICAgICAgaWYgKHR5cGUgPT09ICcjJyB8fCB0eXBlID09PSAnXicpIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaCh0b2tlbik7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICcvJykge1xuICAgICAgICAvLyBDaGVjayBzZWN0aW9uIG5lc3RpbmcuXG4gICAgICAgIG9wZW5TZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG4gICAgICAgIGlmICghb3BlblNlY3Rpb24pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vub3BlbmVkIHNlY3Rpb24gXCInICsgdmFsdWUgKyAnXCIgYXQgJyArIHN0YXJ0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3BlblNlY3Rpb25bMV0gIT09IHZhbHVlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmNsb3NlZCBzZWN0aW9uIFwiJyArIG9wZW5TZWN0aW9uWzFdICsgJ1wiIGF0ICcgKyBzdGFydCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ25hbWUnIHx8IHR5cGUgPT09ICd7JyB8fCB0eXBlID09PSAnJicpIHtcbiAgICAgICAgbm9uU3BhY2UgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnPScpIHtcbiAgICAgICAgLy8gU2V0IHRoZSB0YWdzIGZvciB0aGUgbmV4dCB0aW1lIGFyb3VuZC5cbiAgICAgICAgdGFncyA9IHZhbHVlLnNwbGl0KHNwYWNlUmUpO1xuICAgICAgICBpZiAodGFncy5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdGFncyBhdCAnICsgc3RhcnQgKyAnOiAnICsgdGFncy5qb2luKCcsICcpKTtcbiAgICAgICAgfVxuICAgICAgICB0YWdSZXMgPSBlc2NhcGVUYWdzKHRhZ3MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gb3BlbiBzZWN0aW9ucyB3aGVuIHdlJ3JlIGRvbmUuXG4gICAgb3BlblNlY3Rpb24gPSBzZWN0aW9ucy5wb3AoKTtcbiAgICBpZiAob3BlblNlY3Rpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5jbG9zZWQgc2VjdGlvbiBcIicgKyBvcGVuU2VjdGlvblsxXSArICdcIiBhdCAnICsgc2Nhbm5lci5wb3MpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXN0VG9rZW5zKHNxdWFzaFRva2Vucyh0b2tlbnMpKTtcbiAgfVxuXG4gIG11c3RhY2hlLm5hbWUgPSBcIm11c3RhY2hlLmpzXCI7XG4gIG11c3RhY2hlLnZlcnNpb24gPSBcIjAuNy4zXCI7XG4gIG11c3RhY2hlLnRhZ3MgPSBbXCJ7e1wiLCBcIn19XCJdO1xuXG4gIG11c3RhY2hlLlNjYW5uZXIgPSBTY2FubmVyO1xuICBtdXN0YWNoZS5Db250ZXh0ID0gQ29udGV4dDtcbiAgbXVzdGFjaGUuV3JpdGVyID0gV3JpdGVyO1xuXG4gIG11c3RhY2hlLnBhcnNlID0gcGFyc2VUZW1wbGF0ZTtcblxuICAvLyBFeHBvcnQgdGhlIGVzY2FwaW5nIGZ1bmN0aW9uIHNvIHRoYXQgdGhlIHVzZXIgbWF5IG92ZXJyaWRlIGl0LlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2phbmwvbXVzdGFjaGUuanMvaXNzdWVzLzI0NFxuICBtdXN0YWNoZS5lc2NhcGUgPSBlc2NhcGVIdG1sO1xuXG4gIC8vIEFsbCBNdXN0YWNoZS4qIGZ1bmN0aW9ucyB1c2UgdGhpcyB3cml0ZXIuXG4gIHZhciBkZWZhdWx0V3JpdGVyID0gbmV3IFdyaXRlcigpO1xuXG4gIC8qKlxuICAgKiBDbGVhcnMgYWxsIGNhY2hlZCB0ZW1wbGF0ZXMgYW5kIHBhcnRpYWxzIGluIHRoZSBkZWZhdWx0IHdyaXRlci5cbiAgICovXG4gIG11c3RhY2hlLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIuY2xlYXJDYWNoZSgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb21waWxlcyB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCB0byBhIHJldXNhYmxlIGZ1bmN0aW9uIHVzaW5nIHRoZSBkZWZhdWx0XG4gICAqIHdyaXRlci5cbiAgICovXG4gIG11c3RhY2hlLmNvbXBpbGUgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHRhZ3MpIHtcbiAgICByZXR1cm4gZGVmYXVsdFdyaXRlci5jb21waWxlKHRlbXBsYXRlLCB0YWdzKTtcbiAgfTtcblxuICAvKipcbiAgICogQ29tcGlsZXMgdGhlIHBhcnRpYWwgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVgIGFuZCBgdGVtcGxhdGVgIHRvIGEgcmV1c2FibGVcbiAgICogZnVuY3Rpb24gdXNpbmcgdGhlIGRlZmF1bHQgd3JpdGVyLlxuICAgKi9cbiAgbXVzdGFjaGUuY29tcGlsZVBhcnRpYWwgPSBmdW5jdGlvbiAobmFtZSwgdGVtcGxhdGUsIHRhZ3MpIHtcbiAgICByZXR1cm4gZGVmYXVsdFdyaXRlci5jb21waWxlUGFydGlhbChuYW1lLCB0ZW1wbGF0ZSwgdGFncyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENvbXBpbGVzIHRoZSBnaXZlbiBhcnJheSBvZiB0b2tlbnMgKHRoZSBvdXRwdXQgb2YgYSBwYXJzZSkgdG8gYSByZXVzYWJsZVxuICAgKiBmdW5jdGlvbiB1c2luZyB0aGUgZGVmYXVsdCB3cml0ZXIuXG4gICAqL1xuICBtdXN0YWNoZS5jb21waWxlVG9rZW5zID0gZnVuY3Rpb24gKHRva2VucywgdGVtcGxhdGUpIHtcbiAgICByZXR1cm4gZGVmYXVsdFdyaXRlci5jb21waWxlVG9rZW5zKHRva2VucywgdGVtcGxhdGUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHRoZSBgdGVtcGxhdGVgIHdpdGggdGhlIGdpdmVuIGB2aWV3YCBhbmQgYHBhcnRpYWxzYCB1c2luZyB0aGVcbiAgICogZGVmYXVsdCB3cml0ZXIuXG4gICAqL1xuICBtdXN0YWNoZS5yZW5kZXIgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIucmVuZGVyKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscyk7XG4gIH07XG5cbiAgLy8gVGhpcyBpcyBoZXJlIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSB3aXRoIDAuNC54LlxuICBtdXN0YWNoZS50b19odG1sID0gZnVuY3Rpb24gKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscywgc2VuZCkge1xuICAgIHZhciByZXN1bHQgPSBtdXN0YWNoZS5yZW5kZXIodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHNlbmQpKSB7XG4gICAgICBzZW5kKHJlc3VsdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9O1xuXG59KSk7XG4iLCJ2YXIgaHRtbF9zYW5pdGl6ZSA9IHJlcXVpcmUoJy4vc2FuaXRpemVyLWJ1bmRsZS5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIV8pIHJldHVybiAnJztcbiAgICByZXR1cm4gaHRtbF9zYW5pdGl6ZShfLCBjbGVhblVybCwgY2xlYW5JZCk7XG59O1xuXG4vLyBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0yNTUxMDdcbmZ1bmN0aW9uIGNsZWFuVXJsKHVybCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBpZiAoL15odHRwcz8vLnRlc3QodXJsLmdldFNjaGVtZSgpKSkgcmV0dXJuIHVybC50b1N0cmluZygpO1xuICAgIGlmICgnZGF0YScgPT0gdXJsLmdldFNjaGVtZSgpICYmIC9eaW1hZ2UvLnRlc3QodXJsLmdldFBhdGgoKSkpIHtcbiAgICAgICAgcmV0dXJuIHVybC50b1N0cmluZygpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY2xlYW5JZChpZCkgeyByZXR1cm4gaWQ7IH1cbiIsIlxuLy8gQ29weXJpZ2h0IChDKSAyMDEwIEdvb2dsZSBJbmMuXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy9cbi8vICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3XG4gKiBJbXBsZW1lbnRzIFJGQyAzOTg2IGZvciBwYXJzaW5nL2Zvcm1hdHRpbmcgVVJJcy5cbiAqXG4gKiBAYXV0aG9yIG1pa2VzYW11ZWxAZ21haWwuY29tXG4gKiBcXEBwcm92aWRlcyBVUklcbiAqIFxcQG92ZXJyaWRlcyB3aW5kb3dcbiAqL1xuXG52YXIgVVJJID0gKGZ1bmN0aW9uICgpIHtcblxuLyoqXG4gKiBjcmVhdGVzIGEgdXJpIGZyb20gdGhlIHN0cmluZyBmb3JtLiAgVGhlIHBhcnNlciBpcyByZWxheGVkLCBzbyBzcGVjaWFsXG4gKiBjaGFyYWN0ZXJzIHRoYXQgYXJlbid0IGVzY2FwZWQgYnV0IGRvbid0IGNhdXNlIGFtYmlndWl0aWVzIHdpbGwgbm90IGNhdXNlXG4gKiBwYXJzZSBmYWlsdXJlcy5cbiAqXG4gKiBAcmV0dXJuIHtVUkl8bnVsbH1cbiAqL1xuZnVuY3Rpb24gcGFyc2UodXJpU3RyKSB7XG4gIHZhciBtID0gKCcnICsgdXJpU3RyKS5tYXRjaChVUklfUkVfKTtcbiAgaWYgKCFtKSB7IHJldHVybiBudWxsOyB9XG4gIHJldHVybiBuZXcgVVJJKFxuICAgICAgbnVsbElmQWJzZW50KG1bMV0pLFxuICAgICAgbnVsbElmQWJzZW50KG1bMl0pLFxuICAgICAgbnVsbElmQWJzZW50KG1bM10pLFxuICAgICAgbnVsbElmQWJzZW50KG1bNF0pLFxuICAgICAgbnVsbElmQWJzZW50KG1bNV0pLFxuICAgICAgbnVsbElmQWJzZW50KG1bNl0pLFxuICAgICAgbnVsbElmQWJzZW50KG1bN10pKTtcbn1cblxuXG4vKipcbiAqIGNyZWF0ZXMgYSB1cmkgZnJvbSB0aGUgZ2l2ZW4gcGFydHMuXG4gKlxuICogQHBhcmFtIHNjaGVtZSB7c3RyaW5nfSBhbiB1bmVuY29kZWQgc2NoZW1lIHN1Y2ggYXMgXCJodHRwXCIgb3IgbnVsbFxuICogQHBhcmFtIGNyZWRlbnRpYWxzIHtzdHJpbmd9IHVuZW5jb2RlZCB1c2VyIGNyZWRlbnRpYWxzIG9yIG51bGxcbiAqIEBwYXJhbSBkb21haW4ge3N0cmluZ30gYW4gdW5lbmNvZGVkIGRvbWFpbiBuYW1lIG9yIG51bGxcbiAqIEBwYXJhbSBwb3J0IHtudW1iZXJ9IGEgcG9ydCBudW1iZXIgaW4gWzEsIDMyNzY4XS5cbiAqICAgIC0xIGluZGljYXRlcyBubyBwb3J0LCBhcyBkb2VzIG51bGwuXG4gKiBAcGFyYW0gcGF0aCB7c3RyaW5nfSBhbiB1bmVuY29kZWQgcGF0aFxuICogQHBhcmFtIHF1ZXJ5IHtBcnJheS48c3RyaW5nPnxzdHJpbmd8bnVsbH0gYSBsaXN0IG9mIHVuZW5jb2RlZCBjZ2lcbiAqICAgcGFyYW1ldGVycyB3aGVyZSBldmVuIHZhbHVlcyBhcmUga2V5cyBhbmQgb2RkcyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcbiAqICAgb3IgYW4gdW5lbmNvZGVkIHF1ZXJ5LlxuICogQHBhcmFtIGZyYWdtZW50IHtzdHJpbmd9IGFuIHVuZW5jb2RlZCBmcmFnbWVudCB3aXRob3V0IHRoZSBcIiNcIiBvciBudWxsLlxuICogQHJldHVybiB7VVJJfVxuICovXG5mdW5jdGlvbiBjcmVhdGUoc2NoZW1lLCBjcmVkZW50aWFscywgZG9tYWluLCBwb3J0LCBwYXRoLCBxdWVyeSwgZnJhZ21lbnQpIHtcbiAgdmFyIHVyaSA9IG5ldyBVUkkoXG4gICAgICBlbmNvZGVJZkV4aXN0czIoc2NoZW1lLCBVUklfRElTQUxMT1dFRF9JTl9TQ0hFTUVfT1JfQ1JFREVOVElBTFNfKSxcbiAgICAgIGVuY29kZUlmRXhpc3RzMihcbiAgICAgICAgICBjcmVkZW50aWFscywgVVJJX0RJU0FMTE9XRURfSU5fU0NIRU1FX09SX0NSRURFTlRJQUxTXyksXG4gICAgICBlbmNvZGVJZkV4aXN0cyhkb21haW4pLFxuICAgICAgcG9ydCA+IDAgPyBwb3J0LnRvU3RyaW5nKCkgOiBudWxsLFxuICAgICAgZW5jb2RlSWZFeGlzdHMyKHBhdGgsIFVSSV9ESVNBTExPV0VEX0lOX1BBVEhfKSxcbiAgICAgIG51bGwsXG4gICAgICBlbmNvZGVJZkV4aXN0cyhmcmFnbWVudCkpO1xuICBpZiAocXVlcnkpIHtcbiAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBxdWVyeSkge1xuICAgICAgdXJpLnNldFJhd1F1ZXJ5KHF1ZXJ5LnJlcGxhY2UoL1tePyY9MC05QS1aYS16X1xcLX4uJV0vZywgZW5jb2RlT25lKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVyaS5zZXRBbGxQYXJhbWV0ZXJzKHF1ZXJ5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHVyaTtcbn1cbmZ1bmN0aW9uIGVuY29kZUlmRXhpc3RzKHVuZXNjYXBlZFBhcnQpIHtcbiAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB1bmVzY2FwZWRQYXJ0KSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh1bmVzY2FwZWRQYXJ0KTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG4vKipcbiAqIGlmIHVuZXNjYXBlZFBhcnQgaXMgbm9uIG51bGwsIHRoZW4gZXNjYXBlcyBhbnkgY2hhcmFjdGVycyBpbiBpdCB0aGF0IGFyZW4ndFxuICogdmFsaWQgY2hhcmFjdGVycyBpbiBhIHVybCBhbmQgYWxzbyBlc2NhcGVzIGFueSBzcGVjaWFsIGNoYXJhY3RlcnMgdGhhdFxuICogYXBwZWFyIGluIGV4dHJhLlxuICpcbiAqIEBwYXJhbSB1bmVzY2FwZWRQYXJ0IHtzdHJpbmd9XG4gKiBAcGFyYW0gZXh0cmEge1JlZ0V4cH0gYSBjaGFyYWN0ZXIgc2V0IG9mIGNoYXJhY3RlcnMgaW4gW1xcMDEtXFwxNzddLlxuICogQHJldHVybiB7c3RyaW5nfG51bGx9IG51bGwgaWZmIHVuZXNjYXBlZFBhcnQgPT0gbnVsbC5cbiAqL1xuZnVuY3Rpb24gZW5jb2RlSWZFeGlzdHMyKHVuZXNjYXBlZFBhcnQsIGV4dHJhKSB7XG4gIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgdW5lc2NhcGVkUGFydCkge1xuICAgIHJldHVybiBlbmNvZGVVUkkodW5lc2NhcGVkUGFydCkucmVwbGFjZShleHRyYSwgZW5jb2RlT25lKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG4vKiogY29udmVydHMgYSBjaGFyYWN0ZXIgaW4gW1xcMDEtXFwxNzddIHRvIGl0cyB1cmwgZW5jb2RlZCBlcXVpdmFsZW50LiAqL1xuZnVuY3Rpb24gZW5jb2RlT25lKGNoKSB7XG4gIHZhciBuID0gY2guY2hhckNvZGVBdCgwKTtcbiAgcmV0dXJuICclJyArICcwMTIzNDU2Nzg5QUJDREVGJy5jaGFyQXQoKG4gPj4gNCkgJiAweGYpICtcbiAgICAgICcwMTIzNDU2Nzg5QUJDREVGJy5jaGFyQXQobiAmIDB4Zik7XG59XG5cbi8qKlxuICoge0B1cGRvY1xuICogICQgbm9ybVBhdGgoJ2Zvby8uL2JhcicpXG4gKiAgIyAnZm9vL2JhcidcbiAqICAkIG5vcm1QYXRoKCcuL2ZvbycpXG4gKiAgIyAnZm9vJ1xuICogICQgbm9ybVBhdGgoJ2Zvby8uJylcbiAqICAjICdmb28nXG4gKiAgJCBub3JtUGF0aCgnZm9vLy9iYXInKVxuICogICMgJ2Zvby9iYXInXG4gKiB9XG4gKi9cbmZ1bmN0aW9uIG5vcm1QYXRoKHBhdGgpIHtcbiAgcmV0dXJuIHBhdGgucmVwbGFjZSgvKF58XFwvKVxcLig/OlxcL3wkKS9nLCAnJDEnKS5yZXBsYWNlKC9cXC97Mix9L2csICcvJyk7XG59XG5cbnZhciBQQVJFTlRfRElSRUNUT1JZX0hBTkRMRVIgPSBuZXcgUmVnRXhwKFxuICAgICcnXG4gICAgLy8gQSBwYXRoIGJyZWFrXG4gICAgKyAnKC98XiknXG4gICAgLy8gZm9sbG93ZWQgYnkgYSBub24gLi4gcGF0aCBlbGVtZW50XG4gICAgLy8gKGNhbm5vdCBiZSAuIGJlY2F1c2Ugbm9ybVBhdGggaXMgdXNlZCBwcmlvciB0byB0aGlzIFJlZ0V4cClcbiAgICArICcoPzpbXi4vXVteL10qfFxcXFwuezIsfSg/OlteLi9dW14vXSopfFxcXFwuezMsfVteL10qKSdcbiAgICAvLyBmb2xsb3dlZCBieSAuLiBmb2xsb3dlZCBieSBhIHBhdGggYnJlYWsuXG4gICAgKyAnL1xcXFwuXFxcXC4oPzovfCQpJyk7XG5cbnZhciBQQVJFTlRfRElSRUNUT1JZX0hBTkRMRVJfUkUgPSBuZXcgUmVnRXhwKFBBUkVOVF9ESVJFQ1RPUllfSEFORExFUik7XG5cbnZhciBFWFRSQV9QQVJFTlRfUEFUSFNfUkUgPSAvXig/OlxcLlxcLlxcLykqKD86XFwuXFwuJCk/LztcblxuLyoqXG4gKiBOb3JtYWxpemVzIGl0cyBpbnB1dCBwYXRoIGFuZCBjb2xsYXBzZXMgYWxsIC4gYW5kIC4uIHNlcXVlbmNlcyBleGNlcHQgZm9yXG4gKiAuLiBzZXF1ZW5jZXMgdGhhdCB3b3VsZCB0YWtlIGl0IGFib3ZlIHRoZSByb290IG9mIHRoZSBjdXJyZW50IHBhcmVudFxuICogZGlyZWN0b3J5LlxuICoge0B1cGRvY1xuICogICQgY29sbGFwc2VfZG90cygnZm9vLy4uL2JhcicpXG4gKiAgIyAnYmFyJ1xuICogICQgY29sbGFwc2VfZG90cygnZm9vLy4vYmFyJylcbiAqICAjICdmb28vYmFyJ1xuICogICQgY29sbGFwc2VfZG90cygnZm9vLy4uL2Jhci8uLy4uLy4uL2JheicpXG4gKiAgIyAnYmF6J1xuICogICQgY29sbGFwc2VfZG90cygnLi4vZm9vJylcbiAqICAjICcuLi9mb28nXG4gKiAgJCBjb2xsYXBzZV9kb3RzKCcuLi9mb28nKS5yZXBsYWNlKEVYVFJBX1BBUkVOVF9QQVRIU19SRSwgJycpXG4gKiAgIyAnZm9vJ1xuICogfVxuICovXG5mdW5jdGlvbiBjb2xsYXBzZV9kb3RzKHBhdGgpIHtcbiAgaWYgKHBhdGggPT09IG51bGwpIHsgcmV0dXJuIG51bGw7IH1cbiAgdmFyIHAgPSBub3JtUGF0aChwYXRoKTtcbiAgLy8gT25seSAvLi4vIGxlZnQgdG8gZmxhdHRlblxuICB2YXIgciA9IFBBUkVOVF9ESVJFQ1RPUllfSEFORExFUl9SRTtcbiAgLy8gV2UgcmVwbGFjZSB3aXRoICQxIHdoaWNoIG1hdGNoZXMgYSAvIGJlZm9yZSB0aGUgLi4gYmVjYXVzZSB0aGlzXG4gIC8vIGd1YXJhbnRlZXMgdGhhdDpcbiAgLy8gKDEpIHdlIGhhdmUgYXQgbW9zdCAxIC8gYmV0d2VlbiB0aGUgYWRqYWNlbnQgcGxhY2UsXG4gIC8vICgyKSBhbHdheXMgaGF2ZSBhIHNsYXNoIGlmIHRoZXJlIGlzIGEgcHJlY2VkaW5nIHBhdGggc2VjdGlvbiwgYW5kXG4gIC8vICgzKSB3ZSBuZXZlciB0dXJuIGEgcmVsYXRpdmUgcGF0aCBpbnRvIGFuIGFic29sdXRlIHBhdGguXG4gIGZvciAodmFyIHE7IChxID0gcC5yZXBsYWNlKHIsICckMScpKSAhPSBwOyBwID0gcSkge307XG4gIHJldHVybiBwO1xufVxuXG4vKipcbiAqIHJlc29sdmVzIGEgcmVsYXRpdmUgdXJsIHN0cmluZyB0byBhIGJhc2UgdXJpLlxuICogQHJldHVybiB7VVJJfVxuICovXG5mdW5jdGlvbiByZXNvbHZlKGJhc2VVcmksIHJlbGF0aXZlVXJpKSB7XG4gIC8vIHRoZXJlIGFyZSBzZXZlcmFsIGtpbmRzIG9mIHJlbGF0aXZlIHVybHM6XG4gIC8vIDEuIC8vZm9vIC0gcmVwbGFjZXMgZXZlcnl0aGluZyBmcm9tIHRoZSBkb21haW4gb24uICBmb28gaXMgYSBkb21haW4gbmFtZVxuICAvLyAyLiBmb28gLSByZXBsYWNlcyB0aGUgbGFzdCBwYXJ0IG9mIHRoZSBwYXRoLCB0aGUgd2hvbGUgcXVlcnkgYW5kIGZyYWdtZW50XG4gIC8vIDMuIC9mb28gLSByZXBsYWNlcyB0aGUgdGhlIHBhdGgsIHRoZSBxdWVyeSBhbmQgZnJhZ21lbnRcbiAgLy8gNC4gP2ZvbyAtIHJlcGxhY2UgdGhlIHF1ZXJ5IGFuZCBmcmFnbWVudFxuICAvLyA1LiAjZm9vIC0gcmVwbGFjZSB0aGUgZnJhZ21lbnQgb25seVxuXG4gIHZhciBhYnNvbHV0ZVVyaSA9IGJhc2VVcmkuY2xvbmUoKTtcbiAgLy8gd2Ugc2F0aXNmeSB0aGVzZSBjb25kaXRpb25zIGJ5IGxvb2tpbmcgZm9yIHRoZSBmaXJzdCBwYXJ0IG9mIHJlbGF0aXZlVXJpXG4gIC8vIHRoYXQgaXMgbm90IGJsYW5rIGFuZCBhcHBseWluZyBkZWZhdWx0cyB0byB0aGUgcmVzdFxuXG4gIHZhciBvdmVycmlkZGVuID0gcmVsYXRpdmVVcmkuaGFzU2NoZW1lKCk7XG5cbiAgaWYgKG92ZXJyaWRkZW4pIHtcbiAgICBhYnNvbHV0ZVVyaS5zZXRSYXdTY2hlbWUocmVsYXRpdmVVcmkuZ2V0UmF3U2NoZW1lKCkpO1xuICB9IGVsc2Uge1xuICAgIG92ZXJyaWRkZW4gPSByZWxhdGl2ZVVyaS5oYXNDcmVkZW50aWFscygpO1xuICB9XG5cbiAgaWYgKG92ZXJyaWRkZW4pIHtcbiAgICBhYnNvbHV0ZVVyaS5zZXRSYXdDcmVkZW50aWFscyhyZWxhdGl2ZVVyaS5nZXRSYXdDcmVkZW50aWFscygpKTtcbiAgfSBlbHNlIHtcbiAgICBvdmVycmlkZGVuID0gcmVsYXRpdmVVcmkuaGFzRG9tYWluKCk7XG4gIH1cblxuICBpZiAob3ZlcnJpZGRlbikge1xuICAgIGFic29sdXRlVXJpLnNldFJhd0RvbWFpbihyZWxhdGl2ZVVyaS5nZXRSYXdEb21haW4oKSk7XG4gIH0gZWxzZSB7XG4gICAgb3ZlcnJpZGRlbiA9IHJlbGF0aXZlVXJpLmhhc1BvcnQoKTtcbiAgfVxuXG4gIHZhciByYXdQYXRoID0gcmVsYXRpdmVVcmkuZ2V0UmF3UGF0aCgpO1xuICB2YXIgc2ltcGxpZmllZFBhdGggPSBjb2xsYXBzZV9kb3RzKHJhd1BhdGgpO1xuICBpZiAob3ZlcnJpZGRlbikge1xuICAgIGFic29sdXRlVXJpLnNldFBvcnQocmVsYXRpdmVVcmkuZ2V0UG9ydCgpKTtcbiAgICBzaW1wbGlmaWVkUGF0aCA9IHNpbXBsaWZpZWRQYXRoXG4gICAgICAgICYmIHNpbXBsaWZpZWRQYXRoLnJlcGxhY2UoRVhUUkFfUEFSRU5UX1BBVEhTX1JFLCAnJyk7XG4gIH0gZWxzZSB7XG4gICAgb3ZlcnJpZGRlbiA9ICEhcmF3UGF0aDtcbiAgICBpZiAob3ZlcnJpZGRlbikge1xuICAgICAgLy8gcmVzb2x2ZSBwYXRoIHByb3Blcmx5XG4gICAgICBpZiAoc2ltcGxpZmllZFBhdGguY2hhckNvZGVBdCgwKSAhPT0gMHgyZiAvKiAvICovKSB7ICAvLyBwYXRoIGlzIHJlbGF0aXZlXG4gICAgICAgIHZhciBhYnNSYXdQYXRoID0gY29sbGFwc2VfZG90cyhhYnNvbHV0ZVVyaS5nZXRSYXdQYXRoKCkgfHwgJycpXG4gICAgICAgICAgICAucmVwbGFjZShFWFRSQV9QQVJFTlRfUEFUSFNfUkUsICcnKTtcbiAgICAgICAgdmFyIHNsYXNoID0gYWJzUmF3UGF0aC5sYXN0SW5kZXhPZignLycpICsgMTtcbiAgICAgICAgc2ltcGxpZmllZFBhdGggPSBjb2xsYXBzZV9kb3RzKFxuICAgICAgICAgICAgKHNsYXNoID8gYWJzUmF3UGF0aC5zdWJzdHJpbmcoMCwgc2xhc2gpIDogJycpXG4gICAgICAgICAgICArIGNvbGxhcHNlX2RvdHMocmF3UGF0aCkpXG4gICAgICAgICAgICAucmVwbGFjZShFWFRSQV9QQVJFTlRfUEFUSFNfUkUsICcnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2ltcGxpZmllZFBhdGggPSBzaW1wbGlmaWVkUGF0aFxuICAgICAgICAgICYmIHNpbXBsaWZpZWRQYXRoLnJlcGxhY2UoRVhUUkFfUEFSRU5UX1BBVEhTX1JFLCAnJyk7XG4gICAgICBpZiAoc2ltcGxpZmllZFBhdGggIT09IHJhd1BhdGgpIHtcbiAgICAgICAgYWJzb2x1dGVVcmkuc2V0UmF3UGF0aChzaW1wbGlmaWVkUGF0aCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKG92ZXJyaWRkZW4pIHtcbiAgICBhYnNvbHV0ZVVyaS5zZXRSYXdQYXRoKHNpbXBsaWZpZWRQYXRoKTtcbiAgfSBlbHNlIHtcbiAgICBvdmVycmlkZGVuID0gcmVsYXRpdmVVcmkuaGFzUXVlcnkoKTtcbiAgfVxuXG4gIGlmIChvdmVycmlkZGVuKSB7XG4gICAgYWJzb2x1dGVVcmkuc2V0UmF3UXVlcnkocmVsYXRpdmVVcmkuZ2V0UmF3UXVlcnkoKSk7XG4gIH0gZWxzZSB7XG4gICAgb3ZlcnJpZGRlbiA9IHJlbGF0aXZlVXJpLmhhc0ZyYWdtZW50KCk7XG4gIH1cblxuICBpZiAob3ZlcnJpZGRlbikge1xuICAgIGFic29sdXRlVXJpLnNldFJhd0ZyYWdtZW50KHJlbGF0aXZlVXJpLmdldFJhd0ZyYWdtZW50KCkpO1xuICB9XG5cbiAgcmV0dXJuIGFic29sdXRlVXJpO1xufVxuXG4vKipcbiAqIGEgbXV0YWJsZSBVUkkuXG4gKlxuICogVGhpcyBjbGFzcyBjb250YWlucyBzZXR0ZXJzIGFuZCBnZXR0ZXJzIGZvciB0aGUgcGFydHMgb2YgdGhlIFVSSS5cbiAqIFRoZSA8dHQ+Z2V0WFlaPC90dD4vPHR0PnNldFhZWjwvdHQ+IG1ldGhvZHMgcmV0dXJuIHRoZSBkZWNvZGVkIHBhcnQgLS0gc29cbiAqIDxjb2RlPnVyaS5wYXJzZSgnL2ZvbyUyMGJhcicpLmdldFBhdGgoKTwvY29kZT4gd2lsbCByZXR1cm4gdGhlIGRlY29kZWQgcGF0aCxcbiAqIDx0dD4vZm9vIGJhcjwvdHQ+LlxuICpcbiAqIDxwPlRoZSByYXcgdmVyc2lvbnMgb2YgZmllbGRzIGFyZSBhdmFpbGFibGUgdG9vLlxuICogPGNvZGU+dXJpLnBhcnNlKCcvZm9vJTIwYmFyJykuZ2V0UmF3UGF0aCgpPC9jb2RlPiB3aWxsIHJldHVybiB0aGUgcmF3IHBhdGgsXG4gKiA8dHQ+L2ZvbyUyMGJhcjwvdHQ+LiAgVXNlIHRoZSByYXcgc2V0dGVycyB3aXRoIGNhcmUsIHNpbmNlXG4gKiA8Y29kZT5VUkk6OnRvU3RyaW5nPC9jb2RlPiBpcyBub3QgZ3VhcmFudGVlZCB0byByZXR1cm4gYSB2YWxpZCB1cmwgaWYgYVxuICogcmF3IHNldHRlciB3YXMgdXNlZC5cbiAqXG4gKiA8cD5BbGwgc2V0dGVycyByZXR1cm4gPHR0PnRoaXM8L3R0PiBhbmQgc28gbWF5IGJlIGNoYWluZWQsIGEgbGFcbiAqIDxjb2RlPnVyaS5wYXJzZSgnL2ZvbycpLnNldEZyYWdtZW50KCdwYXJ0JykudG9TdHJpbmcoKTwvY29kZT4uXG4gKlxuICogPHA+WW91IHNob3VsZCBub3QgdXNlIHRoaXMgY29uc3RydWN0b3IgZGlyZWN0bHkgLS0gcGxlYXNlIHByZWZlciB0aGUgZmFjdG9yeVxuICogZnVuY3Rpb25zIHtAbGluayB1cmkucGFyc2V9LCB7QGxpbmsgdXJpLmNyZWF0ZX0sIHtAbGluayB1cmkucmVzb2x2ZX1cbiAqIGluc3RlYWQuPC9wPlxuICpcbiAqIDxwPlRoZSBwYXJhbWV0ZXJzIGFyZSBhbGwgcmF3IChhc3N1bWVkIHRvIGJlIHByb3Blcmx5IGVzY2FwZWQpIHBhcnRzLCBhbmRcbiAqIGFueSAoYnV0IG5vdCBhbGwpIG1heSBiZSBudWxsLiAgVW5kZWZpbmVkIGlzIG5vdCBhbGxvd2VkLjwvcD5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gVVJJKFxuICAgIHJhd1NjaGVtZSxcbiAgICByYXdDcmVkZW50aWFscywgcmF3RG9tYWluLCBwb3J0LFxuICAgIHJhd1BhdGgsIHJhd1F1ZXJ5LCByYXdGcmFnbWVudCkge1xuICB0aGlzLnNjaGVtZV8gPSByYXdTY2hlbWU7XG4gIHRoaXMuY3JlZGVudGlhbHNfID0gcmF3Q3JlZGVudGlhbHM7XG4gIHRoaXMuZG9tYWluXyA9IHJhd0RvbWFpbjtcbiAgdGhpcy5wb3J0XyA9IHBvcnQ7XG4gIHRoaXMucGF0aF8gPSByYXdQYXRoO1xuICB0aGlzLnF1ZXJ5XyA9IHJhd1F1ZXJ5O1xuICB0aGlzLmZyYWdtZW50XyA9IHJhd0ZyYWdtZW50O1xuICAvKipcbiAgICogQHR5cGUge0FycmF5fG51bGx9XG4gICAqL1xuICB0aGlzLnBhcmFtQ2FjaGVfID0gbnVsbDtcbn1cblxuLyoqIHJldHVybnMgdGhlIHN0cmluZyBmb3JtIG9mIHRoZSB1cmwuICovXG5VUkkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW107XG4gIGlmIChudWxsICE9PSB0aGlzLnNjaGVtZV8pIHsgb3V0LnB1c2godGhpcy5zY2hlbWVfLCAnOicpOyB9XG4gIGlmIChudWxsICE9PSB0aGlzLmRvbWFpbl8pIHtcbiAgICBvdXQucHVzaCgnLy8nKTtcbiAgICBpZiAobnVsbCAhPT0gdGhpcy5jcmVkZW50aWFsc18pIHsgb3V0LnB1c2godGhpcy5jcmVkZW50aWFsc18sICdAJyk7IH1cbiAgICBvdXQucHVzaCh0aGlzLmRvbWFpbl8pO1xuICAgIGlmIChudWxsICE9PSB0aGlzLnBvcnRfKSB7IG91dC5wdXNoKCc6JywgdGhpcy5wb3J0Xy50b1N0cmluZygpKTsgfVxuICB9XG4gIGlmIChudWxsICE9PSB0aGlzLnBhdGhfKSB7IG91dC5wdXNoKHRoaXMucGF0aF8pOyB9XG4gIGlmIChudWxsICE9PSB0aGlzLnF1ZXJ5XykgeyBvdXQucHVzaCgnPycsIHRoaXMucXVlcnlfKTsgfVxuICBpZiAobnVsbCAhPT0gdGhpcy5mcmFnbWVudF8pIHsgb3V0LnB1c2goJyMnLCB0aGlzLmZyYWdtZW50Xyk7IH1cbiAgcmV0dXJuIG91dC5qb2luKCcnKTtcbn07XG5cblVSSS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgVVJJKHRoaXMuc2NoZW1lXywgdGhpcy5jcmVkZW50aWFsc18sIHRoaXMuZG9tYWluXywgdGhpcy5wb3J0XyxcbiAgICAgICAgICAgICAgICAgdGhpcy5wYXRoXywgdGhpcy5xdWVyeV8sIHRoaXMuZnJhZ21lbnRfKTtcbn07XG5cblVSSS5wcm90b3R5cGUuZ2V0U2NoZW1lID0gZnVuY3Rpb24gKCkge1xuICAvLyBIVE1MNSBzcGVjIGRvZXMgbm90IHJlcXVpcmUgdGhlIHNjaGVtZSB0byBiZSBsb3dlcmNhc2VkIGJ1dFxuICAvLyBhbGwgY29tbW9uIGJyb3dzZXJzIGV4Y2VwdCBTYWZhcmkgbG93ZXJjYXNlIHRoZSBzY2hlbWUuXG4gIHJldHVybiB0aGlzLnNjaGVtZV8gJiYgZGVjb2RlVVJJQ29tcG9uZW50KHRoaXMuc2NoZW1lXykudG9Mb3dlckNhc2UoKTtcbn07XG5VUkkucHJvdG90eXBlLmdldFJhd1NjaGVtZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuc2NoZW1lXztcbn07XG5VUkkucHJvdG90eXBlLnNldFNjaGVtZSA9IGZ1bmN0aW9uIChuZXdTY2hlbWUpIHtcbiAgdGhpcy5zY2hlbWVfID0gZW5jb2RlSWZFeGlzdHMyKFxuICAgICAgbmV3U2NoZW1lLCBVUklfRElTQUxMT1dFRF9JTl9TQ0hFTUVfT1JfQ1JFREVOVElBTFNfKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuVVJJLnByb3RvdHlwZS5zZXRSYXdTY2hlbWUgPSBmdW5jdGlvbiAobmV3U2NoZW1lKSB7XG4gIHRoaXMuc2NoZW1lXyA9IG5ld1NjaGVtZSA/IG5ld1NjaGVtZSA6IG51bGw7XG4gIHJldHVybiB0aGlzO1xufTtcblVSSS5wcm90b3R5cGUuaGFzU2NoZW1lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbnVsbCAhPT0gdGhpcy5zY2hlbWVfO1xufTtcblxuXG5VUkkucHJvdG90eXBlLmdldENyZWRlbnRpYWxzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5jcmVkZW50aWFsc18gJiYgZGVjb2RlVVJJQ29tcG9uZW50KHRoaXMuY3JlZGVudGlhbHNfKTtcbn07XG5VUkkucHJvdG90eXBlLmdldFJhd0NyZWRlbnRpYWxzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5jcmVkZW50aWFsc187XG59O1xuVVJJLnByb3RvdHlwZS5zZXRDcmVkZW50aWFscyA9IGZ1bmN0aW9uIChuZXdDcmVkZW50aWFscykge1xuICB0aGlzLmNyZWRlbnRpYWxzXyA9IGVuY29kZUlmRXhpc3RzMihcbiAgICAgIG5ld0NyZWRlbnRpYWxzLCBVUklfRElTQUxMT1dFRF9JTl9TQ0hFTUVfT1JfQ1JFREVOVElBTFNfKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5VUkkucHJvdG90eXBlLnNldFJhd0NyZWRlbnRpYWxzID0gZnVuY3Rpb24gKG5ld0NyZWRlbnRpYWxzKSB7XG4gIHRoaXMuY3JlZGVudGlhbHNfID0gbmV3Q3JlZGVudGlhbHMgPyBuZXdDcmVkZW50aWFscyA6IG51bGw7XG4gIHJldHVybiB0aGlzO1xufTtcblVSSS5wcm90b3R5cGUuaGFzQ3JlZGVudGlhbHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBudWxsICE9PSB0aGlzLmNyZWRlbnRpYWxzXztcbn07XG5cblxuVVJJLnByb3RvdHlwZS5nZXREb21haW4gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmRvbWFpbl8gJiYgZGVjb2RlVVJJQ29tcG9uZW50KHRoaXMuZG9tYWluXyk7XG59O1xuVVJJLnByb3RvdHlwZS5nZXRSYXdEb21haW4gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmRvbWFpbl87XG59O1xuVVJJLnByb3RvdHlwZS5zZXREb21haW4gPSBmdW5jdGlvbiAobmV3RG9tYWluKSB7XG4gIHJldHVybiB0aGlzLnNldFJhd0RvbWFpbihuZXdEb21haW4gJiYgZW5jb2RlVVJJQ29tcG9uZW50KG5ld0RvbWFpbikpO1xufTtcblVSSS5wcm90b3R5cGUuc2V0UmF3RG9tYWluID0gZnVuY3Rpb24gKG5ld0RvbWFpbikge1xuICB0aGlzLmRvbWFpbl8gPSBuZXdEb21haW4gPyBuZXdEb21haW4gOiBudWxsO1xuICAvLyBNYWludGFpbiB0aGUgaW52YXJpYW50IHRoYXQgcGF0aHMgbXVzdCBzdGFydCB3aXRoIGEgc2xhc2ggd2hlbiB0aGUgVVJJXG4gIC8vIGlzIG5vdCBwYXRoLXJlbGF0aXZlLlxuICByZXR1cm4gdGhpcy5zZXRSYXdQYXRoKHRoaXMucGF0aF8pO1xufTtcblVSSS5wcm90b3R5cGUuaGFzRG9tYWluID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbnVsbCAhPT0gdGhpcy5kb21haW5fO1xufTtcblxuXG5VUkkucHJvdG90eXBlLmdldFBvcnQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnBvcnRfICYmIGRlY29kZVVSSUNvbXBvbmVudCh0aGlzLnBvcnRfKTtcbn07XG5VUkkucHJvdG90eXBlLnNldFBvcnQgPSBmdW5jdGlvbiAobmV3UG9ydCkge1xuICBpZiAobmV3UG9ydCkge1xuICAgIG5ld1BvcnQgPSBOdW1iZXIobmV3UG9ydCk7XG4gICAgaWYgKG5ld1BvcnQgIT09IChuZXdQb3J0ICYgMHhmZmZmKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgcG9ydCBudW1iZXIgJyArIG5ld1BvcnQpO1xuICAgIH1cbiAgICB0aGlzLnBvcnRfID0gJycgKyBuZXdQb3J0O1xuICB9IGVsc2Uge1xuICAgIHRoaXMucG9ydF8gPSBudWxsO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblVSSS5wcm90b3R5cGUuaGFzUG9ydCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG51bGwgIT09IHRoaXMucG9ydF87XG59O1xuXG5cblVSSS5wcm90b3R5cGUuZ2V0UGF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMucGF0aF8gJiYgZGVjb2RlVVJJQ29tcG9uZW50KHRoaXMucGF0aF8pO1xufTtcblVSSS5wcm90b3R5cGUuZ2V0UmF3UGF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMucGF0aF87XG59O1xuVVJJLnByb3RvdHlwZS5zZXRQYXRoID0gZnVuY3Rpb24gKG5ld1BhdGgpIHtcbiAgcmV0dXJuIHRoaXMuc2V0UmF3UGF0aChlbmNvZGVJZkV4aXN0czIobmV3UGF0aCwgVVJJX0RJU0FMTE9XRURfSU5fUEFUSF8pKTtcbn07XG5VUkkucHJvdG90eXBlLnNldFJhd1BhdGggPSBmdW5jdGlvbiAobmV3UGF0aCkge1xuICBpZiAobmV3UGF0aCkge1xuICAgIG5ld1BhdGggPSBTdHJpbmcobmV3UGF0aCk7XG4gICAgdGhpcy5wYXRoXyA9IFxuICAgICAgLy8gUGF0aHMgbXVzdCBzdGFydCB3aXRoICcvJyB1bmxlc3MgdGhpcyBpcyBhIHBhdGgtcmVsYXRpdmUgVVJMLlxuICAgICAgKCF0aGlzLmRvbWFpbl8gfHwgL15cXC8vLnRlc3QobmV3UGF0aCkpID8gbmV3UGF0aCA6ICcvJyArIG5ld1BhdGg7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXRoXyA9IG51bGw7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuVVJJLnByb3RvdHlwZS5oYXNQYXRoID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbnVsbCAhPT0gdGhpcy5wYXRoXztcbn07XG5cblxuVVJJLnByb3RvdHlwZS5nZXRRdWVyeSA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gRnJvbSBodHRwOi8vd3d3LnczLm9yZy9BZGRyZXNzaW5nL1VSTC80X1VSSV9SZWNvbW1lbnRhdGlvbnMuaHRtbFxuICAvLyBXaXRoaW4gdGhlIHF1ZXJ5IHN0cmluZywgdGhlIHBsdXMgc2lnbiBpcyByZXNlcnZlZCBhcyBzaG9ydGhhbmQgbm90YXRpb25cbiAgLy8gZm9yIGEgc3BhY2UuXG4gIHJldHVybiB0aGlzLnF1ZXJ5XyAmJiBkZWNvZGVVUklDb21wb25lbnQodGhpcy5xdWVyeV8pLnJlcGxhY2UoL1xcKy9nLCAnICcpO1xufTtcblVSSS5wcm90b3R5cGUuZ2V0UmF3UXVlcnkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnF1ZXJ5Xztcbn07XG5VUkkucHJvdG90eXBlLnNldFF1ZXJ5ID0gZnVuY3Rpb24gKG5ld1F1ZXJ5KSB7XG4gIHRoaXMucGFyYW1DYWNoZV8gPSBudWxsO1xuICB0aGlzLnF1ZXJ5XyA9IGVuY29kZUlmRXhpc3RzKG5ld1F1ZXJ5KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuVVJJLnByb3RvdHlwZS5zZXRSYXdRdWVyeSA9IGZ1bmN0aW9uIChuZXdRdWVyeSkge1xuICB0aGlzLnBhcmFtQ2FjaGVfID0gbnVsbDtcbiAgdGhpcy5xdWVyeV8gPSBuZXdRdWVyeSA/IG5ld1F1ZXJ5IDogbnVsbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuVVJJLnByb3RvdHlwZS5oYXNRdWVyeSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG51bGwgIT09IHRoaXMucXVlcnlfO1xufTtcblxuLyoqXG4gKiBzZXRzIHRoZSBxdWVyeSBnaXZlbiBhIGxpc3Qgb2Ygc3RyaW5ncyBvZiB0aGUgZm9ybVxuICogWyBrZXkwLCB2YWx1ZTAsIGtleTEsIHZhbHVlMSwgLi4uIF0uXG4gKlxuICogPHA+PGNvZGU+dXJpLnNldEFsbFBhcmFtZXRlcnMoWydhJywgJ2InLCAnYycsICdkJ10pLmdldFF1ZXJ5KCk8L2NvZGU+XG4gKiB3aWxsIHlpZWxkIDxjb2RlPidhPWImYz1kJzwvY29kZT4uXG4gKi9cblVSSS5wcm90b3R5cGUuc2V0QWxsUGFyYW1ldGVycyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICdvYmplY3QnKSB7XG4gICAgaWYgKCEocGFyYW1zIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgICYmIChwYXJhbXMgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgICAgIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwYXJhbXMpICE9PSAnW29iamVjdCBBcnJheV0nKSkge1xuICAgICAgdmFyIG5ld1BhcmFtcyA9IFtdO1xuICAgICAgdmFyIGkgPSAtMTtcbiAgICAgIGZvciAodmFyIGsgaW4gcGFyYW1zKSB7XG4gICAgICAgIHZhciB2ID0gcGFyYW1zW2tdO1xuICAgICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiB2KSB7XG4gICAgICAgICAgbmV3UGFyYW1zWysraV0gPSBrO1xuICAgICAgICAgIG5ld1BhcmFtc1srK2ldID0gdjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcGFyYW1zID0gbmV3UGFyYW1zO1xuICAgIH1cbiAgfVxuICB0aGlzLnBhcmFtQ2FjaGVfID0gbnVsbDtcbiAgdmFyIHF1ZXJ5QnVmID0gW107XG4gIHZhciBzZXBhcmF0b3IgPSAnJztcbiAgZm9yICh2YXIgaiA9IDA7IGogPCBwYXJhbXMubGVuZ3RoOykge1xuICAgIHZhciBrID0gcGFyYW1zW2orK107XG4gICAgdmFyIHYgPSBwYXJhbXNbaisrXTtcbiAgICBxdWVyeUJ1Zi5wdXNoKHNlcGFyYXRvciwgZW5jb2RlVVJJQ29tcG9uZW50KGsudG9TdHJpbmcoKSkpO1xuICAgIHNlcGFyYXRvciA9ICcmJztcbiAgICBpZiAodikge1xuICAgICAgcXVlcnlCdWYucHVzaCgnPScsIGVuY29kZVVSSUNvbXBvbmVudCh2LnRvU3RyaW5nKCkpKTtcbiAgICB9XG4gIH1cbiAgdGhpcy5xdWVyeV8gPSBxdWVyeUJ1Zi5qb2luKCcnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuVVJJLnByb3RvdHlwZS5jaGVja1BhcmFtZXRlckNhY2hlXyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLnBhcmFtQ2FjaGVfKSB7XG4gICAgdmFyIHEgPSB0aGlzLnF1ZXJ5XztcbiAgICBpZiAoIXEpIHtcbiAgICAgIHRoaXMucGFyYW1DYWNoZV8gPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGNnaVBhcmFtcyA9IHEuc3BsaXQoL1smXFw/XS8pO1xuICAgICAgdmFyIG91dCA9IFtdO1xuICAgICAgdmFyIGsgPSAtMTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2dpUGFyYW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBtID0gY2dpUGFyYW1zW2ldLm1hdGNoKC9eKFtePV0qKSg/Oj0oLiopKT8kLyk7XG4gICAgICAgIC8vIEZyb20gaHR0cDovL3d3dy53My5vcmcvQWRkcmVzc2luZy9VUkwvNF9VUklfUmVjb21tZW50YXRpb25zLmh0bWxcbiAgICAgICAgLy8gV2l0aGluIHRoZSBxdWVyeSBzdHJpbmcsIHRoZSBwbHVzIHNpZ24gaXMgcmVzZXJ2ZWQgYXMgc2hvcnRoYW5kXG4gICAgICAgIC8vIG5vdGF0aW9uIGZvciBhIHNwYWNlLlxuICAgICAgICBvdXRbKytrXSA9IGRlY29kZVVSSUNvbXBvbmVudChtWzFdKS5yZXBsYWNlKC9cXCsvZywgJyAnKTtcbiAgICAgICAgb3V0Wysra10gPSBkZWNvZGVVUklDb21wb25lbnQobVsyXSB8fCAnJykucmVwbGFjZSgvXFwrL2csICcgJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcmFtQ2FjaGVfID0gb3V0O1xuICAgIH1cbiAgfVxufTtcbi8qKlxuICogc2V0cyB0aGUgdmFsdWVzIG9mIHRoZSBuYW1lZCBjZ2kgcGFyYW1ldGVycy5cbiAqXG4gKiA8cD5TbywgPGNvZGU+dXJpLnBhcnNlKCdmb28/YT1iJmM9ZCZlPWYnKS5zZXRQYXJhbWV0ZXJWYWx1ZXMoJ2MnLCBbJ25ldyddKVxuICogPC9jb2RlPiB5aWVsZHMgPHR0PmZvbz9hPWImYz1uZXcmZT1mPC90dD4uPC9wPlxuICpcbiAqIEBwYXJhbSBrZXkge3N0cmluZ31cbiAqIEBwYXJhbSB2YWx1ZXMge0FycmF5LjxzdHJpbmc+fSB0aGUgbmV3IHZhbHVlcy4gIElmIHZhbHVlcyBpcyBhIHNpbmdsZSBzdHJpbmdcbiAqICAgdGhlbiBpdCB3aWxsIGJlIHRyZWF0ZWQgYXMgdGhlIHNvbGUgdmFsdWUuXG4gKi9cblVSSS5wcm90b3R5cGUuc2V0UGFyYW1ldGVyVmFsdWVzID0gZnVuY3Rpb24gKGtleSwgdmFsdWVzKSB7XG4gIC8vIGJlIG5pY2UgYW5kIGF2b2lkIHN1YnRsZSBidWdzIHdoZXJlIFtdIG9wZXJhdG9yIG9uIHN0cmluZyBwZXJmb3JtcyBjaGFyQXRcbiAgLy8gb24gc29tZSBicm93c2VycyBhbmQgY3Jhc2hlcyBvbiBJRVxuICBpZiAodHlwZW9mIHZhbHVlcyA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZXMgPSBbIHZhbHVlcyBdO1xuICB9XG5cbiAgdGhpcy5jaGVja1BhcmFtZXRlckNhY2hlXygpO1xuICB2YXIgbmV3VmFsdWVJbmRleCA9IDA7XG4gIHZhciBwYyA9IHRoaXMucGFyYW1DYWNoZV87XG4gIHZhciBwYXJhbXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGsgPSAwOyBpIDwgcGMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBpZiAoa2V5ID09PSBwY1tpXSkge1xuICAgICAgaWYgKG5ld1ZhbHVlSW5kZXggPCB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgIHBhcmFtcy5wdXNoKGtleSwgdmFsdWVzW25ld1ZhbHVlSW5kZXgrK10pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbXMucHVzaChwY1tpXSwgcGNbaSArIDFdKTtcbiAgICB9XG4gIH1cbiAgd2hpbGUgKG5ld1ZhbHVlSW5kZXggPCB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgcGFyYW1zLnB1c2goa2V5LCB2YWx1ZXNbbmV3VmFsdWVJbmRleCsrXSk7XG4gIH1cbiAgdGhpcy5zZXRBbGxQYXJhbWV0ZXJzKHBhcmFtcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblVSSS5wcm90b3R5cGUucmVtb3ZlUGFyYW1ldGVyID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gdGhpcy5zZXRQYXJhbWV0ZXJWYWx1ZXMoa2V5LCBbXSk7XG59O1xuLyoqXG4gKiByZXR1cm5zIHRoZSBwYXJhbWV0ZXJzIHNwZWNpZmllZCBpbiB0aGUgcXVlcnkgcGFydCBvZiB0aGUgdXJpIGFzIGEgbGlzdCBvZlxuICoga2V5cyBhbmQgdmFsdWVzIGxpa2UgWyBrZXkwLCB2YWx1ZTAsIGtleTEsIHZhbHVlMSwgLi4uIF0uXG4gKlxuICogQHJldHVybiB7QXJyYXkuPHN0cmluZz59XG4gKi9cblVSSS5wcm90b3R5cGUuZ2V0QWxsUGFyYW1ldGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5jaGVja1BhcmFtZXRlckNhY2hlXygpO1xuICByZXR1cm4gdGhpcy5wYXJhbUNhY2hlXy5zbGljZSgwLCB0aGlzLnBhcmFtQ2FjaGVfLmxlbmd0aCk7XG59O1xuLyoqXG4gKiByZXR1cm5zIHRoZSB2YWx1ZTxiPnM8L2I+IGZvciBhIGdpdmVuIGNnaSBwYXJhbWV0ZXIgYXMgYSBsaXN0IG9mIGRlY29kZWRcbiAqIHF1ZXJ5IHBhcmFtZXRlciB2YWx1ZXMuXG4gKiBAcmV0dXJuIHtBcnJheS48c3RyaW5nPn1cbiAqL1xuVVJJLnByb3RvdHlwZS5nZXRQYXJhbWV0ZXJWYWx1ZXMgPSBmdW5jdGlvbiAocGFyYW1OYW1lVW5lc2NhcGVkKSB7XG4gIHRoaXMuY2hlY2tQYXJhbWV0ZXJDYWNoZV8oKTtcbiAgdmFyIHZhbHVlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFyYW1DYWNoZV8ubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBpZiAocGFyYW1OYW1lVW5lc2NhcGVkID09PSB0aGlzLnBhcmFtQ2FjaGVfW2ldKSB7XG4gICAgICB2YWx1ZXMucHVzaCh0aGlzLnBhcmFtQ2FjaGVfW2kgKyAxXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZXM7XG59O1xuLyoqXG4gKiByZXR1cm5zIGEgbWFwIG9mIGNnaSBwYXJhbWV0ZXIgbmFtZXMgdG8gKG5vbi1lbXB0eSkgbGlzdHMgb2YgdmFsdWVzLlxuICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsQXJyYXkuPHN0cmluZz4+fVxuICovXG5VUkkucHJvdG90eXBlLmdldFBhcmFtZXRlck1hcCA9IGZ1bmN0aW9uIChwYXJhbU5hbWVVbmVzY2FwZWQpIHtcbiAgdGhpcy5jaGVja1BhcmFtZXRlckNhY2hlXygpO1xuICB2YXIgcGFyYW1NYXAgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcmFtQ2FjaGVfLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgdmFyIGtleSA9IHRoaXMucGFyYW1DYWNoZV9baSsrXSxcbiAgICAgIHZhbHVlID0gdGhpcy5wYXJhbUNhY2hlX1tpKytdO1xuICAgIGlmICghKGtleSBpbiBwYXJhbU1hcCkpIHtcbiAgICAgIHBhcmFtTWFwW2tleV0gPSBbdmFsdWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbU1hcFtrZXldLnB1c2godmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFyYW1NYXA7XG59O1xuLyoqXG4gKiByZXR1cm5zIHRoZSBmaXJzdCB2YWx1ZSBmb3IgYSBnaXZlbiBjZ2kgcGFyYW1ldGVyIG9yIG51bGwgaWYgdGhlIGdpdmVuXG4gKiBwYXJhbWV0ZXIgbmFtZSBkb2VzIG5vdCBhcHBlYXIgaW4gdGhlIHF1ZXJ5IHN0cmluZy5cbiAqIElmIHRoZSBnaXZlbiBwYXJhbWV0ZXIgbmFtZSBkb2VzIGFwcGVhciwgYnV0IGhhcyBubyAnPHR0Pj08L3R0PicgZm9sbG93aW5nXG4gKiBpdCwgdGhlbiB0aGUgZW1wdHkgc3RyaW5nIHdpbGwgYmUgcmV0dXJuZWQuXG4gKiBAcmV0dXJuIHtzdHJpbmd8bnVsbH1cbiAqL1xuVVJJLnByb3RvdHlwZS5nZXRQYXJhbWV0ZXJWYWx1ZSA9IGZ1bmN0aW9uIChwYXJhbU5hbWVVbmVzY2FwZWQpIHtcbiAgdGhpcy5jaGVja1BhcmFtZXRlckNhY2hlXygpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFyYW1DYWNoZV8ubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBpZiAocGFyYW1OYW1lVW5lc2NhcGVkID09PSB0aGlzLnBhcmFtQ2FjaGVfW2ldKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJhbUNhY2hlX1tpICsgMV07XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuVVJJLnByb3RvdHlwZS5nZXRGcmFnbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZnJhZ21lbnRfICYmIGRlY29kZVVSSUNvbXBvbmVudCh0aGlzLmZyYWdtZW50Xyk7XG59O1xuVVJJLnByb3RvdHlwZS5nZXRSYXdGcmFnbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZnJhZ21lbnRfO1xufTtcblVSSS5wcm90b3R5cGUuc2V0RnJhZ21lbnQgPSBmdW5jdGlvbiAobmV3RnJhZ21lbnQpIHtcbiAgdGhpcy5mcmFnbWVudF8gPSBuZXdGcmFnbWVudCA/IGVuY29kZVVSSUNvbXBvbmVudChuZXdGcmFnbWVudCkgOiBudWxsO1xuICByZXR1cm4gdGhpcztcbn07XG5VUkkucHJvdG90eXBlLnNldFJhd0ZyYWdtZW50ID0gZnVuY3Rpb24gKG5ld0ZyYWdtZW50KSB7XG4gIHRoaXMuZnJhZ21lbnRfID0gbmV3RnJhZ21lbnQgPyBuZXdGcmFnbWVudCA6IG51bGw7XG4gIHJldHVybiB0aGlzO1xufTtcblVSSS5wcm90b3R5cGUuaGFzRnJhZ21lbnQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBudWxsICE9PSB0aGlzLmZyYWdtZW50Xztcbn07XG5cbmZ1bmN0aW9uIG51bGxJZkFic2VudChtYXRjaFBhcnQpIHtcbiAgcmV0dXJuICgnc3RyaW5nJyA9PSB0eXBlb2YgbWF0Y2hQYXJ0KSAmJiAobWF0Y2hQYXJ0Lmxlbmd0aCA+IDApXG4gICAgICAgICA/IG1hdGNoUGFydFxuICAgICAgICAgOiBudWxsO1xufVxuXG5cblxuXG4vKipcbiAqIGEgcmVndWxhciBleHByZXNzaW9uIGZvciBicmVha2luZyBhIFVSSSBpbnRvIGl0cyBjb21wb25lbnQgcGFydHMuXG4gKlxuICogPHA+aHR0cDovL3d3dy5nYml2LmNvbS9wcm90b2NvbHMvdXJpL3JmYy9yZmMzOTg2Lmh0bWwjUkZDMjIzNCBzYXlzXG4gKiBBcyB0aGUgXCJmaXJzdC1tYXRjaC13aW5zXCIgYWxnb3JpdGhtIGlzIGlkZW50aWNhbCB0byB0aGUgXCJncmVlZHlcIlxuICogZGlzYW1iaWd1YXRpb24gbWV0aG9kIHVzZWQgYnkgUE9TSVggcmVndWxhciBleHByZXNzaW9ucywgaXQgaXMgbmF0dXJhbCBhbmRcbiAqIGNvbW1vbnBsYWNlIHRvIHVzZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgcGFyc2luZyB0aGUgcG90ZW50aWFsIGZpdmVcbiAqIGNvbXBvbmVudHMgb2YgYSBVUkkgcmVmZXJlbmNlLlxuICpcbiAqIDxwPlRoZSBmb2xsb3dpbmcgbGluZSBpcyB0aGUgcmVndWxhciBleHByZXNzaW9uIGZvciBicmVha2luZy1kb3duIGFcbiAqIHdlbGwtZm9ybWVkIFVSSSByZWZlcmVuY2UgaW50byBpdHMgY29tcG9uZW50cy5cbiAqXG4gKiA8cHJlPlxuICogXigoW146Lz8jXSspOik/KC8vKFteLz8jXSopKT8oW14/I10qKShcXD8oW14jXSopKT8oIyguKikpP1xuICogIDEyICAgICAgICAgICAgMyAgNCAgICAgICAgICA1ICAgICAgIDYgIDcgICAgICAgIDggOVxuICogPC9wcmU+XG4gKlxuICogPHA+VGhlIG51bWJlcnMgaW4gdGhlIHNlY29uZCBsaW5lIGFib3ZlIGFyZSBvbmx5IHRvIGFzc2lzdCByZWFkYWJpbGl0eTsgdGhleVxuICogaW5kaWNhdGUgdGhlIHJlZmVyZW5jZSBwb2ludHMgZm9yIGVhY2ggc3ViZXhwcmVzc2lvbiAoaS5lLiwgZWFjaCBwYWlyZWRcbiAqIHBhcmVudGhlc2lzKS4gV2UgcmVmZXIgdG8gdGhlIHZhbHVlIG1hdGNoZWQgZm9yIHN1YmV4cHJlc3Npb24gPG4+IGFzICQ8bj4uXG4gKiBGb3IgZXhhbXBsZSwgbWF0Y2hpbmcgdGhlIGFib3ZlIGV4cHJlc3Npb24gdG9cbiAqIDxwcmU+XG4gKiAgICAgaHR0cDovL3d3dy5pY3MudWNpLmVkdS9wdWIvaWV0Zi91cmkvI1JlbGF0ZWRcbiAqIDwvcHJlPlxuICogcmVzdWx0cyBpbiB0aGUgZm9sbG93aW5nIHN1YmV4cHJlc3Npb24gbWF0Y2hlczpcbiAqIDxwcmU+XG4gKiAgICAkMSA9IGh0dHA6XG4gKiAgICAkMiA9IGh0dHBcbiAqICAgICQzID0gLy93d3cuaWNzLnVjaS5lZHVcbiAqICAgICQ0ID0gd3d3Lmljcy51Y2kuZWR1XG4gKiAgICAkNSA9IC9wdWIvaWV0Zi91cmkvXG4gKiAgICAkNiA9IDx1bmRlZmluZWQ+XG4gKiAgICAkNyA9IDx1bmRlZmluZWQ+XG4gKiAgICAkOCA9ICNSZWxhdGVkXG4gKiAgICAkOSA9IFJlbGF0ZWRcbiAqIDwvcHJlPlxuICogd2hlcmUgPHVuZGVmaW5lZD4gaW5kaWNhdGVzIHRoYXQgdGhlIGNvbXBvbmVudCBpcyBub3QgcHJlc2VudCwgYXMgaXMgdGhlXG4gKiBjYXNlIGZvciB0aGUgcXVlcnkgY29tcG9uZW50IGluIHRoZSBhYm92ZSBleGFtcGxlLiBUaGVyZWZvcmUsIHdlIGNhblxuICogZGV0ZXJtaW5lIHRoZSB2YWx1ZSBvZiB0aGUgZml2ZSBjb21wb25lbnRzIGFzXG4gKiA8cHJlPlxuICogICAgc2NoZW1lICAgID0gJDJcbiAqICAgIGF1dGhvcml0eSA9ICQ0XG4gKiAgICBwYXRoICAgICAgPSAkNVxuICogICAgcXVlcnkgICAgID0gJDdcbiAqICAgIGZyYWdtZW50ICA9ICQ5XG4gKiA8L3ByZT5cbiAqXG4gKiA8cD5tc2FtdWVsOiBJIGhhdmUgbW9kaWZpZWQgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBzbGlnaHRseSB0byBleHBvc2UgdGhlXG4gKiBjcmVkZW50aWFscywgZG9tYWluLCBhbmQgcG9ydCBzZXBhcmF0ZWx5IGZyb20gdGhlIGF1dGhvcml0eS5cbiAqIFRoZSBtb2RpZmllZCB2ZXJzaW9uIHlpZWxkc1xuICogPHByZT5cbiAqICAgICQxID0gaHR0cCAgICAgICAgICAgICAgc2NoZW1lXG4gKiAgICAkMiA9IDx1bmRlZmluZWQ+ICAgICAgIGNyZWRlbnRpYWxzIC1cXFxuICogICAgJDMgPSB3d3cuaWNzLnVjaS5lZHUgICBkb21haW4gICAgICAgfCBhdXRob3JpdHlcbiAqICAgICQ0ID0gPHVuZGVmaW5lZD4gICAgICAgcG9ydCAgICAgICAgLS9cbiAqICAgICQ1ID0gL3B1Yi9pZXRmL3VyaS8gICAgcGF0aFxuICogICAgJDYgPSA8dW5kZWZpbmVkPiAgICAgICBxdWVyeSB3aXRob3V0ID9cbiAqICAgICQ3ID0gUmVsYXRlZCAgICAgICAgICAgZnJhZ21lbnQgd2l0aG91dCAjXG4gKiA8L3ByZT5cbiAqL1xudmFyIFVSSV9SRV8gPSBuZXcgUmVnRXhwKFxuICAgICAgXCJeXCIgK1xuICAgICAgXCIoPzpcIiArXG4gICAgICAgIFwiKFteOi8/I10rKVwiICsgICAgICAgICAvLyBzY2hlbWVcbiAgICAgIFwiOik/XCIgK1xuICAgICAgXCIoPzovL1wiICtcbiAgICAgICAgXCIoPzooW14vPyNdKilAKT9cIiArICAgIC8vIGNyZWRlbnRpYWxzXG4gICAgICAgIFwiKFteLz8jOkBdKilcIiArICAgICAgICAvLyBkb21haW5cbiAgICAgICAgXCIoPzo6KFswLTldKykpP1wiICsgICAgIC8vIHBvcnRcbiAgICAgIFwiKT9cIiArXG4gICAgICBcIihbXj8jXSspP1wiICsgICAgICAgICAgICAvLyBwYXRoXG4gICAgICBcIig/OlxcXFw/KFteI10qKSk/XCIgKyAgICAgIC8vIHF1ZXJ5XG4gICAgICBcIig/OiMoLiopKT9cIiArICAgICAgICAgICAvLyBmcmFnbWVudFxuICAgICAgXCIkXCJcbiAgICAgICk7XG5cbnZhciBVUklfRElTQUxMT1dFRF9JTl9TQ0hFTUVfT1JfQ1JFREVOVElBTFNfID0gL1sjXFwvXFw/QF0vZztcbnZhciBVUklfRElTQUxMT1dFRF9JTl9QQVRIXyA9IC9bXFwjXFw/XS9nO1xuXG5VUkkucGFyc2UgPSBwYXJzZTtcblVSSS5jcmVhdGUgPSBjcmVhdGU7XG5VUkkucmVzb2x2ZSA9IHJlc29sdmU7XG5VUkkuY29sbGFwc2VfZG90cyA9IGNvbGxhcHNlX2RvdHM7ICAvLyBWaXNpYmxlIGZvciB0ZXN0aW5nLlxuXG4vLyBsaWdodHdlaWdodCBzdHJpbmctYmFzZWQgYXBpIGZvciBsb2FkTW9kdWxlTWFrZXJcblVSSS51dGlscyA9IHtcbiAgbWltZVR5cGVPZjogZnVuY3Rpb24gKHVyaSkge1xuICAgIHZhciB1cmlPYmogPSBwYXJzZSh1cmkpO1xuICAgIGlmICgvXFwuaHRtbCQvLnRlc3QodXJpT2JqLmdldFBhdGgoKSkpIHtcbiAgICAgIHJldHVybiAndGV4dC9odG1sJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0JztcbiAgICB9XG4gIH0sXG4gIHJlc29sdmU6IGZ1bmN0aW9uIChiYXNlLCB1cmkpIHtcbiAgICBpZiAoYmFzZSkge1xuICAgICAgcmV0dXJuIHJlc29sdmUocGFyc2UoYmFzZSksIHBhcnNlKHVyaSkpLnRvU3RyaW5nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJyArIHVyaTtcbiAgICB9XG4gIH1cbn07XG5cblxucmV0dXJuIFVSSTtcbn0pKCk7XG5cbi8vIENvcHlyaWdodCBHb29nbGUgSW5jLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbmNlIFZlcnNpb24gMi4wXG4vLyBBdXRvZ2VuZXJhdGVkIGF0IE1vbiBGZWIgMjUgMTM6MDU6NDIgRVNUIDIwMTNcbi8vIEBvdmVycmlkZXMgd2luZG93XG4vLyBAcHJvdmlkZXMgaHRtbDRcbnZhciBodG1sNCA9IHt9O1xuaHRtbDQuYXR5cGUgPSB7XG4gICdOT05FJzogMCxcbiAgJ1VSSSc6IDEsXG4gICdVUklfRlJBR01FTlQnOiAxMSxcbiAgJ1NDUklQVCc6IDIsXG4gICdTVFlMRSc6IDMsXG4gICdIVE1MJzogMTIsXG4gICdJRCc6IDQsXG4gICdJRFJFRic6IDUsXG4gICdJRFJFRlMnOiA2LFxuICAnR0xPQkFMX05BTUUnOiA3LFxuICAnTE9DQUxfTkFNRSc6IDgsXG4gICdDTEFTU0VTJzogOSxcbiAgJ0ZSQU1FX1RBUkdFVCc6IDEwLFxuICAnTUVESUFfUVVFUlknOiAxM1xufTtcbmh0bWw0WyAnYXR5cGUnIF0gPSBodG1sNC5hdHlwZTtcbmh0bWw0LkFUVFJJQlMgPSB7XG4gICcqOjpjbGFzcyc6IDksXG4gICcqOjpkaXInOiAwLFxuICAnKjo6ZHJhZ2dhYmxlJzogMCxcbiAgJyo6OmhpZGRlbic6IDAsXG4gICcqOjppZCc6IDQsXG4gICcqOjppbmVydCc6IDAsXG4gICcqOjppdGVtcHJvcCc6IDAsXG4gICcqOjppdGVtcmVmJzogNixcbiAgJyo6Oml0ZW1zY29wZSc6IDAsXG4gICcqOjpsYW5nJzogMCxcbiAgJyo6Om9uYmx1cic6IDIsXG4gICcqOjpvbmNoYW5nZSc6IDIsXG4gICcqOjpvbmNsaWNrJzogMixcbiAgJyo6Om9uZGJsY2xpY2snOiAyLFxuICAnKjo6b25mb2N1cyc6IDIsXG4gICcqOjpvbmtleWRvd24nOiAyLFxuICAnKjo6b25rZXlwcmVzcyc6IDIsXG4gICcqOjpvbmtleXVwJzogMixcbiAgJyo6Om9ubG9hZCc6IDIsXG4gICcqOjpvbm1vdXNlZG93bic6IDIsXG4gICcqOjpvbm1vdXNlbW92ZSc6IDIsXG4gICcqOjpvbm1vdXNlb3V0JzogMixcbiAgJyo6Om9ubW91c2VvdmVyJzogMixcbiAgJyo6Om9ubW91c2V1cCc6IDIsXG4gICcqOjpvbnJlc2V0JzogMixcbiAgJyo6Om9uc2Nyb2xsJzogMixcbiAgJyo6Om9uc2VsZWN0JzogMixcbiAgJyo6Om9uc3VibWl0JzogMixcbiAgJyo6Om9udW5sb2FkJzogMixcbiAgJyo6OnNwZWxsY2hlY2snOiAwLFxuICAnKjo6c3R5bGUnOiAzLFxuICAnKjo6dGl0bGUnOiAwLFxuICAnKjo6dHJhbnNsYXRlJzogMCxcbiAgJ2E6OmFjY2Vzc2tleSc6IDAsXG4gICdhOjpjb29yZHMnOiAwLFxuICAnYTo6aHJlZic6IDEsXG4gICdhOjpocmVmbGFuZyc6IDAsXG4gICdhOjpuYW1lJzogNyxcbiAgJ2E6Om9uYmx1cic6IDIsXG4gICdhOjpvbmZvY3VzJzogMixcbiAgJ2E6OnNoYXBlJzogMCxcbiAgJ2E6OnRhYmluZGV4JzogMCxcbiAgJ2E6OnRhcmdldCc6IDEwLFxuICAnYTo6dHlwZSc6IDAsXG4gICdhcmVhOjphY2Nlc3NrZXknOiAwLFxuICAnYXJlYTo6YWx0JzogMCxcbiAgJ2FyZWE6OmNvb3Jkcyc6IDAsXG4gICdhcmVhOjpocmVmJzogMSxcbiAgJ2FyZWE6Om5vaHJlZic6IDAsXG4gICdhcmVhOjpvbmJsdXInOiAyLFxuICAnYXJlYTo6b25mb2N1cyc6IDIsXG4gICdhcmVhOjpzaGFwZSc6IDAsXG4gICdhcmVhOjp0YWJpbmRleCc6IDAsXG4gICdhcmVhOjp0YXJnZXQnOiAxMCxcbiAgJ2F1ZGlvOjpjb250cm9scyc6IDAsXG4gICdhdWRpbzo6bG9vcCc6IDAsXG4gICdhdWRpbzo6bWVkaWFncm91cCc6IDUsXG4gICdhdWRpbzo6bXV0ZWQnOiAwLFxuICAnYXVkaW86OnByZWxvYWQnOiAwLFxuICAnYmRvOjpkaXInOiAwLFxuICAnYmxvY2txdW90ZTo6Y2l0ZSc6IDEsXG4gICdicjo6Y2xlYXInOiAwLFxuICAnYnV0dG9uOjphY2Nlc3NrZXknOiAwLFxuICAnYnV0dG9uOjpkaXNhYmxlZCc6IDAsXG4gICdidXR0b246Om5hbWUnOiA4LFxuICAnYnV0dG9uOjpvbmJsdXInOiAyLFxuICAnYnV0dG9uOjpvbmZvY3VzJzogMixcbiAgJ2J1dHRvbjo6dGFiaW5kZXgnOiAwLFxuICAnYnV0dG9uOjp0eXBlJzogMCxcbiAgJ2J1dHRvbjo6dmFsdWUnOiAwLFxuICAnY2FudmFzOjpoZWlnaHQnOiAwLFxuICAnY2FudmFzOjp3aWR0aCc6IDAsXG4gICdjYXB0aW9uOjphbGlnbic6IDAsXG4gICdjb2w6OmFsaWduJzogMCxcbiAgJ2NvbDo6Y2hhcic6IDAsXG4gICdjb2w6OmNoYXJvZmYnOiAwLFxuICAnY29sOjpzcGFuJzogMCxcbiAgJ2NvbDo6dmFsaWduJzogMCxcbiAgJ2NvbDo6d2lkdGgnOiAwLFxuICAnY29sZ3JvdXA6OmFsaWduJzogMCxcbiAgJ2NvbGdyb3VwOjpjaGFyJzogMCxcbiAgJ2NvbGdyb3VwOjpjaGFyb2ZmJzogMCxcbiAgJ2NvbGdyb3VwOjpzcGFuJzogMCxcbiAgJ2NvbGdyb3VwOjp2YWxpZ24nOiAwLFxuICAnY29sZ3JvdXA6OndpZHRoJzogMCxcbiAgJ2NvbW1hbmQ6OmNoZWNrZWQnOiAwLFxuICAnY29tbWFuZDo6Y29tbWFuZCc6IDUsXG4gICdjb21tYW5kOjpkaXNhYmxlZCc6IDAsXG4gICdjb21tYW5kOjppY29uJzogMSxcbiAgJ2NvbW1hbmQ6OmxhYmVsJzogMCxcbiAgJ2NvbW1hbmQ6OnJhZGlvZ3JvdXAnOiAwLFxuICAnY29tbWFuZDo6dHlwZSc6IDAsXG4gICdkYXRhOjp2YWx1ZSc6IDAsXG4gICdkZWw6OmNpdGUnOiAxLFxuICAnZGVsOjpkYXRldGltZSc6IDAsXG4gICdkZXRhaWxzOjpvcGVuJzogMCxcbiAgJ2Rpcjo6Y29tcGFjdCc6IDAsXG4gICdkaXY6OmFsaWduJzogMCxcbiAgJ2RsOjpjb21wYWN0JzogMCxcbiAgJ2ZpZWxkc2V0OjpkaXNhYmxlZCc6IDAsXG4gICdmb250Ojpjb2xvcic6IDAsXG4gICdmb250OjpmYWNlJzogMCxcbiAgJ2ZvbnQ6OnNpemUnOiAwLFxuICAnZm9ybTo6YWNjZXB0JzogMCxcbiAgJ2Zvcm06OmFjdGlvbic6IDEsXG4gICdmb3JtOjphdXRvY29tcGxldGUnOiAwLFxuICAnZm9ybTo6ZW5jdHlwZSc6IDAsXG4gICdmb3JtOjptZXRob2QnOiAwLFxuICAnZm9ybTo6bmFtZSc6IDcsXG4gICdmb3JtOjpub3ZhbGlkYXRlJzogMCxcbiAgJ2Zvcm06Om9ucmVzZXQnOiAyLFxuICAnZm9ybTo6b25zdWJtaXQnOiAyLFxuICAnZm9ybTo6dGFyZ2V0JzogMTAsXG4gICdoMTo6YWxpZ24nOiAwLFxuICAnaDI6OmFsaWduJzogMCxcbiAgJ2gzOjphbGlnbic6IDAsXG4gICdoNDo6YWxpZ24nOiAwLFxuICAnaDU6OmFsaWduJzogMCxcbiAgJ2g2OjphbGlnbic6IDAsXG4gICdocjo6YWxpZ24nOiAwLFxuICAnaHI6Om5vc2hhZGUnOiAwLFxuICAnaHI6OnNpemUnOiAwLFxuICAnaHI6OndpZHRoJzogMCxcbiAgJ2lmcmFtZTo6YWxpZ24nOiAwLFxuICAnaWZyYW1lOjpmcmFtZWJvcmRlcic6IDAsXG4gICdpZnJhbWU6OmhlaWdodCc6IDAsXG4gICdpZnJhbWU6Om1hcmdpbmhlaWdodCc6IDAsXG4gICdpZnJhbWU6Om1hcmdpbndpZHRoJzogMCxcbiAgJ2lmcmFtZTo6d2lkdGgnOiAwLFxuICAnaW1nOjphbGlnbic6IDAsXG4gICdpbWc6OmFsdCc6IDAsXG4gICdpbWc6OmJvcmRlcic6IDAsXG4gICdpbWc6OmhlaWdodCc6IDAsXG4gICdpbWc6OmhzcGFjZSc6IDAsXG4gICdpbWc6OmlzbWFwJzogMCxcbiAgJ2ltZzo6bmFtZSc6IDcsXG4gICdpbWc6OnNyYyc6IDEsXG4gICdpbWc6OnVzZW1hcCc6IDExLFxuICAnaW1nOjp2c3BhY2UnOiAwLFxuICAnaW1nOjp3aWR0aCc6IDAsXG4gICdpbnB1dDo6YWNjZXB0JzogMCxcbiAgJ2lucHV0OjphY2Nlc3NrZXknOiAwLFxuICAnaW5wdXQ6OmFsaWduJzogMCxcbiAgJ2lucHV0OjphbHQnOiAwLFxuICAnaW5wdXQ6OmF1dG9jb21wbGV0ZSc6IDAsXG4gICdpbnB1dDo6Y2hlY2tlZCc6IDAsXG4gICdpbnB1dDo6ZGlzYWJsZWQnOiAwLFxuICAnaW5wdXQ6OmlucHV0bW9kZSc6IDAsXG4gICdpbnB1dDo6aXNtYXAnOiAwLFxuICAnaW5wdXQ6Omxpc3QnOiA1LFxuICAnaW5wdXQ6Om1heCc6IDAsXG4gICdpbnB1dDo6bWF4bGVuZ3RoJzogMCxcbiAgJ2lucHV0OjptaW4nOiAwLFxuICAnaW5wdXQ6Om11bHRpcGxlJzogMCxcbiAgJ2lucHV0OjpuYW1lJzogOCxcbiAgJ2lucHV0OjpvbmJsdXInOiAyLFxuICAnaW5wdXQ6Om9uY2hhbmdlJzogMixcbiAgJ2lucHV0OjpvbmZvY3VzJzogMixcbiAgJ2lucHV0OjpvbnNlbGVjdCc6IDIsXG4gICdpbnB1dDo6cGxhY2Vob2xkZXInOiAwLFxuICAnaW5wdXQ6OnJlYWRvbmx5JzogMCxcbiAgJ2lucHV0OjpyZXF1aXJlZCc6IDAsXG4gICdpbnB1dDo6c2l6ZSc6IDAsXG4gICdpbnB1dDo6c3JjJzogMSxcbiAgJ2lucHV0OjpzdGVwJzogMCxcbiAgJ2lucHV0Ojp0YWJpbmRleCc6IDAsXG4gICdpbnB1dDo6dHlwZSc6IDAsXG4gICdpbnB1dDo6dXNlbWFwJzogMTEsXG4gICdpbnB1dDo6dmFsdWUnOiAwLFxuICAnaW5zOjpjaXRlJzogMSxcbiAgJ2luczo6ZGF0ZXRpbWUnOiAwLFxuICAnbGFiZWw6OmFjY2Vzc2tleSc6IDAsXG4gICdsYWJlbDo6Zm9yJzogNSxcbiAgJ2xhYmVsOjpvbmJsdXInOiAyLFxuICAnbGFiZWw6Om9uZm9jdXMnOiAyLFxuICAnbGVnZW5kOjphY2Nlc3NrZXknOiAwLFxuICAnbGVnZW5kOjphbGlnbic6IDAsXG4gICdsaTo6dHlwZSc6IDAsXG4gICdsaTo6dmFsdWUnOiAwLFxuICAnbWFwOjpuYW1lJzogNyxcbiAgJ21lbnU6OmNvbXBhY3QnOiAwLFxuICAnbWVudTo6bGFiZWwnOiAwLFxuICAnbWVudTo6dHlwZSc6IDAsXG4gICdtZXRlcjo6aGlnaCc6IDAsXG4gICdtZXRlcjo6bG93JzogMCxcbiAgJ21ldGVyOjptYXgnOiAwLFxuICAnbWV0ZXI6Om1pbic6IDAsXG4gICdtZXRlcjo6dmFsdWUnOiAwLFxuICAnb2w6OmNvbXBhY3QnOiAwLFxuICAnb2w6OnJldmVyc2VkJzogMCxcbiAgJ29sOjpzdGFydCc6IDAsXG4gICdvbDo6dHlwZSc6IDAsXG4gICdvcHRncm91cDo6ZGlzYWJsZWQnOiAwLFxuICAnb3B0Z3JvdXA6OmxhYmVsJzogMCxcbiAgJ29wdGlvbjo6ZGlzYWJsZWQnOiAwLFxuICAnb3B0aW9uOjpsYWJlbCc6IDAsXG4gICdvcHRpb246OnNlbGVjdGVkJzogMCxcbiAgJ29wdGlvbjo6dmFsdWUnOiAwLFxuICAnb3V0cHV0Ojpmb3InOiA2LFxuICAnb3V0cHV0OjpuYW1lJzogOCxcbiAgJ3A6OmFsaWduJzogMCxcbiAgJ3ByZTo6d2lkdGgnOiAwLFxuICAncHJvZ3Jlc3M6Om1heCc6IDAsXG4gICdwcm9ncmVzczo6bWluJzogMCxcbiAgJ3Byb2dyZXNzOjp2YWx1ZSc6IDAsXG4gICdxOjpjaXRlJzogMSxcbiAgJ3NlbGVjdDo6YXV0b2NvbXBsZXRlJzogMCxcbiAgJ3NlbGVjdDo6ZGlzYWJsZWQnOiAwLFxuICAnc2VsZWN0OjptdWx0aXBsZSc6IDAsXG4gICdzZWxlY3Q6Om5hbWUnOiA4LFxuICAnc2VsZWN0OjpvbmJsdXInOiAyLFxuICAnc2VsZWN0OjpvbmNoYW5nZSc6IDIsXG4gICdzZWxlY3Q6Om9uZm9jdXMnOiAyLFxuICAnc2VsZWN0OjpyZXF1aXJlZCc6IDAsXG4gICdzZWxlY3Q6OnNpemUnOiAwLFxuICAnc2VsZWN0Ojp0YWJpbmRleCc6IDAsXG4gICdzb3VyY2U6OnR5cGUnOiAwLFxuICAndGFibGU6OmFsaWduJzogMCxcbiAgJ3RhYmxlOjpiZ2NvbG9yJzogMCxcbiAgJ3RhYmxlOjpib3JkZXInOiAwLFxuICAndGFibGU6OmNlbGxwYWRkaW5nJzogMCxcbiAgJ3RhYmxlOjpjZWxsc3BhY2luZyc6IDAsXG4gICd0YWJsZTo6ZnJhbWUnOiAwLFxuICAndGFibGU6OnJ1bGVzJzogMCxcbiAgJ3RhYmxlOjpzdW1tYXJ5JzogMCxcbiAgJ3RhYmxlOjp3aWR0aCc6IDAsXG4gICd0Ym9keTo6YWxpZ24nOiAwLFxuICAndGJvZHk6OmNoYXInOiAwLFxuICAndGJvZHk6OmNoYXJvZmYnOiAwLFxuICAndGJvZHk6OnZhbGlnbic6IDAsXG4gICd0ZDo6YWJicic6IDAsXG4gICd0ZDo6YWxpZ24nOiAwLFxuICAndGQ6OmF4aXMnOiAwLFxuICAndGQ6OmJnY29sb3InOiAwLFxuICAndGQ6OmNoYXInOiAwLFxuICAndGQ6OmNoYXJvZmYnOiAwLFxuICAndGQ6OmNvbHNwYW4nOiAwLFxuICAndGQ6OmhlYWRlcnMnOiA2LFxuICAndGQ6OmhlaWdodCc6IDAsXG4gICd0ZDo6bm93cmFwJzogMCxcbiAgJ3RkOjpyb3dzcGFuJzogMCxcbiAgJ3RkOjpzY29wZSc6IDAsXG4gICd0ZDo6dmFsaWduJzogMCxcbiAgJ3RkOjp3aWR0aCc6IDAsXG4gICd0ZXh0YXJlYTo6YWNjZXNza2V5JzogMCxcbiAgJ3RleHRhcmVhOjphdXRvY29tcGxldGUnOiAwLFxuICAndGV4dGFyZWE6OmNvbHMnOiAwLFxuICAndGV4dGFyZWE6OmRpc2FibGVkJzogMCxcbiAgJ3RleHRhcmVhOjppbnB1dG1vZGUnOiAwLFxuICAndGV4dGFyZWE6Om5hbWUnOiA4LFxuICAndGV4dGFyZWE6Om9uYmx1cic6IDIsXG4gICd0ZXh0YXJlYTo6b25jaGFuZ2UnOiAyLFxuICAndGV4dGFyZWE6Om9uZm9jdXMnOiAyLFxuICAndGV4dGFyZWE6Om9uc2VsZWN0JzogMixcbiAgJ3RleHRhcmVhOjpwbGFjZWhvbGRlcic6IDAsXG4gICd0ZXh0YXJlYTo6cmVhZG9ubHknOiAwLFxuICAndGV4dGFyZWE6OnJlcXVpcmVkJzogMCxcbiAgJ3RleHRhcmVhOjpyb3dzJzogMCxcbiAgJ3RleHRhcmVhOjp0YWJpbmRleCc6IDAsXG4gICd0ZXh0YXJlYTo6d3JhcCc6IDAsXG4gICd0Zm9vdDo6YWxpZ24nOiAwLFxuICAndGZvb3Q6OmNoYXInOiAwLFxuICAndGZvb3Q6OmNoYXJvZmYnOiAwLFxuICAndGZvb3Q6OnZhbGlnbic6IDAsXG4gICd0aDo6YWJicic6IDAsXG4gICd0aDo6YWxpZ24nOiAwLFxuICAndGg6OmF4aXMnOiAwLFxuICAndGg6OmJnY29sb3InOiAwLFxuICAndGg6OmNoYXInOiAwLFxuICAndGg6OmNoYXJvZmYnOiAwLFxuICAndGg6OmNvbHNwYW4nOiAwLFxuICAndGg6OmhlYWRlcnMnOiA2LFxuICAndGg6OmhlaWdodCc6IDAsXG4gICd0aDo6bm93cmFwJzogMCxcbiAgJ3RoOjpyb3dzcGFuJzogMCxcbiAgJ3RoOjpzY29wZSc6IDAsXG4gICd0aDo6dmFsaWduJzogMCxcbiAgJ3RoOjp3aWR0aCc6IDAsXG4gICd0aGVhZDo6YWxpZ24nOiAwLFxuICAndGhlYWQ6OmNoYXInOiAwLFxuICAndGhlYWQ6OmNoYXJvZmYnOiAwLFxuICAndGhlYWQ6OnZhbGlnbic6IDAsXG4gICd0cjo6YWxpZ24nOiAwLFxuICAndHI6OmJnY29sb3InOiAwLFxuICAndHI6OmNoYXInOiAwLFxuICAndHI6OmNoYXJvZmYnOiAwLFxuICAndHI6OnZhbGlnbic6IDAsXG4gICd0cmFjazo6ZGVmYXVsdCc6IDAsXG4gICd0cmFjazo6a2luZCc6IDAsXG4gICd0cmFjazo6bGFiZWwnOiAwLFxuICAndHJhY2s6OnNyY2xhbmcnOiAwLFxuICAndWw6OmNvbXBhY3QnOiAwLFxuICAndWw6OnR5cGUnOiAwLFxuICAndmlkZW86OmNvbnRyb2xzJzogMCxcbiAgJ3ZpZGVvOjpoZWlnaHQnOiAwLFxuICAndmlkZW86Omxvb3AnOiAwLFxuICAndmlkZW86Om1lZGlhZ3JvdXAnOiA1LFxuICAndmlkZW86Om11dGVkJzogMCxcbiAgJ3ZpZGVvOjpwb3N0ZXInOiAxLFxuICAndmlkZW86OnByZWxvYWQnOiAwLFxuICAndmlkZW86OndpZHRoJzogMFxufTtcbmh0bWw0WyAnQVRUUklCUycgXSA9IGh0bWw0LkFUVFJJQlM7XG5odG1sNC5lZmxhZ3MgPSB7XG4gICdPUFRJT05BTF9FTkRUQUcnOiAxLFxuICAnRU1QVFknOiAyLFxuICAnQ0RBVEEnOiA0LFxuICAnUkNEQVRBJzogOCxcbiAgJ1VOU0FGRSc6IDE2LFxuICAnRk9MREFCTEUnOiAzMixcbiAgJ1NDUklQVCc6IDY0LFxuICAnU1RZTEUnOiAxMjgsXG4gICdWSVJUVUFMSVpFRCc6IDI1NlxufTtcbmh0bWw0WyAnZWZsYWdzJyBdID0gaHRtbDQuZWZsYWdzO1xuaHRtbDQuRUxFTUVOVFMgPSB7XG4gICdhJzogMCxcbiAgJ2FiYnInOiAwLFxuICAnYWNyb255bSc6IDAsXG4gICdhZGRyZXNzJzogMCxcbiAgJ2FwcGxldCc6IDI3MixcbiAgJ2FyZWEnOiAyLFxuICAnYXJ0aWNsZSc6IDAsXG4gICdhc2lkZSc6IDAsXG4gICdhdWRpbyc6IDAsXG4gICdiJzogMCxcbiAgJ2Jhc2UnOiAyNzQsXG4gICdiYXNlZm9udCc6IDI3NCxcbiAgJ2JkaSc6IDAsXG4gICdiZG8nOiAwLFxuICAnYmlnJzogMCxcbiAgJ2Jsb2NrcXVvdGUnOiAwLFxuICAnYm9keSc6IDMwNSxcbiAgJ2JyJzogMixcbiAgJ2J1dHRvbic6IDAsXG4gICdjYW52YXMnOiAwLFxuICAnY2FwdGlvbic6IDAsXG4gICdjZW50ZXInOiAwLFxuICAnY2l0ZSc6IDAsXG4gICdjb2RlJzogMCxcbiAgJ2NvbCc6IDIsXG4gICdjb2xncm91cCc6IDEsXG4gICdjb21tYW5kJzogMixcbiAgJ2RhdGEnOiAwLFxuICAnZGF0YWxpc3QnOiAwLFxuICAnZGQnOiAxLFxuICAnZGVsJzogMCxcbiAgJ2RldGFpbHMnOiAwLFxuICAnZGZuJzogMCxcbiAgJ2RpYWxvZyc6IDI3MixcbiAgJ2Rpcic6IDAsXG4gICdkaXYnOiAwLFxuICAnZGwnOiAwLFxuICAnZHQnOiAxLFxuICAnZW0nOiAwLFxuICAnZmllbGRzZXQnOiAwLFxuICAnZmlnY2FwdGlvbic6IDAsXG4gICdmaWd1cmUnOiAwLFxuICAnZm9udCc6IDAsXG4gICdmb290ZXInOiAwLFxuICAnZm9ybSc6IDAsXG4gICdmcmFtZSc6IDI3NCxcbiAgJ2ZyYW1lc2V0JzogMjcyLFxuICAnaDEnOiAwLFxuICAnaDInOiAwLFxuICAnaDMnOiAwLFxuICAnaDQnOiAwLFxuICAnaDUnOiAwLFxuICAnaDYnOiAwLFxuICAnaGVhZCc6IDMwNSxcbiAgJ2hlYWRlcic6IDAsXG4gICdoZ3JvdXAnOiAwLFxuICAnaHInOiAyLFxuICAnaHRtbCc6IDMwNSxcbiAgJ2knOiAwLFxuICAnaWZyYW1lJzogNCxcbiAgJ2ltZyc6IDIsXG4gICdpbnB1dCc6IDIsXG4gICdpbnMnOiAwLFxuICAnaXNpbmRleCc6IDI3NCxcbiAgJ2tiZCc6IDAsXG4gICdrZXlnZW4nOiAyNzQsXG4gICdsYWJlbCc6IDAsXG4gICdsZWdlbmQnOiAwLFxuICAnbGknOiAxLFxuICAnbGluayc6IDI3NCxcbiAgJ21hcCc6IDAsXG4gICdtYXJrJzogMCxcbiAgJ21lbnUnOiAwLFxuICAnbWV0YSc6IDI3NCxcbiAgJ21ldGVyJzogMCxcbiAgJ25hdic6IDAsXG4gICdub2JyJzogMCxcbiAgJ25vZW1iZWQnOiAyNzYsXG4gICdub2ZyYW1lcyc6IDI3NixcbiAgJ25vc2NyaXB0JzogMjc2LFxuICAnb2JqZWN0JzogMjcyLFxuICAnb2wnOiAwLFxuICAnb3B0Z3JvdXAnOiAwLFxuICAnb3B0aW9uJzogMSxcbiAgJ291dHB1dCc6IDAsXG4gICdwJzogMSxcbiAgJ3BhcmFtJzogMjc0LFxuICAncHJlJzogMCxcbiAgJ3Byb2dyZXNzJzogMCxcbiAgJ3EnOiAwLFxuICAncyc6IDAsXG4gICdzYW1wJzogMCxcbiAgJ3NjcmlwdCc6IDg0LFxuICAnc2VjdGlvbic6IDAsXG4gICdzZWxlY3QnOiAwLFxuICAnc21hbGwnOiAwLFxuICAnc291cmNlJzogMixcbiAgJ3NwYW4nOiAwLFxuICAnc3RyaWtlJzogMCxcbiAgJ3N0cm9uZyc6IDAsXG4gICdzdHlsZSc6IDE0OCxcbiAgJ3N1Yic6IDAsXG4gICdzdW1tYXJ5JzogMCxcbiAgJ3N1cCc6IDAsXG4gICd0YWJsZSc6IDAsXG4gICd0Ym9keSc6IDEsXG4gICd0ZCc6IDEsXG4gICd0ZXh0YXJlYSc6IDgsXG4gICd0Zm9vdCc6IDEsXG4gICd0aCc6IDEsXG4gICd0aGVhZCc6IDEsXG4gICd0aW1lJzogMCxcbiAgJ3RpdGxlJzogMjgwLFxuICAndHInOiAxLFxuICAndHJhY2snOiAyLFxuICAndHQnOiAwLFxuICAndSc6IDAsXG4gICd1bCc6IDAsXG4gICd2YXInOiAwLFxuICAndmlkZW8nOiAwLFxuICAnd2JyJzogMlxufTtcbmh0bWw0WyAnRUxFTUVOVFMnIF0gPSBodG1sNC5FTEVNRU5UUztcbmh0bWw0LkVMRU1FTlRfRE9NX0lOVEVSRkFDRVMgPSB7XG4gICdhJzogJ0hUTUxBbmNob3JFbGVtZW50JyxcbiAgJ2FiYnInOiAnSFRNTEVsZW1lbnQnLFxuICAnYWNyb255bSc6ICdIVE1MRWxlbWVudCcsXG4gICdhZGRyZXNzJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2FwcGxldCc6ICdIVE1MQXBwbGV0RWxlbWVudCcsXG4gICdhcmVhJzogJ0hUTUxBcmVhRWxlbWVudCcsXG4gICdhcnRpY2xlJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2FzaWRlJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2F1ZGlvJzogJ0hUTUxBdWRpb0VsZW1lbnQnLFxuICAnYic6ICdIVE1MRWxlbWVudCcsXG4gICdiYXNlJzogJ0hUTUxCYXNlRWxlbWVudCcsXG4gICdiYXNlZm9udCc6ICdIVE1MQmFzZUZvbnRFbGVtZW50JyxcbiAgJ2JkaSc6ICdIVE1MRWxlbWVudCcsXG4gICdiZG8nOiAnSFRNTEVsZW1lbnQnLFxuICAnYmlnJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2Jsb2NrcXVvdGUnOiAnSFRNTFF1b3RlRWxlbWVudCcsXG4gICdib2R5JzogJ0hUTUxCb2R5RWxlbWVudCcsXG4gICdicic6ICdIVE1MQlJFbGVtZW50JyxcbiAgJ2J1dHRvbic6ICdIVE1MQnV0dG9uRWxlbWVudCcsXG4gICdjYW52YXMnOiAnSFRNTENhbnZhc0VsZW1lbnQnLFxuICAnY2FwdGlvbic6ICdIVE1MVGFibGVDYXB0aW9uRWxlbWVudCcsXG4gICdjZW50ZXInOiAnSFRNTEVsZW1lbnQnLFxuICAnY2l0ZSc6ICdIVE1MRWxlbWVudCcsXG4gICdjb2RlJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2NvbCc6ICdIVE1MVGFibGVDb2xFbGVtZW50JyxcbiAgJ2NvbGdyb3VwJzogJ0hUTUxUYWJsZUNvbEVsZW1lbnQnLFxuICAnY29tbWFuZCc6ICdIVE1MQ29tbWFuZEVsZW1lbnQnLFxuICAnZGF0YSc6ICdIVE1MRWxlbWVudCcsXG4gICdkYXRhbGlzdCc6ICdIVE1MRGF0YUxpc3RFbGVtZW50JyxcbiAgJ2RkJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2RlbCc6ICdIVE1MTW9kRWxlbWVudCcsXG4gICdkZXRhaWxzJzogJ0hUTUxEZXRhaWxzRWxlbWVudCcsXG4gICdkZm4nOiAnSFRNTEVsZW1lbnQnLFxuICAnZGlhbG9nJzogJ0hUTUxEaWFsb2dFbGVtZW50JyxcbiAgJ2Rpcic6ICdIVE1MRGlyZWN0b3J5RWxlbWVudCcsXG4gICdkaXYnOiAnSFRNTERpdkVsZW1lbnQnLFxuICAnZGwnOiAnSFRNTERMaXN0RWxlbWVudCcsXG4gICdkdCc6ICdIVE1MRWxlbWVudCcsXG4gICdlbSc6ICdIVE1MRWxlbWVudCcsXG4gICdmaWVsZHNldCc6ICdIVE1MRmllbGRTZXRFbGVtZW50JyxcbiAgJ2ZpZ2NhcHRpb24nOiAnSFRNTEVsZW1lbnQnLFxuICAnZmlndXJlJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2ZvbnQnOiAnSFRNTEZvbnRFbGVtZW50JyxcbiAgJ2Zvb3Rlcic6ICdIVE1MRWxlbWVudCcsXG4gICdmb3JtJzogJ0hUTUxGb3JtRWxlbWVudCcsXG4gICdmcmFtZSc6ICdIVE1MRnJhbWVFbGVtZW50JyxcbiAgJ2ZyYW1lc2V0JzogJ0hUTUxGcmFtZVNldEVsZW1lbnQnLFxuICAnaDEnOiAnSFRNTEhlYWRpbmdFbGVtZW50JyxcbiAgJ2gyJzogJ0hUTUxIZWFkaW5nRWxlbWVudCcsXG4gICdoMyc6ICdIVE1MSGVhZGluZ0VsZW1lbnQnLFxuICAnaDQnOiAnSFRNTEhlYWRpbmdFbGVtZW50JyxcbiAgJ2g1JzogJ0hUTUxIZWFkaW5nRWxlbWVudCcsXG4gICdoNic6ICdIVE1MSGVhZGluZ0VsZW1lbnQnLFxuICAnaGVhZCc6ICdIVE1MSGVhZEVsZW1lbnQnLFxuICAnaGVhZGVyJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2hncm91cCc6ICdIVE1MRWxlbWVudCcsXG4gICdocic6ICdIVE1MSFJFbGVtZW50JyxcbiAgJ2h0bWwnOiAnSFRNTEh0bWxFbGVtZW50JyxcbiAgJ2knOiAnSFRNTEVsZW1lbnQnLFxuICAnaWZyYW1lJzogJ0hUTUxJRnJhbWVFbGVtZW50JyxcbiAgJ2ltZyc6ICdIVE1MSW1hZ2VFbGVtZW50JyxcbiAgJ2lucHV0JzogJ0hUTUxJbnB1dEVsZW1lbnQnLFxuICAnaW5zJzogJ0hUTUxNb2RFbGVtZW50JyxcbiAgJ2lzaW5kZXgnOiAnSFRNTFVua25vd25FbGVtZW50JyxcbiAgJ2tiZCc6ICdIVE1MRWxlbWVudCcsXG4gICdrZXlnZW4nOiAnSFRNTEtleWdlbkVsZW1lbnQnLFxuICAnbGFiZWwnOiAnSFRNTExhYmVsRWxlbWVudCcsXG4gICdsZWdlbmQnOiAnSFRNTExlZ2VuZEVsZW1lbnQnLFxuICAnbGknOiAnSFRNTExJRWxlbWVudCcsXG4gICdsaW5rJzogJ0hUTUxMaW5rRWxlbWVudCcsXG4gICdtYXAnOiAnSFRNTE1hcEVsZW1lbnQnLFxuICAnbWFyayc6ICdIVE1MRWxlbWVudCcsXG4gICdtZW51JzogJ0hUTUxNZW51RWxlbWVudCcsXG4gICdtZXRhJzogJ0hUTUxNZXRhRWxlbWVudCcsXG4gICdtZXRlcic6ICdIVE1MTWV0ZXJFbGVtZW50JyxcbiAgJ25hdic6ICdIVE1MRWxlbWVudCcsXG4gICdub2JyJzogJ0hUTUxFbGVtZW50JyxcbiAgJ25vZW1iZWQnOiAnSFRNTEVsZW1lbnQnLFxuICAnbm9mcmFtZXMnOiAnSFRNTEVsZW1lbnQnLFxuICAnbm9zY3JpcHQnOiAnSFRNTEVsZW1lbnQnLFxuICAnb2JqZWN0JzogJ0hUTUxPYmplY3RFbGVtZW50JyxcbiAgJ29sJzogJ0hUTUxPTGlzdEVsZW1lbnQnLFxuICAnb3B0Z3JvdXAnOiAnSFRNTE9wdEdyb3VwRWxlbWVudCcsXG4gICdvcHRpb24nOiAnSFRNTE9wdGlvbkVsZW1lbnQnLFxuICAnb3V0cHV0JzogJ0hUTUxPdXRwdXRFbGVtZW50JyxcbiAgJ3AnOiAnSFRNTFBhcmFncmFwaEVsZW1lbnQnLFxuICAncGFyYW0nOiAnSFRNTFBhcmFtRWxlbWVudCcsXG4gICdwcmUnOiAnSFRNTFByZUVsZW1lbnQnLFxuICAncHJvZ3Jlc3MnOiAnSFRNTFByb2dyZXNzRWxlbWVudCcsXG4gICdxJzogJ0hUTUxRdW90ZUVsZW1lbnQnLFxuICAncyc6ICdIVE1MRWxlbWVudCcsXG4gICdzYW1wJzogJ0hUTUxFbGVtZW50JyxcbiAgJ3NjcmlwdCc6ICdIVE1MU2NyaXB0RWxlbWVudCcsXG4gICdzZWN0aW9uJzogJ0hUTUxFbGVtZW50JyxcbiAgJ3NlbGVjdCc6ICdIVE1MU2VsZWN0RWxlbWVudCcsXG4gICdzbWFsbCc6ICdIVE1MRWxlbWVudCcsXG4gICdzb3VyY2UnOiAnSFRNTFNvdXJjZUVsZW1lbnQnLFxuICAnc3Bhbic6ICdIVE1MU3BhbkVsZW1lbnQnLFxuICAnc3RyaWtlJzogJ0hUTUxFbGVtZW50JyxcbiAgJ3N0cm9uZyc6ICdIVE1MRWxlbWVudCcsXG4gICdzdHlsZSc6ICdIVE1MU3R5bGVFbGVtZW50JyxcbiAgJ3N1Yic6ICdIVE1MRWxlbWVudCcsXG4gICdzdW1tYXJ5JzogJ0hUTUxFbGVtZW50JyxcbiAgJ3N1cCc6ICdIVE1MRWxlbWVudCcsXG4gICd0YWJsZSc6ICdIVE1MVGFibGVFbGVtZW50JyxcbiAgJ3Rib2R5JzogJ0hUTUxUYWJsZVNlY3Rpb25FbGVtZW50JyxcbiAgJ3RkJzogJ0hUTUxUYWJsZURhdGFDZWxsRWxlbWVudCcsXG4gICd0ZXh0YXJlYSc6ICdIVE1MVGV4dEFyZWFFbGVtZW50JyxcbiAgJ3Rmb290JzogJ0hUTUxUYWJsZVNlY3Rpb25FbGVtZW50JyxcbiAgJ3RoJzogJ0hUTUxUYWJsZUhlYWRlckNlbGxFbGVtZW50JyxcbiAgJ3RoZWFkJzogJ0hUTUxUYWJsZVNlY3Rpb25FbGVtZW50JyxcbiAgJ3RpbWUnOiAnSFRNTFRpbWVFbGVtZW50JyxcbiAgJ3RpdGxlJzogJ0hUTUxUaXRsZUVsZW1lbnQnLFxuICAndHInOiAnSFRNTFRhYmxlUm93RWxlbWVudCcsXG4gICd0cmFjayc6ICdIVE1MVHJhY2tFbGVtZW50JyxcbiAgJ3R0JzogJ0hUTUxFbGVtZW50JyxcbiAgJ3UnOiAnSFRNTEVsZW1lbnQnLFxuICAndWwnOiAnSFRNTFVMaXN0RWxlbWVudCcsXG4gICd2YXInOiAnSFRNTEVsZW1lbnQnLFxuICAndmlkZW8nOiAnSFRNTFZpZGVvRWxlbWVudCcsXG4gICd3YnInOiAnSFRNTEVsZW1lbnQnXG59O1xuaHRtbDRbICdFTEVNRU5UX0RPTV9JTlRFUkZBQ0VTJyBdID0gaHRtbDQuRUxFTUVOVF9ET01fSU5URVJGQUNFUztcbmh0bWw0LnVlZmZlY3RzID0ge1xuICAnTk9UX0xPQURFRCc6IDAsXG4gICdTQU1FX0RPQ1VNRU5UJzogMSxcbiAgJ05FV19ET0NVTUVOVCc6IDJcbn07XG5odG1sNFsgJ3VlZmZlY3RzJyBdID0gaHRtbDQudWVmZmVjdHM7XG5odG1sNC5VUklFRkZFQ1RTID0ge1xuICAnYTo6aHJlZic6IDIsXG4gICdhcmVhOjpocmVmJzogMixcbiAgJ2Jsb2NrcXVvdGU6OmNpdGUnOiAwLFxuICAnY29tbWFuZDo6aWNvbic6IDEsXG4gICdkZWw6OmNpdGUnOiAwLFxuICAnZm9ybTo6YWN0aW9uJzogMixcbiAgJ2ltZzo6c3JjJzogMSxcbiAgJ2lucHV0OjpzcmMnOiAxLFxuICAnaW5zOjpjaXRlJzogMCxcbiAgJ3E6OmNpdGUnOiAwLFxuICAndmlkZW86OnBvc3Rlcic6IDFcbn07XG5odG1sNFsgJ1VSSUVGRkVDVFMnIF0gPSBodG1sNC5VUklFRkZFQ1RTO1xuaHRtbDQubHR5cGVzID0ge1xuICAnVU5TQU5EQk9YRUQnOiAyLFxuICAnU0FOREJPWEVEJzogMSxcbiAgJ0RBVEEnOiAwXG59O1xuaHRtbDRbICdsdHlwZXMnIF0gPSBodG1sNC5sdHlwZXM7XG5odG1sNC5MT0FERVJUWVBFUyA9IHtcbiAgJ2E6OmhyZWYnOiAyLFxuICAnYXJlYTo6aHJlZic6IDIsXG4gICdibG9ja3F1b3RlOjpjaXRlJzogMixcbiAgJ2NvbW1hbmQ6Omljb24nOiAxLFxuICAnZGVsOjpjaXRlJzogMixcbiAgJ2Zvcm06OmFjdGlvbic6IDIsXG4gICdpbWc6OnNyYyc6IDEsXG4gICdpbnB1dDo6c3JjJzogMSxcbiAgJ2luczo6Y2l0ZSc6IDIsXG4gICdxOjpjaXRlJzogMixcbiAgJ3ZpZGVvOjpwb3N0ZXInOiAxXG59O1xuaHRtbDRbICdMT0FERVJUWVBFUycgXSA9IGh0bWw0LkxPQURFUlRZUEVTO1xuXG4vLyBDb3B5cmlnaHQgKEMpIDIwMDYgR29vZ2xlIEluYy5cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXdcbiAqIEFuIEhUTUwgc2FuaXRpemVyIHRoYXQgY2FuIHNhdGlzZnkgYSB2YXJpZXR5IG9mIHNlY3VyaXR5IHBvbGljaWVzLlxuICpcbiAqIDxwPlxuICogVGhlIEhUTUwgc2FuaXRpemVyIGlzIGJ1aWx0IGFyb3VuZCBhIFNBWCBwYXJzZXIgYW5kIEhUTUwgZWxlbWVudCBhbmRcbiAqIGF0dHJpYnV0ZXMgc2NoZW1hcy5cbiAqXG4gKiBJZiB0aGUgY3NzcGFyc2VyIGlzIGxvYWRlZCwgaW5saW5lIHN0eWxlcyBhcmUgc2FuaXRpemVkIHVzaW5nIHRoZVxuICogY3NzIHByb3BlcnR5IGFuZCB2YWx1ZSBzY2hlbWFzLiAgRWxzZSB0aGV5IGFyZSByZW1vdmUgZHVyaW5nXG4gKiBzYW5pdGl6YXRpb24uXG4gKlxuICogSWYgaXQgZXhpc3RzLCB1c2VzIHBhcnNlQ3NzRGVjbGFyYXRpb25zLCBzYW5pdGl6ZUNzc1Byb3BlcnR5LCAgY3NzU2NoZW1hXG4gKlxuICogQGF1dGhvciBtaWtlc2FtdWVsQGdtYWlsLmNvbVxuICogQGF1dGhvciBqYXN2aXJAZ21haWwuY29tXG4gKiBcXEByZXF1aXJlcyBodG1sNCwgVVJJXG4gKiBcXEBvdmVycmlkZXMgd2luZG93XG4gKiBcXEBwcm92aWRlcyBodG1sLCBodG1sX3Nhbml0aXplXG4gKi9cblxuLy8gVGhlIFR1cmtpc2ggaSBzZWVtcyB0byBiZSBhIG5vbi1pc3N1ZSwgYnV0IGFib3J0IGluIGNhc2UgaXQgaXMuXG5pZiAoJ0knLnRvTG93ZXJDYXNlKCkgIT09ICdpJykgeyB0aHJvdyAnSS9pIHByb2JsZW0nOyB9XG5cbi8qKlxuICogXFxAbmFtZXNwYWNlXG4gKi9cbnZhciBodG1sID0gKGZ1bmN0aW9uKGh0bWw0KSB7XG5cbiAgLy8gRm9yIGNsb3N1cmUgY29tcGlsZXJcbiAgdmFyIHBhcnNlQ3NzRGVjbGFyYXRpb25zLCBzYW5pdGl6ZUNzc1Byb3BlcnR5LCBjc3NTY2hlbWE7XG4gIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHdpbmRvdykge1xuICAgIHBhcnNlQ3NzRGVjbGFyYXRpb25zID0gd2luZG93WydwYXJzZUNzc0RlY2xhcmF0aW9ucyddO1xuICAgIHNhbml0aXplQ3NzUHJvcGVydHkgPSB3aW5kb3dbJ3Nhbml0aXplQ3NzUHJvcGVydHknXTtcbiAgICBjc3NTY2hlbWEgPSB3aW5kb3dbJ2Nzc1NjaGVtYSddO1xuICB9XG5cbiAgLy8gVGhlIGtleXMgb2YgdGhpcyBvYmplY3QgbXVzdCBiZSAncXVvdGVkJyBvciBKU0NvbXBpbGVyIHdpbGwgbWFuZ2xlIHRoZW0hXG4gIC8vIFRoaXMgaXMgYSBwYXJ0aWFsIGxpc3QgLS0gbG9va3VwRW50aXR5KCkgdXNlcyB0aGUgaG9zdCBicm93c2VyJ3MgcGFyc2VyXG4gIC8vICh3aGVuIGF2YWlsYWJsZSkgdG8gaW1wbGVtZW50IGZ1bGwgZW50aXR5IGxvb2t1cC5cbiAgLy8gTm90ZSB0aGF0IGVudGl0aWVzIGFyZSBpbiBnZW5lcmFsIGNhc2Utc2Vuc2l0aXZlOyB0aGUgdXBwZXJjYXNlIG9uZXMgYXJlXG4gIC8vIGV4cGxpY2l0bHkgZGVmaW5lZCBieSBIVE1MNSAocHJlc3VtYWJseSBhcyBjb21wYXRpYmlsaXR5KS5cbiAgdmFyIEVOVElUSUVTID0ge1xuICAgICdsdCc6ICc8JyxcbiAgICAnTFQnOiAnPCcsXG4gICAgJ2d0JzogJz4nLFxuICAgICdHVCc6ICc+JyxcbiAgICAnYW1wJzogJyYnLFxuICAgICdBTVAnOiAnJicsXG4gICAgJ3F1b3QnOiAnXCInLFxuICAgICdhcG9zJzogJ1xcJycsXG4gICAgJ25ic3AnOiAnXFwyNDAnXG4gIH07XG5cbiAgLy8gUGF0dGVybnMgZm9yIHR5cGVzIG9mIGVudGl0eS9jaGFyYWN0ZXIgcmVmZXJlbmNlIG5hbWVzLlxuICB2YXIgZGVjaW1hbEVzY2FwZVJlID0gL14jKFxcZCspJC87XG4gIHZhciBoZXhFc2NhcGVSZSA9IC9eI3goWzAtOUEtRmEtZl0rKSQvO1xuICAvLyBjb250YWlucyBldmVyeSBlbnRpdHkgcGVyIGh0dHA6Ly93d3cudzMub3JnL1RSLzIwMTEvV0QtaHRtbDUtMjAxMTAxMTMvbmFtZWQtY2hhcmFjdGVyLXJlZmVyZW5jZXMuaHRtbFxuICB2YXIgc2FmZUVudGl0eU5hbWVSZSA9IC9eW0EtWmEtel1bQS16YS16MC05XSskLztcbiAgLy8gVXNlZCBhcyBhIGhvb2sgdG8gaW52b2tlIHRoZSBicm93c2VyJ3MgZW50aXR5IHBhcnNpbmcuIDx0ZXh0YXJlYT4gaXMgdXNlZFxuICAvLyBiZWNhdXNlIGl0cyBjb250ZW50IGlzIHBhcnNlZCBmb3IgZW50aXRpZXMgYnV0IG5vdCB0YWdzLlxuICAvLyBUT0RPKGtwcmVpZCk6IFRoaXMgcmV0cmlldmFsIGlzIGEga2x1ZGdlIGFuZCBsZWFkcyB0byBzaWxlbnQgbG9zcyBvZlxuICAvLyBmdW5jdGlvbmFsaXR5IGlmIHRoZSBkb2N1bWVudCBpc24ndCBhdmFpbGFibGUuXG4gIHZhciBlbnRpdHlMb29rdXBFbGVtZW50ID1cbiAgICAgICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHdpbmRvdyAmJiB3aW5kb3dbJ2RvY3VtZW50J10pXG4gICAgICAgICAgPyB3aW5kb3dbJ2RvY3VtZW50J10uY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKSA6IG51bGw7XG4gIC8qKlxuICAgKiBEZWNvZGVzIGFuIEhUTUwgZW50aXR5LlxuICAgKlxuICAgKiB7XFxAdXBkb2NcbiAgICogJCBsb29rdXBFbnRpdHkoJ2x0JylcbiAgICogIyAnPCdcbiAgICogJCBsb29rdXBFbnRpdHkoJ0dUJylcbiAgICogIyAnPidcbiAgICogJCBsb29rdXBFbnRpdHkoJ2FtcCcpXG4gICAqICMgJyYnXG4gICAqICQgbG9va3VwRW50aXR5KCduYnNwJylcbiAgICogIyAnXFx4QTAnXG4gICAqICQgbG9va3VwRW50aXR5KCdhcG9zJylcbiAgICogIyBcIidcIlxuICAgKiAkIGxvb2t1cEVudGl0eSgncXVvdCcpXG4gICAqICMgJ1wiJ1xuICAgKiAkIGxvb2t1cEVudGl0eSgnI3hhJylcbiAgICogIyAnXFxuJ1xuICAgKiAkIGxvb2t1cEVudGl0eSgnIzEwJylcbiAgICogIyAnXFxuJ1xuICAgKiAkIGxvb2t1cEVudGl0eSgnI3gwYScpXG4gICAqICMgJ1xcbidcbiAgICogJCBsb29rdXBFbnRpdHkoJyMwMTAnKVxuICAgKiAjICdcXG4nXG4gICAqICQgbG9va3VwRW50aXR5KCcjeDAwQScpXG4gICAqICMgJ1xcbidcbiAgICogJCBsb29rdXBFbnRpdHkoJ1BpJykgICAgICAvLyBLbm93biBmYWlsdXJlXG4gICAqICMgJ1xcdTAzQTAnXG4gICAqICQgbG9va3VwRW50aXR5KCdwaScpICAgICAgLy8gS25vd24gZmFpbHVyZVxuICAgKiAjICdcXHUwM0MwJ1xuICAgKiB9XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSBjb250ZW50IGJldHdlZW4gdGhlICcmJyBhbmQgdGhlICc7Jy5cbiAgICogQHJldHVybiB7c3RyaW5nfSBhIHNpbmdsZSB1bmljb2RlIGNvZGUtcG9pbnQgYXMgYSBzdHJpbmcuXG4gICAqL1xuICBmdW5jdGlvbiBsb29rdXBFbnRpdHkobmFtZSkge1xuICAgIC8vIFRPRE86IGVudGl0eSBsb29rdXAgYXMgc3BlY2lmaWVkIGJ5IEhUTUw1IGFjdHVhbGx5IGRlcGVuZHMgb24gdGhlXG4gICAgLy8gcHJlc2VuY2Ugb2YgdGhlIFwiO1wiLlxuICAgIGlmIChFTlRJVElFUy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkgeyByZXR1cm4gRU5USVRJRVNbbmFtZV07IH1cbiAgICB2YXIgbSA9IG5hbWUubWF0Y2goZGVjaW1hbEVzY2FwZVJlKTtcbiAgICBpZiAobSkge1xuICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQobVsxXSwgMTApKTtcbiAgICB9IGVsc2UgaWYgKCEhKG0gPSBuYW1lLm1hdGNoKGhleEVzY2FwZVJlKSkpIHtcbiAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG1bMV0sIDE2KSk7XG4gICAgfSBlbHNlIGlmIChlbnRpdHlMb29rdXBFbGVtZW50ICYmIHNhZmVFbnRpdHlOYW1lUmUudGVzdChuYW1lKSkge1xuICAgICAgZW50aXR5TG9va3VwRWxlbWVudC5pbm5lckhUTUwgPSAnJicgKyBuYW1lICsgJzsnO1xuICAgICAgdmFyIHRleHQgPSBlbnRpdHlMb29rdXBFbGVtZW50LnRleHRDb250ZW50O1xuICAgICAgRU5USVRJRVNbbmFtZV0gPSB0ZXh0O1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJicgKyBuYW1lICsgJzsnO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZU9uZUVudGl0eShfLCBuYW1lKSB7XG4gICAgcmV0dXJuIGxvb2t1cEVudGl0eShuYW1lKTtcbiAgfVxuXG4gIHZhciBudWxSZSA9IC9cXDAvZztcbiAgZnVuY3Rpb24gc3RyaXBOVUxzKHMpIHtcbiAgICByZXR1cm4gcy5yZXBsYWNlKG51bFJlLCAnJyk7XG4gIH1cblxuICB2YXIgRU5USVRZX1JFXzEgPSAvJigjWzAtOV0rfCNbeFhdWzAtOUEtRmEtZl0rfFxcdyspOy9nO1xuICB2YXIgRU5USVRZX1JFXzIgPSAvXigjWzAtOV0rfCNbeFhdWzAtOUEtRmEtZl0rfFxcdyspOy87XG4gIC8qKlxuICAgKiBUaGUgcGxhaW4gdGV4dCBvZiBhIGNodW5rIG9mIEhUTUwgQ0RBVEEgd2hpY2ggcG9zc2libHkgY29udGFpbmluZy5cbiAgICpcbiAgICoge1xcQHVwZG9jXG4gICAqICQgdW5lc2NhcGVFbnRpdGllcygnJylcbiAgICogIyAnJ1xuICAgKiAkIHVuZXNjYXBlRW50aXRpZXMoJ2hlbGxvIFdvcmxkIScpXG4gICAqICMgJ2hlbGxvIFdvcmxkISdcbiAgICogJCB1bmVzY2FwZUVudGl0aWVzKCcxICZsdDsgMiAmYW1wOyZBTVA7IDQgJmd0OyAzJiMxMDsnKVxuICAgKiAjICcxIDwgMiAmJiA0ID4gM1xcbidcbiAgICogJCB1bmVzY2FwZUVudGl0aWVzKCcmbHQ7Jmx0IDwtIHVuZmluaXNoZWQgZW50aXR5Jmd0OycpXG4gICAqICMgJzwmbHQgPC0gdW5maW5pc2hlZCBlbnRpdHk+J1xuICAgKiAkIHVuZXNjYXBlRW50aXRpZXMoJy9mb28/YmFyPWJheiZjb3B5PXRydWUnKSAgLy8gJiBvZnRlbiB1bmVzY2FwZWQgaW4gVVJMU1xuICAgKiAjICcvZm9vP2Jhcj1iYXomY29weT10cnVlJ1xuICAgKiAkIHVuZXNjYXBlRW50aXRpZXMoJ3BpPSZwaTsmI3gzYzA7LCBQaT0mUGk7XFx1MDNBMCcpIC8vIEZJWE1FOiBrbm93biBmYWlsdXJlXG4gICAqICMgJ3BpPVxcdTAzQzBcXHUwM2MwLCBQaT1cXHUwM0EwXFx1MDNBMCdcbiAgICogfVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcyBhIGNodW5rIG9mIEhUTUwgQ0RBVEEuICBJdCBtdXN0IG5vdCBzdGFydCBvciBlbmQgaW5zaWRlXG4gICAqICAgICBhbiBIVE1MIGVudGl0eS5cbiAgICovXG4gIGZ1bmN0aW9uIHVuZXNjYXBlRW50aXRpZXMocykge1xuICAgIHJldHVybiBzLnJlcGxhY2UoRU5USVRZX1JFXzEsIGRlY29kZU9uZUVudGl0eSk7XG4gIH1cblxuICB2YXIgYW1wUmUgPSAvJi9nO1xuICB2YXIgbG9vc2VBbXBSZSA9IC8mKFteYS16I118Iyg/OlteMC05eF18eCg/OlteMC05YS1mXXwkKXwkKXwkKS9naTtcbiAgdmFyIGx0UmUgPSAvWzxdL2c7XG4gIHZhciBndFJlID0gLz4vZztcbiAgdmFyIHF1b3RSZSA9IC9cXFwiL2c7XG5cbiAgLyoqXG4gICAqIEVzY2FwZXMgSFRNTCBzcGVjaWFsIGNoYXJhY3RlcnMgaW4gYXR0cmlidXRlIHZhbHVlcy5cbiAgICpcbiAgICoge1xcQHVwZG9jXG4gICAqICQgZXNjYXBlQXR0cmliKCcnKVxuICAgKiAjICcnXG4gICAqICQgZXNjYXBlQXR0cmliKCdcIjw8Jj09Jj4+XCInKSAgLy8gRG8gbm90IGp1c3QgZXNjYXBlIHRoZSBmaXJzdCBvY2N1cnJlbmNlLlxuICAgKiAjICcmIzM0OyZsdDsmbHQ7JmFtcDsmIzYxOyYjNjE7JmFtcDsmZ3Q7Jmd0OyYjMzQ7J1xuICAgKiAkIGVzY2FwZUF0dHJpYignSGVsbG8gPFdvcmxkPiEnKVxuICAgKiAjICdIZWxsbyAmbHQ7V29ybGQmZ3Q7ISdcbiAgICogfVxuICAgKi9cbiAgZnVuY3Rpb24gZXNjYXBlQXR0cmliKHMpIHtcbiAgICByZXR1cm4gKCcnICsgcykucmVwbGFjZShhbXBSZSwgJyZhbXA7JykucmVwbGFjZShsdFJlLCAnJmx0OycpXG4gICAgICAgIC5yZXBsYWNlKGd0UmUsICcmZ3Q7JykucmVwbGFjZShxdW90UmUsICcmIzM0OycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVzY2FwZSBlbnRpdGllcyBpbiBSQ0RBVEEgdGhhdCBjYW4gYmUgZXNjYXBlZCB3aXRob3V0IGNoYW5naW5nIHRoZSBtZWFuaW5nLlxuICAgKiB7XFxAdXBkb2NcbiAgICogJCBub3JtYWxpemVSQ0RhdGEoJzEgPCAyICYmYW1wOyAzID4gNCAmYW1wOyYgNSAmbHQ7IDcmOCcpXG4gICAqICMgJzEgJmx0OyAyICZhbXA7JmFtcDsgMyAmZ3Q7IDQgJmFtcDsmYW1wOyA1ICZsdDsgNyZhbXA7OCdcbiAgICogfVxuICAgKi9cbiAgZnVuY3Rpb24gbm9ybWFsaXplUkNEYXRhKHJjZGF0YSkge1xuICAgIHJldHVybiByY2RhdGFcbiAgICAgICAgLnJlcGxhY2UobG9vc2VBbXBSZSwgJyZhbXA7JDEnKVxuICAgICAgICAucmVwbGFjZShsdFJlLCAnJmx0OycpXG4gICAgICAgIC5yZXBsYWNlKGd0UmUsICcmZ3Q7Jyk7XG4gIH1cblxuICAvLyBUT0RPKGZlbGl4OGEpOiB2YWxpZGF0ZSBzYW5pdGl6ZXIgcmVnZXhzIGFnYWluc3QgdGhlIEhUTUw1IGdyYW1tYXIgYXRcbiAgLy8gaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWxcbiAgLy8gaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvcGFyc2luZy5odG1sXG4gIC8vIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3Rva2VuaXphdGlvbi5odG1sXG4gIC8vIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3RyZWUtY29uc3RydWN0aW9uLmh0bWxcblxuICAvLyBXZSBpbml0aWFsbHkgc3BsaXQgaW5wdXQgc28gdGhhdCBwb3RlbnRpYWxseSBtZWFuaW5nZnVsIGNoYXJhY3RlcnNcbiAgLy8gbGlrZSAnPCcgYW5kICc+JyBhcmUgc2VwYXJhdGUgdG9rZW5zLCB1c2luZyBhIGZhc3QgZHVtYiBwcm9jZXNzIHRoYXRcbiAgLy8gaWdub3JlcyBxdW90aW5nLiAgVGhlbiB3ZSB3YWxrIHRoYXQgdG9rZW4gc3RyZWFtLCBhbmQgd2hlbiB3ZSBzZWUgYVxuICAvLyAnPCcgdGhhdCdzIHRoZSBzdGFydCBvZiBhIHRhZywgd2UgdXNlIEFUVFJfUkUgdG8gZXh0cmFjdCB0YWdcbiAgLy8gYXR0cmlidXRlcyBmcm9tIHRoZSBuZXh0IHRva2VuLiAgVGhhdCB0b2tlbiB3aWxsIG5ldmVyIGhhdmUgYSAnPidcbiAgLy8gY2hhcmFjdGVyLiAgSG93ZXZlciwgaXQgbWlnaHQgaGF2ZSBhbiB1bmJhbGFuY2VkIHF1b3RlIGNoYXJhY3RlciwgYW5kXG4gIC8vIHdoZW4gd2Ugc2VlIHRoYXQsIHdlIGNvbWJpbmUgYWRkaXRpb25hbCB0b2tlbnMgdG8gYmFsYW5jZSB0aGUgcXVvdGUuXG5cbiAgdmFyIEFUVFJfUkUgPSBuZXcgUmVnRXhwKFxuICAgICdeXFxcXHMqJyArXG4gICAgJyhbLS46XFxcXHddKyknICsgICAgICAgICAgICAgLy8gMSA9IEF0dHJpYnV0ZSBuYW1lXG4gICAgJyg/OicgKyAoXG4gICAgICAnXFxcXHMqKD0pXFxcXHMqJyArICAgICAgICAgICAvLyAyID0gSXMgdGhlcmUgYSB2YWx1ZT9cbiAgICAgICcoJyArICggICAgICAgICAgICAgICAgICAgLy8gMyA9IEF0dHJpYnV0ZSB2YWx1ZVxuICAgICAgICAvLyBUT0RPKGZlbGl4OGEpOiBtYXliZSB1c2UgYmFja3JlZiB0byBtYXRjaCBxdW90ZXNcbiAgICAgICAgJyhcXFwiKVteXFxcIl0qKFxcXCJ8JCknICsgICAgLy8gNCwgNSA9IERvdWJsZS1xdW90ZWQgc3RyaW5nXG4gICAgICAgICd8JyArXG4gICAgICAgICcoXFwnKVteXFwnXSooXFwnfCQpJyArICAgIC8vIDYsIDcgPSBTaW5nbGUtcXVvdGVkIHN0cmluZ1xuICAgICAgICAnfCcgK1xuICAgICAgICAvLyBQb3NpdGl2ZSBsb29rYWhlYWQgdG8gcHJldmVudCBpbnRlcnByZXRhdGlvbiBvZlxuICAgICAgICAvLyA8Zm9vIGE9IGI9Yz4gYXMgPGZvbyBhPSdiPWMnPlxuICAgICAgICAvLyBUT0RPKGZlbGl4OGEpOiBtaWdodCBiZSBhYmxlIHRvIGRyb3AgdGhpcyBjYXNlXG4gICAgICAgICcoPz1bYS16XVstXFxcXHddKlxcXFxzKj0pJyArXG4gICAgICAgICd8JyArXG4gICAgICAgIC8vIFVucXVvdGVkIHZhbHVlIHRoYXQgaXNuJ3QgYW4gYXR0cmlidXRlIG5hbWVcbiAgICAgICAgLy8gKHNpbmNlIHdlIGRpZG4ndCBtYXRjaCB0aGUgcG9zaXRpdmUgbG9va2FoZWFkIGFib3ZlKVxuICAgICAgICAnW15cXFwiXFwnXFxcXHNdKicgKSArXG4gICAgICAnKScgKSArXG4gICAgJyk/JyxcbiAgICAnaScpO1xuXG4gIC8vIGZhbHNlIG9uIElFPD04LCB0cnVlIG9uIG1vc3Qgb3RoZXIgYnJvd3NlcnNcbiAgdmFyIHNwbGl0V2lsbENhcHR1cmUgPSAoJ2EsYicuc3BsaXQoLygsKS8pLmxlbmd0aCA9PT0gMyk7XG5cbiAgLy8gYml0bWFzayBmb3IgdGFncyB3aXRoIHNwZWNpYWwgcGFyc2luZywgbGlrZSA8c2NyaXB0PiBhbmQgPHRleHRhcmVhPlxuICB2YXIgRUZMQUdTX1RFWFQgPSBodG1sNC5lZmxhZ3NbJ0NEQVRBJ10gfCBodG1sNC5lZmxhZ3NbJ1JDREFUQSddO1xuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFNBWC1saWtlIGV2ZW50IGhhbmRsZXIsIHByb2R1Y2UgYSBmdW5jdGlvbiB0aGF0IGZlZWRzIHRob3NlXG4gICAqIGV2ZW50cyBhbmQgYSBwYXJhbWV0ZXIgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAqXG4gICAqIFRoZSBldmVudCBoYW5kbGVyIGhhcyB0aGUgZm9ybTp7QGNvZGVcbiAgICoge1xuICAgKiAgIC8vIE5hbWUgaXMgYW4gdXBwZXItY2FzZSBIVE1MIHRhZyBuYW1lLiAgQXR0cmlicyBpcyBhbiBhcnJheSBvZlxuICAgKiAgIC8vIGFsdGVybmF0aW5nIHVwcGVyLWNhc2UgYXR0cmlidXRlIG5hbWVzLCBhbmQgYXR0cmlidXRlIHZhbHVlcy4gIFRoZVxuICAgKiAgIC8vIGF0dHJpYnMgYXJyYXkgaXMgcmV1c2VkIGJ5IHRoZSBwYXJzZXIuICBQYXJhbSBpcyB0aGUgdmFsdWUgcGFzc2VkIHRvXG4gICAqICAgLy8gdGhlIHNheFBhcnNlci5cbiAgICogICBzdGFydFRhZzogZnVuY3Rpb24gKG5hbWUsIGF0dHJpYnMsIHBhcmFtKSB7IC4uLiB9LFxuICAgKiAgIGVuZFRhZzogICBmdW5jdGlvbiAobmFtZSwgcGFyYW0pIHsgLi4uIH0sXG4gICAqICAgcGNkYXRhOiAgIGZ1bmN0aW9uICh0ZXh0LCBwYXJhbSkgeyAuLi4gfSxcbiAgICogICByY2RhdGE6ICAgZnVuY3Rpb24gKHRleHQsIHBhcmFtKSB7IC4uLiB9LFxuICAgKiAgIGNkYXRhOiAgICBmdW5jdGlvbiAodGV4dCwgcGFyYW0pIHsgLi4uIH0sXG4gICAqICAgc3RhcnREb2M6IGZ1bmN0aW9uIChwYXJhbSkgeyAuLi4gfSxcbiAgICogICBlbmREb2M6ICAgZnVuY3Rpb24gKHBhcmFtKSB7IC4uLiB9XG4gICAqIH19XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBoYW5kbGVyIGEgcmVjb3JkIGNvbnRhaW5pbmcgZXZlbnQgaGFuZGxlcnMuXG4gICAqIEByZXR1cm4ge2Z1bmN0aW9uKHN0cmluZywgT2JqZWN0KX0gQSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgY2h1bmsgb2YgSFRNTFxuICAgKiAgICAgYW5kIGEgcGFyYW1ldGVyLiAgVGhlIHBhcmFtZXRlciBpcyBwYXNzZWQgb24gdG8gdGhlIGhhbmRsZXIgbWV0aG9kcy5cbiAgICovXG4gIGZ1bmN0aW9uIG1ha2VTYXhQYXJzZXIoaGFuZGxlcikge1xuICAgIC8vIEFjY2VwdCBxdW90ZWQgb3IgdW5xdW90ZWQga2V5cyAoQ2xvc3VyZSBjb21wYXQpXG4gICAgdmFyIGhjb3B5ID0ge1xuICAgICAgY2RhdGE6IGhhbmRsZXIuY2RhdGEgfHwgaGFuZGxlclsnY2RhdGEnXSxcbiAgICAgIGNvbW1lbnQ6IGhhbmRsZXIuY29tbWVudCB8fCBoYW5kbGVyWydjb21tZW50J10sXG4gICAgICBlbmREb2M6IGhhbmRsZXIuZW5kRG9jIHx8IGhhbmRsZXJbJ2VuZERvYyddLFxuICAgICAgZW5kVGFnOiBoYW5kbGVyLmVuZFRhZyB8fCBoYW5kbGVyWydlbmRUYWcnXSxcbiAgICAgIHBjZGF0YTogaGFuZGxlci5wY2RhdGEgfHwgaGFuZGxlclsncGNkYXRhJ10sXG4gICAgICByY2RhdGE6IGhhbmRsZXIucmNkYXRhIHx8IGhhbmRsZXJbJ3JjZGF0YSddLFxuICAgICAgc3RhcnREb2M6IGhhbmRsZXIuc3RhcnREb2MgfHwgaGFuZGxlclsnc3RhcnREb2MnXSxcbiAgICAgIHN0YXJ0VGFnOiBoYW5kbGVyLnN0YXJ0VGFnIHx8IGhhbmRsZXJbJ3N0YXJ0VGFnJ11cbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbihodG1sVGV4dCwgcGFyYW0pIHtcbiAgICAgIHJldHVybiBwYXJzZShodG1sVGV4dCwgaGNvcHksIHBhcmFtKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gUGFyc2luZyBzdHJhdGVneSBpcyB0byBzcGxpdCBpbnB1dCBpbnRvIHBhcnRzIHRoYXQgbWlnaHQgYmUgbGV4aWNhbGx5XG4gIC8vIG1lYW5pbmdmdWwgKGV2ZXJ5IFwiPlwiIGJlY29tZXMgYSBzZXBhcmF0ZSBwYXJ0KSwgYW5kIHRoZW4gcmVjb21iaW5lXG4gIC8vIHBhcnRzIGlmIHdlIGRpc2NvdmVyIHRoZXkncmUgaW4gYSBkaWZmZXJlbnQgY29udGV4dC5cblxuICAvLyBUT0RPKGZlbGl4OGEpOiBTaWduaWZpY2FudCBwZXJmb3JtYW5jZSByZWdyZXNzaW9ucyBmcm9tIC1sZWdhY3ksXG4gIC8vIHRlc3RlZCBvblxuICAvLyAgICBDaHJvbWUgMTguMFxuICAvLyAgICBGaXJlZm94IDExLjBcbiAgLy8gICAgSUUgNiwgNywgOCwgOVxuICAvLyAgICBPcGVyYSAxMS42MVxuICAvLyAgICBTYWZhcmkgNS4xLjNcbiAgLy8gTWFueSBvZiB0aGVzZSBhcmUgdW51c3VhbCBwYXR0ZXJucyB0aGF0IGFyZSBsaW5lYXJseSBzbG93ZXIgYW5kIHN0aWxsXG4gIC8vIHByZXR0eSBmYXN0IChlZyAxbXMgdG8gNW1zKSwgc28gbm90IG5lY2Vzc2FyaWx5IHdvcnRoIGZpeGluZy5cblxuICAvLyBUT0RPKGZlbGl4OGEpOiBcIjxzY3JpcHQ+ICYmICYmICYmIC4uLiA8XFwvc2NyaXB0PlwiIGlzIHNsb3dlciBvbiBhbGxcbiAgLy8gYnJvd3NlcnMuICBUaGUgaG90c3BvdCBpcyBodG1sU3BsaXQuXG5cbiAgLy8gVE9ETyhmZWxpeDhhKTogXCI8cCB0aXRsZT0nPj4+Pi4uLic+PFxcL3A+XCIgaXMgc2xvd2VyIG9uIGFsbCBicm93c2Vycy5cbiAgLy8gVGhpcyBpcyBwYXJ0bHkgaHRtbFNwbGl0LCBidXQgdGhlIGhvdHNwb3QgaXMgcGFyc2VUYWdBbmRBdHRycy5cblxuICAvLyBUT0RPKGZlbGl4OGEpOiBcIjxhPjxcXC9hPjxhPjxcXC9hPi4uLlwiIGlzIHNsb3dlciBvbiBJRTkuXG4gIC8vIFwiPGE+MTxcXC9hPjxhPjE8XFwvYT4uLi5cIiBpcyBmYXN0ZXIsIFwiPGE+PFxcL2E+MjxhPjxcXC9hPjIuLi5cIiBpcyBmYXN0ZXIuXG5cbiAgLy8gVE9ETyhmZWxpeDhhKTogXCI8cDxwPHAuLi5cIiBpcyBzbG93ZXIgb24gSUVbNi04XVxuXG4gIHZhciBjb250aW51YXRpb25NYXJrZXIgPSB7fTtcbiAgZnVuY3Rpb24gcGFyc2UoaHRtbFRleHQsIGhhbmRsZXIsIHBhcmFtKSB7XG4gICAgdmFyIG0sIHAsIHRhZ05hbWU7XG4gICAgdmFyIHBhcnRzID0gaHRtbFNwbGl0KGh0bWxUZXh0KTtcbiAgICB2YXIgc3RhdGUgPSB7XG4gICAgICBub01vcmVHVDogZmFsc2UsXG4gICAgICBub01vcmVFbmRDb21tZW50czogZmFsc2VcbiAgICB9O1xuICAgIHBhcnNlQ1BTKGhhbmRsZXIsIHBhcnRzLCAwLCBzdGF0ZSwgcGFyYW0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY29udGludWF0aW9uTWFrZXIoaCwgcGFydHMsIGluaXRpYWwsIHN0YXRlLCBwYXJhbSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBwYXJzZUNQUyhoLCBwYXJ0cywgaW5pdGlhbCwgc3RhdGUsIHBhcmFtKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VDUFMoaCwgcGFydHMsIGluaXRpYWwsIHN0YXRlLCBwYXJhbSkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoaC5zdGFydERvYyAmJiBpbml0aWFsID09IDApIHsgaC5zdGFydERvYyhwYXJhbSk7IH1cbiAgICAgIHZhciBtLCBwLCB0YWdOYW1lO1xuICAgICAgZm9yICh2YXIgcG9zID0gaW5pdGlhbCwgZW5kID0gcGFydHMubGVuZ3RoOyBwb3MgPCBlbmQ7KSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gcGFydHNbcG9zKytdO1xuICAgICAgICB2YXIgbmV4dCA9IHBhcnRzW3Bvc107XG4gICAgICAgIHN3aXRjaCAoY3VycmVudCkge1xuICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICBpZiAoRU5USVRZX1JFXzIudGVzdChuZXh0KSkge1xuICAgICAgICAgICAgaWYgKGgucGNkYXRhKSB7XG4gICAgICAgICAgICAgIGgucGNkYXRhKCcmJyArIG5leHQsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsXG4gICAgICAgICAgICAgICAgY29udGludWF0aW9uTWFrZXIoaCwgcGFydHMsIHBvcywgc3RhdGUsIHBhcmFtKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3MrKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGgucGNkYXRhKSB7IGgucGNkYXRhKFwiJmFtcDtcIiwgcGFyYW0sIGNvbnRpbnVhdGlvbk1hcmtlcixcbiAgICAgICAgICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgcG9zLCBzdGF0ZSwgcGFyYW0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJzxcXC8nOlxuICAgICAgICAgIGlmIChtID0gL14oWy1cXHc6XSspW15cXCdcXFwiXSovLmV4ZWMobmV4dCkpIHtcbiAgICAgICAgICAgIGlmIChtWzBdLmxlbmd0aCA9PT0gbmV4dC5sZW5ndGggJiYgcGFydHNbcG9zICsgMV0gPT09ICc+Jykge1xuICAgICAgICAgICAgICAvLyBmYXN0IGNhc2UsIG5vIGF0dHJpYnV0ZSBwYXJzaW5nIG5lZWRlZFxuICAgICAgICAgICAgICBwb3MgKz0gMjtcbiAgICAgICAgICAgICAgdGFnTmFtZSA9IG1bMV0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgaWYgKGguZW5kVGFnKSB7XG4gICAgICAgICAgICAgICAgaC5lbmRUYWcodGFnTmFtZSwgcGFyYW0sIGNvbnRpbnVhdGlvbk1hcmtlcixcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCBwb3MsIHN0YXRlLCBwYXJhbSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBzbG93IGNhc2UsIG5lZWQgdG8gcGFyc2UgYXR0cmlidXRlc1xuICAgICAgICAgICAgICAvLyBUT0RPKGZlbGl4OGEpOiBkbyB3ZSByZWFsbHkgY2FyZSBhYm91dCBtaXNwYXJzaW5nIHRoaXM/XG4gICAgICAgICAgICAgIHBvcyA9IHBhcnNlRW5kVGFnKFxuICAgICAgICAgICAgICAgIHBhcnRzLCBwb3MsIGgsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsIHN0YXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGgucGNkYXRhKSB7XG4gICAgICAgICAgICAgIGgucGNkYXRhKCcmbHQ7LycsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsXG4gICAgICAgICAgICAgICAgY29udGludWF0aW9uTWFrZXIoaCwgcGFydHMsIHBvcywgc3RhdGUsIHBhcmFtKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICBpZiAobSA9IC9eKFstXFx3Ol0rKVxccypcXC8/Ly5leGVjKG5leHQpKSB7XG4gICAgICAgICAgICBpZiAobVswXS5sZW5ndGggPT09IG5leHQubGVuZ3RoICYmIHBhcnRzW3BvcyArIDFdID09PSAnPicpIHtcbiAgICAgICAgICAgICAgLy8gZmFzdCBjYXNlLCBubyBhdHRyaWJ1dGUgcGFyc2luZyBuZWVkZWRcbiAgICAgICAgICAgICAgcG9zICs9IDI7XG4gICAgICAgICAgICAgIHRhZ05hbWUgPSBtWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgIGlmIChoLnN0YXJ0VGFnKSB7XG4gICAgICAgICAgICAgICAgaC5zdGFydFRhZyh0YWdOYW1lLCBbXSwgcGFyYW0sIGNvbnRpbnVhdGlvbk1hcmtlcixcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCBwb3MsIHN0YXRlLCBwYXJhbSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIHRhZ3MgbGlrZSA8c2NyaXB0PiBhbmQgPHRleHRhcmVhPiBoYXZlIHNwZWNpYWwgcGFyc2luZ1xuICAgICAgICAgICAgICB2YXIgZWZsYWdzID0gaHRtbDQuRUxFTUVOVFNbdGFnTmFtZV07XG4gICAgICAgICAgICAgIGlmIChlZmxhZ3MgJiBFRkxBR1NfVEVYVCkge1xuICAgICAgICAgICAgICAgIHZhciB0YWcgPSB7IG5hbWU6IHRhZ05hbWUsIG5leHQ6IHBvcywgZWZsYWdzOiBlZmxhZ3MgfTtcbiAgICAgICAgICAgICAgICBwb3MgPSBwYXJzZVRleHQoXG4gICAgICAgICAgICAgICAgICBwYXJ0cywgdGFnLCBoLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLCBzdGF0ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIHNsb3cgY2FzZSwgbmVlZCB0byBwYXJzZSBhdHRyaWJ1dGVzXG4gICAgICAgICAgICAgIHBvcyA9IHBhcnNlU3RhcnRUYWcoXG4gICAgICAgICAgICAgICAgcGFydHMsIHBvcywgaCwgcGFyYW0sIGNvbnRpbnVhdGlvbk1hcmtlciwgc3RhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaC5wY2RhdGEpIHtcbiAgICAgICAgICAgICAgaC5wY2RhdGEoJyZsdDsnLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLFxuICAgICAgICAgICAgICAgIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCBwb3MsIHN0YXRlLCBwYXJhbSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnPFxcIS0tJzpcbiAgICAgICAgICAvLyBUaGUgcGF0aG9sb2dpY2FsIGNhc2UgaXMgbiBjb3BpZXMgb2YgJzxcXCEtLScgd2l0aG91dCAnLS0+JywgYW5kXG4gICAgICAgICAgLy8gcmVwZWF0ZWQgZmFpbHVyZSB0byBmaW5kICctLT4nIGlzIHF1YWRyYXRpYy4gIFdlIGF2b2lkIHRoYXQgYnlcbiAgICAgICAgICAvLyByZW1lbWJlcmluZyB3aGVuIHNlYXJjaCBmb3IgJy0tPicgZmFpbHMuXG4gICAgICAgICAgaWYgKCFzdGF0ZS5ub01vcmVFbmRDb21tZW50cykge1xuICAgICAgICAgICAgLy8gQSBjb21tZW50IDxcXCEtLXgtLT4gaXMgc3BsaXQgaW50byB0aHJlZSB0b2tlbnM6XG4gICAgICAgICAgICAvLyAgICc8XFwhLS0nLCAneC0tJywgJz4nXG4gICAgICAgICAgICAvLyBXZSB3YW50IHRvIGZpbmQgdGhlIG5leHQgJz4nIHRva2VuIHRoYXQgaGFzIGEgcHJlY2VkaW5nICctLScuXG4gICAgICAgICAgICAvLyBwb3MgaXMgYXQgdGhlICd4LS0nLlxuICAgICAgICAgICAgZm9yIChwID0gcG9zICsgMTsgcCA8IGVuZDsgcCsrKSB7XG4gICAgICAgICAgICAgIGlmIChwYXJ0c1twXSA9PT0gJz4nICYmIC8tLSQvLnRlc3QocGFydHNbcCAtIDFdKSkgeyBicmVhazsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHAgPCBlbmQpIHtcbiAgICAgICAgICAgICAgaWYgKGguY29tbWVudCkge1xuICAgICAgICAgICAgICAgIHZhciBjb21tZW50ID0gcGFydHMuc2xpY2UocG9zLCBwKS5qb2luKCcnKTtcbiAgICAgICAgICAgICAgICBoLmNvbW1lbnQoXG4gICAgICAgICAgICAgICAgICBjb21tZW50LnN1YnN0cigwLCBjb21tZW50Lmxlbmd0aCAtIDIpLCBwYXJhbSxcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVhdGlvbk1hcmtlcixcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCBwICsgMSwgc3RhdGUsIHBhcmFtKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcG9zID0gcCArIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdGF0ZS5ub01vcmVFbmRDb21tZW50cyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdGF0ZS5ub01vcmVFbmRDb21tZW50cykge1xuICAgICAgICAgICAgaWYgKGgucGNkYXRhKSB7XG4gICAgICAgICAgICAgIGgucGNkYXRhKCcmbHQ7IS0tJywgcGFyYW0sIGNvbnRpbnVhdGlvbk1hcmtlcixcbiAgICAgICAgICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgcG9zLCBzdGF0ZSwgcGFyYW0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJzxcXCEnOlxuICAgICAgICAgIGlmICghL15cXHcvLnRlc3QobmV4dCkpIHtcbiAgICAgICAgICAgIGlmIChoLnBjZGF0YSkge1xuICAgICAgICAgICAgICBoLnBjZGF0YSgnJmx0OyEnLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLFxuICAgICAgICAgICAgICAgIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCBwb3MsIHN0YXRlLCBwYXJhbSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzaW1pbGFyIHRvIG5vTW9yZUVuZENvbW1lbnQgbG9naWNcbiAgICAgICAgICAgIGlmICghc3RhdGUubm9Nb3JlR1QpIHtcbiAgICAgICAgICAgICAgZm9yIChwID0gcG9zICsgMTsgcCA8IGVuZDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzW3BdID09PSAnPicpIHsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAocCA8IGVuZCkge1xuICAgICAgICAgICAgICAgIHBvcyA9IHAgKyAxO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0YXRlLm5vTW9yZUdUID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0YXRlLm5vTW9yZUdUKSB7XG4gICAgICAgICAgICAgIGlmIChoLnBjZGF0YSkge1xuICAgICAgICAgICAgICAgIGgucGNkYXRhKCcmbHQ7IScsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsXG4gICAgICAgICAgICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgcG9zLCBzdGF0ZSwgcGFyYW0pKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnPD8nOlxuICAgICAgICAgIC8vIHNpbWlsYXIgdG8gbm9Nb3JlRW5kQ29tbWVudCBsb2dpY1xuICAgICAgICAgIGlmICghc3RhdGUubm9Nb3JlR1QpIHtcbiAgICAgICAgICAgIGZvciAocCA9IHBvcyArIDE7IHAgPCBlbmQ7IHArKykge1xuICAgICAgICAgICAgICBpZiAocGFydHNbcF0gPT09ICc+JykgeyBicmVhazsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHAgPCBlbmQpIHtcbiAgICAgICAgICAgICAgcG9zID0gcCArIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdGF0ZS5ub01vcmVHVCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdGF0ZS5ub01vcmVHVCkge1xuICAgICAgICAgICAgaWYgKGgucGNkYXRhKSB7XG4gICAgICAgICAgICAgIGgucGNkYXRhKCcmbHQ7PycsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsXG4gICAgICAgICAgICAgICAgY29udGludWF0aW9uTWFrZXIoaCwgcGFydHMsIHBvcywgc3RhdGUsIHBhcmFtKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICBpZiAoaC5wY2RhdGEpIHtcbiAgICAgICAgICAgIGgucGNkYXRhKFwiJmd0O1wiLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLFxuICAgICAgICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgcG9zLCBzdGF0ZSwgcGFyYW0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJyc6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKGgucGNkYXRhKSB7XG4gICAgICAgICAgICBoLnBjZGF0YShjdXJyZW50LCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLFxuICAgICAgICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgcG9zLCBzdGF0ZSwgcGFyYW0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChoLmVuZERvYykgeyBoLmVuZERvYyhwYXJhbSk7IH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSAhPT0gY29udGludWF0aW9uTWFya2VyKSB7IHRocm93IGU7IH1cbiAgICB9XG4gIH1cblxuICAvLyBTcGxpdCBzdHIgaW50byBwYXJ0cyBmb3IgdGhlIGh0bWwgcGFyc2VyLlxuICBmdW5jdGlvbiBodG1sU3BsaXQoc3RyKSB7XG4gICAgLy8gY2FuJ3QgaG9pc3QgdGhpcyBvdXQgb2YgdGhlIGZ1bmN0aW9uIGJlY2F1c2Ugb2YgdGhlIHJlLmV4ZWMgbG9vcC5cbiAgICB2YXIgcmUgPSAvKDxcXC98PFxcIS0tfDxbIT9dfFsmPD5dKS9nO1xuICAgIHN0ciArPSAnJztcbiAgICBpZiAoc3BsaXRXaWxsQ2FwdHVyZSkge1xuICAgICAgcmV0dXJuIHN0ci5zcGxpdChyZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBwYXJ0cyA9IFtdO1xuICAgICAgdmFyIGxhc3RQb3MgPSAwO1xuICAgICAgdmFyIG07XG4gICAgICB3aGlsZSAoKG0gPSByZS5leGVjKHN0cikpICE9PSBudWxsKSB7XG4gICAgICAgIHBhcnRzLnB1c2goc3RyLnN1YnN0cmluZyhsYXN0UG9zLCBtLmluZGV4KSk7XG4gICAgICAgIHBhcnRzLnB1c2gobVswXSk7XG4gICAgICAgIGxhc3RQb3MgPSBtLmluZGV4ICsgbVswXS5sZW5ndGg7XG4gICAgICB9XG4gICAgICBwYXJ0cy5wdXNoKHN0ci5zdWJzdHJpbmcobGFzdFBvcykpO1xuICAgICAgcmV0dXJuIHBhcnRzO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlRW5kVGFnKHBhcnRzLCBwb3MsIGgsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsIHN0YXRlKSB7XG4gICAgdmFyIHRhZyA9IHBhcnNlVGFnQW5kQXR0cnMocGFydHMsIHBvcyk7XG4gICAgLy8gZHJvcCB1bmNsb3NlZCB0YWdzXG4gICAgaWYgKCF0YWcpIHsgcmV0dXJuIHBhcnRzLmxlbmd0aDsgfVxuICAgIGlmIChoLmVuZFRhZykge1xuICAgICAgaC5lbmRUYWcodGFnLm5hbWUsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsXG4gICAgICAgIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCBwb3MsIHN0YXRlLCBwYXJhbSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGFnLm5leHQ7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVN0YXJ0VGFnKHBhcnRzLCBwb3MsIGgsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsIHN0YXRlKSB7XG4gICAgdmFyIHRhZyA9IHBhcnNlVGFnQW5kQXR0cnMocGFydHMsIHBvcyk7XG4gICAgLy8gZHJvcCB1bmNsb3NlZCB0YWdzXG4gICAgaWYgKCF0YWcpIHsgcmV0dXJuIHBhcnRzLmxlbmd0aDsgfVxuICAgIGlmIChoLnN0YXJ0VGFnKSB7XG4gICAgICBoLnN0YXJ0VGFnKHRhZy5uYW1lLCB0YWcuYXR0cnMsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsXG4gICAgICAgIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCB0YWcubmV4dCwgc3RhdGUsIHBhcmFtKSk7XG4gICAgfVxuICAgIC8vIHRhZ3MgbGlrZSA8c2NyaXB0PiBhbmQgPHRleHRhcmVhPiBoYXZlIHNwZWNpYWwgcGFyc2luZ1xuICAgIGlmICh0YWcuZWZsYWdzICYgRUZMQUdTX1RFWFQpIHtcbiAgICAgIHJldHVybiBwYXJzZVRleHQocGFydHMsIHRhZywgaCwgcGFyYW0sIGNvbnRpbnVhdGlvbk1hcmtlciwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGFnLm5leHQ7XG4gICAgfVxuICB9XG5cbiAgdmFyIGVuZFRhZ1JlID0ge307XG5cbiAgLy8gVGFncyBsaWtlIDxzY3JpcHQ+IGFuZCA8dGV4dGFyZWE+IGFyZSBmbGFnZ2VkIGFzIENEQVRBIG9yIFJDREFUQSxcbiAgLy8gd2hpY2ggbWVhbnMgZXZlcnl0aGluZyBpcyB0ZXh0IHVudGlsIHdlIHNlZSB0aGUgY29ycmVjdCBjbG9zaW5nIHRhZy5cbiAgZnVuY3Rpb24gcGFyc2VUZXh0KHBhcnRzLCB0YWcsIGgsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsIHN0YXRlKSB7XG4gICAgdmFyIGVuZCA9IHBhcnRzLmxlbmd0aDtcbiAgICBpZiAoIWVuZFRhZ1JlLmhhc093blByb3BlcnR5KHRhZy5uYW1lKSkge1xuICAgICAgZW5kVGFnUmVbdGFnLm5hbWVdID0gbmV3IFJlZ0V4cCgnXicgKyB0YWcubmFtZSArICcoPzpbXFxcXHNcXFxcL118JCknLCAnaScpO1xuICAgIH1cbiAgICB2YXIgcmUgPSBlbmRUYWdSZVt0YWcubmFtZV07XG4gICAgdmFyIGZpcnN0ID0gdGFnLm5leHQ7XG4gICAgdmFyIHAgPSB0YWcubmV4dCArIDE7XG4gICAgZm9yICg7IHAgPCBlbmQ7IHArKykge1xuICAgICAgaWYgKHBhcnRzW3AgLSAxXSA9PT0gJzxcXC8nICYmIHJlLnRlc3QocGFydHNbcF0pKSB7IGJyZWFrOyB9XG4gICAgfVxuICAgIGlmIChwIDwgZW5kKSB7IHAgLT0gMTsgfVxuICAgIHZhciBidWYgPSBwYXJ0cy5zbGljZShmaXJzdCwgcCkuam9pbignJyk7XG4gICAgaWYgKHRhZy5lZmxhZ3MgJiBodG1sNC5lZmxhZ3NbJ0NEQVRBJ10pIHtcbiAgICAgIGlmIChoLmNkYXRhKSB7XG4gICAgICAgIGguY2RhdGEoYnVmLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLFxuICAgICAgICAgIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCBwLCBzdGF0ZSwgcGFyYW0pKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRhZy5lZmxhZ3MgJiBodG1sNC5lZmxhZ3NbJ1JDREFUQSddKSB7XG4gICAgICBpZiAoaC5yY2RhdGEpIHtcbiAgICAgICAgaC5yY2RhdGEobm9ybWFsaXplUkNEYXRhKGJ1ZiksIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsXG4gICAgICAgICAgY29udGludWF0aW9uTWFrZXIoaCwgcGFydHMsIHAsIHN0YXRlLCBwYXJhbSkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2J1ZycpO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfVxuXG4gIC8vIGF0IHRoaXMgcG9pbnQsIHBhcnRzW3Bvcy0xXSBpcyBlaXRoZXIgXCI8XCIgb3IgXCI8XFwvXCIuXG4gIGZ1bmN0aW9uIHBhcnNlVGFnQW5kQXR0cnMocGFydHMsIHBvcykge1xuICAgIHZhciBtID0gL14oWy1cXHc6XSspLy5leGVjKHBhcnRzW3Bvc10pO1xuICAgIHZhciB0YWcgPSB7fTtcbiAgICB0YWcubmFtZSA9IG1bMV0udG9Mb3dlckNhc2UoKTtcbiAgICB0YWcuZWZsYWdzID0gaHRtbDQuRUxFTUVOVFNbdGFnLm5hbWVdO1xuICAgIHZhciBidWYgPSBwYXJ0c1twb3NdLnN1YnN0cihtWzBdLmxlbmd0aCk7XG4gICAgLy8gRmluZCB0aGUgbmV4dCAnPicuICBXZSBvcHRpbWlzdGljYWxseSBhc3N1bWUgdGhpcyAnPicgaXMgbm90IGluIGFcbiAgICAvLyBxdW90ZWQgY29udGV4dCwgYW5kIGZ1cnRoZXIgZG93biB3ZSBmaXggdGhpbmdzIHVwIGlmIGl0IHR1cm5zIG91dCB0b1xuICAgIC8vIGJlIHF1b3RlZC5cbiAgICB2YXIgcCA9IHBvcyArIDE7XG4gICAgdmFyIGVuZCA9IHBhcnRzLmxlbmd0aDtcbiAgICBmb3IgKDsgcCA8IGVuZDsgcCsrKSB7XG4gICAgICBpZiAocGFydHNbcF0gPT09ICc+JykgeyBicmVhazsgfVxuICAgICAgYnVmICs9IHBhcnRzW3BdO1xuICAgIH1cbiAgICBpZiAoZW5kIDw9IHApIHsgcmV0dXJuIHZvaWQgMDsgfVxuICAgIHZhciBhdHRycyA9IFtdO1xuICAgIHdoaWxlIChidWYgIT09ICcnKSB7XG4gICAgICBtID0gQVRUUl9SRS5leGVjKGJ1Zik7XG4gICAgICBpZiAoIW0pIHtcbiAgICAgICAgLy8gTm8gYXR0cmlidXRlIGZvdW5kOiBza2lwIGdhcmJhZ2VcbiAgICAgICAgYnVmID0gYnVmLnJlcGxhY2UoL15bXFxzXFxTXVteYS16XFxzXSovLCAnJyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoKG1bNF0gJiYgIW1bNV0pIHx8IChtWzZdICYmICFtWzddKSkge1xuICAgICAgICAvLyBVbnRlcm1pbmF0ZWQgcXVvdGU6IHNsdXJwIHRvIHRoZSBuZXh0IHVucXVvdGVkICc+J1xuICAgICAgICB2YXIgcXVvdGUgPSBtWzRdIHx8IG1bNl07XG4gICAgICAgIHZhciBzYXdRdW90ZSA9IGZhbHNlO1xuICAgICAgICB2YXIgYWJ1ZiA9IFtidWYsIHBhcnRzW3ArK11dO1xuICAgICAgICBmb3IgKDsgcCA8IGVuZDsgcCsrKSB7XG4gICAgICAgICAgaWYgKHNhd1F1b3RlKSB7XG4gICAgICAgICAgICBpZiAocGFydHNbcF0gPT09ICc+JykgeyBicmVhazsgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoMCA8PSBwYXJ0c1twXS5pbmRleE9mKHF1b3RlKSkge1xuICAgICAgICAgICAgc2F3UXVvdGUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhYnVmLnB1c2gocGFydHNbcF0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNsdXJwIGZhaWxlZDogbG9zZSB0aGUgZ2FyYmFnZVxuICAgICAgICBpZiAoZW5kIDw9IHApIHsgYnJlYWs7IH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlIHJldHJ5IGF0dHJpYnV0ZSBwYXJzaW5nXG4gICAgICAgIGJ1ZiA9IGFidWYuam9pbignJyk7XG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBoYXZlIGFuIGF0dHJpYnV0ZVxuICAgICAgICB2YXIgYU5hbWUgPSBtWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHZhciBhVmFsdWUgPSBtWzJdID8gZGVjb2RlVmFsdWUobVszXSkgOiAnJztcbiAgICAgICAgYXR0cnMucHVzaChhTmFtZSwgYVZhbHVlKTtcbiAgICAgICAgYnVmID0gYnVmLnN1YnN0cihtWzBdLmxlbmd0aCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRhZy5hdHRycyA9IGF0dHJzO1xuICAgIHRhZy5uZXh0ID0gcCArIDE7XG4gICAgcmV0dXJuIHRhZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZVZhbHVlKHYpIHtcbiAgICB2YXIgcSA9IHYuY2hhckNvZGVBdCgwKTtcbiAgICBpZiAocSA9PT0gMHgyMiB8fCBxID09PSAweDI3KSB7IC8vIFwiIG9yICdcbiAgICAgIHYgPSB2LnN1YnN0cigxLCB2Lmxlbmd0aCAtIDIpO1xuICAgIH1cbiAgICByZXR1cm4gdW5lc2NhcGVFbnRpdGllcyhzdHJpcE5VTHModikpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHN0cmlwcyB1bnNhZmUgdGFncyBhbmQgYXR0cmlidXRlcyBmcm9tIGh0bWwuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oc3RyaW5nLCBBcnJheS48c3RyaW5nPik6ID9BcnJheS48c3RyaW5nPn0gdGFnUG9saWN5XG4gICAqICAgICBBIGZ1bmN0aW9uIHRoYXQgdGFrZXMgKHRhZ05hbWUsIGF0dHJpYnNbXSksIHdoZXJlIHRhZ05hbWUgaXMgYSBrZXkgaW5cbiAgICogICAgIGh0bWw0LkVMRU1FTlRTIGFuZCBhdHRyaWJzIGlzIGFuIGFycmF5IG9mIGFsdGVybmF0aW5nIGF0dHJpYnV0ZSBuYW1lc1xuICAgKiAgICAgYW5kIHZhbHVlcy4gIEl0IHNob3VsZCByZXR1cm4gYSByZWNvcmQgKGFzIGZvbGxvd3MpLCBvciBudWxsIHRvIGRlbGV0ZVxuICAgKiAgICAgdGhlIGVsZW1lbnQuICBJdCdzIG9rYXkgZm9yIHRhZ1BvbGljeSB0byBtb2RpZnkgdGhlIGF0dHJpYnMgYXJyYXksXG4gICAqICAgICBidXQgdGhlIHNhbWUgYXJyYXkgaXMgcmV1c2VkLCBzbyBpdCBzaG91bGQgbm90IGJlIGhlbGQgYmV0d2VlbiBjYWxscy5cbiAgICogICAgIFJlY29yZCBrZXlzOlxuICAgKiAgICAgICAgYXR0cmliczogKHJlcXVpcmVkKSBTYW5pdGl6ZWQgYXR0cmlidXRlcyBhcnJheS5cbiAgICogICAgICAgIHRhZ05hbWU6IFJlcGxhY2VtZW50IHRhZyBuYW1lLlxuICAgKiBAcmV0dXJuIHtmdW5jdGlvbihzdHJpbmcsIEFycmF5KX0gQSBmdW5jdGlvbiB0aGF0IHNhbml0aXplcyBhIHN0cmluZyBvZlxuICAgKiAgICAgSFRNTCBhbmQgYXBwZW5kcyByZXN1bHQgc3RyaW5ncyB0byB0aGUgc2Vjb25kIGFyZ3VtZW50LCBhbiBhcnJheS5cbiAgICovXG4gIGZ1bmN0aW9uIG1ha2VIdG1sU2FuaXRpemVyKHRhZ1BvbGljeSkge1xuICAgIHZhciBzdGFjaztcbiAgICB2YXIgaWdub3Jpbmc7XG4gICAgdmFyIGVtaXQgPSBmdW5jdGlvbiAodGV4dCwgb3V0KSB7XG4gICAgICBpZiAoIWlnbm9yaW5nKSB7IG91dC5wdXNoKHRleHQpOyB9XG4gICAgfTtcbiAgICByZXR1cm4gbWFrZVNheFBhcnNlcih7XG4gICAgICAnc3RhcnREb2MnOiBmdW5jdGlvbihfKSB7XG4gICAgICAgIHN0YWNrID0gW107XG4gICAgICAgIGlnbm9yaW5nID0gZmFsc2U7XG4gICAgICB9LFxuICAgICAgJ3N0YXJ0VGFnJzogZnVuY3Rpb24odGFnTmFtZU9yaWcsIGF0dHJpYnMsIG91dCkge1xuICAgICAgICBpZiAoaWdub3JpbmcpIHsgcmV0dXJuOyB9XG4gICAgICAgIGlmICghaHRtbDQuRUxFTUVOVFMuaGFzT3duUHJvcGVydHkodGFnTmFtZU9yaWcpKSB7IHJldHVybjsgfVxuICAgICAgICB2YXIgZWZsYWdzT3JpZyA9IGh0bWw0LkVMRU1FTlRTW3RhZ05hbWVPcmlnXTtcbiAgICAgICAgaWYgKGVmbGFnc09yaWcgJiBodG1sNC5lZmxhZ3NbJ0ZPTERBQkxFJ10pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGVjaXNpb24gPSB0YWdQb2xpY3kodGFnTmFtZU9yaWcsIGF0dHJpYnMpO1xuICAgICAgICBpZiAoIWRlY2lzaW9uKSB7XG4gICAgICAgICAgaWdub3JpbmcgPSAhKGVmbGFnc09yaWcgJiBodG1sNC5lZmxhZ3NbJ0VNUFRZJ10pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGVjaXNpb24gIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd0YWdQb2xpY3kgZGlkIG5vdCByZXR1cm4gb2JqZWN0IChvbGQgQVBJPyknKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoJ2F0dHJpYnMnIGluIGRlY2lzaW9uKSB7XG4gICAgICAgICAgYXR0cmlicyA9IGRlY2lzaW9uWydhdHRyaWJzJ107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd0YWdQb2xpY3kgZ2F2ZSBubyBhdHRyaWJzJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVmbGFnc1JlcDtcbiAgICAgICAgdmFyIHRhZ05hbWVSZXA7XG4gICAgICAgIGlmICgndGFnTmFtZScgaW4gZGVjaXNpb24pIHtcbiAgICAgICAgICB0YWdOYW1lUmVwID0gZGVjaXNpb25bJ3RhZ05hbWUnXTtcbiAgICAgICAgICBlZmxhZ3NSZXAgPSBodG1sNC5FTEVNRU5UU1t0YWdOYW1lUmVwXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YWdOYW1lUmVwID0gdGFnTmFtZU9yaWc7XG4gICAgICAgICAgZWZsYWdzUmVwID0gZWZsYWdzT3JpZztcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPKG1pa2VzYW11ZWwpOiByZWx5aW5nIG9uIHRhZ1BvbGljeSBub3QgdG8gaW5zZXJ0IHVuc2FmZVxuICAgICAgICAvLyBhdHRyaWJ1dGUgbmFtZXMuXG5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhbiBvcHRpb25hbC1lbmQtdGFnIGVsZW1lbnQgYW5kIGVpdGhlciB0aGlzIGVsZW1lbnQgb3IgaXRzXG4gICAgICAgIC8vIHByZXZpb3VzIGxpa2Ugc2libGluZyB3YXMgcmV3cml0dGVuLCB0aGVuIGluc2VydCBhIGNsb3NlIHRhZyB0b1xuICAgICAgICAvLyBwcmVzZXJ2ZSBzdHJ1Y3R1cmUuXG4gICAgICAgIGlmIChlZmxhZ3NPcmlnICYgaHRtbDQuZWZsYWdzWydPUFRJT05BTF9FTkRUQUcnXSkge1xuICAgICAgICAgIHZhciBvblN0YWNrID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgICAgaWYgKG9uU3RhY2sgJiYgb25TdGFjay5vcmlnID09PSB0YWdOYW1lT3JpZyAmJlxuICAgICAgICAgICAgICAob25TdGFjay5yZXAgIT09IHRhZ05hbWVSZXAgfHwgdGFnTmFtZU9yaWcgIT09IHRhZ05hbWVSZXApKSB7XG4gICAgICAgICAgICAgICAgb3V0LnB1c2goJzxcXC8nLCBvblN0YWNrLnJlcCwgJz4nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIShlZmxhZ3NPcmlnICYgaHRtbDQuZWZsYWdzWydFTVBUWSddKSkge1xuICAgICAgICAgIHN0YWNrLnB1c2goe29yaWc6IHRhZ05hbWVPcmlnLCByZXA6IHRhZ05hbWVSZXB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG91dC5wdXNoKCc8JywgdGFnTmFtZVJlcCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gYXR0cmlicy5sZW5ndGg7IGkgPCBuOyBpICs9IDIpIHtcbiAgICAgICAgICB2YXIgYXR0cmliTmFtZSA9IGF0dHJpYnNbaV0sXG4gICAgICAgICAgICAgIHZhbHVlID0gYXR0cmlic1tpICsgMV07XG4gICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgIG91dC5wdXNoKCcgJywgYXR0cmliTmFtZSwgJz1cIicsIGVzY2FwZUF0dHJpYih2YWx1ZSksICdcIicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvdXQucHVzaCgnPicpO1xuXG4gICAgICAgIGlmICgoZWZsYWdzT3JpZyAmIGh0bWw0LmVmbGFnc1snRU1QVFknXSlcbiAgICAgICAgICAgICYmICEoZWZsYWdzUmVwICYgaHRtbDQuZWZsYWdzWydFTVBUWSddKSkge1xuICAgICAgICAgIC8vIHJlcGxhY2VtZW50IGlzIG5vbi1lbXB0eSwgc3ludGhlc2l6ZSBlbmQgdGFnXG4gICAgICAgICAgb3V0LnB1c2goJzxcXC8nLCB0YWdOYW1lUmVwLCAnPicpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgJ2VuZFRhZyc6IGZ1bmN0aW9uKHRhZ05hbWUsIG91dCkge1xuICAgICAgICBpZiAoaWdub3JpbmcpIHtcbiAgICAgICAgICBpZ25vcmluZyA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWh0bWw0LkVMRU1FTlRTLmhhc093blByb3BlcnR5KHRhZ05hbWUpKSB7IHJldHVybjsgfVxuICAgICAgICB2YXIgZWZsYWdzID0gaHRtbDQuRUxFTUVOVFNbdGFnTmFtZV07XG4gICAgICAgIGlmICghKGVmbGFncyAmIChodG1sNC5lZmxhZ3NbJ0VNUFRZJ10gfCBodG1sNC5lZmxhZ3NbJ0ZPTERBQkxFJ10pKSkge1xuICAgICAgICAgIHZhciBpbmRleDtcbiAgICAgICAgICBpZiAoZWZsYWdzICYgaHRtbDQuZWZsYWdzWydPUFRJT05BTF9FTkRUQUcnXSkge1xuICAgICAgICAgICAgZm9yIChpbmRleCA9IHN0YWNrLmxlbmd0aDsgLS1pbmRleCA+PSAwOykge1xuICAgICAgICAgICAgICB2YXIgc3RhY2tFbE9yaWdUYWcgPSBzdGFja1tpbmRleF0ub3JpZztcbiAgICAgICAgICAgICAgaWYgKHN0YWNrRWxPcmlnVGFnID09PSB0YWdOYW1lKSB7IGJyZWFrOyB9XG4gICAgICAgICAgICAgIGlmICghKGh0bWw0LkVMRU1FTlRTW3N0YWNrRWxPcmlnVGFnXSAmXG4gICAgICAgICAgICAgICAgICAgIGh0bWw0LmVmbGFnc1snT1BUSU9OQUxfRU5EVEFHJ10pKSB7XG4gICAgICAgICAgICAgICAgLy8gRG9uJ3QgcG9wIG5vbiBvcHRpb25hbCBlbmQgdGFncyBsb29raW5nIGZvciBhIG1hdGNoLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGluZGV4ID0gc3RhY2subGVuZ3RoOyAtLWluZGV4ID49IDA7KSB7XG4gICAgICAgICAgICAgIGlmIChzdGFja1tpbmRleF0ub3JpZyA9PT0gdGFnTmFtZSkgeyBicmVhazsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaW5kZXggPCAwKSB7IHJldHVybjsgfSAgLy8gTm90IG9wZW5lZC5cbiAgICAgICAgICBmb3IgKHZhciBpID0gc3RhY2subGVuZ3RoOyAtLWkgPiBpbmRleDspIHtcbiAgICAgICAgICAgIHZhciBzdGFja0VsUmVwVGFnID0gc3RhY2tbaV0ucmVwO1xuICAgICAgICAgICAgaWYgKCEoaHRtbDQuRUxFTUVOVFNbc3RhY2tFbFJlcFRhZ10gJlxuICAgICAgICAgICAgICAgICAgaHRtbDQuZWZsYWdzWydPUFRJT05BTF9FTkRUQUcnXSkpIHtcbiAgICAgICAgICAgICAgb3V0LnB1c2goJzxcXC8nLCBzdGFja0VsUmVwVGFnLCAnPicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaW5kZXggPCBzdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRhZ05hbWUgPSBzdGFja1tpbmRleF0ucmVwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdGFjay5sZW5ndGggPSBpbmRleDtcbiAgICAgICAgICBvdXQucHVzaCgnPFxcLycsIHRhZ05hbWUsICc+Jyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAncGNkYXRhJzogZW1pdCxcbiAgICAgICdyY2RhdGEnOiBlbWl0LFxuICAgICAgJ2NkYXRhJzogZW1pdCxcbiAgICAgICdlbmREb2MnOiBmdW5jdGlvbihvdXQpIHtcbiAgICAgICAgZm9yICg7IHN0YWNrLmxlbmd0aDsgc3RhY2subGVuZ3RoLS0pIHtcbiAgICAgICAgICBvdXQucHVzaCgnPFxcLycsIHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdLnJlcCwgJz4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdmFyIEFMTE9XRURfVVJJX1NDSEVNRVMgPSAvXig/Omh0dHBzP3xtYWlsdG98ZGF0YSkkL2k7XG5cbiAgZnVuY3Rpb24gc2FmZVVyaSh1cmksIGVmZmVjdCwgbHR5cGUsIGhpbnRzLCBuYWl2ZVVyaVJld3JpdGVyKSB7XG4gICAgaWYgKCFuYWl2ZVVyaVJld3JpdGVyKSB7IHJldHVybiBudWxsOyB9XG4gICAgdHJ5IHtcbiAgICAgIHZhciBwYXJzZWQgPSBVUkkucGFyc2UoJycgKyB1cmkpO1xuICAgICAgaWYgKHBhcnNlZCkge1xuICAgICAgICBpZiAoIXBhcnNlZC5oYXNTY2hlbWUoKSB8fFxuICAgICAgICAgICAgQUxMT1dFRF9VUklfU0NIRU1FUy50ZXN0KHBhcnNlZC5nZXRTY2hlbWUoKSkpIHtcbiAgICAgICAgICB2YXIgc2FmZSA9IG5haXZlVXJpUmV3cml0ZXIocGFyc2VkLCBlZmZlY3QsIGx0eXBlLCBoaW50cyk7XG4gICAgICAgICAgcmV0dXJuIHNhZmUgPyBzYWZlLnRvU3RyaW5nKCkgOiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9nKGxvZ2dlciwgdGFnTmFtZSwgYXR0cmliTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgaWYgKCFhdHRyaWJOYW1lKSB7XG4gICAgICBsb2dnZXIodGFnTmFtZSArIFwiIHJlbW92ZWRcIiwge1xuICAgICAgICBjaGFuZ2U6IFwicmVtb3ZlZFwiLFxuICAgICAgICB0YWdOYW1lOiB0YWdOYW1lXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgdmFyIGNoYW5nZWQgPSBcImNoYW5nZWRcIjtcbiAgICAgIGlmIChvbGRWYWx1ZSAmJiAhbmV3VmFsdWUpIHtcbiAgICAgICAgY2hhbmdlZCA9IFwicmVtb3ZlZFwiO1xuICAgICAgfSBlbHNlIGlmICghb2xkVmFsdWUgJiYgbmV3VmFsdWUpICB7XG4gICAgICAgIGNoYW5nZWQgPSBcImFkZGVkXCI7XG4gICAgICB9XG4gICAgICBsb2dnZXIodGFnTmFtZSArIFwiLlwiICsgYXR0cmliTmFtZSArIFwiIFwiICsgY2hhbmdlZCwge1xuICAgICAgICBjaGFuZ2U6IGNoYW5nZWQsXG4gICAgICAgIHRhZ05hbWU6IHRhZ05hbWUsXG4gICAgICAgIGF0dHJpYk5hbWU6IGF0dHJpYk5hbWUsXG4gICAgICAgIG9sZFZhbHVlOiBvbGRWYWx1ZSxcbiAgICAgICAgbmV3VmFsdWU6IG5ld1ZhbHVlXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBsb29rdXBBdHRyaWJ1dGUobWFwLCB0YWdOYW1lLCBhdHRyaWJOYW1lKSB7XG4gICAgdmFyIGF0dHJpYktleTtcbiAgICBhdHRyaWJLZXkgPSB0YWdOYW1lICsgJzo6JyArIGF0dHJpYk5hbWU7XG4gICAgaWYgKG1hcC5oYXNPd25Qcm9wZXJ0eShhdHRyaWJLZXkpKSB7XG4gICAgICByZXR1cm4gbWFwW2F0dHJpYktleV07XG4gICAgfVxuICAgIGF0dHJpYktleSA9ICcqOjonICsgYXR0cmliTmFtZTtcbiAgICBpZiAobWFwLmhhc093blByb3BlcnR5KGF0dHJpYktleSkpIHtcbiAgICAgIHJldHVybiBtYXBbYXR0cmliS2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfVxuICBmdW5jdGlvbiBnZXRBdHRyaWJ1dGVUeXBlKHRhZ05hbWUsIGF0dHJpYk5hbWUpIHtcbiAgICByZXR1cm4gbG9va3VwQXR0cmlidXRlKGh0bWw0LkFUVFJJQlMsIHRhZ05hbWUsIGF0dHJpYk5hbWUpO1xuICB9XG4gIGZ1bmN0aW9uIGdldExvYWRlclR5cGUodGFnTmFtZSwgYXR0cmliTmFtZSkge1xuICAgIHJldHVybiBsb29rdXBBdHRyaWJ1dGUoaHRtbDQuTE9BREVSVFlQRVMsIHRhZ05hbWUsIGF0dHJpYk5hbWUpO1xuICB9XG4gIGZ1bmN0aW9uIGdldFVyaUVmZmVjdCh0YWdOYW1lLCBhdHRyaWJOYW1lKSB7XG4gICAgcmV0dXJuIGxvb2t1cEF0dHJpYnV0ZShodG1sNC5VUklFRkZFQ1RTLCB0YWdOYW1lLCBhdHRyaWJOYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYW5pdGl6ZXMgYXR0cmlidXRlcyBvbiBhbiBIVE1MIHRhZy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhZ05hbWUgQW4gSFRNTCB0YWcgbmFtZSBpbiBsb3dlcmNhc2UuXG4gICAqIEBwYXJhbSB7QXJyYXkuPD9zdHJpbmc+fSBhdHRyaWJzIEFuIGFycmF5IG9mIGFsdGVybmF0aW5nIG5hbWVzIGFuZCB2YWx1ZXMuXG4gICAqIEBwYXJhbSB7P2Z1bmN0aW9uKD9zdHJpbmcpOiA/c3RyaW5nfSBvcHRfbmFpdmVVcmlSZXdyaXRlciBBIHRyYW5zZm9ybSB0b1xuICAgKiAgICAgYXBwbHkgdG8gVVJJIGF0dHJpYnV0ZXM7IGl0IGNhbiByZXR1cm4gYSBuZXcgc3RyaW5nIHZhbHVlLCBvciBudWxsIHRvXG4gICAqICAgICBkZWxldGUgdGhlIGF0dHJpYnV0ZS4gIElmIHVuc3BlY2lmaWVkLCBVUkkgYXR0cmlidXRlcyBhcmUgZGVsZXRlZC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbig/c3RyaW5nKTogP3N0cmluZ30gb3B0X25tVG9rZW5Qb2xpY3kgQSB0cmFuc2Zvcm0gdG8gYXBwbHlcbiAgICogICAgIHRvIGF0dHJpYnV0ZXMgY29udGFpbmluZyBIVE1MIG5hbWVzLCBlbGVtZW50IElEcywgYW5kIHNwYWNlLXNlcGFyYXRlZFxuICAgKiAgICAgbGlzdHMgb2YgY2xhc3NlczsgaXQgY2FuIHJldHVybiBhIG5ldyBzdHJpbmcgdmFsdWUsIG9yIG51bGwgdG8gZGVsZXRlXG4gICAqICAgICB0aGUgYXR0cmlidXRlLiAgSWYgdW5zcGVjaWZpZWQsIHRoZXNlIGF0dHJpYnV0ZXMgYXJlIGtlcHQgdW5jaGFuZ2VkLlxuICAgKiBAcmV0dXJuIHtBcnJheS48P3N0cmluZz59IFRoZSBzYW5pdGl6ZWQgYXR0cmlidXRlcyBhcyBhIGxpc3Qgb2YgYWx0ZXJuYXRpbmdcbiAgICogICAgIG5hbWVzIGFuZCB2YWx1ZXMsIHdoZXJlIGEgbnVsbCB2YWx1ZSBtZWFucyB0byBvbWl0IHRoZSBhdHRyaWJ1dGUuXG4gICAqL1xuICBmdW5jdGlvbiBzYW5pdGl6ZUF0dHJpYnModGFnTmFtZSwgYXR0cmlicyxcbiAgICBvcHRfbmFpdmVVcmlSZXdyaXRlciwgb3B0X25tVG9rZW5Qb2xpY3ksIG9wdF9sb2dnZXIpIHtcbiAgICAvLyBUT0RPKGZlbGl4OGEpOiBpdCdzIG9ibm94aW91cyB0aGF0IGRvbWFkbyBkdXBsaWNhdGVzIG11Y2ggb2YgdGhpc1xuICAgIC8vIFRPRE8oZmVsaXg4YSk6IG1heWJlIGNvbnNpc3RlbnRseSBlbmZvcmNlIGNvbnN0cmFpbnRzIGxpa2UgdGFyZ2V0PVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXR0cmlicy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgdmFyIGF0dHJpYk5hbWUgPSBhdHRyaWJzW2ldO1xuICAgICAgdmFyIHZhbHVlID0gYXR0cmlic1tpICsgMV07XG4gICAgICB2YXIgb2xkVmFsdWUgPSB2YWx1ZTtcbiAgICAgIHZhciBhdHlwZSA9IG51bGwsIGF0dHJpYktleTtcbiAgICAgIGlmICgoYXR0cmliS2V5ID0gdGFnTmFtZSArICc6OicgKyBhdHRyaWJOYW1lLFxuICAgICAgICAgICBodG1sNC5BVFRSSUJTLmhhc093blByb3BlcnR5KGF0dHJpYktleSkpIHx8XG4gICAgICAgICAgKGF0dHJpYktleSA9ICcqOjonICsgYXR0cmliTmFtZSxcbiAgICAgICAgICAgaHRtbDQuQVRUUklCUy5oYXNPd25Qcm9wZXJ0eShhdHRyaWJLZXkpKSkge1xuICAgICAgICBhdHlwZSA9IGh0bWw0LkFUVFJJQlNbYXR0cmliS2V5XTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHlwZSAhPT0gbnVsbCkge1xuICAgICAgICBzd2l0Y2ggKGF0eXBlKSB7XG4gICAgICAgICAgY2FzZSBodG1sNC5hdHlwZVsnTk9ORSddOiBicmVhaztcbiAgICAgICAgICBjYXNlIGh0bWw0LmF0eXBlWydTQ1JJUFQnXTpcbiAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChvcHRfbG9nZ2VyKSB7XG4gICAgICAgICAgICAgIGxvZyhvcHRfbG9nZ2VyLCB0YWdOYW1lLCBhdHRyaWJOYW1lLCBvbGRWYWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBodG1sNC5hdHlwZVsnU1RZTEUnXTpcbiAgICAgICAgICAgIGlmICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHBhcnNlQ3NzRGVjbGFyYXRpb25zKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgaWYgKG9wdF9sb2dnZXIpIHtcbiAgICAgICAgICAgICAgICBsb2cob3B0X2xvZ2dlciwgdGFnTmFtZSwgYXR0cmliTmFtZSwgb2xkVmFsdWUsIHZhbHVlKTtcblx0ICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzYW5pdGl6ZWREZWNsYXJhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIHBhcnNlQ3NzRGVjbGFyYXRpb25zKFxuICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uOiBmdW5jdGlvbiAocHJvcGVydHksIHRva2Vucykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9ybVByb3AgPSBwcm9wZXJ0eS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2NoZW1hID0gY3NzU2NoZW1hW25vcm1Qcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzY2hlbWEpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2FuaXRpemVDc3NQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1Qcm9wLCBzY2hlbWEsIHRva2VucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdF9uYWl2ZVVyaVJld3JpdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2FmZVVyaShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsLCBodG1sNC51ZWZmZWN0cy5TQU1FX0RPQ1VNRU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sNC5sdHlwZXMuU0FOREJPWEVELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJUWVBFXCI6IFwiQ1NTXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJDU1NfUFJPUFwiOiBub3JtUHJvcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBvcHRfbmFpdmVVcmlSZXdyaXRlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHNhbml0aXplZERlY2xhcmF0aW9ucy5wdXNoKHByb3BlcnR5ICsgJzogJyArIHRva2Vucy5qb2luKCcgJykpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFsdWUgPSBzYW5pdGl6ZWREZWNsYXJhdGlvbnMubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICAgIHNhbml0aXplZERlY2xhcmF0aW9ucy5qb2luKCcgOyAnKSA6IG51bGw7XG4gICAgICAgICAgICBpZiAob3B0X2xvZ2dlcikge1xuICAgICAgICAgICAgICBsb2cob3B0X2xvZ2dlciwgdGFnTmFtZSwgYXR0cmliTmFtZSwgb2xkVmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaHRtbDQuYXR5cGVbJ0lEJ106XG4gICAgICAgICAgY2FzZSBodG1sNC5hdHlwZVsnSURSRUYnXTpcbiAgICAgICAgICBjYXNlIGh0bWw0LmF0eXBlWydJRFJFRlMnXTpcbiAgICAgICAgICBjYXNlIGh0bWw0LmF0eXBlWydHTE9CQUxfTkFNRSddOlxuICAgICAgICAgIGNhc2UgaHRtbDQuYXR5cGVbJ0xPQ0FMX05BTUUnXTpcbiAgICAgICAgICBjYXNlIGh0bWw0LmF0eXBlWydDTEFTU0VTJ106XG4gICAgICAgICAgICB2YWx1ZSA9IG9wdF9ubVRva2VuUG9saWN5ID8gb3B0X25tVG9rZW5Qb2xpY3kodmFsdWUpIDogdmFsdWU7XG4gICAgICAgICAgICBpZiAob3B0X2xvZ2dlcikge1xuICAgICAgICAgICAgICBsb2cob3B0X2xvZ2dlciwgdGFnTmFtZSwgYXR0cmliTmFtZSwgb2xkVmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaHRtbDQuYXR5cGVbJ1VSSSddOlxuICAgICAgICAgICAgdmFsdWUgPSBzYWZlVXJpKHZhbHVlLFxuICAgICAgICAgICAgICBnZXRVcmlFZmZlY3QodGFnTmFtZSwgYXR0cmliTmFtZSksXG4gICAgICAgICAgICAgIGdldExvYWRlclR5cGUodGFnTmFtZSwgYXR0cmliTmFtZSksXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIlRZUEVcIjogXCJNQVJLVVBcIixcbiAgICAgICAgICAgICAgICBcIlhNTF9BVFRSXCI6IGF0dHJpYk5hbWUsXG4gICAgICAgICAgICAgICAgXCJYTUxfVEFHXCI6IHRhZ05hbWVcbiAgICAgICAgICAgICAgfSwgb3B0X25haXZlVXJpUmV3cml0ZXIpO1xuICAgICAgICAgICAgICBpZiAob3B0X2xvZ2dlcikge1xuICAgICAgICAgICAgICBsb2cob3B0X2xvZ2dlciwgdGFnTmFtZSwgYXR0cmliTmFtZSwgb2xkVmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaHRtbDQuYXR5cGVbJ1VSSV9GUkFHTUVOVCddOlxuICAgICAgICAgICAgaWYgKHZhbHVlICYmICcjJyA9PT0gdmFsdWUuY2hhckF0KDApKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKDEpOyAgLy8gcmVtb3ZlIHRoZSBsZWFkaW5nICcjJ1xuICAgICAgICAgICAgICB2YWx1ZSA9IG9wdF9ubVRva2VuUG9saWN5ID8gb3B0X25tVG9rZW5Qb2xpY3kodmFsdWUpIDogdmFsdWU7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSAnIycgKyB2YWx1ZTsgIC8vIHJlc3RvcmUgdGhlIGxlYWRpbmcgJyMnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHRfbG9nZ2VyKSB7XG4gICAgICAgICAgICAgIGxvZyhvcHRfbG9nZ2VyLCB0YWdOYW1lLCBhdHRyaWJOYW1lLCBvbGRWYWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChvcHRfbG9nZ2VyKSB7XG4gICAgICAgICAgICAgIGxvZyhvcHRfbG9nZ2VyLCB0YWdOYW1lLCBhdHRyaWJOYW1lLCBvbGRWYWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgaWYgKG9wdF9sb2dnZXIpIHtcbiAgICAgICAgICBsb2cob3B0X2xvZ2dlciwgdGFnTmFtZSwgYXR0cmliTmFtZSwgb2xkVmFsdWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXR0cmlic1tpICsgMV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJpYnM7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHRhZyBwb2xpY3kgdGhhdCBvbWl0cyBhbGwgdGFncyBtYXJrZWQgVU5TQUZFIGluIGh0bWw0LWRlZnMuanNcbiAgICogYW5kIGFwcGxpZXMgdGhlIGRlZmF1bHQgYXR0cmlidXRlIHNhbml0aXplciB3aXRoIHRoZSBzdXBwbGllZCBwb2xpY3kgZm9yXG4gICAqIFVSSSBhdHRyaWJ1dGVzIGFuZCBOTVRPS0VOIGF0dHJpYnV0ZXMuXG4gICAqIEBwYXJhbSB7P2Z1bmN0aW9uKD9zdHJpbmcpOiA/c3RyaW5nfSBvcHRfbmFpdmVVcmlSZXdyaXRlciBBIHRyYW5zZm9ybSB0b1xuICAgKiAgICAgYXBwbHkgdG8gVVJJIGF0dHJpYnV0ZXMuICBJZiBub3QgZ2l2ZW4sIFVSSSBhdHRyaWJ1dGVzIGFyZSBkZWxldGVkLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKD9zdHJpbmcpOiA/c3RyaW5nfSBvcHRfbm1Ub2tlblBvbGljeSBBIHRyYW5zZm9ybSB0byBhcHBseVxuICAgKiAgICAgdG8gYXR0cmlidXRlcyBjb250YWluaW5nIEhUTUwgbmFtZXMsIGVsZW1lbnQgSURzLCBhbmQgc3BhY2Utc2VwYXJhdGVkXG4gICAqICAgICBsaXN0cyBvZiBjbGFzc2VzLiAgSWYgbm90IGdpdmVuLCBzdWNoIGF0dHJpYnV0ZXMgYXJlIGxlZnQgdW5jaGFuZ2VkLlxuICAgKiBAcmV0dXJuIHtmdW5jdGlvbihzdHJpbmcsIEFycmF5Ljw/c3RyaW5nPil9IEEgdGFnUG9saWN5IHN1aXRhYmxlIGZvclxuICAgKiAgICAgcGFzc2luZyB0byBodG1sLnNhbml0aXplLlxuICAgKi9cbiAgZnVuY3Rpb24gbWFrZVRhZ1BvbGljeShcbiAgICBvcHRfbmFpdmVVcmlSZXdyaXRlciwgb3B0X25tVG9rZW5Qb2xpY3ksIG9wdF9sb2dnZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odGFnTmFtZSwgYXR0cmlicykge1xuICAgICAgaWYgKCEoaHRtbDQuRUxFTUVOVFNbdGFnTmFtZV0gJiBodG1sNC5lZmxhZ3NbJ1VOU0FGRSddKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICdhdHRyaWJzJzogc2FuaXRpemVBdHRyaWJzKHRhZ05hbWUsIGF0dHJpYnMsXG4gICAgICAgICAgICBvcHRfbmFpdmVVcmlSZXdyaXRlciwgb3B0X25tVG9rZW5Qb2xpY3ksIG9wdF9sb2dnZXIpXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAob3B0X2xvZ2dlcikge1xuICAgICAgICAgIGxvZyhvcHRfbG9nZ2VyLCB0YWdOYW1lLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU2FuaXRpemVzIEhUTUwgdGFncyBhbmQgYXR0cmlidXRlcyBhY2NvcmRpbmcgdG8gYSBnaXZlbiBwb2xpY3kuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dEh0bWwgVGhlIEhUTUwgdG8gc2FuaXRpemUuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oc3RyaW5nLCBBcnJheS48P3N0cmluZz4pfSB0YWdQb2xpY3kgQSBmdW5jdGlvbiB0aGF0XG4gICAqICAgICBkZWNpZGVzIHdoaWNoIHRhZ3MgdG8gYWNjZXB0IGFuZCBzYW5pdGl6ZXMgdGhlaXIgYXR0cmlidXRlcyAoc2VlXG4gICAqICAgICBtYWtlSHRtbFNhbml0aXplciBhYm92ZSBmb3IgZGV0YWlscykuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHNhbml0aXplZCBIVE1MLlxuICAgKi9cbiAgZnVuY3Rpb24gc2FuaXRpemVXaXRoUG9saWN5KGlucHV0SHRtbCwgdGFnUG9saWN5KSB7XG4gICAgdmFyIG91dHB1dEFycmF5ID0gW107XG4gICAgbWFrZUh0bWxTYW5pdGl6ZXIodGFnUG9saWN5KShpbnB1dEh0bWwsIG91dHB1dEFycmF5KTtcbiAgICByZXR1cm4gb3V0cHV0QXJyYXkuam9pbignJyk7XG4gIH1cblxuICAvKipcbiAgICogU3RyaXBzIHVuc2FmZSB0YWdzIGFuZCBhdHRyaWJ1dGVzIGZyb20gSFRNTC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0SHRtbCBUaGUgSFRNTCB0byBzYW5pdGl6ZS5cbiAgICogQHBhcmFtIHs/ZnVuY3Rpb24oP3N0cmluZyk6ID9zdHJpbmd9IG9wdF9uYWl2ZVVyaVJld3JpdGVyIEEgdHJhbnNmb3JtIHRvXG4gICAqICAgICBhcHBseSB0byBVUkkgYXR0cmlidXRlcy4gIElmIG5vdCBnaXZlbiwgVVJJIGF0dHJpYnV0ZXMgYXJlIGRlbGV0ZWQuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oP3N0cmluZyk6ID9zdHJpbmd9IG9wdF9ubVRva2VuUG9saWN5IEEgdHJhbnNmb3JtIHRvIGFwcGx5XG4gICAqICAgICB0byBhdHRyaWJ1dGVzIGNvbnRhaW5pbmcgSFRNTCBuYW1lcywgZWxlbWVudCBJRHMsIGFuZCBzcGFjZS1zZXBhcmF0ZWRcbiAgICogICAgIGxpc3RzIG9mIGNsYXNzZXMuICBJZiBub3QgZ2l2ZW4sIHN1Y2ggYXR0cmlidXRlcyBhcmUgbGVmdCB1bmNoYW5nZWQuXG4gICAqL1xuICBmdW5jdGlvbiBzYW5pdGl6ZShpbnB1dEh0bWwsXG4gICAgb3B0X25haXZlVXJpUmV3cml0ZXIsIG9wdF9ubVRva2VuUG9saWN5LCBvcHRfbG9nZ2VyKSB7XG4gICAgdmFyIHRhZ1BvbGljeSA9IG1ha2VUYWdQb2xpY3koXG4gICAgICBvcHRfbmFpdmVVcmlSZXdyaXRlciwgb3B0X25tVG9rZW5Qb2xpY3ksIG9wdF9sb2dnZXIpO1xuICAgIHJldHVybiBzYW5pdGl6ZVdpdGhQb2xpY3koaW5wdXRIdG1sLCB0YWdQb2xpY3kpO1xuICB9XG5cbiAgLy8gRXhwb3J0IGJvdGggcXVvdGVkIGFuZCB1bnF1b3RlZCBuYW1lcyBmb3IgQ2xvc3VyZSBsaW5rYWdlLlxuICB2YXIgaHRtbCA9IHt9O1xuICBodG1sLmVzY2FwZUF0dHJpYiA9IGh0bWxbJ2VzY2FwZUF0dHJpYiddID0gZXNjYXBlQXR0cmliO1xuICBodG1sLm1ha2VIdG1sU2FuaXRpemVyID0gaHRtbFsnbWFrZUh0bWxTYW5pdGl6ZXInXSA9IG1ha2VIdG1sU2FuaXRpemVyO1xuICBodG1sLm1ha2VTYXhQYXJzZXIgPSBodG1sWydtYWtlU2F4UGFyc2VyJ10gPSBtYWtlU2F4UGFyc2VyO1xuICBodG1sLm1ha2VUYWdQb2xpY3kgPSBodG1sWydtYWtlVGFnUG9saWN5J10gPSBtYWtlVGFnUG9saWN5O1xuICBodG1sLm5vcm1hbGl6ZVJDRGF0YSA9IGh0bWxbJ25vcm1hbGl6ZVJDRGF0YSddID0gbm9ybWFsaXplUkNEYXRhO1xuICBodG1sLnNhbml0aXplID0gaHRtbFsnc2FuaXRpemUnXSA9IHNhbml0aXplO1xuICBodG1sLnNhbml0aXplQXR0cmlicyA9IGh0bWxbJ3Nhbml0aXplQXR0cmlicyddID0gc2FuaXRpemVBdHRyaWJzO1xuICBodG1sLnNhbml0aXplV2l0aFBvbGljeSA9IGh0bWxbJ3Nhbml0aXplV2l0aFBvbGljeSddID0gc2FuaXRpemVXaXRoUG9saWN5O1xuICBodG1sLnVuZXNjYXBlRW50aXRpZXMgPSBodG1sWyd1bmVzY2FwZUVudGl0aWVzJ10gPSB1bmVzY2FwZUVudGl0aWVzO1xuICByZXR1cm4gaHRtbDtcbn0pKGh0bWw0KTtcblxudmFyIGh0bWxfc2FuaXRpemUgPSBodG1sWydzYW5pdGl6ZSddO1xuXG4vLyBMb29zZW4gcmVzdHJpY3Rpb25zIG9mIENhamEnc1xuLy8gaHRtbC1zYW5pdGl6ZXIgdG8gYWxsb3cgZm9yIHN0eWxpbmdcbmh0bWw0LkFUVFJJQlNbJyo6OnN0eWxlJ10gPSAwO1xuaHRtbDQuRUxFTUVOVFNbJ3N0eWxlJ10gPSAwO1xuaHRtbDQuQVRUUklCU1snYTo6dGFyZ2V0J10gPSAwO1xuaHRtbDQuRUxFTUVOVFNbJ3ZpZGVvJ10gPSAwO1xuaHRtbDQuQVRUUklCU1sndmlkZW86OnNyYyddID0gMDtcbmh0bWw0LkFUVFJJQlNbJ3ZpZGVvOjpwb3N0ZXInXSA9IDA7XG5odG1sNC5BVFRSSUJTWyd2aWRlbzo6Y29udHJvbHMnXSA9IDA7XG5odG1sNC5FTEVNRU5UU1snYXVkaW8nXSA9IDA7XG5odG1sNC5BVFRSSUJTWydhdWRpbzo6c3JjJ10gPSAwO1xuaHRtbDQuQVRUUklCU1sndmlkZW86OmF1dG9wbGF5J10gPSAwO1xuaHRtbDQuQVRUUklCU1sndmlkZW86OmNvbnRyb2xzJ10gPSAwO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGh0bWxfc2FuaXRpemU7XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiYXV0aG9yXCI6IFwiTWFwQm94XCIsXG4gIFwibmFtZVwiOiBcIm1hcGJveC5qc1wiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwibWFwYm94IGphdmFzY3JpcHQgYXBpXCIsXG4gIFwidmVyc2lvblwiOiBcIjEuNS4wXCIsXG4gIFwiaG9tZXBhZ2VcIjogXCJodHRwOi8vbWFwYm94LmNvbS9cIixcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImdpdDovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC5qcy5naXRcIlxuICB9LFxuICBcIm1haW5cIjogXCJpbmRleC5qc1wiLFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJsZWFmbGV0XCI6IFwiMC43LjBcIixcbiAgICBcIm11c3RhY2hlXCI6IFwiMC43LjNcIixcbiAgICBcImNvcnNsaXRlXCI6IFwiMC4wLjVcIixcbiAgICBcImpzb24zXCI6IFwiZ2l0Oi8vZ2l0aHViLmNvbS9iZXN0aWVqcy9qc29uMy5naXQjdjMuMi41YVwiLFxuICAgIFwic2FuaXRpemUtY2FqYVwiOiBcIjAuMC4wXCIsXG4gICAgXCJsZWFmbGV0LWhhc2hcIjogXCJ+MC4yLjFcIlxuICB9LFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwidGVzdFwiOiBcImpzaGludCBzcmMvKi5qcyAmJiBtb2NoYS1waGFudG9tanMgdGVzdC9pbmRleC5odG1sXCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwibGVhZmxldC1oYXNoXCI6IFwiZ2l0Oi8vZ2l0aHViLmNvbS9tbGV2YW5zL2xlYWZsZXQtaGFzaC5naXQjYjAzOWEzYWE0ZTI0OTJhNWM3NDQ4MDc1MTcyYWMyNjc2OWU2MDFkNlwiLFxuICAgIFwibGVhZmxldC1mdWxsc2NyZWVuXCI6IFwiMC4wLjBcIixcbiAgICBcInVnbGlmeS1qc1wiOiBcIjIuNC4zXCIsXG4gICAgXCJtb2NoYVwiOiBcIjEuMTQuMFwiLFxuICAgIFwiZXhwZWN0LmpzXCI6IFwiMC4yLjBcIixcbiAgICBcInNpbm9uXCI6IFwiMS43LjNcIixcbiAgICBcIm1vY2hhLXBoYW50b21qc1wiOiBcIjMuMS42XCIsXG4gICAgXCJoYXBwZW5cIjogXCIwLjEuM1wiLFxuICAgIFwiYnJvd3NlcmlmeVwiOiBcIjIuMzUuNFwiLFxuICAgIFwianNoaW50XCI6IFwiMi4zLjBcIlxuICB9LFxuICBcIm9wdGlvbmFsRGVwZW5kZW5jaWVzXCI6IHt9LFxuICBcImVuZ2luZXNcIjoge1xuICAgIFwibm9kZVwiOiBcIipcIlxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgSFRUUF9VUkxTOiBbXG4gICAgICAgICdodHRwOi8vYS50aWxlcy5tYXBib3guY29tL3YzLycsXG4gICAgICAgICdodHRwOi8vYi50aWxlcy5tYXBib3guY29tL3YzLycsXG4gICAgICAgICdodHRwOi8vYy50aWxlcy5tYXBib3guY29tL3YzLycsXG4gICAgICAgICdodHRwOi8vZC50aWxlcy5tYXBib3guY29tL3YzLyddLFxuXG4gICAgRk9SQ0VfSFRUUFM6IGZhbHNlLFxuXG4gICAgSFRUUFNfVVJMUzogW1xuICAgICAgICAnaHR0cHM6Ly9hLnRpbGVzLm1hcGJveC5jb20vdjMvJyxcbiAgICAgICAgJ2h0dHBzOi8vYi50aWxlcy5tYXBib3guY29tL3YzLycsXG4gICAgICAgICdodHRwczovL2MudGlsZXMubWFwYm94LmNvbS92My8nLFxuICAgICAgICAnaHR0cHM6Ly9kLnRpbGVzLm1hcGJveC5jb20vdjMvJ11cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gICAgdXJsaGVscGVyID0gcmVxdWlyZSgnLi91cmwnKSxcbiAgICByZXF1ZXN0ID0gcmVxdWlyZSgnLi9yZXF1ZXN0Jyk7XG5cbi8vIExvdy1sZXZlbCBnZW9jb2RpbmcgaW50ZXJmYWNlIC0gd3JhcHMgc3BlY2lmaWMgQVBJIGNhbGxzIGFuZCB0aGVpclxuLy8gcmV0dXJuIHZhbHVlcy5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oXykge1xuXG4gICAgdmFyIGdlb2NvZGVyID0ge30sIHVybDtcblxuICAgIGdlb2NvZGVyLmdldFVSTCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9O1xuXG4gICAgZ2VvY29kZXIuc2V0VVJMID0gZnVuY3Rpb24oXykge1xuICAgICAgICB1cmwgPSB1cmxoZWxwZXIuanNvbmlmeShfKTtcbiAgICAgICAgcmV0dXJuIGdlb2NvZGVyO1xuICAgIH07XG5cbiAgICBnZW9jb2Rlci5zZXRJRCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgdXRpbC5zdHJpY3QoXywgJ3N0cmluZycpO1xuICAgICAgICBnZW9jb2Rlci5zZXRVUkwodXJsaGVscGVyLmJhc2UoKSArIF8gKyAnL2dlb2NvZGUve3F1ZXJ5fS5qc29uJyk7XG4gICAgICAgIHJldHVybiBnZW9jb2RlcjtcbiAgICB9O1xuXG4gICAgZ2VvY29kZXIuc2V0VGlsZUpTT04gPSBmdW5jdGlvbihfKSB7XG4gICAgICAgIHV0aWwuc3RyaWN0KF8sICdvYmplY3QnKTtcbiAgICAgICAgZ2VvY29kZXIuc2V0VVJMKF8uZ2VvY29kZXIpO1xuICAgICAgICByZXR1cm4gZ2VvY29kZXI7XG4gICAgfTtcblxuICAgIGdlb2NvZGVyLnF1ZXJ5VVJMID0gZnVuY3Rpb24oXykge1xuICAgICAgICB1dGlsLnN0cmljdChfLCAnc3RyaW5nJyk7XG4gICAgICAgIGlmICghZ2VvY29kZXIuZ2V0VVJMKCkpIHRocm93IG5ldyBFcnJvcignR2VvY29kaW5nIG1hcCBJRCBub3Qgc2V0Jyk7XG4gICAgICAgIHJldHVybiBMLlV0aWwudGVtcGxhdGUoZ2VvY29kZXIuZ2V0VVJMKCksIHsgcXVlcnk6IGVuY29kZVVSSUNvbXBvbmVudChfKSB9KTtcbiAgICB9O1xuXG4gICAgZ2VvY29kZXIucXVlcnkgPSBmdW5jdGlvbihfLCBjYWxsYmFjaykge1xuICAgICAgICB1dGlsLnN0cmljdChfLCAnc3RyaW5nJyk7XG4gICAgICAgIHV0aWwuc3RyaWN0KGNhbGxiYWNrLCAnZnVuY3Rpb24nKTtcbiAgICAgICAgcmVxdWVzdChnZW9jb2Rlci5xdWVyeVVSTChfKSwgZnVuY3Rpb24oZXJyLCBqc29uKSB7XG4gICAgICAgICAgICBpZiAoanNvbiAmJiBqc29uLnJlc3VsdHMgJiYganNvbi5yZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciByZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IGpzb24ucmVzdWx0cyxcbiAgICAgICAgICAgICAgICAgICAgbGF0bG5nOiBbanNvbi5yZXN1bHRzWzBdWzBdLmxhdCwganNvbi5yZXN1bHRzWzBdWzBdLmxvbl1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmIChqc29uLnJlc3VsdHNbMF1bMF0uYm91bmRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvdW5kcyA9IGpzb24ucmVzdWx0c1swXVswXS5ib3VuZHM7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5sYm91bmRzID0gdXRpbC5sYm91bmRzKHJlcy5ib3VuZHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXMpO1xuICAgICAgICAgICAgfSBlbHNlIGNhbGxiYWNrKGVyciB8fCB0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGdlb2NvZGVyO1xuICAgIH07XG5cbiAgICAvLyBhIHJldmVyc2UgZ2VvY29kZTpcbiAgICAvL1xuICAgIC8vICBnZW9jb2Rlci5yZXZlcnNlUXVlcnkoWzgwLCAyMF0pXG4gICAgZ2VvY29kZXIucmV2ZXJzZVF1ZXJ5ID0gZnVuY3Rpb24oXywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHEgPSAnJztcblxuICAgICAgICBmdW5jdGlvbiBub3JtKHgpIHtcbiAgICAgICAgICAgIGlmICh4LmxhdCAhPT0gdW5kZWZpbmVkICYmIHgubG5nICE9PSB1bmRlZmluZWQpIHJldHVybiB4LmxuZyArICcsJyArIHgubGF0O1xuICAgICAgICAgICAgZWxzZSBpZiAoeC5sYXQgIT09IHVuZGVmaW5lZCAmJiB4LmxvbiAhPT0gdW5kZWZpbmVkKSByZXR1cm4geC5sb24gKyAnLCcgKyB4LmxhdDtcbiAgICAgICAgICAgIGVsc2UgcmV0dXJuIHhbMF0gKyAnLCcgKyB4WzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ubGVuZ3RoICYmIF9bMF0ubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgcHRzID0gW107IGkgPCBfLmxlbmd0aDsgaSsrKSBwdHMucHVzaChub3JtKF9baV0pKTtcbiAgICAgICAgICAgIHEgPSBwdHMuam9pbignOycpO1xuICAgICAgICB9IGVsc2UgcSA9IG5vcm0oXyk7XG5cbiAgICAgICAgcmVxdWVzdChnZW9jb2Rlci5xdWVyeVVSTChxKSwgZnVuY3Rpb24oZXJyLCBqc29uKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIGpzb24pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZ2VvY29kZXI7XG4gICAgfTtcblxuICAgIGlmICh0eXBlb2YgXyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKF8uaW5kZXhPZignLycpID09IC0xKSBnZW9jb2Rlci5zZXRJRChfKTtcbiAgICAgICAgZWxzZSBnZW9jb2Rlci5zZXRVUkwoXyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBfID09PSAnb2JqZWN0JykgZ2VvY29kZXIuc2V0VGlsZUpTT04oXyk7XG5cbiAgICByZXR1cm4gZ2VvY29kZXI7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VvY29kZXIgPSByZXF1aXJlKCcuL2dlb2NvZGVyJyk7XG5cbnZhciBHZW9jb2RlckNvbnRyb2wgPSBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgICBpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXG5cbiAgICBvcHRpb25zOiB7XG4gICAgICAgIHBvc2l0aW9uOiAndG9wbGVmdCcsXG4gICAgICAgIGtlZXBPcGVuOiBmYWxzZVxuICAgIH0sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihfLCBvcHRpb25zKSB7XG4gICAgICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmdlb2NvZGVyID0gZ2VvY29kZXIoXyk7XG4gICAgfSxcblxuICAgIHNldFVSTDogZnVuY3Rpb24oXykge1xuICAgICAgICB0aGlzLmdlb2NvZGVyLnNldFVSTChfKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIGdldFVSTDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdlb2NvZGVyLmdldFVSTCgpO1xuICAgIH0sXG5cbiAgICBzZXRJRDogZnVuY3Rpb24oXykge1xuICAgICAgICB0aGlzLmdlb2NvZGVyLnNldElEKF8pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgc2V0VGlsZUpTT046IGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgdGhpcy5nZW9jb2Rlci5zZXRUaWxlSlNPTihfKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF90b2dnbGU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUpIEwuRG9tRXZlbnQuc3RvcChlKTtcbiAgICAgICAgaWYgKEwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9jb250YWluZXIsICdhY3RpdmUnKSkge1xuICAgICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2FjdGl2ZScpO1xuICAgICAgICAgICAgdGhpcy5fcmVzdWx0cy5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgIHRoaXMuX2lucHV0LmJsdXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdhY3RpdmUnKTtcbiAgICAgICAgICAgIHRoaXMuX2lucHV0LmZvY3VzKCk7XG4gICAgICAgICAgICB0aGlzLl9pbnB1dC5zZWxlY3QoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfY2xvc2VJZk9wZW46IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKEwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9jb250YWluZXIsICdhY3RpdmUnKSAmJlxuICAgICAgICAgICAgIXRoaXMub3B0aW9ucy5rZWVwT3Blbikge1xuICAgICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2FjdGl2ZScpO1xuICAgICAgICAgICAgdGhpcy5fcmVzdWx0cy5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgIHRoaXMuX2lucHV0LmJsdXIoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkFkZDogZnVuY3Rpb24obWFwKSB7XG5cbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWNvbnRyb2wtbWFwYm94LWdlb2NvZGVyIGxlYWZsZXQtYmFyIGxlYWZsZXQtY29udHJvbCcpLFxuICAgICAgICAgICAgbGluayA9IEwuRG9tVXRpbC5jcmVhdGUoJ2EnLCAnbGVhZmxldC1jb250cm9sLW1hcGJveC1nZW9jb2Rlci10b2dnbGUgbWFwYm94LWljb24gbWFwYm94LWljb24tZ2VvY29kZXInLCBjb250YWluZXIpLFxuICAgICAgICAgICAgcmVzdWx0cyA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWNvbnRyb2wtbWFwYm94LWdlb2NvZGVyLXJlc3VsdHMnLCBjb250YWluZXIpLFxuICAgICAgICAgICAgd3JhcCA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWNvbnRyb2wtbWFwYm94LWdlb2NvZGVyLXdyYXAnLCBjb250YWluZXIpLFxuICAgICAgICAgICAgZm9ybSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2Zvcm0nLCAnbGVhZmxldC1jb250cm9sLW1hcGJveC1nZW9jb2Rlci1mb3JtJywgd3JhcCksXG4gICAgICAgICAgICBpbnB1dCAgPSBMLkRvbVV0aWwuY3JlYXRlKCdpbnB1dCcsICcnLCBmb3JtKTtcblxuICAgICAgICBsaW5rLmhyZWYgPSAnIyc7XG4gICAgICAgIGxpbmsuaW5uZXJIVE1MID0gJyZuYnNwOyc7XG5cbiAgICAgICAgaW5wdXQudHlwZSA9ICd0ZXh0JztcbiAgICAgICAgaW5wdXQuc2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicsICdTZWFyY2gnKTtcblxuICAgICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKGZvcm0sICdzdWJtaXQnLCB0aGlzLl9nZW9jb2RlLCB0aGlzKTtcbiAgICAgICAgTC5Eb21FdmVudC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbihjb250YWluZXIpO1xuXG4gICAgICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICAgICAgdGhpcy5fcmVzdWx0cyA9IHJlc3VsdHM7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gaW5wdXQ7XG4gICAgICAgIHRoaXMuX2Zvcm0gPSBmb3JtO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMua2VlcE9wZW4pIHtcbiAgICAgICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhjb250YWluZXIsICdhY3RpdmUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX21hcC5vbignY2xpY2snLCB0aGlzLl9jbG9zZUlmT3BlbiwgdGhpcyk7XG4gICAgICAgICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKGxpbmssICdjbGljaycsIHRoaXMuX3RvZ2dsZSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH0sXG5cbiAgICBfZ2VvY29kZTogZnVuY3Rpb24oZSkge1xuICAgICAgICBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KGUpO1xuICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnc2VhcmNoaW5nJyk7XG5cbiAgICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgICAgdmFyIG9ubG9hZCA9IEwuYmluZChmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdzZWFyY2hpbmcnKTtcbiAgICAgICAgICAgIGlmIChlcnIgfHwgIXJlc3AgfHwgIXJlc3AucmVzdWx0cyB8fCAhcmVzcC5yZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmlyZSgnZXJyb3InLCB7ZXJyb3I6IGVycn0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXN1bHRzLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwLnJlc3VsdHMubGVuZ3RoID09PSAxICYmIHJlc3AubGJvdW5kcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tYXAuZml0Qm91bmRzKHJlc3AubGJvdW5kcyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Nsb3NlSWZPcGVuKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBNYXRoLm1pbihyZXNwLnJlc3VsdHMubGVuZ3RoLCA1KTsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmVzcC5yZXN1bHRzW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3AucmVzdWx0c1tpXVtqXS5uYW1lKSBuYW1lLnB1c2gocmVzcC5yZXN1bHRzW2ldW2pdLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuYW1lLmxlbmd0aCkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICcnLCB0aGlzLl9yZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHIuaW5uZXJIVE1MID0gbmFtZS5qb2luKCcsICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgci5ocmVmID0gJyMnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihyLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfID0gcmVzdWx0WzBdLmJvdW5kcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyhMLmxhdExuZ0JvdW5kcyhbW19bMV0sIF9bMF1dLCBbX1szXSwgX1syXV1dKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEwuRG9tRXZlbnQuc3RvcChlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKHJlc3AucmVzdWx0c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3AucmVzdWx0cy5sZW5ndGggPiA1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3V0b2YgPSBMLkRvbVV0aWwuY3JlYXRlKCdzcGFuJywgJycsIHRoaXMuX3Jlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0b2YuaW5uZXJIVE1MID0gJ1RvcCA1IG9mICcgKyByZXNwLnJlc3VsdHMubGVuZ3RoICsgJyAgcmVzdWx0cyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKCdmb3VuZCcsIHJlc3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLmdlb2NvZGVyLnF1ZXJ5KHRoaXMuX2lucHV0LnZhbHVlLCBvbmxvYWQpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKF8sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IEdlb2NvZGVyQ29udHJvbChfLCBvcHRpb25zKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHV0ZkRlY29kZShjKSB7XG4gICAgaWYgKGMgPj0gOTMpIGMtLTtcbiAgICBpZiAoYyA+PSAzNSkgYy0tO1xuICAgIHJldHVybiBjIC0gMzI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIGlmICghZGF0YSkgcmV0dXJuO1xuICAgICAgICB2YXIgaWR4ID0gdXRmRGVjb2RlKGRhdGEuZ3JpZFt5XS5jaGFyQ29kZUF0KHgpKSxcbiAgICAgICAgICAgIGtleSA9IGRhdGEua2V5c1tpZHhdO1xuICAgICAgICByZXR1cm4gZGF0YS5kYXRhW2tleV07XG4gICAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gICAgTXVzdGFjaGUgPSByZXF1aXJlKCdtdXN0YWNoZScpO1xuXG52YXIgR3JpZENvbnRyb2wgPSBMLkNvbnRyb2wuZXh0ZW5kKHtcblxuICAgIG9wdGlvbnM6IHtcbiAgICAgICAgcGlubmFibGU6IHRydWUsXG4gICAgICAgIGZvbGxvdzogZmFsc2UsXG4gICAgICAgIHNhbml0aXplcjogcmVxdWlyZSgnc2FuaXRpemUtY2FqYScpLFxuICAgICAgICB0b3VjaFRlYXNlcjogdHJ1ZSxcbiAgICAgICAgbG9jYXRpb246IHRydWVcbiAgICB9LFxuXG4gICAgX2N1cnJlbnRDb250ZW50OiAnJyxcblxuICAgIC8vIHBpbm5lZCBtZWFucyB0aGF0IHRoaXMgY29udHJvbCBpcyBvbiBhIGZlYXR1cmUgYW5kIHRoZSB1c2VyIGhhcyBsaWtlbHlcbiAgICAvLyBjbGlja2VkLiBwaW5uZWQgd2lsbCBub3QgYmVjb21lIGZhbHNlIHVubGVzcyB0aGUgdXNlciBjbGlja3Mgb2ZmXG4gICAgLy8gb2YgdGhlIGZlYXR1cmUgb250byBhbm90aGVyIG9yIGNsaWNrcyB4XG4gICAgX3Bpbm5lZDogZmFsc2UsXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihfLCBvcHRpb25zKSB7XG4gICAgICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB1dGlsLnN0cmljdF9pbnN0YW5jZShfLCBMLkNsYXNzLCAnTC5tYXBib3guZ3JpZExheWVyJyk7XG4gICAgICAgIHRoaXMuX2xheWVyID0gXztcbiAgICB9LFxuXG4gICAgc2V0VGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG4gICAgICAgIHV0aWwuc3RyaWN0KHRlbXBsYXRlLCAnc3RyaW5nJyk7XG4gICAgICAgIHRoaXMub3B0aW9ucy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3RlbXBsYXRlOiBmdW5jdGlvbihmb3JtYXQsIGRhdGEpIHtcbiAgICAgICAgaWYgKCFkYXRhKSByZXR1cm47XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMub3B0aW9ucy50ZW1wbGF0ZSB8fCB0aGlzLl9sYXllci5nZXRUaWxlSlNPTigpLnRlbXBsYXRlO1xuICAgICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHZhciBkID0ge307XG4gICAgICAgICAgICBkWydfXycgKyBmb3JtYXQgKyAnX18nXSA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnNhbml0aXplcihcbiAgICAgICAgICAgICAgICBNdXN0YWNoZS50b19odG1sKHRlbXBsYXRlLCBMLmV4dGVuZChkLCBkYXRhKSkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIGNoYW5nZSB0aGUgY29udGVudCBvZiB0aGUgdG9vbHRpcCBIVE1MIGlmIGl0IGhhcyBjaGFuZ2VkLCBvdGhlcndpc2VcbiAgICAvLyBub29wXG4gICAgX3Nob3c6IGZ1bmN0aW9uKGNvbnRlbnQsIG8pIHtcbiAgICAgICAgaWYgKGNvbnRlbnQgPT09IHRoaXMuX2N1cnJlbnRDb250ZW50KSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fY3VycmVudENvbnRlbnQgPSBjb250ZW50O1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZm9sbG93KSB7XG4gICAgICAgICAgICB0aGlzLl9wb3B1cC5zZXRDb250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgLnNldExhdExuZyhvLmxhdExuZyk7XG4gICAgICAgICAgICBpZiAodGhpcy5fbWFwLl9wb3B1cCAhPT0gdGhpcy5fcG9wdXApIHRoaXMuX3BvcHVwLm9wZW5Pbih0aGlzLl9tYXApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgdGhpcy5fY29udGVudFdyYXBwZXIuaW5uZXJIVE1MID0gY29udGVudDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBoaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fcGlubmVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRDb250ZW50ID0gJyc7XG5cbiAgICAgICAgdGhpcy5fbWFwLmNsb3NlUG9wdXAoKTtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIHRoaXMuX2NvbnRlbnRXcmFwcGVyLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdjbG9zYWJsZScpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfbW91c2VvdmVyOiBmdW5jdGlvbihvKSB7XG4gICAgICAgIGlmIChvLmRhdGEpIHtcbiAgICAgICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9tYXAuX2NvbnRhaW5lciwgJ21hcC1jbGlja2FibGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9tYXAuX2NvbnRhaW5lciwgJ21hcC1jbGlja2FibGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9waW5uZWQpIHJldHVybjtcblxuICAgICAgICB2YXIgY29udGVudCA9IHRoaXMuX3RlbXBsYXRlKCd0ZWFzZXInLCBvLmRhdGEpO1xuICAgICAgICBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgdGhpcy5fc2hvdyhjb250ZW50LCBvKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9tb3VzZW1vdmU6IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgaWYgKHRoaXMuX3Bpbm5lZCkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5mb2xsb3cpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9wb3B1cC5zZXRMYXRMbmcoby5sYXRMbmcpO1xuICAgIH0sXG5cbiAgICBfbmF2aWdhdGVUbzogZnVuY3Rpb24odXJsKSB7XG4gICAgICAgIHdpbmRvdy50b3AubG9jYXRpb24uaHJlZiA9IHVybDtcbiAgICB9LFxuXG4gICAgX2NsaWNrOiBmdW5jdGlvbihvKSB7XG5cbiAgICAgICAgdmFyIGxvY2F0aW9uX2Zvcm1hdHRlZCA9IHRoaXMuX3RlbXBsYXRlKCdsb2NhdGlvbicsIG8uZGF0YSk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubG9jYXRpb24gJiYgbG9jYXRpb25fZm9ybWF0dGVkICYmXG4gICAgICAgICAgICBsb2NhdGlvbl9mb3JtYXR0ZWQuc2VhcmNoKC9eaHR0cHM/Oi8pID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbmF2aWdhdGVUbyh0aGlzLl90ZW1wbGF0ZSgnbG9jYXRpb24nLCBvLmRhdGEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnBpbm5hYmxlKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLl90ZW1wbGF0ZSgnZnVsbCcsIG8uZGF0YSk7XG5cbiAgICAgICAgaWYgKCFjb250ZW50ICYmIHRoaXMub3B0aW9ucy50b3VjaFRlYXNlciAmJiBMLkJyb3dzZXIudG91Y2gpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLl90ZW1wbGF0ZSgndGVhc2VyJywgby5kYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnY2xvc2FibGUnKTtcbiAgICAgICAgICAgIHRoaXMuX3Bpbm5lZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9zaG93KGNvbnRlbnQsIG8pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Bpbm5lZCkge1xuICAgICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2Nsb3NhYmxlJyk7XG4gICAgICAgICAgICB0aGlzLl9waW5uZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9vblBvcHVwQ2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jdXJyZW50Q29udGVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuX3Bpbm5lZCA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBfY3JlYXRlQ2xvc2VidXR0b246IGZ1bmN0aW9uKGNvbnRhaW5lciwgZm4pIHtcbiAgICAgICAgdmFyIGxpbmsgPSBMLkRvbVV0aWwuY3JlYXRlKCdhJywgJ2Nsb3NlJywgY29udGFpbmVyKTtcblxuICAgICAgICBsaW5rLmlubmVySFRNTCA9ICdjbG9zZSc7XG4gICAgICAgIGxpbmsuaHJlZiA9ICcjJztcbiAgICAgICAgbGluay50aXRsZSA9ICdjbG9zZSc7XG5cbiAgICAgICAgTC5Eb21FdmVudFxuICAgICAgICAgICAgLm9uKGxpbmssICdjbGljaycsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKVxuICAgICAgICAgICAgLm9uKGxpbmssICdtb3VzZWRvd24nLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgICAgIC5vbihsaW5rLCAnZGJsY2xpY2snLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KVxuICAgICAgICAgICAgLm9uKGxpbmssICdjbGljaycsIGZuLCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gbGluaztcbiAgICB9LFxuXG4gICAgb25BZGQ6IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9tYXAgPSBtYXA7XG5cbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9ICdsZWFmbGV0LWNvbnRyb2wtZ3JpZCBtYXAtdG9vbHRpcCcsXG4gICAgICAgICAgICBjb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBjbGFzc05hbWUpLFxuICAgICAgICAgICAgY29udGVudFdyYXBwZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbWFwLXRvb2x0aXAtY29udGVudCcpO1xuXG4gICAgICAgIC8vIGhpZGUgdGhlIGNvbnRhaW5lciBlbGVtZW50IGluaXRpYWxseVxuICAgICAgICBjb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgdGhpcy5fY3JlYXRlQ2xvc2VidXR0b24oY29udGFpbmVyLCB0aGlzLmhpZGUpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY29udGVudFdyYXBwZXIpO1xuXG4gICAgICAgIHRoaXMuX2NvbnRlbnRXcmFwcGVyID0gY29udGVudFdyYXBwZXI7XG4gICAgICAgIHRoaXMuX3BvcHVwID0gbmV3IEwuUG9wdXAoeyBhdXRvUGFuOiBmYWxzZSwgY2xvc2VPbkNsaWNrOiBmYWxzZSB9KTtcblxuICAgICAgICBtYXAub24oJ3BvcHVwY2xvc2UnLCB0aGlzLl9vblBvcHVwQ2xvc2UsIHRoaXMpO1xuXG4gICAgICAgIEwuRG9tRXZlbnRcbiAgICAgICAgICAgIC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbihjb250YWluZXIpXG4gICAgICAgICAgICAvLyBhbGxvdyBwZW9wbGUgdG8gc2Nyb2xsIHRvb2x0aXBzIHdpdGggbW91c2V3aGVlbFxuICAgICAgICAgICAgLmFkZExpc3RlbmVyKGNvbnRhaW5lciwgJ21vdXNld2hlZWwnLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbik7XG5cbiAgICAgICAgdGhpcy5fbGF5ZXJcbiAgICAgICAgICAgIC5vbignbW91c2VvdmVyJywgdGhpcy5fbW91c2VvdmVyLCB0aGlzKVxuICAgICAgICAgICAgLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9tb3VzZW1vdmUsIHRoaXMpXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgdGhpcy5fY2xpY2ssIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBjb250YWluZXI7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XG5cbiAgICAgICAgbWFwLm9mZigncG9wdXBjbG9zZScsIHRoaXMuX29uUG9wdXBDbG9zZSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5fbGF5ZXJcbiAgICAgICAgICAgIC5vZmYoJ21vdXNlb3ZlcicsIHRoaXMuX21vdXNlb3ZlciwgdGhpcylcbiAgICAgICAgICAgIC5vZmYoJ21vdXNlbW92ZScsIHRoaXMuX21vdXNlbW92ZSwgdGhpcylcbiAgICAgICAgICAgIC5vZmYoJ2NsaWNrJywgdGhpcy5fY2xpY2ssIHRoaXMpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKF8sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IEdyaWRDb250cm9sKF8sIG9wdGlvbnMpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKSxcbiAgICB1cmwgPSByZXF1aXJlKCcuL3VybCcpLFxuICAgIHJlcXVlc3QgPSByZXF1aXJlKCcuL3JlcXVlc3QnKSxcbiAgICBncmlkID0gcmVxdWlyZSgnLi9ncmlkJyk7XG5cbi8vIGZvcmtlZCBmcm9tIGRhbnplbC9MLlVURkdyaWRcbnZhciBHcmlkTGF5ZXIgPSBMLkNsYXNzLmV4dGVuZCh7XG4gICAgaW5jbHVkZXM6IFtMLk1peGluLkV2ZW50cywgcmVxdWlyZSgnLi9sb2FkX3RpbGVqc29uJyldLFxuXG4gICAgb3B0aW9uczoge1xuICAgICAgICB0ZW1wbGF0ZTogZnVuY3Rpb24oKSB7IHJldHVybiAnJzsgfVxuICAgIH0sXG5cbiAgICBfbW91c2VPbjogbnVsbCxcbiAgICBfdGlsZWpzb246IHt9LFxuICAgIF9jYWNoZToge30sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihfLCBvcHRpb25zKSB7XG4gICAgICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9sb2FkVGlsZUpTT04oXyk7XG4gICAgfSxcblxuICAgIF9zZXRUaWxlSlNPTjogZnVuY3Rpb24oanNvbikge1xuICAgICAgICB1dGlsLnN0cmljdChqc29uLCAnb2JqZWN0Jyk7XG5cbiAgICAgICAgTC5leHRlbmQodGhpcy5vcHRpb25zLCB7XG4gICAgICAgICAgICBncmlkczoganNvbi5ncmlkcyxcbiAgICAgICAgICAgIG1pblpvb206IGpzb24ubWluem9vbSxcbiAgICAgICAgICAgIG1heFpvb206IGpzb24ubWF4em9vbSxcbiAgICAgICAgICAgIGJvdW5kczoganNvbi5ib3VuZHMgJiYgdXRpbC5sYm91bmRzKGpzb24uYm91bmRzKVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl90aWxlanNvbiA9IGpzb247XG4gICAgICAgIHRoaXMuX2NhY2hlID0ge307XG4gICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBnZXRUaWxlSlNPTjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90aWxlanNvbjtcbiAgICB9LFxuXG4gICAgYWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuX21hcCAmJiB0aGlzLm9wdGlvbnMuZ3JpZHMgJiYgdGhpcy5vcHRpb25zLmdyaWRzLmxlbmd0aCk7XG4gICAgfSxcblxuICAgIGFkZFRvOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgICAgIG1hcC5hZGRMYXllcih0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIG9uQWRkOiBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgdGhpcy5fbWFwID0gbWFwO1xuICAgICAgICB0aGlzLl91cGRhdGUoKTtcblxuICAgICAgICB0aGlzLl9tYXBcbiAgICAgICAgICAgIC5vbignY2xpY2snLCB0aGlzLl9jbGljaywgdGhpcylcbiAgICAgICAgICAgIC5vbignbW91c2Vtb3ZlJywgdGhpcy5fbW92ZSwgdGhpcylcbiAgICAgICAgICAgIC5vbignbW92ZWVuZCcsIHRoaXMuX3VwZGF0ZSwgdGhpcyk7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fbWFwXG4gICAgICAgICAgICAub2ZmKCdjbGljaycsIHRoaXMuX2NsaWNrLCB0aGlzKVxuICAgICAgICAgICAgLm9mZignbW91c2Vtb3ZlJywgdGhpcy5fbW92ZSwgdGhpcylcbiAgICAgICAgICAgIC5vZmYoJ21vdmVlbmQnLCB0aGlzLl91cGRhdGUsIHRoaXMpO1xuICAgIH0sXG5cbiAgICBnZXREYXRhOiBmdW5jdGlvbihsYXRsbmcsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghdGhpcy5hY3RpdmUoKSkgcmV0dXJuO1xuXG4gICAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXAsXG4gICAgICAgICAgICBwb2ludCA9IG1hcC5wcm9qZWN0KGxhdGxuZy53cmFwKCkpLFxuICAgICAgICAgICAgdGlsZVNpemUgPSAyNTYsXG4gICAgICAgICAgICByZXNvbHV0aW9uID0gNCxcbiAgICAgICAgICAgIHggPSBNYXRoLmZsb29yKHBvaW50LnggLyB0aWxlU2l6ZSksXG4gICAgICAgICAgICB5ID0gTWF0aC5mbG9vcihwb2ludC55IC8gdGlsZVNpemUpLFxuICAgICAgICAgICAgbWF4ID0gbWFwLm9wdGlvbnMuY3JzLnNjYWxlKG1hcC5nZXRab29tKCkpIC8gdGlsZVNpemU7XG5cbiAgICAgICAgeCA9ICh4ICsgbWF4KSAlIG1heDtcbiAgICAgICAgeSA9ICh5ICsgbWF4KSAlIG1heDtcblxuICAgICAgICB0aGlzLl9nZXRUaWxlKG1hcC5nZXRab29tKCksIHgsIHksIGZ1bmN0aW9uKGdyaWQpIHtcbiAgICAgICAgICAgIHZhciBncmlkWCA9IE1hdGguZmxvb3IoKHBvaW50LnggLSAoeCAqIHRpbGVTaXplKSkgLyByZXNvbHV0aW9uKSxcbiAgICAgICAgICAgICAgICBncmlkWSA9IE1hdGguZmxvb3IoKHBvaW50LnkgLSAoeSAqIHRpbGVTaXplKSkgLyByZXNvbHV0aW9uKTtcblxuICAgICAgICAgICAgY2FsbGJhY2soZ3JpZChncmlkWCwgZ3JpZFkpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9jbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLmdldERhdGEoZS5sYXRsbmcsIEwuYmluZChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2NsaWNrJywge1xuICAgICAgICAgICAgICAgIGxhdExuZzogZS5sYXRsbmcsXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgX21vdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5nZXREYXRhKGUubGF0bG5nLCBMLmJpbmQoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgaWYgKGRhdGEgIT09IHRoaXMuX21vdXNlT24pIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbW91c2VPbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpcmUoJ21vdXNlb3V0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGF0TG5nOiBlLmxhdGxuZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuX21vdXNlT25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKCdtb3VzZW92ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgIGxhdExuZzogZS5sYXRsbmcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX21vdXNlT24gPSBkYXRhO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmUoJ21vdXNlbW92ZScsIHtcbiAgICAgICAgICAgICAgICAgICAgbGF0TG5nOiBlLmxhdGxuZyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIF9nZXRUaWxlVVJMOiBmdW5jdGlvbih0aWxlUG9pbnQpIHtcbiAgICAgICAgdmFyIHVybHMgPSB0aGlzLm9wdGlvbnMuZ3JpZHMsXG4gICAgICAgICAgICBpbmRleCA9ICh0aWxlUG9pbnQueCArIHRpbGVQb2ludC55KSAlIHVybHMubGVuZ3RoLFxuICAgICAgICAgICAgdXJsID0gdXJsc1tpbmRleF07XG5cbiAgICAgICAgcmV0dXJuIEwuVXRpbC50ZW1wbGF0ZSh1cmwsIHRpbGVQb2ludCk7XG4gICAgfSxcblxuICAgIC8vIExvYWQgdXAgYWxsIHJlcXVpcmVkIGpzb24gZ3JpZCBmaWxlc1xuICAgIF91cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKCkpIHJldHVybjtcblxuICAgICAgICB2YXIgYm91bmRzID0gdGhpcy5fbWFwLmdldFBpeGVsQm91bmRzKCksXG4gICAgICAgICAgICB6ID0gdGhpcy5fbWFwLmdldFpvb20oKSxcbiAgICAgICAgICAgIHRpbGVTaXplID0gMjU2O1xuXG4gICAgICAgIGlmICh6ID4gdGhpcy5vcHRpb25zLm1heFpvb20gfHwgeiA8IHRoaXMub3B0aW9ucy5taW5ab29tKSByZXR1cm47XG5cbiAgICAgICAgdmFyIG53VGlsZVBvaW50ID0gbmV3IEwuUG9pbnQoXG4gICAgICAgICAgICAgICAgTWF0aC5mbG9vcihib3VuZHMubWluLnggLyB0aWxlU2l6ZSksXG4gICAgICAgICAgICAgICAgTWF0aC5mbG9vcihib3VuZHMubWluLnkgLyB0aWxlU2l6ZSkpLFxuICAgICAgICAgICAgc2VUaWxlUG9pbnQgPSBuZXcgTC5Qb2ludChcbiAgICAgICAgICAgICAgICBNYXRoLmZsb29yKGJvdW5kcy5tYXgueCAvIHRpbGVTaXplKSxcbiAgICAgICAgICAgICAgICBNYXRoLmZsb29yKGJvdW5kcy5tYXgueSAvIHRpbGVTaXplKSksXG4gICAgICAgICAgICBtYXggPSB0aGlzLl9tYXAub3B0aW9ucy5jcnMuc2NhbGUoeikgLyB0aWxlU2l6ZTtcblxuICAgICAgICBmb3IgKHZhciB4ID0gbndUaWxlUG9pbnQueDsgeCA8PSBzZVRpbGVQb2ludC54OyB4KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSBud1RpbGVQb2ludC55OyB5IDw9IHNlVGlsZVBvaW50Lnk7IHkrKykge1xuICAgICAgICAgICAgICAgIC8vIHggd3JhcHBlZFxuICAgICAgICAgICAgICAgIHZhciB4dyA9ICh4ICsgbWF4KSAlIG1heCwgeXcgPSAoeSArIG1heCkgJSBtYXg7XG4gICAgICAgICAgICAgICAgdGhpcy5fZ2V0VGlsZSh6LCB4dywgeXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9nZXRUaWxlOiBmdW5jdGlvbih6LCB4LCB5LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIga2V5ID0geiArICdfJyArIHggKyAnXycgKyB5LFxuICAgICAgICAgICAgdGlsZVBvaW50ID0gTC5wb2ludCh4LCB5KTtcblxuICAgICAgICB0aWxlUG9pbnQueiA9IHo7XG5cbiAgICAgICAgaWYgKCF0aGlzLl90aWxlU2hvdWxkQmVMb2FkZWQodGlsZVBvaW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtleSBpbiB0aGlzLl9jYWNoZSkge1xuICAgICAgICAgICAgaWYgKCFjYWxsYmFjaykgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuX2NhY2hlW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayh0aGlzLl9jYWNoZVtrZXldKTsgLy8gQWxyZWFkeSBsb2FkZWRcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVba2V5XS5wdXNoKGNhbGxiYWNrKTsgLy8gUGVuZGluZ1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jYWNoZVtrZXldID0gW107XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZVtrZXldLnB1c2goY2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdCh0aGlzLl9nZXRUaWxlVVJMKHRpbGVQb2ludCksIEwuYmluZChmdW5jdGlvbihlcnIsIGpzb24pIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWNoZVtrZXldO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVba2V5XSA9IGdyaWQoanNvbik7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrc1tpXSh0aGlzLl9jYWNoZVtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICBfdGlsZVNob3VsZEJlTG9hZGVkOiBmdW5jdGlvbih0aWxlUG9pbnQpIHtcbiAgICAgICAgaWYgKHRpbGVQb2ludC56ID4gdGhpcy5vcHRpb25zLm1heFpvb20gfHwgdGlsZVBvaW50LnogPCB0aGlzLm9wdGlvbnMubWluWm9vbSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5ib3VuZHMpIHtcbiAgICAgICAgICAgIHZhciB0aWxlU2l6ZSA9IDI1NixcbiAgICAgICAgICAgICAgICBud1BvaW50ID0gdGlsZVBvaW50Lm11bHRpcGx5QnkodGlsZVNpemUpLFxuICAgICAgICAgICAgICAgIHNlUG9pbnQgPSBud1BvaW50LmFkZChuZXcgTC5Qb2ludCh0aWxlU2l6ZSwgdGlsZVNpemUpKSxcbiAgICAgICAgICAgICAgICBudyA9IHRoaXMuX21hcC51bnByb2plY3QobndQb2ludCksXG4gICAgICAgICAgICAgICAgc2UgPSB0aGlzLl9tYXAudW5wcm9qZWN0KHNlUG9pbnQpLFxuICAgICAgICAgICAgICAgIGJvdW5kcyA9IG5ldyBMLkxhdExuZ0JvdW5kcyhbbncsIHNlXSk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLmJvdW5kcy5pbnRlcnNlY3RzKGJvdW5kcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihfLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBHcmlkTGF5ZXIoXywgb3B0aW9ucyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgSW5mb0NvbnRyb2wgPSBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgICBvcHRpb25zOiB7XG4gICAgICAgIHBvc2l0aW9uOiAnYm90dG9tbGVmdCcsXG4gICAgICAgIHNhbml0aXplcjogcmVxdWlyZSgnc2FuaXRpemUtY2FqYScpLFxuICAgICAgICBlZGl0TGluazogZmFsc2VcbiAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2luZm8gPSB7fTtcbiAgICB9LFxuXG4gICAgb25BZGQ6IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbWFwYm94LWNvbnRyb2wtaW5mbyBtYXBib3gtc21hbGwnKTtcbiAgICAgICAgdGhpcy5fY29udGVudCA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdtYXAtaW5mby1jb250YWluZXInLCB0aGlzLl9jb250YWluZXIpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucG9zaXRpb24gPT09ICdib3R0b21yaWdodCcgfHxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9PT0gJ3RvcHJpZ2h0Jykge1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLmNsYXNzTmFtZSArPSAnIG1hcGJveC1jb250cm9sLWluZm8tcmlnaHQnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxpbmsgPSBMLkRvbVV0aWwuY3JlYXRlKCdhJywgJ21hcGJveC1pbmZvLXRvZ2dsZSBtYXBib3gtaWNvbiBtYXBib3gtaWNvbi1pbmZvJywgdGhpcy5fY29udGFpbmVyKTtcbiAgICAgICAgbGluay5ocmVmID0gJyMnO1xuXG4gICAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIobGluaywgJ2NsaWNrJywgdGhpcy5fc2hvd0luZm8sIHRoaXMpO1xuICAgICAgICBMLkRvbUV2ZW50LmRpc2FibGVDbGlja1Byb3BhZ2F0aW9uKHRoaXMuX2NvbnRhaW5lcik7XG5cbiAgICAgICAgZm9yICh2YXIgaSBpbiBtYXAuX2xheWVycykge1xuICAgICAgICAgICAgaWYgKG1hcC5fbGF5ZXJzW2ldLmdldEF0dHJpYnV0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRJbmZvKG1hcC5fbGF5ZXJzW2ldLmdldEF0dHJpYnV0aW9uKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbWFwXG4gICAgICAgICAgICAub24oJ2xheWVyYWRkJywgdGhpcy5fb25MYXllckFkZCwgdGhpcylcbiAgICAgICAgICAgIC5vbignbGF5ZXJyZW1vdmUnLCB0aGlzLl9vbkxheWVyUmVtb3ZlLCB0aGlzKTtcblxuICAgICAgICB0aGlzLl91cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcbiAgICB9LFxuXG4gICAgb25SZW1vdmU6IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICBtYXBcbiAgICAgICAgICAgIC5vZmYoJ2xheWVyYWRkJywgdGhpcy5fb25MYXllckFkZClcbiAgICAgICAgICAgIC5vZmYoJ2xheWVycmVtb3ZlJywgdGhpcy5fb25MYXllclJlbW92ZSk7XG4gICAgfSxcblxuICAgIGFkZEluZm86IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgaWYgKCF0ZXh0KSByZXR1cm4gdGhpcztcbiAgICAgICAgaWYgKCF0aGlzLl9pbmZvW3RleHRdKSB0aGlzLl9pbmZvW3RleHRdID0gMDtcblxuICAgICAgICB0aGlzLl9pbmZvW3RleHRdKys7XG4gICAgICAgIHJldHVybiB0aGlzLl91cGRhdGUoKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlSW5mbzogZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgaWYgKCF0ZXh0KSByZXR1cm4gdGhpcztcbiAgICAgICAgaWYgKHRoaXMuX2luZm9bdGV4dF0pIHRoaXMuX2luZm9bdGV4dF0tLTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZSgpO1xuICAgIH0sXG5cbiAgICBfc2hvd0luZm86IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdChlKTtcbiAgICAgICAgaWYgKHRoaXMuX2FjdGl2ZSA9PT0gdHJ1ZSkgcmV0dXJuIHRoaXMuX2hpZGVjb250ZW50KCk7XG5cbiAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLl9hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLl91cGRhdGUoKTtcbiAgICB9LFxuXG4gICAgX2hpZGVjb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY29udGVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdhY3RpdmUnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH0sXG5cbiAgICBfdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9tYXApIHsgcmV0dXJuIHRoaXM7IH1cbiAgICAgICAgdGhpcy5fY29udGVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgdmFyIGhpZGUgPSAnbm9uZSc7XG4gICAgICAgIHZhciBpbmZvID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzLl9pbmZvKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faW5mby5oYXNPd25Qcm9wZXJ0eShpKSAmJiB0aGlzLl9pbmZvW2ldKSB7XG4gICAgICAgICAgICAgICAgaW5mby5wdXNoKHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoaSkpO1xuICAgICAgICAgICAgICAgIGhpZGUgPSAnYmxvY2snO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY29udGVudC5pbm5lckhUTUwgKz0gaW5mby5qb2luKCcgfCAnKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmVkaXRMaW5rICYmICFMLkJyb3dzZXIubW9iaWxlKSB7XG4gICAgICAgICAgICB0aGlzLl9jb250ZW50LmlubmVySFRNTCArPSAoaW5mby5sZW5ndGgpID8gJyB8ICcgOiAnJztcbiAgICAgICAgICAgIHZhciBlZGl0ID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICcnLCB0aGlzLl9jb250ZW50KTtcbiAgICAgICAgICAgIGVkaXQuaHJlZiA9ICcjJztcbiAgICAgICAgICAgIGVkaXQuaW5uZXJIVE1MID0gJ0ltcHJvdmUgdGhpcyBtYXAnO1xuICAgICAgICAgICAgZWRpdC50aXRsZSA9ICdFZGl0IGluIE9wZW5TdHJlZXRNYXAnO1xuICAgICAgICAgICAgTC5Eb21FdmVudC5vbihlZGl0LCAnY2xpY2snLCBMLmJpbmQodGhpcy5fb3NtbGluaywgdGhpcyksIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIHJlc3VsdHMgaW4gX2luZm8gdGhlbiBoaWRlIHRoaXMuXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gaGlkZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9vc21saW5rOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNlbnRlciA9IHRoaXMuX21hcC5nZXRDZW50ZXIoKTtcbiAgICAgICAgdmFyIHogPSB0aGlzLl9tYXAuZ2V0Wm9vbSgpO1xuICAgICAgICB3aW5kb3cub3BlbignaHR0cDovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9lZGl0PycgKyAnem9vbT0nICsgeiArXG4gICAgICAgICcmbGF0PScgKyBjZW50ZXIubGF0ICsgJyZsb249JyArIGNlbnRlci5sbmcpO1xuICAgIH0sXG5cbiAgICBfb25MYXllckFkZDogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5sYXllci5nZXRBdHRyaWJ1dGlvbikge1xuICAgICAgICAgICAgdGhpcy5hZGRJbmZvKGUubGF5ZXIuZ2V0QXR0cmlidXRpb24oKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCdvbicgaW4gZS5sYXllciAmJiBlLmxheWVyLmdldEF0dHJpYnV0aW9uKSB7XG4gICAgICAgICAgICBlLmxheWVyLm9uKCdyZWFkeScsIEwuYmluZChmdW5jdGlvbigpIHsgdGhpcy5hZGRJbmZvKGUubGF5ZXIuZ2V0QXR0cmlidXRpb24oKSk7IH0sIHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfb25MYXllclJlbW92ZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGUubGF5ZXIuZ2V0QXR0cmlidXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlSW5mbyhlLmxheWVyLmdldEF0dHJpYnV0aW9uKCkpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgSW5mb0NvbnRyb2wob3B0aW9ucyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTGVnZW5kQ29udHJvbCA9IEwuQ29udHJvbC5leHRlbmQoe1xuXG4gICAgb3B0aW9uczoge1xuICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbXJpZ2h0JyxcbiAgICAgICAgc2FuaXRpemVyOiByZXF1aXJlKCdzYW5pdGl6ZS1jYWphJylcbiAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2xlZ2VuZHMgPSB7fTtcbiAgICB9LFxuXG4gICAgb25BZGQ6IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbWFwLWxlZ2VuZHMgd2F4LWxlZ2VuZHMnKTtcbiAgICAgICAgTC5Eb21FdmVudC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbih0aGlzLl9jb250YWluZXIpO1xuXG4gICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9jb250YWluZXI7XG4gICAgfSxcblxuICAgIGFkZExlZ2VuZDogZnVuY3Rpb24odGV4dCkge1xuICAgICAgICBpZiAoIXRleHQpIHsgcmV0dXJuIHRoaXM7IH1cblxuICAgICAgICBpZiAoIXRoaXMuX2xlZ2VuZHNbdGV4dF0pIHtcbiAgICAgICAgICAgIHRoaXMuX2xlZ2VuZHNbdGV4dF0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbGVnZW5kc1t0ZXh0XSsrO1xuICAgICAgICByZXR1cm4gdGhpcy5fdXBkYXRlKCk7XG4gICAgfSxcblxuICAgIHJlbW92ZUxlZ2VuZDogZnVuY3Rpb24odGV4dCkge1xuICAgICAgICBpZiAoIXRleHQpIHsgcmV0dXJuIHRoaXM7IH1cbiAgICAgICAgaWYgKHRoaXMuX2xlZ2VuZHNbdGV4dF0pIHRoaXMuX2xlZ2VuZHNbdGV4dF0tLTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZSgpO1xuICAgIH0sXG5cbiAgICBfdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9tYXApIHsgcmV0dXJuIHRoaXM7IH1cblxuICAgICAgICB0aGlzLl9jb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIHZhciBoaWRlID0gJ25vbmUnO1xuXG4gICAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5fbGVnZW5kcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2xlZ2VuZHMuaGFzT3duUHJvcGVydHkoaSkgJiYgdGhpcy5fbGVnZW5kc1tpXSkge1xuICAgICAgICAgICAgICAgIHZhciBkaXYgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbWFwLWxlZ2VuZCB3YXgtbGVnZW5kJywgdGhpcy5fY29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICBkaXYuaW5uZXJIVE1MID0gdGhpcy5vcHRpb25zLnNhbml0aXplcihpKTtcbiAgICAgICAgICAgICAgICBoaWRlID0gJ2Jsb2NrJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGhpZGUgdGhlIGNvbnRyb2wgZW50aXJlbHkgdW5sZXNzIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBsZWdlbmQ7XG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGVyZSB3aWxsIGJlIGEgc21hbGwgZ3JleSBibGVtaXNoIG9uIHRoZSBtYXAuXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gaGlkZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBMZWdlbmRDb250cm9sKG9wdGlvbnMpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJlcXVlc3QgPSByZXF1aXJlKCcuL3JlcXVlc3QnKSxcbiAgICB1cmwgPSByZXF1aXJlKCcuL3VybCcpLFxuICAgIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgX2xvYWRUaWxlSlNPTjogZnVuY3Rpb24oXykge1xuICAgICAgICBpZiAodHlwZW9mIF8gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAoXy5pbmRleE9mKCcvJykgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBfID0gdXJsLmJhc2UoKSArIF8gKyAnLmpzb24nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXF1ZXN0KHVybC5zZWN1cmVGbGFnKF8pLCBMLmJpbmQoZnVuY3Rpb24oZXJyLCBqc29uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICB1dGlsLmxvZygnY291bGQgbm90IGxvYWQgVGlsZUpTT04gYXQgJyArIF8pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpcmUoJ2Vycm9yJywge2Vycm9yOiBlcnJ9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0VGlsZUpTT04oanNvbik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyZSgncmVhZHknKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoXyAmJiB0eXBlb2YgXyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFRpbGVKU09OKF8pO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKSxcbiAgICB0aWxlTGF5ZXIgPSByZXF1aXJlKCcuL3RpbGVfbGF5ZXInKSxcbiAgICBtYXJrZXJMYXllciA9IHJlcXVpcmUoJy4vbWFya2VyX2xheWVyJyksXG4gICAgZ3JpZExheWVyID0gcmVxdWlyZSgnLi9ncmlkX2xheWVyJyksXG4gICAgZ3JpZENvbnRyb2wgPSByZXF1aXJlKCcuL2dyaWRfY29udHJvbCcpLFxuICAgIGluZm9Db250cm9sID0gcmVxdWlyZSgnLi9pbmZvX2NvbnRyb2wnKSxcbiAgICBzaGFyZUNvbnRyb2wgPSByZXF1aXJlKCcuL3NoYXJlX2NvbnRyb2wnKSxcbiAgICBsZWdlbmRDb250cm9sID0gcmVxdWlyZSgnLi9sZWdlbmRfY29udHJvbCcpO1xuXG52YXIgTE1hcCA9IEwuTWFwLmV4dGVuZCh7XG4gICAgaW5jbHVkZXM6IFtyZXF1aXJlKCcuL2xvYWRfdGlsZWpzb24nKV0sXG5cbiAgICBvcHRpb25zOiB7XG4gICAgICAgIHRpbGVMYXllcjoge30sXG4gICAgICAgIG1hcmtlckxheWVyOiB7fSxcbiAgICAgICAgZ3JpZExheWVyOiB7fSxcbiAgICAgICAgbGVnZW5kQ29udHJvbDoge30sXG4gICAgICAgIGdyaWRDb250cm9sOiB7fSxcbiAgICAgICAgaW5mb0NvbnRyb2w6IHt9LFxuICAgICAgICBhdHRyaWJ1dGlvbkNvbnRyb2w6IGZhbHNlLFxuICAgICAgICBzaGFyZUNvbnRyb2w6IGZhbHNlXG4gICAgfSxcblxuICAgIF90aWxlanNvbjoge30sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihlbGVtZW50LCBfLCBvcHRpb25zKSB7XG4gICAgICAgIEwuTWFwLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgZWxlbWVudCwgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gZGlzYWJsZSB0aGUgZGVmYXVsdCAnTGVhZmxldCcgdGV4dFxuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGlvbkNvbnRyb2wpIHRoaXMuYXR0cmlidXRpb25Db250cm9sLnNldFByZWZpeCgnJyk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50aWxlTGF5ZXIpIHtcbiAgICAgICAgICAgIHRoaXMudGlsZUxheWVyID0gdGlsZUxheWVyKHVuZGVmaW5lZCwgdGhpcy5vcHRpb25zLnRpbGVMYXllcik7XG4gICAgICAgICAgICB0aGlzLmFkZExheWVyKHRoaXMudGlsZUxheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWFya2VyTGF5ZXIpIHtcbiAgICAgICAgICAgIHRoaXMubWFya2VyTGF5ZXIgPSBtYXJrZXJMYXllcih1bmRlZmluZWQsIHRoaXMub3B0aW9ucy5tYXJrZXJMYXllcik7XG4gICAgICAgICAgICB0aGlzLmFkZExheWVyKHRoaXMubWFya2VyTGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5ncmlkTGF5ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JpZExheWVyID0gZ3JpZExheWVyKHVuZGVmaW5lZCwgdGhpcy5vcHRpb25zLmdyaWRMYXllcik7XG4gICAgICAgICAgICB0aGlzLmFkZExheWVyKHRoaXMuZ3JpZExheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZ3JpZExheWVyICYmIHRoaXMub3B0aW9ucy5ncmlkQ29udHJvbCkge1xuICAgICAgICAgICAgdGhpcy5ncmlkQ29udHJvbCA9IGdyaWRDb250cm9sKHRoaXMuZ3JpZExheWVyLCB0aGlzLm9wdGlvbnMuZ3JpZENvbnRyb2wpO1xuICAgICAgICAgICAgdGhpcy5hZGRDb250cm9sKHRoaXMuZ3JpZENvbnRyb2wpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbmZvQ29udHJvbCkge1xuICAgICAgICAgICAgdGhpcy5pbmZvQ29udHJvbCA9IGluZm9Db250cm9sKHRoaXMub3B0aW9ucy5pbmZvQ29udHJvbCk7XG4gICAgICAgICAgICB0aGlzLmFkZENvbnRyb2wodGhpcy5pbmZvQ29udHJvbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmxlZ2VuZENvbnRyb2wpIHtcbiAgICAgICAgICAgIHRoaXMubGVnZW5kQ29udHJvbCA9IGxlZ2VuZENvbnRyb2wodGhpcy5vcHRpb25zLmxlZ2VuZENvbnRyb2wpO1xuICAgICAgICAgICAgdGhpcy5hZGRDb250cm9sKHRoaXMubGVnZW5kQ29udHJvbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNoYXJlQ29udHJvbCkge1xuICAgICAgICAgICAgdGhpcy5zaGFyZUNvbnRyb2wgPSBzaGFyZUNvbnRyb2wodGhpcy5vcHRpb25zLnNoYXJlQ29udHJvbCk7XG4gICAgICAgICAgICB0aGlzLmFkZENvbnRyb2wodGhpcy5zaGFyZUNvbnRyb2wpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbG9hZFRpbGVKU09OKF8pO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGUgY2VydGFpbiBwcm9wZXJ0aWVzIG9uICdyZWFkeScgZXZlbnRcbiAgICBhZGRMYXllcjogZnVuY3Rpb24obGF5ZXIpIHtcbiAgICAgICAgaWYgKCdvbicgaW4gbGF5ZXIpIHsgbGF5ZXIub24oJ3JlYWR5JywgTC5iaW5kKGZ1bmN0aW9uKCkgeyB0aGlzLl91cGRhdGVMYXllcihsYXllcik7IH0sIHRoaXMpKTsgfVxuICAgICAgICByZXR1cm4gTC5NYXAucHJvdG90eXBlLmFkZExheWVyLmNhbGwodGhpcywgbGF5ZXIpO1xuICAgIH0sXG5cbiAgICAvLyB1c2UgYSBqYXZhc2NyaXB0IG9iamVjdCBvZiB0aWxlanNvbiBkYXRhIHRvIGNvbmZpZ3VyZSB0aGlzIGxheWVyXG4gICAgX3NldFRpbGVKU09OOiBmdW5jdGlvbihfKSB7XG4gICAgICAgIHRoaXMuX3RpbGVqc29uID0gXztcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZShfKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIGdldFRpbGVKU09OOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RpbGVqc29uO1xuICAgIH0sXG5cbiAgICBfaW5pdGlhbGl6ZTogZnVuY3Rpb24oanNvbikge1xuICAgICAgICBpZiAodGhpcy50aWxlTGF5ZXIpIHtcbiAgICAgICAgICAgIHRoaXMudGlsZUxheWVyLl9zZXRUaWxlSlNPTihqc29uKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUxheWVyKHRoaXMudGlsZUxheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1hcmtlckxheWVyICYmICF0aGlzLm1hcmtlckxheWVyLmdldEdlb0pTT04oKSAmJiBqc29uLmRhdGEgJiYganNvbi5kYXRhWzBdKSB7XG4gICAgICAgICAgICB0aGlzLm1hcmtlckxheWVyLmxvYWRVUkwoanNvbi5kYXRhWzBdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWRMYXllcikge1xuICAgICAgICAgICAgdGhpcy5ncmlkTGF5ZXIuX3NldFRpbGVKU09OKGpzb24pO1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlTGF5ZXIodGhpcy5ncmlkTGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW5mb0NvbnRyb2wgJiYganNvbi5hdHRyaWJ1dGlvbikge1xuICAgICAgICAgICAgdGhpcy5pbmZvQ29udHJvbC5hZGRJbmZvKGpzb24uYXR0cmlidXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubGVnZW5kQ29udHJvbCAmJiBqc29uLmxlZ2VuZCkge1xuICAgICAgICAgICAgdGhpcy5sZWdlbmRDb250cm9sLmFkZExlZ2VuZChqc29uLmxlZ2VuZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zaGFyZUNvbnRyb2wpIHtcbiAgICAgICAgICAgIHRoaXMuc2hhcmVDb250cm9sLl9zZXRUaWxlSlNPTihqc29uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fbG9hZGVkKSB7XG4gICAgICAgICAgICB2YXIgem9vbSA9IGpzb24uY2VudGVyWzJdLFxuICAgICAgICAgICAgICAgIGNlbnRlciA9IEwubGF0TG5nKGpzb24uY2VudGVyWzFdLCBqc29uLmNlbnRlclswXSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF91cGRhdGVMYXllcjogZnVuY3Rpb24obGF5ZXIpIHtcbiAgICAgICAgaWYgKCFsYXllci5vcHRpb25zKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHRoaXMuaW5mb0NvbnRyb2wgJiYgdGhpcy5fbG9hZGVkKSB7XG4gICAgICAgICAgICB0aGlzLmluZm9Db250cm9sLmFkZEluZm8obGF5ZXIub3B0aW9ucy5pbmZvQ29udHJvbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIShMLnN0YW1wKGxheWVyKSBpbiB0aGlzLl96b29tQm91bmRMYXllcnMpICYmXG4gICAgICAgICAgICAgICAgKGxheWVyLm9wdGlvbnMubWF4Wm9vbSB8fCBsYXllci5vcHRpb25zLm1pblpvb20pKSB7XG4gICAgICAgICAgICB0aGlzLl96b29tQm91bmRMYXllcnNbTC5zdGFtcChsYXllcildID0gbGF5ZXI7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl91cGRhdGVab29tTGV2ZWxzKCk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWxlbWVudCwgXywgb3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgTE1hcChlbGVtZW50LCBfLCBvcHRpb25zKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1cmwgPSByZXF1aXJlKCcuL3VybCcpLFxuICAgIHNhbml0aXplID0gcmVxdWlyZSgnc2FuaXRpemUtY2FqYScpO1xuXG4vLyBtYXBib3gtcmVsYXRlZCBtYXJrZXJzIGZ1bmN0aW9uYWxpdHlcbi8vIHByb3ZpZGUgYW4gaWNvbiBmcm9tIG1hcGJveCdzIHNpbXBsZS1zdHlsZSBzcGVjIGFuZCBob3N0ZWQgbWFya2Vyc1xuLy8gc2VydmljZVxuZnVuY3Rpb24gaWNvbihmcCkge1xuICAgIGZwID0gZnAgfHwge307XG5cbiAgICB2YXIgc2l6ZXMgPSB7XG4gICAgICAgICAgICBzbWFsbDogWzIwLCA1MF0sXG4gICAgICAgICAgICBtZWRpdW06IFszMCwgNzBdLFxuICAgICAgICAgICAgbGFyZ2U6IFszNSwgOTBdXG4gICAgICAgIH0sXG4gICAgICAgIHNpemUgPSBmcFsnbWFya2VyLXNpemUnXSB8fCAnbWVkaXVtJyxcbiAgICAgICAgc3ltYm9sID0gKGZwWydtYXJrZXItc3ltYm9sJ10pID8gJy0nICsgZnBbJ21hcmtlci1zeW1ib2wnXSA6ICcnLFxuICAgICAgICBjb2xvciA9IChmcFsnbWFya2VyLWNvbG9yJ10gfHwgJzdlN2U3ZScpLnJlcGxhY2UoJyMnLCAnJyk7XG5cbiAgICByZXR1cm4gTC5pY29uKHtcbiAgICAgICAgaWNvblVybDogdXJsLmJhc2UoKSArICdtYXJrZXIvJyArXG4gICAgICAgICAgICAncGluLScgKyBzaXplLmNoYXJBdCgwKSArIHN5bWJvbCArICcrJyArIGNvbG9yICtcbiAgICAgICAgICAgIC8vIGRldGVjdCBhbmQgdXNlIHJldGluYSBtYXJrZXJzLCB3aGljaCBhcmUgeDIgcmVzb2x1dGlvblxuICAgICAgICAgICAgKChMLkJyb3dzZXIucmV0aW5hKSA/ICdAMngnIDogJycpICsgJy5wbmcnLFxuICAgICAgICBpY29uU2l6ZTogc2l6ZXNbc2l6ZV0sXG4gICAgICAgIGljb25BbmNob3I6IFtzaXplc1tzaXplXVswXSAvIDIsIHNpemVzW3NpemVdWzFdIC8gMl0sXG4gICAgICAgIHBvcHVwQW5jaG9yOiBbMCwgLXNpemVzW3NpemVdWzFdIC8gMl1cbiAgICB9KTtcbn1cblxuLy8gYSBmYWN0b3J5IHRoYXQgcHJvdmlkZXMgbWFya2VycyBmb3IgTGVhZmxldCBmcm9tIE1hcEJveCdzXG4vLyBbc2ltcGxlLXN0eWxlIHNwZWNpZmljYXRpb25dKGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvc2ltcGxlc3R5bGUtc3BlYylcbi8vIGFuZCBbTWFya2VycyBBUEldKGh0dHA6Ly9tYXBib3guY29tL2RldmVsb3BlcnMvYXBpLyNtYXJrZXJzKS5cbmZ1bmN0aW9uIHN0eWxlKGYsIGxhdGxvbikge1xuICAgIHJldHVybiBMLm1hcmtlcihsYXRsb24sIHtcbiAgICAgICAgaWNvbjogaWNvbihmLnByb3BlcnRpZXMpLFxuICAgICAgICB0aXRsZTogKGYucHJvcGVydGllcyAmJiBmLnByb3BlcnRpZXMudGl0bGUpIHx8ICcnXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVBvcHVwKGYsIHNhbml0aXplcikge1xuICAgIGlmICghZiB8fCAhZi5wcm9wZXJ0aWVzKSByZXR1cm4gJyc7XG4gICAgdmFyIHBvcHVwID0gJyc7XG5cbiAgICBpZiAoZi5wcm9wZXJ0aWVzLnRpdGxlKSB7XG4gICAgICAgIHBvcHVwICs9ICc8ZGl2IGNsYXNzPVwibWFya2VyLXRpdGxlXCI+JyArIGYucHJvcGVydGllcy50aXRsZSArICc8L2Rpdj4nO1xuICAgIH1cblxuICAgIGlmIChmLnByb3BlcnRpZXMuZGVzY3JpcHRpb24pIHtcbiAgICAgICAgcG9wdXAgKz0gJzxkaXYgY2xhc3M9XCJtYXJrZXItZGVzY3JpcHRpb25cIj4nICsgZi5wcm9wZXJ0aWVzLmRlc2NyaXB0aW9uICsgJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgcmV0dXJuIChzYW5pdGl6ZXIgfHwgc2FuaXRpemUpKHBvcHVwKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaWNvbjogaWNvbixcbiAgICBzdHlsZTogc3R5bGUsXG4gICAgY3JlYXRlUG9wdXA6IGNyZWF0ZVBvcHVwXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIHVybGhlbHBlciA9IHJlcXVpcmUoJy4vdXJsJyk7XG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJy4vcmVxdWVzdCcpO1xudmFyIG1hcmtlciA9IHJlcXVpcmUoJy4vbWFya2VyJyk7XG5cbi8vICMgbWFya2VyTGF5ZXJcbi8vXG4vLyBBIGxheWVyIG9mIG1hcmtlcnMsIGxvYWRlZCBmcm9tIE1hcEJveCBvciBlbHNlLiBBZGRzIHRoZSBhYmlsaXR5XG4vLyB0byByZXNldCBtYXJrZXJzLCBmaWx0ZXIgdGhlbSwgYW5kIGxvYWQgdGhlbSBmcm9tIGEgR2VvSlNPTiBVUkwuXG52YXIgTWFya2VyTGF5ZXIgPSBMLkZlYXR1cmVHcm91cC5leHRlbmQoe1xuICAgIG9wdGlvbnM6IHtcbiAgICAgICAgZmlsdGVyOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH0sXG4gICAgICAgIHNhbml0aXplcjogcmVxdWlyZSgnc2FuaXRpemUtY2FqYScpXG4gICAgfSxcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKF8sIG9wdGlvbnMpIHtcbiAgICAgICAgTC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuX2xheWVycyA9IHt9O1xuXG4gICAgICAgIGlmICh0eXBlb2YgXyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHV0aWwuaWRVcmwoXywgdGhpcyk7XG4gICAgICAgIC8vIGphdmFzY3JpcHQgb2JqZWN0IG9mIFRpbGVKU09OIGRhdGFcbiAgICAgICAgfSBlbHNlIGlmIChfICYmIHR5cGVvZiBfID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGhpcy5zZXRHZW9KU09OKF8pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNldEdlb0pTT046IGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgdGhpcy5fZ2VvanNvbiA9IF87XG4gICAgICAgIHRoaXMuY2xlYXJMYXllcnMoKTtcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZShfKTtcbiAgICB9LFxuXG4gICAgZ2V0R2VvSlNPTjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZW9qc29uO1xuICAgIH0sXG5cbiAgICBsb2FkVVJMOiBmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgaWYgKHRoaXMuX3JlcXVlc3QgJiYgJ2Fib3J0JyBpbiB0aGlzLl9yZXF1ZXN0KSB0aGlzLl9yZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHVybCA9IHVybGhlbHBlci5qc29uaWZ5KHVybCk7XG4gICAgICAgIHRoaXMuX3JlcXVlc3QgPSByZXF1ZXN0KHVybCwgTC5iaW5kKGZ1bmN0aW9uKGVyciwganNvbikge1xuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZXJyICYmIGVyci50eXBlICE9PSAnYWJvcnQnKSB7XG4gICAgICAgICAgICAgICAgdXRpbC5sb2coJ2NvdWxkIG5vdCBsb2FkIG1hcmtlcnMgYXQgJyArIHVybCk7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKCdlcnJvcicsIHtlcnJvcjogZXJyfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGpzb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEdlb0pTT04oanNvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKCdyZWFkeScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBsb2FkSUQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvYWRVUkwodXJsaGVscGVyLmJhc2UoKSArIGlkICsgJy9tYXJrZXJzLmdlb2pzb24nKTtcbiAgICB9LFxuXG4gICAgc2V0RmlsdGVyOiBmdW5jdGlvbihfKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5maWx0ZXIgPSBfO1xuICAgICAgICBpZiAodGhpcy5fZ2VvanNvbikge1xuICAgICAgICAgICAgdGhpcy5jbGVhckxheWVycygpO1xuICAgICAgICAgICAgdGhpcy5faW5pdGlhbGl6ZSh0aGlzLl9nZW9qc29uKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgZ2V0RmlsdGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5maWx0ZXI7XG4gICAgfSxcblxuICAgIF9pbml0aWFsaXplOiBmdW5jdGlvbihqc29uKSB7XG4gICAgICAgIHZhciBmZWF0dXJlcyA9IEwuVXRpbC5pc0FycmF5KGpzb24pID8ganNvbiA6IGpzb24uZmVhdHVyZXMsXG4gICAgICAgICAgICBpLCBsZW47XG5cbiAgICAgICAgaWYgKGZlYXR1cmVzKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSBmZWF0dXJlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIC8vIE9ubHkgYWRkIHRoaXMgaWYgZ2VvbWV0cnkgb3IgZ2VvbWV0cmllcyBhcmUgc2V0IGFuZCBub3QgbnVsbFxuICAgICAgICAgICAgICAgIGlmIChmZWF0dXJlc1tpXS5nZW9tZXRyaWVzIHx8IGZlYXR1cmVzW2ldLmdlb21ldHJ5IHx8IGZlYXR1cmVzW2ldLmZlYXR1cmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXRpYWxpemUoZmVhdHVyZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZmlsdGVyKGpzb24pKSB7XG5cbiAgICAgICAgICAgIHZhciBsYXllciA9IEwuR2VvSlNPTi5nZW9tZXRyeVRvTGF5ZXIoanNvbiwgbWFya2VyLnN0eWxlKSxcbiAgICAgICAgICAgICAgICBwb3B1cEh0bWwgPSBtYXJrZXIuY3JlYXRlUG9wdXAoanNvbiwgdGhpcy5vcHRpb25zLnNhbml0aXplcik7XG5cbiAgICAgICAgICAgIGxheWVyLmZlYXR1cmUgPSBqc29uO1xuXG4gICAgICAgICAgICBpZiAocG9wdXBIdG1sKSB7XG4gICAgICAgICAgICAgICAgbGF5ZXIuYmluZFBvcHVwKHBvcHVwSHRtbCwge1xuICAgICAgICAgICAgICAgICAgICBjbG9zZUJ1dHRvbjogZmFsc2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5hZGRMYXllcihsYXllcik7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihfLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBNYXJrZXJMYXllcihfLCBvcHRpb25zKTtcbn07XG4iLCJ2YXIgY29yc2xpdGUgPSByZXF1aXJlKCdjb3JzbGl0ZScpLFxuICAgIEpTT04zID0gcmVxdWlyZSgnanNvbjMnKSxcbiAgICBzdHJpY3QgPSByZXF1aXJlKCcuL3V0aWwnKS5zdHJpY3Q7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBzdHJpY3QodXJsLCAnc3RyaW5nJyk7XG4gICAgc3RyaWN0KGNhbGxiYWNrLCAnZnVuY3Rpb24nKTtcbiAgICByZXR1cm4gY29yc2xpdGUodXJsLCBvbmxvYWQpO1xuICAgIGZ1bmN0aW9uIG9ubG9hZChlcnIsIHJlc3ApIHtcbiAgICAgICAgaWYgKCFlcnIgJiYgcmVzcCkge1xuICAgICAgICAgICAgLy8gaGFyZGNvZGVkIGdyaWQgcmVzcG9uc2VcbiAgICAgICAgICAgIGlmIChyZXNwLnJlc3BvbnNlVGV4dFswXSA9PSAnZycpIHtcbiAgICAgICAgICAgICAgICByZXNwID0gSlNPTjMucGFyc2UocmVzcC5yZXNwb25zZVRleHRcbiAgICAgICAgICAgICAgICAgICAgLnN1YnN0cmluZyg1LCByZXNwLnJlc3BvbnNlVGV4dC5sZW5ndGggLSAyKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3AgPSBKU09OMy5wYXJzZShyZXNwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2soZXJyLCByZXNwKTtcbiAgICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXJsID0gcmVxdWlyZSgnLi91cmwnKTtcblxudmFyIFNoYXJlQ29udHJvbCA9IEwuQ29udHJvbC5leHRlbmQoe1xuICAgIGluY2x1ZGVzOiBbcmVxdWlyZSgnLi9sb2FkX3RpbGVqc29uJyldLFxuXG4gICAgb3B0aW9uczoge1xuICAgICAgICBwb3NpdGlvbjogJ3RvcGxlZnQnLFxuICAgICAgICB1cmw6ICcnXG4gICAgfSxcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKF8sIG9wdGlvbnMpIHtcbiAgICAgICAgTC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9sb2FkVGlsZUpTT04oXyk7XG4gICAgfSxcblxuICAgIF9zZXRUaWxlSlNPTjogZnVuY3Rpb24oanNvbikge1xuICAgICAgICB0aGlzLl90aWxlanNvbiA9IGpzb247XG4gICAgfSxcblxuICAgIG9uQWRkOiBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgdGhpcy5fbWFwID0gbWFwO1xuICAgICAgICB0aGlzLl91cmwgPSB1cmw7XG5cbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWNvbnRyb2wtbWFwYm94LXNoYXJlIGxlYWZsZXQtYmFyJyk7XG4gICAgICAgIHZhciBsaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICdtYXBib3gtc2hhcmUgbWFwYm94LWljb24gbWFwYm94LWljb24tc2hhcmUnLCBjb250YWluZXIpO1xuICAgICAgICBsaW5rLmhyZWYgPSAnIyc7XG5cbiAgICAgICAgdGhpcy5fbW9kYWwgPSBtYXAuX2NyZWF0ZVBhbmUoJ21hcGJveC1tb2RhbCcsIHRoaXMuX21hcC5fY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5fbWFzayA9IG1hcC5fY3JlYXRlUGFuZSgnbWFwYm94LW1vZGFsLW1hc2snLCB0aGlzLl9tb2RhbCk7XG4gICAgICAgIHRoaXMuX2NvbnRlbnQgPSBtYXAuX2NyZWF0ZVBhbmUoJ21hcGJveC1tb2RhbC1jb250ZW50JywgdGhpcy5fbW9kYWwpO1xuXG4gICAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIobGluaywgJ2NsaWNrJywgdGhpcy5fc2hhcmVDbGljaywgdGhpcyk7XG4gICAgICAgIEwuRG9tRXZlbnQuZGlzYWJsZUNsaWNrUHJvcGFnYXRpb24oY29udGFpbmVyKTtcblxuICAgICAgICB0aGlzLl9tYXAub24oJ21vdXNlZG93bicsIHRoaXMuX2NsaWNrT3V0LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH0sXG5cbiAgICBfY2xpY2tPdXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NoYXJpbmcpIHtcbiAgICAgICAgICAgIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XG4gICAgICAgICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fbW9kYWwsICdhY3RpdmUnKTtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRlbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICB0aGlzLl9zaGFyaW5nID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfc2hhcmVDbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICBMLkRvbUV2ZW50LnN0b3AoZSk7XG4gICAgICAgIGlmICh0aGlzLl9zaGFyaW5nKSByZXR1cm4gdGhpcy5fY2xpY2tPdXQoZSk7XG5cbiAgICAgICAgdmFyIHRpbGVqc29uID0gdGhpcy5fdGlsZWpzb24gfHwgdGhpcy5fbWFwLl90aWxlanNvbiB8fCB7fSxcbiAgICAgICAgICAgIHVybCA9IGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLm9wdGlvbnMudXJsIHx8IHRpbGVqc29uLndlYnBhZ2UgfHwgd2luZG93LmxvY2F0aW9uKSxcbiAgICAgICAgICAgIG5hbWUgPSBlbmNvZGVVUklDb21wb25lbnQodGlsZWpzb24ubmFtZSksXG4gICAgICAgICAgICBpbWFnZSA9IHRoaXMuX3VybC5iYXNlKCkgKyB0aWxlanNvbi5pZCArICcvJyArIHRoaXMuX21hcC5nZXRDZW50ZXIoKS5sbmcgKyAnLCcgKyB0aGlzLl9tYXAuZ2V0Q2VudGVyKCkubGF0ICsgJywnICsgdGhpcy5fbWFwLmdldFpvb20oKSArICcvNjAweDYwMC5wbmcnLFxuICAgICAgICAgICAgdHdpdHRlciA9ICcvL3R3aXR0ZXIuY29tL2ludGVudC90d2VldD9zdGF0dXM9JyArIG5hbWUgKyAnICcgKyB1cmwsXG4gICAgICAgICAgICBmYWNlYm9vayA9ICcvL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyLnBocD91PScgKyB1cmwgKyAnJnQ9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aWxlanNvbi5uYW1lKSxcbiAgICAgICAgICAgIHBpbnRlcmVzdCA9ICcvL3d3dy5waW50ZXJlc3QuY29tL3Bpbi9jcmVhdGUvYnV0dG9uLz91cmw9JyArIHVybCArICcmbWVkaWE9JyArIGltYWdlICsgJyZkZXNjcmlwdGlvbj0nICsgdGlsZWpzb24ubmFtZSxcbiAgICAgICAgICAgIHNoYXJlID0gKFwiPGgzPlNoYXJlIHRoaXMgbWFwPC9oMz5cIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGRpdiBjbGFzcz0nbWFwYm94LXNoYXJlLWJ1dHRvbnMnPjxhIGNsYXNzPSdtYXBib3gtYnV0dG9uIG1hcGJveC1idXR0b24taWNvbiBtYXBib3gtaWNvbi1mYWNlYm9vaycgdGFyZ2V0PSdfYmxhbmsnIGhyZWY9J3t7ZmFjZWJvb2t9fSc+RmFjZWJvb2s8L2E+XCIgK1xuICAgICAgICAgICAgICAgICAgICBcIjxhIGNsYXNzPSdtYXBib3gtYnV0dG9uIG1hcGJveC1idXR0b24taWNvbiBtYXBib3gtaWNvbi10d2l0dGVyJyB0YXJnZXQ9J19ibGFuaycgaHJlZj0ne3t0d2l0dGVyfX0nPlR3aXR0ZXI8L2E+XCIgK1xuICAgICAgICAgICAgICAgICAgICBcIjxhIGNsYXNzPSdtYXBib3gtYnV0dG9uIG1hcGJveC1idXR0b24taWNvbiBtYXBib3gtaWNvbi1waW50ZXJlc3QnIHRhcmdldD0nX2JsYW5rJyBocmVmPSd7e3BpbnRlcmVzdH19Jz5QaW50ZXJlc3Q8L2E+PC9kaXY+XCIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCd7e3R3aXR0ZXJ9fScsIHR3aXR0ZXIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCd7e2ZhY2Vib29rfX0nLCBmYWNlYm9vaylcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJ3t7cGludGVyZXN0fX0nLCBwaW50ZXJlc3QpLFxuICAgICAgICAgICAgZW1iZWRWYWx1ZSA9ICc8aWZyYW1lIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjUwMHB4XCIgZnJhbWVCb3JkZXI9XCIwXCIgc3JjPVwie3tlbWJlZH19XCI+PC9pZnJhbWU+Jy5yZXBsYWNlKCd7e2VtYmVkfX0nLCB0aWxlanNvbi5lbWJlZCB8fCB3aW5kb3cubG9jYXRpb24pLFxuICAgICAgICAgICAgZW1iZWRMYWJlbCA9ICdDb3B5IGFuZCBwYXN0ZSB0aGlzIDxzdHJvbmc+SFRNTCBjb2RlPC9zdHJvbmc+IGludG8gZG9jdW1lbnRzIHRvIGVtYmVkIHRoaXMgbWFwIG9uIHdlYiBwYWdlcy4nO1xuXG4gICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9tb2RhbCwgJ2FjdGl2ZScpO1xuXG4gICAgICAgIHRoaXMuX3NoYXJpbmcgPSB0aGlzLl9tYXAuX2NyZWF0ZVBhbmUoJ21hcGJveC1tb2RhbC1ib2R5JywgdGhpcy5fY29udGVudCk7XG4gICAgICAgIHRoaXMuX3NoYXJpbmcuaW5uZXJIVE1MID0gc2hhcmU7XG5cbiAgICAgICAgdmFyIGVtYmVkID0gTC5Eb21VdGlsLmNyZWF0ZSgnaW5wdXQnLCAnbWFwYm94LWVtYmVkJywgdGhpcy5fc2hhcmluZyk7XG4gICAgICAgIGVtYmVkLnR5cGUgPSAndGV4dCc7XG4gICAgICAgIGVtYmVkLnZhbHVlID0gZW1iZWRWYWx1ZTtcblxuICAgICAgICB2YXIgbGFiZWwgPSBMLkRvbVV0aWwuY3JlYXRlKCdsYWJlbCcsICdtYXBib3gtZW1iZWQtZGVzY3JpcHRpb24nLCB0aGlzLl9zaGFyaW5nKTtcbiAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gZW1iZWRMYWJlbDtcblxuICAgICAgICB2YXIgY2xvc2UgPSBMLkRvbVV0aWwuY3JlYXRlKCdhJywgJ2xlYWZsZXQtcG9wdXAtY2xvc2UtYnV0dG9uJywgdGhpcy5fc2hhcmluZyk7XG4gICAgICAgIGNsb3NlLmhyZWYgPSAnIyc7XG5cbiAgICAgICAgTC5Eb21FdmVudC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbih0aGlzLl9zaGFyaW5nKTtcbiAgICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihjbG9zZSwgJ2NsaWNrJywgdGhpcy5fY2xpY2tPdXQsIHRoaXMpO1xuICAgICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKGVtYmVkLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnRhcmdldC5mb2N1cygpO1xuICAgICAgICAgICAgZS50YXJnZXQuc2VsZWN0KCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKF8sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IFNoYXJlQ29udHJvbChfLCBvcHRpb25zKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gICAgdXJsID0gcmVxdWlyZSgnLi91cmwnKTtcblxudmFyIFRpbGVMYXllciA9IEwuVGlsZUxheWVyLmV4dGVuZCh7XG4gICAgaW5jbHVkZXM6IFtyZXF1aXJlKCcuL2xvYWRfdGlsZWpzb24nKV0sXG5cbiAgICBvcHRpb25zOiB7XG4gICAgICAgIGZvcm1hdDogJ3BuZydcbiAgICB9LFxuXG4gICAgLy8gaHR0cDovL21hcGJveC5jb20vZGV2ZWxvcGVycy9hcGkvI2ltYWdlX3F1YWxpdHlcbiAgICBmb3JtYXRzOiBbXG4gICAgICAgICdwbmcnLFxuICAgICAgICAvLyBQTkdcbiAgICAgICAgJ3BuZzMyJywgJ3BuZzY0JywgJ3BuZzEyOCcsICdwbmcyNTYnLFxuICAgICAgICAvLyBKUEdcbiAgICAgICAgJ2pwZzcwJywgJ2pwZzgwJywgJ2pwZzkwJ10sXG5cbiAgICBzY2FsZVByZWZpeDogJ0AyeC4nLFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oXywgb3B0aW9ucykge1xuICAgICAgICBMLlRpbGVMYXllci5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIHVuZGVmaW5lZCwgb3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5fdGlsZWpzb24gPSB7fTtcblxuICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmRldGVjdFJldGluYSAmJlxuICAgICAgICAgICAgTC5Ccm93c2VyLnJldGluYSAmJiBvcHRpb25zLnJldGluYVZlcnNpb24pIHtcbiAgICAgICAgICAgIF8gPSBvcHRpb25zLnJldGluYVZlcnNpb247XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmZvcm1hdCkge1xuICAgICAgICAgICAgdXRpbC5zdHJpY3Rfb25lb2Yob3B0aW9ucy5mb3JtYXQsIHRoaXMuZm9ybWF0cyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9sb2FkVGlsZUpTT04oXyk7XG4gICAgfSxcblxuICAgIHNldEZvcm1hdDogZnVuY3Rpb24oXykge1xuICAgICAgICB1dGlsLnN0cmljdChfLCAnc3RyaW5nJyk7XG4gICAgICAgIHRoaXMub3B0aW9ucy5mb3JtYXQgPSBfO1xuICAgICAgICB0aGlzLnJlZHJhdygpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX2F1dG9TY2FsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMgJiZcbiAgICAgICAgICAgIEwuQnJvd3Nlci5yZXRpbmEgJiZcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5kZXRlY3RSZXRpbmEgJiZcbiAgICAgICAgICAgICghdGhpcy5vcHRpb25zLnJldGluYVZlcnNpb24pICYmXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuYXV0b3NjYWxlO1xuICAgIH0sXG5cbiAgICAvLyBkaXNhYmxlIHRoZSBzZXRVcmwgZnVuY3Rpb24sIHdoaWNoIGlzIG5vdCBhdmFpbGFibGUgb24gbWFwYm94IHRpbGVsYXllcnNcbiAgICBzZXRVcmw6IG51bGwsXG5cbiAgICBfc2V0VGlsZUpTT046IGZ1bmN0aW9uKGpzb24pIHtcbiAgICAgICAgdXRpbC5zdHJpY3QoanNvbiwgJ29iamVjdCcpO1xuXG4gICAgICAgIEwuZXh0ZW5kKHRoaXMub3B0aW9ucywge1xuICAgICAgICAgICAgdGlsZXM6IGpzb24udGlsZXMsXG4gICAgICAgICAgICBhdHRyaWJ1dGlvbjoganNvbi5hdHRyaWJ1dGlvbixcbiAgICAgICAgICAgIG1pblpvb206IGpzb24ubWluem9vbSxcbiAgICAgICAgICAgIG1heFpvb206IGpzb24ubWF4em9vbSxcbiAgICAgICAgICAgIGF1dG9zY2FsZToganNvbi5hdXRvc2NhbGUgfHwgZmFsc2UsXG4gICAgICAgICAgICB0bXM6IGpzb24uc2NoZW1lID09PSAndG1zJyxcbiAgICAgICAgICAgIGJvdW5kczoganNvbi5ib3VuZHMgJiYgdXRpbC5sYm91bmRzKGpzb24uYm91bmRzKVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl90aWxlanNvbiA9IGpzb247XG4gICAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBnZXRUaWxlSlNPTjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90aWxlanNvbjtcbiAgICB9LFxuXG4gICAgLy8gdGhpcyBpcyBhbiBleGNlcHRpb24gdG8gbWFwYm94LmpzIG5hbWluZyBydWxlcyBiZWNhdXNlIGl0J3MgY2FsbGVkXG4gICAgLy8gYnkgYEwubWFwYFxuICAgIGdldFRpbGVVcmw6IGZ1bmN0aW9uKHRpbGVQb2ludCkge1xuICAgICAgICB2YXIgdGlsZXMgPSB0aGlzLm9wdGlvbnMudGlsZXMsXG4gICAgICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5hYnModGlsZVBvaW50LnggKyB0aWxlUG9pbnQueSkgJSB0aWxlcy5sZW5ndGgpLFxuICAgICAgICAgICAgdXJsID0gdGlsZXNbaW5kZXhdO1xuXG4gICAgICAgIHZhciB0ZW1wbGF0ZWQgPSBMLlV0aWwudGVtcGxhdGUodXJsLCB0aWxlUG9pbnQpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZWQucmVwbGFjZSgnLnBuZycsXG4gICAgICAgICAgICAgICAgKHRoaXMuX2F1dG9TY2FsZSgpID8gdGhpcy5zY2FsZVByZWZpeCA6ICcuJykgKyB0aGlzLm9wdGlvbnMuZm9ybWF0KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBUaWxlSlNPTi5UaWxlTGF5ZXJzIGFyZSBhZGRlZCB0byB0aGUgbWFwIGltbWVkaWF0ZWx5LCBzbyB0aGF0IHRoZXkgZ2V0XG4gICAgLy8gdGhlIGRlc2lyZWQgei1pbmRleCwgYnV0IGRvIG5vdCB1cGRhdGUgdW50aWwgdGhlIFRpbGVKU09OIGhhcyBiZWVuIGxvYWRlZC5cbiAgICBfdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50aWxlcykge1xuICAgICAgICAgICAgTC5UaWxlTGF5ZXIucHJvdG90eXBlLl91cGRhdGUuY2FsbCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKF8sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IFRpbGVMYXllcihfLCBvcHRpb25zKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuXG4vLyBSZXR1cm4gdGhlIGJhc2UgdXJsIG9mIGEgc3BlY2lmaWMgdmVyc2lvbiBvZiBNYXBCb3gncyBBUEkuXG4vL1xuLy8gYGhhc2hgLCBpZiBwcm92aWRlZCBtdXN0IGJlIGEgbnVtYmVyIGFuZCBpcyB1c2VkIHRvIGRpc3RyaWJ1dGUgcmVxdWVzdHNcbi8vIGFnYWluc3QgbXVsdGlwbGUgYENOQU1FYHMgaW4gb3JkZXIgdG8gYXZvaWQgY29ubmVjdGlvbiBsaW1pdHMgaW4gYnJvd3NlcnNcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGlzU1NMOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICdodHRwczonID09PSBkb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbCB8fCBjb25maWcuRk9SQ0VfSFRUUFM7XG4gICAgfSxcbiAgICBiYXNlOiBmdW5jdGlvbihoYXNoKSB7XG4gICAgICAgIC8vIEJ5IGRlZmF1bHQsIHVzZSBwdWJsaWMgSFRUUCB1cmxzXG4gICAgICAgIC8vIFN1cHBvcnQgSFRUUFMgaWYgdGhlIHVzZXIgaGFzIHNwZWNpZmllZCBIVFRQUyB1cmxzIHRvIHVzZSwgYW5kIHRoaXNcbiAgICAgICAgLy8gcGFnZSBpcyB1bmRlciBIVFRQU1xuICAgICAgICB2YXIgdXJscyA9IHRoaXMuaXNTU0woKSA/IGNvbmZpZy5IVFRQU19VUkxTIDogY29uZmlnLkhUVFBfVVJMUztcbiAgICAgICAgaWYgKGhhc2ggPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgaGFzaCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiB1cmxzWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHVybHNbaGFzaCAlIHVybHMubGVuZ3RoXTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8gUmVxdWVzdHMgdGhhdCBjb250YWluIFVSTHMgbmVlZCBhIHNlY3VyZSBmbGFnIGFwcGVuZGVkXG4gICAgLy8gdG8gdGhlaXIgVVJMcyBzbyB0aGF0IHRoZSBzZXJ2ZXIga25vd3MgdG8gc2VuZCBTU0wtaWZpZWRcbiAgICAvLyByZXNvdXJjZSByZWZlcmVuY2VzLlxuICAgIHNlY3VyZUZsYWc6IGZ1bmN0aW9uKHVybCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNTU0woKSkgcmV0dXJuIHVybDtcbiAgICAgICAgZWxzZSBpZiAodXJsLm1hdGNoKC8oXFw/fCYpc2VjdXJlLykpIHJldHVybiB1cmw7XG4gICAgICAgIGVsc2UgaWYgKHVybC5pbmRleE9mKCc/JykgIT09IC0xKSByZXR1cm4gdXJsICsgJyZzZWN1cmUnO1xuICAgICAgICBlbHNlIHJldHVybiB1cmwgKyAnP3NlY3VyZSc7XG4gICAgfSxcbiAgICAvLyBDb252ZXJ0IGEgSlNPTlAgdXJsIHRvIGEgSlNPTiBVUkwuIChNYXBCb3ggVGlsZUpTT04gc29tZXRpbWVzIGhhcmRjb2RlcyBKU09OUC4pXG4gICAganNvbmlmeTogZnVuY3Rpb24odXJsKSB7XG4gICAgICAgIHJldHVybiB1cmwucmVwbGFjZSgvXFwuKGdlbyk/anNvbnAoPz0kfFxcPykvLCAnLiQxanNvbicpO1xuICAgIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGlkVXJsOiBmdW5jdGlvbihfLCB0KSB7XG4gICAgICAgIGlmIChfLmluZGV4T2YoJy8nKSA9PSAtMSkgdC5sb2FkSUQoXyk7XG4gICAgICAgIGVsc2UgdC5sb2FkVVJMKF8pO1xuICAgIH0sXG4gICAgbG9nOiBmdW5jdGlvbihfKSB7XG4gICAgICAgIGlmIChjb25zb2xlICYmIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKF8pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBzdHJpY3Q6IGZ1bmN0aW9uKF8sIHR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBfICE9PSB0eXBlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXJndW1lbnQ6ICcgKyB0eXBlICsgJyBleHBlY3RlZCcpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBzdHJpY3RfaW5zdGFuY2U6IGZ1bmN0aW9uKF8sIGtsYXNzLCBuYW1lKSB7XG4gICAgICAgIGlmICghKF8gaW5zdGFuY2VvZiBrbGFzcykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcmd1bWVudDogJyArIG5hbWUgKyAnIGV4cGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHN0cmljdF9vbmVvZjogZnVuY3Rpb24oXywgdmFsdWVzKSB7XG4gICAgICAgIGlmICh2YWx1ZXMuaW5kZXhPZihfKSA9PSAtMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFyZ3VtZW50OiAnICsgXyArICcgZ2l2ZW4sIHZhbGlkIHZhbHVlcyBhcmUgJyArXG4gICAgICAgICAgICAgICAgdmFsdWVzLmpvaW4oJywgJykpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBsYm91bmRzOiBmdW5jdGlvbihfKSB7XG4gICAgICAgIC8vIGxlYWZsZXQtY29tcGF0aWJsZSBib3VuZHMsIHNpbmNlIGxlYWZsZXQgZG9lcyBub3QgZG8gZ2VvanNvblxuICAgICAgICByZXR1cm4gbmV3IEwuTGF0TG5nQm91bmRzKFtbX1sxXSwgX1swXV0sIFtfWzNdLCBfWzJdXV0pO1xuICAgIH1cbn07XG4iXX0=
;