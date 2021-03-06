"use strict"
var util$1 = require("util")
function startsWith(t, e) {
  return t.slice(0, e.length) == e
}
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
  reHasRegExpChar = RegExp(reRegExpChar.source)
function escapeRegExp(t) {
  return t && reHasRegExpChar.test(t) ? t.replace(reRegExpChar, "\\$&") : t
}
function pushIfNotNull(t, e) {
  null !== e && t.push(e)
}
function println(t) {
  console.log(t)
}
function __spreadArrays() {
  for (var t = 0, e = 0, n = arguments.length; e < n; e++)
    t += arguments[e].length
  var r = Array(t),
    i = 0
  for (e = 0; e < n; e++)
    for (var s = arguments[e], o = 0, u = s.length; o < u; o++, i++) r[i] = s[o]
  return r
}
var IgnoredTestSuitesReporting = {
  skip: "skip",
  reportAsIgnoredTest: "reportAsIgnoredTest",
  reportAllInnerTestsAsIgnored: "reportAllInnerTestsAsIgnored",
}
function withName(t, e) {
  return ((e = e || {}).name = t), e
}
var logTypes = ["log", "info", "warn", "error", "debug"]
function runWithTeamCityConsoleAdapter(t, e) {
  return {
    suite: function(e, n, r) {
      t.suite(e, n, r)
    },
    test: function(n, r, i) {
      var s = []
      t.test(n, r, function() {
        var t = console
        s = logTypes.map(function(r) {
          var i,
            s = t[r]
          return (
            (t[r] =
              ((i = r),
              function(t) {
                for (var r, s = [], o = 1; o < arguments.length; o++)
                  s[o - 1] = arguments[o]
                ;(r =
                  "warn" == i || "error" == i ? "testStdErr" : "testStdOut"),
                  e.sendMessage(
                    r,
                    withName(n, {
                      out:
                        "[" +
                        i +
                        "] " +
                        util$1.format.apply(void 0, __spreadArrays([t], s)) +
                        "\n",
                    })
                  )
              })),
            function() {
              return (t[r] = s)
            }
          )
        })
        try {
          return i()
        } catch (t) {
          throw t
        } finally {
          s.forEach(function(t) {
            return t()
          })
        }
      })
    },
  }
}
var CliArgsParser = (function() {
  function t(t) {
    this.description = t
  }
  return (
    (t.prototype.printUsage = function() {
      var t = this.description
      for (var e in (println(t.bin + " v" + t.version + " - " + t.description),
      println(),
      println("Usage: " + t.bin + " " + t.usage),
      println(),
      t.args)) {
        var n = t.args[e]
        println("  " + n.keys.join(", "))
        if ((println("    " + n.help), n.values && n.valuesHelp)) {
          println("    Possible values:")
          for (var r = 0; r < n.values.length; r++) {
            println('     - "' + n.values[r] + '": ' + n.valuesHelp[r])
          }
        }
        n.default && println("    By default: " + n.default), println("")
      }
    }),
    (t.prototype.badArgsExit = function(t) {
      println(t), println(), this.printUsage(), process.exit(1)
    }),
    (t.prototype.parse = function(t) {
      var e = this.description,
        n = { free: [] }
      for (var r in e.args) e.args[r].single || (n[r] = [])
      t: for (; 0 != t.length; ) {
        var i = t.shift()
        if (startsWith(i, "--"))
          for (var s in e.args) {
            var o = e.args[s]
            if (-1 != o.keys.indexOf(i)) {
              0 == t.length &&
                this.badArgsExit("Missed value after option " + i)
              var u = t.shift()
              o.values &&
                -1 == o.values.indexOf(u) &&
                this.badArgsExit("Unsupported value for option " + i),
                o.single ? (n[s] = u) : n[s].push(u)
              continue t
            }
          }
        else n.free.push(i)
      }
      return (
        e.freeArgsTitle &&
          0 == n.free.length &&
          this.badArgsExit(
            "At least one " + e.freeArgsTitle + " should be provided"
          ),
        n
      )
    }),
    t
  )
})()
function newKotlinTestsFilter(t) {
  if (null == t) return null
  if (
    0 ==
    (t = (t = t.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "")).replace(
      /\*+/,
      "*"
    )).length
  )
    return null
  if ("*" == t) return allTest
  if (-1 == t.indexOf("*")) return new ExactFilter(t)
  if (startsWith(t, "*")) return new RegExpKotlinTestsFilter(t)
  var e = t.split("*", 2),
    n = e[0],
    r = e[1]
  return new StartsWithFilter(n, r ? new RegExpKotlinTestsFilter(t) : null)
}
var allTest = new ((function() {
    function t() {}
    return (
      (t.prototype.mayContainTestsFromSuite = function(t) {
        return !0
      }),
      (t.prototype.containsTest = function(t) {
        return !0
      }),
      t
    )
  })())(),
  StartsWithFilter = (function() {
    function t(t, e) {
      ;(this.prefix = t), (this.filter = e)
    }
    return (
      (t.prototype.mayContainTestsFromSuite = function(t) {
        return startsWith(this.prefix, t) || startsWith(t, this.prefix)
      }),
      (t.prototype.containsAllTestsFromSuite = function(t) {
        return null == this.filter && startsWith(t, this.prefix)
      }),
      (t.prototype.containsTest = function(t) {
        return (
          startsWith(t, this.prefix) &&
          (null == this.filter || this.filter.containsTest(t))
        )
      }),
      t
    )
  })(),
  ExactFilter = (function() {
    function t(t) {
      ;(this.fqn = t),
        (this.classNameOnlyRegExp = RegExp(
          "^" + escapeRegExp(this.fqn + ".") + "[^.]+$"
        ))
    }
    return (
      (t.prototype.mayContainTestsFromSuite = function(t) {
        return startsWith(this.fqn, t)
      }),
      (t.prototype.containsTest = function(t) {
        return t === this.fqn || this.classNameOnlyRegExp.test(t)
      }),
      t
    )
  })(),
  RegExpKotlinTestsFilter = (function() {
    function t(t) {
      this.regexp = RegExp(
        "^" +
          t
            .split("*")
            .map(function(t) {
              return escapeRegExp(t)
            })
            .join(".*") +
          "$"
      )
    }
    return (
      (t.prototype.mayContainTestsFromSuite = function(t) {
        return !0
      }),
      (t.prototype.containsTest = function(t) {
        return this.regexp.test(t)
      }),
      (t.prototype.toString = function() {
        return this.regexp.toString()
      }),
      t
    )
  })(),
  CompositeTestFilter = (function() {
    function t(t, e) {
      var n = this
      ;(this.include = t),
        (this.exclude = e),
        (this.excludePrefix = []),
        this.exclude.forEach(function(t) {
          t instanceof StartsWithFilter &&
            null == t.filter &&
            n.excludePrefix.push(t)
        })
    }
    return (
      (t.prototype.mayContainTestsFromSuite = function(t, e) {
        for (var n = 0, r = this.excludePrefix; n < r.length; n++) {
          var i = r[n]
          if (i.containsAllTestsFromSuite(t) || i.containsAllTestsFromSuite(e))
            return !1
        }
        for (var s = 0, o = this.include; s < o.length; s++) {
          var u = o[s]
          if (u.mayContainTestsFromSuite(t) || u.mayContainTestsFromSuite(e))
            return !0
        }
        return !1
      }),
      (t.prototype.containsTest = function(t, e) {
        for (var n = 0, r = this.exclude; n < r.length; n++) {
          var i = r[n]
          if (i.containsTest(t) || i.containsTest(e)) return !1
        }
        for (var s = 0, o = this.include; s < o.length; s++) {
          var u = o[s]
          if (u.containsTest(t) || u.containsTest(e)) return !0
        }
        return !1
      }),
      t
    )
  })()
require("util")
var TeamCityMessagesFlow = (function() {
  function t(t, e) {
    ;(this.send = e),
      (this.id = t || Math.floor(Math.random() * (9999e6 + 1)) + 1e6)
  }
  return (
    (t.prototype.sendMessage = function(t, e) {
      ;(e.flowId = this.id),
        (e.timestamp = new Date().toISOString().slice(0, -1))
      var n = Object.keys(e)
        .map(function(t) {
          return (
            t +
            "='" +
            ((n = e[t])
              ? n
                  .toString()
                  .replace(/\x1B.*?m/g, "")
                  .replace(/\|/g, "||")
                  .replace(/\n/g, "|n")
                  .replace(/\r/g, "|r")
                  .replace(/\[/g, "|[")
                  .replace(/\]/g, "|]")
                  .replace(/\u0085/g, "|x")
                  .replace(/\u2028/g, "|l")
                  .replace(/\u2029/g, "|p")
                  .replace(/'/g, "|'")
              : "") +
            "'"
          )
          var n
        })
        .join(" ")
      this.send("##teamcity[" + t + " " + n + "]")
    }),
    t
  )
})()
var kotlin_test = require("kotlin-test")
process.exit = function(t) {
  throw new Error("Exit with " + t)
}
var untypedArgs = new CliArgsParser({
    version: "0.0.1",
    bin: "kotlin-js-tests",
    description: "Simple Kotlin/JS tests runner with TeamCity reporter",
    usage: "[-t --tests] [-e --exclude] <module_name1>, <module_name2>, ..",
    args: {
      include: {
        keys: ["--tests", "--include"],
        help:
          "Tests to include. Example: MySuite.test1,MySuite.MySubSuite.*,*unix*,!*windows*",
        default: "*",
      },
      exclude: {
        keys: ["--exclude"],
        help:
          "Tests to exclude. Example: MySuite.test1,MySuite.MySubSuite.*,*unix*",
      },
      ignoredTestSuites: {
        keys: ["--ignoredTestSuites"],
        help: "How to deal with ignored test suites",
        single: !0,
        values: [
          IgnoredTestSuitesReporting.skip,
          IgnoredTestSuitesReporting.reportAsIgnoredTest,
          IgnoredTestSuitesReporting.reportAllInnerTestsAsIgnored,
        ],
        valuesHelp: [
          "don't report ignored test suites",
          "useful to speedup large ignored test suites",
          "will cause visiting all inner tests",
        ],
        default: IgnoredTestSuitesReporting.reportAllInnerTestsAsIgnored,
      },
    },
    freeArgsTitle: null,
  }).parse(window.__karma__.config.args),
  initialAdapter = kotlin_test.kotlin.test.detectAdapter_8be2vx$()
kotlin_test.setAdapter(
  (function(t, e) {
    var n = console.log,
      r = new TeamCityMessagesFlow(null, function(t) {
        return n(t)
      })
    return runWithTeamCityConsoleAdapter(
      (function(t, e) {
        var n = { include: e.include, exclude: e.exclude },
          r = t
        return (r = (function(t, e, n) {
          var r = [],
            i = []
          function s(t, e, n) {
            var r, i, s
            ;((r = t),
            (i = function(t) {
              return t.split(",")
            }),
            (s = []),
            r.forEach(function(t) {
              i(t).forEach(function(t) {
                s.push(t)
              })
            }),
            s).map(function(t) {
              t.length && "!" == t[0]
                ? pushIfNotNull(n, newKotlinTestsFilter(t.substring(1)))
                : pushIfNotNull(e, newKotlinTestsFilter(t))
            })
          }
          if ((s(e, r, i), s(n, i, r), 0 == r.length && 0 == i.length)) return t
          0 == r.length && r.push(allTest)
          var o = new CompositeTestFilter(r, i)
          return (function(t, e) {
            var n = []
            function r() {
              return n[0] ? n.join(".") : n.slice(1).join(".")
            }
            function i() {
              var t = "" + n.slice(1).join("$")
              return n[0] ? (t ? n[0] + "." + t : n[0]) : t
            }
            return {
              suite: function(s, o, u) {
                n.push(s)
                try {
                  if (n.length > 0 && !e.mayContainTestsFromSuite(r(), i()))
                    return
                  t.suite(s, o, u)
                } finally {
                  n.pop()
                }
              },
              test: function(n, s, o) {
                try {
                  if (!e.containsTest(r() + "." + n, i() + "." + n)) return
                  t.test(n, s, o)
                } finally {
                }
              },
            }
          })(t, o)
        })(r, n.include, n.exclude))
      })(t, e),
      r
    )
  })(initialAdapter, untypedArgs)
)
var resultFun = window.__karma__.result
window.__karma__.result = function(t) {
  console.log("--END_KOTLIN_TEST--\n" + JSON.stringify(t)), resultFun(t)
}
//# sourceMappingURL=kotlin-test-karma-runner.js.map
