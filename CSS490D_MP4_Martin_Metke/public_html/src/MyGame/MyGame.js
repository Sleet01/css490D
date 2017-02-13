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

    this.mMsg = null;

    this.mLineSet = [];
    this.mCurrentLine = null;
    this.mP1 = null;
    
    this.mDyePackSet = new DyePackSet();
    
    //Resources (sprite textures)
    this.kSpriteSheet = "assets/SpriteSheet.png";
    this.kDyeSprite = "assets/Dye_Yellow.png";
}
gEngine.Core.inheritPrototype(MyGame, Scene);

/** @brief  Load resources needed for this 
 *  
 */
MyGame.prototype.loadScene = function () {
    // Load the 
    gEngine.Textures.loadTexture(this.kSpriteSheet);
    gEngine.Textures.loadTexture(this.kDyeSprite);
};

MyGame.prototype.unloadScene = function () {
    // will be called from GameLoop.stop
    gEngine.Textures.unloadTexture(this.kDyeSprite);
    gEngine.Textures.unloadTexture(this.kSpriteSheet);
        
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

    this.mMsg = new FontRenderable("Status Message");
    this.mMsg.setColor([0, 0, 0, 1]);
    this.mMsg.getXform().setPosition(10, 10);
    this.mMsg.setTextHeight(6);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    var i, l;
    for (i = 0; i < this.mLineSet.length; i++) {
        l = this.mLineSet[i];
        l.draw(this.mCamera);
    }
    this.mMsg.draw(this.mCamera);   // only draw status in the main camera
    this.mDyePackSet.draw(this.mCamera);
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    var msg = "DyePacks: " + this.mDyePackSet.size() + " ";
    var echo = "";
    var x, y;

    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Space)) {
//        var len = this.mLineSet.length;
//        if (len > 0) {
//            this.mCurrentLine = this.mLineSet[len - 1];
//            x = this.mCamera.mouseWCX();
//            y = this.mCamera.mouseWCY();
//            echo += "Selected " + len + " ";
//            echo += "[" + x.toPrecision(2) + " " + y.toPrecision(2) + "]";
//            this.mCurrentLine.setFirstVertex(x, y);
//        }
        x = this.mCamera.mouseWCX();
        y = this.mCamera.mouseWCY();
        echo += "[" + x.toPrecision(2) + " " + y.toPrecision(2) + "]";
        
        // Instantiate a new dyepack
        var newDyePack = new DyePack(new TextureRenderable( this.kDyeSprite ));
        newDyePack.getXform().setPosition(this.mCamera.mouseWCX(), this.mCamera.mouseWCY());
        newDyePack.getXform().setSize(2, 3.5);
        this.mDyePackSet.addToSet(newDyePack);
    }
    
    this.mDyePackSet.update();
    
    this.mMsg.setText(msg);
};