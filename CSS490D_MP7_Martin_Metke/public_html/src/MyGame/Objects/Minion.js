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

function Minion(spriteTexture, atX, atY, createCircle) {
    this.kDelta = 0.3;
    
    this.mMinion = new SpriteAnimateRenderable(spriteTexture);
    this.mMinion.setColor([1, 1, 1, 0]);
    this.mMinion.getXform().setPosition(atX, atY);
    this.mMinion.getXform().setSize(Math.random() * (8 - 2) + 2, Math.random() * (7.4 - 2.4 ) + 2.4);
    this.mMinion.setSpriteSequence(512, 0,      // first element pixel position: top-left 512 is top of image, 0 is left of image
                                    204, 164,   // widthxheight in pixels
                                    5,          // number of elements in this sequence
                                    0);         // horizontal padding in between
    this.mMinion.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateSwing);
    this.mMinion.setAnimationSpeed(30);
                                // show each element for mAnimSpeed updates

    GameObject.call(this, this.mMinion);
    
    var r;
    var xf = this.getXform();
    if (createCircle){
        var rad = (Math.random()*(10.8 - 3.8) + 3.8)/2;
        xf.setWidth(24*rad/15);
        xf.setHeight(6 * rad / 5);
        r = new RigidCircle(xf, rad);
    }
    else
        r = new RigidRectangle(xf, xf.getWidth() , xf.getHeight());
    this.setRigidBody(r);
    this.toggleDrawRenderable();
}
gEngine.Core.inheritPrototype(Minion, WASDObj);

Minion.prototype.update = function (aCamera) {
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.H)){
        var dt = gEngine.GameLoop.getUpdateIntervalInSeconds();
        var manualImpulse = vec2.fromValues(Math.floor(Math.random() * (41) - 21), 
            Math.floor(Math.random() * (41) - 21));
        //vec2.scale(manualImpulse, manualImpulse, dt)
        vec2.add(this.getRigidBody().mVelocity, this.getRigidBody().mVelocity, manualImpulse);
    }
    
    GameObject.prototype.update.call(this);
    // remember to update this.mMinion's animation
    this.mMinion.updateAnimation();
};