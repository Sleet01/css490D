/* File: RigidRectangle.js 
 *
 * Abstracts a game object's behavior and appearance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, GameObject, RigidShape, gEngine */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function RigidRectangle( object = null ){
    RigidShape.call(this, object);
    this.kWidth = 9;
    this.kHeight = 12;
    this.kNormalLen = 3;
    this.kColors = [[1, 0, 0, 1],
                    [0, 1, 0, 1],
                    [0, 0, 1, 1],
                    [1, 0, 1, 1]];
                
    this.mPoints = [];
    this.mLines = [];
}
gEngine.Core.inheritPrototype(RigidRectangle, RigidShape);

RigidRectangle.prototype.register = function (gObject){
    RigidShape.prototype.register.call(this, gObject);
    // Set up extent objects (LineRenderables based on this object's bounding box
    
    this.resetPoints();
    this.rotatePoints(0);
    this.setupRectangle();
};

// Reset the points based on the current Xform
RigidRectangle.prototype.resetPoints = function () {
    
    var xCtr, yCtr, center;
    var hWidth = this.kWidth / 2.0;
    var hHeight = this.kHeight / 2.0;
    
    center = this.mObject.getXform().getPosition(); 
    xCtr = center[0];
    yCtr = center[1];
    
    this.mPoints.push([xCtr - hWidth, yCtr + hHeight ]); // Start of 1st 2 lines
    this.mPoints.push([xCtr - hWidth, yCtr + hHeight + this.kNormalLen ]); // End point for 1st Vector
    this.mPoints.push([xCtr + hWidth, yCtr + hHeight ]); // End point for first side
    this.mPoints.push([xCtr + hWidth, yCtr + hHeight ]);
    this.mPoints.push([xCtr + hWidth + this.kNormalLen, yCtr + hHeight ]);
    this.mPoints.push([xCtr + hWidth, yCtr - hHeight ]); // End point for 2nd side
    this.mPoints.push([xCtr + hWidth, yCtr - hHeight ]);
    this.mPoints.push([xCtr + hWidth, yCtr - hHeight - this.kNormalLen ]);
    this.mPoints.push([xCtr - hWidth, yCtr - hHeight ]); // End point for 3rd side
    this.mPoints.push([xCtr - hWidth, yCtr - hHeight ]);
    this.mPoints.push([xCtr - hWidth - this.kNormalLen, yCtr - hHeight ]);
    this.mPoints.push([xCtr - hWidth, yCtr + hHeight ]); // End point for 4th side
    
};

// Update lines.  I have been too clever for my own good.
RigidRectangle.prototype.resetRectangle = function () {
    
    // this.mPoints index
    var j;
    
    // Should be 8 lines, so 0 ~ 7: 0 ~ 11 in points?
    // i = 0 : points[i] = 0, 1; i = 1 : points[i] = 0, 2
    // i = 2 : points[i] = 3, 4; i = 3 : points[i] = 3, 5
    // i = 4 : points[i] = 6, 7; i = 5 : points[i] = 6, 8
    // i = 6 : points[i] = 9, 10; i = 7 : points[i] = 9, 11
    for (var i = 0; i < this.mLines.length; i+=2){
        
        j = i + (i /2);
        
        this.mLines[i].setVertices(this.mPoints[j][0], this.mPoints[j][1], this.mPoints[j+1][0], this.mPoints[j+1][1]);
        this.mLines[i+1].setVertices(this.mPoints[j][0], this.mPoints[j][1], this.mPoints[j+2][0], this.mPoints[j+2][1]);
    }
};

RigidRectangle.prototype.rotatePoints = function (deltaAngle) {
    
    var center = this.mObject.getXform().getPosition();
    var point;
    
    for (var i = 0; i < this.mPoints.length; i++) {
        point = vec2.fromValues(this.mPoints[i][0], this.mPoints[i][1]);
        vec2.rotateWRT(point, point, deltaAngle, center);
        this.mPoints[i] = [point[0], point[1]];
    }
};

// Fill this.mLines with LineRenderables.  Do *not* call more than once! >_<
RigidRectangle.prototype.setupRectangle = function () {
    

    for (var i = 0; i < this.mPoints.length; i+=3){
        var line1 = new LineRenderable(this.mPoints[i][0], this.mPoints[i][1], this.mPoints[i+1][0], this.mPoints[i+1][1]);
        var line2 = new LineRenderable(this.mPoints[i][0], this.mPoints[i][1], this.mPoints[i+2][0], this.mPoints[i+2][1]);
        line1.setColor(this.kColors[i / 3]);
        line2.setColor(this.kColors[i / 3]);
        this.mLines.push(line1);
        this.mLines.push(line2);
    }
};

RigidRectangle.prototype.incRotationBy = function (rad) {
    
    RigidShape.prototype.incRotationBy.call(this, rad);
    this.rotatePoints(rad);
    
};

RigidRectangle.prototype.incXPosBy = function (xDelta) { 
    RigidShape.prototype.incXPosBy.call(this, xDelta);
    for (var i = 0; i < this.mPoints.length; i++ ){
        this.mPoints[i][0] += xDelta;
    }
};

RigidRectangle.prototype.incYPosBy = function (yDelta) { 
    RigidShape.prototype.incYPosBy.call(this, yDelta);
    for (var i = 0; i < this.mPoints.length; i++ ){
        this.mPoints[i][1] += yDelta;
    }
};

RigidRectangle.prototype.update = function ( ) {
    // simple default behavior
    RigidShape.prototype.update.call(this);
    this.resetRectangle();

};

RigidRectangle.prototype.draw = function ( aCamera ) {
    
    if(this.mVisible){
        this.mBCircle.draw( aCamera );
    }
    for (var i = 0; i < this.mLines.length; i++ ){
        this.mLines[i].draw(aCamera);
    }
};
