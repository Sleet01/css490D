/* 
 * File: BoundingBox.js
 * Encapsulates an axis aligned box
 */

/*jslint node: true, vars: true, bitwise: true */
/*global vec2 */
/* find out more about jslint: http://www.jslint.com/help.html */
"use strict";

function BoundingBox(centerPos, w, h) {
    this.mLL = vec2.fromValues(0, 0);
    this.setBounds(centerPos, w, h);
    
    this.mVisible = false;
    
    // Set up lines representing the extents of this BoundingBox
    this.mExtents = [];
    this.mExtents.push(new LineRenderable(this.minX(), this.minY(), this.maxX(), this.minY()));
    this.mExtents.push(new LineRenderable(this.maxX(), this.minY(), this.maxX(), this.maxY()));
    this.mExtents.push(new LineRenderable(this.maxX(), this.maxY(), this.minX(), this.maxY()));
    this.mExtents.push(new LineRenderable(this.minX(), this.maxY(), this.minX(), this.minY()));
    for (var j = 0; j < this.mExtents.length; j++) {
            this.mExtents[j].setColor([1, 1, 1, 1]);
    }
    
}

BoundingBox.eboundCollideStatus = Object.freeze({
    eCollideLeft: 1,
    eCollideRight: 2,
    eCollideTop: 4,
    eCollideBottom: 8,
    eInside : 16,
    eOutside: 0
});
// rotation is ignored.
// centerPos is a vec2
BoundingBox.prototype.setBounds = function (centerPos, w, h) {
    this.mWidth = w;
    this.mHeight = h;
    this.mLL[0] = centerPos[0] - (w / 2);
    this.mLL[1] = centerPos[1] - (h / 2);
};

BoundingBox.prototype.containsPoint = function (x, y) {
    return ((x > this.minX()) && (x < this.maxX()) &&
             (y > this.minY()) && (y < this.maxY()));
};

BoundingBox.prototype.intersectsBound = function (otherBound) {
    return ((this.minX() < otherBound.maxX()) &&
            (this.maxX() > otherBound.minX()) &&
            (this.minY() < otherBound.maxY()) &&
            (this.maxY() > otherBound.minY()));
};

// returns the status of otherBound wrt to this.
BoundingBox.prototype.boundCollideStatus = function (otherBound) {
    var status = BoundingBox.eboundCollideStatus.eOutside;

    if (this.intersectsBound(otherBound)) {
        if (otherBound.minX() < this.minX()) {
            status |= BoundingBox.eboundCollideStatus.eCollideLeft;
        }
        if (otherBound.maxX() > this.maxX()) {
            status |= BoundingBox.eboundCollideStatus.eCollideRight;
        }
        if (otherBound.minY() < this.minY()) {
            status |= BoundingBox.eboundCollideStatus.eCollideBottom;
        }
        if (otherBound.maxY() > this.maxY()) {
            status |= BoundingBox.eboundCollideStatus.eCollideTop;
        }

        // if the bounds intersects and yet none of the sides overlaps
        // otherBound is completely inside thisBound
        if (status === BoundingBox.eboundCollideStatus.eOutside) {
            status = BoundingBox.eboundCollideStatus.eInside;
        }
    }
    return status;
};

BoundingBox.prototype.minX = function () { return this.mLL[0]; };
BoundingBox.prototype.maxX = function () { return this.mLL[0] + this.mWidth; };
BoundingBox.prototype.minY = function () { return this.mLL[1]; };
BoundingBox.prototype.maxY = function () { return this.mLL[1] + this.mHeight; };

BoundingBox.prototype._updateExtents = function () {
    
    this.mExtents[0].setVertices(this.minX(), this.minY(), this.maxX(), this.minY());
    this.mExtents[1].setVertices(this.maxX(), this.minY(), this.maxX(), this.maxY());
    this.mExtents[2].setVertices(this.maxX(), this.maxY(), this.minX(), this.maxY());
    this.mExtents[3].setVertices(this.minX(), this.maxY(), this.minX(), this.minY());
};

BoundingBox.prototype.setVisibility = function (f) {
    this.mVisible = f;
};

BoundingBox.prototype.getVisibility = function () {
    return this.mVisible;
};

// Allow the bounding box to draw itself.
BoundingBox.prototype.draw = function( aCamera ) {
    
    if (this.mVisible){
        for (var j = 0; j < this.mExtents.length; j++) {
            this.mExtents[j].draw( aCamera );
        }
    }
};

//</editor-fold>