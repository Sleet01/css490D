/* File: AnimationView.js 
 *
 * Inherits from AnimationView
 * An object that hosts a sprite-animated view of a spritesheet
  */

/*jslint node: true, vars: true */
/*global gEngine: false, InteractiveObject: false, Convert: false*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function AnimationView(renderableObj, ibObject, mvObject, paneArea) {
    InteractiveObject.call(this, renderableObj);
    this.mInteractiveBound = ibObject;
    this.mMainView = mvObject;
    this.mPaneArea = paneArea;
    this.mCameras = [];
    this.kSize = 2;
    this.info = gEngine.Textures.getTextureInfo(this.mRenderComponent.getTexture());
    
    this.mInteractiveBound.registerAView(this);
    this._initialize();
}
gEngine.Core.inheritPrototype(AnimationView, InteractiveObject);

AnimationView.prototype._initialize = function(){
    // mPaneArea describes an area in which we can draw our four cameras
    // height of each camera is mPaneArea height / 3; width is
    // mPaneArea width / 2.  
       
    // Initialize the SpriteAnimateRenderable
    var Xform = this.getXform();
    
    Xform.setSize(this.kSize, this.kSize/(this.mPaneArea[2]/this.mPaneArea[3]));
    Xform.setPosition(1, 1);
        
    // Create our camera
    var viewportArray = this.getVPArray();
    
    // Configure this camera to view
//    this.mCameras[0] = new Camera([Xform.getXPos(), Xform.getYPos() ],
//                                   Xform.getWidth(),
//                                   viewportArray);
    this.mCameras[0] = new Camera([1, 1],
                                   this.kSize,
                                   viewportArray);
    this.mCameras[0].setBackgroundColor([0.2, 0.7, 0.7, 0.9]);
    
    this.getRenderable().setAnimationSpeed(6);
    
    this.update();
    
};

AnimationView.prototype.getVPArray = function () {
    
    //var pWidth = this.mPaneArea[2] - this.mPaneArea[0]; //canvas space width (px)
    //var pHeight = this.mPaneArea[3] - this.mPaneArea[1];//canvas space height (px)
    //var pCenter = [this.mPaneArea[0] + (pWidth / 2),
    //               this.mPaneArea[1] + (pHeight / 2)];
    var viewportArray = [ this.mPaneArea[0], this.mPaneArea[1],
                          this.mPaneArea[2], this.mPaneArea[3]];
    return viewportArray;
};

// Handle changing the size of the canvas; called by eventhandler in MainView
AnimationView.prototype.updateGeometry = function(paneArea){
    
    this.mPaneArea = paneArea;
    var Xform = this.getXform();            
    // Update the camera
    this.mCameras[0].setViewport(this.getVPArray());
    // Update the AR of the object to fill the camera area after resizing    
    Xform.setSize(this.kSize, this.kSize/(this.mPaneArea[2]/this.mPaneArea[3]));
};

// Let the user switch animation directions if they want.
// 0: left to right
// 1: right to left
// 2: swing left->right->left->right->etc.
AnimationView.prototype.setAnimationType = function (type) {
    if ((type >= 0 ) && (type < 3)){
        this.mRenderComponent.setAnimationType(type);
    }
};

AnimationView.prototype.update = function () {

    var sprite = this.getRenderable();
            
    // Set up initial Sprite Sequence based on InteractiveBound pos, size
    var ibXform = this.mInteractiveBound.getXform();
    var ibBound = this.mInteractiveBound.getBounds();
    // We need the bottom^w top-left (?!?!) position of the IB, in UV, 
    // to set the Sprite location
//    var ibBottomLeft = [ ibXform.getXPos() - (ibXform.getWidth() * 0.5),
//                         ibXform.getYPos() - (ibXform.getHeight() * 0.5)];
//    var uvBottomLeft = Convert.wc2uv(ibBottomLeft, ibBound);
    var ibTopLeft = [ ibXform.getXPos() - (ibXform.getWidth() * 0.5),
                         ibXform.getYPos() + (ibXform.getHeight() * 0.5)];
    var uvTopLeft = Convert.wc2uv(ibTopLeft, ibBound);
    
    console.log("Projected UV coordinates are: " + uvTopLeft.toString());
    console.log("Projected UV width, height are: (" + 
                Convert.wcScalar2uv(ibXform.getWidth(), ibBound[2]).toPrecision(6) +
                ", " + Convert.wcScalar2uv(ibXform.getHeight(), ibBound[3]).toPrecision(6));
    
    sprite.setSpriteSequenceUV( uvTopLeft[0],
                                uvTopLeft[1],
                                Convert.wcScalar2uv(ibXform.getWidth(), ibBound[2]),
                                Convert.wcScalar2uv(ibXform.getHeight(), ibBound[3]),
                                this.mInteractiveBound.getFrames(),
                                0 );
};

// Use our internal camera only so as not to get unneeded geometry.
AnimationView.prototype.draw = function () {
    
    var sprite = this.getRenderable();
    this.mCameras[0].setupViewProjection();
    sprite.draw(this.mCameras[0].getVPMatrix());
    sprite.updateAnimation();
    
};