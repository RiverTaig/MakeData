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
        // let myCustomDojoDiv: HTMLDivElement = <HTMLDivElement>dom.byId("myCustomDojoDiv");
        // myCustomDojoDiv.innerText = "s Hello World! this was changed by dojo in Typescript.";
        var myCustomJQueryDiv = dom.byId("myCustomJqueryDiv");
        on(dom.byId("makeData_btnMakeData"), "click", function () {
            var makeData = new MakeData_1.MakeData(myMap);
            makeData.MakeData();
        });
    });
});
//# sourceMappingURL=main.js.map