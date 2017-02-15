/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, LineRenderable,
  GameObject, DyePack, DyePackSet */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
    // The camera to view the scene
    this.mCamera = null;

    // Text output on-camera
    this.mMsg = null;

    this.mSpawnPatrols = false;
    
    // Create a backdrop object to fill the cameras
    this.mBackgroundObj = null;
    
    // Instantiate a new DyePackSet to track dyepacks; set its bounding box after
    // the main camera is instantiated.
    this.mDyePackSet = new DyePackSet( );
    this.mPatrolSet = new PatrolSet( );
    
    // Instantiate a new Hero after other entities are set up
    this.mHero = null;
    
    //Resources (sprite textures)
    this.kSpriteSheet = "assets/SpriteSheet.png";
    this.kDyeSprite = "assets/Dye_Yellow.png";
    this.kBackground = "assets/starfield.png";
}
gEngine.Core.inheritPrototype(MyGame, Scene);

/** @brief  Load resources needed for this 
 *  
 */
MyGame.prototype.loadScene = function () {
    // Load the 
    gEngine.Textures.loadTexture(this.kSpriteSheet);
    gEngine.Textures.loadTexture(this.kDyeSprite);
    gEngine.Textures.loadTexture(this.kBackground);
};

MyGame.prototype.unloadScene = function () {
    // will be called from GameLoop.stop
    gEngine.Textures.unloadTexture(this.kDyeSprite);
    gEngine.Textures.unloadTexture(this.kSpriteSheet);
    gEngine.Textures.unloadTexture(this.kBackground);
        
    gEngine.GameLoop.stop();
};

MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.mCamera = new Camera(
        vec2.fromValues(100, 75), // position of the camera
        200,                       // width of camera
        [0, 0, 800, 600]           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
            // sets the background to gray
    
    this.mBackgroundObj = new TextureRenderable(this.kBackground);
    this.mBackgroundObj.getXform().setSize(300, 150);
    this.mBackgroundObj.getXform().setPosition(100, 75);
    
    // Bounding box for the DyePackSet and PatrolSet to track bounds with
    var camBBox = new BoundingBox(
                             this.mCamera.getWCCenter(),
                             this.mCamera.getWCWidth(), 
                             this.mCamera.getWCHeight());
                             
    // Make the DyePackSet remove DyePacks that exit the main camera's bounds
    this.mDyePackSet.setBBox(camBBox);
    this.mPatrolSet.setBBox(camBBox);
    
    // Instantiate a new hero.  Give it the sprite sheet, the center position, and this game instance. 
    this.mHero = new Hero(this.kSpriteSheet, 
                          this.mCamera.getWCCenter(),
                          this);
    
    this.mMsg = new FontRenderable("Status Message");
    this.mMsg.setColor([1, 1, 1, 0.7]);
    this.mMsg.getXform().setPosition(10, 10);
    this.mMsg.setTextHeight(6);
    
    //this.mTestPatrolHead = new PatrolHead(this.kSpriteSheet, [75, 50], this);
    //this.mTestPatrolWing = new PatrolWing(this.kSpriteSheet, 0, this.mTestPatrolHead, -6, this);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    
    this.mBackgroundObj.draw(this.mCamera);
    this.mMsg.draw(this.mCamera);   // only draw status in the main camera
    this.mHero.draw(this.mCamera);
    this.mDyePackSet.draw(this.mCamera);
    this.mPatrolSet.draw(this.mCamera);

    //this.mTestPatrol.draw(this.mCamera);
    //this.mTestPatrolHead.draw(this.mCamera);
    //this.mTestPatrolWing.draw(this.mCamera);
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    var msg = "";
    var echo = "";
    var x, y;
    
    // We need the X/Y mouse coords
    x = this.mCamera.mouseWCX();
    y = this.mCamera.mouseWCY();
    echo += "[" + x.toPrecision(3) + " " + y.toPrecision(3) + "]";
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.C)) {
        var cWidth = this.mCamera.getWCWidth();
        var cHeight = this.mCamera.getWCHeight();
        this.mPatrolSet.addToSet( new Patrol(this.kSpriteSheet, 
                                [(Math.random() * (cWidth/2) + cWidth/2),
                                 (Math.random() * (cHeight/2) + cWidth/4)], this) );
    }
    
    msg = "DyePacks: " + this.mDyePackSet.size() + " ";
    msg += "|| Patrols: " + this.mPatrolSet.size() + " ";
    msg += echo;
    
    this.mHero.update(x, y);
    this.mDyePackSet.update();
    this.mPatrolSet.update();
    
    //this.mTestPatrolHead.update();
    //this.mTestPatrolWing.update();
    
    this.mMsg.setText(msg);
};