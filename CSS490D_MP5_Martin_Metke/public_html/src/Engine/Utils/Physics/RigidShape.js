/* File: RigidShape.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function RigidShape( object = null ){
    this.mCurrentFrontDir = vec2.fromValues(-1, 0);  // this is the current front direction of the object
    this.mOngoingCollisions = new Hashtable();  // Store collisions
    this.kCollisionLimit = 30; // Number of updates to store a collision state
    this.mVisible = true;
    this.mSpeed = 0.0;
    this.mW = 0.0;
    this.mBRadius = 0;
    this.mObject = null;
    this.mCenter = null;
    this.mBCircle = null;
    if (object !== null) { this.register(object); };
    
};

RigidShape.prototype.register = function (gObject){
    this.mObject = gObject;
    var Xform = gObject.getXform();
    this.mCenter = Xform.getPosition();
    this.mBRadius = Math.sqrt(Math.pow(Xform.getWidth(), 2) + Math.pow(Xform.getHeight(), 2))/2.0;
    this.mBCircle = new CircleRenderable(this.mCenter, this.mBRadius);
    this.mBCircle.setAngle( Xform.getRotationInRad() );
};

RigidShape.prototype.resetBRadius = function () { this.register(this.mObject); };
RigidShape.prototype.setBRadius = function (radius) { 
    this.mBRadius = radius; 
    this.mBCircle.setRadius(radius); 
};

RigidShape.prototype.incBRadiusBy = function (deltaR) { 
    this.mBRadius += deltaR; 
    this.mBCircle.incRadiusBy(deltaR);
};

RigidShape.prototype.getCenter = function () {return this.mObject.getXform().getPosition();};
RigidShape.prototype.getBRadius = function () { return this.mBRadius; };

RigidShape.prototype.setSpeed = function (s) { this.mSpeed = s; };
RigidShape.prototype.getSpeed = function () { return this.mSpeed; };
RigidShape.prototype.incSpeedBy = function (delta) { this.mSpeed += delta; };
RigidShape.prototype.setCurrentFrontDir = function (f) { vec2.normalize(this.mCurrentFrontDir, f); };
RigidShape.prototype.getCurrentFrontDir = function () { return this.mCurrentFrontDir; };

// Manipulate rotation rate in degrees
RigidShape.prototype.setRotationRate = function (rad) { this.mW = rad; };
RigidShape.prototype.getRotationRate = function () { return this.mW; };
RigidShape.prototype.incRotationRateBy = function (rad) { this.mW += rad; };

// Perform reflection vs another object
RigidShape.prototype.reflect = function (object) {
    // See if the object is in our Ongoing Collisions hash
    var alreadyReflecting = this.mOngoingCollisions.get(object);
    // If not, add it and reverse our current direction
    if (alreadyReflecting === undefined){
        this.mCurrentFrontDir = vec2.fromValues(-1 * this.mCurrentFrontDir[0], -1 * this.mCurrentFrontDir[1]);
        // Since we could get Reflect called via keyboard, only add defined objects
        if(object !== undefined){
            this.mOngoingCollisions.put(object, this.kCollisionLimit);
        }
    }
    else{
        console.log("We should get here eventually...");
    }
    
};

// Utility functions for reflecting along one axis only.  Does not register a collision object
RigidShape.prototype.reflectX = function () { this.mCurrentFrontDir = vec2.fromValues(-1 * this.mCurrentFrontDir[0], this.mCurrentFrontDir[1]); };
RigidShape.prototype.reflectY = function () { this.mCurrentFrontDir = vec2.fromValues(this.mCurrentFrontDir[0], -1 * this.mCurrentFrontDir[1]); };

// Orientate the entire object to point towards point p
// will rotate Xform() accordingly
RigidShape.prototype.rotateObjPointTo = function (p, rate) {
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

RigidShape.prototype.setVisibility = function (f) {
    this.mVisible = f;
};

RigidShape.prototype.getVisibility = function () {
    return this.mVisible;
};

RigidShape.prototype.update = function () {
    // simple default behavior
    var pos = this.mObject.getXform().getPosition();
    this.mObject.getXform().incRotationByRad(this.mW);
    this.mBCircle.incAngleBy(this.mW);
    vec2.rotate(this.mCurrentFrontDir, this.mCurrentFrontDir, this.mW);
    vec2.scaleAndAdd(pos, pos, this.getCurrentFrontDir(), this.getSpeed());
    
    // Clean up Ongoing Reflection list
    var i, count;
    var reflections = this.mOngoingCollisions.getKeys();
    for (i = 0; i < reflections.length; i++){
        count = this.mOngoingCollisions.get(reflections[i]);
        if (count === 0){
            this.mOngoingCollisions.remove(reflections[i]);
        }
        else{
            this.mOngoingCollisions.put(reflections[i], count - 1);
        }
    }
    
};

RigidShape.prototype.boundTest = function ( oObject ) {
    
    var displacement = vec2.fromValues(0,0);
    vec2.sub(displacement, this.getCenter(), oObject.getCenter());
    var distance = vec2.length(displacement);
    
    if (distance <= this.getBRadius() + oObject.getBRadius()){
        return true;
    }
    else{
        return false;
    }
};

RigidShape.prototype.draw = function ( aCamera ) {
    
    if(this.mVisible){
        this.mBCircle.draw( aCamera );
    }
};
