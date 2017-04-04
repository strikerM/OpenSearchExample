/**
 * Created by Florin on 3/31/2017.
 */

define([], function () {
    'use strict';

    var OpenSearchImage = function () {
        this.height = 0; //optional
        this.width = 0; //optional
        this.type = ''; //optional
        this.src = ''; //required ???
    };

    OpenSearchImage.prototype.parse = function (imageNode) {
        this.height = parseInt(imageNode.getAttribute('height'), 10) || 0;
        this.width = parseInt(imageNode.getAttribute('width'), 10) || 0;
        this.type = imageNode.getAttribute('type');
        this.src = imageNode.textContent.trim();
        return this;
    };

    return OpenSearchImage;
});