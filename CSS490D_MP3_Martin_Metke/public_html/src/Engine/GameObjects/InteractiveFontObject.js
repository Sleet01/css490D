/* File: InteractiveFontObject.js 
 *
 * Inherits from InteractiveObject
 * This is a specific InteractiveObject which displays a bounding box
 * and can move around.  It also reports its computed sprite animation info
 * based on its size, and will return (U,V) or (pixelx, pixely) coordinates.
 */

/*jslint node: true, vars: true */
/*global gEngine: false, InteractiveObject: false, FontRenderable: false*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

/* InteractiveFontObject takes a renderableObj (which had better be a TextureRenderable)
 */
function InteractiveFontObject(status = [0.0, 0.0, 0.0, 0.0]) {
    this.mStatus = status;
    this.mText = 'Status:Bound Pos=(' + this.mStatus[0].toPrecision(4) +
                ', ' + this.mStatus[1].toPrecision(4) + ') Size=(' +
                this.mStatus[2].toPrecision(4) + ', ' +
                this.mStatus[3].toPrecision(4) + ')';
    this.mMsg = new FontRenderable(this.mText);
    InteractiveObject.call(this, this.mMsg);
    
    this.mMsg.setColor([0, 0, 0, 1]);
    this.mMsg.getXform().setPosition(10, 10);
    this.mMsg.setTextHeight(1);

}
gEngine.Core.inheritPrototype(InteractiveFontObject, InteractiveObject);

InteractiveFontObject.prototype.update = function () {

    this.mText = 'Status:Bound Pos=(' + this.mStatus[0].toPrecision(4) +
                ', ' + this.mStatus[1].toPrecision(4) + ') Size=(' +
                this.mStatus[2].toPrecision(4) + ', ' +
                this.mStatus[3].toPrecision(4) + ')';
    this.mRenderComponent.setText(this.mText);

};

// Let other objects set our status any time.
InteractiveFontObject.prototype.setData = function(status){
    this.mStatus = status;
};

// Draw the TextureRenderable; additionally, if set, draw the animation frames
InteractiveFontObject.prototype.draw = function (aCameraVPM) {
    this.mRenderComponent.draw(aCameraVPM);
};