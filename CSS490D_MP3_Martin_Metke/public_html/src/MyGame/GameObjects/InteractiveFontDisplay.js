/* File: InteractiveFontDisplay.js 
 *
 * Inherits from InteractiveObject
 * A generalized font display mainly used for debugging; 
 * extended by InteractiveBoundDisplay
 */

/*jslint node: true, vars: true */
/*global gEngine: false, InteractiveObject: false, FontRenderable: false*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

/**@brief   A moveable text object that can be updated on the fly and moved around
 * 
 * @param {string} message
 * @returns {InteractiveFontDisplay}
 */
function InteractiveFontDisplay(message) {
    this.mText = message;
    this.mMsg = new FontRenderable(this.mText);
    // Call the superclass with the compiled message
    InteractiveObject.call(this, this.mMsg);
    
    this.mMsg.setColor([0, 0, 0, 1]);
    this.setPosition(10, 15);
    this.mMsg.setTextHeight(2);

}
gEngine.Core.inheritPrototype(InteractiveFontDisplay, InteractiveObject);

InteractiveFontDisplay.prototype.update = function () {

    this.mRenderComponent.setText(this.mText);

};

// Let other objects set our status any time.
InteractiveFontDisplay.prototype.setMessage = function(message){
    this.mText = message;
};

// Draw the TextureRenderable; additionally, if set, draw the animation frames
InteractiveFontDisplay.prototype.draw = function (aCameraVPM) {
    this.mRenderComponent.draw(aCameraVPM);
};