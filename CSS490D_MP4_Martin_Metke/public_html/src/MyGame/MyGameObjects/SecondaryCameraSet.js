/* File: SecondaryCameraSet.js 
 *
 * Support for working with a set of Cameras
 */

/*jslint node: true, vars: true */
/*global  gEngine, vec2*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!


function SecondaryCameraSet( hero, WCCenter, bounds, background, game ) {
    
    this.mGame = game;
    this.mSet = [];
    this.mGameObjects = [hero, null, null, null];
    this.mLockOn = [false, false, false, false];
    this.mActive = [false, false, false, false];
    //Canvas left, right, top, bottom bounds of the mini-cam area
    this.mBounds = bounds;
    this.mBackground = background;
    this.kEdgeOffset = 1;
    this.kHeroCamWidth = 15;
    this.kPackCamWidth = 6;
    
    // Camera 0 gets special setup.  Cameras 1-3 are generic
    // Use kEdgeOffset to create boundaries around the cameras
    this.mSet[0] = new Camera(hero.getXform().getPosition(), 
                              this.kHeroCamWidth, 
                              [ bounds[0] + this.kEdgeOffset, 
                                bounds[3] + this.kEdgeOffset, 
                               (bounds[2] - bounds[3]) - 2 * this.kEdgeOffset, 
                               bounds[1]/4 - 2 * this.kEdgeOffset ]);
    for (var i = 1; i < 4; i++ ){
        this.mSet[i] = new Camera(vec2.fromValues(WCCenter[0], WCCenter[1]), 
                              this.kPackCamWidth, 
                              [ bounds[0] + (i * (bounds[1]/4)) + this.kEdgeOffset, 
                                bounds[3] + this.kEdgeOffset, 
                               (bounds[2] - bounds[3]) - 2 * this.kEdgeOffset, 
                               bounds[1]/4 - 2 * this.kEdgeOffset ]);
        this.mSet[i].configCameraStateInterpolation(.85, 5);   
    }
    
}

SecondaryCameraSet.prototype.size = function () { return this.mSet.length; };

SecondaryCameraSet.prototype.getObjectAt = function (index) {
    return this.mSet[index];
};

SecondaryCameraSet.prototype.addToSet = function (obj) {
    this.mSet.push(obj);
};

SecondaryCameraSet.prototype.registerHitHero = function () {
    
    if (!this.mActive[0]){
        this.mActive[0] = true;
    }
    
};

SecondaryCameraSet.prototype.unregisterHitHero = function () {
    
    this.mActive[0] = false;
    
};

SecondaryCameraSet.prototype.registerHitPack = function (dyepack) {
    var i;
    if ( !this.mGameObjects.includes(dyepack)){
        for (i = 1; i < this.mGameObjects.length; i++){
            if (this.mGameObjects[i] === null){
                this.mGameObjects[i] = dyepack;
                this.mActive[i] = true;
                break;
            }
        }
    }
};

SecondaryCameraSet.prototype.update = function () {
    
    // Toggle Camera views
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Zero )) {
        this.mLockOn[0] = !this.mLockOn[0];
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.One )) {
        this.mLockOn[1] = !this.mLockOn[1];
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Two )) {
        this.mLockOn[2] = !this.mLockOn[2];
    } 
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Three )) {
        this.mLockOn[3] = !this.mLockOn[3];
    } 
    
    this.mSet[0].update();
    var i;
    for (i = 1; i < this.mSet.length; i++) {
        
        if (this.mGameObjects[i] !== null){
            if(this.mGameObjects[i].isDead()){
                this.mActive[i] = false;
                this.mGameObjects[i] = null;
            } else {
                var pos = this.mGameObjects[i].getXform().getPosition();
                this.mSet[i].setWCCenter(pos[0],pos[1]);
                //this.mSet[i].setCameraStateWCCenter(this.mGameObjects[i].getXform().getPosition() );
            }
        }
        this.mSet[i].update();
    }
};

SecondaryCameraSet.prototype.draw = function () {
    var i;
    for (i = 0; i < this.mSet.length; i++) {
        
        // Check if a given camera is supposed to be on.
        if (this.mLockOn[i] || this.mActive[i] ){
            
            // Configure its projection
            this.mSet[i].setupViewProjection();
            
            this.mBackground.draw(this.mSet[i]);
            
            this.mGame.mDyePackSet.draw(this.mSet[i]);
            this.mGame.mPatrolSet.draw(this.mSet[i]);
            this.mGame.mHero.draw(this.mSet[i]);
           
        }
    }
};
