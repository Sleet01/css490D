/* File: SizeBounceController.js 
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
function SizeBounceController(gameObject, xAmp, yAmp, freq, frames) {
    DefaultController.call(this, gameObject);
    this.mXform = gameObject.getXform();
    this.mWidthOrig = this.mXform.getWidth();
    this.mHeightOrig = this.mXform.getHeight();
    this.mAmps = [xAmp, yAmp];
    this.mRates = [freq, frames];
    this.mInterpolator = new ShakePosition(xAmp, yAmp, freq, frames);
    this.mDone = false;
}
gEngine.Core.inheritPrototype(SizeBounceController, DefaultController);

//Every update gets a new set of size modifications, which are applied to the supplied
//entity's transform.  Only update if this controller is not done with its damped
//harmonic function.
SizeBounceController.prototype.update = function () {
    
    if (!this.mDone){
          
        if (this.mInterpolator.shakeDone()){
            this.mDone = true;
            this.mXform.setSize(this.mWidthOrig, this.mHeightOrig);
        }
        else{
            var aDXDY = this.mInterpolator.getShakeResults();
            this.mXform.setSize(this.mWidthOrig + aDXDY[0],
                                this.mHeightOrig + aDXDY[1]);
        }
        
    } else {
        if (this.mInterpolator !== null){
            this.mInterpolator = null;
        }
    }
};

SizeBounceController.prototype.getDone = function () {
    return this.mDone;
};

SizeBounceController.prototype.stop = function () {
    this.mDone = true;
};

// Restart with the original Amplitude and Rate values
SizeBounceController.prototype.restart = function () {
    this.mDone = false;
    this.mInterpolator = new ShakePosition(this.mAmps[0], this.mAmps[1],
                                           this.mRates[0], this.mRates[1]);
    
};