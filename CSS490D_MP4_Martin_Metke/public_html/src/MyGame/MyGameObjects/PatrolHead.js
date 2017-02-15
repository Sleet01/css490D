/* File: PatrolHead.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine, GameObject, InterpolateVec2 */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function PatrolHead(texture, center, game) {
    this.mWidth = 7.5;
    this.mHeight = 7.5;
    this.mDead = false;
    
    // Set up SpriteRenderable to use passed location and size
    var dims = [139, 5, 171, 171];
    var renderableObj = new SpriteRenderable(texture);
    var Xform = renderableObj.getXform();
    renderableObj.setElementPixelPositions(
               dims[0], dims[0] + dims[2], dims[1], dims[1] + dims[3]);
    renderableObj.setColor([1, 1, 1, 0]);
    Xform.setPosition(center[0], center[1]);
    Xform.setSize(this.mWidth, this.mHeight);
    
    // Set up the object
    GameObject.call(this, renderableObj);
    
    this.mGame = game;
    this.mCurrentFrontDir = vec2.normalize( this.mCurrentFrontDir, vec2.fromValues( 
                                Math.random(), Math.random() ) );
    this.mSpeed = (Math.random() * (10 - 5) + 5) / 60.0;    
    this.mHit = false;
    
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
gEngine.Core.inheritPrototype(PatrolHead, GameObject);

PatrolHead.prototype.update = function() {  
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.J)) {
        this.activateHit();
    }
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.R)) {
        this.reverse(2);
    }
    
    GameObject.prototype.update.call(this);
    this._updateExtents();
};

PatrolHead.prototype._updateExtents = function () {
    
    var bbox = this.getBBox();
    this.mExtents[0].setVertices(bbox.minX(), bbox.minY(), bbox.maxX(), bbox.minY());
    this.mExtents[1].setVertices(bbox.maxX(), bbox.minY(), bbox.maxX(), bbox.maxY());
    this.mExtents[2].setVertices(bbox.maxX(), bbox.maxY(), bbox.minX(), bbox.maxY());
    this.mExtents[3].setVertices(bbox.minX(), bbox.maxY(), bbox.minX(), bbox.minY());
    
};

PatrolHead.prototype.reverse = function ( rCase ) {
    
    switch (rCase) {
        case BoundingBox.eboundCollideStatus.eOutside:
        case BoundingBox.eboundCollideStatus.eInside:
            break;
        case BoundingBox.eboundCollideStatus.eCollideLeft:
        case BoundingBox.eboundCollideStatus.eCollideRight:
            this.setCurrentFrontDir(vec2.fromValues(-1 * this.mCurrentFrontDir[0], this.mCurrentFrontDir[1] ) );
            break;
        case BoundingBox.eboundCollideStatus.eCollideTop:
        case BoundingBox.eboundCollideStatus.eCollideBottom:    
            this.setCurrentFrontDir(vec2.fromValues(this.mCurrentFrontDir[0], -1 * this.mCurrentFrontDir[1] ) );
            break;
        default:
            this.setCurrentFrontDir(vec2.fromValues(-1 * this.mCurrentFrontDir[0], this.mCurrentFrontDir[1] ) );
            this.setCurrentFrontDir(vec2.fromValues(this.mCurrentFrontDir[0], -1 * this.mCurrentFrontDir[1] ) );
            break;
    }
};

PatrolHead.prototype.activateHit = function(){
    
    this.getXform().incXPosBy(5);
    
};

PatrolHead.prototype.draw = function( aCamera ) {
    
    this.mRenderComponent.draw(aCamera);
    
    if(this.mVisible){
        for (var j = 0; j < this.mExtents.length; j++) {
            this.mExtents[j].draw( aCamera );
        }
    }
    
};