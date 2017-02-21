/*
 * File: CircleRenderable.js
 *  
 * Renderable objects for lines
 */

/*jslint node: true, vars: true */
/*global gEngine, Renderable, vec2*/
/* find out more about jslint: http://www.jslint.com/help.html */

// Constructor and object definition
"use strict";  // Operate in Strict mode such that variables must be declared before used!

// p1, p2: either both there, or none
function CircleRenderable(center, radius) {
    Renderable.call(this);
    Renderable.prototype.setColor.call(this, [1, 1, 1, 1]);
    Renderable.prototype._setShader.call(this, gEngine.DefaultResources.getLineShader());
    this.getXform().setSize(radius*2, radius*2);

    this.mPointSize = 1;
    this.mDrawVertices = false;
    this.mShowLine = true;
    this.mCenter = vec2.fromValues(center[0], center[1]);
    this.mRadius = radius;
    this.kLineRatio = 20;
    
}
gEngine.Core.inheritPrototype(CircleRenderable, Renderable);

//<editor-fold desc="Public Methods">
//**-----------------------------------------
// Public methods
//**-----------------------------------------
CircleRenderable.prototype.draw = function (aCamera) {
    this.mShader.setPointSize(this.mPointSize);
    // Draw line instead of triangle!
    var gl = gEngine.Core.getGL();
    this.mShader.activateShader(this.mColor, aCamera);  // always activate the shader first!

    var theta = 0;
    var sx, sy, cx, cy;
    var xf = this.getXform();
    var delta = (Math.PI * 2)/(Math.ceil(this.mRadius) * this.kLineRatio);
    var mP1 = [this.mCenter[0], this.mCenter[1]];
    var mP2 = [];

    // Go through one revolution, +1 to close the circle
    for (theta = 0; theta <= (Math.PI * 2) + 1; theta += delta ){
        
        mP2 = [this.mCenter[0] + (this.mRadius * Math.sin(theta)),
               this.mCenter[1] + (this.mRadius * Math.cos(theta))];
                
        sx = mP1[0] - mP2[0];
        sy = mP1[1] - mP2[1];
        cx = mP1[0] - sx / 2;
        cy = mP1[1] - sy / 2;
        
        // Move mP1 to current mP2 for next iteration
        mP1 = mP2;
        
        xf.setSize(sx, sy);
        xf.setPosition(cx, cy);
    
        this.mShader.loadObjectTransform(this.mXform.getXform());
        if (this.mShowLine) {
            gl.drawArrays(gl.LINE_STRIP, 0, 2);
        }
        if (!this.mShowLine || this.mdrawVertices) {
            gl.drawArrays(gl.POINTS, 0, 2);
        }
    }
   
    xf.setPosition(this.mCenter[0], this.mCenter[1]);
    xf.setSize(this.mRadius*2, this.mRadius*2);
};

CircleRenderable.prototype.setDrawVertices = function (s) { this.mDrawVertices = s; };
CircleRenderable.prototype.setShowLine = function (s) { this.mShowLine = s; };
CircleRenderable.prototype.setPointSize = function (s) { this.mPointSize = s; };

CircleRenderable.prototype.setCircle = function (center, radius) {
    this.setCenter(center);
    this.setRadius(radius);
};

CircleRenderable.prototype.setCenter = function (center) {
    this.mCenter = vec2.fromValues(center[0], center[1]);
};

CircleRenderable.prototype.setRadius = function (radius) {
    this.mRadius = radius;
};

//--- end of Public Methods
//</editor-fold>