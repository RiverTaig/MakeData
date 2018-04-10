import * as Dialog from 'dijit/Dialog';
import ESRIMap = require("esri/map");
import * as dom from 'dojo/dom';
import  GraphicsLayer = require("esri/layers/GraphicsLayer");
import Polyline = require("esri/geometry/Polyline");
import Point = require("esri/geometry/Point");
import Graphic = require("esri/graphic");
import SpatialReference = require("esri/SpatialReference");
import SimpleFillSymbol = require("esri/symbols/SimpleLineSymbol");
import Color = require ("esri/Color");
import SimpleRenderer = require ("esri/renderers/SimpleRenderer");

declare var require: any;

export class MakeData {

    private _privateVariable: string = null;
    private _mapRef : ESRIMap;
    private _gl : GraphicsLayer;
    constructor(mapRef : ESRIMap) {
        //debugger;
        console.log("constructor");
        this._mapRef = mapRef;
        this._gl = new GraphicsLayer({ id: "ElectricLines" });
        let symbol = new SimpleFillSymbol();//.setColor(null).outline.setColor("blue");
        symbol.setColor(new Color([255,0,255,0.75]));
        symbol.width = 5;
        let simpleRenderer = new SimpleRenderer(symbol);
        this._gl.renderer = simpleRenderer;
        this._mapRef.addLayer(this.gl);
        this.setupMapClickHandler();
    }
    
    //-116.476036,33.844951
    setupMapClickHandler(){
        this._mapRef.on("click", ()=>{
            alert("click");
        });
    }

    MakeData(){
        try{//[-116.545520,33.802558],[-116.489442, 33.82484]

            const MAXLEVEL = 2;
            let linesArray = [];
            let line = new Line(0,-1,new Polyline([[-116.545520,33.802558],[-116.489442, 33.82484]]),0);
            linesArray.push(line);

            let linesToVisit = [line];
            while(linesToVisit.length > 0){
                let currentLine = linesToVisit.pop();
                let newLevel = currentLine.level + 1;
                if(newLevel > MAXLEVEL){
                    continue;
                }
                let newLength = .06 / (Math.pow(2,newLevel)) //LEVELS 0-6 LENGTHS ARE: .06,.03,.15,.0075,.00375, .001875, .000938  

                //add random number to the angle between 20 degrees and 70 degrees (.349 radians and 1.222 radians)
                let radiansToAdd = (Math.floor(Math.random() * (1222-349)) + 349) / 1000;
                console.log(radiansToAdd);
            }
            let g = new Graphic(line.geom);
            this._gl.add(g);
        }
        catch(ex){
            console.log("ERROR " + ex.toString());
        }
    }


}
class Line implements iLine{
    constructor(public id : number, public parent : number,public geom : Polyline,public level : number){

    }
    private _angleRadians : number = 0;
    private _angleDegrees : number = 0;
    public get angleDegrees() : number{
        if(this._angleDegrees === 0){
            this.calculateAngles()
        }
        return this._angleDegrees;
    }
    public get angleRadians() : number{
        if(this._angleRadians === 0){
            this.calculateAngles()
        }
        return this._angleRadians;
    }
    public get fromPoint    () : Point{
        return new Point(this.geom.paths[0][0]);
    }
    public get toPoint    () : Point{
        return new Point(this.geom.paths[0][1]);
    }    
    public  calculateAngles() {
        let currentLine = this;
        let logicalLine = currentLine.geom.paths[0];

        let firstPoint = this.fromPoint;
        let secondPoint = this.toPoint;
      
        let angleRadians = Math.atan2(secondPoint.y - firstPoint.y, secondPoint.x - firstPoint.x);
        this._angleDegrees = angleRadians * (360 / (2 * Math.PI));
        this._angleRadians = angleRadians;

    }
}
interface iLine{
    "id" : number,
    "parent" : number,
    "geom" : Polyline,
    "level" : number,
    "angleRadians" : number,
    "angleDegrees" : number,
    "fromPoint" : Point,
    "toPoint" : Point
}