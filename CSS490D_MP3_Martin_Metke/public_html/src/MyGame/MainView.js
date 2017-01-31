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
    this.mGLViewPort = [];  //To support resizing, track the canvas size
    this.mSpriteSource = null;
    this.mInteractiveBound = null;
    
    //Test sprite textures
    this.kTestSprite = "assets/Bound.png";
    this.kSpriteSheet = "assets/minion_sprite.png";
}
gEngine.Core.inheritPrototype(MainView, Scene);

MainView.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kTestSprite);
    gEngine.Textures.loadTexture(this.kSpriteSheet);
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
                        gEngine.Core.getGL().canvas.width,
                        gEngine.Core.getGL().canvas.height];

    this.mCameras[0] = new Camera(
        vec2.fromValues(50, 33),   // position of the camera
        100,                       // width of camera
        this.mGLViewPort           // viewport (orgX, orgY, width, height)
    );
    this.mCameras[0].setBackgroundColor([0.8, 0.8, 0.8, 1]);
            // sets the background to gray
    

    
    // Instantiate InteractiveBound, connect it to the first camera, and give it
    // an InteractiveBoundDisplay to report through.
    this.mInteractiveBound = new InteractiveBound(
                                    new TextureRenderable(this.kTestSprite),
                                    this.mCameras[0],
                                    new InteractiveBoundDisplay());
    
    // Instantiate SpriteSource which fully contains a png sprite sheet, fully
    // covering a TextureRenderable.
    this.mSpriteSource = new SpriteSource(new TextureRenderable(this.kSpriteSheet),
                                          this.mCameras[0],
                                          this.mInteractiveBound);
    
    // Crappy hack to have a resize event fire *this* object's updateCameraGeometry
    // I am severely regretting handling resizing at all.
    var _this = this;
    window.addEventListener('resize', function(){
        _this.updateCameraGeometry(window.innerWidth * 0.6, window.innerHeight * 0.8);
    });
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MainView.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    // Step  B: Activate the drawing Camera
    this.mCameras[0].setupViewProjection();

    // Draw the main objects, and their contained Renderables
    this.mSpriteSource.draw();
    this.mInteractiveBound.draw(this.mCameras[0].getVPMatrix());
};

/* @brief   Notifies all cameras / camera containers that the geometry of the screen
 *          has been adjusted.
 * @pre     A resize event has been detected
 * @post    All cameras have been resized and repositioned to fully use the canvas
 * @param   int width, height   the pixel width and height of the canvas and context
 * 
 */
MainView.prototype.updateCameraGeometry = function (width, height) {
    
    this.mGLViewPort[2] = width;
    this.mGLViewPort[3] = height;
    this.mInteractiveBound.updateGeometry(this.mGLViewPort);
};

// The update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MainView.prototype.update = function () {
            
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.P)){
        //this.unloadScene();
        gEngine.GameLoop.stop();
    }
    
    this.mInteractiveBound.update();
};