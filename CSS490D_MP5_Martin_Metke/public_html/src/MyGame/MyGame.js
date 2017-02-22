/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, LineRenderable, SpriteAnimateRenderable,
  GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
    // The camera to view the scene
    this.mCamera = null;
    this.mSelected = 0;
    this.mMsg = null;

    this.mGOSet = new GameObjectSet;
    
    this.kRadiusRate = 0.5;
    this.kSpriteSheet = "assets/SpriteSheet.png";
  
}
gEngine.Core.inheritPrototype(MyGame, Scene);

/** @brief  Load resources needed for this 
 *  
 */
MyGame.prototype.loadScene = function () {
    // Load the 
    gEngine.Textures.loadTexture(this.kSpriteSheet);
  
};

MyGame.prototype.unloadScene = function () {
    // will be called from GameLoop.stop
    gEngine.Textures.unloadTexture(this.kSpriteSheet);
        
    gEngine.GameLoop.stop();
};

MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.mCamera = new Camera(
        vec2.fromValues(50, 50), // position of the camera
        100,                       // width of camera
        [0, 0, 800, 600]           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
            // sets the background to gray

    this.mMsg = new FontRenderable("Status Message");
    this.mMsg.setColor([0, 0, 0, 1]);
    this.mMsg.getXform().setPosition(5, 15);
    this.mMsg.setTextHeight(3);
    
       
    var GO1 = new EnemyObject( this.kSpriteSheet );
    var GO2 = new EnemyObject( this.kSpriteSheet );
    this.mGOSet.addToSet( GO1 );
    this.mGOSet.addToSet( GO2 );
    this.regPhysObject( GO1 );
    this.regPhysObject( GO2 );
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    
    this.mMsg.draw(this.mCamera);   // only draw status in the main camera
    
    for (var j = 0; j < this.mGOSet.size(); j++ ){
        this.mGOSet.getObjectAt(j).draw(this.mCamera);
    }
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    var msg = "Selected object: " + this.mSelected + ", BRadius: " + this.mGOSet.getObjectAt(this.mSelected).getBRadius();
    var echo = "";
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.R )) {
        for (var r = 0; r < this.mGOSet.size(); r++ ){
            this.mGOSet.getObjectAt(r).reflect(this.mCamera);
        }
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left )) {
        var nextIndex = (this.mSelected - 1);
        this.mSelected = ( nextIndex >= 0) ? nextIndex : this.mGOSet.size() + nextIndex; 
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right )) {
        this.mSelected = (this.mSelected + 1) % this.mGOSet.size(); 
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Up )) {
        this.mGOSet.getObjectAt(this.mSelected).incBRadiusBy(this.kRadiusRate); 
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Down )) {
        this.mGOSet.getObjectAt(this.mSelected).incBRadiusBy(-this.kRadiusRate); 
    }


    this.mGOSet.update(this.mCamera);

    msg += echo;
    this.mMsg.setText(msg);
};

MyGame.prototype.regPhysObject = function ( object ) {
    gEngine.Core.registerObject(object);
};