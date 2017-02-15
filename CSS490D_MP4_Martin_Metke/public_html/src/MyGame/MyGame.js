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

    // Zoomed-view sub-cameras
    this.mZoomCams = null;

    // Text output on-camera
    this.mMsg = null;

    // Random spawn-time setup.
    this.mSpawnPatrols = false;
    this.mTTSpawn = Math.floor((Math.random() * (180 - 120) + 120));
    
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
    this.kBackground = "assets/starfield.png";
}
gEngine.Core.inheritPrototype(MyGame, Scene);

/** @brief  Load resources needed for this 
 *  
 */
MyGame.prototype.loadScene = function () {
    // Load the 
    gEngine.Textures.loadTexture(this.kSpriteSheet);
    gEngine.Textures.loadTexture(this.kBackground);
};

MyGame.prototype.unloadScene = function () {
    // will be called from GameLoop.stop
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
    
    // Instantiate a new hero.  Give it the sprite sheet and the center position. 
    this.mHero = new Hero(this.kSpriteSheet, 
                          this.mCamera.getWCCenter(),
                          this.mDyePackSet);
    
    //Set up the ZoomCams and register the hero
    this.mZoomCams = new SecondaryCameraSet(this.mHero, this.mCamera.getWCCenter(), 
                                            [0, 800, 800, 600], 
                                            this.mBackgroundObj,
                                            this);
    
    // Create link to let the Hero and DyePackSet register hit DyePacks
    this.mHero.setZoomCams(this.mZoomCams);
    
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

    // Main view drawing phase
    this.mCamera.setupViewProjection();
    
    this.mBackgroundObj.draw(this.mCamera);
    this.mMsg.draw(this.mCamera);   // only draw status in the main camera
    this.mDyePackSet.draw(this.mCamera);
    this.mPatrolSet.draw(this.mCamera);
    this.mHero.draw(this.mCamera);
    
    // Tell the SecondaryCameraSet to draw (iff its cameras are active)
    this.mZoomCams.draw();

};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    var msg = "";
    var echo = "";
    var cWidth = this.mCamera.getWCWidth();
    var cHeight = this.mCamera.getWCHeight();
    var x, y;
    
    // We need the X/Y mouse coords
    x = this.mCamera.mouseWCX();
    y = this.mCamera.mouseWCY();
    echo += "[" + x.toPrecision(3) + " " + y.toPrecision(3) + "]";
    
    // Spawn a new Patrol if "C" is pressed
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.C)) {
        this.mPatrolSet.addToSet( new Patrol(this.kSpriteSheet, 
                                [(Math.random() * (cWidth/2 - 15) + (cWidth/2)),
                                 (Math.random() * (cHeight/2) + cWidth/4)], this) );
    }
    
    // Toggle auto-spawning of patrols
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.P)) {
        this.mSpawnPatrols = !this.mSpawnPatrols;
    }
    
    // If auto-spawning is on, check if countdown has reached 0;
    // if so, spawn a new patrol and reset the clock.
    if ( this.mSpawnPatrols ) {
        
        if ( this.mTTSpawn === 0) {
            this.mPatrolSet.addToSet( new Patrol(this.kSpriteSheet, 
                                [(Math.random() * (cWidth/2 - 15) + (cWidth/2)),
                                 (Math.random() * (cHeight/2) + cWidth/4)], this) );
            this.mTTSpawn = Math.floor((Math.random() * (180 - 120) + 120));
        }
        else{
            this.mTTSpawn -= 1;
        }
        
    }
    
    // Status message construction
    msg = "DyePacks: " + this.mDyePackSet.size() + " ";
    msg += "|| Patrols: " + this.mPatrolSet.size() + " ";
    msg += ((this.mSpawnPatrols ) ? " || AutoSpawn: on (" + (this.mTTSpawn/60).toFixed(1) +")" : " || AutoSpawn: off ");
    
    // Update hero and object sets
    this.mHero.update(x, y);
    this.mDyePackSet.update();
    this.mPatrolSet.update();
    this.mZoomCams.update();
    
    // The big kahuna: collision checking.
    for (var i = 0; i < this.mPatrolSet.size(); i++){
        
        var cPatrol = this.mPatrolSet.getObjectAt(i);
        
        for (var j = 0; j < this.mDyePackSet.size(); j++ ){
            this.mDyePackSet.getObjectAt(j).collide(cPatrol);
        }
        
        this.mHero.collide(cPatrol);
        
    }
    
    this.mMsg.setText(msg);
};