/**
 * Created by Florin on 3/31/2017.
 */

define([
        './Namespaces',
        './OpenSearchImage',
        './OpenSearchQuery',
        './OpenSearchUrl',
    ],
    function (Namespaces,
              OpenSearchImage,
              OpenSearchQuery,
              OpenSearchUrl) {
        'use strict';

        var DescriptionDocument = function () {
            this.shortName = ''; //exactly once.
            this.description = ''; //exactly once.
            this.urls = []; //one or more times.
            this.contact = ''; //zero or one time.
            this.tags = ''; //zero or one time.
            this.longName = ''; //zero or one time.
            this.images = []; //zero, one, or more times.
            this.querys = []; //zero or more times.
            this.developer = ''; //zero or one time.
            this.attribution = ''; //zero or one time.
            this.syndicationRight = ''; //zero or one time.
            this.adultContent = ''; //zero or one time.
            this.languages = []; //zero, one, or more times.
            this.inputEncodings = []; //zero, one, or more times.
            this.outputEncodings = []; //zero, one, or more times.
        };

        DescriptionDocument.prototype.parse = function (xml) {
            var xmlDom = new DOMParser().parseFromString(xml, 'text/xml');
            //var a = xmlDom.getElementsByTagName("parsererror")[0].innerText;
            //console.log('parse errors', a);
            var root = xmlDom.documentElement;

            this.shortName = this.getNodeValue(root, 'ShortName');
            this.description = this.getNodeValue(root, 'Description');
            this.contact = this.getNodeValue(root, 'Contact');
            this.tags = this.getNodeValue(root, 'Tags');
            this.longName = this.getNodeValue(root, 'LongName');
            this.developer = this.getNodeValue(root, 'Developer');
            this.attribution = this.getNodeValue(root, 'Attribution');
            this.syndicationRight = this.getNodeValue(root, 'SyndicationRight');
            this.adultContent = this.getNodeValue(root, 'AdultContent');

            this.languages = this.getNodeValues(root, 'Language');
            this.inputEncodings = this.getNodeValues(root, 'InputEncoding');
            this.outputEncodings = this.getNodeValues(root, 'OutputEncoding');

            this.urls = this.getNodeValues(root, 'Url', OpenSearchUrl);
            this.images = this.getNodeValues(root, 'Image', OpenSearchImage);
            this.querys = this.getNodeValues(root, 'Query', OpenSearchQuery);

            return this;
        };

        DescriptionDocument.prototype.getNodeValue = function (root, tag) {
            var nodes = root.getElementsByTagNameNS(Namespaces.os, tag);
            if (nodes && nodes.length) {
                return nodes[0].textContent.trim();
            }
            return '';
        };

        DescriptionDocument.prototype.getNodeValues = function (root, tag, ctor) {
            var nodes = root.getElementsByTagNameNS(Namespaces.os, tag);
            if (nodes && nodes.length) {
                return [].slice.call(nodes).map(function (node) {
                    if (ctor) {
                        return (new ctor()).parse(node);
                    }
                    return node.textContent.trim();
                });
            }
            return [];
        };

        return DescriptionDocument;

    });