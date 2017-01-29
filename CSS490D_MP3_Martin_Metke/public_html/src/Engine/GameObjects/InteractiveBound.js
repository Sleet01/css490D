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
    this.mClones = [];
        
    renderableObj.setColor([1, 1, 1, 0]);
    renderableObj.getXform().setPosition(50, 25);
    renderableObj.getXform().setSize(this.mWidth, this.mHeight);
        
    // This object gets 4 clones, offset to the right by this.width.
    for (var i = 0; i < 4; i++){
        this.mClones.push(new InteractiveObject( 
                   new TextureRenderable(renderableObj.getTexture())));
        var xForm = this.mClones[i].getXform();
        xForm.setXPos(renderableObj.getXform().getXPos() + ((i + 1) * this.mWidth));
        xForm.setYPos(renderableObj.getXform().getYPos());
        xForm.setSize(this.mWidth, this.mHeight);
    }
}
gEngine.Core.inheritPrototype(InteractiveBound, InteractiveObject);

/* @brief   set the allowable bounds for movement.  Required for constrained scrolling
 * @param   {Number array} aBounds    [xOrigin, yOrigin, width, height] of bounds  
 * @post    The bounds of this object will be updated, and this won't go beyond them.
 */
InteractiveBound.prototype.setBounds = function (aBounds) {
    this.mMoveBounds = aBounds;
};

/*  @brief  set the object that this will update when this is updated.
 *  @param  {InteractiveFontObject} reportObject
 *  @pre    reportObject has a setData() method
 *  @post   reportObject is updated with this' current position and size
 */
InteractiveBound.prototype.setReportObject = function (reportObject) {
    this.mReportObject = reportObject;
    if (reportObject !== null){
        this.updateReportObject();
    }
};

/*  @brief  Send compiled position/size data to the Report Object; call its update()
 *  @pre    reportObject has a setData() method
 *  @post   reportObject is updated with this' current position and size
 */
InteractiveBound.prototype.updateReportObject = function() {
    var Xform = this.getXform();
    
    this.mReportObject.setData([Xform.getXPos(), 
                                Xform.getYPos(),
                                this.mWidth,
                                this.mHeight]);
    this.mReportObject.update();
        
};

/*  @brief  Update positions, sizes of the "clones" representing the animation frames
 *  @pre    reportObject has a setData() method
 *  @post   reportObject is updated with this' current position and size
 */
InteractiveBound.prototype.updateClones = function() {
  for (var i = 0; i < this.mClones.length; i++){
    var xForm = this.mClones[i].getXform();
    xForm.setXPos(this.getXform().getXPos() + ((i + 1) * this.mWidth));
    xForm.setYPos(this.getXform().getYPos());
    xForm.setSize(this.mWidth, this.mHeight);
  }
};

/*  @brief  Make sure this' position is within the bounds passed in.
 *  @pre    this.mMoveBounds are sane and reflect camera bounds in WC.
 *  @post   this' is constrained within the boundaries of mMoveBounds
 */
InteractiveBound.prototype.sanitizePosition = function() {
    if (this.mMoveBounds.length !== 0 ){
        var xForm = this.getXform();
        var hWidth = this.mWidth/2.0;
        var hHeight = this.mHeight/2.0;
        var left = ( xForm.getXPos() - hWidth );
        var right = ( xForm.getXPos() + hWidth );
        var bottom = ( xForm.getYPos() - hHeight );
        var top = ( xForm.getYPos() + hHeight );
        var lEdge = this.mMoveBounds[0];
        var rEdge = this.mMoveBounds[0] + this.mMoveBounds[2];
        var bEdge = this.mMoveBounds[1];
        var tEdge = this.mMoveBounds[1] + this.mMoveBounds[3];
                
        if (left < lEdge) { xForm.incXPosBy( lEdge - left ); }
        if (bottom < bEdge) { xForm.incXPosBy( bEdge - bottom ); }
        if (right > rEdge) {xForm.incYPosBy( rEdge - right); }
        if (top > tEdge) {xForm.incYPosBy( tEdge - top ); }
    }
    
};

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
    
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)){
        this.mDrawClones = !(this.mDrawClones);
        var clean = false;
    }
    
    // Send the text bar our info and have it update itself
    // *if* any updates have been made.
    if ( (this.mReportObject !== null) && !(clean) ){
        this.sanitizePosition();
        this.updateReportObject();
        this.updateClones();
        
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