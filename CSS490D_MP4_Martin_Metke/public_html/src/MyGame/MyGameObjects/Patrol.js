/* File: Patrol.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine, GameObject, InterpolateVec2 */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Patrol(texture, center, game) {
    
    this.mCenter = center;
    this.head = new PatrolHead();
    
    this.mWidth = 0;
    this.mHeight = 0;
    
    
    // Customize for Patrol functionality
    this.mController = this.defaultController;
    this.mHitLoc = null;
    this.mShotOffset = [this.mWidth/2 - 0.5, (this.mHeight/2) - 2];
    this.mGame = game;
    this.mCurrentFrontDir = vec2.fromValues(1, 0);
    this.mSpeed = 0.0;    
    this.mHit = false;
    this.mTarget = vec2.fromValues(center[0], center[1]);
    
}
gEngine.Core.inheritPrototype(Patrol, GameObject);

Patrol.prototype.update = function(x, y) {  
    
    var Xform = this.getXform();
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) {
        this.activateHit();
    }
    
    // If we're dealing with a hit state, don't allow following or firing
    if (this.mHit){
        if (this.mController.shakeDone()){
            this.mHit = false;
            this.mController = null;
            this.follow(x, y);
        }else{
            var aDXDY = this.mController.getShakeResults();
            Xform.setPosition(this.mHitLoc[0] + aDXDY[0],
                              this.mHitLoc[1] + aDXDY[1]);
        }
    }
    else{
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Space)) {        
            // Instantiate a new dyepack
            var newDyePack = new DyePack(
                                new TextureRenderable( this.mGame.kDyeSprite ), 
                                Xform.getXPos() + this.mShotOffset[0],
                                Xform.getYPos() + this.mShotOffset[1]);
            this.mGame.mDyePackSet.addToSet(newDyePack);
        }
        
        this.follow(x, y);
    }
    
};

Patrol.prototype.follow = function(x, y){
    
    var Xform = this.getXform();
    // If we have removed our controller, never been assigned one, or are now
    // tracking to a new (x, y) coordinate, make a new Controller!
    if (this.mController === null || 
            (x !== this.mTarget[0] || y !== this.mTarget[1])){
        this.mTarget = vec2.fromValues(x, y);
        this.mController = new InterpolateVec2(
                            vec2.fromValues(Xform.getXPos(), Xform.getYPos()), 
                            120, 0.05);
        this.mController.setFinalValue(vec2.fromValues(x, y));    
    }
    // We now have a new controller, or are already equipped with one, so
    // get its next position value.
    this.mController.updateInterpolation();
    var nextPos = this.mController.getValue();
    
    // Don't let the Patrol leave the screen, though.
    var screenBBox = this.mGame.mDyePackSet.getBBox();
    if (screenBBox.containsPoint(nextPos[0] + this.mWidth/2, nextPos[1]) &&
        screenBBox.containsPoint(nextPos[0] - this.mWidth/2, nextPos[1]) &&
        screenBBox.containsPoint(nextPos[0], nextPos[1] + this.mHeight/2) &&
        screenBBox.containsPoint(nextPos[0], nextPos[1] - this.mHeight/2)) { 
        Xform.setPosition(nextPos[0], nextPos[1]);
    }
    else{
        this.mController = null;
    }
    // If we've arrived, remove the controller
    if (Xform.getXPos() === this.mTarget[0] && Xform.getYPos() === this.mTarget[1]){
        this.mController = null;
    }
    
};

Patrol.prototype.activateHit = function(){
    this.mHit = true;
    this.mHitLoc = [ this.getXform().getXPos(), this.getXform().getYPos()];
    this.mSpeed = 0;
    this.mController = new ShakePosition(this.mWidth/2, this.mHeight/2, 4, 60);
};

Patrol.prototype.setSpeed = function(velocity){
    this.mSpeed = velocity;
};

Patrol.prototype.changeSpeed = function(deltaV){
    this.mSpeed += deltaV;
    if (this.mSpeed < 0){
        this.mSpeed = 0;
    }
};