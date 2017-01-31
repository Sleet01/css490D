/* File: SpriteSource.js 
 *
 * Inherits from GameObject
 * Sounded useful in class, so...
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, Convert: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function SpriteSource(renderableObj, camera, ib = null) {
    GameObject.call(this, renderableObj);
    this.mCamera = camera;
    this.info = gEngine.Textures.getTextureInfo(this.mRenderComponent.getTexture());
    this.mInteractiveBound = ib;
    
    //Find Aspect Ratio of texture
    var mAR = Convert.textureAR(this.info);
    var Xform = this.getXform();
    
    // Center the sprite sheet texture in the provided camera
    Xform.setPosition(this.mCamera.getWCXPos(), this.mCamera.getWCYPos());
    // If the image is wider than it is tall:
    if (mAR > 1) {
        Xform.setWidth(this.mCamera.getWCWidth() * 0.95);
        Xform.setHeight(Xform.getWidth() / mAR);
    }else{
        Xform.setHeight(this.mCamera.getWCHeight() * 0.95);
        Xform.setWidth(Xform.getHeight() * mAR);
    }
    if (!(this.mInteractiveBound === null)) {
        this.mInteractiveBound.setBounds(Convert.getBounds(Xform));
    }
}
gEngine.Core.inheritPrototype(SpriteSource, GameObject);

SpriteSource.prototype.getTextureBounds = function (){
    var Xform = this.getXform();
    return [0, 0, Xform.getWidth(), Xform.getHeight()];
};

SpriteSource.prototype.getXform = function () { return this.mRenderComponent.getXform(); };

SpriteSource.prototype.update = function () {};

SpriteSource.prototype.getRenderable = function () { return this.mRenderComponent; };
SpriteSource.prototype.setTexture = function (t) { 
    this.renderComponent.mTexture = t;
    
};

SpriteSource.prototype.draw = function () {
    var cameraVPM = this.mCamera.getVPMatrix();
    this.mRenderComponent.draw(cameraVPM);
};