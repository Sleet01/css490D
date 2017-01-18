/*
 * File: BlueLevel.js 
 * This is the logic of our game. 
 */
/*jslint node: true, vars: true */
/*global gEngine: false, Scene: false, MyGame: false, SceneFileParser: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function BlueLevel() {
    // audio clips: supports both mp3 and wav formats
    this.kBgClip = "assets/sounds/BGClip.mp3";
    this.kCue = "assets/sounds/BlueLevel_cue.wav";

    // scene file name
    this.kSceneFile = "assets/BlueLevel.xml";
    // all squares
    this.mSqSet = [];        // these are the Renderable objects

    // The cameras to view the scene
    this.mCameras = [];
}
gEngine.Core.inheritPrototype(BlueLevel, Scene);

BlueLevel.prototype.loadScene = function () {
    // load the scene file
    gEngine.TextFileLoader.loadTextFile(this.kSceneFile, gEngine.TextFileLoader.eTextFileType.eXMLFile);
    // loads the audios
    gEngine.AudioClips.loadAudio(this.kBgClip);
    gEngine.AudioClips.loadAudio(this.kCue);
};

BlueLevel.prototype.unloadScene = function () {
    // stop the background audio
    gEngine.AudioClips.stopBackgroundAudio();

    // unload the scene flie and loaded resources
    gEngine.TextFileLoader.unloadTextFile(this.kSceneFile);
    gEngine.AudioClips.unloadAudio(this.kBgClip);
    gEngine.AudioClips.unloadAudio(this.kCue);

    var nextLevel = new MyGame();  // load the next level
    gEngine.Core.startScene(nextLevel);
};

BlueLevel.prototype.initialize = function () {

    var sceneParser = new xmlSceneFileParser(this.kSceneFile);

    // Step A: Read in the cameras
    this.mCameras[0] = sceneParser.parseCamera();

    // Attempt to load the PiP camera from the last level; instantiate if not saved
    if (gEngine.ResourceMap.isAssetLoaded("PiPCamera")){
        this.mCameras[1] = gEngine.ResourceMap.retrieveAsset("PiPCamera");
    } else {

        this.mCameras[1] = new Camera(
            vec2.fromValues(20, 60),   // position of the camera
            40,                        // width of camera
            [40, 200, 100, 100]         // viewport (orgX, orgY, width, height)
        );
        this.mCameras[1].setBackgroundColor([0, 0.9, 0.9, 1]);
        
        // Save this PiP camera for next level to use
        gEngine.ResourceMap.saveAsset("PiPCamera", this.mCameras[1]);
    }
    
    // Step B: Read all the squares
    sceneParser.parseSquares(this.mSqSet);

    // now start the bg music ...
    gEngine.AudioClips.playBackgroundAudio(this.kBgClip);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
BlueLevel.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    // Draw all objects to each camera in turn
    for (var i=0; i<this.mCameras.length; i++){
        // Step  B: Activate the drawing Camera
        this.mCameras[i].setupViewProjection();

        // Step  C: draw everything
        for (var j=0; j < this.mSqSet.length; j++){
            this.mSqSet[j].draw(this.mCameras[i].getVPMatrix());
        }
    }
};

// The update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
BlueLevel.prototype.update = function () {
    //Step A: no object updates in this level
    
    // Arrange for manipulation of PiP camera location
    var camDelta = 10;
    var mainDelta = 1;
    var mainCam = this.mCameras[0];
    var mobileCam = this.mCameras[1];
    
    
        // Step B: Level controls
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) {
        gEngine.GameLoop.stop();
    }
   
    // Step C: Camera controls
    // Handle PiP camera movement.  'A' key uses 'isKeyReleased'
    if (gEngine.Input.isKeyReleased(gEngine.Input.keys.A)) {
        gEngine.AudioClips.playACue(this.kCue);
        if ( mobileCam.getXPos() - camDelta >= 20 ){
            mobileCam.incXPosBy(-camDelta);
        }
    }
    // We know the lower-left corner and can find the VP width; only allow movement
    // that keeps the full PiP camera within the greater viewport
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.D)) {
        gEngine.AudioClips.playACue(this.kCue);
        if ( mobileCam.getXPos() + camDelta + mobileCam.getViewport()[2] <= 620 ){
            mobileCam.incXPosBy(camDelta);
        }
    }
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.W)) {
        gEngine.AudioClips.playACue(this.kCue);
        if ( mobileCam.getYPos() + camDelta + mobileCam.getViewport()[3] <= 340 ){
            mobileCam.incYPosBy(camDelta);
        }
    }
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.S)) {
        gEngine.AudioClips.playACue(this.kCue);
        if ( mobileCam.getYPos() - camDelta >= 40 ){
            mobileCam.incYPosBy(-camDelta);
        }
    }
    
    // Handle main cam look-at point and zoom
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.F)) {
        mainCam.incWCYPos(mainDelta);
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.V)) {
        mainCam.incWCYPos(-mainDelta);
    }

    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.C)) {
        mainCam.incWCXPos(-mainDelta);
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.B)) {
        mainCam.incWCXPos(mainDelta);
    }
    
    // Zoom controls.  'Z' zooms in, so decrease WCWidth.
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Z)) {
        mainCam.adjZoom(-mainDelta);
    }

    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.X)) {
        mainCam.adjZoom(mainDelta);
    }
};