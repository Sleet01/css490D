/* File: RigidCircle.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, GameObject, RigidShape, gEngine */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function RigidCircle( object = null, color = [0, 0, 0, 1] ){
    RigidShape.call(this, object);
    this.mRRadius = 0;
    this.mColor = color;
    this.mRCircle = null;
}
gEngine.Core.inheritPrototype(RigidCircle, RigidShape);

RigidCircle.prototype.register = function (gObject){
    RigidShape.prototype.register.call(this, gObject);
    this.mRRadius = this.mBRadius;
    this.mRCircle = new CircleRenderable(this.mCenter, this.mRRadius, this.mColor);
    this.mRCircle.setAngle(this.mBCircle.getAngle());
};

RigidCircle.prototype.resetRRadius = function () { this.register(this.mObject); };
RigidCircle.prototype.setRRadius = function (radius) { 
    this.mRRadius = radius; 
    this.mRCircle.setRadius(radius);
};

RigidCircle.prototype.incRRadius = function (deltaR) { 
    this.mRRadius += deltaR; 
    this.mRCircle.incRadiusBy(deltaR);
};

RigidCircle.prototype.getRRadius = function () { return this.mRRadius; };

RigidCircle.prototype.update = function () {
    // simple default behavior
    RigidShape.prototype.update.call(this);

    this.mRCircle.incAngleBy(this.mW);
};

RigidCircle.prototype.draw = function ( aCamera ) {
    
    if(this.mVisible){
        this.mBCircle.draw( aCamera );
        this.mRCircle.draw( aCamera );
    }
};
