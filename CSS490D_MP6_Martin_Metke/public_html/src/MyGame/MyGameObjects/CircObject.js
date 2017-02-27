/* File: CircObject.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, SpriteAnimateRenderable, GameObject, gEngine */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function CircObject(x, y, texture) {
    
    
    this.kWidth = 12;
    this.kHeight = 9.6;
    this.kRRadius = 8;
    
    // Set up the object with its RigidShape
    GameObject.call(this, x, y, this.initRenderable(texture), new RigidCircle());
    
    // Enemy-specific configuration
    this.mPhysicsComponent.setBRadius(this.kRRadius);
    this.mPhysicsComponent.setRRadius(this.kRRadius);
    //this.mPhysicsComponent.setSpeed(20/60);
    //this.mPhysicsComponent.setRotationRate(0.6/60);
    
    var xDir = (Math.random() > 0.5) ? Math.random() : -1 * Math.random();
    var yDir = (Math.random() > 0.5) ? Math.random() : -1 * Math.random();
    
    this.mPhysicsComponent.setCurrentFrontDir(vec2.fromValues(xDir, yDir));
    
}
gEngine.Core.inheritPrototype(CircObject, GameObject);

// Encapsulates RenderableObject initialization.  Requires kWidth, kHeight be set first.
CircObject.prototype.initRenderable = function (texture) {
    // Set up renderable
    var dims = [[0, 511, 204, 136],
                  [0, 348 , 204, 163]];
    var renderableObj = new SpriteAnimateRenderable(texture);
    var Xform = renderableObj.getXform();
    renderableObj.setColor([1, 1, 1, 0]);
    renderableObj.setAnimationSpeed(12);
    renderableObj.setSpriteSequence( dims[0][1], dims[0][0], 
                                     dims[0][2], dims[0][3],
                                     5, 0);
    renderableObj.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateSwing);
    Xform.setPosition( (Math.random()*(100 - this.kWidth*2) + this.kWidth), 
                       (Math.random() * (75 - this.kHeight*2) + this.kHeight));
    Xform.setSize(this.kWidth, this.kHeight);
    
    return renderableObj;
};

// Handles increasing/decreasing the Bounding Radius
CircObject.prototype.incBRadiusBy = function (delta){
    this.mPhysicsComponent.incBRadiusBy(delta);
};

// Pass-through function to return this CircObject's Bounding Radius (strictly for readout)
CircObject.prototype.getBRadius = function () { return this.mPhysicsComponent.getBRadius(); };

// Update function takes a Camera strictly for world-bound checking.
// Can operate fine without it.
CircObject.prototype.update = function ( aCamera ) {
    
    this.mRenderComponent.updateAnimation();
   
    GameObject.prototype.update.call(this);
    
    if (Math.abs(this.mPhysicsComponent.getRotation()) > 1){
        this.mPhysicsComponent.reverseRotation();
    }
   
};