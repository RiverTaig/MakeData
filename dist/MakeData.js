define(["require", "exports", "esri/layers/GraphicsLayer", "esri/geometry/Polyline", "esri/geometry/Point", "esri/graphic", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/renderers/SimpleRenderer"], function (require, exports, GraphicsLayer, Polyline, Point, Graphic, SimpleFillSymbol, Color, SimpleRenderer) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MakeData = /** @class */ (function () {
        function MakeData(mapRef) {
            this._privateVariable = null;
            //debugger;
            console.log("constructor");
            this._mapRef = mapRef;
            this._gl = new GraphicsLayer({ id: "ElectricLines" });
            var symbol = new SimpleFillSymbol(); //.setColor(null).outline.setColor("blue");
            symbol.setColor(new Color([255, 0, 255, 0.75]));
            symbol.width = 5;
            var simpleRenderer = new SimpleRenderer(symbol);
            this._gl.renderer = simpleRenderer;
            this._mapRef.addLayer(this.gl);
            this.setupMapClickHandler();
        }
        //-116.476036,33.844951
        MakeData.prototype.setupMapClickHandler = function () {
            this._mapRef.on("click", function () {
                alert("click");
            });
        };
        MakeData.prototype.MakeData = function () {
            try {
                var MAXLEVEL = 2;
                var linesArray = [];
                var line = new Line(0, -1, new Polyline([[-116.545520, 33.802558], [-116.489442, 33.82484]]), 0);
                linesArray.push(line);
                var linesToVisit = [line];
                while (linesToVisit.length > 0) {
                    var currentLine = linesToVisit.pop();
                    var newLevel = currentLine.level + 1;
                    if (newLevel > MAXLEVEL) {
                        continue;
                    }
                    var newLength = .06 / (Math.pow(2, newLevel)); //LEVELS 0-6 LENGTHS ARE: .06,.03,.15,.0075,.00375, .001875, .000938  
                    //add random number to the angle between 20 degrees and 70 degrees (.349 radians and 1.222 radians)
                    var radiansToAdd = (Math.floor(Math.random() * (1222 - 349)) + 349) / 1000;
                    console.log(radiansToAdd);
                }
                var g = new Graphic(line.geom);
                this._gl.add(g);
            }
            catch (ex) {
                console.log("ERROR " + ex.toString());
            }
        };
        return MakeData;
    }());
    exports.MakeData = MakeData;
    var Line = /** @class */ (function () {
        function Line(id, parent, geom, level) {
            this.id = id;
            this.parent = parent;
            this.geom = geom;
            this.level = level;
            this._angleRadians = 0;
            this._angleDegrees = 0;
        }
        Object.defineProperty(Line.prototype, "angleDegrees", {
            get: function () {
                if (this._angleDegrees === 0) {
                    this.calculateAngles();
                }
                return this._angleDegrees;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "angleRadians", {
            get: function () {
                if (this._angleRadians === 0) {
                    this.calculateAngles();
                }
                return this._angleRadians;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "fromPoint", {
            get: function () {
                return new Point(this.geom.paths[0][0]);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "toPoint", {
            get: function () {
                return new Point(this.geom.paths[0][1]);
            },
            enumerable: true,
            configurable: true
        });
        Line.prototype.calculateAngles = function () {
            var currentLine = this;
            var logicalLine = currentLine.geom.paths[0];
            var firstPoint = this.fromPoint;
            var secondPoint = this.toPoint;
            var angleRadians = Math.atan2(secondPoint.y - firstPoint.y, secondPoint.x - firstPoint.x);
            this._angleDegrees = angleRadians * (360 / (2 * Math.PI));
            this._angleRadians = angleRadians;
        };
        return Line;
    }());
});
//# sourceMappingURL=MakeData.js.map