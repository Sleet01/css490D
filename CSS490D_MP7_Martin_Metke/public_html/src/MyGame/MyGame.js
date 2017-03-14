/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, LineRenderable,
  GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
    this.kSpriteDict = { ActiveObject:"assets/minion_sprite.png",
                         Wall:"assets/wall.png",
                         Platform:"assets/platform.png",
                         Target:"assets/target.png"};
    this.kSceneFile = "assets/LevelOne.xml";
      
    // The camera to view the scene
    this.mCamera = null;

    this.mAllObjs = null;
    this.mCollisionInfos = [];
    this.mDrawCollisions = false;
    this.mMarker = null;
    this.mFirstCreatedIndex = 0;
    this.mCurrentObj = 0;
    
    // Extra credit: *Naive* spatial partitioning
    this.mUseSP = true;
    this.kSPCount = 4;
    this.mSPCells = [];
    this.mSPSets = [];
    this.mDebugSP = false;
}
gEngine.Core.inheritPrototype(MyGame, Scene);


MyGame.prototype.loadScene = function () {
    // Load all sprites
    for(var key in this.kSpriteDict){
        if (this.kSpriteDict.hasOwnProperty(key)) {
            gEngine.Textures.loadTexture(this.kSpriteDict[key]);
        }
    }
    gEngine.TextFileLoader.loadTextFile(this.kSceneFile, gEngine.TextFileLoader.eTextFileType.eXMLFile);
};

MyGame.prototype.unloadScene = function () {
    // Unload all sprites
    for(var key in this.kSpriteDict){
        if (this.kSpriteDict.hasOwnProperty(key)) {
            gEngine.Textures.unloadTexture(this.kSpriteDict[key]);
        }
    }
    gEngine.TextFileLoader.unloadTextFile(this.kSceneFile);
};

MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    var sceneParser = new xmlSceneFileParser(this.kSceneFile);
    this.mCamera = sceneParser.parseCamera();
 
    // Parse in all walls, floors, ceilings, platforms
    this.mAllObjs = new GameObjectSet();
    sceneParser.parseFrame(this.mAllObjs, this.kSpriteDict);
    this.mFirstCreatedIndex = this.mAllObjs.size();
    
    // Create marker to identify selected object (if any)
    this.mMarker = new SpriteRenderable(this.kSpriteDict["Target"]);
    this.mMarker.setColor([1, 1, 1, 0]);
    this.mMarker.getXform().setSize(3, 3);

    // Set up output message.  
    gUpdateFrame("Initializing...");
    gUpdateObject(0);
//    Did you know that FontRenderables consumes massive amounts of CPU time?
//    this.mMsg = new FontRenderable("Status Message");
//    this.mMsg.setColor([0, 0, 0, 1]);
//    this.mMsg.getXform().setPosition(2, 5);
//    this.mMsg.setTextHeight(3);
  
    // Initialize the spatial partitions with the loaded-in scenery
    this.initializePartitions();
};

// Spatial Partition requires more prep than N x N collision checks, but offers
// higher performance.
MyGame.prototype.initializePartitions = function () {
    // First, partition visible area into this.kSPCount full-height cells
    //console.log("Initializing partitions...");
    
    var camHeight, camWidth;
    var camPos = this.mCamera.getWCCenter();
    camHeight = this.mCamera.getWCHeight();
    camWidth = this.mCamera.getWCWidth();
    var cellHeight = camHeight;
    var cellWidth = camWidth / this.kSPCount;
    
    // Create kSPCount # of cells and their matching GameObjectSets
    var xPos, yPos;
    for (var i = 0; i < this.kSPCount; i++){
        //console.log("Initializing Bounding Box # " + i.toString());
        // camX + 1/2 of a cell width + i * cell width
        xPos = (camPos[0] - (camWidth / 2)) + (cellWidth / 2) + (i * cellWidth);
        yPos = camPos[1];
        this.mSPCells.push(new BoundingBox([xPos, yPos], cellWidth, cellHeight));
        this.mSPSets.push(new GameObjectSet());
    }
    
    // Assign the existing scenery to cells
    this.updateSPCells(0, this.mAllObjs.size());
    
};

MyGame.prototype.updateSPCells = function (start, end){
    // Used for comparing total checks
    var count = 0;
    
    // We need to know how each object and bbox relate to each other.
    var obj, bbox, result;
    var index;
    for (var i = start; i < end; i++){
        obj = this.mAllObjs.getObjectAt(i);
        bbox = obj.getBBox();
        for (var j = 0; j < this.mSPCells.length; j++){
            //console.log("SPCell #: " + j.toString() + ", Length: " + this.mSPSets[j].size().toString());
            result = this.mSPCells[j].boundCollideStatus(bbox);
            count++;
            // 1. If the object is fully within the current cell, it cannot be within
            //    another cell.  Remove it from any other cells it might have been in.
            //    Then go to next object, skipping all other cells
            if (result === BoundingBox.eboundCollideStatus.eInside){
                for (var r = 0; r < this.mSPCells.length; r++){
                    index = this.mSPSets[r].getIndexOf(obj);
                    // If obj is found in another set, remove it.
                    if (r !== j && index !== -1 )
                        this.mSPSets[r].removeIndex(index);
                    // If obj is *not* found in *this* set, remove it.
                    if (r === j && index === -1 )
                        this.mSPSets[r].addToSet(obj);
                }
                // No need to check if this object is touching any other cells
                break;
            }
            // 1. But if it is outside this cell, check its internal-ness.  If it was inside,
            //    remove it.  Otherwise, continue to the next cell
            else if (result === BoundingBox.eboundCollideStatus.eOutside){
                index = this.mSPSets[j].getIndexOf(obj);  // Somehow I forgot this check for ~8 hours
                if ( index !== -1)                        // and it broke everything.
                    this.mSPSets[j].removeIndex(index);
                continue;
            }
            // Finally, if the object is touching but not fully contained in this cell,
            // add it to this cell's set and go to the next cell.  The object may be
            // touching two cells, or may just be sticking out past the camera's view.
            else {
                index = this.mSPSets[j].getIndexOf(obj);
                if (index === -1)
                    this.mSPSets[j].addToSet(obj);
            }
        }
    }
    
    // Used for comparison of All v All collisions, vs spatial partitions.
    return count;
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    
    // Turn on rendering of Spatial Partitioning cells
    if (this.mUseSP){
              
        var myLine = new LineRenderable(0, 0, 0, 0);
        myLine.setColor([0, 1, 0.796, 1]);
        
        // Draw each BBox from its lower-left corner, to lower-right, to upper-right,
        // to upper-left, and back.
        var bbox;
        for (var i = 0; i < this.mSPCells.length; i++ ){
            bbox = this.mSPCells[i];
            myLine.setVertices(bbox.mLL[0], bbox.mLL[1], bbox.mLL[0] + bbox.mWidth, bbox.mLL[1]);
            myLine.draw(this.mCamera);
            myLine.setVertices(bbox.mLL[0] + bbox.mWidth, bbox.mLL[1], bbox.mLL[0] + bbox.mWidth, bbox.mLL[1] + bbox.mHeight);
            myLine.draw(this.mCamera);
            myLine.setVertices(bbox.mLL[0] + bbox.mWidth, bbox.mLL[1]  + bbox.mHeight, bbox.mLL[0], bbox.mLL[1] + bbox.mHeight);
            myLine.draw(this.mCamera);
            myLine.setVertices(bbox.mLL[0], bbox.mLL[1] + bbox.mHeight, bbox.mLL[0], bbox.mLL[1]);
            myLine.draw(this.mCamera);
        }
        
    }
    
    // mAllObjs is sufficient for drawing; no need to partition the visual aspects
    this.mAllObjs.draw(this.mCamera);
    
    // Draw Collisions if desired
    console.log("Current CollisionInfo count: " + this.mCollisionInfos.length.toString());
    if(this.mDrawCollisions){
        for (var i = 0; i<this.mCollisionInfos.length; i++) 
            this.mCollisionInfos[i].draw(this.mCamera);
    }
    this.mCollisionInfos = [];
    
    if (this.mCurrentObj !== 0){
        this.mMarker.draw(this.mCamera);
    }
};

MyGame.prototype.increaseShapeSize = function(obj, delta) {
    var xf = obj.getXform();
    xf.incSizeBy(delta);
    var s = obj.getRigidBody();
    var r = s.incShapeSizeBy(delta);
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.kBoundDelta = 0.1;
MyGame.prototype.update = function () {
    // Clear mCollisionInfos every update; should leave only one set at draw time
    this.mCollisionInfos = [];
    // Used to output collision checks (all v all vs partitioned)
    var totalCollisionChecks = 0;
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.C)){
        this.mDrawCollisions = !this.mDrawCollisions;
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.One)){
        this.mDebugSP = !this.mDebugSP;
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Four)){
        this.mUseSP = !this.mUseSP;
    }
    // Create new Rectangles (F) or Circles (G)
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.F)){
        var wcw = this.mCamera.getWCWidth();
        var wch = this.mCamera.getWCHeight();
        // Create new Rectangle at the top of the viewport
        this.mAllObjs.addToSet(
                new ActiveObject(this.kSpriteDict["ActiveObject"], 
                           Math.random() * ((wcw -5) - (5)) + (5),
                           Math.random() * ((wch - 10) - (wch - 30)) + (wch - 30), false));
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.G)){
        var wcw = this.mCamera.getWCWidth();
        var wch = this.mCamera.getWCHeight();
        // Create new Rectangle at the top of the viewport
        this.mAllObjs.addToSet(
                new ActiveObject(this.kSpriteDict["ActiveObject"],
                           Math.random() * ((wcw -5) - (5)) + (5),
                           Math.random() * ((wch - 10) - (wch - 30)) + (wch - 30), true));
    }
    
    // For unselecting prep - if an object is selected, it is no longer subject
    // to automatic physics updates.  Unselecting it puts it back in play
    var obj = this.mAllObjs.getObjectAt(this.mCurrentObj);
    var msg = "P: " + ((gEngine.Physics.getPositionalCorrection()) ? "On " : "Off"); 
    msg += " V: " + ((gEngine.Physics.getSystemMovement()) ? "On " : "Off");   
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.P)){
        gEngine.Physics.togglePositionalCorrection();
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.V)){
        gEngine.Physics.toggleSystemMovement();
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Zero)){
        obj.unselect();
        this.mCurrentObj = 0;
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right)) {
        // Scenery is loaded first.
        this.mCurrentObj = (((this.mCurrentObj + 1 < this.mAllObjs.size()) &&
                             (this.mCurrentObj >= this.mFirstCreatedIndex)) ? 
                                this.mCurrentObj + 1 : this.mFirstCreatedIndex); 
        obj.unselect();
    } // mFCI = 26; size = 27; mFCI = last index; 27 = 26
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left)) {
        this.mCurrentObj = (this.mCurrentObj - 1);
        if (this.mCurrentObj < this.mFirstCreatedIndex)
            this.mCurrentObj = (this.mAllObjs.size() - 1);
        obj.unselect();
    }
    
    // Select the requested object, so that is only moves under user input
    if (this.mCurrentObj !== 0){
        obj = this.mAllObjs.getObjectAt(this.mCurrentObj);
        if(!obj.isSelected()){
            obj.select();
        }
    }
    // Increase / decrease Collision Bound of object
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up) && 
            gEngine.Input.isKeyPressed(gEngine.Input.keys.Shift)) {
        if(obj.isSelected())
            this.increaseShapeSize(obj, MyGame.kBoundDelta);
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down) &&
            gEngine.Input.isKeyPressed(gEngine.Input.keys.Shift)) {
        if(obj.isSelected())
            this.increaseShapeSize(obj, -MyGame.kBoundDelta);
    }
    // Only some objects (extending WASDObj) have keyControl function.
    // Only call keyControl if it is a member of the object or its prototype.
    if ("keyControl" in obj){
        obj.keyControl();
    }
    
    // Update all objects.
    this.mAllObjs.update(this.mCamera);
    
    // Ensure that the marker tracks its selected object, if one is selected
    if (this.mCurrentObj !== 0){
        var xfp = obj.getXform().getPosition();
        this.mMarker.getXform().setPosition(xfp[0], xfp[1]);
    }
    
    // This is where spatial partitioning will happen.
    if (this.mUseSP){
        // Step 1: process the contents of each SP cell separately.
        // The SP Cell setup *should* allow for objects to cross borders without
        // significantly slowing processing.
        for (var p = 0; p < this.mSPCells.length; p++){
            totalCollisionChecks += gEngine.Physics.processCollision(this.mSPSets[p], this.mCollisionInfos);
        }
        // Step 2: process new cell membership.
        // Here we cheat a little and only check objects that may move.
        totalCollisionChecks += this.updateSPCells(this.mFirstCreatedIndex, this.mAllObjs.size() );
        
    }else {
        totalCollisionChecks += gEngine.Physics.processCollision(this.mAllObjs, this.mCollisionInfos);
    }
    
    // Finally, update msg with info about the selected object, if one is selected
    // (We cheat here and output object 0's info if nothing else is selected.
    // Output to gUpdateFrame.
    var objRB = obj.getRigidBody();
    msg += " M [I]: " + (1/objRB.mInvMass).toPrecision(2) + " [" + objRB.mInertia.toPrecision(2) + "] ";
    msg += " F= " + objRB.mFriction.toPrecision(2) + " R= " + objRB.mRestitution.toPrecision(2);
    gUpdateFrame(msg);
    gUpdateObject(totalCollisionChecks);
};