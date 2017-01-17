/*
 * File: SceneFile_Parse.js 
 */
/*jslint node: true, vars: true */
/*global gEngine: false, console: false, Camera: false, vec2: false, Renderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function jsonSceneFileParser(sceneFilePath) {
    this.mSceneJson = gEngine.ResourceMap.retrieveAsset(sceneFilePath);
}

jsonSceneFileParser.prototype._getElm = function (tagElm) {
    var theElm = this.mSceneJson[tagElm];
    if (theElm.length === 0) {
        console.error("Warning: Level element:[" + tagElm + "]: is not found!");
    }
    return theElm;
};

jsonSceneFileParser.prototype.parseCamera = function () {
    // Debugging
    console.log("Attempting to open Camera!  Camera is: " + this._getElm("Camera"));
//    var camElm = this._getElm("Camera");
//    var cx = Number(camElm[0]["CenterX"]);
//    var cy = Number(camElm[0]["CenterY"]);
//    var w = Number(camElm[0]["Width"]);
//    var viewport = camElm[0]["Viewport"].split(" ");
//    var bgColor = camElm[0]["BgColor"].split(" ");
    var camElm = this._getElm("Camera");
    var cx = Number(camElm["Center"][0]);
    var cy = Number(camElm["Center"][1]);
    var w = Number(camElm["Width"]);
    var viewport = camElm["Viewport"].map(Number);
    var bgColor = camElm["BgColor"].map(Number);
    // make sure viewport and color are number
    
    

    var cam = new Camera(
        vec2.fromValues(cx, cy),  // position of the camera
        w,                        // width of camera
        viewport                  // viewport (orgX, orgY, width, height)
        );
    cam.setBackgroundColor(bgColor);
    return cam;
};

jsonSceneFileParser.prototype.parseSquares = function (sqSet) {
    var elm = this._getElm("Square");
    var i, j, x, y, w, h, r, c, sq;
    for (i = 0; i < elm.length; i++) {
        x = Number(elm[i]["Pos"][0]);
        y = Number(elm[i]["Pos"][1]);
        w = Number(elm[i]["Width"]);
        h = Number(elm[i]["Height"]);
        r = Number(elm[i]["Rotation"]);
        c = elm[i]["Color"];
        sq = new Renderable(gEngine.DefaultResources.getConstColorShader());
        // make sure color array contains numbers
        // To-do: c validation
        sq.setColor(c);
        sq.getXform().setPosition(x, y);
        sq.getXform().setRotationInDegree(r); // In Degree
        sq.getXform().setSize(w, h);
        sqSet.push(sq);
    }
};
