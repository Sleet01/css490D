/* File: Patrol.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine, GameObject, InterpolateVec2 */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Patrol(texture, center, game) {
    
    this.mDead = false;
    // Store the game scene for later member access
    this.mGame = game;
    
    // Instantiate the entities of this patrol.
    this.kWingOffset = 6;
    this.mEntities = [];
    this.mEntities.push(this.mHead = new PatrolHead(texture, center, game));
    this.mEntities.push(new PatrolWing(texture, 0, this.mHead, this.kWingOffset, game));
    this.mEntities.push(new PatrolWing(texture, 1, this.mHead, -this.kWingOffset, game));
    
    // Get this patrol's extents, based off of member entities
    this.mWidth = this._getPatrolWidth();
    this.mHeight = this._getPatrolHeight();
    this.mCenter = this._getPatrolCenter();
    
    // Customize for Patrol functionality
    
    // Set up the bounding box that this patrol will use, via a basic Renderable
    var renderable = new Renderable();
    renderable.setColor([0,0,0,0]);
    renderable.getXform().setSize(this.mWidth, this.mHeight);
    GameObject.call(renderable);
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
gEngine.Core.inheritPrototype(Patrol, GameObject);

// Handle some key clicks, manage sub-entities, check for OOB.
Patrol.prototype.update = function() {  
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.B)) {
        this.setVisibility(!this.getVisibility());
        for (var i = 0; i < this.mEntities.length; i++){
            this.mEntities[i].setVisibilty(this.mVisible);
        }
    }    
    
    // Check if we're dead (only possible if a wing was shot off)
    for (var i = 0; i < this.mEntities.length; i++){
        this.mEntities[i].update();
        if ( this.mEntities[i].dead() ){
            this.mDead = true;
        }
    }
    
    this.mWidth = this._getPatrolWidth();
    this.mHeight = this._getPatrolHeight();
    this.mCenter = this._getPatrolCenter();
    this._updateExtents();
    
};

// Must be called after mWidth, mHeight are set
Patrol.prototype._updateExtents = function () {
    
    var bbox = this.getBBox();
    this.mExtents[0].setVertices(bbox.minX(), bbox.minY(), bbox.maxX(), bbox.minY());
    this.mExtents[1].setVertices(bbox.maxX(), bbox.minY(), bbox.maxX(), bbox.maxY());
    this.mExtents[2].setVertices(bbox.maxX(), bbox.maxY(), bbox.minX(), bbox.maxY());
    this.mExtents[3].setVertices(bbox.minX(), bbox.maxY(), bbox.minX(), bbox.minY());
    
};

// This will likely need to be updated to be more performant.
// Running this set of functions 60 times a second... the body shudders.
// This function requires mWidth and mHeight to be updated.
Patrol.prototype.getPatrolCenter = function () {
    
    var x, y = 0;
    x = this.mWidth/2 + this.mEntities[0].getBBox().minX();
    
    // Figure out what the minimum Y value of the patrol members' bboxes is.
    if (this.mEntities.length > 0){
        
        var bbox = null;
        var Ymin = Number.MAX_SAFE_INTEGER;
        var bMinY = 0;
        
        for (var i = 0; i < this.mEntities.length; i++ ){
            bbox = this.mEntities[i].getBBox();
            bMinY = bbox.minY();
            Ymin = ((bMinY < Ymin) ? bMinY : Ymin);
        }
        
        y = this.mHeight/2 + Ymin;
    }
    
    return [x, y];
};

Patrol.prototype.getWidth = function () {
    return this.mWidth;
};

Patrol.prototype.getHeight = function () {
    return this.mHeight;
};

Patrol.prototype._getPatrolWidth = function () {
  
    var width = 0;
    
    if (this.mEntities.length > 0){
        
        var bbox = null;
        var Xmax = 0;
        var Xmin = Number.MAX_SAFE_INTEGER;
        var bMinX = 0;
        var bMaxX = 0;
        
        for (var i = 0; i < this.mEntities.length; i++ ){
            bbox = this.mEntities[i].getBBox();
            bMinX = bbox.minX();
            bMaxX = bbox.maxX();
            Xmax = ((bMaxX > Xmax) ? bMaxX : Xmax);
            Xmin = ((bMinX < Xmin) ? bMinX : Xmin);
        }
        
        width = Xmax - Xmin;
    }
    
    return width;
};

// Probably should just roll all of these into one massive updateGeometry function
Patrol.prototype._getPatrolHeight = function () {
  
    var height = 0;
    
    if (this.mEntities.length > 0){
        
        var bbox = null;
        var Ymax = 0;
        var Ymin = Number.MAX_SAFE_INTEGER;
        var bMinY = 0;
        var bMaxY = 0;
        
        for (var i = 0; i < this.mEntities.length; i++ ){
            bbox = this.mEntities[i].getBBox();
            bMinY = bbox.minY();
            bMaxY = bbox.maxY();
            Ymax = ((bMaxY > Ymax) ? bMaxY : Ymax);
            Ymin = ((bMinY < Ymin) ? bMinY : Ymin);
        }
        
        height = Ymax - Ymin;
    }
    
    return height * 1.5;
};

Patrol.prototype.reverse = function ( bbox ) {
    
    this.mEntities[0].reverse(bbox.boundCollideStatus(this.getBBox()));
    
};

Patrol.prototype.activateHit = function () {
    
    for (var i = 0; i < this.mEntities.length; i++){
        this.mEntities[i].activateHit();
    }
};


Patrol.prototype.draw = function(aCamera){
    
    for (var i = 0; i < this.mEntities.length; i++){
        this.mEntities[i].draw(aCamera);
    }
    
    if(this.mVisible){
        for (var j = 0; j < this.mExtents.length; j++) {
            this.mExtents[j].draw();
        }
    }
    
};