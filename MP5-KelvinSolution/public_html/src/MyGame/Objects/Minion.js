/* File: Minion.js 
 *
 * Creates and initializes a Minion object
 * overrides the update function of GameObject to define
 * simple sprite animation behavior behavior
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteAnimateRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

Minion.kMoveDelta = 20;
Minion.kRotateDelta = 0.01;
Minion.kRotateLimit = 1.0; // Rad

function Minion(spriteTexture, atX, atY) {
    this.mRotDelta = Minion.kRotateDelta * Math.random();
    
    this.mMinion = new SpriteAnimateRenderable(spriteTexture);
    this.mMinion.setColor([1, 1, 1, 0]);
    this.mMinion.getXform().setPosition(atX, atY);
    this.mMinion.getXform().setSize(12, 9.6);
    this.mMinion.setSpriteSequence(512, 0,      // first element pixel position: top-left 512 is top of image, 0 is left of image
                                    204, 164,   // widthxheight in pixels
                                    5,          // number of elements in this sequence
                                    0);         // horizontal padding in between
    this.mMinion.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateSwing);
    this.mMinion.setAnimationSpeed(30);
                                // show each element for mAnimSpeed updates

    GameObject.call(this, this.mMinion);
    
    var r = new RigidCircle(this.getXform(), 4);
    var vx = Minion.kMoveDelta * (Math.random() - 0.5);
    var vy = Minion.kMoveDelta * (Math.random() - 0.5);
    r.setVelocity(vx, vy);
    
    this.getXform().setRotationInRad((Math.random()-0.5 * Minion.kRotateLimit));
    
    this.setRigidBody(r);
}
gEngine.Core.inheritPrototype(Minion, GameObject);

Minion.prototype.update = function (aCamera) {
    GameObject.prototype.update.call(this);
    // remember to update this.mMinion's animation
    this.mMinion.updateAnimation();
    
    var v = this.getRigidBody().getVelocity();
    var status = aCamera.collideWCBound(this.getXform(), 0.95);
    if (((status & BoundingBox.eboundCollideStatus.eCollideTop) !== 0) ||
        ((status & BoundingBox.eboundCollideStatus.eCollideBottom) !== 0) ) {
            v[1] *= -1;
    }
    if (((status & BoundingBox.eboundCollideStatus.eCollideRight) !== 0) ||
        ((status & BoundingBox.eboundCollideStatus.eCollideLeft) !== 0) ) {
        v[0] *= -1;
    }
    
    var r = this.getXform().getRotationInRad();
    if ((r > Minion.kRotateLimit) || (r < -Minion.kRotateLimit) )
        this.mRotDelta *= -1;    
    this.getXform().incRotationByRad(this.mRotDelta);
};