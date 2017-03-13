/* File: WASD_Obj.js
 *
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function WASDObj() {
}
gEngine.Core.inheritPrototype(WASDObj, GameObject);

WASDObj.prototype.keyControl = function () {
    var xform = this.getXform();
    var rb = this.getRigidBody();
    var hrb = (rb !== null);
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.W)) {
        ((hrb) ? rb.move([0, this.kDelta]) : xform.incYPosBy(this.kDelta));
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.S)) {
        ((hrb) ? rb.move([0, -this.kDelta]) : xform.incYPosBy(-this.kDelta));
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.A)) {
        ((hrb) ? rb.move([-this.kDelta, 0]) : xform.incXPosBy(-this.kDelta));
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) {
        ((hrb) ? rb.move([this.kDelta, 0]) : xform.incXPosBy(this.kDelta));
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Z)) {
       ((hrb) ? rb.rotate(1*Math.PI/180.0) : xform.incRotationByDegree(1));
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.X)) {
       ((hrb) ? rb.rotate(-1*Math.PI/180.0) : xform.incRotationByDegree(-1));
    }
};