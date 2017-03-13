/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/*global RigidShape, vec2, gEngine */

var RigidRectangle = function (xf, width, height, mass) {
    RigidShape.call(this, xf, mass);
    this.mType = "RigidRectangle";
    this.mWidth = width;
    this.mHeight = height;
    this.mBoundRadius = Math.sqrt(width * width + height * height) / 2;
    this.mVertex = [];
    this.mFaceNormal = [];
    
    this.setVertices();
    this.computeFaceNormals();
    
    // New from Ch 4.4 Phyics impl.
    this.updateInertia();
};
gEngine.Core.inheritPrototype(RigidRectangle, RigidShape);

RigidRectangle.prototype.incShapeSizeBy= function (dt) {
    this.mHeight += dt;
    this.mWidth += dt;
    this.mBoundRadius = Math.sqrt(this.mWidth * this.mWidth + this.mHeight * this.mHeight) / 2;
    this.setVertices();
    this.rotateVertices(this.mAngle);
    this.updateInertia();
};


RigidRectangle.prototype.setVertices = function () {
    var center = this.mXform.getPosition();
    var hw = this.mWidth / 2;
    var hh = this.mHeight / 2;
    //0--TopLeft;1--TopRight;2--BottomRight;3--BottomLeft
    this.mVertex[0] = vec2.fromValues(center[0] - hw, center[1] - hh);
    this.mVertex[1] = vec2.fromValues(center[0] + hw, center[1] - hh);
    this.mVertex[2] = vec2.fromValues(center[0] + hw, center[1] + hh);
    this.mVertex[3] = vec2.fromValues(center[0] - hw, center[1] + hh);    
};

RigidRectangle.prototype.computeFaceNormals = function () {
    //0--Top;1--Right;2--Bottom;3--Left
    //mFaceNormal is normal of face toward outside of rectangle    
    for (var i = 0; i<4; i++) {
        var v = (i+1) % 4;
        var nv = (i+2) % 4;
        this.mFaceNormal[i] = vec2.clone(this.mVertex[v]);
        vec2.subtract(this.mFaceNormal[i], this.mFaceNormal[i], this.mVertex[nv]);
        vec2.normalize(this.mFaceNormal[i], this.mFaceNormal[i]);
    }
};

// Taken from Ch 4.4 Physics implementation
RigidRectangle.prototype.rotate = function (angle) {
    this.mAngle += angle;
    this.mXform.setRotationInRad(this.mAngle);
    this.rotateVertices(angle);
};

RigidRectangle.prototype.rotateVertices = function (angle) {
    var center = this.mXform.getPosition();
    //var r = this.mXform.getRotationInRad();
       
    for (var i = 0; i<4; i++) {
        vec2.rotateWRT(this.mVertex[i], this.mVertex[i], angle, center);
    }
    this.computeFaceNormals();
};

// All colors are black now
RigidRectangle.kBoundColor = [
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1]
];

RigidRectangle.prototype.drawAnEdge = function (i1, i2, aCamera) {
    this.mLine.setColor(RigidRectangle.kBoundColor[i1]);
    this.mLine.setFirstVertex(this.mVertex[i1][0], this.mVertex[i1][1]);  
    this.mLine.setSecondVertex(this.mVertex[i2][0], this.mVertex[i2][1]); 
    this.mLine.draw(aCamera);
    // Remove normal drawing for MP7
//    var n = [3*this.mFaceNormal[i1][0], 3*this.mFaceNormal[i1][1]];
//    vec2.add(n, this.mVertex[i1], n);
//    this.mLine.setSecondVertex(n[0], n[1]); 
//    this.mLine.draw(aCamera);
};

RigidRectangle.prototype.draw = function (aCamera) {
    RigidShape.prototype.draw.call(this, aCamera);
    var i = 0;
    for (i=0; i<4; i++) {
        this.drawAnEdge(i, (i+1)%4, aCamera);
    }
    
    if (this.mDrawBounds) {
        this.mLine.setColor([1, 1, 1, 1]);
        this.drawCircle(aCamera, this.mBoundRadius);
    }
};

// New from Ch. 4.4 Phyics impl.
RigidRectangle.prototype.updateInertia = function () {
    // Expect this.mInvMass to be already inverted!
    if (this.mInvMass === 0) {
        this.mInertia = 0;
    } else {
        //inertia=mass*width^2+height^2
        this.mInertia = (1 / this.mInvMass) * (this.mWidth * this.mWidth + this.mHeight * this.mHeight) / 6;
        this.mInertia = 1 / this.mInertia;
    }
};

// Uses setVertices instead of directly setting them relative to v.
RigidRectangle.prototype.move = function (s) {
    var p = this.mXform.getPosition();
    vec2.add(p, p, s);
    
    var i;
    for (i = 0; i < this.mVertex.length; i++) {
        vec2.add(this.mVertex[i], this.mVertex[i], s);
    }
    
      
 };

RigidRectangle.prototype.update = function () {
    RigidShape.prototype.update.call(this);
};