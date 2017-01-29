/*
 * File: MainView.js 
 * Primary class for CSS490D mp3
 */

/*jslint node: true, vars: true */
/*global gEngine: false, Scene: false, Camera: false, vec2: false, FontRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MainView() {
    this.mCameras = [];
    this.mMsg = null;
    this.objects = [];
    this.mGLViewPort = [];  //To support resizing, track the canvas size
    
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
    this.mGLViewPort = [0, //canvas x-orgin 
                        0, //canvas y-origin
                        gEngine.Core.getGL().canvas.clientWidth,
                        gEngine.Core.getGL().canvas.clientHeight];

    this.mCameras[0] = new Camera(
        vec2.fromValues(50, 40),   // position of the camera
        100,                       // width of camera
        this.mGLViewPort           // viewport (orgX, orgY, width, height)
    );
    this.mCameras[0].setBackgroundColor([0.9, 0.9, 0.9, 1]);
            // sets the background to gray
      
    this.objects[0] = new InteractiveBound(new TextureRenderable(this.kTestSprite),
                                            this.mCameras[0].getWCBounds());
    // Create a new InteractiveBoundDisplay to report data from the IB, and connect them
    this.objects[1] = new InteractiveBoundDisplay();
    this.objects[0].setReportObject(this.objects[1]);
    this.objects[2] = new InteractiveFontDisplay("Camera Bounds:" + this.mCameras[0].getWCBounds().toString());
    this.objects[2].getXform().setPosition(10,12);
    this.objects[3] = new InteractiveFontDisplay("Canvas.clientX: " + this.mGLViewPort.toString());
    this.objects[3].getXform().setPosition(10,10);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MainView.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    // Step  B: Activate the drawing Camera
    this.mCameras[0].setupViewProjection();
//    this.mMsg.draw(this.mCamera.getVPMatrix());
    for (var j=0; j<this.objects.length; j++) {
        this.objects[j].draw(this.mCameras[0].getVPMatrix());
    }
};

// The update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MainView.prototype.update = function () {
    // grab the latest GL canvas size info and update camera size if necessary
    // NEEDS WORK
    
    this.mGLViewPort[2] = gEngine.Core.getGL().canvas.width;
    this.mGLViewPort[3] = gEngine.Core.getGL().canvas.height;
    var mCVP = this.mCameras[0].getViewport();
    if ((mCVP[2] !== this.mGLViewPort[2]) || (mCVP[3] !== this.mGLViewPort[3])){
        this.mCameras[0].setViewport(this.mGLViewPort);
        this.objects[2].setMessage("Camera Bounds:" + this.mCameras[0].getWCBounds().toString());
        this.objects[3].setMessage("Canvas.clientX: " + this.mGLViewPort.toString());
    }
        
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.P)){
        //this.unloadScene();
        gEngine.GameLoop.stop();
    }
    
    this.objects[0].update();
    this.objects[2].update();
    this.objects[3].update();
};

window.addEventListener('resize', function(event){
    gEngine.VertexBuffer.initialize();
//    this.mGLViewPort[2] = gEngine.Core.getGL().canvas.clientWidth;
//    this.mGLViewPort[3] = gEngine.Core.getGL().canvas.clientHeight;
//    var mCVP = this.mCameras[0].getViewport();
//    if ((mCVP[2] !== this.mGLViewPort[2]) || (mCVP[3] !== this.mGLViewPort[3])){
//        this.mCameras[0].setViewport(this.mGLViewPort);
//        this.objects[2].setMessage("Camera Bounds:" + this.mCameras[0].getWCBounds().toString());
//        this.objects[3].setMessage("Canvas.clientX: " + this.mGLViewPort.toString());
//    }
});