/*
 * File: MainView.js 
 * Primary class for CSS490D mp3
 */

/*jslint node: true, vars: true */
/*global gEngine: false, Scene: false, Camera: false, vec2: false, FontRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MainView() {
    this.mPaneOffset = 240;
    this.mCameras = [];
    this.mMsg = null;
    this.mMainViewPort = [];  //To support resizing, track the canvas size
    this.mSpriteSource = null;
    this.mInteractiveBound = null;
    this.mZoomedViews = null;
    this.mAnimationView = null;
    
    //Test sprite textures
    this.kBoundSprite = "assets/Bound.png";
    this.kSpriteSheet = "assets/minion_sprite.png";
}
gEngine.Core.inheritPrototype(MainView, Scene);

MainView.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kBoundSprite);
    gEngine.Textures.loadTexture(this.kSpriteSheet);
};

MainView.prototype.unloadScene = function () {
    // will be called from GameLoop.stop
    gEngine.Textures.unloadTexture(this.kBoundSprite);
    gEngine.Textures.unloadTexture(this.kSpriteSheet);
        
    gEngine.GameLoop.stop();
};

MainView.prototype.initialize = function () {
    // Step A: set up the cameras
    // Set up this.MGLViewPort for camera resizing
    this.mMainViewPort = [this.mPaneOffset, //canvas x-orgin 
                        0, //canvas y-origin
                        gEngine.Core.getGL().canvas.width - this.mPaneOffset,
                        gEngine.Core.getGL().canvas.height];
    
    // Set up the initial "MainView" camera.
    this.mCameras[0] = new Camera(
        vec2.fromValues(50, 33),   // position of the camera
        100,                       // width of camera
        this.mMainViewPort         // viewport (orgX, orgY, width, height)
    );
    // sets the background to gray
    this.mCameras[0].setBackgroundColor([0.8, 0.8, 0.8, 0.8]);
        
    // Instantiate InteractiveBound, connect it to the first camera, and give it
    // an InteractiveBoundDisplay to report through.
    this.mInteractiveBound = new InteractiveBound(
                                    new TextureRenderable(this.kBoundSprite),
                                    this.mCameras[0],
                                    new InteractiveBoundDisplay());
    
    // Instantiate SpriteSource which fully contains a png sprite sheet, fully
    // covering a TextureRenderable.  Connect it to the first camera for drawing,
    // and to the above InteractiveBound to keep it within the texture.
    this.mSpriteSource = new SpriteSource(new TextureRenderable(this.kSpriteSheet),
                                          this.mCameras[0],
                                          this.mInteractiveBound);
    
    // Instantiate ZoomedViews showing edges of InteractiveBound (for alignment).
    // Connected to the above InteractiveBound to track its movement, and set to use
    // the bottom-left corner of the canvas.
    this.mZoomedViews = new ZoomedViews(new Renderable(), 
                                        this.mInteractiveBound,
                                        this,
                                        [0, 0,
                                         this.mPaneOffset, 
                                         gEngine.Core.getGL().canvas.height * 0.5]);
    
    // Instantiate AnimationView with its own SpriteAnimateRenderable using the same
    // sprite sheet as above, connected to the InteractiveBound to get the sprite frame
    // information, and set to use the top-left corner of the canvas.
    this.mAnimationView = new AnimationView(new SpriteAnimateRenderable(this.kSpriteSheet), 
                                        this.mInteractiveBound,
                                        this,
                                        [0, 
                                         1 + gEngine.Core.getGL().canvas.height * 0.5,
                                         this.mPaneOffset, 
                                         gEngine.Core.getGL().canvas.height * 0.5]);
                                        
    // Crappy hack to have a resize event fire *this* object's updateCameraGeometry
    // I am severely regretting handling resizing at all.
    var _this = this;
    window.addEventListener('resize', function(){
        _this.updateCameraGeometry( gEngine.Core.getGL().canvas.width, 
                                    gEngine.Core.getGL().canvas.height );
    });
};

// Allow other views to register themselves for drawing during MainView.draw()
MainView.prototype.registerCamera = function(camera) {
    if (this.mCameras.indexOf(camera) === -1){
        this.mCameras.push(camera);
    }
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MainView.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    // Step  B: Activate the main drawing Camera
    this.mCameras[0].setupViewProjection();

    // Draw the main objects, and their contained Renderables
    this.mSpriteSource.draw(this.mCameras[0].getVPMatrix());
    this.mInteractiveBound.draw(this.mCameras[0].getVPMatrix());
    
    // If more views, e.g. ZoomedViews, are registered, then draw them as well
    if (this.mCameras.length > 1){
        for (var i = 1; i < this.mCameras.length; i++){
            this.mCameras[i].setupViewProjection();
            this.mSpriteSource.draw(this.mCameras[i].getVPMatrix());
            this.mInteractiveBound.draw(this.mCameras[i].getVPMatrix());
        }
    }
    
    // Finally, draw this AnimationView if it is defined.
    if ( this.mAnimationView !== null ){this.mAnimationView.draw();}
};

/* @brief   Notifies all cameras / camera containers that the geometry of the screen
 *          has been adjusted.
 * @pre     A resize event has been detected
 * @post    All cameras have been resized and repositioned to fully use the canvas
 * @param   int width, height   the pixel width and height of the canvas and context
 * 
 */
MainView.prototype.updateCameraGeometry = function (width, height) {
    
    // The main view should occupy most of the right of the canvas 
    this.mMainViewPort[2] = width - this.mPaneOffset;
    this.mMainViewPort[3] = height;
    this.mInteractiveBound.updateGeometry(this.mMainViewPort);
    
    // The Sprite Source does not have geometry per se; update its scaling.
    this.mSpriteSource.scaleTexture();
    
    // Confine Zoomed Views to lower-left of canvas
    this.mZoomedViews.updateGeometry([0, 0, this.mPaneOffset, height * 0.5]);
    
    // Confine Animation View to upper-left of canvas
    this.mAnimationView.updateGeometry([0, 
                                        1 + gEngine.Core.getGL().canvas.height * 0.5,
                                        this.mPaneOffset, 
                                        gEngine.Core.getGL().canvas.height * 0.5]);
};

// The update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MainView.prototype.update = function () {
    
    // The interactive bound is responsible for updating all other objects
    this.mInteractiveBound.update();
};