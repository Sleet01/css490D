/* File: GameObject.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function GameObject(renderableObj, physics = null) {
    this.mRenderComponent = renderableObj;
    this.mXform = renderableObj.getXform();
    this.mVisible = false;
    // New abstracted physics representation; default to RigidShape normally
    this.mPhysicsComponent = physics;
    if (physics !== null){
        this.mPhysicsComponent.register(this);
    }
}

GameObject.prototype.getXform = function () { return this.mXform; };
GameObject.prototype.getPhysicsComponent = function () { return this.mPhysicsComponent; };

GameObject.prototype.setVisibility = function (f) { this.mVisible = f; };
GameObject.prototype.isVisible = function () { return this.mVisible; };

GameObject.prototype.setSpeed = function (s) { 
    if ( this.mPhysicsComponent !== null ) {
        this.mPhysicsComponent.setSpeed(s);
    } 
};

GameObject.prototype.getSpeed = function () { return (this.mPhysicsComponent === null) ? null : this.mPhysicsComponent.getSpeed(); };
GameObject.prototype.incSpeedBy = function (delta) { 
    if(this.mPhysicsComponent !== null ){
        this.mPhysicsComponent.incSpeedBy(delta);
    } 
};

GameObject.prototype.setCurrentFrontDir = function (f) { 
    if(this.mPhysicsComponent !== null ){
        this.mPhysicsComponent.setCurrentFrontDir(f);
    } 
};

GameObject.prototype.getCenter = function () { return (this.mPhysicsComponent === null) ? null : this.mPhysicsComponent.getCenter(); };
GameObject.prototype.getCurrentFrontDir = function () { return (this.mPhysicsComponent === null) ? null : this.mPhysicsComponent.getCurrentFrontDir(); };

GameObject.prototype.getRenderable = function () { return this.mRenderComponent; };

// Pass-through functions for bound tests
GameObject.prototype.boundTest = function ( oObject ) { return (this.mPhysicsComponent === null) ? null : this.mPhysicsComponent.boundTest( oObject ); };
GameObject.prototype.collisionTest = function ( oObject, collisionInfo ) { 
    return (this.mPhysicsComponent === null) ? null : this.mPhysicsComponent.collisionTest( oObject, collisionInfo ); 
};

// Pass-through functions for reflection
GameObject.prototype.reflect = function (aObject) {
    this.mPhysicsComponent.reflect(aObject);
};

GameObject.prototype.reflectX = function () { 
    if(this.mPhysicsComponent !== null ){
        this.mPhysicsComponent.reflectX();
    } 
};

GameObject.prototype.reflectY = function () { 
    if(this.mPhysicsComponent !== null ){
        this.mPhysicsComponent.reflectX();
    } 
};

// Orientate the entire object to point towards point p
// will rotate Xform() accordingly
GameObject.prototype.rotateObjPointTo = function (p, rate) {
    /** TO DO: move into RigidShape */
    if (this.mPhysicsComponent !== null){
        this.mPhysicsComponent.rotateObjPointTo(p, rate);
    }
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
    this.mPhysicsComponent.draw(aCamera);
};