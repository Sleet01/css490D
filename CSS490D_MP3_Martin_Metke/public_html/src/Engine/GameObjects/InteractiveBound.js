/* File: InteractiveBound.js 
 *
 * Inherits from GameObject
 * Sounded useful in class, so...
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function InteractiveBound(renderableObj) {
    GameObject.call(this, renderableObj);
}
gEngine.Core.inheritPrototype(InteractiveBound, GameObject);

InteractiveBound.prototype.getXform = function () { return this.mRenderComponent.getXform(); };

InteractiveBound.prototype.update = function () {};

InteractiveBound.prototype.getRenderable = function () { return this.mRenderComponent; };

InteractiveBound.prototype.draw = function (aCamera) {
    this.mRenderComponent.draw(aCamera);
};