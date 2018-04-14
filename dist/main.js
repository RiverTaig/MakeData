define(["require", "exports", "esri/map", "dojo/domReady", "dojo/dom", "dojo/on", "./MakeData"], function (require, exports, ESRIMap, domReady, dom, on, MakeData_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    domReady(function () {
        console.log("The dom is ready.");
        //-116.476036,33.844951
        var myMap = new ESRIMap("map", {
            basemap: "streets",
            center: [-116.489442, 33.82484],
            slider: false,
            zoom: 15
        });
        // let myCustomDojoDiv:  HTMLDivElement = <HTMLDivElement>dom.byId("myCustomDojoDiv");
        // myCustomDojoDiv.innerText = "s Hello World! this was changed by dojo in Typescript.";
        var _makeData = null;
        var myCustomJQueryDiv = dom.byId("myCustomJqueryDiv");
        var makeData = new MakeData_1.MakeData(myMap);
        on(dom.byId("makeData_btnInfo"), "click", function () {
            //    let makeData : MakeData = new MakeData(myMap);
            debugger;
            //this._makeData = makeData;
        });
        on(dom.byId("makeData_btnMakeData"), "click", function () {
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
});
//# sourceMappingURL=main.js.map