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
function InteractiveBound(renderableObj, camera, reportObject = null ) {
    InteractiveObject.call(this, renderableObj);
    this.mWidth = 15;
    this.mHeight = 15;
    this.mDrawClones = false;
    this.mClones = [];
    this.mInvisibleClones = [];
    this.mMarkers = [];
    this.mMarkersPos = [];
    this.mReportOffset = [2,2];
    this.mReportObject = reportObject;
    this.mCamera = camera;
    this.mMoveBounds = this.mCamera.getWCBounds();
    this.mAnimationView = null;
    this.mZoomedViews = null;
        
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

    // Set up side markers
    this._setupMarkers();
    
    if (this.mReportObject !== null){
        var cBounds = this.mCamera.getWCBounds();
        this.mReportObject.setPosition(cBounds[0] + this.mReportOffset[0], 
                                       cBounds[1] + this.mReportOffset[1]);
    }
}
gEngine.Core.inheritPrototype(InteractiveBound, InteractiveObject);

InteractiveBound.prototype._setupMarkers = function() {
    
    // Set positions of side markers
    var xForm = this.getXform();
    this.mMarkersPos = [ [ xForm.getXPos() + (this.mWidth / 2.0 ), xForm.getYPos()  ], //  3 o'clock pos
                         [ xForm.getXPos(), xForm.getYPos() + (this.mHeight / 2.0 ) ], // 12 o'clock pos
                         [ xForm.getXPos() - (this.mWidth / 2.0 ), xForm.getYPos()  ], //  9 o'clock pos
                         [ xForm.getXPos(), xForm.getYPos() - (this.mHeight / 2.0 )]   //  6 o'clock pos
                        ];
    
    // Instantiate side markers
    for (var j = 0; j < 4; j++){
        var randColor = [ Math.random(), Math.random(), Math.random(), 1];
        this.mMarkers.push(new Renderable());
        this.mMarkers[j].setColor(randColor);
        // Set position
        this.mMarkers[j].getXform().setPosition( this.mMarkersPos[j][0], this.mMarkersPos[j][1]);
        this.mMarkers[j].getXform().setSize(1, 1);
    }
    
    
};

/* @brief   set the allowable bounds for movement.  Required for constrained scrolling
 * @param   {Number array} aBounds    [xOrigin, yOrigin, width, height] of bounds  
 * @post    The bounds of this object will be updated, and this won't go beyond them.
 */
InteractiveBound.prototype.setBounds = function (aBounds) {
    this.mMoveBounds = aBounds;
};

/* @brief   Return the WC bounds [xOrigin, yOrigin, width, height] that constrain
 *          this IB's movements; also == to the displayed size of sprite sheet
 * @returns {array} aBounds
 */
 InteractiveBound.prototype.getBounds = function () {
     return this.mMoveBounds;
 };

/*  @brief  set the object that this will update when this is updated.
 *  @param  {InteractiveBoundDisplay} reportObject
 *  @pre    reportObject has a setData() method
 *  @post   reportObject is updated with this' current position and size
 */
InteractiveBound.prototype.setReportObject = function (reportObject) {
    this.mReportObject = reportObject;
    if (reportObject !== null){
        this.updateReportObject();
    }
};

InteractiveBound.prototype.setCamera = function (aCamera) {
    this.mCamera = aCamera;
};

InteractiveBound.prototype.registerAView = function (animationView){
    this.mAnimationView = animationView;
};

InteractiveBound.prototype.registerZViews = function (zoomedViews){
    this.mZoomedViews = zoomedViews;
};

InteractiveBound.prototype.getWidth = function () {
    return this.mWidth;
};

InteractiveBound.prototype.getCamera = function () {
    return (this.mCamera);
};

InteractiveBound.prototype.getMarkerPositions = function() {
    return this.mMarkersPos;
};

// Accessor to find out how many frames the AnimationView should use.
InteractiveBound.prototype.getFrames = function() {
    return (this.mClones.length - this.mInvisibleClones.length) + 1;
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
    var position = this.getXform().getPosition();
    
    for (var i = 0; i < this.mClones.length; i++){
        var xForm = this.mClones[i].getXform();
        xForm.setPosition(position[0] + ((i + 1) * this.mWidth),
                          position[1]
                         );
        xForm.setSize(this.mWidth, this.mHeight);
  }
};

/* @brief   Update the bound side markers with current extents of current InteractiveBound
 * @pre     This' mMarkers are instantiated
 * @post    This' mMarker Renderables are all in the correct position 
 */
InteractiveBound.prototype.updateMarkers = function() {
        
    var position = this.getXform().getPosition();
    this.mMarkersPos = [ [ position[0] + (this.mWidth / 2.0 ), position[1]  ],
                         [ position[0], position[1] + (this.mHeight / 2.0 ) ],
                         [ position[0] - (this.mWidth / 2.0 ), position[1]  ],
                         [ position[0], position[1] - (this.mHeight / 2.0 )] 
                        ];
    
    // Instantiate corner markers
    for (var j = 0; j < this.mMarkers.length; j++){
        // Set position
        this.mMarkers[j].getXform().setPosition( this.mMarkersPos[j][0], this.mMarkersPos[j][1]);
    }
};

InteractiveBound.prototype.updateGeometry = function(boundsArray) {
    
    // Resize the attached camera
    this.mCamera.setViewport(boundsArray);
    
    // Move the InteractiveBoundDisplay to the bottom-left corner
    var bounds = this.mCamera.getWCBounds();
    this.mReportObject.setPosition(bounds[0] + this.mReportOffset[0],
                                   bounds[1] + this.mReportOffset[1]);
};

/*  @brief  Make sure this' position is within the bounds passed in.
 *  @pre    this.mMoveBounds are sane and reflect camera bounds in WC.
 *  @post   this' is constrained within the boundaries of mMoveBounds
 */
InteractiveBound.prototype.sanitizePosition = function() {
    //debug
    //return;
    
    if (this.mMoveBounds.length !== 0 ){
        var xForm = this.getXform();
        
        if(this.mWidth < 1){
            xForm.setWidth(1);
            this.mWidth = xForm.getWidth();
        }
        if(this.mHeight < 1){
            xForm.setHeight(1);
            this.mHeight = xForm.getHeight();
        }
        
        // Assume bounds are WC [ Xmin, Ymin, XWidth, YWidth ]
        var hWidth = this.mWidth/2.0;
        var hHeight = this.mHeight/2.0;
        var left = ( xForm.getXPos() - hWidth );
        var right = ( xForm.getXPos() + hWidth );
        var bottom = ( xForm.getYPos() - hHeight );
        var top = ( xForm.getYPos() + hHeight );
        var lEdge = (this.mMoveBounds[0]).toPrecision(6);
        var rEdge = (this.mMoveBounds[0] + this.mMoveBounds[2]).toPrecision(6);
        var bEdge = (this.mMoveBounds[1]).toPrecision(6);
        var tEdge = (this.mMoveBounds[1] + this.mMoveBounds[3]).toPrecision(6);
        
        if (this.mWidth > (rEdge - lEdge)) {
            xForm.setWidth(rEdge - lEdge);
            this.mWidth = xForm.getWidth();
        }
        if (this.mHeight > (tEdge - bEdge)) {
            xForm.setHeight(tEdge - bEdge);
            this.mHeight = xForm.getHeight();
        }
        
        if (left < lEdge) { xForm.incXPosBy( lEdge - left ); }
        if (bottom < bEdge) { xForm.incYPosBy( bEdge - bottom ); }
        if (right > rEdge) {xForm.incXPosBy( rEdge - right); }
        if (top > tEdge) {xForm.incYPosBy( tEdge - top ); }
        
        // Set invisible clones - this will track which frames are off the map
        for (var i = this.mClones.length - 1; i >= 0; i--){
            if ((right + ((i + 1) * this.mWidth)) > rEdge ) {
                if ((this.mInvisibleClones.indexOf(this.mClones[i]) === -1)) {
                    this.mInvisibleClones.push(this.mClones[i]);
                }
            } else if (this.mInvisibleClones.indexOf(this.mClones[i]) !== -1) {
                this.mInvisibleClones.pop();
                break;
            }
        }
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
    } else if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Shift)){
        mDelta *= 0.1;
        sDelta *= 0.1;
    }
    
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.W)){
        Xform.incYPosBy(mDelta);
        clean = false;
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.A)){
        Xform.incXPosBy(-mDelta);
        clean = false;
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.S)){
        Xform.incYPosBy(-mDelta);
        clean = false;
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.D)){
        Xform.incXPosBy(mDelta);
        clean = false;
    }
    
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.Up)){
        Xform.incHeightBy(sDelta);
        this.mHeight = Xform.getHeight();
        clean = false;
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.Left)){
        Xform.incWidthBy(-sDelta);
        this.mWidth = Xform.getWidth();
        clean = false;
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.Down)){
        Xform.incHeightBy(-sDelta);
        this.mHeight = Xform.getHeight();
        clean = false;
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.Right)){
        Xform.incWidthBy(sDelta);
        this.mWidth = Xform.getWidth();
        clean = false;
    }
    
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)){
        this.mDrawClones = !(this.mDrawClones);
    }
    
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.R)){
        Xform.setWidth(15);
        Xform.setHeight(15);
        this.mHeight = 15;
        this.mWidth = 15;
        clean = false;
    }
    
    // See if the user is happy with their animation order choice!
    if (this.mAnimationView !== null){
        if(gEngine.Input.isKeyClicked(gEngine.Input.keys.One)){
            this.mAnimationView.setAnimationType(0);
            clean = false;
        } else if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Two)){
            this.mAnimationView.setAnimationType(1);
            clean = false;
        } else if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Three)){
            this.mAnimationView.setAnimationType(2);
            clean = false;
        }
    }
    
    // If any updates/changes have been made, then update internal state
    // and notify other display objects to update theirs in turn.
    // Notably, turning Clone visibility on/off does not require changing any
    // states so does unset clean.
    if ( !(clean) ){
        this.sanitizePosition();
        this.updateClones();
        this.updateMarkers();
        if (this.mReportObject !== null){
            this.updateReportObject();
        }
        if (this.mZoomedViews !== null){
            this.mZoomedViews.update();
        }
        if (this.mAnimationView !== null){
            this.mAnimationView.update();
        }
    }
};

// Draw the TextureRenderable; additionally, if set, draw the animation frames
// ("clones").
InteractiveBound.prototype.draw = function (cameraVPM) {
            
    //var cameraVPM = this.mCamera.getVPMatrix();
    this.mRenderComponent.draw(cameraVPM);
    if ( this.mDrawClones ) {
        for (var i = 0; i < this.mClones.length - this.mInvisibleClones.length; i++){
            this.mClones[i].draw(cameraVPM);
        }
    }
    for (var j = 0; j < this.mMarkers.length; j++){
        this.mMarkers[j].draw(cameraVPM);
    }
    
    // draw our updates
    this.mReportObject.draw(cameraVPM);
    
};