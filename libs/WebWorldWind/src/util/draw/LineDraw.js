/**
 * Created by Florin on 11/15/2016.
 */

define([], function () {

    var LineDraw = {

        wwd: null,
        positions: [],
        mouseDownPos: null,
        mouseUpPos: null,
        path: null,
        layer: null,
        placemarkAttributes: null,
        hasBegun: false,

        init: function (wwd, layer) {
            this.wwd = wwd;
            this.layer = layer;
            this.makePlacemarkAttributes();
            this.bindEvents();
            return this;
        },

        bindEvents: function () {
            var self = this;
            var wwd = this.wwd;
            wwd.addEventListener('mousedown', function (e) {
                self.onMouseDown(e)
            });
            wwd.addEventListener('mouseup', function (e) {
                self.onMouseUp(e);
            });
        },

        begin: function () {
            this.positions = [];
            this.hasBegun = true;
        },

        end: function () {
            this.hasBegun = false;
            return this.positions;
        },

        onMouseDown: function (e) {
            if (!this.hasBegun) {
                return;
            }
            this.mouseDownPos = this.wwd.canvasCoordinates(e.clientX, e.clientY);
        },

        onMouseUp: function (e) {
            if (!this.hasBegun) {
                return;
            }
            this.mouseUpPos = this.wwd.canvasCoordinates(e.clientX, e.clientY);
            if (this.isPan()) {
                return;
            }
            var terrainObject = this.wwd.pickTerrain(this.mouseUpPos).terrainObject();
            this.positions.push(terrainObject.position);
            this.draw();
        },

        isPan: function () {
            var dx = this.mouseDownPos[0] - this.mouseUpPos[0];
            var dy = this.mouseDownPos[1] - this.mouseUpPos[1];
            return (Math.abs(dx) > 2 || Math.abs(dy) > 2);
        },

        draw: function () {
            if (!this.path && this.positions.length >= 2) {
                this.path = new WorldWind.Path(this.positions);
                this.layer.addRenderable(this.path);
            }
            else if (this.path) {
                this.path.positions = this.positions;
            }
            var lastPos = this.positions[this.positions.length - 1];
            var placemark = this.makePlacemark(lastPos);
            this.layer.addRenderable(placemark);
            this.wwd.redraw();
        },

        makePlacemark: function (lastPos) {
            var placemark = new WorldWind.Placemark(lastPos);
            placemark.depthOffset = -2;
            placemark.label = lastPos.latitude.toFixed(2) + ' ' + lastPos.longitude.toFixed(2);
            placemark.attributes = this.placemarkAttributes;
            return placemark;
        },

        makePlacemarkAttributes: function () {
            this.placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
            this.placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/pushpins/castshadow-blue.png"
            this.placemarkAttributes.imageScale = 0.3;
            this.placemarkAttributes.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.5,
                WorldWind.OFFSET_FRACTION, 0);
            this.placemarkAttributes.imageColor = WorldWind.Color.WHITE;
            this.placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.5, //0.5
                WorldWind.OFFSET_FRACTION, 1.3);//1.0
            this.placemarkAttributes.labelAttributes.color = WorldWind.Color.WHITE;
        }

    };

    return LineDraw;

});