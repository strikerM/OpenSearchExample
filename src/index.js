/**
 * Created by Florin on 4/4/2017.
 */

import {discover} from 'opensearch-browser';
import WorldWind from '../libs/WebWorldWind/src/WorldWind';

const canvasContainer = document.getElementById('canvas-container');
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    canvasContainer.style.width = window.innerWidth + 'px';
    canvasContainer.style.height = window.innerHeight + 'px';
}
onWindowResize();


const wwd = new WorldWind.WorldWindow('canvasOne');
const BMNGLayer = new WorldWind.BMNGLayer();
const polygonLayer = new WorldWind.RenderableLayer('Polygon');
wwd.addLayer(BMNGLayer);
wwd.addLayer(polygonLayer);


const url = 'http://sxcat.eox.at/opensearch/collections/ASA_IMP_1P';
const url2 = 'http://fedeo.esa.int/opensearch/request?parentIdentifier=EOP:ESA:GPOD-EO:MER_RR__2P&startDate=2004-05-16T00:00:00Z&endDate=2005-05-16T00:00:00Z&httpAccept=application/atom%2Bxml&recordSchema=om';

var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
placemarkAttributes.imageScale = 0.05;
placemarkAttributes.imageColor = WorldWind.Color.WHITE;
placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 1.5);
var shapeConfigurationCallback = function (geometry, properties) {
    var configuration = {};

    if (geometry.isPointType() || geometry.isMultiPointType()) {
        configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);

        if (properties && (properties.name || properties.Name || properties.NAME)) {
            configuration.name = properties.name || properties.Name || properties.NAME;
        }
        if (properties && properties.POP_MAX) {
            var population = properties.POP_MAX;
            configuration.attributes.imageScale = 0.01 * Math.log(population);
        }
    }
    else if (geometry.isLineStringType() || geometry.isMultiLineStringType()) {
        configuration.attributes = new WorldWind.ShapeAttributes(null);
        configuration.attributes.drawOutline = true;
        configuration.attributes.outlineColor = new WorldWind.Color(
            0.1 * configuration.attributes.interiorColor.red,
            0.3 * configuration.attributes.interiorColor.green,
            0.7 * configuration.attributes.interiorColor.blue,
            1.0);
        configuration.attributes.outlineWidth = 1.0;
    }
    else if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
        configuration.attributes = new WorldWind.ShapeAttributes(null);

        // Fill the polygon with a random pastel color.
        configuration.attributes.interiorColor = new WorldWind.Color(
            0.375 + 0.5 * Math.random(),
            0.375 + 0.5 * Math.random(),
            0.375 + 0.5 * Math.random(),
            0.6);
        // Paint the outline in a darker variant of the interior color.
        configuration.attributes.outlineColor = new WorldWind.Color(
            0.5 * configuration.attributes.interiorColor.red,
            0.5 * configuration.attributes.interiorColor.green,
            0.5 * configuration.attributes.interiorColor.blue,
            1.0);
    }

    return configuration;
};

discover(url)
    .then(service => service.search({count: 50}))
    .then(results => {
        console.log('results', results);
        const polygonGeoJSON = new WorldWind.GeoJSONParser(toGeoJSON(results.records));
        polygonGeoJSON.load(null, shapeConfigurationCallback, polygonLayer);
    })
    .catch(err => console.error(err));

function toGeoJSON(records) {
    records.forEach(rec => {
        if (!rec.type) {
            rec.type = 'Feature';
        }
    });
    const geoJSON = {
        type: 'FeatureCollection',
        features: records
    };
    return JSON.stringify(geoJSON);
}