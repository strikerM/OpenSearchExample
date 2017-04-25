/**
 * Created by Florin on 4/6/2017.
 */

import GeoJSONFeature from './GeoJSONFeature';
import { queryBtTag } from './utils';

export default class GeoJSONCollection {

    constructor() {
        this.type = 'FeatureCollection';
        this.features = [];
    }

    parse(root) {
        const earthObservationNodes = queryBtTag(root, 'EarthObservation');
        this.features = earthObservationNodes.map(eoNode => new GeoJSONFeature().parse(eoNode));
        return this;
    }

    stringify() {
        return JSON.stringify(this);
    }

}