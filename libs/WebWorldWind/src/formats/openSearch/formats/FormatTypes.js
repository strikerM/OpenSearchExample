/**
 * Created by Florin on 4/3/2017.
 */

define([], function() {
    'use strict';

    var FormatTypes = {
        atom: 'application/atom+xml',
        rss: 'application/rss+xml',
        json: 'application/json',
        kml: 'application/vnd.google-earth.kml+xml',
        kmz: 'application/vnd.google-earth.kmz',
        geoJson: 'application/vnd.geo+json'
    };

    return FormatTypes;
});