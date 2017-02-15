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
    this.mReverseStates = {};
        
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
    GameObject.call(this, renderable);
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
    
    // Check if we're dead (only possible if a wing was shot off)
    for (var i = 0; i < this.mEntities.length; i++){
        this.mEntities[i].update();
        if ( this.mEntities[i].dead() ){
            this.mDead = true;
            break;
        }
    }
    
    // Check our patrol's size
    this.mWidth = this._getPatrolWidth();
    this.mHeight = this._getPatrolHeight();
    this.mCenter = this._getPatrolCenter();
    
    // Re-center the BBox around the patrol members
    var Xform = this.getXform();
    Xform.setSize(this.mWidth, this.mHeight);
    Xform.setPosition(this.mCenter[0], this.mCenter[1]);
    
    // Update the lines
    this._updateExtents();
    
};

Patrol.prototype.dead = function () { return this.mDead; };

// Set Visibility (that is, turn on or off the BBox bound lines).
Patrol.prototype.setVisibility = function ( f ) {
  
    if (f !== this.mVisible){
      
        this.mVisible = f;
      
        for (var i = 0; i < this.mEntities.length; i++ ) {
            this.mEntities[i].setVisibility(f);
        }
    }
    
};

// Actually prosecute a collision between another object and a member of this patrol
Patrol.prototype.collide = function (oGameObject) {
    
    for ( var i = 0; i < this.mEntities.length; i++){
        if (this.mEntities[i].collides(oGameObject)){
            this.mEntities[i].activateHit();
            break;
        }
    }
};

// Check if any member of the patrol collides with the passed object
Patrol.prototype.collides = function (oGameObject) {
    
    var result = false;
    
    for ( var i = 0; i < this.mEntities.length; i++){
        if (this.mEntities[i].collides(oGameObject)){
            result = true;
            break;
        }
    }
    
    return result;
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
Patrol.prototype._getPatrolCenter = function () {
    
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

// Calculate the total width of this patrol, for BBox sizing
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

// Reverse away from a BBox edge
Patrol.prototype.reverse = function ( bbox ) {
    
    var reverseSide = bbox.boundCollideStatus(this.getBBox());
    
    // Only execute a reverse if this Patrol is not already reversing on the specified
    // side.
    if (!(this.mReverseStates.hasOwnProperty(reverseSide.toString()))){
        this.mEntities[0].reverse(reverseSide);
        this.mReverseStates[reverseSide.toString()] = 'true';
    }
    
};

// Remove all stored Reverse-holds
Patrol.prototype.clearReverse = function ( ) {
    
    this.mReverseStates = {};
    
};

// ActivateHit on all entities.  Currently only does anything to Wings.
Patrol.prototype.activateHit = function () {
    
    for (var i = 0; i < this.mEntities.length; i++){
        this.mEntities[i].activateHit();
    }
};

// Draw objects in this Patrol.  Also, draw BBox bounds if turned to visible
Patrol.prototype.draw = function(aCamera){
    
    for (var i = 0; i < this.mEntities.length; i++){
        this.mEntities[i].draw(aCamera);
    }
    
    if(this.mVisible){
        for (var j = 0; j < this.mExtents.length; j++) {
            this.mExtents[j].draw(aCamera);
        }
    }
    
};