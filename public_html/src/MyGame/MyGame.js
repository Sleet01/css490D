/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */
/*jslint node: true, vars: true */
/*global gEngine: false, SimpleShader: false, Renderable: false, Camera: false, mat4: false, vec3: false, vec2: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame(htmlCanvasID) {
    // Game state variables
    this.mDeleteMode = false;
    this.mDeleteModeStart = 0;
    this.mDrawStart = 0;
    
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
    
    // Step E: Initialize the global update information:
    // gUpdateFrame( elapsed, numUpdatePerDraw, lagTime)
    // gUpdateObject( numObjects, mDeleteMode )
    gUpdateFrame(0, 0, 0);
    gUpdateObject(1, false);
    
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
        this.mSquares[i][1].draw(this.mCamera.getVPMatrix());
    }
    this.mRedSq.draw(this.mCamera.getVPMatrix());
    
    // Step D: Update gUpdateFrame and gUpdateObject
    // gUpdateFrame( elapsed, numUpdatePerDraw, lagTime)
    // gUpdateObject( numObjects, mDeleteMode )
    var mLoopStats = gEngine.GameLoop.stats();
    gUpdateFrame(mLoopStats[0],mLoopStats[1],mLoopStats[2]);
    gUpdateObject(this.mSquares.length + 1, this.mDeleteMode);
    if(this.mSquares.length > 0){
        gFirstItem(this.mSquares[0], this.mSquares[this.mSquares.length -1]);
    }
    else{
        gFirstItem([0], [0]);
    }
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
    
    // Loop to create random number of random boxes randomly when space is *clicked*.
    // Could also be on press, but this soon fills in the 
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space)){
        
        // Log start of drawing if this is the first set
        if (this.mDrawStart === 0){
            this.mDrawStart = Date.now();
    }
        // Generate 10 - 20 (since j < 19.999) randomized boxes within (-5, -5) to
        // (5, 5) of the cursor position, and record the time of creation for later
        // deleting.
        for ( var j = 0; j < (10 + (Math.random()*10)); j++ ){
            this.mSquares.push([Date.now() - this.mDrawStart, 
                new RandomBox(this.mConstColorShader, 
                [redXform.getXPos(), redXform.getYPos()])
            ]);
        }   
    }
    
    // Change delete mode state
    if (!this.mDeleteMode){
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.D)){
            this.mDeleteMode = true;
            this.mDeleteModeStart = Date.now();
        }
    // If we're already in Delete mode, check if there's anything to delete
    } else {
        if (this.mSquares.length > 0) {
            for ( var k = 0; k < this.mSquares.length; k++) {
                if ( (Date.now() - this.mDeleteModeStart) > this.mSquares[k][0] ){
                    this.mSquares.shift();
                } else {
                    break;
                }
            }
        // If there are no more squares left, leave Delete Mode and reset times.
        }  else {
            this.mDeleteMode = false;
            this.mDrawStart = 0;
            this.mDeleteModeStart = 0;
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

// Subclass of Box that randomizes itself on instantiation a la MP1 spec
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