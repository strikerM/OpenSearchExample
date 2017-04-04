/**
 * Created by Florin on 3/31/2017.
 */

define([], function () {
    'use strict';

    var OpenSearchQuery = function () {
    };

    OpenSearchQuery.prototype.parse = function (node) {
        for (var i = 0, len = node.attributes.length; i < len; i++) {
            var attribute = node.attributes[i];
            var localName = attribute.localName;
            this[localName] = attribute.nodeValue;
        }
        return this;
    };

    return OpenSearchQuery;

});