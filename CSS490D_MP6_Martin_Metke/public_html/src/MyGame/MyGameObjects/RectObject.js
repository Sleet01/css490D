/* File: RectObject.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, SpriteAnimateRenderable, GameObject, gEngine */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function RectObject(x, y, texture) {
    
    this.kWidth = 15;
    this.kHeight = 15;
    
    // Set up the object with its RigidShape
    GameObject.call(this, x, y, 
                    this.initRenderable(texture), 
                    new RigidRectangle(null, this.kWidth, this.kHeight));
    
}
gEngine.Core.inheritPrototype(RectObject, GameObject);

// Encapsulates RenderableObject initialization.  Requires kWidth, kHeight be set first.
RectObject.prototype.initRenderable = function (texture) {
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
RectObject.prototype.incBRadiusBy = function (delta){
    this.mPhysicsComponent.incBRadiusBy(delta);
};

// Pass-through function to return this RectObject's Bounding Radius (strictly for readout)
RectObject.prototype.getBRadius = function () { return this.mPhysicsComponent.getBRadius(); };

// Update function takes a Camera strictly for world-bound checking.
// Can operate fine without it.
RectObject.prototype.update = function ( aCamera ) {
  
//    if ( aCamera !== undefined) {
//        this.collideWCBound(aCamera);
//    }
    
    GameObject.prototype.update.call(this);
       
};
