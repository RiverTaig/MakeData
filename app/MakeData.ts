import * as Dialog from 'dijit/Dialog';
import ESRIMap = require("esri/map");
import * as dom from 'dojo/dom';
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

declare var require: any;

export class MakeData {

    private _privateVariable: string = null;
    private _mapRef: ESRIMap;
    private _glSp: GraphicsLayer;
    private _gl06: GraphicsLayer;
    /*private _gl1: GraphicsLayer;
    private _gl2: GraphicsLayer;
    private _gl3: GraphicsLayer;
    private _gl4: GraphicsLayer;
    private _gl5: GraphicsLayer;*/
    private _gl7: GraphicsLayer;
    private _gl8: GraphicsLayer;
    private randomFirstNames: string[] = [
        "Alan", "Barbara", "Chuck", "Elise", "Frank", "Georgia", "Hank", "Ingrid", "Jack", "Kathy", "Larry", "Mary", "Ned", "Oprah",
        "Paul", "Queen", "Ron", "Susan", "Thom", "Uma", "Vince", "Wanda", "Xavier", "Yoko", "Zufong"
    ];
    private randomCity: string[] = ["Austin", "Baltimore", "Chicago", "Denver", "Eugene", "Fargo", "Gainsville", "Houston", "Dallas","Toledo"];
    private randomState: string[] = ["Texas", "Utah", "Oregon", "Washington", "California", "Maine", "Mississippi", "Colorado", "Idaho","Ohio"];
    private randomLastNames: string[] = [
        "Alberts", "Billings", "Chadwick", "Earnheardt", "Fairchild", "Grossman", "Harris", "Irwin", "Johnson", "Keeting", "Lawrence", "Michaels", "Nelson", "Olsen",
        "Poundstone", "Quincy", "Rasmussen", "Sadler", "Tillerson", "Urich", "Vance", "Wilson", "Xu", "Youngblood", "Zaher"
    ];
    private randomStreets: string[] = [
        "Ash", "Berry", "Cherry", "Dogwood", "Elm", "Furley", "Gathorne", "Harleton", "Islington", "Jowett", "Kensington", "Lilestone", "Marlborough", "Newton", "Osbert",
        "Palmerston", "Queensland", "Raynor", "Sherwood", "Trinity", "Upwey", "Vacek", "Warwick", "Xenia", "Yardley", "Zealand"
    ];
    private _servicePointRenderer: any = {};
    constructor(mapRef: ESRIMap) {
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
        this._glSp.minScale = 4000;

        this.setupMapClickHandler();
        this.listenForExtentChange();
    }
    private _previousLevel = 15;
    listenForExtentChange() {
        this._mapRef.on("extent-change", (e) => {
            console.log("extent change");
            let thisLevel = this._mapRef.getLevel();
            if (this._previousLevel != thisLevel) {
                //this._mapRef.graphics.clear();
                this.LabelInExtent();
            }
            this._previousLevel = thisLevel;
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
                      "color": [210,105,30,191],
                      "size": 6,
                      "angle": 0,
                      "xoffset": 0,
                      "yoffset": 0,
                      "type": "esriSMS",
                      "style": "esriSMSCircle",
                      "outline": {
                        "color": [0,0,128,255],
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

        let featureLayer = new FeatureLayer(featureCollection, {
            id: 'servicePointLayer',
            infoTemplate: popupTemplate
        });

        this._mapRef.on("layer-add-result", (results)=> {
            debugger;
            ((results.layer) as FeatureLayer).renderer = this._servicePointRenderer
            let features = [];
            let graphics = this._glSp.graphics;
            for(let i = 0 ; i < graphics.length; i++){
            //for (let i = 0; i < 2; i++) {
                let item = graphics[i];
                features.push(item);
            }
            featureLayer.applyEdits(features, null, null, (addsResult : any,deletsResult : any,updateResults : any)=>{
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

    }



    getFeatureLayer(layerName : string) : FeatureLayer{
        let retlyr : FeatureLayer = null;
        this._mapRef.graphicsLayerIds.forEach( (layerID , index, array) =>{
            let lyr = <FeatureLayer> this._mapRef.getLayer(layerID);
            if (lyr.id === layerName){
                retlyr = lyr;
            }

        });
        return retlyr;
    }

    LabelInExtent2() {
        const DISTANCE_AT_LEVEL_15 = 100;

        let font = new Font("20px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
        let textSymbol1 = new TextSymbol("Line 1", font, new Color([0, 0, 0]));
        let textSymbol2 = new TextSymbol("Line 2", font, new Color([255, 0, 0]));
        let x = (this._mapRef.extent.xmax + this._mapRef.extent.xmin) / 2;
        let y = (this._mapRef.extent.ymax + this._mapRef.extent.ymin) / 2;
        let xy: Point = <Point>new Point(x, y).setSpatialReference(this._mapRef.spatialReference);
        let level = this._mapRef.getLevel();
        let deltaFromBaseLevel = 15 - level;
        let multiplier = Math.pow(2, deltaFromBaseLevel);
        let amountToAdd = multiplier * DISTANCE_AT_LEVEL_15;
        let xy2 = new Point(xy.x, xy.y + amountToAdd);
        xy2.spatialReference = this._mapRef.spatialReference;

        let labelPointGraphic1 = new Graphic(xy, textSymbol1);
        let labelPointGraphic2 = new Graphic(xy2, textSymbol2);
        this._mapRef.graphics.add(labelPointGraphic1);
        this._mapRef.graphics.add(labelPointGraphic2);


    }
    //-116.476036,33.844951
    setupMapClickHandler() {
        this._mapRef.on("click", (e) => {
            let lyr = this.getFeatureLayer("servicePointLayer");
            let test =  lyr.graphics;
            let test2 = test.length;
            let test3 = test[0].geometry;
            let test4 = test[1].attributes;
            let test5 = test[1].attributes["CITY"];
            let test6 = test[1].attributes["ID"];
            let test7 = test[1].attributes["USAGE"];
            console.log( e.mapPoint.x + "," + e.mapPoint.y +   "   |    " +  (test3 as Point).x + "," +  (test3 as Point).y) ;
            //debugger;
            let scale = (this._mapRef.getScale());
            let y = this._mapRef.position.y;
            let vis = this._glSp.isVisibleAtScale(scale);
            let attributes = this._glSp.graphics[123].attributes;
            let geom = this._glSp.graphics[123].geometry;
            //debugger;
        });
      
    }

    MakeData() {
        try {//[-116.545520,33.802558],[-116.489442, 33.82484]
            const MAXLEVEL = 6;
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
                PARENT: line.parent
            };
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
                    let usageObj : any =  { 
                            "records" : [
                            [ {"Month" : "JAN"},{"Value" : "0VALUE"}],
                            [ {"Month" : "FEB"},{"Value" : "1VALUE"}],   
                            [ {"Month" : "MAR"},{"Value" : "2VALUE"}],
                            [ {"Month" : "APR"},{"Value" : "3VALUE"}],   
                            [ {"Month" : "MAY"},{"Value" : "4VALUE"}],
                            [ {"Month" : "JUN"},{"Value" : "5VALUE"}],   
                            [ {"Month" : "JUL"},{"Value" : "6VALUE"}],
                            [ {"Month" : "AUG"},{"Value" : "7VALUE"}],   
                            [ {"Month" : "SEP"},{"Value" : "8VALUE"}],
                            [ {"Month" : "OCT"},{"Value" : "9VALUE"}],   
                            [ {"Month" : "NOV"},{"Value" : "10VALUE"}],
                            [ {"Month" : "DEC"},{"Value" : "11VALUE"}],                                                                                                                                                                        
                        ] } ;
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
                    let usageString = JSON.stringify(usageObj);

                    for (let i = 1; i < 7; i++) {
                        usageString = usageString.replace(i.toString + "VALUE", (i * Math.random()).toString());
                    }
                    for (let i = 11; i > 6; i--) {
                        usageString = usageString.replace(i.toString + "VALUE", ((12 - i) * Math.random()).toString());
                    }
                    let g = new Graphic(newPolyline);
                    if (newLevel === MAXLEVEL) {
                        let newSP = new Graphic(
                            new Point(x2, y2).setSpatialReference(this._mapRef.spatialReference), null, {
                                ID: newLine.id,
                                LEVEL: Math.floor(Math.random() * 6),
                                FIRSTNAME: this.randomFirstNames[Math.floor(Math.random() * 26)],
                                LASTNAME: this.randomLastNames[Math.floor(Math.random() * 26)],
                                ADDRESS: Math.round((Math.random() * 1000)).toString() + " " + this.randomStreets[Math.floor(Math.random() * 26)],
                                CITY: this.randomCity[Math.floor(Math.random() * 11)],
                                STATE: this.randomState[Math.floor(Math.random() * 11)],
                                USAGE: usageString
                            }
                        );
                        this._glSp.add(newSP);
                    }
                    g.attributes = {
                        ID: newLine.id,
                        LEVEL: newLevel,
                        PARENT: newLine.parent
                    };
                    graphicArray.push(g);
                    //this._gl.add(g);
                    //console.log(lineMaxID + "  " + newLevel);

                    console.log(newLevel);
                    //debugger;
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
            //alert("done: " + this._gl8.graphics.length + " in last layer. TOTAL = " + graphicArray.length);

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

