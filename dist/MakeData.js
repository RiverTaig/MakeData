define(["require", "exports", "esri/layers/GraphicsLayer", "esri/geometry/Polyline", "esri/geometry/Point", "esri/graphic", "esri/symbols/SimpleMarkerSymbol", "esri/Color", "esri/renderers/UniqueValueRenderer", "esri/renderers/ClassBreaksRenderer", "esri/symbols/Font", "esri/symbols/TextSymbol", "esri/geometry/webMercatorUtils", "esri/dijit/PopupTemplate", "esri/layers/FeatureLayer"], function (require, exports, GraphicsLayer, Polyline, Point, Graphic, SimpleMarkerSymbol, Color, UniqueValueRenderer, ClassBreaksRenderer, Font, TextSymbol, WebMercatorUtils, PopupTemplate, FeatureLayer) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MakeData = /** @class */ (function () {
        function MakeData(mapRef) {
            this._privateVariable = null;
            this.randomFirstNames = [
                "Alan", "Barbara", "Chuck", "Elise", "Frank", "Georgia", "Hank", "Ingrid", "Jack", "Kathy", "Larry", "Mary", "Ned", "Oprah",
                "Paul", "Queen", "Ron", "Susan", "Thom", "Uma", "Vince", "Wanda", "Xavier", "Yoko", "Zufong"
            ];
            this.randomCity = ["Austin", "Baltimore", "Chicago", "Denver", "Eugene", "Fargo", "Gainsville", "Houston", "Dallas", "Toledo"];
            this.randomState = ["Texas", "Utah", "Oregon", "Washington", "California", "Maine", "Mississippi", "Colorado", "Idaho", "Ohio"];
            this.randomLastNames = [
                "Alberts", "Billings", "Chadwick", "Earnheardt", "Fairchild", "Grossman", "Harris", "Irwin", "Johnson", "Keeting", "Lawrence", "Michaels", "Nelson", "Olsen",
                "Poundstone", "Quincy", "Rasmussen", "Sadler", "Tillerson", "Urich", "Vance", "Wilson", "Xu", "Youngblood", "Zaher"
            ];
            this.randomStreets = [
                "Ash", "Berry", "Cherry", "Dogwood", "Elm", "Furley", "Gathorne", "Harleton", "Islington", "Jowett", "Kensington", "Lilestone", "Marlborough", "Newton", "Osbert",
                "Palmerston", "Queensland", "Raynor", "Sherwood", "Trinity", "Upwey", "Vacek", "Warwick", "Xenia", "Yardley", "Zealand"
            ];
            this._servicePointRenderer = {};
            this._previousLevel = 15;
            //Simple Expression
            this.labelExpression0 = "\n    {FIRSTNAME} {LASTNAME}{NEWLINE}\n    {ADDRESS}\n    ";
            //Name / addreess / Total electric usage (aggregation)
            this.labelExpression1 = "\n    Name: {FIRSTNAME} {LASTNAME}{NEWLINE}\n    {ADDRESS},{CITY},{STATE}{NEWLINE}\n    <RELATION layerID=\"0\" primaryKey=\"USAGE\" foreignKey=\"\" where=\"\" outputRecords=\"relatedElectricUsageRecords\", fields=\"Month,Value\" >\n        <FOREACH delimter=\",\">\n            {Value}\n        </FOREACH>\n    </RELATION>\n    TOTAL: \n    <SUM inputRecords=\"relatedElectricUsageRecords\" field=\"Value\" round=\"2\" where=\"\">\n        {SUM} KWH\n    </SUM>\n    ";
            //Highest usage during summer (filtering)
            this.labelExpression2 = "\n    {ADDRESS}{NEWLINE}\n    <RELATION layerID=\"0\" primaryKey=\"USAGE\" foreignKey=\"\" \n        where=\"Month in ('Jun','July','Aug')\" outputRecords=\"relatedElectricUsageRecords\", fields=\"Month,Value\" >\n    </RELATION>\n    {NEWLINE}\n    TOTAL: <MAX inputRecords=\"relatedElectricUsageRecords\" field=\"Value\" round=\"2\">\n        {Month} : {Value} KWH\n    </MAX> \n    ";
            //debugger;
            console.log("constructor");
            this._mapRef = mapRef;
            this._glSp = new GraphicsLayer({ id: "ServicePoints" });
            this._gl06 = new GraphicsLayer({ id: "ElectricLines_06" });
            /*this._gl1 = new GraphicsLayer({ id: "ElectricLines_1" });
            this._gl2 = new GraphicsLayer({ id: "ElectricLines_2" });
            this._gl3 = new GraphicsLayer({ id: "ElectricLines_3" });
            this._gl4 = new GraphicsLayer({ id: "ElectricLines_4" });
            this._gl5 = new GraphicsLayer({ id: "ElectricLines_5" });*/
            this._gl7 = new GraphicsLayer({ id: "ElectricLines_7" });
            this._gl8 = new GraphicsLayer({ id: "ElectricLines_8" });
            var uvr = new UniqueValueRenderer(this.uniqueValueRendererJSON());
            var uvrSP = new UniqueValueRenderer(this.uniqueValueRenderer_sp_JSON());
            var symbol = new SimpleMarkerSymbol();
            symbol.setColor(new Color([150, 150, 150, 0.5]));
            symbol.setSize(20);
            var renderer = new ClassBreaksRenderer(symbol, "LEVEL");
            renderer.addBreak(0, 1, new SimpleMarkerSymbol().setColor(new Color([56, 168, 0, 0.5])));
            renderer.addBreak(1, 2, (new SimpleMarkerSymbol().setColor(new Color([139, 209, 0, 0.5]))).setSize(40));
            renderer.addBreak(2, 3, new SimpleMarkerSymbol().setColor(new Color([255, 255, 0, 0.5])));
            renderer.addBreak(3, 4, new SimpleMarkerSymbol().setColor(new Color([255, 128, 0, 0.5])));
            renderer.addBreak(4, 5, new SimpleMarkerSymbol().setColor(new Color([255, 128, 100, 0.5])));
            renderer.addBreak(5, Infinity, new SimpleMarkerSymbol().setColor(new Color([255, 128, 200, 0.5])));
            this._servicePointRenderer = renderer; // renderer.toJson();
            //renderer.addBreak(400, Infinity, new SimpleMarkerSymbol().setColor(new Color([255, 0, 0, 0.5])));
            this._gl06.renderer = uvr;
            this._gl7.renderer = uvr;
            this._gl8.renderer = uvr;
            this._glSp.renderer = renderer; //uvrSP;
            this._gl7.minScale = 8000;
            this._gl8.minScale = 4000;
            this._glSp.minScale = 4000;
            this.setupMapClickHandler();
            this.listenForExtentChange();
        }
        MakeData.prototype.listenForExtentChange = function () {
            var _this = this;
            this._mapRef.on("extent-change", function (e) {
                console.log("extent change");
                var thisLevel = _this._mapRef.getLevel();
                if (_this._previousLevel != thisLevel) {
                    //this._mapRef.graphics.clear();
                    _this.LabelInExtent();
                }
                _this._previousLevel = thisLevel;
            });
        };
        MakeData.prototype.ProjectLatLongPoint = function (lat, long, map) {
            //Guard against a mistake where lat=long
            if (lat < -90) {
                var tempLat = lat;
                var tempLon = long;
                lat = tempLon;
                long = tempLat;
            }
            var llpnt = new Point(long, lat);
            var mapPoint = WebMercatorUtils.geographicToWebMercator(llpnt);
            return mapPoint;
        };
        MakeData.prototype.LabelInExtent = function () {
        };
        MakeData.prototype.MakeSPGraphicsIntoFeatureLayer = function () {
            var _this = this;
            var featureCollection = {
                "layerDefinition": null,
                "featureSet": {
                    "features": [],
                    "geometryType": "esriGeometryPoint"
                }
            };
            //FIRSTNAME,LASTNAME,ADDRESS,CITY,STATE,USAGE,ID
            featureCollection.layerDefinition = {
                "geometryType": "esriGeometryPoint",
                "objectIdField": "ID",
                "drawingInfo": {
                    "renderer": {
                        "type": "simple",
                        "label": "",
                        "description": "",
                        "symbol": {
                            "color": [210, 105, 30, 191],
                            "size": 6,
                            "angle": 0,
                            "xoffset": 0,
                            "yoffset": 0,
                            "type": "esriSMS",
                            "style": "esriSMSCircle",
                            "outline": {
                                "color": [0, 0, 128, 255],
                                "width": 0,
                                "type": "esriSLS",
                                "style": "esriSLSSolid"
                            }
                        }
                    }
                },
                "fields": [{
                        "name": "ID",
                        "alias": "ObjectID",
                        "type": "esriFieldTypeOID"
                    }, {
                        "name": "FIRSTNAME",
                        "alias": "First Name",
                        "type": "esriFieldTypeString"
                    }, {
                        "name": "LASTNAME",
                        "alias": "Last Name",
                        "type": "esriFieldTypeString"
                    },
                    {
                        "name": "ADDRESS",
                        "alias": "Address",
                        "type": "esriFieldTypeString"
                    },
                    {
                        "name": "CITY",
                        "alias": "City",
                        "type": "esriFieldTypeString"
                    },
                    {
                        "name": "STATE",
                        "alias": "State",
                        "type": "esriFieldTypeString"
                    },
                    {
                        "name": "USAGE",
                        "alias": "Electric Usage",
                        "type": "esriFieldTypeString"
                    }
                ]
            };
            //featureCollection.layerDefinition.drawingInfo.renderer = this._servicePointRenderer;
            var popupTemplate = new PopupTemplate({
                title: "{FIRSTNAME} {LASTNAME}",
                description: "{ADDRESS}"
            });
            var featureLayer = new FeatureLayer(featureCollection, {
                id: 'servicePointLayer',
                infoTemplate: popupTemplate
            });
            this._mapRef.on("layer-add-result", function (results) {
                debugger;
                (results.layer).renderer = _this._servicePointRenderer;
                var features = [];
                var graphics = _this._glSp.graphics;
                for (var i = 0; i < graphics.length; i++) {
                    //for (let i = 0; i < 2; i++) {
                    var item = graphics[i];
                    features.push(item);
                }
                featureLayer.applyEdits(features, null, null, function (addsResult, deletsResult, updateResults) {
                    //debugger;
                });
            });
            featureLayer.on("click", function (evt) {
                this.mapRef.infoWindow.setFeatures([evt.graphic]);
            });
            this._mapRef.addLayer(featureLayer);
            //this._glSp.setVisibility(false);
            featureLayer.setVisibility(true);
            //associate the features with the popup on click
        };
        MakeData.prototype.getFeatureLayer = function (layerName) {
            var _this = this;
            var retlyr = null;
            this._mapRef.graphicsLayerIds.forEach(function (layerID, index, array) {
                var lyr = _this._mapRef.getLayer(layerID);
                if (lyr.id === layerName) {
                    retlyr = lyr;
                }
            });
            return retlyr;
        };
        MakeData.prototype.LabelInExtent2 = function () {
            var DISTANCE_AT_LEVEL_15 = 100;
            var font = new Font("20px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
            var textSymbol1 = new TextSymbol("Line 1", font, new Color([0, 0, 0]));
            var textSymbol2 = new TextSymbol("Line 2", font, new Color([255, 0, 0]));
            var x = (this._mapRef.extent.xmax + this._mapRef.extent.xmin) / 2;
            var y = (this._mapRef.extent.ymax + this._mapRef.extent.ymin) / 2;
            var xy = new Point(x, y).setSpatialReference(this._mapRef.spatialReference);
            var level = this._mapRef.getLevel();
            var deltaFromBaseLevel = 15 - level;
            var multiplier = Math.pow(2, deltaFromBaseLevel);
            var amountToAdd = multiplier * DISTANCE_AT_LEVEL_15;
            var xy2 = new Point(xy.x, xy.y + amountToAdd);
            xy2.spatialReference = this._mapRef.spatialReference;
            var labelPointGraphic1 = new Graphic(xy, textSymbol1);
            var labelPointGraphic2 = new Graphic(xy2, textSymbol2);
            this._mapRef.graphics.add(labelPointGraphic1);
            this._mapRef.graphics.add(labelPointGraphic2);
        };
        //-116.476036,33.844951
        MakeData.prototype.setupMapClickHandler = function () {
            var _this = this;
            this._mapRef.on("click", function (e) {
                var lyr = _this.getFeatureLayer("servicePointLayer");
                var test = lyr.graphics;
                var test2 = test.length;
                var test3 = test[0].geometry;
                var test4 = test[1].attributes;
                var test5 = test[1].attributes["CITY"];
                var test6 = test[1].attributes["ID"];
                var test7 = test[1].attributes["USAGE"];
                console.log(e.mapPoint.x + "," + e.mapPoint.y + "   |    " + test3.x + "," + test3.y);
                //debugger;
                var scale = (_this._mapRef.getScale());
                var y = _this._mapRef.position.y;
                var vis = _this._glSp.isVisibleAtScale(scale);
                var attributes = _this._glSp.graphics[123].attributes;
                var geom = _this._glSp.graphics[123].geometry;
                //debugger;
            });
        };
        MakeData.prototype.MakeData = function () {
            try {
                var MAXLEVEL = 6;
                this._gl06.clear();
                this._gl7.clear();
                this._gl8.clear();
                this._glSp.clear();
                var linesArray = [];
                var graphicArray = [];
                var startLineFromPoint = this.ProjectLatLongPoint(33.802558, -116.545520, this._mapRef);
                var endLineFromPoint = this.ProjectLatLongPoint(33.82484, -116.489442, this._mapRef);
                var startLine = new Polyline([[startLineFromPoint.x, startLineFromPoint.y], [endLineFromPoint.x, endLineFromPoint.y]]);
                startLine.spatialReference = this._mapRef.spatialReference;
                var line = new Line(0, -1, startLine, 0);
                var g = new Graphic(line.geom);
                g.attributes = {
                    ID: line.id,
                    LEVEL: 0,
                    PARENT: line.parent
                };
                graphicArray.push(g);
                //linesArray.push(line);
                var linesToVisit = [line];
                var lineMaxID = 0;
                while (linesToVisit.length > 0) {
                    var currentLine = linesToVisit.pop();
                    var x1 = currentLine.toPoint.x;
                    var y1 = currentLine.toPoint.y;
                    var newLevel = currentLine.level + 1;
                    if (newLevel > MAXLEVEL) {
                        continue;
                    }
                    var newLength = 5000 / (Math.pow(2, newLevel)); //LEVELS 0-6 LENGTHS ARE: 
                    //add random number to the angle between 20 degrees and 70 degrees (.349 radians and 1.222 radians)
                    var radiansToAdd = (Math.floor(Math.random() * (1222 - 349)) + 349) / 1000;
                    for (var i = 0; i < 4; i++) {
                        var x2 = x1 + Math.cos((i * (Math.PI / 2)) + radiansToAdd) * newLength;
                        var y2 = y1 - Math.sin((i * (Math.PI / 2)) + radiansToAdd) * newLength;
                        var newPolyline = new Polyline([currentLine.toPointArray, [x2, y2]]);
                        newPolyline.spatialReference = this._mapRef.spatialReference;
                        lineMaxID++;
                        var newLine = new Line(lineMaxID, currentLine.id, newPolyline, newLevel);
                        linesToVisit.push(newLine);
                        //linesArray.push(newLine);
                        //todo move these out
                        var usageObj = {
                            "records": [
                                [{ "Month": "JAN" }, { "Value": "0VALUE" }],
                                [{ "Month": "FEB" }, { "Value": "1VALUE" }],
                                [{ "Month": "MAR" }, { "Value": "2VALUE" }],
                                [{ "Month": "APR" }, { "Value": "3VALUE" }],
                                [{ "Month": "MAY" }, { "Value": "4VALUE" }],
                                [{ "Month": "JUN" }, { "Value": "5VALUE" }],
                                [{ "Month": "JUL" }, { "Value": "6VALUE" }],
                                [{ "Month": "AUG" }, { "Value": "7VALUE" }],
                                [{ "Month": "SEP" }, { "Value": "8VALUE" }],
                                [{ "Month": "OCT" }, { "Value": "9VALUE" }],
                                [{ "Month": "NOV" }, { "Value": "10VALUE" }],
                                [{ "Month": "DEC" }, { "Value": "11VALUE" }],
                            ]
                        };
                        // {"Month":"Jan","Value":"0VALUE"},
                        // {"Month":"Feb","Value":1VALUE},
                        // {"Month":"Mar","Value":2VALUE},
                        // {"Month":"Apr","Value":3VALUE},
                        // {"Month":"May","Value":4VALUE},
                        // {"Month":"Jun","Value":5VALUE},
                        // {"Month":"Jul":,"Value":6VALUE},
                        // {"Month":"Aug","Value":7VALUE},
                        // {"Month":"Sep","Value":8VALUE},
                        // {"Month":"Oct","Value":9VALUE},
                        // {"Month":"Nov","Value":10VALUE},
                        // {"Month":"Dec","Value":11VALUE},
                        var usageString = JSON.stringify(usageObj);
                        for (var i_1 = 1; i_1 < 7; i_1++) {
                            usageString = usageString.replace(i_1.toString + "VALUE", (i_1 * Math.random()).toString());
                        }
                        for (var i_2 = 11; i_2 > 6; i_2--) {
                            usageString = usageString.replace(i_2.toString + "VALUE", ((12 - i_2) * Math.random()).toString());
                        }
                        var g_1 = new Graphic(newPolyline);
                        if (newLevel === MAXLEVEL) {
                            var newSP = new Graphic(new Point(x2, y2).setSpatialReference(this._mapRef.spatialReference), null, {
                                ID: newLine.id,
                                LEVEL: Math.floor(Math.random() * 6),
                                FIRSTNAME: this.randomFirstNames[Math.floor(Math.random() * 26)],
                                LASTNAME: this.randomLastNames[Math.floor(Math.random() * 26)],
                                ADDRESS: Math.round((Math.random() * 1000)).toString() + " " + this.randomStreets[Math.floor(Math.random() * 26)],
                                CITY: this.randomCity[Math.floor(Math.random() * 11)],
                                STATE: this.randomState[Math.floor(Math.random() * 11)],
                                USAGE: usageString
                            });
                            this._glSp.add(newSP);
                        }
                        g_1.attributes = {
                            ID: newLine.id,
                            LEVEL: newLevel,
                            PARENT: newLine.parent
                        };
                        graphicArray.push(g_1);
                        //this._gl.add(g);
                        //console.log(lineMaxID + "  " + newLevel);
                        console.log(newLevel);
                        //debugger;
                    }
                }
                //alert("Starting to add " + graphicArray.length + " feature graphics to map");
                var totalGraphics = graphicArray.length;
                for (var i = 0; i < totalGraphics; i++) {
                    var graphic = graphicArray[i];
                    switch (graphic.attributes.LEVEL) {
                        case 7:
                            this._gl7.add(graphic);
                            break;
                        case 8:
                            this._gl8.add(graphic);
                            break;
                        default:
                            this._gl06.add(graphic);
                            break;
                    }
                }
                this._mapRef.addLayer(this._gl06);
                this._mapRef.addLayer(this._gl7);
                this._mapRef.addLayer(this._gl8);
                //this._mapRef.addLayer(this._glSp);
                //alert("done: " + this._gl8.graphics.length + " in last layer. TOTAL = " + graphicArray.length);
            }
            catch (ex) {
                console.log("ERROR! " + ex.toString());
            }
        };
        MakeData.prototype.uniqueValueRenderer_sp_JSON = function () {
            return {
                "type": "uniqueValue",
                "field1": "LEVEL",
                "defaultSymbol": {
                    "color": [0, 0, 0, 78],
                    "size": 6,
                    "type": "esriSMS",
                    "style": "esriSMSCircle"
                },
                "uniqueValueInfos": [
                    {
                        "value": "1",
                        "symbol": {
                            "color": [255, 0, 0, 78],
                            "size": 20,
                            "type": "esriSMS",
                            "style": "esriSMSCircle"
                        }
                    },
                    {
                        "value": "2",
                        "symbol": {
                            "color": [0, 255, 0, 78],
                            "size": 30,
                            "type": "esriSMS",
                            "style": "esriSMSCircle"
                        }
                    }
                ]
            };
        };
        MakeData.prototype.uniqueValueRendererJSON = function () {
            return {
                "type": "uniqueValue",
                "field1": "LEVEL",
                "defaultSymbol": {
                    "color": [0, 0, 0, 255],
                    "width": 1,
                    "type": "esriSLS"
                },
                "uniqueValueInfos": [{
                        "value": "0",
                        "symbol": {
                            "color": [255, 0, 0, 255],
                            "width": 8,
                            "type": "esriSLS"
                        }
                    },
                    {
                        "value": "1",
                        "symbol": {
                            "color": [0, 255, 0, 255],
                            "width": 7,
                            "type": "esriSLS"
                        }
                    },
                    {
                        "value": "2",
                        "symbol": {
                            "color": [0, 0, 255, 255],
                            "width": 6,
                            "type": "esriSLS"
                        }
                    },
                    {
                        "value": "3",
                        "symbol": {
                            "color": [255, 0, 255, 255],
                            "width": 5,
                            "type": "esriSLS"
                        }
                    },
                    {
                        "value": "4",
                        "symbol": {
                            "color": [255, 0, 0, 255],
                            "width": 4,
                            "type": "esriSLS"
                        }
                    },
                    {
                        "value": "5",
                        "symbol": {
                            "color": [0, 255, 0, 255],
                            "width": 3,
                            "type": "esriSLS"
                        }
                    }, {
                        "value": "6",
                        "symbol": {
                            "color": [0, 0, 255, 255],
                            "width": 2,
                            "type": "esriSLS"
                        }
                    },
                    {
                        "value": "7",
                        "symbol": {
                            "color": [255, 0, 255, 255],
                            "width": 1,
                            "type": "esriSLS"
                        }
                    }]
            };
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
                var latLongPoint = new Point(this.geom.paths[0][1]);
                return latLongPoint;
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
        Object.defineProperty(Line.prototype, "toPointArray", {
            get: function () {
                return [this.toPoint.x, this.toPoint.y];
            },
            enumerable: true,
            configurable: true
        });
        return Line;
    }());
});
//# sourceMappingURL=MakeData.js.map