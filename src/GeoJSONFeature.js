/**
 * Created by Florin on 4/6/2017.
 */

import {getTextContent, queryBtTag} from './utils';

export default class GeoJSONFeature {

    constructor() {
        this.type = 'Feature';

        this.bbox = [];

        this.geometry = {
            type: '',
            coordinates: []
        };

        this.properties = {

            phenomenonTime: {
                begin: null,
                end: null
            },

            resultTime: null,

            earthObservationEquipment: {
                platform: {
                    shortName: '',
                    serialIdentifier: '',
                    orbitType: ''
                },
                instrument: {
                    shortName: '',
                    description: '',
                    instrumentType: ''
                },
                sensor: {
                    sensorType: '',
                    operationalMode: '',
                    resolution: '',
                    swathIdentifier: '',
                    discreteWavelengths: '',
                    endWavelength: '',
                    spectralRange: '',
                    startWavelength: '',
                    wavelengthResolution: ''
                },
                acquisitionParameters: {
                    orbitNumber: '',
                    lastOrbitNumber: '',
                    orbitDirection: '',
                    wrsLongitudeGrid: '',
                    wrsLatitudeGrid: '',
                    ascendingNodeDate: '',
                    ascendingNodeLongitude: '',
                    startTimeFromAscendingNode: '',
                    completionTimeFromAscendingNode: '',
                    orbitDuration: '',
                    illuminationAzimuthAngle: '',
                    illuminationZenithAngle: '',
                    illuminationElevationAngle: '',
                    incidenceAngle: '',
                    acrossTrackIncidenceAngle: '',
                    alongTrackIncidenceAngle: '',
                    instrumentAzimuthAngle: '',
                    instrumentZenithAngle: '',
                    instrumentElevationAngle: '',
                    pitch: '',
                    roll: '',
                    yaw: ''
                },
            },

            //not implemented
            earthObservationResult: {
                browse: {
                    type: '',
                    subtype: '',
                    referenceSystemIdentifier: '',
                    filename: ''
                },
                product: {
                    filename: '',
                    referenceSystemIdentifier: '',
                    version: '',
                    size: ''
                },
                mask: {
                    type: '',
                    format: '',
                    referenceSystemIdentifier: '',
                    fileName: ''
                },
                parameter: {
                    unitOfMeasure: [],
                    phenomenon: '',
                    coverage: []
                },

            },

            earthObservationMetaData: {
                identifier: '',
                creationDate: '',
                doi: '',
                parentIdentifier: '',
                acquisitionType: '',
                acquisitionSubType: '',
                productType: '',
                status: '',
                statusDetail: '',
                downlinkedTo: {
                    acquisitionStation: [], //not implemented
                    acquisitionDate: ''
                },
                archivedIn: {
                    archivingCenter: [], //not implemented
                    archivingDate: '',
                    archivingIdentifier: ''
                },
                imageQualityDegradation: '',
                imageQualityDegradationQuotationMode: '',
                histograms: {
                    bandId: [], //not implemented
                    min: '',
                    max: '',
                    mean: '',
                    stdDeviation: '',
                    composedOf: [], //not implemented
                    subsetOf: [], //not implemented
                    linkedWith: [], //not implemented
                },
                processing: {
                    processingCenter: [], //not implemented
                    processingDate: '',
                    compositeType: '',
                    method: '',
                    methodVersion: '',
                    processingMode: '',
                    processorName: '',
                    processorVersion: '',
                    processingLevel: '',
                    nativeProductFormat: '',
                    auxiliaryDataSetFileName: [], //not implemented
                },
            },

        };
    }

    parse(earthObsNode) {
        const childNodes = earthObsNode.childNodes;

        for (var i = 0; i < childNodes.length; i++) {
            var node = childNodes[i];

            if (node.nodeType !== 1) {
                continue;
            }

            switch (node.nodeName) {

                case 'om:phenomenonTime':
                    const begin = getTextContent(node, 'beginPosition');
                    const end = getTextContent(node, 'endPosition');
                    if (begin) {
                        this.properties.phenomenonTime.begin = new Date(begin);
                    }
                    if (end) {
                        this.properties.phenomenonTime.end = new Date(end);
                    }
                    break;

                case 'om:resultTime':
                    const resultTime = getTextContent(node, 'timePosition');
                    if (resultTime) {
                        this.properties.resultTime = new Date(resultTime);
                    }
                    break;

                case 'om:procedure':
                    const EOEquipmentNode = queryBtTag(node, 'EarthObservationEquipment');
                    if (EOEquipmentNode.length) {
                        this.parseEarthObservationEquipment(EOEquipmentNode[0]);
                    }
                    break;

                //not implemented
                case 'om:observedProperty':
                    break;

                case 'om:featureOfInterest':
                    const multiSurface = queryBtTag(node, 'MultiSurface');
                    if (!multiSurface.length) {
                        return;
                    }
                    this.parseGeometry(multiSurface[0]);
                    break;

                //not implemented
                case 'om:result':
                    break;

                case 'eop:metaDataProperty':
                    const EOMetaDataNode = queryBtTag(node, 'EarthObservationMetaData');
                    if (EOMetaDataNode.length) {
                        this.parseEarthObservationMetaData(EOMetaDataNode[0]);
                    }
                    break;

                default:
                    console.log('Unsupported node', node.nodeName);
                    break;
            }

        }

        return this;
    }

    parseGeometry(multiSurfaceNode) {
        const srsName = multiSurfaceNode.getAttribute('srsName');
        const stride = parseInt(multiSurfaceNode.getAttribute('srsDimension'), 10);
        const polygonsNodes = multiSurfaceNode.getElementsByTagName('Polygon');
        if (!polygonsNodes || !polygonsNodes.length) {
            return;
        }

        this.geometry.type = 'Polygon';
        if (polygonsNodes.length > 1) {
            this.geometry.type = 'MultiPolygon'
        }

        var polygon = [];
        for (var i = 0; i < polygonsNodes.length; i++) {
            var positions = this.parsePolygon(polygonsNodes[i], srsName, stride);
            if (positions.length) {
                if (this.geometry.type === 'Polygon') {
                    this.geometry.coordinates.push(positions);
                }
                else if (this.geometry.type === 'MultiPolygon') {
                    polygon.push(positions);
                }
            }
        }
        if (this.geometry.type === 'MultiPolygon') {
            this.geometry.coordinates.push(polygon);
        }
    }

    parsePolygon(polygonNode, srsName, globalStride) {
        const positions = [];
        const positionNodes = polygonNode.getElementsByTagName('posList');
        if (positionNodes && positionNodes.length) {
            const positionNode = positionNodes[0];
            const stride = parseInt(positionNode.getAttribute('srsDimension'), 10) || globalStride || 2;
            const rawPositions = positionNode.textContent.trim().replace(/\s+/g, ' ').split(' ');
            for (var i = 0; i < rawPositions.length; i += stride) {
                var position = [];
                for (var j = 0; j < stride; j++) {
                    position.push(+rawPositions[i + j]);
                }
                if (srsName === 'EPSG:4326') {
                    var temp = position[0];
                    position[0] = position[1];
                    position[1] = temp;
                }
                positions.push(position);
            }
        }
        return positions;
    }

    parseEarthObservationEquipment(EOEquipmentNode) {
        const childNodes = EOEquipmentNode.childNodes;

        for (var i = 0; i < childNodes.length; i++) {
            var node = childNodes[i];

            if (node.nodeType !== 1) {
                continue;
            }

            switch (node.nodeName) {

                case 'eop:platform':
                    const platform = this.properties.earthObservationEquipment.platform;
                    Object.keys(platform).forEach(key => platform[key] = getTextContent(node, key));
                    break;

                case 'eop:instrument':
                    const instrument = this.properties.earthObservationEquipment.instrument;
                    Object.keys(instrument).forEach(key => instrument[key] = getTextContent(node, key));
                    break;

                case 'eop:sensor':
                    const sensor = this.properties.earthObservationEquipment.sensor;
                    Object.keys(sensor).forEach(key => sensor[key] = getTextContent(node, key));
                    break;

                case 'eop:acquisitionParameters':
                    const acqParams = this.properties.earthObservationEquipment.acquisitionParameters;
                    Object.keys(acqParams).forEach(key => acqParams[key] = getTextContent(node, key));
                    break;
            }
        }
    }

    parseEarthObservationMetaData(EOMetaDataNode) {
        const EOMetaData = this.properties.earthObservationMetaData;
        Object.keys(EOMetaData).forEach(key => {
            if (typeof EOMetaData[key] === 'string') {
                EOMetaData[key] = getTextContent(EOMetaDataNode, key);
            }
        });

        const childNodes = EOMetaDataNode.childNodes;

        for (var i = 0; i < childNodes.length; i++) {
            var node = childNodes[i];

            if (node.nodeType !== 1) {
                continue;
            }

            switch (node.nodeName) {

                case 'eop:downlinkedTo':
                case 'downlinkedTo':
                    const downlinkedTo = this.properties.earthObservationMetaData.downlinkedTo;
                    Object.keys(downlinkedTo).forEach(key => {
                        if (typeof downlinkedTo[key] === 'string') {
                            downlinkedTo[key] = getTextContent(node, key);
                        }
                    });
                    break;

                case 'eop:archivedIn':
                case 'archivedIn':
                    const archivedIn = this.properties.earthObservationMetaData.archivedIn;
                    Object.keys(archivedIn).forEach(key => {
                        if (typeof archivedIn[key] === 'string') {
                            archivedIn[key] = getTextContent(node, key);
                        }
                    });
                    break;

                case 'eop:histograms':
                case 'histograms':
                    const histograms = this.properties.earthObservationMetaData.histograms;
                    Object.keys(histograms).forEach(key => {
                        if (typeof histograms[key] === 'string') {
                            histograms[key] = getTextContent(node, key);
                        }
                    });
                    break;

                case 'eop:processing':
                case 'processing':
                    const processing = this.properties.earthObservationMetaData.processing;
                    Object.keys(processing).forEach(key => {
                        if (typeof processing[key] === 'string') {
                            processing[key] = getTextContent(node, key);
                        }
                    });
                    break;
            }
        }
    }

}