define(["require", "exports", "dijit/Dialog"], function (require, exports, Dialog) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MyClass = /** @class */ (function () {
        function MyClass(mapRef) {
            this._privateVariable = null;
            this._fooBar = false;
            //debugger;
            console.log("constructor");
            this._mapRef = mapRef;
            this.setupMapClickHandler();
        }
        MyClass.prototype.setupMapClickHandler = function () {
            this._mapRef.on("click", function () {
                alert("click");
            });
        };
        Object.defineProperty(MyClass.prototype, "fooBar", {
            get: function () {
                return this._fooBar;
            },
            set: function (newFooBarValue) {
                this._fooBar = newFooBarValue;
            },
            enumerable: true,
            configurable: true
        });
        MyClass.prototype.myMethod = function (name) {
            return "Hello " + name + " - the value of fooBar is " + this.fooBar;
        };
        MyClass.ValueOfPi = function () {
            return 3.14159;
        };
        MyClass.prototype.makeDialogAppear = function () {
            var dialog = new Dialog({
                title: "Hello Dialog",
                content: "This is my content",
                style: "width: 300px"
            });
            dialog.show();
        };
        MyClass.prototype.myJQMethod = function () {
            //load on demand
            require(['dojo/dom'], function (dom) {
                dom.byId("myCustomDojoDiv2").innerText = "Changed in a class: pi = " + MyClass.ValueOfPi();
            });
        };
        return MyClass;
    }());
    exports.MyClass = MyClass;
});
//# sourceMappingURL=MyClass.js.map