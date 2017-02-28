/* 
 * File: CollisionInfo.js
 *      normal: vector upon which collision interpenetrates
 *      depth: how much penetration
 */

/*jslint node: true, vars: true, evil: true, bitwise: true */
/*global vec2 */
"use strict";

/**
 * Default Constructor
 * @memberOf CollisionInfo
 * @returns {CollisionInfo} New instance of CollisionInfo
 */
function CollisionInfo() {
    this.mDepth = 0;
    this.mNormal = new vec2.fromValues(0, 0);
    this.mStart = new vec2.fromValues(40, 20);
    this.mEnd = new vec2.fromValues(60, 40);
    this.mLine = new LineRenderable(this.mStart[0], this.mStart[1],
                                    this.mEnd[0], this.mEnd[1]);
    this.mLine.setColor([1, 0.5, 0.5, 1]);
}

/**
 * Set the depth of the CollisionInfo
 * @memberOf CollisionInfo
 * @param {Number} s how much penetration
 * @returns {void}
 */
CollisionInfo.prototype.setDepth = function (s) {
    this.mDepth = s;
};

/**
 * Set the normal of the CollisionInfo
 * @memberOf CollisionInfo
 * @param {vec2} s vector upon which collision interpenetrates
 * @returns {void}
 */
CollisionInfo.prototype.setNormal = function (s) {
    this.mNormal = s;
};

/**
 * Return the depth of the CollisionInfo
 * @memberOf CollisionInfo
 * @returns {Number} how much penetration
 */
CollisionInfo.prototype.getDepth = function () {
    return this.mDepth;
};

/**
 * Return the depth of the CollisionInfo
 * @memberOf CollisionInfo
 * @returns {vec2} vector upon which collision interpenetrates
 */
CollisionInfo.prototype.getNormal = function () {
    return this.mNormal;
};

/**
 * Set the all value of the CollisionInfo
 * @memberOf CollisionInfo
 * @param {Number} d the depth of the CollisionInfo 
 * @param {vec2} n the normal of the CollisionInfo
 * @param {vec2} s the startpoint of the CollisionInfo
 * @returns {void}
 */
CollisionInfo.prototype.setInfo = function (d, n, s) {
    this.mDepth = d;
    this.mNormal = n;
    
    var nScale = vec2.clone(n);
    vec2.scale(nScale, nScale, d);
    
    this.mStart = s;
    
    this.mEnd = vec2.create(); 
    vec2.add(this.mEnd, s, nScale);
};

/**
 * change the direction of normal
 * @memberOf CollisionInfo
 * @returns {void}
 */
CollisionInfo.prototype.changeDir = function () {
    vec2.scale(this.mNormal, this.mNormal, -1);
    var n = this.mStart;
    this.mStart = this.mEnd;
    this.mEnd = n;
};

//For debugging purposes only
CollisionInfo.prototype.update = function () {
    
};

CollisionInfo.prototype.draw = function (aCamera) {
    // End point
    this.mLine.setPointSize(5);
    this.mLine.setDrawVertices(true);
    this.mLine.setVertices(this.mEnd[0], this.mEnd[1], this.mEnd[0], this.mEnd[1]);
    this.mLine.draw(aCamera);
    
    // Line shaft
    this.mLine.setDrawVertices(false);
    this.mLine.setPointSize(1);
    this.mLine.setVertices(this.mStart[0], this.mStart[1], this.mEnd[0], this.mEnd[1]);
    this.mLine.draw(aCamera);
};