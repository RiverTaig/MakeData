import * as Dialog from 'dijit/Dialog';

import ESRIMap = require("esri/map");
import * as dom from 'dojo/dom';
//import Collections = require('typescript-collections');
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Polyline = require("esri/geometry/Polyline");
import Point = require("esri/geometry/Point");
import Graphic = require("esri/graphic");
import SpatialReference = require("esri/SpatialReference");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");
import Color = require("esri/Color");
import SimpleRenderer = require("esri/renderers/SimpleRenderer");
import UniqueValueRenderer = require("esri/renderers/UniqueValueRenderer");
import ClassBreaksRenderer = require("esri/renderers/ClassBreaksRenderer");
import Font = require("esri/symbols/Font");
import TextSymbol = require("esri/symbols/TextSymbol");
import WebMercatorUtils = require("esri/geometry/webMercatorUtils")
import ScreenUtils = require("esri/geometry/screenUtils");
import Extent = require("esri/geometry/Extent");
import ScreenPoint = require("esri/geometry/ScreenPoint");
import Query = require("esri/tasks/query");
import PopupTemplate = require("esri/dijit/PopupTemplate");
import Request = require("esri/request");
import FeatureLayer = require("esri/layers/FeatureLayer");
import FeatureSet = require("esri/tasks/FeatureSet");
import GeometryEngine = require("esri/geometry/geometryEngine");
import Polygon = require("esri/geometry/Polygon");
import * as Collections from 'typescript-collections';
import { PolyLine } from 'dojox/gfx/shape';

declare var require: any;

export class MakeData {
    //tet
    private _privateVariable: string = null;
    private _mapRef: ESRIMap;
    private _glSp: GraphicsLayer;
    private _traceResults = new GraphicsLayer({ id: "TraceResults" });
    private _gl06: GraphicsLayer;
    private _spLayer: FeatureLayer;
    /*private _gl1: GraphicsLayer;
    private _gl2: GraphicsLayer;
    private _gl3: GraphicsLayer;
    private _gl4: GraphicsLayer;
    private _gl5: GraphicsLayer;*/
    private _gl7: GraphicsLayer;
    private _gl8: GraphicsLayer;
    private randomFirstNames: string[] = [
        "Alan", "Barbara", "Chuck", "Dan", "Elise", "Frank", "Georgia", "Hank", "Ingrid", "Jack", "Kathy", "Larry", "Mary", "Ned", "Oprah",
        "Paul", "Queen", "Ron", "Susan", "Thom", "Uma", "Vince", "Wanda", "Xavier", "Yoko", "Zufong"
    ];
    private randomCity: string[] = ["Austin", "Baltimore", "Chicago", "Denver", "Eugene", "Fargo", "Gainsville", "Houston", "Ipswich", "Jacksonville",
        "Kipler", "Lawrence", "Mayberry", "Nantucket", "Ogden", "Philadelphia", "Quebec City", "Ramon", "Susanville", "Toledo", "Ulster", "Venice",
        "Wilsonville", "Xanadu", "Yellowstone", "Zion"];
    private randomState: string[] = ["Texas", "Utah", "Oregon", "Washington", "California", "Maine", "Mississippi", "Colorado", "Idaho", "Ohio", "Alabama",
        "Alaska", "New York", "Wyoming", "Oklahoma", "Montana", "Rhode Island", "New Jersey", "Wisconsin", "Virginia", "Pennsylvania", "Florida", "Hawaii",
        "Nebraska", "Arizona", "Illinois"];
    private randomLastNames: string[] = [
        "Alberts", "Billings", "Chadwick", "Daniels", "Earnheardt", "Fairchild", "Grossman", "Harris", "Irwin", "Johnson", "Keeting", "Lawrence", "Michaels", "Nelson", "Olsen",
        "Poundstone", "Quincy", "Rasmussen", "Sadler", "Tillerson", "Urich", "Vance", "Wilson", "Xu", "Youngblood", "Zaher"
    ];
    private randomStreets: string[] = [
        "Ash", "Berry", "Cherry", "Dogwood", "Elm", "Furley", "Gathorne", "Harleton", "Islington", "Jowett", "Kensington", "Lilestone", "Marlborough", "Newton", "Osbert",
        "Palmerston", "Queensland", "Raynor", "Sherwood", "Trinity", "Upwey", "Vacek", "Warwick", "Xenia", "Yardley", "Zealand"
    ];
    private _servicePointRenderer: any = {};
    constructor(mapRef: ESRIMap) {

        console.log("constructor");
        this._mapRef = mapRef;
        this._glSp = new GraphicsLayer({ id: "ServicePoints" });
        this._gl06 = new GraphicsLayer({ id: "ElectricLines_06" });

        this._gl7 = new GraphicsLayer({ id: "ElectricLines_7" });
        this._gl8 = new GraphicsLayer({ id: "ElectricLines_8" });
        let uvr = new UniqueValueRenderer(this.uniqueValueRendererJSON());
        let uvrSP = new UniqueValueRenderer(this.uniqueValueRenderer_sp_JSON());

        var symbol = new SimpleMarkerSymbol();
        symbol.setColor(new Color([150, 150, 150, 0.5]));
        symbol.setSize(20);
        let renderer = new ClassBreaksRenderer(symbol, "LEVEL");
        renderer.addBreak(0, 1, new SimpleMarkerSymbol().setColor(new Color([56, 168, 0, 0.5])));
        renderer.addBreak(1, 2, ((new SimpleMarkerSymbol().setColor(new Color([139, 209, 0, 0.5]))) as SimpleMarkerSymbol).setSize(40));
        renderer.addBreak(2, 3, new SimpleMarkerSymbol().setColor(new Color([255, 255, 0, 0.5])));
        renderer.addBreak(3, 4, new SimpleMarkerSymbol().setColor(new Color([255, 128, 0, 0.5])));
        renderer.addBreak(4, 5, new SimpleMarkerSymbol().setColor(new Color([255, 128, 100, 0.5])));
        renderer.addBreak(5, Infinity, new SimpleMarkerSymbol().setColor(new Color([255, 128, 200, 0.5])));
        this._servicePointRenderer = renderer;// renderer.toJson();
        //renderer.addBreak(400, Infinity, new SimpleMarkerSymbol().setColor(new Color([255, 0, 0, 0.5])));

        this._gl06.renderer = uvr;
        this._gl7.renderer = uvr;
        this._gl8.renderer = uvr;
        this._glSp.renderer = renderer;//uvrSP;
        this._gl7.minScale = 8000;
        this._gl8.minScale = 4000;

        this.setupMapClickHandler();
        this.listenForExtentChange();
    }

    listenForExtentChange() {
        this._mapRef.on("extent-change", (e) => {
            //return;
            console.log("extent change");
            let thisLevel = this._mapRef.getLevel();

            this._mapRef.graphics.clear();
            this.LabelInExtent();

        });
    }
    ProjectLatLongPoint(lat: number, long: number, map: ESRIMap): Point {
        //Guard against a mistake where lat=long
        if (lat < -90) {
            let tempLat = lat;
            let tempLon = long;
            lat = tempLon;
            long = tempLat;
        }
        let llpnt: Point = new Point(long, lat);

        let mapPoint = WebMercatorUtils.geographicToWebMercator(llpnt) as Point;
        return mapPoint;
    }

    //Simple Expression
    private labelExpression0 = `
    {FIRSTNAME} {LASTNAME}{NEWLINE}
    {ADDRESS}
    `;

    //Name / addreess / Total electric usage (aggregation)
    private labelExpression1 = `
    Name: {FIRSTNAME} {LASTNAME}{NEWLINE}
    {ADDRESS},{CITY},{STATE}{NEWLINE}
    <RELATION layerID="0" primaryKey="USAGE" foreignKey="" where="" outputRecords="relatedElectricUsageRecords", fields="Month,Value" >
        <FOREACH delimter=",">
            {Value}
        </FOREACH>
    </RELATION>
    TOTAL: 
    <SUM inputRecords="relatedElectricUsageRecords" field="Value" round="2" where="">
        {SUM} KWH
    </SUM>
    `;

    //Highest usage during summer (filtering)
    private labelExpression2 = `
    {ADDRESS}{NEWLINE}
    <RELATION layerID="0" primaryKey="USAGE" foreignKey="" 
        where="Month in ('Jun','July','Aug')" outputRecords="relatedElectricUsageRecords", fields="Month,Value" >
    </RELATION>
    {NEWLINE}
    TOTAL: <MAX inputRecords="relatedElectricUsageRecords" field="Value" round="2">
        {Month} : {Value} KWH
    </MAX> 
    `    ;

    LabelInExtent() {
        let query = new Query();
        //query.outFields = ["*"];
        query.geometry = this._mapRef.extent;
        //query.spatialRelationship = "SPATIAL_REL_INTERSECTS";
        query.returnGeometry = true;

        if (this._spLayer) {
            if (this._spLayer.isVisibleAtScale(this._mapRef.getScale())) {
                this._spLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, (featureSet: any) => {
                    this.AddLabelsToGraphics(featureSet);

                }, (err: any) => {
                    console.log("ERROR " + err.toString());

                });
            }
        }

    }
    AddLabelsToGraphics(featureSet: Graphic[]) {

        const DISTANCE_AT_LEVEL_15 = 75;
        const MAXLABELS = 100;
        let checkForOverlap = true;
        let fontSize = 16;
        let stopLabelingAtThisExtent = false;
        let level = this._mapRef.getLevel();
        let deltaFromBaseLevel = 15 - level;
        let multiplier = Math.pow(2, deltaFromBaseLevel);
        let amountToAdd = multiplier * DISTANCE_AT_LEVEL_15;
        let spatRef = this._mapRef.spatialReference;
        let font = new Font(fontSize.toString() + "px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
        font.family = "Arial";
        let offset = this._mapRef.extent.getWidth() / 120;
        let labelsPlaced = 0;
        let labelExtents: Extent[] = [];
        for (let graphicIndex = 0; graphicIndex < featureSet.length; graphicIndex++) {
            if (stopLabelingAtThisExtent) {
                break;
            }
            //when checking for overlaps, no extents beyond the currentLabelExtentsIndex needs to be checked (a label never overlaps with itself)
            let currentLabelExtentsIndex = labelExtents.length;
            let graphic = featureSet[graphicIndex];
            let startPoint = <Point>graphic.geometry;
            let x = (graphic.geometry as Point).x;
            let y = (graphic.geometry as Point).y;

            //TODO - Build this out to be flexible
            let textForLine1 = `${graphic.attributes["FIRSTNAME"]} ${graphic.attributes["LASTNAME"]} `;
            let textForLine2 = `${graphic.attributes["ADDRESS"]} ST., ${graphic.attributes["CITY"]}, ${graphic.attributes["STATE"]}`;
            let textLines = [textForLine1, textForLine2];
            let labelThisFeature: boolean = true;
            type labelTuple = [Point, TextSymbol];
            let labelTuples: labelTuple[] = [];
            for (let lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
                let textForLine = textLines[lineIndex];
                let ts = new TextSymbol(textForLine, font, new Color([0, 0, 0]));
                ts.xoffset = offset;
                ts.yoffset = offset;
                ts.haloColor = new Color([255, 255, 255]);
                ts.haloSize = 2;
                ts.setHorizontalAlignment("left");
                let newX = x;
                let newY = y - (lineIndex * amountToAdd);
                let textPoint = new Point(newX, newY);
                textPoint.spatialReference = spatRef;
                if (checkForOverlap) {
                    let lineLength = multiplier * 1.5 * textForLine.length * fontSize;
                    let thisExtent = new Extent(newX, newY, (newX + lineLength), (newY + fontSize), spatRef);
                    if (this.hasOverlaps(labelExtents, thisExtent, currentLabelExtentsIndex) === false) {
                        labelExtents.push(thisExtent);
                        let lt: labelTuple = [textPoint, ts];
                        labelTuples.push(lt);
                    }
                    else {
                        labelThisFeature = false;
                        break;
                    }
                }

            }
            if (labelThisFeature) {
                labelTuples.forEach((labelTuple, index, labelTuples) => {
                    let textGraphicToAdd = new Graphic(labelTuple[0], labelTuple[1]);
                    this._mapRef.graphics.add(textGraphicToAdd);
                    labelsPlaced++;
                    if (labelsPlaced > MAXLABELS) {
                        stopLabelingAtThisExtent = true;
                        console.log("MAX LABELS REACHED FOR EXTENT");
                    }
                });
            }
        }
    }
    hasOverlaps(labelExtents: Extent[], testExtent: Extent, currentLabelExtentsIndex: number): boolean {
        for (let i = 0; i < currentLabelExtentsIndex; i++) {
            if (GeometryEngine.overlaps(labelExtents[i], testExtent)) {
                return true;
            }
        }
        return false;
    }
    MakeSPGraphicsIntoFeatureLayer() {
        let featureCollection: any = {
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
            description: `<H3>{ADDRESS}</H3><br>{PHONE}`
        });

        let featureLayer = new FeatureLayer(featureCollection, {
            id: 'servicePointLayer',
            infoTemplate: popupTemplate,

        });
        featureLayer.minScale = 4000;
        featureLayer.renderer = this._servicePointRenderer;

        this._mapRef.on("layer-add-result", (results) => {
            if (results.layer.id == "servicePointLayer") {
                this._spLayer = ((results.layer) as FeatureLayer);
                //this._spLayer.renderer = this._servicePointRenderer;
                //this._spLayer.minScale = 4000;
                let features = [];
                let graphics = this._glSp.graphics;
                for (let i = 0; i < graphics.length; i++) {
                    //for (let i = 0; i < 2; i++) {
                    let item = graphics[i];
                    features.push(item);
                }

                featureLayer.applyEdits(features, null, null, (addsResult: any, deletsResult: any, updateResults: any) => {

                });
            }

        });
        featureLayer.on("click", (evt) => {

            let chkTrace = <HTMLInputElement>dom.byId("chkTraceUpstream");
            if (chkTrace.checked === false) {
                //this._mapRef.infoWindow.setFeatures([evt.graphic]);
            }
            else {
                //debugger;
                let graphicIDInTrace = evt.graphic.attributes["LINKID"];
                let graphicsToSymbolize: Graphic[] = [];
                let sls = new SimpleLineSymbol();
                sls.setWidth(10);
                sls.setStyle("STYLE_SHORTDASH");
                sls.setColor(new Color([255, 255, 0, 1]));
                while (graphicIDInTrace !== -1) {
                    //get the parent of thie current graphicID
                    //graphicIDInTrace = this._dictSpTopology.getValue(graphicIDInTrace);
                    //debugger;
                    let associatedGraphic: Graphic = this._dictSP[graphicIDInTrace];
                    //let assocGraphicCloned =  new Graphic(associatedGraphic);
                    let pl: Polyline = new Polyline(this._mapRef.spatialReference);
                    let x1 = (associatedGraphic.geometry as Polyline).paths[0][0][0];
                    let y1 = (associatedGraphic.geometry as Polyline).paths[0][0][1];
                    let x2 = (associatedGraphic.geometry as Polyline).paths[0][1][0];
                    let y2 = (associatedGraphic.geometry as Polyline).paths[0][1][1];

                    pl.addPath([[x1, y1], [x2, y2]]);
                    pl.spatialReference = this._mapRef.spatialReference;
                    //associatedGraphic.geometry;
                    let newGraphic: Graphic = new Graphic(pl, sls, associatedGraphic.attributes);
                    //newGraphic.attributes = associatedGraphic.attributes;//.toJson();
                    //newGraphic.geometry.spatialReference = this._mapRef.spatialReference;//.toJson();
                    //assocGraphicCloned.geometry.spatialReference = this._mapRef.spatialReference;
                    //assocGraphicCloned.symbol  =sls;
                    graphicsToSymbolize.push(newGraphic);
                    //debugger;
                    graphicIDInTrace = associatedGraphic.attributes["PARENT"];

                }

                this._traceResults.clear();

                let srs: SimpleRenderer = new SimpleRenderer(sls);

                this._traceResults.setRenderer(srs);

                this._traceResults.setVisibility(true);
                let resultsPolyline: Polyline = new Polyline(this._mapRef.spatialReference);
                let pointsMakingUpPath: Point[] = [];
                for (let i = 0; i < graphicsToSymbolize.length; i++) {
                    let g: Graphic = graphicsToSymbolize[i];
                    let path = (g.geometry as Polyline).paths[0];
                    let firstPoint: Point = new Point(path[0]);
                    let secondPoint: Point = new Point(path[1]);
                    firstPoint.setSpatialReference(this._mapRef.spatialReference);
                    secondPoint.setSpatialReference(this._mapRef.spatialReference);
                    pointsMakingUpPath.push(secondPoint);
                    pointsMakingUpPath.push(firstPoint);
                    
                }
                resultsPolyline.addPath(pointsMakingUpPath);
                let resultGraphic = new Graphic(resultsPolyline);
                this._traceResults.add(resultGraphic);
                this._mapRef.addLayer(this._traceResults);

                //debugger;
            }
        });


        this._mapRef.addLayer(featureLayer);
        //this._glSp.setVisibility(false);
        featureLayer.setVisibility(true);
        //associate the features with the popup on click

    }

    DoTraceUpstream(graphic: Graphic) {
        debugger;


    }

    getFeatureLayer(layerName: string): FeatureLayer {
        let retlyr: FeatureLayer = null;
        this._mapRef.graphicsLayerIds.forEach((layerID, index, array) => {
            let lyr = <FeatureLayer>this._mapRef.getLayer(layerID);
            if (lyr.id.toUpperCase() === layerName.toUpperCase()) {
                retlyr = lyr;
            }

        });
        return retlyr;
    }

    LabelInExtent2() {

    }
    //-116.476036,33.844951
    setupMapClickHandler() {
        return;
        this._mapRef.on("click", (e) => {


            let chkTrace = <HTMLInputElement>dom.byId("chkTraceUpstream");
            if (chkTrace.checked) {
                let pt = new Point(e.mapPoint.x, e.mapPoint.y, this._mapRef.spatialReference);
                let w = this._mapRef.extent.getWidth() / 50;
                let ext = new Extent(pt.x - w, pt.y - w, pt.x + w, pt.y + w, this._mapRef.spatialReference);

                let query = new Query();
                //query.outFields = ["*"];
                query.geometry = ext;
                //query.spatialRelationship = "SPATIAL_REL_INTERSECTS";
                query.returnGeometry = true;

                if (this._spLayer) {
                    if (this._spLayer.isVisibleAtScale(this._mapRef.getScale())) {
                        this._spLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, (featureSet: any) => {
                            if (featureSet.length > 0) {
                                let startID = featureSet[0].attributes["ID"];
                                debugger;
                            }

                        }, (err: any) => {
                            console.log("ERROR " + err.toString());
                            debugger;
                        });
                    }
                }
            }

        });

    }
    _dictSpTopology: Collections.Dictionary<number, number> = null;
    _dictSP: Object = null;
    MakeData() {
        try {//[-116.545520,33.802558],[-116.489442, 33.82484]
            const MAXLEVEL = 7;
            //this._dictSpTopology = new Collections.Dictionary<number,number>(); //Collections.Dictionary<number,number>();
            this._dictSP = new Object();
            this._gl06.clear();
            this._gl7.clear();
            this._gl8.clear();
            this._glSp.clear();
            let linesArray = [];
            let graphicArray = [];
            let startLineFromPoint = this.ProjectLatLongPoint(33.802558, -116.545520, this._mapRef);
            let endLineFromPoint = this.ProjectLatLongPoint(33.82484, -116.489442, this._mapRef);
            let startLine = new Polyline([[startLineFromPoint.x, startLineFromPoint.y], [endLineFromPoint.x, endLineFromPoint.y]]);
            startLine.spatialReference = this._mapRef.spatialReference;
            let line = new Line(0, -1, startLine, 0);


            let g = new Graphic(line.geom);
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

            let linesToVisit = [line];
            let lineMaxID = 0;
            while (linesToVisit.length > 0) {
                let currentLine = linesToVisit.pop();
                let x1 = currentLine.toPoint.x;
                let y1 = currentLine.toPoint.y;
                let newLevel = currentLine.level + 1;
                if (newLevel > MAXLEVEL) {
                    continue;
                }
                let newLength = 5000 / (Math.pow(2, newLevel));//LEVELS 0-6 LENGTHS ARE: 
                //add random number to the angle between 20 degrees and 70 degrees (.349 radians and 1.222 radians)
                let radiansToAdd = (Math.floor(Math.random() * (1222 - 349)) + 349) / 1000;
                for (let i = 0; i < 4; i++) {
                    let x2 = x1 + Math.cos((i * (Math.PI / 2)) + radiansToAdd) * newLength;
                    let y2 = y1 - Math.sin((i * (Math.PI / 2)) + radiansToAdd) * newLength;
                    let newPolyline = new Polyline([currentLine.toPointArray, [x2, y2]]);
                    newPolyline.spatialReference = this._mapRef.spatialReference;
                    lineMaxID++;
                    let newLine: Line = new Line(lineMaxID, currentLine.id, newPolyline, newLevel);
                    linesToVisit.push(newLine);
                    //linesArray.push(newLine);
                    //todo move these out
                    let usageObj: any = {
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

                    let usageString = JSON.stringify(usageObj);

                    for (let i = 1; i < 7; i++) {
                        usageString = usageString.replace(i.toString + "VALUE", (i * Math.random()).toString());
                    }
                    for (let i = 11; i > 6; i--) {
                        usageString = usageString.replace(i.toString + "VALUE", ((12 - i) * Math.random()).toString());
                    }
                    //let g = new Graphic(newPolyline);//TODO TROUBLE LINE
                    let g = new Graphic();

                    g.setGeometry(newPolyline);
                    if ((g.geometry as Polyline).paths[0][0][0] !== newPolyline.paths[0][0][0]) {
                        console.log("!! GEOMETRY REVERSAL??");
                        debugger;
                    }
                    if (newLevel === MAXLEVEL) {
                        let newSP = new Graphic(
                            new Point(x2, y2).setSpatialReference(this._mapRef.spatialReference), null, {
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
                            }
                        );
                        this._glSp.add(newSP);
                    }
                    g.attributes = {
                        ID: newLine.id,
                        LEVEL: newLevel,
                        PARENT: newLine.parent,
                        LINKID: newLine.id
                    };
                    graphicArray.push(g);
                    //this._dictSpTopology.setValue(newLine.id,newLine.parent);
                    this._dictSP[newLine.id] = g; //newLine.parent;

                    console.log(newLevel);
                }
            }
            //alert("Starting to add " + graphicArray.length + " feature graphics to map");
            let totalGraphics = graphicArray.length;
            for (let i = 0; i < totalGraphics; i++) {
                let graphic = graphicArray[i];
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
    }
    private uniqueValueRenderer_sp_JSON(): any {
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
    }
    private uniqueValueRendererJSON(): any {
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

    }
}
class Line implements iLine {
    constructor(public id: number, public parent: number, public geom: Polyline, public level: number) {

    }
    private _angleRadians: number = 0;
    private _angleDegrees: number = 0;
    public get angleDegrees(): number {
        if (this._angleDegrees === 0) {
            this.calculateAngles()
        }
        return this._angleDegrees;
    }

    public get angleRadians(): number {
        if (this._angleRadians === 0) {
            this.calculateAngles()
        }
        return this._angleRadians;
    }
    public get fromPoint(): Point {
        return new Point(this.geom.paths[0][0]);
    }
    public get toPoint(): Point {
        let latLongPoint = new Point(this.geom.paths[0][1]);

        return latLongPoint
    }
    public calculateAngles() {
        let currentLine = this;
        let logicalLine = currentLine.geom.paths[0];

        let firstPoint = this.fromPoint;
        let secondPoint = this.toPoint;

        let angleRadians = Math.atan2(secondPoint.y - firstPoint.y, secondPoint.x - firstPoint.x);
        this._angleDegrees = angleRadians * (360 / (2 * Math.PI));
        this._angleRadians = angleRadians;

    }
    public get toPointArray() {
        return [this.toPoint.x, this.toPoint.y]
    }

}
interface iLine {
    "id": number,
    "parent": number,
    "geom": Polyline,
    "level": number,
    "angleRadians": number,
    "angleDegrees": number,
    "fromPoint": Point,
    "toPoint": Point,
    "toPointArray": number[]
}

