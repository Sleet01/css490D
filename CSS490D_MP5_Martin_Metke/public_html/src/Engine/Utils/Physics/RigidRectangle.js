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
    this.rotatePoints();
    this.resetRectangle();
};

// Reset the points based on the current Xform
RigidRectangle.prototype.resetPoints = function () {
    
    var xCtr, yCtr, center;
    var hWidth = this.kWidth / 2.0;
    var hHeight = this.kHeight / 2.0;
    
    center = this.mObject.getXform().getPosition(); 
    xCtr = center[0];
    yCtr = center[1];
    
    this.mPoints.push([xCtr - hWidth, yCtr + hHeight ]);
    this.mPoints.push([xCtr - hWidth, yCtr + hHeight + this.kNormalLen ]);
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

RigidRectangle.prototype.rotatePoints = function () {
    
    var center = this.mObject.getXform().getPosition();
    var point;
    
    for (var i = 0; i < this.mPoints.length; i++) {
        point = vec2.fromValues(this.mPoints[i][0], this.mPoints[i][1]);
        vec2.rotateWRT(point, point, this.getRotation(), center);
        this.mPoints[i] = [point[0], point[1]];
    }
};

RigidRectangle.prototype.resetRectangle = function () {
    

    for (var i = 0; i < this.mPoints.length; i+=3){
        var line1 = new LineRenderable(this.mPoints[i][0], this.mPoints[i][1], this.mPoints[i+1][0], this.mPoints[i+1][1]);
        var line2 = new LineRenderable(this.mPoints[i][0], this.mPoints[i][1], this.mPoints[i+2][0], this.mPoints[i+2][1]);
        line1.setColor(this.kColors[i / 3]);
        line2.setColor(this.kColors[i / 3]);
        this.mLines.push(line1);
        this.mLines.push(line2);
    }
};

RigidRectangle.prototype.update = function () {
    // simple default behavior
    RigidShape.prototype.update.call(this);
    this.rotatePoints();
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
