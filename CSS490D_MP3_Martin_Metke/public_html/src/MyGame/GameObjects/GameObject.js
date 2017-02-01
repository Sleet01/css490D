/* File: GameObject.js 
 *
 * Abstracts a game object's behavior and appearance
 * Sounded useful in class, so...
 */

/*jslint node: true, vars: true */
/*global  */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!
/**@brief   Borrowed from a later gEngine version.  Base class for various specific-use classes
 * 
 * @param {renderable} renderableObj
 * @returns {GameObject}
 */
function GameObject(renderableObj) {
    this.mRenderComponent = renderableObj;
}

GameObject.prototype.getXform = function () { return this.mRenderComponent.getXform(); };

GameObject.prototype.update = function () {};

GameObject.prototype.getRenderable = function () { return this.mRenderComponent; };

GameObject.prototype.draw = function (aCameraVPM) {
    this.mRenderComponent.draw(aCameraVPM);
};



