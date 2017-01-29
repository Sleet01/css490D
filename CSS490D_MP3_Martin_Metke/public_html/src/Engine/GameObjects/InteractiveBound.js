/* File: InteractiveBound.js 
 *
 * Inherits from InteractiveObject
 * This is a specific InteractiveObject which displays a bounding box
 * and can move around.  It also reports its computed sprite animation info
 * based on its size, and will return (U,V) or (pixelx, pixely) coordinates.
 */

/*jslint node: true, vars: true */
/*global gEngine: false, InteractiveObject: false*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function InteractiveBound(renderableObj) {
    InteractiveObject.call(this, renderableObj);
    this.mWidth = 0;
    this.mHeight = 0;
    
    // This object gets 4 clones, offset to the right by this.width.
    this.mClones = [];
}
gEngine.Core.inheritPrototype(InteractiveBound, InteractiveObject);

InteractiveBound.prototype.getXform = function () { return this.mRenderComponent.getXform(); };

InteractiveBound.prototype.update = function () {
    
};

InteractiveBound.prototype.getRenderable = function () { return this.mRenderComponent; };

InteractiveBound.prototype.draw = function (aCameraVPM) {
    this.mRenderComponent.draw(aCameraVPM);
};