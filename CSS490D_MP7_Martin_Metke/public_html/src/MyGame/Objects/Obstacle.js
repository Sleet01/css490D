/* File: Obstacle.js 
 *
 * Creates and initializes a Obstacle object
 * overrides the update function of GameObject to define
 * simple sprite animation behavior behavior
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteAnimateRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Obstacle(spriteTexture, size, atX, atY, createCircle) {
        
    this.mObstacle = new SpriteRenderable(spriteTexture);
    this.mObstacle.setColor([1, 1, 1, 0]);
    this.mObstacle.getXform().setPosition(atX, atY);
    this.mObstacle.getXform().setSize(size[0], size[1]);
        
                                // show each element for mAnimSpeed updates

    GameObject.call(this, this.mObstacle);
    
    var r;
    if (createCircle)
        r = new RigidCircle(this.getXform(), sqrt(size[0]^2 + size[1]^2)); 
    else
        r = new RigidRectangle(this.getXform(), size[0], size[1]);
    this.setRigidBody(r);
    // Turn off renderable
    this.toggleDrawRenderable();
}
gEngine.Core.inheritPrototype(Obstacle, GameObject);

Obstacle.prototype.update = function (aCamera) {
    GameObject.prototype.update.call(this);  
};