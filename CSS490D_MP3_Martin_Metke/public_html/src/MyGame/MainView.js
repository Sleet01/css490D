/*
 * File: MainView.js 
 * Primary class for CSS490D mp3
 */

/*jslint node: true, vars: true */
/*global gEngine: false, Scene: false, Camera: false, vec2: false, FontRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MainView() {
    this.mCamera = null;
    this.mMsg = null;
    this.objects = [];
    this.mGLViewPort = [];
    
    //Test sprite textures
    this.kTestSprite = "assets/Bound.png";
}
gEngine.Core.inheritPrototype(MainView, Scene);

MainView.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kTestSprite);
};

MainView.prototype.unloadScene = function () {
    // will be called from GameLoop.stop
    gEngine.Textures.unloadTexture(this.kTestSprite);
        
    var nextLevel = new GameOver();  // next level to be loaded
    gEngine.Core.startScene(nextLevel);
};

MainView.prototype.initialize = function () {
    // Step A: set up the cameras
    // Set up this.MGLViewPort for camera resizing
    this.mGLViewPort = [0, 0, 
                        gEngine.Core.getGL().canvas.clientWidth,
                        gEngine.Core.getGL().canvas.clientHeight];

    this.mCamera = new Camera(
        vec2.fromValues(50, 33),   // position of the camera
        100,                       // width of camera
        this.mGLViewPort           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.9, 0.9, 0.9, 1]);
            // sets the background to gray

    //<editor-fold desc="Create the fonts!">
    //this.mText = new FontRenderable("This is green text");
//    this.mMsg = new FontRenderable("Game Over!");
//    this.mMsg.setColor([0, 0, 0, 1]);
//    this.mMsg.getXform().setPosition(22, 32);
//    this.mMsg.setTextHeight(10);
    //</editor-fold>
     
    // Array of objects
    var tempTR = new TextureRenderable(this.kTestSprite);
    tempTR.setColor([1, 1, 1, 0]);
    tempTR.getXform().setPosition(50, 25);
    tempTR.getXform().setSize(24, 19.2);
    // this.objects[0] = tempTR;
    this.objects[0] = new InteractiveBound(tempTR);
    //this.objects[0].getXform().setPosition([25, 33]);
    //this.objects[0].getXform().setSize(20,20);
    
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MainView.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    // Step  B: Activate the drawing Camera
    this.mCamera.setupViewProjection();
//    this.mMsg.draw(this.mCamera.getVPMatrix());
    this.objects[0].draw(this.mCamera.getVPMatrix());
};

// The update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MainView.prototype.update = function () {
    // grab the latest GL canvas size info and update camera size if necessary
    this.mGLViewPort = [0, 0, 
                        gEngine.Core.getGL().canvas.clientWidth,
                        gEngine.Core.getGL().canvas.clientHeight];
    var mCVP = this.mCamera.getViewport();
    if ((mCVP[2] !== this.mGLViewPort[2]) || (mCVP[3] !== this.mGLViewPort[3])){
        this.mCamera.setViewport(this.mGLViewPort);
    }
    
    
    
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)){
        //this.unloadScene();
        gEngine.GameLoop.stop();
    }
    
};