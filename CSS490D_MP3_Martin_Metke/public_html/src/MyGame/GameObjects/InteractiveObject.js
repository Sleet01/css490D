/* File: InteractiveObject.js 
 *
 * Inherits from GameObject
 * An object that takes a set of inputs and moves around.
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function InteractiveObject(renderableObj) {
    GameObject.call(this, renderableObj);
}
gEngine.Core.inheritPrototype(InteractiveObject, GameObject);

InteractiveObject.prototype.getXform = function () { return this.mRenderComponent.getXform(); };

// Allow subclasses to have their position set more easily.
InteractiveObject.prototype.setPosition = function (xPos, yPos) {

    this.getXform().setPosition(xPos, yPos);

};

InteractiveObject.prototype.update = function () {
    
};

InteractiveObject.prototype.getRenderable = function () { return this.mRenderComponent; };

InteractiveObject.prototype.draw = function (aCameraVPM) {
    this.mRenderComponent.draw(aCameraVPM);
};