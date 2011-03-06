/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global buster, require, module*/
if (typeof buster == "undefined") {
    var buster = {};
}

if (typeof require == "function") {
    buster.util = require("buster-util");
}

(function () {
    var slice = Array.prototype.slice;
    var toString = Object.prototype.toString;
    var assert;

    function indexOf(arr, item) {
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] == item) {
                return i;
            }
        }

        return -1;
    }

    function prepareAssertion(name, args, num) {
        if (typeof assert.count != "number") {
            assert.count = 0;
        }

        assert.count += 1;

        if (args.length < num) {
            assert.fail("[" + name + "] Expected to receive at least " +
                        num + " argument" + (num > 1 ? "s" : ""));
        }

        if (args.length >= num + 1) {
            var msg = args[num];

            if (typeof msg == "string") {
                msg += !/[\?\!\.\:\;\,]$/.test(msg) ? ": " : " ";
            }

            return msg;
        }

        return "";
    }

    function fail(assertion, msg) {
        msg = assert[assertion][msg];

        for (var i = 2, l = arguments.length; i < l; i++) {
            if (i == 2) {
                msg = msg.replace("${" + (i-2) + "}", arguments[i]);
            } else {
                msg = msg.replace("${" + (i-2) + "}", assert.format(arguments[i]));
            }
        }

        assert.fail("[assert." + assertion + "] " + msg);
    }

    function areEqual(expected, actual) {
        if (expected === actual) {
            return true;
        }

        // Elements are only equal if expected === actual
        if (buster.util.isElement(expected) || buster.util.isElement(actual)) {
            return false;
        }

        // null and undefined only pass for null === null and
        // undefined === undefined
        /*jsl: ignore*/
        if (expected == null || actual == null) {
            return actual === expected;
        }
        /*jsl: end*/

        if (expected instanceof Date || actual instanceof Date) {
            return expected instanceof Date && actual instanceof Date &&
                expected.getTime() == actual.getTime();
        }

        var useCoercingEquality = typeof expected != "object" || typeof actual != "object";

        if (expected instanceof RegExp && actual instanceof RegExp) {
            if (expected.toString() != actual.toString()) {
                return false;
            }

            useCoercingEquality = false;
        }

        // Coerce and compare when primitives are involved
        if (useCoercingEquality) {
            return expected == actual;
        }

        var expectedKeys = buster.util.keys(expected);
        var actualKeys = buster.util.keys(actual);

        if (buster.util.isArguments(expected) || buster.util.isArguments(actual)) {
            if (expected.length != actual.length) {
                return false;
            }
        } else {
            if (typeof expected != typeof actual ||
                toString.call(expected) != toString.call(actual) ||
                expectedKeys.length != actualKeys.length) {
                return false;
            }
        }

        var key;

        for (var i = 0, l = expectedKeys.length; i < l; i++) {
            key = expectedKeys[i];

            if (!Object.prototype.hasOwnProperty.call(actual, key) ||
                !areEqual(expected[key], actual[key])) {
                return false;
            }
        }

        return true;
    }

    assert = buster.assert = function (actual, message) {
        prepareAssertion("assert", arguments, 1);

        if (!actual) {
            var val = assert.format(actual)
            assert.fail(message || "[assert] Expected " + val + " to be truthy");
        }

        assert.pass("assert", message || "", actual);
    };

    assert.msgFail = "[assert] Expected ${1} to be thruthy";
    assert.count = 0;

    assert.fail = function (message) {
        var exception = new Error(message);
        exception.name = "AssertionError";
        throw exception;
    };

    assert.pass = function () {};

    assert.format = function (object) {
        return "" + object;
    };

    assert.isTrue = function (actual, message) {
        message = prepareAssertion("assert.isTrue", arguments, 1);

        if (actual !== true) {
            fail("isTrue", "msgFail", message, actual);
        }

        assert.pass("isTrue", message, actual);
    };

    assert.isTrue.msgFail = "${0}Expected ${1} to be true";

    assert.isFalse = function (actual, message) {
        message = prepareAssertion("assert.isFalse", arguments, 1);

        if (actual !== false) {
            fail("isFalse", "msgFail", message, actual);
        }

        assert.pass("isFalse", message, actual);
    };

    assert.isFalse.msgFail = "${0}Expected ${1} to be false";

    assert.same = function (actual, expected, message) {
        message = prepareAssertion("assert.same", arguments, 2);

        if (actual !== expected) {
            fail("same", "msgFail", message, actual, expected);
        }

        assert.pass("same", message, actual, expected);
    };

    assert.same.msgFail = "${0}Expected ${1} to be the same object as ${2}";

    assert.notSame = function (actual, expected, message) {
        message = prepareAssertion("assert.notSame", arguments, 2);

        if (actual === expected) {
            fail("notSame", "msgFail", message, actual, expected);
        }

        assert.pass("notSame", message, actual, expected);
    };

    assert.notSame.msgFail = "${0}Expected ${1} not to be the same object as ${2}";

    assert.equals = function (actual, expected, message) {
        message = prepareAssertion("assert.equals", arguments, 2);

        if (!areEqual(actual, expected)) {
            fail("equals", "msgFail", message, actual, expected);
        }

        assert.pass("equals", message, actual, expected);
    };

    assert.equals.msgFail = "${0}Expected ${1} to be equal to ${2}";

    assert.notEquals = function (actual, expected, message) {
        message = prepareAssertion("assert.notEquals", arguments, 2);

        if (areEqual(actual, expected)) {
            fail("notEquals", "msgFail", message, actual, expected);
        }

        assert.pass("notEquals", message, actual, expected);
    };

    assert.notEquals.msgFail = "${0}Expected ${1} not to be equal to ${2}";

    assert.typeOf = function (actual, expected, message) {
        message = prepareAssertion("assert.typeOf", arguments, 2);

        if (typeof actual != expected) {
            fail("typeOf", "msgFail", message, actual, expected, typeof actual);
        }

        assert.pass("typeOf", message, actual, expected);
    };

    assert.typeOf.msgFail = "${0}Expected typeof ${1} (${3}) to be ${2}";

    assert.notTypeOf = function (actual, expected, message) {
        message = prepareAssertion("assert.notTypeOf", arguments, 2);

        if (typeof actual == expected) {
            fail("notTypeOf", "msgFail", message, actual, expected);
        }

        assert.pass("notTypeOf", message, actual, expected);
    };

    assert.notTypeOf.msgFail = "${0}Expected typeof ${1} not to be ${2}";

    assert.isString = function (actual, message) {
        message = prepareAssertion("assert.isString", arguments, 1);

        if (typeof actual != "string") {
            fail("isString", "msgFail", message, actual, typeof actual);
        }

        assert.pass("isString", message, actual);
    };

    assert.isString.msgFail = "${0}Expected typeof ${1} (${2}) to be string";

    assert.isObject = function (actual, message) {
        message = prepareAssertion("assert.isObject", arguments, 1);

        if (typeof actual != "object" || !actual) {
            fail("isObject", "msgFail", message, actual, typeof actual);
        }

        assert.pass("isObject", message, actual);
    };

    assert.isObject.msgFail = "${0}Expected typeof ${1} (${2}) to be object and not null";

    assert.isFunction = function (actual, message) {
        message = prepareAssertion("assert.isFunction", arguments, 1);

        if (typeof actual != "function") {
            fail("isFunction", "msgFail", message, actual, typeof actual);
        }

        assert.pass("isFunction", message, actual);
    };

    assert.isFunction.msgFail = "${0}Expected typeof ${1} (${2}) to be function";

    assert.isBoolean = function (actual, message) {
        message = prepareAssertion("assert.isBoolean", arguments, 1);

        if (typeof actual != "boolean") {
            fail("isBoolean", "msgFail", message, actual, typeof actual);
        }

        assert.pass("isBoolean", message, actual);
    };

    assert.isBoolean.msgFail = "${0}Expected typeof ${1} (${2}) to be boolean";

    assert.isNumber = function (actual, message) {
        message = prepareAssertion("assert.isNumber", arguments, 1);

        if (typeof actual != "number") {
            fail("isNumber", "msgFail", message, actual, typeof actual);
        }

        assert.pass("isNumber", message, actual);
    };

    assert.isNumber.msgFail = "${0}Expected typeof ${1} (${2}) to be number";

    assert.isUndefined = function (actual, message) {
        message = prepareAssertion("assert.isUndefined", arguments, 1);

        if (typeof actual != "undefined") {
            fail("isUndefined", "msgFail", message, actual, typeof actual);
        }

        assert.pass("isUndefined", message, actual);
    };

    assert.isUndefined.msgFail = "${0}Expected typeof ${1} (${2}) to be undefined";

    assert.isNotUndefined = function (actual, message) {
        message = prepareAssertion("assert.isNotUndefined", arguments, 1);

        if (typeof actual == "undefined") {
            fail("isNotUndefined", "msgFail", message, actual);
        }

        assert.pass("isNotUndefined", message, actual);
    };

    assert.isNotUndefined.msgFail = "${0}Expected not to be undefined";

    assert.isNull = function (actual, message) {
        message = prepareAssertion("assert.isNull", arguments, 1);

        if (actual !== null) {
            fail("isNull", "msgFail", message, actual);
        }

        assert.pass("isNull", message, actual);
    };

    assert.isNull.msgFail = "${0}Expected ${1} to be null";

    assert.isNotNull = function (actual, message) {
        message = prepareAssertion("assert.isNotNull", arguments, 1);

        if (actual === null) {
            fail("isNotNull", "msgFail", message);
        }

        assert.pass("isNotNull", message);
    };

    assert.isNotNull.msgFail = "${0}Expected not to be null";

    assert.isNaN = function (actual, message) {
        message = prepareAssertion("assert.isNaN", arguments, 1);

        if (!isNaN(actual)) {
            fail("isNaN", "msgFail", message, actual);
        }

        assert.pass("isNaN", message, actual);
    };

    assert.isNaN.msgFail = "${0}Expected ${1} to be NaN";

    assert.isNotNaN = function (actual, message) {
        message = prepareAssertion("assert.isNotNaN", arguments, 1);

        if (isNaN(actual)) {
            fail("isNotNaN", "msgFail", message, actual);
        }

        assert.pass("isNotNaN", message, actual);
    };

    assert.isNotNaN.msgFail = "${0}Expected not to be NaN";

    assert.isArray = function (actual, message) {
        message = prepareAssertion("assert.isArray", arguments, 1);

        if (toString.call(actual) != "[object Array]") {
            fail("isArray", "msgFail", message, actual);
        }

        assert.pass("isArray", message, actual);
    };

    assert.isArray.msgFail = "${0}Expected ${1} to be array";

    assert.isNotArray = function (actual, message) {
        message = prepareAssertion("assert.isNotArray", arguments, 1);

        if (toString.call(actual) == "[object Array]") {
            fail("isNotArray", "msgFail", message, actual);
        }

        assert.pass("isNotArray", message, actual);
    };

    assert.isNotArray.msgFail = "${0}Expected ${1} not to be array";

    function isArrayLike(object) {
        return toString.call(object) == "[object Array]" ||
            (!!object && typeof object.length == "number" &&
            typeof object.splice == "function") ||
            buster.util.isArguments(object);
    }

    assert.isArrayLike = function (actual, message) {
        message = prepareAssertion("assert.isArrayLike", arguments, 1);

        if (!isArrayLike(actual)) {
            fail("isArrayLike", "msgFail", message, actual);
        }

        assert.pass("isArrayLike", message, actual);
    };

    assert.isArrayLike.msgFail = "${0}Expected ${1} to be array like";

    assert.isNotArrayLike = function (actual, message) {
        message = prepareAssertion("assert.isNotArrayLike", arguments, 1);

        if (isArrayLike(actual)) {
            fail("isNotArrayLike", "msgFail", message, actual);
        }

        assert.pass("isNotArrayLike", message, actual);
    };

    assert.isNotArrayLike.msgFail = "${0}Expected ${1} not to be array like";

    function match(object, matcher) {
        if (matcher && typeof matcher.test == "function") {
            return matcher.test(object);
        }

        if (typeof matcher == "function") {
            return matcher(object) === true;
        }

        if (typeof matcher == "string") {
            matcher = matcher.toLowerCase();
            return !!object && ("" + object).toLowerCase().indexOf(matcher) >= 0;
        }

        if (typeof matcher == "number") {
            return matcher == object;
        }

        if (matcher && typeof matcher == "object") {
            for (var prop in matcher) {
                if (!match(object[prop], matcher[prop])) {
                    return false;
                }
            }

            return true;
        }

        throw new Error("Matcher (" + assert.format(matcher) + ") was not a " +
                        "string, a number, a function or an object");
    }

    assert.match = function (actual, matcher, message) {
        message = prepareAssertion("assert.match", arguments, 2);
        var passed;

        try {
            passed = match(actual, matcher);
        } catch (e) {
            fail("match", "msgException", message, e.message);
        }

        if (!passed) {
            fail("match", "msgFail", message, actual, matcher);
        }

        assert.pass("match", message, actual, matcher);
    };

    assert.match.msgException = "${0}${1}";
    assert.match.msgFail = "${0}Expected ${1} to match ${2}";

    assert.noMatch = function (actual, matcher, message) {
        message = prepareAssertion("assert.noMatch", arguments, 2);
        var passed;

        try {
            passed = match(actual, matcher);
        } catch (e) {
            fail("noMatch", "msgException", message, e.message);
        }

        if (passed) {
            fail("noMatch", "msgFail", message, matcher, actual);
        }

        assert.pass("noMatch", message, matcher, actual);
    };

    assert.noMatch.msgException = "${0}${1}";
    assert.noMatch.msgFail = "${0}Expected ${2} not to match ${1}";

    function captureException(callback) {
        try {
            callback();
        } catch (e) {
            return e;
        }

        return null;
    }

    assert.exception = function (callback, exception, message) {
        prepareAssertion("assert.exception", arguments, 1);
        var err = captureException(callback);
        message = message ? message + ": " : "";

        if (!err) {
            if (exception) {
                fail("exception", "msgTypeNoException", message, exception);
            } else {
                fail("exception", "msgFail", message, exception);
            }
        }

        if (exception && err.name != exception) {
            fail("exception", "msgTypeFail", message, exception, err.name);
        }

        assert.pass("exception", message, callback, exception);
    };

    assert.exception.msgTypeNoException = "${0}Expected ${1} but no exception was thrown";
    assert.exception.msgFail = "${0}Expected exception";
    assert.exception.msgTypeFail = "${0}Expected ${1} but threw ${2}";

    assert.noException = function (callback, message) {
        message = prepareAssertion("assert.noException", arguments, 1);
        var err = captureException(callback);

        if (err) {
            fail("noException", "msgFail", message, err.name, callback);
        }

        assert.pass("noException", message, callback);
    };

    assert.noException.msgFail = "${0}Expected not to throw but threw ${1}";

    assert.tagName = function (element, tagName, message) {
        message = prepareAssertion("assert.tagName", arguments, 2);

        if (!element.tagName) {
            fail("tagName", "msgNoTagName", message, tagName, element);
        }

        if (!tagName.toLowerCase ||
            tagName.toLowerCase() != element.tagName.toLowerCase()) {
            fail("tagName", "msgFail", message, tagName, element.tagName);
        }

        assert.pass("tagName", message, tagName, element);
    };

    assert.tagName.msgNoTagName = "${0}Expected ${2} to have tagName property";
    assert.tagName.msgFail = "${0}Expected tagName to be ${1} but was ${2}";

    assert.notTagName = function (element, tagName, message) {
        message = prepareAssertion("assert.notTagName", arguments, 2);

        if (!element.tagName) {
            fail("notTagName", "msgNoTagName", message, tagName, element);
        }

        if (tagName.toLowerCase &&
            tagName.toLowerCase() == element.tagName.toLowerCase()) {
            fail("notTagName", "msgFail", message, tagName);
        }

        assert.pass("notTagName", message, tagName, element);
    };

    assert.notTagName.msgNoTagName = "${0}Expected ${2} to have tagName property";
    assert.notTagName.msgFail = "${0}Expected tagName not to be ${1}";

    assert.className = function (element, tagName, message) {
        message = prepareAssertion("assert.className", arguments, 2);

        if (typeof element.className == "undefined") {
            fail("className", "msgNoClassName", message, tagName, element);
        }

        var expected = typeof tagName == "string" ? tagName.split(" ") : tagName;
        var actual = element.className.split(" ");

        for (var i = 0, l = expected.length; i < l; i++) {
            if (indexOf(actual, expected[i]) < 0) {
                fail("className", "msgFail", message, tagName, element.className);
            }
        }

        assert.pass("className", message, tagName, element);
    };

    assert.className.msgNoClassName = "${0}Expected object to have className property";
    assert.className.msgFail = "${0}Expected object's className to include ${1} but was ${2}";

    assert.notClassName = function (element, tagName, message) {
        message = prepareAssertion("assert.notClassName", arguments, 2);

        if (typeof element.className == "undefined") {
            fail("notClassName", "msgNoClassName", message, tagName, element);
        }

        var expected = typeof tagName == "string" ? tagName.split(" ") : tagName;
        var actual = element.className.split(" ");

        for (var i = 0, l = expected.length; i < l; i++) {
            if (indexOf(actual, expected[i]) < 0) {
                return assert.pass("notClassName", message, tagName, element);;
            }
        }

        fail("notClassName", "msgFail", message, tagName, element.className);
    };

    assert.notClassName.msgNoClassName = "${0}Expected object to have className property";
    assert.notClassName.msgFail = "${0}Expected object's className not to include ${1}";

    if (typeof module != "undefined") {
        module.exports = buster.assert;
    }
}());