/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, LineRenderable,
  GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
    this.kMinionSprite = "assets/minion_sprite.png";
    
    // The camera to view the scene
    this.mCamera = null;

    this.mMsg = null;

    this.mAllObjs = null;
    this.mHero = null;
    
    this.mCurrentObj = 0;
}
gEngine.Core.inheritPrototype(MyGame, Scene);


MyGame.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
};

MyGame.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
};

MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.mCamera = new Camera(
        vec2.fromValues(50, 40), // position of the camera
        100,                     // width of camera
        [0, 0, 800, 600]         // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
            // sets the background to gray
    
    this.mHero = new Hero(this.kMinionSprite);
    this.mAllObjs = new GameObjectSet();
    this.mAllObjs.addToSet(this.mHero);
    for (var i = 1; i<=5; i++) {
        var x = 20 + 60 * Math.random();
        var y = 15 + 45 * Math.random();
        var m = new Minion(this.kMinionSprite, x, y);
        this.mAllObjs.addToSet(m);
    }

    this.mMsg = new FontRenderable("Status Message");
    this.mMsg.setColor([0, 0, 0, 1]);
    this.mMsg.getXform().setPosition(2, 5);
    this.mMsg.setTextHeight(3);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    
    this.mAllObjs.draw(this.mCamera);
    this.mMsg.draw(this.mCamera);   // only draw status in the main camera
};

MyGame.prototype.increaseBound = function(delta) {
    var s = this.mAllObjs.getObjectAt(this.mCurrentObj).getRigidBody();
    var r = s.getBoundRadius();
    r += delta;
    s.setBoundRadius(r);
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.kBoundDelta = 0.1;
MyGame.prototype.update = function () {
    var msg = "Num: " + this.mAllObjs.size() + " Current=" + this.mCurrentObj;   
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right)) {
        this.mCurrentObj = (this.mCurrentObj + 1) % 6;
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left)) {
        this.mCurrentObj = (this.mCurrentObj - 1);
        if (this.mCurrentObj < 0)
            this.mCurrentObj = 5;
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up)) {
        this.increaseBound(MyGame.kBoundDelta);
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down)) {
        this.increaseBound(-MyGame.kBoundDelta);
    }
    
    this.mAllObjs.update(this.mCamera);    
    gEngine.Physics.processCollision(this.mAllObjs);

    msg += " R=" + this.mAllObjs.getObjectAt(this.mCurrentObj).getRigidBody().getBoundRadius();
    this.mMsg.setText(msg);
};