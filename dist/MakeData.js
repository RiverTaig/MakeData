define(["require", "exports", "dojo/dom", "esri/layers/GraphicsLayer", "esri/geometry/Polyline", "esri/geometry/Point", "esri/graphic", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/Color", "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/renderers/ClassBreaksRenderer", "esri/symbols/Font", "esri/symbols/TextSymbol", "esri/geometry/webMercatorUtils", "esri/geometry/Extent", "esri/tasks/query", "esri/dijit/PopupTemplate", "esri/layers/FeatureLayer", "esri/geometry/geometryEngine"], function (require, exports, dom, GraphicsLayer, Polyline, Point, Graphic, SimpleLineSymbol, SimpleMarkerSymbol, Color, SimpleRenderer, UniqueValueRenderer, ClassBreaksRenderer, Font, TextSymbol, WebMercatorUtils, Extent, Query, PopupTemplate, FeatureLayer, GeometryEngine) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MakeData = /** @class */ (function () {
        function MakeData(mapRef) {
            //tet
            this._privateVariable = null;
            this._traceResults = new GraphicsLayer({ id: "TraceResults" });
            this.randomFirstNames = [
                "Alan", "Barbara", "Chuck", "Dan", "Elise", "Frank", "Georgia", "Hank", "Ingrid", "Jack", "Kathy", "Larry", "Mary", "Ned", "Oprah",
                "Paul", "Queen", "Ron", "Susan", "Thom", "Uma", "Vince", "Wanda", "Xavier", "Yoko", "Zufong"
            ];
            this.randomCity = ["Austin", "Baltimore", "Chicago", "Denver", "Eugene", "Fargo", "Gainsville", "Houston", "Ipswich", "Jacksonville",
                "Kipler", "Lawrence", "Mayberry", "Nantucket", "Ogden", "Philadelphia", "Quebec City", "Ramon", "Susanville", "Toledo", "Ulster", "Venice",
                "Wilsonville", "Xanadu", "Yellowstone", "Zion"];
            this.randomState = ["Texas", "Utah", "Oregon", "Washington", "California", "Maine", "Mississippi", "Colorado", "Idaho", "Ohio", "Alabama",
                "Alaska", "New York", "Wyoming", "Oklahoma", "Montana", "Rhode Island", "New Jersey", "Wisconsin", "Virginia", "Pennsylvania", "Florida", "Hawaii",
                "Nebraska", "Arizona", "Illinois"];
            this.randomLastNames = [
                "Alberts", "Billings", "Chadwick", "Daniels", "Earnheardt", "Fairchild", "Grossman", "Harris", "Irwin", "Johnson", "Keeting", "Lawrence", "Michaels", "Nelson", "Olsen",
                "Poundstone", "Quincy", "Rasmussen", "Sadler", "Tillerson", "Urich", "Vance", "Wilson", "Xu", "Youngblood", "Zaher"
            ];
            this.randomStreets = [
                "Ash", "Berry", "Cherry", "Dogwood", "Elm", "Furley", "Gathorne", "Harleton", "Islington", "Jowett", "Kensington", "Lilestone", "Marlborough", "Newton", "Osbert",
                "Palmerston", "Queensland", "Raynor", "Sherwood", "Trinity", "Upwey", "Vacek", "Warwick", "Xenia", "Yardley", "Zealand"
            ];
            this._servicePointRenderer = {};
            //Simple Expression
            this.labelExpression0 = "\n    {FIRSTNAME} {LASTNAME}{NEWLINE}\n    {ADDRESS}\n    ";
            //Name / addreess / Total electric usage (aggregation)
            this.labelExpression1 = "\n    Name: {FIRSTNAME} {LASTNAME}{NEWLINE}\n    {ADDRESS},{CITY},{STATE}{NEWLINE}\n    <RELATION layerID=\"0\" primaryKey=\"USAGE\" foreignKey=\"\" where=\"\" outputRecords=\"relatedElectricUsageRecords\", fields=\"Month,Value\" >\n        <FOREACH delimter=\",\">\n            {Value}\n        </FOREACH>\n    </RELATION>\n    TOTAL: \n    <SUM inputRecords=\"relatedElectricUsageRecords\" field=\"Value\" round=\"2\" where=\"\">\n        {SUM} KWH\n    </SUM>\n    ";
            //Highest usage during summer (filtering)
            this.labelExpression2 = "\n    {ADDRESS}{NEWLINE}\n    <RELATION layerID=\"0\" primaryKey=\"USAGE\" foreignKey=\"\" \n        where=\"Month in ('Jun','July','Aug')\" outputRecords=\"relatedElectricUsageRecords\", fields=\"Month,Value\" >\n    </RELATION>\n    {NEWLINE}\n    TOTAL: <MAX inputRecords=\"relatedElectricUsageRecords\" field=\"Value\" round=\"2\">\n        {Month} : {Value} KWH\n    </MAX> \n    ";
            this._dictSpTopology = null;
            this._dictSP = null;
            console.log("constructor");
            this._mapRef = mapRef;
            this._glSp = new GraphicsLayer({ id: "ServicePoints" });
            this._gl06 = new GraphicsLayer({ id: "ElectricLines_06" });
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
            this.setupMapClickHandler();
            this.listenForExtentChange();
        }
        MakeData.prototype.listenForExtentChange = function () {
            var _this = this;
            this._mapRef.on("extent-change", function (e) {
                //return;
                console.log("extent change");
                var thisLevel = _this._mapRef.getLevel();
                _this._mapRef.graphics.clear();
                _this.LabelInExtent();
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
            var _this = this;
            var query = new Query();
            //query.outFields = ["*"];
            query.geometry = this._mapRef.extent;
            //query.spatialRelationship = "SPATIAL_REL_INTERSECTS";
            query.returnGeometry = true;
            if (this._spLayer) {
                if (this._spLayer.isVisibleAtScale(this._mapRef.getScale())) {
                    this._spLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (featureSet) {
                        _this.AddLabelsToGraphics(featureSet);
                    }, function (err) {
                        console.log("ERROR " + err.toString());
                    });
                }
            }
        };
        MakeData.prototype.AddLabelsToGraphics = function (featureSet) {
            var _this = this;
            var DISTANCE_AT_LEVEL_15 = 75;
            var MAXLABELS = 100;
            var checkForOverlap = true;
            var fontSize = 16;
            var stopLabelingAtThisExtent = false;
            var level = this._mapRef.getLevel();
            var deltaFromBaseLevel = 15 - level;
            var multiplier = Math.pow(2, deltaFromBaseLevel);
            var amountToAdd = multiplier * DISTANCE_AT_LEVEL_15;
            var spatRef = this._mapRef.spatialReference;
            var font = new Font(fontSize.toString() + "px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
            font.family = "Arial";
            var offset = this._mapRef.extent.getWidth() / 120;
            var labelsPlaced = 0;
            var labelExtents = [];
            for (var graphicIndex = 0; graphicIndex < featureSet.length; graphicIndex++) {
                if (stopLabelingAtThisExtent) {
                    break;
                }
                //when checking for overlaps, no extents beyond the currentLabelExtentsIndex needs to be checked (a label never overlaps with itself)
                var currentLabelExtentsIndex = labelExtents.length;
                var graphic = featureSet[graphicIndex];
                var startPoint = graphic.geometry;
                var x = graphic.geometry.x;
                var y = graphic.geometry.y;
                //TODO - Build this out to be flexible
                var textForLine1 = graphic.attributes["FIRSTNAME"] + " " + graphic.attributes["LASTNAME"] + " ";
                var textForLine2 = graphic.attributes["ADDRESS"] + " ST., " + graphic.attributes["CITY"] + ", " + graphic.attributes["STATE"];
                var textLines = [textForLine1, textForLine2];
                var labelThisFeature = true;
                var labelTuples = [];
                for (var lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
                    var textForLine = textLines[lineIndex];
                    var ts = new TextSymbol(textForLine, font, new Color([0, 0, 0]));
                    ts.xoffset = offset;
                    ts.yoffset = offset;
                    ts.haloColor = new Color([255, 255, 255]);
                    ts.haloSize = 2;
                    ts.setHorizontalAlignment("left");
                    var newX = x;
                    var newY = y - (lineIndex * amountToAdd);
                    var textPoint = new Point(newX, newY);
                    textPoint.spatialReference = spatRef;
                    if (checkForOverlap) {
                        var lineLength = multiplier * 1.5 * textForLine.length * fontSize;
                        var thisExtent = new Extent(newX, newY, (newX + lineLength), (newY + fontSize), spatRef);
                        if (this.hasOverlaps(labelExtents, thisExtent, currentLabelExtentsIndex) === false) {
                            labelExtents.push(thisExtent);
                            var lt = [textPoint, ts];
                            labelTuples.push(lt);
                        }
                        else {
                            labelThisFeature = false;
                            break;
                        }
                    }
                }
                if (labelThisFeature) {
                    labelTuples.forEach(function (labelTuple, index, labelTuples) {
                        var textGraphicToAdd = new Graphic(labelTuple[0], labelTuple[1]);
                        _this._mapRef.graphics.add(textGraphicToAdd);
                        labelsPlaced++;
                        if (labelsPlaced > MAXLABELS) {
                            stopLabelingAtThisExtent = true;
                            console.log("MAX LABELS REACHED FOR EXTENT");
                        }
                    });
                }
            }
        };
        MakeData.prototype.hasOverlaps = function (labelExtents, testExtent, currentLabelExtentsIndex) {
            for (var i = 0; i < currentLabelExtentsIndex; i++) {
                if (GeometryEngine.overlaps(labelExtents[i], testExtent)) {
                    return true;
                }
            }
            return false;
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
                description: "<H3>{ADDRESS}</H3><br>{PHONE}"
            });
            var featureLayer = new FeatureLayer(featureCollection, {
                id: 'servicePointLayer',
                infoTemplate: popupTemplate,
            });
            featureLayer.minScale = 4000;
            featureLayer.renderer = this._servicePointRenderer;
            this._mapRef.on("layer-add-result", function (results) {
                if (results.layer.id == "servicePointLayer") {
                    _this._spLayer = (results.layer);
                    //this._spLayer.renderer = this._servicePointRenderer;
                    //this._spLayer.minScale = 4000;
                    var features = [];
                    var graphics = _this._glSp.graphics;
                    for (var i = 0; i < graphics.length; i++) {
                        //for (let i = 0; i < 2; i++) {
                        var item = graphics[i];
                        features.push(item);
                    }
                    featureLayer.applyEdits(features, null, null, function (addsResult, deletsResult, updateResults) {
                    });
                }
            });
            featureLayer.on("click", function (evt) {
                var chkTrace = dom.byId("chkTraceUpstream");
                if (chkTrace.checked === false) {
                    //this._mapRef.infoWindow.setFeatures([evt.graphic]);
                }
                else {
                    //debugger;
                    var graphicIDInTrace = evt.graphic.attributes["LINKID"];
                    var graphicsToSymbolize = [];
                    var sls = new SimpleLineSymbol();
                    sls.setWidth(10);
                    sls.setStyle("STYLE_SHORTDASH");
                    sls.setColor(new Color([255, 255, 0, 1]));
                    while (graphicIDInTrace !== -1) {
                        //get the parent of thie current graphicID
                        //graphicIDInTrace = this._dictSpTopology.getValue(graphicIDInTrace);
                        //debugger;
                        var associatedGraphic = _this._dictSP[graphicIDInTrace];
                        //let assocGraphicCloned =  new Graphic(associatedGraphic);
                        var pl = new Polyline(_this._mapRef.spatialReference);
                        var x1 = associatedGraphic.geometry.paths[0][0][0];
                        var y1 = associatedGraphic.geometry.paths[0][0][1];
                        var x2 = associatedGraphic.geometry.paths[0][1][0];
                        var y2 = associatedGraphic.geometry.paths[0][1][1];
                        pl.addPath([[x1, y1], [x2, y2]]);
                        pl.spatialReference = _this._mapRef.spatialReference;
                        //associatedGraphic.geometry;
                        var newGraphic = new Graphic(pl, sls, associatedGraphic.attributes);
                        //newGraphic.attributes = associatedGraphic.attributes;//.toJson();
                        //newGraphic.geometry.spatialReference = this._mapRef.spatialReference;//.toJson();
                        //assocGraphicCloned.geometry.spatialReference = this._mapRef.spatialReference;
                        //assocGraphicCloned.symbol  =sls;
                        graphicsToSymbolize.push(newGraphic);
                        //debugger;
                        graphicIDInTrace = associatedGraphic.attributes["PARENT"];
                    }
                    _this._traceResults.clear();
                    var srs = new SimpleRenderer(sls);
                    _this._traceResults.setRenderer(srs);
                    _this._traceResults.setVisibility(true);
                    var resultsPolyline = new Polyline(_this._mapRef.spatialReference);
                    var pointsMakingUpPath = [];
                    for (var i = 0; i < graphicsToSymbolize.length; i++) {
                        var g = graphicsToSymbolize[i];
                        var path = g.geometry.paths[0];
                        var firstPoint = new Point(path[0]);
                        var secondPoint = new Point(path[1]);
                        firstPoint.setSpatialReference(_this._mapRef.spatialReference);
                        secondPoint.setSpatialReference(_this._mapRef.spatialReference);
                        pointsMakingUpPath.push(secondPoint);
                        pointsMakingUpPath.push(firstPoint);
                    }
                    resultsPolyline.addPath(pointsMakingUpPath);
                    var resultGraphic = new Graphic(resultsPolyline);
                    _this._traceResults.add(resultGraphic);
                    _this._mapRef.addLayer(_this._traceResults);
                    //debugger;
                }
            });
            this._mapRef.addLayer(featureLayer);
            //this._glSp.setVisibility(false);
            featureLayer.setVisibility(true);
            //associate the features with the popup on click
        };
        MakeData.prototype.DoTraceUpstream = function (graphic) {
            debugger;
        };
        MakeData.prototype.getFeatureLayer = function (layerName) {
            var _this = this;
            var retlyr = null;
            this._mapRef.graphicsLayerIds.forEach(function (layerID, index, array) {
                var lyr = _this._mapRef.getLayer(layerID);
                if (lyr.id.toUpperCase() === layerName.toUpperCase()) {
                    retlyr = lyr;
                }
            });
            return retlyr;
        };
        MakeData.prototype.LabelInExtent2 = function () {
        };
        //-116.476036,33.844951
        MakeData.prototype.setupMapClickHandler = function () {
            var _this = this;
            return;
            this._mapRef.on("click", function (e) {
                var chkTrace = dom.byId("chkTraceUpstream");
                if (chkTrace.checked) {
                    var pt = new Point(e.mapPoint.x, e.mapPoint.y, _this._mapRef.spatialReference);
                    var w = _this._mapRef.extent.getWidth() / 50;
                    var ext = new Extent(pt.x - w, pt.y - w, pt.x + w, pt.y + w, _this._mapRef.spatialReference);
                    var query = new Query();
                    //query.outFields = ["*"];
                    query.geometry = ext;
                    //query.spatialRelationship = "SPATIAL_REL_INTERSECTS";
                    query.returnGeometry = true;
                    if (_this._spLayer) {
                        if (_this._spLayer.isVisibleAtScale(_this._mapRef.getScale())) {
                            _this._spLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (featureSet) {
                                if (featureSet.length > 0) {
                                    var startID = featureSet[0].attributes["ID"];
                                    debugger;
                                }
                            }, function (err) {
                                console.log("ERROR " + err.toString());
                                debugger;
                            });
                        }
                    }
                }
            });
        };
        MakeData.prototype.MakeData = function () {
            try {
                var MAXLEVEL = 7;
                //this._dictSpTopology = new Collections.Dictionary<number,number>(); //Collections.Dictionary<number,number>();
                this._dictSP = new Object();
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
                    PARENT: line.parent,
                    LINKID: 0
                };
                //this._dictSpTopology.setValue(0,-1);
                this._dictSP[0] = g;
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
                        var usageString = JSON.stringify(usageObj);
                        for (var i_1 = 1; i_1 < 7; i_1++) {
                            usageString = usageString.replace(i_1.toString + "VALUE", (i_1 * Math.random()).toString());
                        }
                        for (var i_2 = 11; i_2 > 6; i_2--) {
                            usageString = usageString.replace(i_2.toString + "VALUE", ((12 - i_2) * Math.random()).toString());
                        }
                        //let g = new Graphic(newPolyline);//TODO TROUBLE LINE
                        var g_1 = new Graphic();
                        g_1.setGeometry(newPolyline);
                        if (g_1.geometry.paths[0][0][0] !== newPolyline.paths[0][0][0]) {
                            console.log("!! GEOMETRY REVERSAL??");
                            debugger;
                        }
                        if (newLevel === MAXLEVEL) {
                            var newSP = new Graphic(new Point(x2, y2).setSpatialReference(this._mapRef.spatialReference), null, {
                                ID: newLine.id,
                                LEVEL: Math.floor(Math.random() * 6),
                                FIRSTNAME: this.randomFirstNames[Math.floor(Math.random() * 26)],
                                LASTNAME: this.randomLastNames[Math.floor(Math.random() * 26)],
                                ADDRESS: Math.round((Math.random() * 1000)).toString() + " " + this.randomStreets[Math.floor(Math.random() * 26)],
                                CITY: this.randomCity[Math.floor(Math.random() * 26)],
                                STATE: this.randomState[Math.floor(Math.random() * 26)],
                                PHONE: "555-" + Math.floor(Math.random() * 10000) + 1000,
                                USAGE: usageString,
                                LINKID: newLine.id
                            });
                            this._glSp.add(newSP);
                        }
                        g_1.attributes = {
                            ID: newLine.id,
                            LEVEL: newLevel,
                            PARENT: newLine.parent,
                            LINKID: newLine.id
                        };
                        graphicArray.push(g_1);
                        //this._dictSpTopology.setValue(newLine.id,newLine.parent);
                        this._dictSP[newLine.id] = g_1; //newLine.parent;
                        console.log(newLevel);
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
                alert("done: TOTAL = " + graphicArray.length);
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