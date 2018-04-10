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

  // let myCustomDojoDiv: HTMLDivElement = <HTMLDivElement>dom.byId("myCustomDojoDiv");
  // myCustomDojoDiv.innerText = "s Hello World! this was changed by dojo in Typescript.";

  let myCustomJQueryDiv: HTMLDivElement = <HTMLDivElement>dom.byId("myCustomJqueryDiv");
  on(dom.byId("makeData_btnMakeData"), "click", () => {
    let makeData : MakeData = new MakeData(myMap);
    makeData.MakeData();
  });




});

