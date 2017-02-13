/* File: DefaultController.js 
 *
 * Abstracts a game object's animated behavior
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

// This controller gets a single game object that is responsible for moving,
// resizing.  Calls to update cause operations on the object's Transform or Renderable
function DefaultController(gameObject) {
    this.mGO = gameObject;
    
}

DefaultController.prototype.update = function () {
    
};