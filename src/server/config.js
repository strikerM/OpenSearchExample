/**
 * Created by Florin on 4/27/2016.
 */

var port = 9001;
var publicIpAddress = 'localhost';
var publicPort = 9001;
var serverAddress = 'http://' + publicIpAddress + ':' + publicPort;

module.exports = {

    port: port,

    fedeoDescrDoc: 'http://fedeo.esa.int/opensearch/description.xml?parentIdentifier=EOP:ESA:GPOD-EO:MER_RR__2P',

    UrlTag1: 'template="http://fedeo.esa.int',
    UrlTag1Replace: 'template="' + serverAddress,

    UrlTag2: 'template="http://fedeo.esa.int',
    UrlTag2Replace: 'template="' + serverAddress,

    fedeoAddress: 'http://fedeo.esa.int/opensearch/request?',

    originalTileUrl: 'http://eumetview.eumetsat.int:80/geoserv/ows?SERVICE=WMS&amp;',
    originalLegendUrl: 'http://eumetview.eumetsat.int:80/geoserv/ows?service=WMS&',
    
};