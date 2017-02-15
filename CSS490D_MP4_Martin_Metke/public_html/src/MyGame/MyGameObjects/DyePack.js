/* File: DyePack.js 
 *
 * A "bullet" object that spawns somewhere and flies to the right.
 * Extends GameObject
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine, GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function DyePack(texture, x, y, zoomCams) {

    this.mZoomCams = zoomCams;
    this.mController = null;
    this.mHitLoc = null;
    this.mLifetime = 0;
    this.kMaxLifetime = 300;
    this.mHit = false;
    this.mDead = false;
    
    // Create Sprite
    var renderableObj = new SpriteRenderable(texture);
    var dims = [510, 23, 83, 126];
    renderableObj.setElementPixelPositions(
               dims[0], dims[0] + dims[2], dims[1], dims[1] + dims[3]);
    renderableObj.setColor([1, 1, 1, 0]);
    
    // Set position
    var Xform = renderableObj.getXform();
    Xform.setPosition(x, y);
    Xform.setSize(2, 3.5);
    Xform.setRotationInDegree(90);
    
    GameObject.call(this, renderableObj);
    
    this.mCurrentFrontDir = vec2.fromValues(1, 0);
    this.mSpeed = 2;
    console.log(this.mSpeed);
}
gEngine.Core.inheritPrototype(DyePack, GameObject);

DyePack.prototype.update = function() {
    // Stop updating if this object has died (for reaching the end of its lifetime,
    // for leaving the screen, or for reaching the end of its hit animation
    if(!this.mDead){
        // Use the GameObject update to move this
        GameObject.prototype.update.call(this);
        
        // Increment life to date
        this.mLifetime += 1;
        // If this object has timed out, or reached speed 0 *without* hitting something
        if (this.mLifetime >= this.kMaxLifetime || (this.mSpeed === 0 && !this.mHit)){
            this.mDead = true;
        } else {
            // If the object is still alive after the update, handle key presses
            if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)){
                this.incSpeedBy(-0.1);
            }
            if (gEngine.Input.isKeyClicked(gEngine.Input.keys.S)){
                if (!this.hit){
                    this.activateHit();
                }
            }
            if (this.mHit){
                if (this.mController.shakeDone()){
                    this.mDead = true;
                }else{
                    var aDXDY = this.mController.getShakeResults();
                    var Xform = this.getXform();
                    Xform.setPosition(this.mHitLoc[0] + aDXDY[0],
                                      this.mHitLoc[1] + aDXDY[1]);
                }
            }
        }
    }
};

DyePack.prototype.activateHit = function(){
    this.mHit = true;
    this.mHitLoc = [ this.getXform().getXPos(), this.getXform().getYPos()];
    this.mSpeed = 0;
    this.mController = new ShakePosition(4, 0.2, 20, 300);
    
    // On hit, register a hit
    if( this.mZoomCams !== null ){
        this.mZoomCams.registerHitPack(this);
    }
};

// Perform collision check against oGameObject.
DyePack.prototype.collide = function (oGameObject){
    
    //Break out if this DyePack has already collided with something!
    if (this.mHit) {return; };
    
    // Slow down DyePack if it's in the bounding box of the patrol
    var bbox = this.getBBox();
    var oBBox = oGameObject.getBBox();
    var result = oBBox.boundCollideStatus(bbox);
    if(result !== BoundingBox.eboundCollideStatus.eOutside ){
        
        this.incSpeedBy(-0.1);
        
        if (oGameObject.collides(this)){
            oGameObject.collide(this);
            this.activateHit();
        }
    }
};

DyePack.prototype.isHit = function () {
    return this.mHit;
};

DyePack.prototype.isDead = function() {
    return this.mDead;
};

DyePack.prototype.incSpeedBy = function(deltaV){
    this.mSpeed += deltaV;
    if (this.mSpeed < 0){
        this.mSpeed = 0;
    }
};