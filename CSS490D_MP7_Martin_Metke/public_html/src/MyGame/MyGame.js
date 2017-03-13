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
    this.kSpriteDict = { Minion:"assets/minion_sprite.png",
                         Wall:"assets/wall.png",
                         Platform:"assets/platform.png",
                         Target:"assets/target.png"};
    this.kSceneFile = "assets/LevelOne.xml";
      
    // The camera to view the scene
    this.mCamera = null;

    this.mMsg = null;
    
    this.mAllObjs = null;
    this.mCollisionInfos = [];
    this.mDrawCollisions = false;
    this.mMarker = null;
    this.mFirstCreatedIndex = 0;
    this.mCurrentObj = 0;
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
 
    // Parse in all walls, floor, ceiling, platform
    this.mAllObjs = new GameObjectSet();
    sceneParser.parseFrame(this.mAllObjs, this.kSpriteDict);
    this.mFirstCreatedIndex = this.mAllObjs.size();
    
    // Initial controllable
    //this.mAllObjs.addToSet(new Minion(this.kSpriteDict["Minion"], 50, 50, true));
    //this.mAllObjs.addToSet(new Minion(this.kSpriteDict["Minion"], 50, 65, false));
//    this.mHero = new Hero(this.kSpriteDict["Minion"]);
//    
//    
//    this.mAllObjs.addToSet(this.mHero);
//    var y = 10;
//    var x = 10;
//    for (var i = 1; i<=5; i++) {
//        var m = new Minion(this.kSpriteDict["Minion"], x, y, ((i%2)!==0));
//        x += 20;
//        this.mAllObjs.addToSet(m);
//    }

    this.mMarker = new SpriteRenderable(this.kSpriteDict["Target"]);
    this.mMarker.setColor([1, 1, 1, 0]);
    this.mMarker.getXform().setSize(3, 3);

    this.mMsg = new FontRenderable("Status Message");
    this.mMsg.setColor([0, 0, 0, 1]);
    this.mMsg.getXform().setPosition(2, 5);
    this.mMsg.setTextHeight(3);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    
    this.mAllObjs.draw(this.mCamera);
    
    // Draw Collisions if desired
    if(this.mDrawCollisions){
        for (var i = 0; i<this.mCollisionInfos.length; i++) 
            this.mCollisionInfos[i].draw(this.mCamera);
    }
    this.mCollisionInfos = [];
    
    if (this.mCurrentObj !== 0){
        this.mMarker.draw(this.mCamera);
    }
    this.mMsg.draw(this.mCamera);   // only draw status in the main camera
};

MyGame.prototype.increaseShapeSize = function(obj, delta) {
    var s = obj.getRigidBody();
    var r = s.incShapeSizeBy(delta);
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.kBoundDelta = 0.1;
MyGame.prototype.update = function () {
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.C)){
        this.mDrawCollisions = !this.mDrawCollisions;
    }
    // Create new Rectangles (F) or Circles (G)
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.F)){
        var wcw = this.mCamera.getWCWidth();
        var wch = this.mCamera.getWCHeight();
        // Create new Rectangle at the top of the viewport
        this.mAllObjs.addToSet(
                new Minion(this.kSpriteDict["Minion"], 
                           Math.random() * ((wcw -5) - (5)) + (5),
                           Math.random() * ((wch - 10) - (wch - 30)) + (wch - 30), false));
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.G)){
        var wcw = this.mCamera.getWCWidth();
        var wch = this.mCamera.getWCHeight();
        // Create new Rectangle at the top of the viewport
        this.mAllObjs.addToSet(
                new Minion(this.kSpriteDict["Minion"], 
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
        this.increaseShapeSize(obj, MyGame.kBoundDelta);
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down) &&
            gEngine.Input.isKeyPressed(gEngine.Input.keys.Shift)) {
        this.increaseShapeSize(obj, -MyGame.kBoundDelta);
    }
    if ("keyControl" in obj){
        obj.keyControl();
    }
    
    this.mAllObjs.update(this.mCamera);
    
    if (this.mCurrentObj !== 0){
        var xfp = obj.getXform().getPosition();
        this.mMarker.getXform().setPosition(xfp[0], xfp[1]);
    }
    
    gEngine.Physics.processCollision(this.mAllObjs, this.mCollisionInfos);
    var objRB = obj.getRigidBody();
    msg += " M [I]: " + (1/objRB.mInvMass).toPrecision(2) + " [" + objRB.mInertia.toPrecision(2) + "] ";
    msg += " F= " + objRB.mFriction.toPrecision(2) + " R= " + objRB.mRestitution.toPrecision(2);
    this.mMsg.setText(msg);
};