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

    this.mMsg = null;

    this.mLineSet = [];
    this.mCurrentLine = null;
    this.mP1 = null;
    this.mGOSet = new GameObjectSet;
    
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
    this.mMsg.getXform().setPosition(-19, -8);
    this.mMsg.setTextHeight(3);
    
    // Set up SpriteRenderable to use passed location and size
    //    var dims = [[0, 0, 204, 136],
    //                [0, 375 , 204, 163]];
    // Actual values are [xOrigin, *top of sprite from bottom*, width, height]
    var dims = [[0, 511, 204, 136],
                  [0, 348 , 204, 163]];
    var renderableObj = new SpriteAnimateRenderable(this.kSpriteSheet);
    var Xform = renderableObj.getXform();
    renderableObj.setColor([1, 1, 1, 0]);
    renderableObj.setAnimationSpeed(12);
    renderableObj.setSpriteSequence( dims[0][1], dims[0][0], 
                                     dims[0][2], dims[0][3],
                                     5, 0);
    renderableObj.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateSwing);
    Xform.setPosition(50, 50);
    Xform.setSize(12, 9.6);
    
    var GO1 = new GameObject(renderableObj);
    this.mGOSet.addToSet( GO1 );
    this.regPhysObject( GO1 );
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
    
    for (var j = 0; j < this.mGOSet.size(); j++ ){
        this.mGOSet.getObjectAt(j).draw(this.mCamera);
    }
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    var msg = "Lines: " + this.mLineSet.length + " ";
    var echo = "";
    var x, y;

    if (gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Middle)) {
        var len = this.mLineSet.length;
        if (len > 0) {
            this.mCurrentLine = this.mLineSet[len - 1];
            x = this.mCamera.mouseWCX();
            y = this.mCamera.mouseWCY();
            echo += "Selected " + len + " ";
            echo += "[" + x.toPrecision(2) + " " + y.toPrecision(2) + "]";
            this.mCurrentLine.setFirstVertex(x, y);
        }
    }

    if (gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Left)) {
        x = this.mCamera.mouseWCX();
        y = this.mCamera.mouseWCY();
        echo += "[" + x.toPrecision(2) + " " + y.toPrecision(2) + "]";

        if (this.mCurrentLine === null) { // start a new one
            this.mCurrentLine = new LineRenderable();
            this.mCurrentLine.setFirstVertex(x, y);
            this.mLineSet.push(this.mCurrentLine);
        } else {
            this.mCurrentLine.setSecondVertex(x, y);
        }
    } else {
        this.mCurrentLine = null;
        this.mP1 = null;
    }

    this.mGOSet.update();

    msg += echo;
    this.mMsg.setText(msg);
};

MyGame.prototype.regPhysObject = function ( object ) {
    gEngine.Core.registerObject(object);
};