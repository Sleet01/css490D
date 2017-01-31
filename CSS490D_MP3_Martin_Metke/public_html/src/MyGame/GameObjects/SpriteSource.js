/* File: SpriteSource.js 
 *
 * Inherits from GameObject
 * Sounded useful in class, so...
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function SpriteSource(renderableObj, camera, ib = null) {
    GameObject.call(this, renderableObj);
    this.mCamera = camera;
    this.info = gEngine.Textures.getTextureInfo(this.renderComponent.mTexture);
    this.mInteractiveBound = ib;
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