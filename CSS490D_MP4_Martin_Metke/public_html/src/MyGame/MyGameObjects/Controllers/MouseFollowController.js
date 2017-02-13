/* File: MouseFollowController.js 
 *
 * Extends DefaultController.js
 * Abstracts a game object's animated behavior: follow the mouse
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, DefaultController, gEngine*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

// This controller gets a single game object that it is responsible for moving,
// resizing.  Calls to update cause operations on the object's Transform or Renderable
// Specifically, this controller causes an object to follow the mouse at a give rate
function MouseFollowController(gameObject, x, y, cycle, rate) {
    DefaultController.call(this, gameObject);
    this.mWidth = gameObject.getXform().getWidth();
    this.mHeight = gameObject.getXform().getHeight();
    this.mTarget = vec2.fromValues(x, y);
    this.mInterpolator = new InterpolateVec2( this.mTarget, cycle, rate);
}
gEngine.Core.inheritPrototype(MouseFollowController, DefaultController);

// Pass new mouse coordinates in, get either A) new interpolator, B) update to current
// Interpolator, or C) remove interpolator (stop following until next update)
MouseFollowController.prototype.update = function ( x, y ) {
    
    var Xform = this.mGO.getXform();
    // If we have removed our interpolator, never been assigned one, or are now
    // tracking to a new (x, y) coordinate, make a new Interpolator!
    if (this.mInterpolator === null || 
            (x !== this.mTarget[0] || y !== this.mTarget[1])){
        this.mTarget = vec2.fromValues(x, y);
        this.mInterpolator = new InterpolateVec2(
                            vec2.fromValues(Xform.getXPos(), Xform.getYPos()), 
                            120, 0.05);
        this.mInterpolator.setFinalValue(vec2.fromValues(x, y));    
    }
    // We now have a new interpolators, or are already equipped with one, so
    // get its next position value.
    this.mInterpolator.updateInterpolation();
    var nextPos = this.mInterpolator.getValue();
    
    // Don't let the Hero leave the screen, though.
    var screenBBox = this.mGO.mGame.mDyePackSet.getBBox();
    if (screenBBox.containsPoint(nextPos[0] + this.mWidth/2, nextPos[1]) &&
        screenBBox.containsPoint(nextPos[0] - this.mWidth/2, nextPos[1]) &&
        screenBBox.containsPoint(nextPos[0], nextPos[1] + this.mHeight/2) &&
        screenBBox.containsPoint(nextPos[0], nextPos[1] - this.mHeight/2)) { 
        
        Xform.setPosition(nextPos[0], nextPos[1]);
    }
    else{
        this.mInterpolator = null;
    }
    // If we've arrived, remove the controller
    if (Xform.getXPos() === this.mTarget[0] && Xform.getYPos() === this.mTarget[1]){
        this.mInterpolator = null;
    }
};