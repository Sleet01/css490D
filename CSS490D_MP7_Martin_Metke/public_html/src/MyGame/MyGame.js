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
    this.mMarker = null;    
    this.mCurrentObj = 26;
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
 
    this.mAllObjs = new GameObjectSet();
    sceneParser.parseFrame(this.mAllObjs, this.kSpriteDict);
    
    this.mAllObjs.addToSet(new Minion(this.kSpriteDict["Minion"], 50, 50, true));
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
    
    // for now draw these ...
    for (var i = 0; i<this.mCollisionInfos.length; i++) 
        this.mCollisionInfos[i].draw(this.mCamera);
    this.mCollisionInfos = [];
    
    this.mMarker.draw(this.mCamera);
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
    
    var msg = "Num: " + this.mAllObjs.size() + " Current=" + this.mCurrentObj;   
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right)) {
        this.mCurrentObj = (this.mCurrentObj + 1) % (this.mAllObjs.size());
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left)) {
        this.mCurrentObj = (this.mCurrentObj - 1);
        if (this.mCurrentObj < 0)
            this.mCurrentObj = (this.mAllObjs.size() - 1);
    }
    var obj = this.mAllObjs.getObjectAt(this.mCurrentObj);    
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up)) {
        this.increaseShapeSize(obj, MyGame.kBoundDelta);
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down)) {
        this.increaseShapeSize(obj, -MyGame.kBoundDelta);
    }
    if ("keyControl" in obj){
        obj.keyControl();
    }
    
    this.mAllObjs.update(this.mCamera);
    var xfp = obj.getXform().getPosition();
    this.mMarker.getXform().setPosition(xfp[0], xfp[1]);

    gEngine.Physics.processCollision(this.mAllObjs, this.mCollisionInfos);

    msg += " R=" + obj.getRigidBody().getBoundRadius();
    this.mMsg.setText(msg);
};