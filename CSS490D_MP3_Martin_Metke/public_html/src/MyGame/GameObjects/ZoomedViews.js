/* File: ZoomedViews.js 
 *
 * Inherits from ZoomedViews
 * An object that takes a set of inputs and moves around.
 */

/*jslint node: true, vars: true */
/*global gEngine: false, InteractiveObject: false*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function ZoomedViews(renderableObj, ibObject, mvObject, paneArea) {
    InteractiveObject.call(this, renderableObj);
    this.mInteractiveBound = ibObject;
    this.mMainView = mvObject;
    this.mPaneArea = paneArea;
    this.mCameras = [];
    
    this.mInteractiveBound.registerZViews(this);
    this._initialize();
}
gEngine.Core.inheritPrototype(ZoomedViews, InteractiveObject);

ZoomedViews.prototype._initialize = function(){
    // mPaneArea describes an area in which we can draw our four cameras
    // height of each camera is mPaneArea height / 3; width is
    // mPaneArea width / 2.  
    var pWidth = this.mPaneArea[2] - this.mPaneArea[0]; //canvas space width (px)
    var pHeight = this.mPaneArea[3] - this.mPaneArea[1];//canvas space height (px)
    var pCenter = [this.mPaneArea[0] + (pWidth / 2),
                   this.mPaneArea[1] + (pHeight / 2)];
    var cWidth = pWidth / 2;
    var cHeight = pHeight / 3;
    var viewportArrays = [[ this.mPaneArea[0]+(cWidth), this.mPaneArea[1] + cHeight, cWidth, cHeight],
                          [ this.mPaneArea[0]+(cWidth/2), this.mPaneArea[1] + (2 * cHeight), cWidth, cHeight],
                          [ this.mPaneArea[0], this.mPaneArea[1] + cHeight, cWidth, cHeight],
                          [ this.mPaneArea[0] + (cWidth/2), this.mPaneArea[1], cWidth, cHeight]
                         ];
//    var viewportArrays = [[pCenter[0], pCenter[1]-(cHeight/2), cWidth, cHeight],
//                          [pCenter[0] - (cWidth/2), pCenter[1] + cHeight, cWidth, cHeight],
//                          [pCenter[0] - cWidth, pCenter[1]-(cHeight/2), cWidth, cHeight],
//                          [pCenter[0] - (cWidth/2), pCenter[1] -(cHeight * 1.5), cWidth, cHeight]];
    var ibPoints = this.mInteractiveBound.getMarkerPositions();
        
    for (var i = 0; i < 4; i++){
        
        // Create a camera at the InteractiveBound side marker [i],
        // with width = 1/2 of the IB width, at the pre-determined screen position.
        this.mCameras[i] = new Camera([ ibPoints[i][0], ibPoints[i][1] ],
                                       this.mInteractiveBound.getWidth() * 0.5,
                                       viewportArrays[i]);
        this.mMainView.registerCamera(this.mCameras[i]);
    }
};

ZoomedViews.prototype.update = function () {
    var ibPoints = this.mInteractiveBound.getMarkerPositions();
    for (var i = 0; i < 4; i++){
        this.mCameras[i].setWCXPos(ibPoints[i][0]);
        this.mCameras[i].setWCYPos(ibPoints[i][1]);
        this.mCameras[i].setWCWidth(this.mInteractiveBound.getWidth() * 0.5);
    }
};

// Don't actually draw anything, but 
ZoomedViews.prototype.draw = function (aCameraVPM) {
    return;
};