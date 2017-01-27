/* File: SpriteSource.js 
 *
 * Inherits from GameObject
 * Sounded useful in class, so...
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function SpriteSource(renderableObj) {
    GameObject.call(this, renderableObj);
}
gEngine.Core.inheritPrototype(SpriteSource, GameObject);

SpriteSource.prototype.getXform = function () { return this.mRenderComponent.getXform(); };

SpriteSource.prototype.update = function () {};

SpriteSource.prototype.getRenderable = function () { return this.mRenderComponent; };

SpriteSource.prototype.draw = function (aCamera) {
    this.mRenderComponent.draw(aCamera);
};