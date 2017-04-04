/**
 * Created by Florin on 3/31/2017.
 */

define([], function () {
    'use strict';

    var OpenSearchUrl = function () {
        this.template = ''; //required
        this.type = ''; //required
        this.rel = ''; //optional
        this.indexOffset = ''; //optional
        this.pageOffset = ''; //optional

        this.host = '';
        this.queryParams = Object.create(null);
    };

    OpenSearchUrl.prototype.parse = function (urlNode) {
        this.template = urlNode.getAttribute('template');
        this.type = urlNode.getAttribute('type');
        this.rel = urlNode.getAttribute('rel');
        this.indexOffset = parseInt(urlNode.getAttribute('indexOffset'), 10) || null;
        this.pageOffset = parseInt(urlNode.getAttribute('pageOffset'), 10) || null;

        this.parseTemplate(this.template);

        return this;
    };

    OpenSearchUrl.prototype.parseTemplate = function (template) {
        var parser = OpenSearchUrl.urlParser;
        parser.href = template;

        this.host = parser.protocol + '//' + parser.hostname + parser.port + parser.pathname;
        var query = parser.search;

        if (query === '?}') {
            console.error('this type of url is not yet implemented');
            return;
        }

        this.parseQueryString(query);
    };

    OpenSearchUrl.prototype.parseQueryString = function (queryString) {
        if (queryString[0] === '?') {
            queryString = queryString.slice(1);
        }
        var queries = queryString.split('&');
        for (var i = 0; i < queries.length; i++) {
            var queryParts = queries[i].split('=');
            var queryParam = queryParts[0];
            var queryValue = queryParts[1];
            var replaceable = true;
            if (queryValue[0] === '{') {
                var paramName = queryValue.slice(1, queryValue.length - 1);
            }
            else {
                paramName = queryValue;
                replaceable = false;
            }
            var optional = false;
            if (paramName[paramName.length - 1] === '?') {
                optional = true;
                paramName = paramName.slice(0, paramName.length - 1);
            }
            var paramNameParts = paramName.split(':');
            var ns = '';
            if (paramNameParts && paramNameParts.length === 2) {
                ns = paramNameParts[0];
                paramName = paramNameParts[1];
            }
            this.queryParams[queryParam] = {
                key: queryParam,
                value: paramName,
                optional: optional,
                replaceable: replaceable,
                ns: ns || ''
            };
        }
    };

    OpenSearchUrl.urlParser = document.createElement('a');

    return OpenSearchUrl;
});