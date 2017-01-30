/* File: InteractiveBoundDisplay.js 
 *
 * Inherits from InteractiveObject
 * This is a specific InteractiveObject which displays a bounding box
 * and can move around.  It also reports its computed sprite animation info
 * based on its size, and will return (U,V) or (pixelx, pixely) coordinates.
 */

/*jslint node: true, vars: true */
/*global gEngine: false, InteractiveFontDisplay: false, FontRenderable: false*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

/* InteractiveBoundDisplay takes status, which is composed into its font object message
 */
function InteractiveBoundDisplay(status = [0.0, 0.0, 0.0, 0.0], xPos=10, yPos=15) {
    this.mStatus = status;
    this.mText = 'Status:Bound Pos=(' + this.mStatus[0].toPrecision(4) +
                ', ' + this.mStatus[1].toPrecision(4) + ') Size=(' +
                this.mStatus[2].toPrecision(4) + ', ' +
                this.mStatus[3].toPrecision(4) + ')';
    // Call the superclass with the compiled message
    InteractiveFontDisplay.call(this, this.mText);
    this.setPosition(xPos, yPos);
}
gEngine.Core.inheritPrototype(InteractiveBoundDisplay, InteractiveFontDisplay);

InteractiveBoundDisplay.prototype.update = function () {

    this.mText = 'Status:Bound Pos=(' + this.mStatus[0].toPrecision(4) +
                ', ' + this.mStatus[1].toPrecision(4) + ') Size=(' +
                this.mStatus[2].toPrecision(4) + ', ' +
                this.mStatus[3].toPrecision(4) + ')';
    this.mRenderComponent.setText(this.mText);

};

// Let other objects set our status any time.
InteractiveBoundDisplay.prototype.setData = function(status){
    this.mStatus = status;
};