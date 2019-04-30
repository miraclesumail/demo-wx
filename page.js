("use strict");
    !(function(global, e) {
      if ("object" == typeof exports && "undefined" != typeof module) {
        module.exports = e();
      } else {
        if ("function" == typeof define && define.amd) {
          define(e);
        } else {
          global.page = e();
        }
      }
    })(this, function() {
      /**
       * @param {string} str
       * @return {?}
       */
      function compile(str) {
        return tokensToFunction(parse(str));
      }
      /**
       * @param {string} doc
       * @return {?}
       */
      function parse(doc) {
        var m;
        var fragmentFilename;
        /** @type {!Array} */
        var tokens = [];
        /** @type {number} */
        var key = 0;
        /** @type {number} */
        var i = 0;
        /** @type {string} */
        var s = "";
        for (; null != (m = nameParse.exec(doc)); ) {
          /** @type {string} */
          var c = m[0];
          /** @type {string} */
          var e = m[1];
          /** @type {number} */
          var n = m.index;
          if (((s = s + doc.slice(i, n)), (i = n + c.length), e)) {
            s = s + e[1];
          } else {
            if (s) {
              tokens.push(s);
              /** @type {string} */
              s = "";
            }
            /** @type {string} */
            var prefix = m[2];
            /** @type {string} */
            var name = m[3];
            /** @type {string} */
            var type = m[4];
            /** @type {string} */
            var lasttype = m[5];
            /** @type {string} */
            var tag = m[6];
            /** @type {string} */
            var onlyBlock = m[7];
            /** @type {boolean} */
            var repeat = "+" === tag || "*" === tag;
            /** @type {boolean} */
            var optional = "?" === tag || "*" === tag;
            /** @type {string} */
            var delimiter = prefix || "/";
            /** @type {string} */
            var y =
              type || lasttype || (onlyBlock ? ".*" : "[^" + delimiter + "]+?");
            tokens.push({
              name: name || key++,
              prefix: prefix || "",
              delimiter: delimiter,
              optional: optional,
              repeat: repeat,
              pattern: ((fragmentFilename = y),
              fragmentFilename.replace(/([=!:$\/()])/g, "\\$1"))
            });
          }
        }
        return (
          i < doc.length && (s = s + doc.substr(i)), s && tokens.push(s), tokens
        );
      }
      /**
       * @param {!NodeList} tokens
       * @return {?}
       */
      function tokensToFunction(tokens) {
        /** @type {!Array} */
        var array_from = new Array(tokens.length);
        /** @type {number} */
        var i = 0;
        for (; i < tokens.length; i++) {
          if ("object" == typeof tokens[i]) {
            /** @type {!RegExp} */
            array_from[i] = new RegExp("^" + tokens[i].pattern + "$");
          }
        }
        return function(specificDirections) {
          /** @type {string} */
          var path = "";
          var accounts = specificDirections || {};
          /** @type {number} */
          var i = 0;
          for (; i < tokens.length; i++) {
            var token = tokens[i];
            if ("string" != typeof token) {
              var value;
              var a = accounts[token.name];
              if (null == a) {
                if (token.optional) {
                  continue;
                }
                throw new TypeError(
                  'Expected "' + token.name + '" to be defined'
                );
              }
              if (isNaN(a)) {
                if (!token.repeat) {
                  throw new TypeError(
                    'Expected "' +
                      token.name +
                      '" to not repeat, but received "' +
                      a +
                      '"'
                  );
                }
                if (0 === a.length) {
                  if (token.optional) {
                    continue;
                  }
                  throw new TypeError(
                    'Expected "' + token.name + '" to not be empty'
                  );
                }
                /** @type {number} */
                var j = 0;
                for (; j < a.length; j++) {
                  if (
                    ((value = encodeURIComponent(a[j])),
                    !array_from[i].test(value))
                  ) {
                    throw new TypeError(
                      'Expected all "' +
                        token.name +
                        '" to match "' +
                        token.pattern +
                        '", but received "' +
                        value +
                        '"'
                    );
                  }
                  /** @type {string} */
                  path =
                    path + ((0 === j ? token.prefix : token.delimiter) + value);
                }
              } else {
                if (
                  ((value = encodeURIComponent(a)), !array_from[i].test(value))
                ) {
                  throw new TypeError(
                    'Expected "' +
                      token.name +
                      '" to match "' +
                      token.pattern +
                      '", but received "' +
                      value +
                      '"'
                  );
                }
                /** @type {string} */
                path = path + (token.prefix + value);
              }
            } else {
              /** @type {string} */
              path = path + token;
            }
          }
          return path;
        };
      }
      /**
       * @param {string} items
       * @return {?}
       */
      function buildUrl(items) {
        return items.replace(/([.+*?=^!:${}()[\]|\/])/g, "\\$1");
      }
      /**
       * @param {!RegExp} elem
       * @param {!Object} value
       * @return {?}
       */
      function format(elem, value) {
        return (elem.keys = value), elem;
      }
      /**
       * @param {!Object} options
       * @return {?}
       */
      function flags(options) {
        return options.sensitive ? "" : "i";
      }
      /**
       * @param {!Array} tokens
       * @param {!Object} options
       * @return {?}
       */
      function tokensToRegExp(tokens, options) {
        var strict = (options = options || {}).strict;
        /** @type {boolean} */
        var end = false !== options.end;
        /** @type {string} */
        var path = "";
        var message = tokens[tokens.length - 1];
        /** @type {boolean} */
        var endsWithSlash = "string" == typeof message && /\/$/.test(message);
        /** @type {number} */
        var index = 0;
        for (; index < tokens.length; index++) {
          var options = tokens[index];
          if ("string" == typeof options) {
            /** @type {string} */
            path = path + buildUrl(options);
          } else {
            var tools_id = buildUrl(options.prefix);
            var print = options.pattern;
            if (options.repeat) {
              /** @type {string} */
              print = print + ("(?:" + tools_id + print + ")*");
            }
            /** @type {string} */
            path =
              path +
              (print = options.optional
                ? tools_id
                  ? "(?:" + tools_id + "(" + print + "))?"
                  : "(" + print + ")?"
                : tools_id + "(" + print + ")");
          }
        }
        return (
          strict ||
            (path =
              (endsWithSlash ? path.slice(0, -2) : path) + "(?:\\/(?=$))?"),
          (path =
            path + (end ? "$" : strict && endsWithSlash ? "" : "(?=\\/|$)")),
          new RegExp("^" + path, flags(options))
        );
      }
      /**
       * @param {(Array|RegExp|string)} value
       * @param {number} max
       * @param {number} options
       * @return {?}
       */
      function update(value, max, options) {
        return (
          isNaN((max = max || []))
            ? options || (options = {})
            : ((options = max), (max = [])),
          value instanceof RegExp
            ? (function(current, keys) {
                /** @type {(Array<string>|null)} */
                var selectorPieces = current.source.match(/\((?!\?)/g);
                if (selectorPieces) {
                  /** @type {number} */
                  var s = 0;
                  for (; s < selectorPieces.length; s++) {
                    keys.push({
                      name: s,
                      prefix: null,
                      delimiter: null,
                      optional: false,
                      repeat: false,
                      pattern: null
                    });
                  }
                }
                return format(current, keys);
              })(value, max)
            : isNaN(value)
            ? (function(keys, val, options) {
                /** @type {!Array} */
                var defaultParts = [];
                /** @type {number} */
                var i = 0;
                for (; i < keys.length; i++) {
                  defaultParts.push(update(keys[i], val, options).source);
                }
                return format(
                  new RegExp(
                    "(?:" + defaultParts.join("|") + ")",
                    flags(options)
                  ),
                  val
                );
              })(value, max, options)
            : (function(document, s, options) {
                var tokens = parse(document);
                var re = tokensToRegExp(tokens, options);
                /** @type {number} */
                var i = 0;
                for (; i < tokens.length; i++) {
                  if ("string" != typeof tokens[i]) {
                    s.push(tokens[i]);
                  }
                }
                return format(re, s);
              })(value, max, options)
        );
      }
      /**
       * @return {undefined}
       */
      function Router() {
        /** @type {!Array} */
        this.callbacks = [];
        /** @type {!Array} */
        this.exits = [];
        /** @type {string} */
        this.current = "";
        /** @type {number} */
        this.len = 0;
        /** @type {boolean} */
        this._decodeURLComponents = true;
        /** @type {string} */
        this._base = "";
        /** @type {boolean} */
        this._strict = false;
        /** @type {boolean} */
        this._running = false;
        /** @type {boolean} */
        this._hashbang = false;
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }
      /**
       * @param {!Object} options
       * @param {?} data
       * @return {?}
       */
      function callback(options, data) {
        if ("function" == typeof options) {
          return callback.call(this, "*", options);
        }
        if ("function" == typeof data) {
          var route = new Route(options, null, this);
          /** @type {number} */
          var i = 1;
          for (; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
        } else {
          if ("string" == typeof options) {
            console.log(options, '-----2----');
            this["string" == typeof data ? "redirect" : "show"](options, data);
          } else {
            this.start(options);
          }
        }
      }

      /**
       * @param {string} path
       * @param {!Object} state
       * @param {!Object} name
       * @return {undefined}
       */
      function Context(path, state, name) {
        console.log(path, '----3----');
        var self = (this.page = name || callback);
        console.log(this.page);
        console.log(self);
        var win = self._window;
        console.log(win);
        var selected = self._hashbang;
        var a = self._getBase();
        if ("/" === path[0] && 0 !== path.indexOf(a)) {
          /** @type {string} */
          path = a + (selected ? "#!" : "") + path;
        }
        var i = path.indexOf("?");
        if (
          ((this.canonicalPath = path),
          (this.path = path.replace(a, "") || "/"),
          selected && (this.path = this.path.replace("#!", "") || "/"),
          (this.title = doc),
          (this.state = state || {}),
          (this.state.path = path),
          (this.querystring = ~i
            ? self._decodeURLEncodedURIComponent(path.slice(i + 1))
            : ""),
          (this.pathname = self._decodeURLEncodedURIComponent(
            ~i ? path.slice(0, i) : path
          )),
          (this.params = {}),
          (this.hash = ""),
          !selected)
        ) {
          if (!~this.path.indexOf("#")) {
            console.log('fifii');
            return;
          }
          var m = this.path.split("#");
          this.path = this.pathname = m[0];
          this.hash = self._decodeURLEncodedURIComponent(m[1]) || "";
          this.querystring = this.querystring.split("#")[0];
          console.log(this);
        }
      }
      /**
       * @param {string} path
       * @param {!Object} o
       * @param {!Object} options
       * @return {undefined}
       */
      function Route(path, o, options) {
        this.page = options || undefined;
        var opts = o || {};
        opts.strict = opts.strict || options._strict;
        this.path = "*" === path ? "(.*)" : path;
        /** @type {string} */
        this.method = "GET";
        this.regexp = index(this.path, (this.keys = []), opts);
      }
      /** @type {function(*): boolean} */
      var isNaN =
        Array.isArray ||
        function(scenes) {
          return "[object Array]" == Object.prototype.toString.call(scenes);
        };
      /** @type {function((Array|RegExp|string), number, number): ?} */
      var index = update;
      /** @type {function(string): ?} */
      var parse_1 = parse;
      /** @type {function(!NodeList): ?} */
      var tokensToFunction_1 = tokensToFunction;
      /** @type {function(!Array, !Object): ?} */
      var tokensToRegExp_1 = tokensToRegExp;
      /** @type {!RegExp} */
      var nameParse = new RegExp(
        [
          "(\\\\.)",
          "([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))"
        ].join("|"),
        "g"
      );
      /** @type {function(string): ?} */
      index.parse = parse_1;
      /** @type {function(string): ?} */
      index.compile = compile;
      /** @type {function(!NodeList): ?} */
      index.tokensToFunction = tokensToFunction_1;
      /** @type {function(!Array, !Object): ?} */
      index.tokensToRegExp = tokensToRegExp_1;
      var paramIndex;
      /** @type {boolean} */
      var doc = "undefined" != typeof document;
      /** @type {boolean} */
      var result = "undefined" != typeof window;
      /** @type {boolean} */
      var refresh = "undefined" != typeof history;
      /** @type {boolean} */
      var p = "undefined" != typeof process;
      /** @type {string} */
      var actionEvent = doc && document.ontouchstart ? "touchstart" : "click";
      /** @type {boolean} */
      var properties =
        result && !(!window.history.location && !window.location);
      /**
       * @param {!Object} o
       * @return {undefined}
       */
      Router.prototype.configure = function(o) {
        var options = o || {};
        this._window = options.window || (result && window);
        /** @type {boolean} */
        this._decodeURLComponents = false !== options.decodeURLComponents;
        /** @type {boolean} */
        this._popstate = false !== options.popstate && result;
        /** @type {boolean} */
        this._click = false !== options.click && doc;
        /** @type {boolean} */
        this._hashbang = !!options.hashbang;
        var win = this._window;
        if (this._popstate) {
          win.addEventListener("popstate", this._onpopstate, false);
        } else {
          if (result) {
            win.removeEventListener("popstate", this._onpopstate, false);
          }
        }
        if (this._click) {
          win.document.addEventListener(actionEvent, this.clickHandler, false);
        } else {
          if (doc) {
            win.document.removeEventListener(
              actionEvent,
              this.clickHandler,
              false
            );
          }
        }
        if (this._hashbang && result && !refresh) {
          win.addEventListener("hashchange", this._onpopstate, false);
        } else {
          if (result) {
            win.removeEventListener("hashchange", this._onpopstate, false);
          }
        }
      };
      /**
       * @param {string} url
       * @return {?}
       */
      Router.prototype.base = function(url) {
        if (0 === arguments.length) {
          return this._base;
        }
        /** @type {string} */
        this._base = url;
      };
      /**
       * @return {?}
       */
      Router.prototype._getBase = function() {
        var value = this._base;
        if (value) {
          return value;
        }
        var el = result && this._window && this._window.location;
        return (
          result &&
            this._hashbang &&
            el &&
            "file:" === el.protocol &&
            (value = el.pathname),
          value
        );
      };
      /**
       * @param {string} strict
       * @return {?}
       */
      Router.prototype.strict = function(strict) {
        if (0 === arguments.length) {
          return this._strict;
        }
        /** @type {string} */
        this._strict = strict;
      };
      /**
       * @param {!Object} event
       * @return {undefined}
       */
      Router.prototype.start = function(event) {
        var e = event || {};
        if ((this.configure(e), false !== e.dispatch)) {
          var suggestion;
          if (((this._running = true), properties)) {
            var url = this._window.location;
            suggestion =
              this._hashbang && ~url.hash.indexOf("#!")
                ? url.hash.substr(2) + url.search
                : this._hashbang
                ? url.search + url.hash
                : url.pathname + url.search + url.hash;
          }
          this.replace(suggestion, null, true, e.dispatch);
        }
      };
      /**
       * @return {undefined}
       */
      Router.prototype.stop = function() {
        if (this._running) {
          /** @type {string} */
          this.current = "";
          /** @type {number} */
          this.len = 0;
          /** @type {boolean} */
          this._running = false;
          var win = this._window;
          if (this._click) {
            win.document.removeEventListener(
              actionEvent,
              this.clickHandler,
              false
            );
          }
          if (result) {
            win.removeEventListener("popstate", this._onpopstate, false);
          }
          if (result) {
            win.removeEventListener("hashchange", this._onpopstate, false);
          }
        }
      };
      /**
       * @param {?} str
       * @param {boolean} options
       * @param {!Object} undefined
       * @param {boolean} error
       * @return {?}
       */
      Router.prototype.show = function(str, options, undefined, error) {
        var data = new Context(str, options, this);
        var value = this.prevContext;
        return (
          (this.prevContext = data),
          (this.current = data.path),
          false !== undefined && this.dispatch(data, value),
          false !== data.handled && false !== error && data.pushState(),
          data
        );
      };
      /**
       * @param {?} event
       * @param {boolean} progress
       * @return {undefined}
       */
      Router.prototype.back = function(event, progress) {
        var self = this;
        if (0 < this.len) {
          var win = this._window;
          if (refresh) {
            win.history.back();
          }
          this.len--;
        } else {
          if (event) {
            setTimeout(function() {
              self.show(event, progress);
            });
          } else {
            setTimeout(function() {
              self.show(self._getBase(), progress);
            });
          }
        }
      };
      /**
       * @param {!Object} e
       * @param {!Array} name
       * @return {undefined}
       */
      Router.prototype.redirect = function(e, name) {
        var n = this;
        if ("string" == typeof e && "string" == typeof name) {
          callback.call(this, e, function(canCreateDiscussions) {
            setTimeout(function() {
              n.replace(name);
            }, 0);
          });
        }
        if ("string" == typeof e && void 0 === name) {
          console.log(e, '-----3-----');
          setTimeout(function() {
            n.replace(e);
          }, 0);
        }
      };
      /**
       * @param {!Object} obj
       * @param {string} id
       * @param {boolean} value
       * @param {!Object} subject
       * @return {?}
       */
      Router.prototype.replace = function(obj, id, value, subject) {
        var item = new Context(obj, id, this);
        var parent = this.prevContext;
        console.log('replace');
        return (
          (this.prevContext = item),
          (this.current = item.path),
          (item.init = value),
          item.save(),
          false !== subject && this.dispatch(item, parent),
          item
        );
      };
      /**
       * @param {!Event} obj
       * @param {?} elem
       * @return {undefined}
       */
      Router.prototype.dispatch = function(obj, elem) {
        /**
         * @return {?}
         */
        function update() {
          var watch = options.callbacks[i++];
          if (obj.path === options.current) {
            return watch
              ? void watch(obj, update)
              : function(ctx) {
                  if (ctx.handled) {
                    return;
                  }
                  var current;
                  var win = this._window;
                  current = this._hashbang
                    ? properties &&
                      this._getBase() + win.location.hash.replace("#!", "")
                    : properties && win.location.pathname + win.location.search;
                  if (current === ctx.canonicalPath) {
                    return;
                  }
                  this.stop();
                  /** @type {boolean} */
                  ctx.handled = false;
                  if (properties) {
                    win.location.href = ctx.canonicalPath;
                  }
                }.call(options, obj);
          }
          /** @type {boolean} */
          obj.handled = false;
        }
        /** @type {number} */
        var i = 0;
        /** @type {number} */
        var j = 0;
        var options = this;
        if (elem) {
          (function onload() {
            var addListener = options.exits[j++];
            if (!addListener) {
              return update();
            }
            addListener(elem, onload);
          })();
        } else {
          update();
        }
      };
      /**
       * @param {string} url
       * @param {string} to
       * @return {?}
       */
      Router.prototype.exit = function(url, to) {
        if ("function" == typeof url) {
          return this.exit("*", url);
        }
        var route = new Route(url, null, this);
        /** @type {number} */
        var i = 1;
        for (; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };
      /**
       * @param {!Object} event
       * @return {undefined}
       */
      Router.prototype.clickHandler = function(event) {
        if (
          1 === this._which(event) &&
          !(
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.defaultPrevented
          )
        ) {
          var el = event.target;
          var els =
            event.path || (event.composedPath ? event.composedPath() : null);
          if (els) {
            /** @type {number} */
            var i = 0;
            for (; i < els.length; i++) {
              if (
                els[i].nodeName &&
                "A" === els[i].nodeName.toUpperCase() &&
                els[i].href
              ) {
                el = els[i];
                break;
              }
            }
          }
          for (; el && "A" !== el.nodeName.toUpperCase(); ) {
            el = el.parentNode;
          }
          if (el && "A" === el.nodeName.toUpperCase()) {
            /** @type {boolean} */
            var svg =
              "object" == typeof el.href &&
              "SVGAnimatedString" === el.href.constructor.name;
            if (
              !el.hasAttribute("download") &&
              "external" !== el.getAttribute("rel")
            ) {
              var mask = el.getAttribute("href");
              if (
                (this._hashbang ||
                  !this._samePath(el) ||
                  (!el.hash && "#" !== mask)) &&
                !(mask && -1 < mask.indexOf("mailto:")) &&
                (svg ? !el.target.baseVal : !el.target) &&
                (svg || this.sameOrigin(el.href))
              ) {
                var path = svg
                  ? el.href.baseVal
                  : el.pathname + el.search + (el.hash || "");
                path = "/" !== path[0] ? "/" + path : path;
                if (p && path.match(/^\/[a-zA-Z]:\//)) {
                  path = path.replace(/^\/[a-zA-Z]:\//, "/");
                }
                var entry = path;
                var last = this._getBase();
                if (0 === path.indexOf(last)) {
                  path = path.substr(last.length);
                }
                if (this._hashbang) {
                  path = path.replace("#!", "");
                }
                if (
                  !last ||
                  entry !== path ||
                  (properties && "file:" === this._window.location.protocol)
                ) {
                  event.preventDefault();
                  this.show(entry);
                }
              }
            }
          }
        }
      };
      /** @type {!Function} */
      Router.prototype._onpopstate = ((paramIndex = false),
      result
        ? (doc && "complete" === document.readyState
            ? (paramIndex = true)
            : window.addEventListener("load", function() {
                setTimeout(function() {
                  /** @type {boolean} */
                  paramIndex = true;
                }, 0);
              }),
          function(data) {
            if (paramIndex) {
              if (data.state) {
                var item = data.state.path;
                this.replace(item, data.state);
              } else {
                if (properties) {
                  var parts = this._window.location;
                  this.show(
                    parts.pathname + parts.search + parts.hash,
                    void 0,
                    void 0,
                    false
                  );
                }
              }
            }
          })
        : function() {});
      /**
       * @param {!Object} event
       * @return {?}
       */
      Router.prototype._which = function(event) {
        return null == (event = event || (result && this._window.event)).which
          ? event.button
          : event.which;
      };
      /**
       * @param {string} value
       * @return {?}
       */
      Router.prototype._toURL = function(value) {
        var win = this._window;
        if ("function" == typeof URL && properties) {
          return new URL(value, win.location.toString());
        }
        if (doc) {
          var elem = win.document.createElement("a");
          return (elem.href = value), elem;
        }
      };
      /**
       * @param {string} a
       * @return {?}
       */
      Router.prototype.sameOrigin = function(a) {
        if (!a || !properties) {
          return false;
        }
        var location = this._toURL(a);
        var url = this._window.location;
        return (
          url.protocol === location.protocol &&
          url.hostname === location.hostname &&
          url.port === location.port
        );
      };
      /**
       * @param {!Location} link
       * @return {?}
       */
      Router.prototype._samePath = function(link) {
        if (!properties) {
          return false;
        }
        var referenceLocation = this._window.location;
        return (
          link.pathname === referenceLocation.pathname &&
          link.search === referenceLocation.search
        );
      };
      /**
       * @param {string} schema
       * @return {?}
       */
      Router.prototype._decodeURLEncodedURIComponent = function(schema) {
        return "string" != typeof schema
          ? schema
          : this._decodeURLComponents
          ? decodeURIComponent(schema.replace(/\+/g, " "))
          : schema;
      };
      /**
       * @return {undefined}
       */
      Context.prototype.pushState = function() {
        var el = this.page;
        var w = el._window;
        var hashbang = el._hashbang;
        el.len++;
        if (refresh) {
          w.history.pushState(
            this.state,
            this.title,
            hashbang && "/" !== this.path
              ? "#!" + this.path
              : this.canonicalPath
          );
        }
      };
      /**
       * @return {undefined}
       */
      Context.prototype.save = function() {
        var _this = this.page;
        if (refresh && "file:" !== _this._window.location.protocol) {
          _this._window.history.replaceState(
            this.state,
            this.title,
            _this._hashbang && "/" !== this.path
              ? "#!" + this.path.replace(location.search, "")
              : this.canonicalPath.replace(location.search, "")
          );
        }
      };
      /**
       * @param {?} fn
       * @return {?}
       */
      Route.prototype.middleware = function(fn) {
        var Router = this;
        return function(options, next) {
          if (Router.match(options.path, options.params)) {
            return fn(options, next);
          }
          next();
        };
      };
      /**
       * @param {!Object} path
       * @param {?} data
       * @return {?}
       */
      Route.prototype.match = function(path, data) {
        var keys = this.keys;
        var qsIndex = path.indexOf("?");
        var pathname = ~qsIndex ? path.slice(0, qsIndex) : path;
        var ids = this.regexp.exec(decodeURIComponent(pathname));
        if (!ids) {
          return false;
        }
        /** @type {number} */
        var l = 1;
        var i = ids.length;
        for (; l < i; ++l) {
          var node = keys[l - 1];
          var html = this.page._decodeURLEncodedURIComponent(ids[l]);
          if (!(void 0 === html && hasOwnProperty.call(data, node.name))) {
            data[node.name] = html;
          }
        }
        return true;
      };
      var undefined = (function init() {
        /**
         * @return {?}
         */
        function self() {
          console.log(arguments, '------1----');
          return callback.apply(_this, arguments);
        }

        var _this = new Router();
        return (
          (self.callbacks = _this.callbacks),
          (self.exits = _this.exits),
          (self.base = _this.base.bind(_this)),
          (self.strict = _this.strict.bind(_this)),
          (self.start = _this.start.bind(_this)),
          (self.stop = _this.stop.bind(_this)),
          (self.show = _this.show.bind(_this)),
          (self.back = _this.back.bind(_this)),
          (self.redirect = _this.redirect.bind(_this)),
          (self.replace = _this.replace.bind(_this)),
          (self.dispatch = _this.dispatch.bind(_this)),
          (self.exit = _this.exit.bind(_this)),
          (self.configure = _this.configure.bind(_this)),
          (self.sameOrigin = _this.sameOrigin.bind(_this)),
          (self.clickHandler = _this.clickHandler.bind(_this)),
          (self.create = init),
          Object.defineProperty(self, "len", {
            get: function() {
              return _this.len;
            },
            set: function(index) {
              /** @type {number} */
              _this.len = index;
            }
          }),
          Object.defineProperty(self, "current", {
            get: function() {
              return _this.current;
            },
            set: function(newSize) {
              /** @type {string} */
              _this.current = newSize;
            }
          }),
          (self.Context = Context),
          (self.Route = Route),
          self
        );
      })();
      var o = undefined;
      var id = undefined;
      return (o.default = id), o;
    });
    
      page("/about", function() {
            $("#content").load("./about.html")
    
        })

        page("/home", function() {
            $("#content").load("./home.html")
        }) 
