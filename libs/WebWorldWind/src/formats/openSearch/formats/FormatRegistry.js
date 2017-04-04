/**
 * Created by Florin on 4/3/2017.
 */

define([
        './FormatTypes'
    ],
    function (FormatTypes) {
        'use strict';

        var FormatRegistry = function () {

        };

        FormatRegistry.prototype.registerFormat = function (type, format) {
            this[type] = format;
        };

        FormatRegistry.prototype.getFormats = function () {
            return Object.keys(this);
        };

        FormatRegistry.prototype.getFormat = function (type) {
            return this[type];
        };

        return FormatRegistry;
    });