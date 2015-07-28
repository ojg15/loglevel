"use strict";

define(['test/test-helpers'], function(testHelpers) {
    var describeIf = testHelpers.describeIf;
    var it = testHelpers.itWithFreshLog;

    var originalConsole = window.console;

    describe("Multiple logger instances tests:", function() {

        describe("log.getLogger()", function() {
            it("returns a new logger that is not the default one", function(log) {
                var newLogger = log.getLogger("newLogger");

                expect(newLogger).not.toEqual(log);
            });

            it("returns a new logger with all the normal methods", function(log) {
                var newLogger = log.getLogger("newLogger");

                expect(newLogger.trace).toBeDefined();
                expect(newLogger.debug).toBeDefined();
                expect(newLogger.info).toBeDefined();
                expect(newLogger.warn).toBeDefined();
                expect(newLogger.error).toBeDefined();
                expect(newLogger.setLevel).toBeDefined();
                expect(newLogger.setDefaultLevel).toBeDefined();
                expect(newLogger.enableAll).toBeDefined();
                expect(newLogger.disableAll).toBeDefined();
                expect(newLogger.wrapLogMethods).toBeDefined();
            });

            it("returns loggers without `getLogger()` and `noConflict()`", function(log) {
                var newLogger = log.getLogger("newLogger");
                expect(newLogger.getLogger).toBeUndefined();
                expect(newLogger.noConflict).toBeUndefined();
            });

            it("returns the same instance when called repeatedly with the same name", function(log) {
                var logger1 = log.getLogger("newLogger");
                var logger2 = log.getLogger("newLogger");

                expect(logger1).toEqual(logger2);
            });

            it("should throw if called with no name", function(log) {
                expect(function() {
                  log.getLogger();
                }).toThrow();
            });

            it("should throw if called with empty string for name", function(log) {
                expect(function() {
                  log.getLogger("");
                }).toThrow();
            });

            it("should throw if called with a non-string name", function(log) {
                expect(function() { log.getLogger(true); }).toThrow();
                expect(function() { log.getLogger({}); }).toThrow();
                expect(function() { log.getLogger([]); }).toThrow();
                expect(function() { log.getLogger(10); }).toThrow();
                expect(function() { log.getLogger(function(){}); }).toThrow();
                expect(function() { log.getLogger(null); }).toThrow();
                expect(function() { log.getLogger(undefined); }).toThrow();
                if (window.Symbol) {
                    expect(function() { log.getLogger(Symbol()); }).toThrow();
                }
            });
        });

        describe("inheritance", function() {
            beforeEach(function() {
                window.console = {"log" : jasmine.createSpy("console.log")};
                this.addMatchers({
                    "toBeAtLevel" : testHelpers.toBeAtLevel
                });
                testHelpers.clearStoredLevels();
            });

            afterEach(function() {
                window.console = originalConsole;
            });

            it("loggers are created with the same level as the default logger", function(log) {
              log.setLevel("ERROR");
              var newLogger = log.getLogger("newLogger");
              expect(newLogger).toBeAtLevel("error");
            });

            it("if a logger's level is persisted, it uses that level rather than the default logger's level", function(log) {
                testHelpers.setStoredLevel("error", "newLogger");
                log.setLevel("TRACE");
                var newLogger = log.getLogger("newLogger");
                expect(newLogger).toBeAtLevel("error");
            });

            it("other loggers do not change when the default logger's level is changed", function(log) {
                log.setLevel("TRACE");
                var newLogger = log.getLogger("newLogger");
                log.setLevel("ERROR");
                expect(newLogger).toBeAtLevel("TRACE");
                expect(log.getLogger("newLogger")).toBeAtLevel("TRACE");
            });

            it("loggers are created with the same methodFactory as the default logger", function(log) {
                log.wrapLogMethods(function (underlyingMethod) {
                    return function () {
                        underlyingMethod("wrapped-call");
                    };
                });

                var newLogger = log.getLogger("newLogger");
                newLogger.error("unwrapped-raw-message");

                expect(console.log).toHaveBeenCalledWith("wrapped-call");
            });

            it("logger's wrappers do not change if a wrapper is subsequently added to the default logger", function(log) {
                var newLogger = log.getLogger("newLogger");

                log.wrapLogMethods(function (underlyingMethod) {
                    return function () {
                        underlyingMethod("wrapped-call");
                    };
                });

                newLogger.error("unwrapped-raw-message");

                expect(console.log).toHaveBeenCalledWith("unwrapped-raw-message");
            });

            it("new loggers correctly inherit a logging level of `0`", function(log) {
              log.setLevel(0);
              var newLogger = log.getLogger("newLogger");
              expect(newLogger).toBeAtLevel("trace");
            });
        });
    });
});