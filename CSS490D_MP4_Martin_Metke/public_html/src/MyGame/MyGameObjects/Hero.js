/* File: Hero.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine, GameObject, InterpolateVec2 */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Hero(texture, center, dps) {
    this.mWidth = 9;
    this.mHeight = 12;
    this.kCycle = 120;
    this.kRate = 0.05;
    this.kBounceFreq = 4;
    this.kBounceFrames = 60;
    this.mZoomCams = null;
    this.mTexture = texture;
    this.mDyePackSet = dps;
    
    // Set up SpriteRenderable to use passed location and size
    var dims = [5, 5, 116, 172];
    var renderableObj = new SpriteRenderable(texture);
    var Xform = renderableObj.getXform();
    renderableObj.setElementPixelPositions(
               dims[0], dims[0] + dims[2], dims[1], dims[1] + dims[3]);
    renderableObj.setColor([1, 1, 1, 0]);
    Xform.setPosition(center[0], center[1]);
    Xform.setSize(this.mWidth, this.mHeight);
    
    // Set up the object
    GameObject.call(this, renderableObj);
    
    // Customize for Hero functionality
    this.mMController = new MouseFollowController(this, center[0], center[1], 
                                                  this.kCycle, this.kRate);
    this.mAController = new SizeBounceController(this, this.mWidth/2, this.mHeight/2,
                                                 this.kBounceFreq, this.kBounceFrames);
    this.mHitLoc = null;
    this.mShotOffset = [this.mWidth/2 - 0.5, (this.mHeight/2) - 2];
    this.mHit = false;
    this.mTarget = vec2.fromValues(center[0], center[1]);
    
}
gEngine.Core.inheritPrototype(Hero, GameObject);

// On update, check if the Hero has been hit.
// If so, update the Animation Controller (mAController) through a size bounce
// cycle.
// Otherwise, allow Hero to fire.
Hero.prototype.update = function(x, y) {  
    
    var Xform = this.getXform();
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) {
        this.activateHit();
    }
    
    // If we're dealing with a hit state, don't allow following or firing
    if (this.mHit){
        if (this.mAController.getDone()){
            this.mHit = false;
            if (this.mZoomCams !== null){
                this.mZoomCams.unregisterHitHero();
            }
        }else{
            this.mAController.update();
        }
    }
    else{
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space)) {        
            // Instantiate a new dyepack
            var newDyePack = new DyePack(
                                this.mTexture, 
                                Xform.getXPos() + this.mShotOffset[0],
                                Xform.getYPos() + this.mShotOffset[1],
                                this.mZoomCams);
            this.mDyePackSet.addToSet(newDyePack);
        }
        
    }
    this.mMController.update(x, y);
};

Hero.prototype.setDyePackSet = function (dps){
    this.mDyePackSet = dps;
};

Hero.prototype.setZoomCams = function( camSet ) {
    
    this.mZoomCams = camSet;

};

// Check if this object collides with the other object
Hero.prototype.collide = function (oGameObject) {
  
  if (oGameObject.collides(this)) {
      this.activateHit();
  }
    
};

// Needs to be updated to do size
Hero.prototype.activateHit = function(){
    
    if (!this.mHit) {
        this.mHit = true;

        this.mAController.restart();

        if (this.mZoomCams !== null ) {
            this.mZoomCams.registerHitHero();
        }
    }
};
