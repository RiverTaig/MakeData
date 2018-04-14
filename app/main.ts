import ESRIMap = require("esri/map");
import * as request from 'dojo/request';
import * as domReady from 'dojo/domReady';
import * as dom from 'dojo/dom';
import * as on from 'dojo/on';
import {MakeData} from "./MakeData";



domReady(() => {

  console.log("The dom is ready.")
  //-116.476036,33.844951
  let myMap: ESRIMap = new ESRIMap("map", {
    basemap: "streets",
    center: [-116.489442, 33.82484],
    slider: false,
    zoom: 15
  });

  // let myCustomDojoDiv:  HTMLDivElement = <HTMLDivElement>dom.byId("myCustomDojoDiv");
  // myCustomDojoDiv.innerText = "s Hello World! this was changed by dojo in Typescript.";
  let _makeData = null;
  let myCustomJQueryDiv: HTMLDivElement = <HTMLDivElement>dom.byId("myCustomJqueryDiv");
  let makeData : MakeData = new MakeData(myMap);

  on(dom.byId("makeData_btnInfo"), "click", () => {
//    let makeData : MakeData = new MakeData(myMap);
    debugger;
    //this._makeData = makeData;
  });
  on(dom.byId("makeData_btnMakeData"), "click", () => {
    //    let makeData : MakeData = new MakeData(myMap);
        makeData.MakeData();
        makeData.MakeSPGraphicsIntoFeatureLayer();
        //this._makeData = makeData;
      });  
  // on(dom.byId("makeData_btnLabel"), "click", () => {
  //   //    let makeData : MakeData = new MakeData(myMap);
  //       makeData.LabelInExtent();
  //       //this._makeData = makeData;
  //     });

  // on(dom.byId("makeData_btnSerialize"), "click", () => {
  //   let ly = myMap.getLayer("ElectricLines_06");
  //   let cache : any[] = [];
  //   let myJson = JSON.stringify(ly, function(key, value) {
  //       if (typeof value === 'object' && value !== null) {
  //           if (cache.indexOf(value) !== -1) {
  //               // Circular reference found, discard key
  //               return;
  //           }
  //           // Store value in our collection
  //           cache.push(value);
  //       }
  //       return value;
  //   });
  //   cache = null; 
  //   console.log(myJson);
  // });



});

