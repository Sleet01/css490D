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
    this.mSelected = 0;
    this.mMsg = null;
    this.kMDelta = 10/60.0;
    this.kRDelta = Math.PI * 2 / 3 / 60;

    this.mGOSet = new GameObjectSet;
    
    this.kRadiusRate = 0.5;
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
        vec2.fromValues(50, 37.5), // position of the camera
        100,                       // width of camera
        [0, 0, 800, 600]           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
            // sets the background to gray

    this.mMsg = new FontRenderable("Status Message");
    this.mMsg.setColor([0, 0, 0, 1]);
    this.mMsg.getXform().setPosition(5, 5);
    this.mMsg.setTextHeight(3);
    
    // Set up Hero object
    var hero = new HeroObject( 50, 37.5, this.kSpriteSheet);
    this.mGOSet.addToSet( hero );
    this.regPhysObject( hero );
    
    // Set up enemy objects
    var pos = [[10, 20],
               [30, 20],
               [50, 20],
               [70, 20],
               [90, 20]];
                 
    for (var i = 0; i < 5; i++ ){
        var obj;
        if (i % 2 === 1){
            obj = new RectObject(pos[i][0], pos[i][1], this.kSpriteSheet);
        } else {
            var obj = new CircObject(pos[i][0], pos[i][1], this.kSpriteSheet);
        }
        this.mGOSet.addToSet( obj );
        this.regPhysObject( obj );
    }
    
    
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    
    this.mMsg.draw(this.mCamera);   // only draw status in the main camera
    
    this.mGOSet.draw(this.mCamera);
       
    var collisions = gEngine.Core.getCollisions();
    for (var j = 0; j < collisions.length; ++j){
        collisions[j].draw(this.mCamera);
    }
    
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    // Trying clearing the collisions at the start of the update pass
    gEngine.Core.clearCollisions();
    
    var msg = "Objects: " + this.mGOSet.size() + ", Selected object: " + this.mSelected + ", BRadius: " 
            + this.mGOSet.getObjectAt(this.mSelected).getBRadius().toFixed(2);
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.R )) {
        for (var r = 0; r < this.mGOSet.size(); r++ ){
            this.mGOSet.getObjectAt(r).reflect(this.mCamera);
        }
    }
    // Select an object
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left )) {
        var nextIndex = (this.mSelected - 1);
        this.mSelected = ( nextIndex >= 0) ? nextIndex : this.mGOSet.size() + nextIndex; 
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right )) {
        this.mSelected = (this.mSelected + 1) % this.mGOSet.size(); 
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Zero )) {
        this.mSelected = 0;
    }

    // Manipulate the selected object
    var selected = this.mGOSet.getObjectAt(this.mSelected);
    var sPhysics = selected.getPhysicsComponent();

    // Manipulate radius, visibility of selected objects
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Up )) {
        selected.incBRadiusBy(this.kRadiusRate); 
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Down )) {
        selected.incBRadiusBy(-this.kRadiusRate); 
    }
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.T)){
        selected.setVisibility(!selected.isVisible());
    }
    
    if (sPhysics !== null){
        // Manipulate position of selected objects
       
        if(gEngine.Input.isKeyPressed(gEngine.Input.keys.W)){
            sPhysics.incYPosBy(this.kMDelta);
        }
        if(gEngine.Input.isKeyPressed(gEngine.Input.keys.S)){
            sPhysics.incYPosBy(-this.kMDelta);
        }
        if(gEngine.Input.isKeyPressed(gEngine.Input.keys.A)){
            sPhysics.incXPosBy(-this.kMDelta);
        }
        if(gEngine.Input.isKeyPressed(gEngine.Input.keys.D)){
            sPhysics.incXPosBy(this.kMDelta);
        }
        if(gEngine.Input.isKeyPressed(gEngine.Input.keys.Z)){
            sPhysics.incRotationBy(this.kRDelta);
        }
        if(gEngine.Input.isKeyPressed(gEngine.Input.keys.X)){
            sPhysics.incRotationBy(-this.kRDelta);
        }
        if(gEngine.Input.isKeyPressed(gEngine.Input.keys.C)){
            sPhysics.setRotation(0);
        }
    }
    
    // Pass a camera through for bounds-checking
    this.mGOSet.update(this.mCamera);

    this.mMsg.setText(msg);
};

MyGame.prototype.regPhysObject = function ( object ) {
    gEngine.Core.registerObject(object);
};