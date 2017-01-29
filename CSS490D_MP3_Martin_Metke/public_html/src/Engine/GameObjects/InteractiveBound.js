/* File: InteractiveBound.js 
 *
 * Inherits from InteractiveObject
 * This is a specific InteractiveObject which displays a bounding box
 * and can move around.  It also reports its computed sprite animation info
 * based on its size, and will return (U,V) or (pixelx, pixely) coordinates.
 */

/*jslint node: true, vars: true */
/*global gEngine: false, InteractiveObject: false, TextureRenderable: false*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

/* InteractiveBound takes a renderableObj (which had better be a TextureRenderable)
 */
function InteractiveBound(renderableObj, moveBounds = [], reportObject = null ) {
    InteractiveObject.call(this, renderableObj);
    this.mWidth = 15;
    this.mHeight = 15;
    this.mDrawClones = false;
    this.mMoveBounds = moveBounds;
    this.mReportObject = reportObject;
        
    renderableObj.setColor([1, 1, 1, 0]);
    renderableObj.getXform().setPosition(50, 25);
    renderableObj.getXform().setSize(this.mWidth, this.mHeight);
        
    // This object gets 4 clones, offset to the right by this.width.
    this.mClones = [];
}
gEngine.Core.inheritPrototype(InteractiveBound, InteractiveObject);

InteractiveBound.prototype.update = function () {
    var mDelta = 1;
    var sDelta = 1;
    var Xform = this.getXform();
    var clean = true;
    
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.Space)){
        // Set space multiplier
        mDelta *= 0.01;
        sDelta *= 0.01;
    }
    
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.W)){
        Xform.incYPosBy(mDelta);
        var clean = false;
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.A)){
        Xform.incXPosBy(-mDelta);
        var clean = false;
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.S)){
        Xform.incYPosBy(-mDelta);
        var clean = false;
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.D)){
        Xform.incXPosBy(mDelta);
        var clean = false;
    }
    
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.Up)){
        Xform.incHeightBy(sDelta);
        this.mHeight = Xform.getHeight();
        var clean = false;
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.Left)){
        Xform.incWidthBy(-sDelta);
        this.mWidth = Xform.getWidth();
        var clean = false;
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.Down)){
        Xform.incHeightBy(-sDelta);
        this.mHeight = Xform.getHeight();
        var clean = false;
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.Right)){
        Xform.incWidthBy(sDelta);
        this.mWidth = Xform.getWidth();
        var clean = false;
    }
    
    // Send the text bar our info and have it update itself
    // *if* any updates have been made.
    if ( (this.mReportObject !== null) && !(clean) ){
        this.mReportObject.setData([Xform.getXPos(), 
                                    Xform.getYPos(),
                                    this.mWidth,
                                    this.mHeight]);
        this.mReportObject.update();
    }
};

// Draw the TextureRenderable; additionally, if set, draw the animation frames
InteractiveBound.prototype.draw = function (aCameraVPM) {
    this.mRenderComponent.draw(aCameraVPM);
    if ( this.mDrawClones ) {
        for (var i = 0; i < this.mClones.length; i++){
            this.mClones[i].draw(aCameraVPM);
        }
    }
};