/* File: GameObject.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function GameObject(renderableObj, physics) {
    this.mRenderComponent = renderableObj;
    this.mXform = renderableObj.getXform();
    this.mBBox = new BoundingBox(this.mXform.getPosition(), this.mXform.getWidth(), this.mXform.getHeight());
    this.mVisible = true;
    // New abstracted physics representation; default to DefaultPhysics normally
    this.mPhysicsComponent = (typeof physics !== 'undefined') ? physics : new DefaultPhysics();
    this.mPhysicsComponent.register(this);
}

GameObject.prototype.getXform = function () { return this.mXform; };
GameObject.prototype.getBBox = function () { return this.mXform.getBBox(); };

GameObject.prototype.setVisibility = function (f) { this.mVisible = f; };
GameObject.prototype.isVisible = function () { return this.mVisible; };

GameObject.prototype.setSpeed = function (s) { this.mPhysicsComponent.setSpeed(s); };
GameObject.prototype.getSpeed = function () { return this.mPhysicsComponent.getSpeed(); };
GameObject.prototype.incSpeedBy = function (delta) { this.mPhysicsComponent.incSpeedBy(delta); };

GameObject.prototype.setCurrentFrontDir = function (f) { this.mPhysicsComponent.setCurrentFrontDir(f); };
GameObject.prototype.getCurrentFrontDir = function () { return this.mPhysicsComponent.getCurrentFrontDir(); };

GameObject.prototype.getRenderable = function () { return this.mRenderComponent; };

// Orientate the entire object to point towards point p
// will rotate Xform() accordingly
GameObject.prototype.rotateObjPointTo = function (p, rate) {
    /** TO DO: move into DefaultPhysics */
    
    this.mPhysicsComponent.rotateObjPointTo(p, rate);
};

GameObject.prototype.reflect = function () {
    this.mPhysicsComponent.reflect();
};

GameObject.prototype.update = function () {
    // simple default behavior
    if (this.mPhysicsComponent !== null) {
        this.mPhysicsComponent.update();
    }
};

GameObject.prototype.draw = function (aCamera) {
    if (this.isVisible()) {
        this.mRenderComponent.draw(aCamera);
    }
    if (this.mBBox.getVisibility()) {
        this.mBBox.draw(aCamera);
    }
};