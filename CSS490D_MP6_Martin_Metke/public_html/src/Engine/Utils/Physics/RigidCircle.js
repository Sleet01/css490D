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

RigidCircle.prototype.collisionTest = function ( oObject, collisionInfo ) {
    var status = false;
    if (typeof oObject.mPhysicsComponent === typeof this) {
        status = this.collidedCircCirc(this, oObject.mPhysicsComponent, collisionInfo);
    } else {
        status = oObject.collidedRectCirc(this, collisionInfo);
    }
    return status;
};

RigidCircle.prototype.collidedCircCirc = function (c1, c2, collisionInfo) {
    var vFrom1to2 = vec2.create();  // "out" vec2 for vec2.subtract
    vec2.subtract(vFrom1to2, c2.mCenter, c1.mCenter);
    var rSum = c1.mRRadius + c2.mRRadius;
    var dist = vec2.length(vFrom1to2);
    if (dist > Math.sqrt(rSum * rSum)) {
        //not overlapping
        return false;
    }
    if (dist !== 0) {
        // overlapping bu not same position
        var normalFrom2to1 = vec2.create();
        vec2.scale( normalFrom2to1, vFrom1to2, -1 );
        vec2.normalize( normalFrom2to1, normalFrom2to1 );
        var radiusC2 = vec2.create();
        vec2.scale( radiusC2, normalFrom2to1, c2.mRRadius );
        var c2Offset = vec2.create();
        vec2.add(c2Offset, c2.mCenter, radiusC2);
        vec2.normalize(vFrom1to2, vFrom1to2);
        // Set collision info with reversed, scaled, vector pointing out towards
        // C2's center, by depth of overlap
        collisionInfo.setInfo(rSum - dist, vFrom1to2, c2Offset);
    } else {
        //same position
        if (c1.mRadius > c2.mRadius) {
            var c1Offset;
            vec2.add(c1Offset, c1.mCenter, new vec2.fromValues(0, c1.mRadius));
            collisionInfo.setInfo(rSum, new vec2.fromValues(0, -1), c2Offset);
        } else {
            var c2Offset;
            vec2.add(c2Offset, c2.mCenter, new vec2.fromValues(0, c2.mRadius));
            collisionInfo.setInfo(rSum, new vec2.fromValues(0, -1), c2Offset);
        }
    }
    return true;
};

RigidCircle.prototype.update = function () {
    // simple default behavior
    RigidShape.prototype.update.call(this);

    this.mRCircle.incAngleBy(this.mW);
};

RigidCircle.prototype.draw = function ( aCamera ) {
    
    if(this.mBVisible){
        this.mBCircle.draw( aCamera );
    }
    
    this.mRCircle.draw( aCamera );
};
