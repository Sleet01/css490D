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
    this.mBorder = new Renderable();
    this.mBackground = new Renderable();
    this.mMarkers = [];
    this.mMarkersPos = [];
    
    this.mBorder.setColor([0.2, 0.2, 0.2, 1]);
    this.mBackground.setColor([0.9, 0.9, 0.9, 1]);
    
    // Center the sprite sheet texture in the provided camera
    this.scaleTexture();
    
    // Set the bounds on the InteractiveBorder, if it exists.  This prevents it
    // from scrolling outside of the bounds of this' texture.
    if (!(this.mInteractiveBound === null)) {
        this.mInteractiveBound.setBounds(Convert.getBounds(this.getXform()));
    }
    
    // Setup corner markers
    this._setupMarkers();
        
}
gEngine.Core.inheritPrototype(SpriteSource, GameObject);

SpriteSource.prototype._setupMarkers = function() {
    
    // Set positions of corner markers
    var texBounds = Convert.getBounds( this.getXform() );
    
    this.mMarkersPos = [ [ texBounds[0], texBounds[1]  ], // [ Xorigin, Yorigin ]
                         [ texBounds[0] + texBounds[2], texBounds[1] ],
                         [ texBounds[0] + texBounds[2], texBounds[1] + texBounds[3] ],
                         [ texBounds[0], texBounds[1] + texBounds[3]  ] 
                        ];  
    
    // Instantiate side markers
    for (var j = 0; j < 4; j++){
        var randColor = [ Math.random(), Math.random(), Math.random(), 1];
        this.mMarkers.push(new Renderable());
        this.mMarkers[j].setColor(randColor);
        // Set position
        this.mMarkers[j].getXform().setPosition( this.mMarkersPos[j][0], this.mMarkersPos[j][1]);
        this.mMarkers[j].getXform().setSize(3, 3);
    }
};

/* @brief   Centers and scales the texture which this object provides
 * 
 */
SpriteSource.prototype.scaleTexture = function() {
    //Find Aspect Ratio of texture and camera
    var mAR = Convert.textureAR(this.info);
    var cAR = Convert.cameraAR(this.mCamera);
    
    // Use the Transform of this object's TextureRenderable to determine bound
    var Xform = this.getXform();
    
    // Center on camera
    Xform.setPosition(this.mCamera.getWCXPos(), this.mCamera.getWCYPos());
    // If the image is wider than it is tall:
    if (mAR > 1) {
        if (mAR >= cAR){
            Xform.setWidth(this.mCamera.getWCWidth() * 0.95);
            Xform.setHeight(Xform.getWidth() / mAR);
        } else {
            Xform.setHeight(this.mCamera.getWCHeight() * 0.95);
            console.log("Camera WCHeight, Texture WCHeight: " + 
                       this.mCamera.getWCHeight() + ", " + Xform.getHeight());
            Xform.setWidth(Xform.getHeight() * mAR);
            console.log("Camera WCWidth, Texture WCWidth: " + 
                       this.mCamera.getWCWidth() + ", " + Xform.getWidth());
        }
    }else{
        if (mAR <= cAR){
            Xform.setHeight(this.mCamera.getWCHeight() * 0.95);
            Xform.setWidth(Xform.getHeight() * mAR);
        } else {
            Xform.setWidth(this.mCamera.getWCWidth() * 0.95);
            Xform.setHeight(Xform.getWidth * mAR);
        }
    } 
    
    // Set up border location and size
    this.mBackground.getXform().setSize(Xform.getWidth(), Xform.getHeight());
    this.mBackground.getXform().setPosition(Xform.getXPos(), Xform.getYPos());
    this.mBorder.getXform().setSize(Xform.getWidth() + 0.5, Xform.getHeight() + 0.5);
    this.mBorder.getXform().setPosition(Xform.getXPos(), Xform.getYPos());
};

SpriteSource.prototype.setInteractiveBound = function(ib) {
    if (!(this.mInteractiveBound === null)) {
        this.mInteractiveBound = ib;
        this.mInteractiveBound.setBounds(Convert.getBounds(this.getXform()));
    }
};

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

SpriteSource.prototype.draw = function (cameraVPM) {
    //var cameraVPM = this.mCamera.getVPMatrix();
    this.mBorder.draw(cameraVPM);
    this.mBackground.draw(cameraVPM);
    this.mRenderComponent.draw(cameraVPM);
    for (var j = 0; j < this.mMarkers.length; j++){
        this.mMarkers[j].draw(cameraVPM);
    }
};