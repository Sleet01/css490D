/* File: PatrolWing.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine, GameObject, InterpolateVec2 */
/*global SpriteAnimateRenderable */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function PatrolWing(texture, mode, leader, vOffset) {
    this.mWidth = 10;
    this.mHeight = 8;
    this.kHOffset = 10;
    this.kVOffset = vOffset;
    this.kCycle = 120;
    this.kRate = 0.05;
    this.mAlpha = 0;
    this.mLeader = leader;
    this.mDead = false;
    
    // Set up SpriteRenderable to use passed location and size
//    var dims = [[0, 0, 204, 136],
//                [0, 375 , 204, 163]];
// Actual values are [xOrigin, *top of sprite from bottom*, width, height]
    var dims = [[0, 511, 204, 136],
                  [0, 348 , 204, 163]];
    var renderableObj = new SpriteAnimateRenderable(texture);
    var Xform = renderableObj.getXform();
    var lXform = leader.getXform();
    renderableObj.setColor([1, 1, 1, this.mAlpha]);
    renderableObj.setAnimationSpeed(12);
    renderableObj.setSpriteSequence( dims[mode][1], dims[mode][0], 
                                     dims[mode][2], dims[mode][3],
                                     5, 0);
    renderableObj.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateSwing);
    Xform.setPosition(lXform.getXPos() + this.kHOffset, lXform.getYPos() + this.kVOffset );
    Xform.setSize(this.mWidth, this.mHeight);
    
    // Set up the object
    GameObject.call(this, renderableObj);
    
    // Customize for PatrolWing functionality
    this.mController = new FollowController(this, 
                                            lXform.getXPos() + this.kHOffset, 
                                            lXform.getYPos() + this.kVOffset, 
                                            this.kCycle, this.kRate);

    this.mVisible = false;
    
        // Set up extent objects (LineRenderables based on this object's bounding box
    this.mExtents = [];
    var bbox = this.getBBox();
    this.mExtents.push(new LineRenderable(bbox.minX(), bbox.minY(), bbox.maxX(), bbox.minY()));
    this.mExtents.push(new LineRenderable(bbox.maxX(), bbox.minY(), bbox.maxX(), bbox.maxY()));
    this.mExtents.push(new LineRenderable(bbox.maxX(), bbox.maxY(), bbox.minX(), bbox.maxY()));
    this.mExtents.push(new LineRenderable(bbox.minX(), bbox.maxY(), bbox.minX(), bbox.minY()));
    for (var j = 0; j < this.mExtents.length; j++) {
            this.mExtents[j].setColor([1, 1, 1, 1]);
    }
}
gEngine.Core.inheritPrototype(PatrolWing, GameObject);

PatrolWing.prototype.update = function() {  
    
    if (this.mAlpha >= 1.0){
        this.mDead = true;
    } else {
        var lXform = this.mLeader.getXform();
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.W)) {
            this.activateHit();
        }
        this.mController.update(lXform.getXPos() + this.kHOffset, lXform.getYPos() + this.kVOffset);
        this.mRenderComponent.updateAnimation();
        this._updateExtents();
    }
};

PatrolWing.prototype.dead = function () { return this.mDead; };

// Return whether this object is collided with by the other object
PatrolWing.prototype.collides = function (oGameObject) {
  
    if (this.getBBox().intersectsBound(oGameObject.getBBox())){
        //this.activateHit();
        return true;
    }
    return false;
};

PatrolWing.prototype._updateExtents = function () {
    
    var bbox = this.getBBox();
    this.mExtents[0].setVertices(bbox.minX(), bbox.minY(), bbox.maxX(), bbox.minY());
    this.mExtents[1].setVertices(bbox.maxX(), bbox.minY(), bbox.maxX(), bbox.maxY());
    this.mExtents[2].setVertices(bbox.maxX(), bbox.maxY(), bbox.minX(), bbox.maxY());
    this.mExtents[3].setVertices(bbox.minX(), bbox.maxY(), bbox.minX(), bbox.minY());
    
};

PatrolWing.prototype.activateHit = function(){
    
    this.mAlpha += 0.2;
    this.mRenderComponent.setColor([1, 1, 1, this.mAlpha]);
};

PatrolWing.prototype.draw = function( aCamera ) {
    
    this.mRenderComponent.draw(aCamera);
    
    if(this.mVisible){
        for (var j = 0; j < this.mExtents.length; j++) {
            this.mExtents[j].draw( aCamera );
        }
    }
    
};
