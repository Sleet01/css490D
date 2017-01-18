/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */
/*jslint node: true, vars: true */
/*global gEngine: false, Scene: false, BlueLevel: false, Camera: false, Renderable: false, vec2: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
     // audio clips: supports both mp3 and wav formats
    this.kBgClip = "assets/sounds/BGClip.mp3";
    this.kCue = "assets/sounds/MyGame_cue.wav";

    // The camera to view the scene
    this.mCamera = [];
    // all squares
    this.mSqSet = [];

    // scene file name
    this.kSceneFile = "assets/GrayLevel.json";

}//This essentially forces MyGame to meet Scene.js contract
gEngine.Core.inheritPrototype(MyGame, Scene);

MyGame.prototype.loadScene = function () {
    // Test load a scene file
    gEngine.TextFileLoader.loadTextFile(this.kSceneFile, gEngine.TextFileLoader.eTextFileType.eJSONFile);
    // loads the audios
    gEngine.AudioClips.loadAudio(this.kBgClip);
    gEngine.AudioClips.loadAudio(this.kCue);
};

MyGame.prototype.unloadScene = function() {
    // Step A: Game loop not running, unload all assets
    // stop the background audio
    gEngine.AudioClips.stopBackgroundAudio();

    // unload the scene resources
    // gEngine.AudioClips.unloadAudio(this.kBgClip);
    //      You know this clip will be used elsewhere in the game
    //      So you decide to not unload this clip!!
    gEngine.TextFileLoader.unloadTextFile(this.kSceneFile);
    gEngine.AudioClips.unloadAudio(this.kCue);

    // Step B: starts the next level
    // starts the next level
    var nextLevel = new BlueLevel();  // next level to be loaded
    gEngine.Core.startScene(nextLevel);
};

MyGame.prototype.initialize = function () {
    // Step A: Parse this scene with a JSON sceneParser
    var sceneParser = new jsonSceneFileParser(this.kSceneFile);
    
    // Step A: set up the cameras
    this.mCamera[0] = sceneParser.parseCamera();
    
    this.mCamera[1] = new Camera(
        vec2.fromValues(20, 60),   // position of the camera
        100,                        // width of camera
        [40, 200, 100, 100]         // viewport (orgX, orgY, width, height)
        );
    this.mCamera[1].setBackgroundColor([0, 0.4, 0.6, 1]);

    // Step B: Read all the squares
    sceneParser.parseSquares(this.mSqSet);

    // now start the bg music ...
    gEngine.AudioClips.playBackgroundAudio(this.kBgClip);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    for (var i=0; i<this.mCamera.length; i++){
        // Step  B: Activate the drawing Cameras
        this.mCamera[i].setupViewProjection();

        // Step  C: draw everything
        for (var j=0; j < this.mSqSet.length; j++){
            this.mSqSet[j].draw(this.mCamera[i].getVPMatrix());
        }
    }
};

// The update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    // Rotate red square (GrayLevel.mSqSet[1]) by 1.2 degrees/update
    var rotRate = 1.2; //degrees
    // Move white square left (GrayLevel.mSqSet[0]) by 1/9th unit/update
    var movDeltaX = -(1.0/9);
    
    var xform = this.mSqSet[1].getXform();
    xform.incRotationByDegree(rotRate);

    xform = this.mSqSet[0].getXform();
    xform.incXPosBy(movDeltaX);

   
    if (xform.getXPos() < 10 ) { // this is the right-bound of the window
        xform.setPosition(30, 60);
    }

    // Step A: test for white square movement
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Left)) {
        gEngine.AudioClips.playACue(this.kCue);
        xform.incXPosBy(-deltaX);
        if (xform.getXPos() < 11) { // this is the left-boundary
            gEngine.GameLoop.stop();
        }
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Q)) {
        gEngine.GameLoop.stop();
    }
    
    if (gEngine.Input.isKeyReleased(gEngine.Input.keys.A)) {
        gEngine.AudioClips.playACue(this.kCue);
        xform.incYPosBy(deltaX);
        if (xform.getYPos() > 61) {  // this is the left-bound of the window
            gEngine.GameLoop.stop();
        }
    }
};