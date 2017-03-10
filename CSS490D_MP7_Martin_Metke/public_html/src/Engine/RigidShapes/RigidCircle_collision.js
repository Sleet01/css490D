/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/* global RigidCircle, vec2 */

RigidCircle.prototype.collisionTest = function (otherShape, collisionInfo) {
    var status = false;
    if (otherShape.mType === "RigidCircle") {
        status = this.collideCircCirc(this, otherShape, collisionInfo);
    } else {
        status = otherShape.collideRectCirc(this, collisionInfo);
    }
    return status;
};

RigidCircle.prototype.collideCircCirc = function (c1, c2, collisionInfo) {
    var vFrom1to2 = [0, 0];
    vec2.subtract(vFrom1to2, c2.getCenter(), c1.getCenter());
    var rSum = c1.mRadius + c2.mRadius;
    var dist = vec2.length(vFrom1to2);
    if (dist > Math.sqrt(rSum * rSum)) {
        //not overlapping
        return false;
    }
    if (dist !== 0) {
        // overlapping bu not same position
        vec2.normalize(vFrom1to2, vFrom1to2);
        var vToC2 = [0, 0];
        vec2.scale(vToC2, vFrom1to2, -c2.mRadius);
        vec2.add(vToC2, c2.getCenter(), vToC2);
        collisionInfo.setInfo(rSum - dist, vFrom1to2, vToC2);
    } else {
        //same position
        if (c1.mRadius > c2.mRadius) {
            var pC1 = c1.getCenter();
            var ptOnC1 = [pC1[0], pC1[1] + c1.mRadius];
            collisionInfo.setInfo(rSum, [0, -1], ptOnC1);
        } else {
            var pC2 = c2.getCenter();
            var ptOnC2 = [pC2[0], pC2[1]+c2.mRadius];
            var v = new vec2.create();
            v[0] = 0;
            v[1] = -1;
            collisionInfo.setInfo(rSum, v, ptOnC2);
        }
    }
    return true;
};

