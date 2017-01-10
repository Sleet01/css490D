/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */
/*jslint node: true, vars: true */
/*global gEngine: false, SimpleShader: false, Renderable: false, Camera: false, mat4: false, vec3: false, vec2: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame(htmlCanvasID) {
    // variables of the constant color shader
    this.mConstColorShader = null;

    // variables for the squares
    this.mSquares = [];        // these are the Renderable objects
    this.mRedSq = null;

    // The camera to view the scene
    this.mCamera = null;

    // Initialize the webGL Context
    gEngine.Core.initializeEngineCore(htmlCanvasID);

    // Initialize the game
    this.initialize();
}

MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.mCamera = new Camera(
        vec2.fromValues(50, 50),   // position of the camera
        100,                        // width of camera
        [0, 0, 640, 480]         // viewport (orgX, orgY, width, height)
        );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
        // sets the background to gray

    // Step  B: create the shader
    this.mConstColorShader = new SimpleShader(
        "src/GLSLShaders/SimpleVS.glsl",      // Path to the VertexShader 
        "src/GLSLShaders/SimpleFS.glsl");    // Path to the Simple FragmentShader    

    // Step  C: Create the Renderable objects:
    this.mRedSq = new Box(this.mConstColorShader, [50,50]);
    this.mRedSq.setColor([1, 0, 0, 1]);

    // Step  D: Initialize the red Renderable object: centered 1x1
    // this.mRedSq.getXform().setPosition(50, 50);
    this.mRedSq.getXform().setSize(1, 1);
    
    // Step F: Start the game loop running
    gEngine.GameLoop.start(this);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    // Step  B: Activate the drawing Camera
    this.mCamera.setupViewProjection();

    // Step  C: Activate the Box shaders to draw
    for (var i = 0; i < this.mSquares.length; i++){
        this.mSquares[i].draw(this.mCamera.getVPMatrix());
    }
    this.mRedSq.draw(this.mCamera.getVPMatrix());
   
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    // For this very simple game, let's move the red square
    var redXform = this.mRedSq.getXform();
    var deltaX = 0.1;
    var deltaY = 0.1;

    // Step A: test for red square movement
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Right)) {
        if (redXform.getXPos() < 100) // this is the right-bound of the window
            redXform.incXPosBy(deltaX);
    }

    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Left)) {
        if (redXform.getXPos() > 0) // this is the left-bound of the window
            redXform.incXPosBy(-deltaX);
    }

    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up)) {
        if (redXform.getYPos() < (50 + (75/2))) // this is the top-bound of the window
            redXform.incYPosBy(deltaY);
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down)) {
        if (redXform.getYPos() > (50 - (75/2))) // this is the right-bound of the window
            redXform.incYPosBy(-deltaY);
    }    
    
    // Loop to create random number of random boxes randomly
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Space)){
        for ( var j = 0; j < (10 + Math.random()*10); j++ ){
            this.mSquares.push(new RandomBox(this.mConstColorShader, 
            [redXform.getXPos(), redXform.getYPos()]));
        }
        
    }
   
};

// Subclass Renderable to a box that takes a shader, center pos array.
// DO NOT make size and color part of the constructor if I want to subclass it
// again for random squares (which I do)
function Box(shader, centerPos){
    Renderable.call(this, shader);
    this.getXform().setPosition(centerPos[0], centerPos[1]);
};
Box.prototype = Object.create( Renderable.prototype );
Box.prototype.constructor = Box;


// Consider moving this to subclass files under MyGame.
function RandomBox(shader, centerPos){
    var mXOffset = (centerPos[0] - 5) + (Math.random() * 10);
    var mYOffset = (centerPos[1] - 5) + (Math.random() * 10);
    var mSize = 1 + Math.random() * 6; // 1~6
    var mRandRotation = 0.0 + Math.random() * 2 * 3.14159265359; // 0 ~ 2*Pi
    Box.call(this, shader, [mXOffset, mYOffset]);
    
    this.setColor(this.randomColorArray());
    
    var mXform = this.getXform();
    mXform.setSize(mSize, mSize);
    mXform.setRotationInRad(mRandRotation);
    
};
RandomBox.prototype = Object.create( Box.prototype );
RandomBox.prototype.constructor = RandomBox;
RandomBox.prototype.randomColorArray = function(){
    return [Math.random(), Math.random(), Math.random(), 1];
};