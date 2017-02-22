/* File: EnemyObject.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, SpriteAnimateRenderable, GameObject, gEngine */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function EnemyObject(texture) {
    
    //BBox collision tracking
    this.xCollision = 0;
    this.yCollision = 0;
    this.kCollisionTimeout = 30;
    
    this.kWidth = 12;
    this.kHeight = 9.6;
    this.kRRadius = 4;
    
    // Set up the object with its RigidShape
    GameObject.call(this, this.initRenderable(texture), new RigidCircle());
    
    // Enemy-specific configuration
    this.mPhysicsComponent.setBRadius(this.kRRadius);
    this.mPhysicsComponent.setRRadius(this.kRRadius);
    this.mPhysicsComponent.setSpeed(20/60);
    this.mPhysicsComponent.setRotationRate(0.6/60);
    
    var xDir = (Math.random() > 0.5) ? Math.random() : -1 * Math.random();
    var yDir = (Math.random() > 0.5) ? Math.random() : -1 * Math.random();
    var angle = vec2.fromValues(1, 0);
    
    this.mPhysicsComponent.setCurrentFrontDir(vec2.fromValues(xDir, yDir));
    this.mOriginalAngle = vec2.dot( angle, this.mPhysicsComponent.getCurrentFrontDir());
    
}
gEngine.Core.inheritPrototype(EnemyObject, GameObject);

// Encapsulates RenderableObject initialization.  Requires kWidth, kHeight be set first.
EnemyObject.prototype.initRenderable = function (texture) {
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
EnemyObject.prototype.incBRadiusBy = function (delta){
    this.mPhysicsComponent.incBRadiusBy(delta);
};

EnemyObject.prototype.getBRadius = function () { return this.mPhysicsComponent.getBRadius(); };

// Checks for a collision with the main camera's bounds; reverse directions
// up to once every half-second in each axis if colliding.
EnemyObject.prototype.collideWCBound = function (aCamera){
    
    var OOB = aCamera.collideWCBound(this.getXform(), .99 );
    
    switch (OOB) {
        case BoundingBox.eboundCollideStatus.eOutside:
        case BoundingBox.eboundCollideStatus.eInside:
            break;
        case BoundingBox.eboundCollideStatus.eCollideLeft:
        case BoundingBox.eboundCollideStatus.eCollideRight:
            if (this.xCollision === 0){
                this.mPhysicsComponent.reflectX();
                this.xCollision = this.kCollisionTimeout;
            }
            break;
        case BoundingBox.eboundCollideStatus.eCollideTop:
        case BoundingBox.eboundCollideStatus.eCollideBottom:    
            if (this.yCollision === 0){
                this.mPhysicsComponent.reflectY();
                this.yCollision = this.kCollisionTimeout;
            }
            break;
        default:
            if (this.xCollision === 0){
                this.mPhysicsComponent.reflectX();
                this.xCollision = this.kCollisionTimeout;
            }
            if (this.yCollision === 0){
                this.mPhysicsComponent.reflectY();
                this.yCollision = this.kCollisionTimeout;
            }
            break;
    }
    
};

EnemyObject.prototype.countdownCollisions = function () {
    if (this.xCollision !== 0){
        this.xCollision--;
    }
    if (this.yCollision !== 0){
        this.yCollision--;
    }
};

EnemyObject.prototype.update = function ( aCamera ) {
    
    if ( aCamera !== undefined) {
        this.collideWCBound(aCamera);
        this.countdownCollisions();
    }
    GameObject.prototype.update.call(this);
    
};
