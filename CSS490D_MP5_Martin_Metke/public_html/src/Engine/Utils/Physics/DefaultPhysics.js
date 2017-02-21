/* File: DefaultPhysics.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function DefaultPhysics( object = null ){
    this.mCurrentFrontDir = vec2.fromValues(0, 1);  // this is the current front direction of the object
    this.mVisible = true;
    this.mSpeed = 0.2;
    this.mBRadius = 0;
    this.mObject = null;
    this.mCenter = null;
    this.mBCircle = null;
    if (object !== null) { this.register(object); };
    
};

DefaultPhysics.prototype.register = function (gObject){
    this.mObject = gObject;
    var Xform = gObject.getXform();
    this.mCenter = Xform.getPosition();
    this.mBRadius = Math.sqrt(Math.pow(Xform.getWidth(), 2) + Math.pow(Xform.getHeight(), 2))/2.0;
    this.mBCircle = new CircleRenderable(this.mCenter, this.mBRadius);
};

DefaultPhysics.prototype.resetBRadius = function () { this.register(this.mObject); };
DefaultPhysics.prototype.setBRadius = function (radius) { this.mBRadius = radius; };
DefaultPhysics.prototype.incBRadius = function (deltaR) { this.mBRadius += deltaR; };
DefaultPhysics.prototype.getBRadius = function () { return this.mBRadius; };

DefaultPhysics.prototype.setSpeed = function (s) { this.mSpeed = s; };
DefaultPhysics.prototype.getSpeed = function () { return this.mSpeed; };
DefaultPhysics.prototype.incSpeedBy = function (delta) { this.mSpeed += delta; };
DefaultPhysics.prototype.setCurrentFrontDir = function (f) { vec2.normalize(this.mCurrentFrontDir, f); };
DefaultPhysics.prototype.getCurrentFrontDir = function () { return this.mCurrentFrontDir; };

// Orientate the entire object to point towards point p
// will rotate Xform() accordingly
DefaultPhysics.prototype.rotateObjPointTo = function (p, rate) {
    // Step A: determine if reach the destination position p
    var dir = [];
    vec2.sub(dir, p, this.mObject.getXform().getPosition());
    var len = vec2.length(dir);
    if (len < Number.MIN_VALUE) {
        return; // we are there.
    }
    vec2.scale(dir, dir, 1 / len);

    // Step B: compute the angle to rotate
    var fdir = this.getCurrentFrontDir();
    var cosTheta = vec2.dot(dir, fdir);

    if (cosTheta > 0.999999) { // almost exactly the same direction
        return;
    }

    // Step C: clamp the cosTheda to -1 to 1 
    // in a perfect world, this would never happen! BUT ...
    if (cosTheta > 1) {
        cosTheta = 1;
    } else {
        if (cosTheta < -1) {
            cosTheta = -1;
        }
    }

    // Step D: compute whether to rotate clockwise, or counterclockwise
    var dir3d = vec3.fromValues(dir[0], dir[1], 0);
    var f3d = vec3.fromValues(fdir[0], fdir[1], 0);
    var r3d = [];
    vec3.cross(r3d, f3d, dir3d);

    var rad = Math.acos(cosTheta);  // radian to roate
    if (r3d[2] < 0) {
        rad = -rad;
    }

    // Step E: rotate the facing direction with the angle and rate
    rad *= rate;  // actual angle need to rotate from Obj's front
    vec2.rotate(this.getCurrentFrontDir(), this.getCurrentFrontDir(), rad);
    this.mObject.getXform().incRotationByRad(rad);
};

DefaultPhysics.prototype.setVisibility = function (f) {
    this.mVisible = f;
};

DefaultPhysics.prototype.getVisibility = function () {
    return this.mVisible;
};

DefaultPhysics.prototype.update = function () {
    // simple default behavior
    var pos = this.mObject.getXform().getPosition();
    vec2.scaleAndAdd(pos, pos, this.getCurrentFrontDir(), this.getSpeed());
    this.mBCircle.setCenter(pos);
};

DefaultPhysics.prototype.draw = function ( aCamera ) {
    
    if(this.mVisible){
        this.mBCircle.draw( aCamera );
    }
};
