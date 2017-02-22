/* File: HeroObject.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, SpriteAnimateRenderable, GameObject, gEngine */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function HeroObject(texture) {
        
    this.kWidth = 9;
    this.kHeight = 12;
    this.kMDelta = 10/60.0;
    this.kRDelta = Math.PI * 2 / 3 / 60;
    // Set up the object with its RigidShape
    GameObject.call(this, this.initRenderable(texture), new RigidRectangle());
    
}
gEngine.Core.inheritPrototype(HeroObject, GameObject);

// Encapsulates RenderableObject initialization.  Requires kWidth, kHeight be set first.
HeroObject.prototype.initRenderable = function (texture) {
    // Set up renderable
     // Set up SpriteRenderable to use passed location and size
    var dims = [5, 5, 116, 172];
    var renderableObj = new SpriteRenderable(texture);
    var Xform = renderableObj.getXform();
    renderableObj.setElementPixelPositions(
               dims[0], dims[0] + dims[2], dims[1], dims[1] + dims[3]);
    renderableObj.setColor([1, 1, 1, 0]);
    Xform.setPosition(50, 37.5);
    Xform.setSize(this.kWidth, this.kHeight);
       
    return renderableObj;
};

// Handles increasing/decreasing the Bounding Radius
HeroObject.prototype.incBRadiusBy = function (delta){
    this.mPhysicsComponent.incBRadiusBy(delta);
};

// Pass-through function to return this HeroObject's Bounding Radius (strictly for readout)
HeroObject.prototype.getBRadius = function () { return this.mPhysicsComponent.getBRadius(); };

// Checks for a collision with the main camera's bounds; reverse directions
// up to once every half-second in each axis if colliding.
HeroObject.prototype.collideWCBound = function (aCamera){
    
    var OOB = aCamera.collideWCBound(this.getXform(), 1.0 );
    
    switch (OOB) {
        case BoundingBox.eboundCollideStatus.eOutside:
        case BoundingBox.eboundCollideStatus.eInside:
            break;
        case BoundingBox.eboundCollideStatus.eCollideLeft:
        case BoundingBox.eboundCollideStatus.eCollideRight:
            
            break;
        case BoundingBox.eboundCollideStatus.eCollideTop:
        case BoundingBox.eboundCollideStatus.eCollideBottom:    
            
            break;
        default:
            
            break;
    }
    
};

// Update function takes a Camera strictly for world-bound checking.
// Can operate fine without it.
HeroObject.prototype.update = function ( aCamera ) {
    
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.T)){
        this.setVisibility(!this.isVisible());
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.W)){
        this.mPhysicsComponent.incYPosBy(this.kMDelta);
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.S)){
        this.mPhysicsComponent.incYPosBy(-this.kMDelta);
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.A)){
        this.mPhysicsComponent.incXPosBy(-this.kMDelta);
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.D)){
        this.mPhysicsComponent.incXPosBy(this.kMDelta);
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.Z)){
        this.mPhysicsComponent.incRotationBy(this.kRDelta);
    }
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.X)){
        this.mPhysicsComponent.incRotationBy(-this.kRDelta);
    }
    
//    if ( aCamera !== undefined) {
//        this.collideWCBound(aCamera);
//    }
    
    GameObject.prototype.update.call(this);
       
};
