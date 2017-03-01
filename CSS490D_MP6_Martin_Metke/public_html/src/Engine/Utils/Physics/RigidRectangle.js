/* File: RigidRectangle.js 
 *
 * Abstracts a game object's behavior and appearance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, GameObject, RigidShape, gEngine */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function RigidRectangle( object = null, width=1, height=1 ){
    RigidShape.call(this, object);
    this.kWidth = width;
    this.kHeight = height;
    this.kNormalLen = 3;
    this.kColors = [[1, 0, 0, 1],
                    [0, 1, 0, 1],
                    [0, 0, 1, 1],
                    [1, 0, 1, 1]];

    this.mNormals = [];
    this.mVertices = [];
    //this.mPoints = [];
    this.mLines = [];
    this.mType = "Rectangle";
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
    
    this.mVertices = [];
    this.mNormals = [];
    
    var xCtr, yCtr, center;
    var hWidth = this.kWidth / 2.0;
    var hHeight = this.kHeight / 2.0;
    
    center = this.mObject.getXform().getPosition(); 
    xCtr = center[0];
    yCtr = center[1];

    this.mVertices.push(vec2.clone([xCtr - hWidth, yCtr + hHeight ])); // Start of 1st normal and side
    this.mNormals.push(vec2.clone([xCtr - hWidth, yCtr + hHeight + this.kNormalLen ])); // End point for 1st Normal
    
    this.mVertices.push(vec2.clone([xCtr + hWidth, yCtr + hHeight ])); // Start of 2nd normal and side
    this.mNormals.push(vec2.clone([xCtr + hWidth + this.kNormalLen, yCtr + hHeight ])); // End point for 2nd Normal
    
    this.mVertices.push(vec2.clone([xCtr + hWidth, yCtr - hHeight ])); // Start of 3rd normal and side
    this.mNormals.push(vec2.clone([xCtr + hWidth, yCtr - hHeight - this.kNormalLen ])); // End point for 3rd Normal
    
    this.mVertices.push(vec2.clone([xCtr - hWidth, yCtr - hHeight ])); // Start of the 4th normal and side
    this.mNormals.push(vec2.clone([xCtr - hWidth - this.kNormalLen, yCtr - hHeight ])); // End point of the 4th Normal
};

// Update lines.  I have been too clever for my own good.
RigidRectangle.prototype.resetRectangle = function () {
    
    // 8 LineRenderables, 4 Vertices, 4 Normals
    for (var i = 0; i < this.mLines.length; i+=2){
        
        // Update Normal line
        this.mLines[i].setVertices(this.mVertices[i/2][0], 
                                   this.mVertices[i/2][1], 
                                   this.mNormals[i/2][0], 
                                   this.mNormals[i/2][1]);
        
        // Update Side line
        this.mLines[i+1].setVertices(this.mVertices[i/2][0], 
                                     this.mVertices[i/2][1], 
                                     this.mVertices[(i/2+1)%this.mVertices.length][0], 
                                     this.mVertices[(i/2+1)%this.mVertices.length][1]);
    }
};

RigidRectangle.prototype.rotatePoints = function (deltaAngle) {
    
    var center = this.mObject.getXform().getPosition();
    var point;
    
    for (var i = 0; i < this.mVertices.length; i++) {
        point = this.mVertices[i];
        vec2.rotateWRT(point, point, deltaAngle, center);
        this.mVertices[i] = point;
        
        point = this.mNormals[i];
        vec2.rotateWRT(point, point, deltaAngle, center);
        this.mNormals[i] = point;
    }
};

// Fill this.mLines with LineRenderables.  Do *not* call more than once! >_<
RigidRectangle.prototype.setupRectangle = function () {
    
    // Traverse mVertices array
    for (var i = 0; i < this.mVertices.length; i++){
        
        // Create Normal line
        var line1 = new LineRenderable(this.mVertices[i][0], 
                                       this.mVertices[i][1], 
                                       this.mNormals[i][0], 
                                       this.mNormals[i][1]);
        
        // Create side line
        var line2 = new LineRenderable(this.mVertices[i][0], 
                                       this.mVertices[i][1], 
                                       this.mVertices[(i+1)%this.mVertices.length][0], 
                                       this.mVertices[(i+1)%this.mVertices.length][1]);
        line1.setColor(this.kColors[i]);
        line2.setColor(this.kColors[i]);
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
    for (var i = 0; i < this.mVertices.length; i++ ){
        this.mVertices[i][0] += xDelta;
        this.mNormals[i][0] += xDelta;
    }
};

RigidRectangle.prototype.incYPosBy = function (yDelta) { 
    RigidShape.prototype.incYPosBy.call(this, yDelta);
    for (var i = 0; i < this.mVertices.length; i++ ){
        this.mVertices[i][1] += yDelta;
        this.mNormals[i][1] += yDelta;
    }
};

RigidRectangle.prototype.update = function ( ) {
    // simple default behavior
    RigidShape.prototype.update.call(this);
    this.resetRectangle();

};

RigidRectangle.prototype.draw = function ( aCamera ) {
    
    if(this.mBVisible){
        this.mBCircle.draw( aCamera );
    }
    for (var i = 0; i < this.mLines.length; i++ ){
        this.mLines[i].draw(aCamera);
    }
};
