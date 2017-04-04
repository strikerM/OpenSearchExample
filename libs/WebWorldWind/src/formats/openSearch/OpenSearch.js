/**
 * Created by Florin on 3/31/2017.
 */

define([],
    function (DescriptionDocument) {
        'use strict';

        var OpenSearch = {
            discover: function (url, cb) {
                this.fetch(url, function (err, responseText) {
                    if (err) {
                        return cb(err, null);
                    }
                    var descriptionDocument = new DescriptionDocument().parse(responseText);
                    return cb(null, descriptionDocument);
                });
            },

            search: function () {

            },

            fetch: function (url, cb) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (this.status > 200 && this.status < 300) {
                        return cb(null, this.responseText);
                    }
                    return cb(new Error(this.status), null);
                };
                xhr.onerror = function () {
                    return cb(new Error('Network Error'), null);
                };
                xhr.open('GET', url, true);
                xhr.send();
            },
        };

        return OpenSearch;
    });