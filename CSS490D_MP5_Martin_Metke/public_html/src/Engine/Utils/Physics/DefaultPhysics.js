/* File: GameObject.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function DefaultPhysics(){
    this.mCurrentFrontDir = vec2.fromValues(1, 0);  // this is the current front direction of the object
    this.mSpeed = 0;
    this.mObject = null;
    this.mCenter = null;
};

DefaultPhysics.prototype.register = function (gObject){
    this.mObject = gObject;
    this.mCenter = gObject.getXform.getPosition();
};

DefaultPhysics.prototype.setSpeed = function (s) {  this.mSpeed = s; };
DefaultPhysics.prototype.getSpeed = function () { return this.mSpeed; };
DefaultPhysics.prototype.incSpeedBy = function (delta) { this.mSpeed += delta; };
DefaultPhysics.prototype.setCurrentFrontDir = function (f) { vec2.normalize(this.mCurrentFrontDir, f); };
DefaultPhysics.getCurrentFrontDir = function () { return this.mCurrentFrontDir; };

DefaultPhysics.prototype.update = function () {
    // simple default behavior
    var pos = this.gObject.getXform().getPosition();
    vec2.scaleAndAdd(pos, pos, this.getCurrentFrontDir(), this.getSpeed());
};