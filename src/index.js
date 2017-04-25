/**
 * Created by Florin on 4/4/2017.
 */

import {discover} from 'opensearch-browser';
import {registerFormat} from 'opensearch-browser/dist/formats/index';
import WorldWind from '../libs/WebWorldWind/src/WorldWind';
import GeoJSONCollection from './GeoJSONCollection';
import {shapeConfigurationCallback} from './shapeConfigurationCallback';
import './fullScreenCanvas';


const wwd = new WorldWind.WorldWindow('canvasOne');
window.wwd = wwd;
const BMNGLayer = new WorldWind.BMNGLayer();
const polygonLayer = new WorldWind.RenderableLayer('Polygon');
wwd.addLayer(BMNGLayer);
wwd.addLayer(polygonLayer);


/*overwrite the Atom parser the library uses*/
const format = {
    parse(response) {
        const xmlDom = (new DOMParser()).parseFromString(response, 'text/xml');
        return (new GeoJSONCollection()).parse(xmlDom.documentElement);
    }
};
registerFormat('application/atom+xml', format);


const fedeoUrl = 'http://localhost:9001/fedeo';
const fedeoQuery = {
    startDate: new Date('2004-05-16T00:00:00Z'),
    endDate: new Date('2005-05-16T00:00:00Z'),
    recordSchema: 'om'
};

const sxcatUrl = 'http://sxcat.eox.at/opensearch/collections/ASA_IMP_1P';
const sxcatQuery = {count: 50};

var a = 'http://fedeo.esa.int/opensearch/request' +
    '?parentIdentifier=EOP:ESA:GPOD-EO:TLM_MIRA1A' +
    '&orbitNumber=[21180,21193]' +
    '&httpAccept=application/atom%2Bxml' +
    '&recordSchema=om';

discover(fedeoUrl)
    .then(service => {
        console.log('service', service);
        console.log('getDescription', service.getDescription());
        console.log('getPaginator', service.getPaginator());
        console.log('getUrl', service.getUrl());
        return service.search(fedeoQuery);
    })
    .then(geoJSONCollection => {
        console.log('geoJSONCollection', geoJSONCollection);
        const polygonGeoJSON = new WorldWind.GeoJSONParser(geoJSONCollection.stringify());
        polygonGeoJSON.load(null, shapeConfigurationCallback, polygonLayer);
    })
    .catch(err => console.error(err));